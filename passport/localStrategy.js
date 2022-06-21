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
        (username,password,done)=>{
            mysql_connection.query(
                "SELECT * FROM USER WHERE USERNAME=?",
                [username],
                (err,results)=>{
                    if(err){
                        throw err;
                    }
                    if(username === results[0].username){
                        if(password===results[0].password){
                            return done(null,results[0])
                        }else{
                            return done(null,false,{
                                message:"Incorrect Password"
                            })
                        }
                    }else{
                        return done(null,false,{
                            message:"Incorrect Username"
                        })
                    }
                });
            
        }
    ));
}