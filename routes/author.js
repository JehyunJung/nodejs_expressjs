const template=require('../lib/template.js');

const express=require('express');
const router=express.Router();
const mysql_connection=require('../lib/mysql.js');

router.get("/",(req,res)=>{
    
    const topic_list=req.topic_list;
    const title="Welcome Hello";
    const description="Hello, Node.js";
    const html=template.html(title,topic_list,
        `
        ${template.author_list(req.authors)}
        `,
        `<a href="/author/create">create</a>`,
        template.auth_loginButton(req,res),
        template.auth_loginForm(false),        
        template.auth_joinButton(req,res),
        template.auth_joinForm(false));
    res.send(html)
})

//파일 생성하는 Routing
router.get("/create",(req,res)=>{
    if(!req.session.is_logined){
        res.redirect("/author");
        return false;
    }
    const topic_list=req.topic_list;
    const title="WEB - Create";
    const html=template.html(title,topic_list,
        `
        ${template.author_list(req.authors)}
        <form action="/author/create_process" method="post">
            <p>
                <input name="name" placeholder="name"></input>
            </p>
            <p>
                <textarea name="profile" placeholder="profile"></textarea>
            </p>
                <input type="submit" value="create">
        </form>
        `,
        ``,
        template.auth_loginButton(req,res),
        template.auth_loginForm(false),        
        template.auth_joinButton(req,res),
        template.auth_joinForm(false)
    );
    res.send(html);
});

router.post("/create_process",(req,res)=>{
    if(!req.session.is_logined){
        res.redirect("/author");
        return false;
    }
    const{
        body:{
            name,profile
        }
    }=req;
    mysql_connection.query(
        "INSERT INTO AUTHOR(name,profile) VALUES(?,?)"
        ,[name,profile]
        ,(err,results)=>{
            if(err){
                throw err;
            }
            res.redirect(`/author`);
        })
})

//파일 수정에 관한 Routing
router.get("/update/:authorId",(req,res)=>{
    if(!req.session.is_logined){
        res.redirect("/author");
        return false;
    }
    const topic_list=req.topic_list;
    const id=req.params.authorId;
    const title = 'Welcome';
    mysql_connection.query(
        "SELECT * FROM AUTHOR WHERE ID=?",
        [id],
        (err,author)=>{
            if(err){
                throw err;
            }
            const name=author[0].name;
            const profile=author[0].profile;
            const html=template.html(title,topic_list,
            `
            ${template.author_list(req.authors)}
            <form action="/author/update_process" method="post">
                <input type="hidden" name="id" value="${id}">
                <p>
                    <input name="author" placeholder="name" value="${name}">
                </p>
                <p>
                    <textarea name="profile" placeholder="profile">${profile}</textarea>
                </p>
                <p>
                    <input type="submit" value="update">
                </p>
            </form>
            `,
            ``,
            template.auth_loginButton(req,res),
            template.auth_loginForm(false),        
            template.auth_joinButton(req,res),
            template.auth_joinForm(false));
            res.send(html);
        })
        
    });


router.post("/update_process",(req,res)=>{
    if(!req.session.is_logined){
        res.redirect("/author");
        return false;
    }
    const{
        body:{
            id,author,profile
        }
    }=req;
    mysql_connection.query(
        "UPDATE AUTHOR SET NAME=?,PROFILE=? WHERE ID=?"
        ,[author,profile,id],
        (err,results)=>{
            if(err){
                throw err;
            }
            res.redirect(`/author`);
        });

})

//파일 제거에 관한 라우팅
router.post("/delete_process",(req,res)=>{
    //console.log("Deleting: " + req.session.is_logined);
    if(!req.session.is_logined){
        res.redirect("/author");
        return false;
    }
    const id=req.body.id;
    mysql_connection.query(
        "DELETE FROM AUTHOR WHERE ID=?"
        ,[id]
        ,(err,results)=>{
            if(err){
                throw err;
            }
            res.redirect("/author");
        }
    )
});

module.exports=router;