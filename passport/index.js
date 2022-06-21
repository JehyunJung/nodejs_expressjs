const passport=require('passport');
const local=require('./localStrategy');
const kakao=require('./kakaoStrategy');
const mysql_connection=require("../lib/mysql");

module.exports=()=>{
    //passport에서 session에 user id 값을 등록하게 된다.
    passport.serializeUser((user,done)=>{
        console.log(user);
        done(null,user.id);
    })

    //매번 홈페이지에 접속할 때마다 deserializeUser가 호출되며, 유저 정보를 반환하게 된다.
    passport.deserializeUser((user_id,done)=>{
        console.log("deserialize User: "+user_id);
        mysql_connection.query(
            "SELECT * FROM USER WHERE ID=?",
            [user_id],
            (err,results)=>{
                if(err){
                    throw err;
                }
                done(null,results[0]);
            })
        
    })
    local();
    kakao();
    return passport;
}