var mongoose = require('mongoose');

var OrderSchema = mongoose.Schema({
    OrderID:Number,
    EnterTime:String,
    LeaveTime:String,
    CategoryID:String,
    Amount:Number,
    CustomerName:String,
    Price:Number,
    LinkMan:String,
    PhoneNumber:Number,
    OrderRemarks:String,
    Orderstatus:Number,
    fangjian:String,
    shenfen: String,
    hao: String,
    sex: String
});

OrderSchema.statics.addCard =function (json, callback) {
    // console.log(json)
    var s= new order(json);

    s.save(function (err) {
        if (err){
            callback(-2);
            return;
        }

        callback(1);
    })
};

// OrderSchema.statics.checkSid = function (sid, callback) {
//     this.find({'sid':sid},function (err, results) {
//         callback(results.length == 0);
//     })
// }


var order = mongoose.model('order', OrderSchema);

module.exports =order;