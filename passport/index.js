const passport=require('passport');
const local=require('./localStrategy');
const kakao=require('./kakaoStrategy');
const {User} =require('../models');

module.exports=()=>{
    //passport에서 session에 user id 값을 등록하게 된다.
    passport.serializeUser((user,done)=>{
        
        done(null,user.id);
    })

    //매번 홈페이지에 접속할 때마다 deserializeUser가 호출되며, 유저 정보를 반환하게 된다.
    passport.deserializeUser((user_id,done)=>{
        User.findOne({
            where:{id:user_id}
        }).then((user)=>{
            done(null,user);
        }).catch((err)=>{
            throw err;
        });
      
    })
    local();
    kakao();
    return passport;
}