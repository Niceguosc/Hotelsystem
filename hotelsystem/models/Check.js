var mongoose = require('mongoose');

var CheckSchema = mongoose.Schema({
    RecordID:Number,
    RoomID:Number,
    CID:String,
    CustomerName:String,
    EnterTime:String,
    LeaveTime:String,
    Monetary:Number

});

CheckSchema.statics.addCard =function (json, callback) {
    // check.checkSid(json.sid,function (torf) {
    //     if (torf){
    //         var s= new check(json);
    //
    //         s.save(function (err) {
    //             if (err){
    //                 callback(-2);
    //                 return;
    //             }
    //
    //             callback(1);
    //         })
    //     } else{
    //         callback(-1);
    //     }
    // })
    var s= new check(json);

    s.save(function (err) {
        if (err){
            callback(-2);
            return;
        }

        callback(1);
    })
};

// CheckSchema.statics.checkSid = function (sid, callback) {
//     this.find({'sid':sid},function (err, results) {
//         callback(results.length == 0);
//     })
// }


var check = mongoose.model('check', CheckSchema);

module.exports =check;