var mongoose = require('mongoose');

var roomSchema = mongoose.Schema({
    CategoryID:Number,
    name:String,
    Area:Number,
    Bed:Number,
    Breakfast:String,
    Net:String,
    Tv:String,
    price:Number,
    RoomAmount:Number,
    LAmount:Number,
    state:Number,

});

roomSchema.statics.addCard =function (json, callback) {
    room.checkSid(json.name,function (torf) {
        if (torf){
            var s= new room(json);

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

roomSchema.statics.checkSid = function (name, callback) {
    this.find({'name':name},function (err, results) {
        callback(results.length == 0);
    })
};


var room = mongoose.model('room', roomSchema);

module.exports =room;