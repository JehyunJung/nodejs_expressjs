const template=require("./lib/template");
const express=require('express');
const bodyParser=require('body-parser');
const compression = require('compression');

const topicRouter=require('./routes/topic');
const rootRouter=require('./routes/index');
const authorRouter=require('./routes/author');
const authRouter=require('./routes/auth');

const helmet=require('helmet');
const mysql_connection=require('./lib/mysql.js');

const session=require('express-session');
const session_secret=require('./config/sessionconfig.json')
const MySQLStore = require('express-mysql-session')(session);
const sessionStore=new MySQLStore({},mysql_connection);

//Application 생성
const app=express();

//Session 정보 할당
app.use(session({
    secret:session_secret.secret,
    resave:false,
    saveUninitialized:true,
    store:sessionStore
}))

//helmet 사용 --> security
app.use(helmet());

//Static file 이용할 수 있도록 설정
app.use(express.static('public'));

//Middleware 구성
app.use(bodyParser.urlencoded({extended:false}));

app.use(compression());
//file을 읽어들여서 list형태로 만들어오는 부분을 middleware로 만들고 이를 적용
app.get('*',(req,res,next)=>{
    mysql_connection.query("SELECT * FROM TOPIC ORDER BY ID;",(err1,topics)=>{
        if(err1){
            throw err;
        }
        mysql_connection.query("SELECT * FROM AUTHOR ORDER BY ID",(err2,authors)=>{
            if(err2){
                throw err2;
            }
            //console.log(topics);
            //console.log(authors);

            req.topic_list=template.topic_list(topics);
            req.authors=authors;
            next();
        })
        
        
    })
})

// root 경로에 대한 routing 수행
app.use("/",rootRouter);

// /page로 시작되는 경로에 대해 pageRouter 미들웨어를 적용하겠다.
app.use('/topic',topicRouter);

// /author 시작되는 경로에 대해 authorRouter 미들웨어를 적용하겠다.
app.use('/author',authorRouter);

//인증 관련된 routing 수행
app.use('/auth',authRouter);

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

