const mysql_connection=require('../lib/mysql.js');
const passport=require('passport');
const LocalStrategy=require('passport-local').Strategy;

module.exports=()=>{
    //로그인 로직
    passport.use(new LocalStrategy(
        {
            usernameField:'email',
            passwordField:'password'
        },
        (email,password,done)=>{
            mysql_connection.query(
                "SELECT * FROM USER WHERE EMAIL=?",
                [email],
                (err,results)=>{
                    if(err){
                        throw err;
                    }
                    if(email === results[0].email){
                        if(password===results[0].password){
                            return done(null,results[0])
                        }else{
                            return done(null,false,{
                                message:"Incorrect Password"
                            })
                        }
                    }else{
                        return done(null,false,{
                            message:"Incorrect Email"
                        })
                    }
                });
            
        }
    ));
}