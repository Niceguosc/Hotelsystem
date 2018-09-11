var mongoose = require('mongoose');

var customerSchema = mongoose.Schema({
    sid:Number,
    IDCategory:String,
    name:String,
    sex:String

});

customerSchema.statics.addCard =function (json, callback) {
    custome.checkSid(json.sid,function (torf) {
        if (torf){
            var s= new custome(json);

            s.save(function (err) {
                if (err){
                    callback(-2);
                    return;
                }

                callback(1);
            })
        } else{
            callback(-1);
        }
    })
};

customerSchema.statics.checkSid = function (sid, callback) {
    this.find({'sid':sid},function (err, results) {
        callback(results.length == 0);
    })
}


var custome = mongoose.model('custome', customerSchema);

module.exports =custome;