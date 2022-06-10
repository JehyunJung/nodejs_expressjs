const path=require('path');
const fs=require('fs');
const sanitizeHtml=require('sanitize-html');
const template=require('../lib/template.js');

const express=require('express');
const router=express.Router();


//파일 생성하는 Routing
router.get("/create",(req,res)=>{
    const list=req.list;
    const title="WEB - Create";
    const html=template.html(title,list,`
        <form action="/page/create_process" method="post">
            <p>
                <input type="text" name="title" placeholder="title">
            </p>
            <p> 
                <textarea name="description" placeholder="description"></textarea>
            </p>
            <p>
                <input type="submit">
            </p>
        </form>
    `,``);
    res.send(html);
});

router.post("/create_process",(req,res)=>{
    const{
        body:{
            title,description
        }
    }=req;
    fs.writeFile(`data/${title}`,description,"utf-8",(err)=>{
        res.redirect(`/page/${title}`);
    })
})

//파일 수정에 관한 Routing
router.get("/update/:pageId",(req,res)=>{
    const list=req.list;
    const title=req.params.pageId;
    const fileteredId=path.parse(title).base;
    fs.readFile(`./data/${fileteredId}`,'utf8',(err,description)=>{
        if(err){
            next(err);
        }
        else{
            const html=template.html(title,list,
            `
            <form action="/page/update_process" method="post">
                <input type="hidden" name="id" value="${title}">
            <p>
                <input type="text" name="title" placeholder="title" value="${title}">
            </p>
            <p>
                <textarea name="description" placeholder="description">${description}</textarea>
            </p>
            <p>
                <input type="submit">
            </p>
            </form>
            `,
            `<a href="/page/create">create</a><a href="/page/update/${title}">update</a>`);
            res.send(html);
        }
        
    });
})


router.post("/update_process",(req,res)=>{
    const{
        body:{
            id,title,description
        }
    }=req;
    const fileteredId=path.parse(title).base;
    fs.rename(`./data/${id}`,`./data/${title}`,(err)=>{
        fs.writeFile(`data/${fileteredId}`,description,"utf-8",(err)=>{
            res.redirect(`/page/${title}`);
        }) 
    });
})

//파일 제거에 관한 라우팅
router.post("/delete_process",(req,res)=>{
    const id=req.body.id;
    const fileteredId=path.parse(id).base;
    fs.unlink(`./data/${fileteredId}`,(err)=>{
        if(err){
            next(err);
        }
        else{
            res.redirect(`/`);
        }
    })
});
//page 경로에 대한 라우팅 진행
router.get("/:pageId",(req,res,next)=>{
    const list=req.list;
    const title=req.params.pageId;
    const fileteredId=path.parse(title).base;
    console.log(path.parse(title));
    fs.readFile(`./data/${fileteredId}`,'utf8',(err,description)=>{
        if(err){
            next(err);
        }
        else{
            const sanitizedTitle=sanitizeHtml(title);
            const sanitizedDescription=sanitizeHtml(description);
            const html=template.html(title,list,
                `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
                `<a href="/page/create">create</a>
                <a href="/page/update/${sanitizedTitle}">update</a>
                    <form action="/page/delete_process" method="post">
                        <input type="hidden" name="id" value="${sanitizedTitle}">
                        <input type="submit" value="delete"></input>
                    </form>
                    `);
                res.send(html);
        }
        }
    );
})

module.exports=router;