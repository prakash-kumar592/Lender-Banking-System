const mongoose=require('mongoose');

const ledgerSchema=new mongoose.Schema({

    account:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'account',
        required:[true,"Account ID is required"],
        index:true,
        immutable:true
    },

    amount:{
        type:Number,
        required:[true,"Amount is required"],
        min:[1,"Amount must be greater than 0"],
        immutable:true
    },

    transaction:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'transaction',
        required:[true,"Transaction ID is required"],
        index:true,
        immutable:true
    },

    type:{
        type:String,
        enum:['CREDIT','DEBIT'],
        required:[true,"Type is required"],
        immutable:true
    }
},{timestamps:true});


function preventLedger(){
    throw new Error("Ledger entries cannot be modified or deleted");
}

ledgerSchema.pre('updateOne',preventLedger);
ledgerSchema.pre('deleteOne',preventLedger);
ledgerSchema.pre('findOneAndUpdate',preventLedger);
ledgerSchema.pre('findOneAndDelete',preventLedger);
ledgerSchema.pre('updateMany',preventLedger);
ledgerSchema.pre('deleteMany',preventLedger);
ledgerSchema.pre('findOneAndRemove',preventLedger);
ledgerSchema.pre('remove',preventLedger);
ledgerSchema.pre('findOneAndReplace',preventLedger);
ledgerSchema.pre('replaceOne',preventLedger);


const ledgerModel=mongoose.model('ledger',ledgerSchema);

module.exports=ledgerModel;