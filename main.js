const template=require("./lib/template");
const express=require('express');
const bodyParser=require('body-parser');
const compression = require('compression');

//Router middlewares
const topicRouter=require('./routes/topic');
const rootRouter=require('./routes/index');
const authorRouter=require('./routes/author');
const authRouter=require('./routes/auth');

const helmet=require('helmet');

const session=require('express-session');
const session_secret=require('./config/sessionconfig.json')
const SessionStore=require('express-session-sequelize')(session.Store);

const passport=require('./passport/index')();

//Flash
const flash=require('connect-flash');

//Application 생성
const app=express();

//sequelize 설정
const morgan=require("morgan");
const {sequelize,User,Author,Topic}= require("./models");
const path=require('path');

sequelize.sync({
    force:false
}).then(()=>{
    console.log("DB Connected");
}).catch((err)=>{
    console.error(err);
});

app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, 'public'))); // 요청시 기본 경로 설정
app.use(express.json()); // json 파싱
app.use(express.urlencoded({ extended: false })); // uri 파싱

//Session 정보 할당
const sequelizeSessionStore= new SessionStore({
    db:sequelize
});

app.use(session({
    secret:session_secret.secret,
    resave:false,
    saveUninitialized:true,
    store:sequelizeSessionStore
}))

//flash message 출력
app.use(flash());

//passport 설정
app.use(passport.initialize());
app.use(passport.session());


//helmet 사용 --> security
app.use(helmet());

//Static file 이용할 수 있도록 설정
app.use(express.static('public'));

//Middleware 구성
app.use(bodyParser.urlencoded({extended:false}));

app.use(compression());

//file을 읽어들여서 list형태로 만들어오는 부분을 middleware로 만들고 이를 적용
app.get('*',(req,res,next)=>{
    Topic.findAll({
        order:['id']
    }).then((topics)=>{
        req.topic_list=template.topic_list(topics);
        Author.findAll({
            order:['id']
        }).then((authors)=>{
            req.authors=authors;
            next();
        }).catch((err2)=>{
            throw err2;
        })

    }).catch((err1)=>{
        throw err1;
    })
});
    

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

