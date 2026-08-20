const mongoose=require('mongoose');

const blackListSchema=new mongoose.Schema({
    token:{
        type:String,
        required:[true,"Token is required"],
        unique:true,
        index:true
    },
    blackListedAt:{
        type:Date,
        default:Date.now,
        immutable:true
    }
},{timestamps:true});

blackListSchema.index({created_at:1},
    {expireAfterSeconds:60*60*24*7}); // 7 days

const blacklistModel=mongoose.model('blackList',blackListSchema);

module.exports=blacklistModel;
