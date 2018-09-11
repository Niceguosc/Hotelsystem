//引用mongoose
var mongoose = require('mongoose');

//加密模块
var crypto = require('crypto');


//定义用户的schema
var userSchema = mongoose.Schema({
    //用户名
    yonghuming: String,
    //密码
    mima : String
});

//定义用户的model
var user = mongoose.model('user', userSchema);

//通过名字寻找用户
exports.findUserByName = function(yonghuming , callback){
    user.findOne({"yonghuming" : yonghuming} , function(err,doc){
        callback(err,doc);
    });
}

//添加user
exports.adduser = function(yonghuming,mima,callback){
    //先给密码加密
    var jiamidemima = crypto.createHmac('sha256', mima).digest('hex');
    //向数据库保存
    user.create({"yonghuming" : yonghuming , "mima" : jiamidemima},function(err,doc){
        callback(err,doc)
    });
}

//追加属性
exports.addShuxing = function(yonghuming,k,v,callback){
    user.findOne({"yonghuming":yonghuming},function(err,doc){
        if(err){
            return;
        }
        if(!doc){
            return;
        }
        doc[k] = v;
        doc.save(callback);
    });
}

//得到某个属性
exports.getK = function(yonghuming,k,callback){
    user.findOne({"yonghuming":yonghuming},function(err,doc){
        callback(err,doc[k]);
    });
};

exports.changepw = function(yonghuming,mima,callback){
    user.findOne({"yonghuming" : yonghuming},function(err,results){
        if(err){
            callback("服务器错误！请检查输入的内容！");
            return;
        }
        console.log(results)
        if(results.length == 0){
            //-1表示你要更改的学生学号，我没有找到
            callback("没有找到这个学号");
        }else{
            thestudent  = results;

            console.log(thestudent.mima,1);
            console.log(mima,2);
            var sha256 = crypto.createHash("sha256");
            //加密字符串，digest表示进一步处理为hex十六进制
            thestudent.mima = sha256.update(mima).digest("hex");
            thestudent.save();
            console.log(thestudent.mima,3);
            callback("成功修改！");
        }
    });
};