const express=require('express');
const session=require('express-session');
const mysql_connection=require('../lib/mysql');
const MySQLStore = require('express-mysql-session')(session);
const sessionStore=new MySQLStore({},mysql_connection);
const app=express();


app.use(session({
    secret:'keyboard cat',
    resave:false,
    saveUninitialized:true,
    sessionStore:sessionStore
}))

app.get("/",(req,res)=>{
    console.log(req.session)
    if(req.session.num === undefined){
        req.session.num=1;
    }
    else{
        req.session.num=req.session.num+1;
    }
    res.send(`Views: ${req.session.num}`);
});


app.listen(3000,()=>{
    console.log("Server listening to Port 3000");
})
