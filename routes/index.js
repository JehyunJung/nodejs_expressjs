const template=require('../lib/template.js');
const express=require('express');
const router=express.Router();

//root 경로에 대한 라우팅 진행
router.get("/",(req,res)=>{
    const list=req.topic_list;
    const title="Welcome Hello";
    const description="Hello, Node.js";
    const html=template.html(title,list,
        `
        <h2>${title}</h2>${description}
        <img src="/images/coffee.jpg" style="width:300px; display:block; margin:10px;"></img>
        `,
        `<a href="/topic/create">create</a>`,
        template.auth_loginButton(req.session.is_logined,req.session.nickname),
        template.auth_loginForm(false));
    res.send(html)
})

module.exports=router;