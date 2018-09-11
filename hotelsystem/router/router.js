var user = require("../models/Admin.js");
var room = require("../models/Room.js");
var order = require("../models/Order");
var house = require("../models/House");
var lobby = require("../models/lobby");
var check = require("../models/Check");
var url = require("url");
var formidable = require("formidable");
var fs = require("fs");
var crypto = require('crypto');


//显示首页
exports.showIndex = function (req, res, next) {
    res.render("index");
};

//显示登录页
exports.showLogin = function (req, res, next) {
    res.render("login");
};

exports.checklogin = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        var yonghuming = fields.yonghuming;
        var mima = fields.mima;
        // console.log(mima)

        // console.log(crypto.createHmac('sha256','123123').digest('hex'));
        //先来检查用户名是否存在
        user.findUserByName(yonghuming, function (err, doc) {

            if (!doc) {
                //-1用户名不存在！！！
                res.json({"result": -1});
                return;
            }
            var sha256 = crypto.createHash("sha256");
            //密码和密码进行加密比对
            if (sha256.update(mima).digest("hex") === doc.mima) {
                //写session
                req.session.login = 1;
                req.session.yonghuming = yonghuming;
                //比较密码的正确性，加密的和加密的比较
                res.json({"result": 1});
                //跳转
                return;
            } else {
                res.json({"result": -2});
                return;
            }

        });
    });
};

//显示注册页
exports.showReg = function (req, res, next) {
    res.render("reg");
};
//验证用户名是否存在
exports.checkuserexist = function (req, res, next) {
    var queryobj = url.parse(req.url, true).query;
    if (!queryobj.yonghuming) {
        res.send("请提供yonghuming参数！");
        return;
    }
    //查询数据库中，用户是否存在，如果存在输出-1，不存在输出0
    user.findUserByName(queryobj.yonghuming, function (err, doc) {
        if (doc) {
            res.json({"result": -1});
        } else {
            res.json({"result": 0});
        }
    });
};

//执行注册，在真正执行注册的时候也要后台验证一下用户名是否占用
exports.doreg = function (req, res, next) {
    var form = new formidable.IncomingForm();

    form.parse(req, function (err, fields, files) {
        var yonghuming = fields.yonghuming;
        var mima = fields.mima;
        //在提交的时候再次检查用户名是否重复了
        user.findUserByName(yonghuming, function (err, doc) {
            if (doc) {
                //-1就是用户名存在
                res.json({"result": -1});
                return;
            }
            //在数据库中添加一个user
            user.adduser(yonghuming, mima, function (err, doc) {
                if (err) {
                    //-2就是服务器错误
                    res.json({"result": -2})
                    return;
                }
                //注册成功！！
                req.session.login = 1;
                req.session.yonghuming = yonghuming;

                res.json({"result": 1})
            });
        });
    });
};



exports.showAdmin=function (req, res) {

    if(req.session.login){
        //登录成功要做的业务
        res.render("Administration",{
            "yonghuming" : req.session.yonghuming
        });
    }else{
        //呈递没有登录表单

        res.redirect('/login');
    }

    // res.render('Administration');

};

exports.showreserve = function (req, res) {
    res.render('reserve');
};

exports.showquery =function (req, res) {
    res.render('query');
};

exports.showclassification = function (req, res) {
    res.render('classification')
};
exports.doadd = function (req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        fields.state = true;
        room.addCard(fields, function (result) {
            res.json({"result": result});
        });
    });
};
exports.getAll = function (req, res) {
    var page = url.parse(req.url, true).query.page - 1 || 0;
    var pagesize = 5;
    room.count({}, function (err, count) {
        room.find({}).limit(pagesize).skip(pagesize * page).exec(function (err, results) {
            res.json({
                "pageAmount": Math.ceil(count / pagesize),
                "results": results
            });
        });
    });
};
exports.check = function (req, res) {
    var name = req.params.name;

    room.checkSid(name, function (torf) {
        res.json({"result": torf});
    });
};
exports.delete = function (req, res) {
    var id = req.params.id;
    room.find({'_id': id}, function (err, results) {
        if (err || results.length == 0) {
            res.json({"result": -1});
            return;
        }

        results[0].remove(function (err) {
            if (err) {
                res.json({'result': -1});
                return;
            }

            res.json({'result': 1})
        })
    })
};
exports.showUpdate = function (req, res) {

    var id = req.params.id;
    // console.log(id);
    //直接用类名打点调用find，不需要再Student类里面增加一个findStudentBySid的方法。
    room.find({'_id': id}, function (err, results) {
        // console.log(results);
        if (results.length == 0) {

            res.json({'result': -1});
            return;
        }
        //呈递页面
        res.json({'update': results})
    });
};
exports.update = function (req, res) {
    var id = req.params.id;
    if (!id) {
        return;
    }

    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        room.find({'_id': id}, function (err, results) {
            if (results.length == 0) {
                res.json({"result": -1});
                return;
            }

            var thestudent = results[0];

            //更改属性
            thestudent.name = fields.name;
            thestudent.Area = fields.Area;
            thestudent.Bed = fields.Bed;
            thestudent.Breakfast = fields.Breakfast;
            thestudent.Net = fields.Net;
            thestudent.Tv = fields.Tv;
            thestudent.price = fields.price;
            thestudent.RoomAmount = fields.RoomAmount;
            thestudent.LAmount = fields.LAmount;




            //持久化
            thestudent.save(function (err) {
                if (err) {
                    res.json({"result": -1});
                } else {
                    res.json({"result": 1});
                }
            });
        });
    });
};




