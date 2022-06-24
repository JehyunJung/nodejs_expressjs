const template=require('../lib/template.js');

const express=require('express');
const router=express.Router();
const mysql_connection=require('../lib/mysql.js');
const { Author } = require('../models/index.js');

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
    if(!req.user){
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
    if(!req.user){
        res.redirect("/author");
        return false;
    }
    const{
        body:{
            name,profile
        }
    }=req;
    Author.create({
        name:name,
        profile:profile
    }).then(()=>{
        res.redirect(`/author`);
    }).catch((err)=>{
        throw err;
    });

})

//파일 수정에 관한 Routing
router.get("/update/:authorId",(req,res)=>{
    if(!req.user){
        res.redirect("/author");
        return false;
    }
    const topic_list=req.topic_list;
    const id=req.params.authorId;
    const title = 'Welcome';
    Author.findOne({
        where:{
            id:id
        }
    }).then((author)=>{
        const name=author.name;
        const profile=author.profile;
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
    }).catch((err)=>{
        throw err;
    })
})

router.post("/update_process",(req,res)=>{
    if(!req.user){
        res.redirect("/author");
        return false;
    }
    const{
        body:{
            id,author,profile
        }
    }=req;
    Author.update({
        name:author,
        profile:profile
    },
    {
        where:{
            id:id
        }
    }).then(()=>{
        res.redirect(`/author`);
    }).catch((err)=>{
        throw err;
    });

})

//파일 제거에 관한 라우팅
router.post("/delete_process",(req,res)=>{
    //console.log("Deleting: " + req.user);
    if(!req.user){
        res.redirect("/author");
        return false;
    }
    const id=req.body.id;
    Author.destroy({
        where:{
            id:id
        }
    }).then(()=>{
        res.redirect("/author");
    }).catch((err)=>{
        throw err;
    });

});

module.exports=router;