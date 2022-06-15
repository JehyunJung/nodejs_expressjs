const template=require('../lib/template.js');
const express=require('express');
const router=express.Router();

const mysql_connection=require('../lib/mysql');

const authData={
    email:'hello',
    password:'1234',
    nickname:'hi'
}

router.get("/login",(req,res)=>{
    
    const topic_list=req.topic_list;
    const title="Welcome - Login";
    const description="Hello, Node.js";
    const html=template.html(title,
        ``,
        ``,
        ``,
        template.auth_loginButton(req.session.is_logined,req.session.nickname),
        template.auth_loginForm(true));
    res.send(html)
})

router.post("/login_process",(req,res)=>{
    
    const{
        body:{
            email,password
        }
    }=req;

    //console.log(email,password);

    if(email===authData.email && password===authData.password){
        req.session.is_logined=true;
        req.session.nickname=authData.nickname;
        req.session.save(()=>{
            res.redirect("/");
        });
        
    }
})

router.get("/logout",(req,res)=>{
    req.session.destroy();
    res.redirect("/");
    return false;
})


module.exports=router;