//大堂入住
exports.showliving = function (req, res) {
    res.render('living')
};
exports.doaddB = function(req,res){
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        console.log(fields);
        var roomname = fields.typenum;
        var roomclass = fields.RCategory;
        lobby.addlobby(fields, function (result) {
            res.json({"result": result});
        });
       house.find({'sid': roomname}, function (err, results) {
            if (results.length == 0) {
                res.json({"result": -1});
                return;
            }

            var thestudent = results[0];

            //更改属性

            thestudent.RoomStatus = false;
            //持久化
            thestudent.save(function (err) {

            });
        });
        room.find({'name': roomclass}, function (err, results) {
            if (results.length == 0) {
                res.json({"r": -1});
                return;
            }

            var thestudent = results[0];

            //更改属性
            thestudent.name = thestudent.name;
            thestudent.Area = thestudent.Area;
            thestudent.Bed = thestudent.Bed;
            thestudent.Breakfast = thestudent.Breakfast;
            thestudent.Net = thestudent.Net;
            thestudent.Tv = thestudent.Tv;
            thestudent.price = thestudent.price;
            thestudent.RoomAmount = thestudent.RoomAmount;
            thestudent.LAmount = thestudent.LAmount-1;




            //持久化
            thestudent.save(function (err) {

            });
        });
    });
};


exports.showorder = function(req,res){
    res.render('order');
};

exports.AgetAll = function (req, res) {
    room.count({}, function (err, count) {
        room.find({}, function (err, results) {
            res.json({
                "results": results
            });
        });

    });
};




//预定
exports.addorder = function (req,res) {
    var id = req.params.id;
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
       order.count({},function (err,orderid) {
        var ordernum = orderid+1;
        console.log(ordernum);
        fields.OrderID= ordernum;
        // console.log(fields);
        order.addCard(fields, function (result) {
            // console.log(result);
            res.json({"result": result});
            room.find({'name': id}, function (err, results) {
                if (results.length == 0) {
                    res.json({"r": -1});
                    return;
                }

                var thestudent = results[0];

                //更改属性
                thestudent.name = thestudent.name;
                thestudent.Area = thestudent.Area;
                thestudent.Bed = thestudent.Bed;
                thestudent.Breakfast = thestudent.Breakfast;
                thestudent.Net = thestudent.Net;
                thestudent.Tv = thestudent.Tv;
                thestudent.price = thestudent.price;
                thestudent.RoomAmount = thestudent.RoomAmount;
                thestudent.LAmount = thestudent.LAmount-1;




                //持久化
                thestudent.save(function (err) {

                });
            });
        });
    });
 });
};


exports.showCheck =function(req,res){
    var id = req.params.id;
    if (!id) {
        return;
    }

    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        order.find({'CustomerName': id}, function (err, results) {
            if (results.length == 0) {
                res.json({"result": -1});
                return;
            }

            var thestudent = results[0];

            //更改属性
            thestudent.fangjian = fields.fangjian;
            thestudent.shenfen = fields.shenfen;
            thestudent.hao = fields.hao;
            thestudent.CustomerName = fields.CustomerName;
            thestudent.sex = fields.sex;

            //持久化
            thestudent.save(function (err) {
                if (err) {
                    res.json({"result": -1});
                } else {
                    res.json({"result": 1});
                }
            });
        });
        var roomnum = fields.fangjian;
        house.find({'sid': roomnum}, function (err, results) {
            if (results.length == 0) {
                res.json({"result": -1});
                return;
            }

            var thestudent = results[0];

            //更改属性

            thestudent.RoomStatus = false;
            //持久化
            thestudent.save(function (err) {

            });
        });
    });
};

