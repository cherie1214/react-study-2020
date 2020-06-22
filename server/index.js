const express = require('express');
const app = express();
const port = 5000
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const config = require('./config/key');
const { auth } = require('./middleware/auth');
const { User } = require('./models/User');


// applicaton/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// application/json
app.use(bodyParser.json());
app.use(cookieParser());

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false,
}).then(() => console.log("mongDB Connected..."))
  .catch(err => console.log(err))



app.get('/', (req, res) => res.send('Hello World! 오이!'))

app.get('/api/hello', (req, res) => {
    res.send("코쿤캅~")
})


//// 회원가입
app.post('/api/users/register', (req ,res) => {
    // 회원가입 때 필요한 정보들을 client에 가져오면 그것들을 데이터 베이스에 넣어준다.
    const user = new User(req.body)

    user.save((err, userInfo) => {
        if(err) return res.json({ success: false, err });
        return res.status(200).json({ success: true });
    })
})

//// 로그인
app.post('/api/users/login', (req, res) => {
    // 1. 요청된 이메일이 데이터베이스에 있는지 찾기
    User.findOne({ email: req.body.email }, (err, user) => {
        if(!user){
            return res.json({
                loginSuccess: false,
                message: "제공된 이메일에 해당하는 유저가 없습니다."
            })
        }

        // 2. 요청된 이메일이 데이터베이스에 있다면 비밀번호가 맞는지 확인
        user.comparePassword(req.body.password, (err, isMatch) => {
            if(!isMatch) {
                return res.json({
                    loginSuccess: false,
                    message: "비밀번호가 틀렸습니다."
                })
            }
    
            // 3. 비밀번호가 맞다면 토크 생성
            user.generateToken((err, user) => {
                if(err) return res.status(400).send(err); 
    
                // 4. 토큰 쿠키에 저장
                res.cookie("x_auth", user.token)
                .status(200)
                .json({ loginSuccess: true, userId: user._id })
    
            })
        })
    })
})

//// 회원인증
app.get('/api/users/auth', auth, (req, res) => {

    // 여기까지 미들웨어가 통과했다는 것은 Authentication이 true라는 뜻!
    res.status(200).json({
        _id: req.user.id,
        isAdmin: req.user.role === 0 ? false : true, // role: 0 -> 일반유저 / 제외한 나머지는 관리자
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        image: req.user.image,
        role: req.user.role,
    })

})

//// 로그아웃
app.get('/api/users/logout', auth, (req, res) => {
    User.findOneAndUpdate({ _id: req.user._id }, 
        { token: "" } // 토큰 지워주기
    , (err, user) => {
        if (err) return res.json({ success: false, err });
        return res.status(200).send({ success: true});
    })
})


app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))