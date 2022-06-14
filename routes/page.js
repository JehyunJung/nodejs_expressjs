const path=require('path');
const fs=require('fs');
const sanitizeHtml=require('sanitize-html');
const template=require('../lib/template.js');

const express=require('express');
const router=express.Router();
const mysql_connection=require('../lib/mysql.js');


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
    mysql_connection.query(
        "INSERT INTO TOPIC(title,description,created,author_id) VALUES(?,?,now(),?)"
        ,[title,description,1]
        ,(err,results)=>{
            if(err){
                throw err;
            }
            res.redirect(`/page/${results.insertId}`);
        })
})

//파일 수정에 관한 Routing
router.get("/update/:pageId",(req,res)=>{
    const list=req.list;
    const title=req.params.pageId;
    const fileteredId=path.parse(title).base;
    mysql_connection.query(
        "SELECT * FROM TOPIC WHERE ID=?",
        [fileteredId],
        (err,topic)=>{
            if(err){
                next(err);
            }
            const id=topic[0].id;
            const title=topic[0].title;
            const description=topic[0].description;
            const author_id=topic[0].author_id;
            const html=template.html(title,list,
            `
            <form action="/page/update_process" method="post">
                <input type="hidden" name="id" value="${id}">
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
            `<a href="/page/create">create</a><a href="/page/update/${id}">update</a>`);
            res.send(html);
        })
        
    });


router.post("/update_process",(req,res)=>{
    const{
        body:{
            id,title,description
        }
    }=req;
    mysql_connection.query(
        "UPDATE TOPIC SET TITLE=?,DESCRIPTION=? WHERE ID=?"
        ,[title,description,id],
        (err,results)=>{
            if(err){
                throw err;
            }
            res.redirect(`/page/${id}`);
        });

})

//파일 제거에 관한 라우팅
router.post("/delete_process",(req,res)=>{
    const id=req.body.id;
    mysql_connection.query(
        "DELETE FROM TOPIC WHERE ID=?"
        ,[id]
        ,(err,results)=>{
            if(err){
                throw err;
            }
            res.redirect("/");
        }
    )
});
//page 경로에 대한 라우팅 진행
router.get("/:pageId",(req,res,next)=>{
    const list=req.list;
    const id=req.params.pageId;
    mysql_connection.query(
        "SELECT * FROM TOPIC WHERE ID=?",
        [id],
        (err,topic)=>{
            if(err){
                next(err);
            }
            else{
                console.log(topic);
                const id=topic[0].id;
                const title=topic[0].title;
                const description=topic[0].description;
                const author_id=topic[0].author_id;

                const sanitizedTitle=sanitizeHtml(title);
                const sanitizedDescription=sanitizeHtml(description);
                const html=template.html(title,list,
                    `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
                    `<a href="/page/create">create</a>
                    <a href="/page/update/${id}">update</a>
                        <form action="/page/delete_process" method="post">
                            <input type="hidden" name="id" value="${id}">
                            <input type="submit" value="delete"></input>
                        </form>
                        `);
                    res.send(html);
            }
        })
    });

module.exports=router;