const { connect } = require('./mysql.js');
const mysql_connection=require('./mysql.js');

module.exports=function(app){
    const passport=require('passport');
    const LocalStrategy=require('passport-local').Strategy;
    //Authentication
    app.use(passport.initialize());
    app.use(passport.session());

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

    return passport;
}