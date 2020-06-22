const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50,
    },
    email: {
        type: String,
        trim: true,
        unique: 1,
    },
    password: {
        type: String,
        minlength: 5,
    },
    lastname: {
        type: String,
        maxlength: 50,
    },
    role: {
        type: Number,
        default: 0,
    },
    images: String,
    token: {
        type: String,
    },
    tokenExp: {
        type: Number
    }
})

//// 비밀번호 암호화하여 회원정보 저장
userSchema.pre('save', function(next){
    var user = this;

    if(user.isModified('password')){
        // 비밀번호 암호화하기
        bcrypt.genSalt(saltRounds, function(err, salt){
            if(err) return next(err);
    
            bcrypt.hash(user.password, salt, function(err, hash){
                if(err) return next(err);
                user.password = hash; 
                next(); 
            })
        })
    } else {
        next();
    }
})

//// 로그인 - 원래 비밀번호(plainPassword)와 암호화되어 저장된 비밀번호(this.password) 비교하여 맞는지 확인
userSchema.methods.comparePassword = function(plainPassword, cb){
    bcrypt.compare(plainPassword, this.password, function(err, isMatch){
        if(err) return cb(err);
        cb(null, isMatch);
    })
} 

//// 로그인 - 토큰 생성하기
userSchema.methods.generateToken = function(cb){
    var user = this;

    // jsonwebtoken을 이용해 서 token 생성
    var token = jwt.sign(user._id.toHexString(), 'secretToken');
    // user._id + 'secretToken' = token;

    user.token = token;
    user.save(function(err, user){
        if(err) return cb(err);
        cb(null, user);
    })
}

userSchema.statics.findByToken = function(token, cb){
    var user = this;

    // 토큰 decode 하기
    jwt.verify(token, 'secretToken', function(err, decoded){
        // 유저 아이디를 이용해 유저를 찾은 후, 클라이언트에서 가져온 token과 DB에 보관된 토큰이 일치하는지 확인

        user.findOne({ "_id": decoded, "token": token}, function(err, user){
            if(err) return cb(err);
            cb(null, user); 

        })
    })
}

const User = mongoose.model('User', userSchema);

module.exports = { User };