const template=require('../lib/template.js');

const express=require('express');
const router=express.Router();
//root 경로에 대한 라우팅 진행
router.get("/",(req,res)=>{
    const list=req.list;
    const title="Welcome Hello";
    const description="Hello, Node.js";
    const html=template.html(title,list,
        `
        <h2>${title}</h2>${description}
        <img src="/images/coffee.jpg" style="width:300px; display:block; margin:10px;"></img>
        `,
        `<a href="/page/create">create</a>`);
    res.send(html)
})

module.exports=router;