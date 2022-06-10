const fs = require('fs');
const template=require("./lib/template");
const path=require('path');
const express=require('express');
const sanitizeHtml=require('sanitize-html');
const qs=require('querystring');

//Application 생성
const app=express();


//Application에 대한 포트 구성
app.listen(3000,()=>{
    console.log("App Listening on port 3000");
})

//root 경로에 대한 라우팅 진행
app.get("/",(req,res)=>{
    fs.readdir("./data",(err,files)=>{
        const list=template.list(files);
        const title="Welcome Hello";
        const description="Hello, Node.js";
        const html=template.html(title,list,`<h2>${title}</h2>${description}`,`<a href="/create">create</a>`);
        res.send(html)
        })
})

//page 경로에 대한 라우팅 진행
app.get("/page/:pageId",(req,res)=>{
    fs.readdir("./data",(err,files)=>{
        const list=template.list(files);
        const title=req.params.pageId;
        const fileteredId=path.parse(title).base;
        console.log(err);
        console.log(path.parse(title));
        fs.readFile(`./data/${fileteredId}`,'utf8',(err,description)=>{
            const sanitizedTitle=sanitizeHtml(title);
            const sanitizedDescription=sanitizeHtml(description);
            const html=template.html(title,list,
                `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
                `<a href="/create">create</a>
                <a href="/update/${sanitizedTitle}">update</a>
                    <form action="/process_delete" method="post">
                        <input type="hidden" name="id" value="${sanitizedTitle}">
                        <input type="submit" value="delete"></input>
                    </form>
                    `);
                res.send(html);
            }
        );
        })
})

//파일 생성하는 Routing
app.get("/create",(req,res)=>{
    fs.readdir("./data",(err,files)=>{
        const list=template.list(files);
        const title="WEB - Create";
        const html=template.html(title,list,`
            <form action="/process_create" method="post"?
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
})

app.post("/process_create",(req,res)=>{
    let body="";
    req.on("data",function(data){
        body+=data;
    })
    req.on("end",function(){
        const post=qs.parse(body);
        const title=post.title;
        const description=post.description;

        fs.writeFile(`data/${title}`,description,"utf-8",(err)=>{
            res.redirect(`/page/${title}`);
        })
    })
})

//파일 수정에 관한 Routing
app.get("/update/:pageId",(req,res)=>{
    fs.readdir("./data",(err,files)=>{
        const list=template.list(files);
        const title=req.params.pageId;
        const fileteredId=path.parse(title).base;
        fs.readFile(`./data/${fileteredId}`,'utf8',(err,description)=>{
            const html=template.html(title,list,
                `
                <form action="/process_update" method="post">
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
                `<a href="/create">create</a><a href="/update/${title}">update</a>`);
                res.send(html);
            }
        );
        })
})


app.post("/process_update",(req,res)=>{
    let body="";
    req.on("data",function(data){
        body+=data;
    })
    req.on("end",function(){
        const post=qs.parse(body);
        const id=post.id
        const title=post.title;
        const description=post.description;
        const fileteredId=path.parse(title).base;
        fs.rename(`./data/${id}`,`./data/${title}`,(err)=>{
            fs.writeFile(`data/${fileteredId}`,description,"utf-8",(err)=>{
                res.redirect(`/page/${title}`);
            }) 
        });
        
    })
})

//파일 수정에 관한 라우팅
app.post("/process_delete",(req,res)=>{
    let body="";
    req.on("data",function(data){
        body+=data;
    })
    req.on("end",function(){
        const post=qs.parse(body);
        const id=post.id
        const fileteredId=path.parse(id).base;
        fs.unlink(`./data/${fileteredId}`,(err)=>{
            console.log(err)
            res.redirect(`/`);

        }
        )}
    );
})

