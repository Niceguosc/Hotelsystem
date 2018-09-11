var mongoose=require('mongoose');
var lobbySchema=new mongoose.Schema({
    IDname:String,
    IDcard:String,
    name:String,
    sex:String,
    RCategory:String,
    typenum:String,
    shengyu:String,
    price:String,
    name2:String,
    EnterTime:String,
    LeaveTime:String,
})

lobbySchema.statics.addlobby = function(json,callback){
	lobby.checkSid(json._id,function(torf){
		if(torf){
			var s = new lobby(json);
			s.save(function(err){
				if(err){
					callback(-2);
					return;
				}
				callback(1);
			});
		}else{
			callback(-1);
		}
	});
}


lobbySchema.statics.checkSid = function(_id,callback){
	this.find({"_id" : _id} , function(err,results){
		callback(results.length == 0);
	});
}


var lobby = mongoose.model("lobby",lobbySchema);
module.exports = lobby;
