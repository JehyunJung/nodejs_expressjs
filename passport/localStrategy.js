const mysql_connection=require('../lib/mysql.js');
const passport=require('passport');
const { User } = require('../models/index.js');
const e = require('connect-flash');
const LocalStrategy=require('passport-local').Strategy;

module.exports=()=>{
    //로그인 로직
    passport.use(new LocalStrategy(
        {
            usernameField:'email',
            passwordField:'password'
        },
        (email,password,done)=>{
            User.findOne({
                where:{email:email}
            }).then((user)=>{
                if(user){
                    if(email === user.email){
                        if(password===user.password){
                            return done(null,user)
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
                }
                else{
                    return done(null,false,{
                        message:"Not Registered"
                    })
                }
            }).catch((err)=>{
                throw err;
            })
        }
    ));
}