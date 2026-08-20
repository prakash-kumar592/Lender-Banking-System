const AccountModel=require('../models/account.model');

async function createAccountController(req,res){
    const user=req.user;
    
    const account=await AccountModel.create({
        userId:user._id,
        status:'ACTIVE',
        currency:'INR'
    })

    return res.status(201).json({
        account
    })
}

async function getAccountController(req,res){
    const user=req.user;

    const account=await AccountModel.findOne({userId:user._id,status:'ACTIVE'});

    if(!account){
        return res.status(404).json({
            message:"No active account found for this user"
        })
    }

    return res.status(200).json({
        account
    }) 
}

async function getAccountBalanceController(req,res){
   const accountId=req.params.accountId;

   const account=await AccountModel.findByOne({ _id: accountId , userId:req.user._id});

   if(!account){
     return res.status(404).json({
        "message":"Account not found",
        "status":"failed",
     })
   }

   const balance=await account.getBalance();

   return res.status(200).json({
     balance,
     status:"success"
   })
} 


module.exports={createAccountController,getAccountController,getAccountBalanceController};