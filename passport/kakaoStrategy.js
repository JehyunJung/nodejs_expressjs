const {User} = require('../models');
const passport=require('passport');
const kakaoStrategy=require('passport-kakao').Strategy;
const kakaoConfig=require('../config/kakao_config.json')

module.exports=()=>{
    //로그인 로직
    passport.use(new kakaoStrategy(
        {
            usernameField:'email',
            passwordField:'password',
            clientID:kakaoConfig.API_KEY,
            callbackURL:"/auth/kakao/callback",
        },
        async (accessToken, refreshToken, profile,done)=>{
            console.log(profile);
            User.findOrCreate({
                where:{
                    sns_id:profile.id,
                    provider:profile.provider,
                    nickname:profile.username}
            }).then((result)=>{
                const user=result[0];
                return done(null,user)
            }).catch((err)=>{
                throw err;
            });
        }
    ));
}