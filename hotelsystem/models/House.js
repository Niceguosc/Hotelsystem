var mongoose = require('mongoose');

var houseSchema = mongoose.Schema({
    sid:Number,
    RCategory:String,
    RLocation:String,
    RoomRemarks:String,
    RoomStatus:Boolean

});

houseSchema.statics.addCard =function (json, callback) {
    house.checkSid(json.sid,function (torf) {
        if (torf){
            var s= new house(json);

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

houseSchema.statics.checkSid = function (sid, callback) {
    this.find({'sid':sid},function (err, results) {
        callback(results.length == 0);
    })
}


var house = mongoose.model('house', houseSchema);

module.exports =house;