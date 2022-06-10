const fs = require('fs');
const template=require("./lib/template");
const express=require('express');
const qs=require('querystring');
const bodyParser=require('body-parser');
const compression = require('compression');
const pageRouter=require('./routes/page');
const rootRouter=require('./routes/index');

//Application 생성
const app=express();

//Static file 이용할 수 있도록 설정
app.use(express.static('public'));

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

// root 경로에 대한 routing 수행
app.use("/",rootRouter);

// /page로 시작되는 경로에 대해 pageRouter 미들웨어를 적용하겠다.
app.use('/page',pageRouter);

//Application에 대한 포트 구성
app.listen(3000,()=>{
    console.log("App Listening on port 3000");
})



//404 에러에 대한 처리
app.use(function(req,res,next){
    res.status(404).send("Sorry Can't find page");
});

//error handling
app.use((err,req,res,next)=>{
    console.log(err.stack)
    res.status(500).send("Something Broke!");
});

