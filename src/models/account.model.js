const mongoose=require('mongoose');
const ledgerModel=require('./ledger.model');

const accountSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:[true,"User ID is required"],
        index:true
    },

    status:{
        type:String,
        enum:{
            values:['ACTIVE','CLOSED','FROZEN'],
            message:"Status must be either ACTIVE, CLOSED, or FROZEN",
            default:'ACTIVE'
        }
    },

    currency:{
        type:String,
        required:[true,"Currency is required"],
        default:'INR',
    },
    
},{timestamps:true});

accountSchema.index({userId:1,status:1});

accountSchema.methods.getBalance=async function(){
   
    const balanceData=await ledgerModel.aggregate([
        {$match:{account:this._id,}},
        {$group:{_id:null,balance:{$sum:{$cond:[{$eq:["$type","CREDIT"]},"$amount",{$multiply:["$amount",-1]}]}}}}
    ])

    if(!balanceData || balanceData.length===0){
        return 0;
    }

    return balanceData[0].balance;
}

const accountModel=mongoose.model('account',accountSchema);

module.exports=accountModel;