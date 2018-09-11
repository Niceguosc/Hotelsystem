var express = require('express');
var app = express();
var router = require("./router/router");
var session = require('express-session');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/Hotel');


app.use(express.static('static'));

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));

app.set("view engine", "ejs");
//显示首页
app.get("/", router.showIndex);
//显示登录页
app.get("/login", router.showLogin);
app.post("/checklogin", router.checklogin);
//注册
app.get("/reg", router.showReg);
app.get("/checkuserexist", router.checkuserexist);
app.post("/doreg", router.doreg);

//管理员登陆
app.get('/Administration',router.showAdmin);

//在线预订
app.get('/reserve',router.showreserve);

//订单查询
app.get('/query',router.showquery);
//房间类别

app.get('/classification',router.showclassification);
app.post('/doadd', router.doadd);
app.get('/doadd', router.getAll);
app.propfind('/doadd/:name', router.check);
app.delete('/doadd/:id', router.delete);
app.get('/doadd/:id', router.showUpdate);
app.post('/doadd/:id', router.update);


//大堂入住
app.get('/living',router.showliving);
app.post('/doaddB',router.doaddB);
// app.propfind('/doadd/:name', router.checkB);

//订单入住
app.get('/order',router.showorder);
app.get('/selects',router.getselect);
app.get('/selects/:id',router.toprice);
app.post("/addorder/:id",router.addorder);


app.post('/check/:id',router.showCheck);
//查询
app.get('/finding/:id',router.findorder);


app.delete('/abcd/:sid', router.Bdelete);
app.get('/abcd/:sid', router.BshowUpdate);
app.post('/abcd/:sid', router.Bupdate);

//类别
app.get('/readclass', router.AgetAll);

//房间管理
app.get('/house',router.showhouse);
app.post('/doadda', router.doadda);
app.get('/doadda', router.getAlla);
app.propfind('/doadda/:id', router.checka);
app.delete('/doadda/:id', router.deletea);
app.get('/doadda/:id', router.showUpdatea);
app.post('/doadda/:id', router.updatea);
//房间号
app.get('/readhao/:leibie', router.BgetAll);

//入住记录
app.get('/seara',router.seara);
app.get('/seara/:id',router.showAw);

//退房
app.get('/out',router.showout);
app.get('/cha/:id',router.cha);

app.get('/tuifang/:id',router.outdelect);
app.post('/gh',router.guihuan);


//图表显示
app.get('/icon',router.showIcon);
app.get('/ics',router.showIconAll);

//修改密码
app.get('/modify',router.showmodify);
app.post('/changepw',router.changepw);


app.listen('3233');