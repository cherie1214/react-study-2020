//// 인증처리를 하는 곳

const { User } = require('../models/User');

let auth = (req, res, next) => {

    // 1. 클라이언트 쿠키에서 토큰 가져오기
    let token = req.cookies.x_auth;

    // 2. 토큰을 복호화한 후 유저 찾기
    User.findByToken(token, (err, user) => {

        // 3-1. 유저가 없으면 인증 No!
        if (err) throw err;
        if (!user) return res.json({ isAuth: false, error: true })
        
        // 3-2. 유저가 있으면 인증 Ok!
        req.token = token;
        req.user = user;
        next();
    });

}

module.exports = { auth };