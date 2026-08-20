const mongoose=require('mongoose');

const transactionSchema=new mongoose.Schema({
    fromAccount:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'account',
        required:[true,"From Account ID is required"],
        index:true
    },

    toAccount:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'account',
        required:[true,"To Account ID is required"],
        index:true
    },

    amount:{
        type:Number,
        required:[true,"Amount is required"],
        min:[1,"Amount must be greater than 0"]
    },

    status:{
        type:String,
        enum:['PENDING','COMPLETED','FAILED','REVERSED'], 
        default:'PENDING',
    },

    idempotencyKey:{
        type:String,
        required:[true,"Idempotency Key is required"],
        unique:true,
        index:true
    }
},{timestamps:true});       
 
const transactionModel=mongoose.model('transaction',transactionSchema);

module.exports=transactionModel;