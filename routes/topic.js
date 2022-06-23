const sanitizeHtml=require('sanitize-html');
const template=require('../lib/template.js');

const express=require('express');
const router=express.Router();
const mysql_connection=require('../lib/mysql.js');


//파일 생성하는 Routing
router.get("/create",(req,res)=>{
    if(!req.session.is_logined){
        res.redirect("/");
        return false;
    }
    const topic_list=req.topic_list;
    const title="WEB - Create";
    const html=template.html(title,topic_list,`
        <form action="/topic/create_process" method="post">
            <p>
                <input type="text" name="title" placeholder="title">
            </p>
                ${template.author_select(req.authors)}
            <p> 
                <textarea name="description" placeholder="description"></textarea>
            </p>
            <p>
                <input type="submit">
            </p>
        </form>
    `,``,
    template.auth_loginButton(req,res),
    template.auth_loginForm(false),        
    template.auth_joinButton(req,res),
    template.auth_joinForm(false));
    res.send(html);
});

router.post("/create_process",(req,res)=>{

    const{
        body:{
            title,author,description
        }
    }=req;
    if(!req.session.is_logined){
        res.redirect(`/`);
        return false;
    }
    mysql_connection.query(
        "INSERT INTO TOPIC(title,description,created,author_id) VALUES(?,?,now(),?)"
        ,[title,description,author]
        ,(err,results)=>{
            if(err){
                throw err;
            }
            res.redirect(`/topic/${results.insertId}`);
        })
})

//파일 수정에 관한 Routing
router.get("/update/:topicId",(req,res)=>{
    const topic_list=req.topic_list;
    const id=req.params.topicId;
    if(!req.session.is_logined){
        res.redirect(`/topic/${id}`);
        return false;
    }
    mysql_connection.query(
        "SELECT * FROM TOPIC WHERE ID=?",
        [id],
        (err,topic)=>{
            if(err){
                next(err);
            }
            const title=topic[0].title;
            const description=topic[0].description;
            const author_id=topic[0].author_id;
            const html=template.html(title,topic_list,
            `
            <form action="/topic/update_process" method="post">
                <input type="hidden" name="id" value="${id}">
            <p>
                <input type="text" name="title" placeholder="title" value="${title}">
            </p>
                ${template.author_select(req.authors,author_id)}
            <p>
                <textarea name="description" placeholder="description">${description}</textarea>
            </p>
            <p>
                <input type="submit">
            </p>
            </form>
            `,
            `<a href="/topic/create">create</a><a href="/topic/update/${id}">update</a>`,
            template.auth_loginButton(req,res),
            template.auth_loginForm(false),        
            template.auth_joinButton(req,res),
            template.auth_joinForm(false));
            res.send(html);
        })
        
    });


router.post("/update_process",(req,res)=>{

    const{
        body:{
            id,title,author,description
        }
    }=req;

    if(!req.session.is_logined){
        res.redirect(`/topic/${id}`);
        return false;
    }
    mysql_connection.query(
        "UPDATE TOPIC SET TITLE=?,DESCRIPTION=?,AUTHOR_ID=? WHERE ID=?"
        ,[title,description,author,id],
        (err,results)=>{
            if(err){
                throw err;
            }
            res.redirect(`/topic/${id}`);
        });

})

//파일 제거에 관한 라우팅
router.post("/delete_process",(req,res)=>{
    const id=req.body.id;
    if(!req.session.is_logined){
        res.redirect(`/topic/${id}`);
        return false;
    }
    mysql_connection.query(
        "DELETE FROM TOPIC WHERE ID=?"
        ,[id]
        ,(err)=>{
            if(err){
                throw err;
            }
            res.redirect("/");
        }
    )
});
//topic 경로에 대한 라우팅 진행
router.get("/:topicId",(req,res,next)=>{
    const topic_list=req.topic_list;
    const id=req.params.topicId;
    mysql_connection.query(
        `SELECT topic.id,title,description,name,profile From topic LEFT JOIN author on topic.author_id=author.id where topic.id=?`,
        [id],
        (err,topic)=>{
            if(err){
                next(err);
            }
            else{
                console.log(topic);
                const title=topic[0].title;
                const description=topic[0].description;
                
                const author_name=topic[0].name;
                const author_profile=topic[0].profile;
                const sanitizedTitle=sanitizeHtml(title);
                const sanitizedDescription=sanitizeHtml(description);
                const html=template.html(title,topic_list,
                    `
                    <h2>Title: ${sanitizedTitle}</h2>
                    <h3> Author: ${author_name}</h3>
                    <h3> Profile: ${author_profile}</h3>
                    <p> Description: ${sanitizedDescription}</p>`,
                    `<a href="/topic/create">create</a>
                    <a href="/topic/update/${id}">update</a>
                        <form action="/topic/delete_process" method="post">
                            <input type="hidden" name="id" value="${id}">
                            <input type="submit" value="delete"></input>
                        </form>
                        `,
                        template.auth_loginButton(req,res),
                        template.auth_loginForm(false),        
                        template.auth_joinButton(req,res),
                        template.auth_joinForm(false));
                    res.send(html);
            }
        })
    });

module.exports=router;