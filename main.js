const fs = require('fs');
const template=require("./lib/template");
const path=require('path');
const express=require('express');
const sanitizeHtml=require('sanitize-html');
const qs=require('querystring');
const bodyParser=require('body-parser');
const compression = require('compression');

//Application 생성
const app=express();

//Middleware 구성
app.use(bodyParser.urlencoded({extended:false}));
app.use(compression());
//file을 읽어들여서 list형태로 만들어오는 부분을 middleware로 만들고 이를 적용
app.get('*',(req,res,next)=>{
    fs.readdir("./data",(err,files)=>{
        req.list=template.list(files);
        next();
    })
})

//Static file 이용할 수 있도록 설정
app.use(express.static('public'));


//Application에 대한 포트 구성
app.listen(3000,()=>{
    console.log("App Listening on port 3000");
})

//root 경로에 대한 라우팅 진행
app.get("/",(req,res)=>{
    const list=req.list;
    const title="Welcome Hello";
    const description="Hello, Node.js";
    const html=template.html(title,list,
        `
        <h2>${title}</h2>${description}
        <img src="/images/coffee.jpg" style="width:300px; display:block; margin:10px;"></img>
        `,
        `<a href="/create">create</a>`);
    res.send(html)
})

//page 경로에 대한 라우팅 진행
app.get("/page/:pageId",(req,res,next)=>{
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
                `<a href="/create">create</a>
                <a href="/update/${sanitizedTitle}">update</a>
                    <form action="/process_delete" method="post">
                        <input type="hidden" name="id" value="${sanitizedTitle}">
                        <input type="submit" value="delete"></input>
                    </form>
                    `);
                res.send(html);
        }
        }
    );
})

//파일 생성하는 Routing
app.get("/create",(req,res)=>{
    const list=req.list;
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

app.post("/process_create",(req,res)=>{
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
app.get("/update/:pageId",(req,res)=>{
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
        
    });
})


app.post("/process_update",(req,res)=>{
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
app.post("/process_delete",(req,res)=>{
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

//404 에러에 대한 처리
app.use(function(req,res,next){
    res.status(404).send("Sorry Can't find page");
});

//error handling
app.use((err,req,res,next)=>{
    console.log(err.stack)
    res.status(500).send("Something Broke!");
});