exports.Bdelete = function (req, res) {
    var sid = req.params.sid;
    order.find({'_id': sid}, function (err, results) {
        if (err || results.length == 0) {
            res.json({"result": -1});
            return;
        }
        var roomid = results[0].CategoryID;
        console.log(roomid)
        results[0].remove(function (err) {
            if (err) {
                res.json({'result': -1});
                return;
            }

            res.json({'result': 1})
        })
        room.find({'name': roomid}, function (err, results) {
            if (results.length == 0) {
                res.json({"r": -1});
                return;
            }

            var thestudent = results[0];

            //更改属性
            thestudent.name = thestudent.name;
            thestudent.Area = thestudent.Area;
            thestudent.Bed = thestudent.Bed;
            thestudent.Breakfast = thestudent.Breakfast;
            thestudent.Net = thestudent.Net;
            thestudent.Tv = thestudent.Tv;
            thestudent.price = thestudent.price;
            thestudent.RoomAmount = thestudent.RoomAmount;
            thestudent.LAmount = thestudent.LAmount+1;




            //持久化
            thestudent.save(function (err) {

            });
        });
    })
};
exports.BshowUpdate = function (req, res) {

    var sid = req.params.sid;
    console.log(sid);
    //直接用类名打点调用find，不需要再Student类里面增加一个findStudentBySid的方法。
    order.find({'_id': sid}, function (err, results) {
        // console.log(results);
        if (results.length == 0) {

            res.json({'result': -1});
            return;
        }
        //呈递页面
        res.json({'update': results})
    });
};
exports.Bupdate = function (req, res) {
    var sid = req.params.sid;
    if (!sid) {
        return;
    }
    console.log(sid)
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        order.find({'_id': sid}, function (err, results) {
            if (results.length == 0) {
                res.json({"result": -1});
                return;
            }
            // console.log(results);
            var thestudent = results[0];

            //更改属性
            thestudent.EnterTime = fields.EnterTime;
            thestudent.LeaveTime = fields.LeaveTime;
            thestudent.CustomerName = fields.CustomerName;
            thestudent.LinkMan = fields.LinkMan;
            thestudent.PhoneNumber = fields.PhoneNumber;
            //持久化


            thestudent.save(function (err) {
                if (err) {
                    res.json({"result": -1});
                } else {
                    res.json({"result": 1});
                }
            });
            // thestudent.save(function (err) {
            //
            // });
        });
    });
};



exports.getselect=function (req,res) {
    room.find({},function (err,results) {
            res.json({
                "results":results,
            })
    })
};

exports.toprice = function (req, res) {

    var id = req.params.id;
    console.log(id);
    room.find({'name': id}, function (err, results) {
        console.log(results);
        if (results.length == 0) {

            res.json({'result': -1});
            return;
        }
        //呈递页面
        res.json({'results': results})
    });
};

//查询
exports.findorder=function (req,res) {
    var id = req.params.id;
    order.find({'CustomerName': id}, function (err, results) {
        // console.log(results);
        if (results.length == 0) {

            res.json({'result': -1});
            return;
        }
        //呈递页面
        res.json({'results': results})
    });
};


exports.showhouse= function (req, res) {
    res.render('house');
};
exports.doadda = function (req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        fields.RoomStatus = true;
        // console.log(fields)
        house.addCard(fields, function (result) {
            res.json({"result": result});
        });
    });
};
exports.getAlla = function (req, res) {
    var page = url.parse(req.url, true).query.page - 1 || 0;
    var pagesize = 5;
    house.count({}, function (err, count) {
        house.find({}).limit(pagesize).skip(pagesize * page).exec(function (err, results) {
            res.json({
                "pageAmount": Math.ceil(count / pagesize),
                "results": results
            });
        });
    });
};
exports.checka = function (req, res) {
    var sid = req.params.sid;

    house.checkSid(sid, function (torf) {
        res.json({"result": torf});
    });
};
exports.deletea = function (req, res) {
    var id = req.params.id;
    house.find({'_id': id}, function (err, results) {
        if (err || results.length == 0) {
            res.json({"result": -1});
            return;
        }

        results[0].remove(function (err) {
            if (err) {
                res.json({'result': -1});
                return;
            }

            res.json({'result': 1})
        })
    })
};
exports.showUpdatea = function (req, res) {

    var id = req.params.id;
    // console.log(id);
    //直接用类名打点调用find，不需要再Student类里面增加一个findStudentBySid的方法。
    house.find({'_id': id}, function (err, results) {
        console.log(results);
        if (results.length == 0) {

            res.json({'result': -1});
            return;
        }
        //呈递页面
        res.json({'update': results})
    });
};
exports.updatea = function (req, res) {
    var id = req.params.id;
    if (!id) {
        return;
    }

    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        house.find({'_id': id}, function (err, results) {
            if (results.length == 0) {
                res.json({"result": -1});
                return;
            }

            var thestudent = results[0];

            //更改属性
            thestudent.RoomRemarks = fields.RoomRemarks;

            //持久化
            thestudent.save(function (err) {
                if (err) {
                    res.json({"result": -1});
                } else {
                    res.json({"result": 1});
                }
            });
        });
    });
};


