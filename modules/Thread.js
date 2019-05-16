const mongoose=require('mongoose');
const {Schema}=mongoose;

const ThreadSchema=new Schema({
    "boardname":String,
    "text":String,
    "created_on":{type:Date,default:new Date()},
    "bumped_on":{type:Date,default:new Date()},
    "reported":{
        type:Boolean,
        default:false
    },
    "delete_password":String,
    "replycount":{type:Number,default:0},
    "replies":[{type:Schema.Types.ObjectId,ref:'Reply'}],
})

module.exports=mongoose.model('Thread',ThreadSchema);