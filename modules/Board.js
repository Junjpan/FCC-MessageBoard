const mongoose=require('mongoose');
const {Schema}=mongoose;

const boardSchema=new Schema({
    "boardname":String,
    "threads":[{type:Schema.Types.ObjectId,ref:"Thread"}]//Schema.Types.Mixed will store all the thread information
});

module.exports=mongoose.model('Board',boardSchema);