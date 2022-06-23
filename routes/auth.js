const template=require('../lib/template.js');
const express=require('express');
const router=express.Router();
const passport=require('passport');
const mysql_connection=require('../lib/mysql');

router.get("/join",(req,res)=>{
    let flash_message=req.flash("join_error");
    const topic_list=req.topic_list;
    const title="Welcome - Login";
    const description="Hello, Node.js";
    const html=template.html(title,
        `<h1>${flash_message}</h1>`,
        ``,
        ``,
        template.auth_loginButton(req,res),
        template.auth_loginForm(false),
        template.auth_joinButton(req,res),
        template.auth_joinForm(true)
        );
    res.send(html)
})

//로그인 시 호출 되는 라우팅 처리
router.post('/join_process',(req,res)=>{
    const{
        body:{
            nickname,email,password
        }
    }=req;
    console.log("CREATED profiles: "+ email + " "+password);
    mysql_connection.query("SELECT EMAIL FROM USER",(err,emails)=>{
        let search=false;
        let duplicated=false;
        if(err){
            throw err;
        }
        emails.forEach(email => {
            console.log(email)
            if(username.EMAIL===email){
                req.flash('join_error','Duplicated Emails');
                res.redirect("/auth/join");
                duplicated=true;
            }
        })
        search=true;
        if(search && !duplicated){
        mysql_connection.query(
            "INSERT INTO USER(NICKNAME,EMAIL,PASSWORD) VALUES(?,?,?)",
            [nickname,email,password],
            (err,results)=>{
                if(err){
                    throw err;
                }
                res.redirect("/");
            })
        }
        
    })

}
);

router.get("/login",(req,res)=>{
    const fmsg=req.flash();
    console.log(fmsg.error);
    let feedback="";

    if(fmsg.error){
        feedback=fmsg.error[0];
    }
    console.log(feedback);
    const topic_list=req.topic_list;
    const title="Welcome - Login";
    const description="Hello, Node.js";
    const html=template.html(title,
        `<h1>${feedback}</h1>`,
        ``,
        ``,
        template.auth_loginButton(req,res),
        template.auth_loginForm(true),        
        template.auth_joinButton(req,res),
        template.auth_joinForm(false)
        );

    res.send(html)
})

//로그인 시 호출 되는 라우팅 처리
router.post('/login_process',
    passport.authenticate('local',{
        successRedirect: '/',
        failureRedirect: '/auth/login',
        failureFlash:true
    })
);


router.get("/kakao",passport.authenticate("kakao"));

router.get("/kakao/callback",passport.authenticate("kakao",{
    successRedirect: '/',
    failureRedirect: '/auth/login',
    failureFlash:true
}))

router.get("/logout",(req,res)=>{
    req.logout((err)=>{
        if(err){
            throw err;
        }
    });
    req.session.save(()=>{
        res.redirect("/");
    });
    
    return false;
})

module.exports=router;