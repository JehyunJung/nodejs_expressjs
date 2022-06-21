const mysql_connection=require('../lib/mysql.js');
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
            mysql_connection.query(
                "SELECT * FROM USER WHERE ID=?",
                [profile.id],
                (err,results)=>{
                    if(err){
                        return done(null,false,{
                            message:"Incorrect Profile"
                        })
                    }
                    return done(null,results[0])
                }
                );
        }
    ));
}