exports.BgetAll = function (req, res) {
    var leibie = req.params.leibie;
    house.count({}, function (err, count) {
        house.find({"RCategory":leibie,"RoomStatus":true}, function (err, results) {
            res.json({
                "results": results
            });

            // console.log(results);
        });
    });
};
exports.BgetAlls= function (req, res) {
    // var leibie = req.params.leibie;
    house.count({}, function (err, count) {
        house.find({}, function (err, results) {
            res.json({
                "results": results[0]
            });

            // console.log(results);
        });
    });
};





exports.showmodify =function (req, res) {

    if(req.session.login){
        //登录成功要做的业务
        res.render("modify",{
            "yonghuming" : req.session.yonghuming
        });
    }else{
        //呈递没有登录表单

        res.redirect('/login');
    }
    // res.render('modify');
};
//修改密码
exports.changepw = function(req,res){
    var form = new formidable.IncomingForm();
    // console.log(results)
    form.parse(req, function(err, fields) {
        user.changepw(fields.yonghuming, fields.mima,function(info){
            //将回调函数显示的信息，原封不动呈递给Ajax接口，会被jQuery alert出来。
            res.end(info);
        });
    });
};


exports.showout = function (req, res) {
    res.render('out');
};
exports.cha=function (req,res) {
    var id = req.params.id;
    order.find({'fangjian': id}, function (err, results) {
        // console.log(results);
        console.log(id)
        if (results.length == 0) {
            // res.json({'result': -1});
            // return;
            lobby.find({'typenum': id}, function (err, results) {
                console.log(results);
                if (results.length == 0) {
                    res.json({'result': -1});
                    return;
                }
                //呈递页面
                var r1=results[0].RCategory;
                console.log(r1,1111);
                room.find({'name': r1}, function (err, results) {
                    if (results.length == 0) {
                        res.json({"r": -1});
                        return;
                    }

                    var thestudent = results[0];

                    //更改属性
                    thestudent.name = thestudent.name;
                    thestudent.Area = thestudent.Area;
                    thestudent.Bed = thestudent.Bed;
                    thestudent.Breakfast = thestudent.Breakfast;
                    thestudent.Net = thestudent.Net;
                    thestudent.Tv = thestudent.Tv;
                    thestudent.price = thestudent.price;
                    thestudent.RoomAmount = thestudent.RoomAmount;
                    thestudent.LAmount = thestudent.LAmount+1;




                    //持久化
                    thestudent.save(function (err) {

                    });
                });
                res.json({'results': results});
            });
        }
        //呈递页面
        else{
            res.json({'results': results})
            var r2 = results[0].CategoryID;
            console.log(r2,2222)
            room.find({'name': r2}, function (err, results) {
                if (results.length == 0) {
                    res.json({"r": -1});
                    return;
                }

                var thestudent = results[0];

                //更改属性
                thestudent.name = thestudent.name;
                thestudent.Area = thestudent.Area;
                thestudent.Bed = thestudent.Bed;
                thestudent.Breakfast = thestudent.Breakfast;
                thestudent.Net = thestudent.Net;
                thestudent.Tv = thestudent.Tv;
                thestudent.price = thestudent.price;
                thestudent.RoomAmount = thestudent.RoomAmount;
                thestudent.LAmount = thestudent.LAmount+1;




                //持久化
                thestudent.save(function (err) {

                });
            });
        }
    });

};
exports.outdelect=function (req, res) {
    var id = req.params.id;
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        // order.find({"fangjian": id}, function (err, results) {
        //     if (err || results.length == 0) {
        //         res.json({"result": -1});
        //         return;
        //     }
        //
        // });
        // var roomnum = fields.fangjian;
        // console.log(roomnum,1);
        house.find({'sid': id}, function (err, results) {
            if (results.length == 0) {
                res.json({"result": -1});
                return;
            }

            var thestudent = results[0];

            //更改属性

            thestudent.RoomStatus = true;
            //持久化
            thestudent.save(function (err) {
                res.json({"result": 1});
            });
        });
    })
};

exports.guihuan = function (req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        fields.state = true;
        check.addCard(fields, function (result) {
            res.json({"result": result});
        });
    });
};

//图
exports.showIcon = function (req, res) {
    res.render('icon');
};


exports.showIconAll= function (req, res) {
    house.count({}, function (err, count) {
        house.find({}, function (err, results) {
            // res.json({
            //     "results": results[0]
            // });
            res.jsonp(results)

        });
    });
};
//入住记录
exports.seara=function (req, res) {
    res.render('seara');
};
exports.showAw = function (req, res) {
    var id = req.params.id;
    check.find({'CustomerName': id}, function (err, results) {
        console.log(results);
        if (results.length == 0) {

            res.json({'result': -1});
            return;
        }
        //呈递页面
        res.json({'results': results})
    });
};