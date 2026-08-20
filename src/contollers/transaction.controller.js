const transactionModel=require('../models/transaction.model');
const accountModel=require('../models/account.model');
const ledgerModel=require('../models/ledger.model');
const mongoose=require('mongoose');
const Email=require('../utils/emailService');


async function createTransactionController(req,res){
    const {fromAccount,toAccount,amount,idempotencyKey}=req.body;

    if(!fromAccount || !toAccount || !amount || !idempotencyKey){
        return res.status(400).json({
            message:"Please enter all fields",
            status:"failed"
        })
    }

    fromAccountExists=await accountModel.findById(fromAccount);
    toAccountExists=await accountModel.findById(toAccount).populate('userId', 'email');

    if(!fromAccountExists || !toAccountExists){
        return res.status(400).json({
            message:"Invalid account IDs",
            status:"failed"
        })
    }
    
    const isTransactionExists=await transactionModel.findOne({idempotencyKey});

    if(isTransactionExists){
        if(isTransactionExists.status==='COMPLETED'){
            return res.status(200).json({
                message:"Transaction already completed",
                status:"success",
                transaction:isTransactionExists
            })
        }

        else if(isTransactionExists.status==='PENDING'){
            return res.status(200).json({
                message:"Transaction is pending",
                status:"success",
                transaction:isTransactionExists
            })
        }

        else if(isTransactionExists.status==='FAILED'){
            return res.status(200).json({
                message:"Transaction failed",
                status:"failed",
                transaction:isTransactionExists
            })
        }

        else if(isTransactionExists.status==='REVERSED'){
            return res.status(200).json({
                message:"Transaction is reversed",
                status:"failed",
                transaction:isTransactionExists
            })
        }
    }
    
    // check Account status
    if(fromAccountExists.status!=='ACTIVE' || toAccountExists.status!=='ACTIVE'){
        return res.status(400).json({
            message:"One or both accounts are not active",
            status:"failed"
        })
    }

    // Derive sender balance from ledger
    const senderBalance=await fromAccount.getBalance();

    if(senderBalance<amount){
        return res.status(400).json({
            message:"Insufficient balance",
            status:"failed"
        })
    }

    // create transaction

    const session=await mongoose.startSession();
    session.startTransaction();
    const transaction=await transactionModel.create([{
        fromAccount,
        toAccount,
        amount,
        idempotencyKey,
        status:'PENDING'
    }],{ session })[0]

    const debitLedgerEntry=await mongoose.create([{
        account:fromAccount,
        type:'DEBIT',
        amount,
        transaction:transaction._id
    }],{ session })

    const creditLedgerEntry=await mongoose.create([{
        account:toAccount,
        type:'CREDIT',
        amount,
        transaction:transaction._id
    }],{ session })

    transaction.status='COMPLETED';
    await transaction.save({ session });
    
    await session.commitTransaction();
    session.endSession(); 

    // send Email to both partries about transaction completion

    const senderEmail=req.user.email;
    const receiverEmail=toAccountExists.userId.email;

    await Email.transactionEmail({
        email:senderEmail,
        amount,
        type:'DEBIT'
    })

    await Email.transactionEmail({
        email:receiverEmail,
        amount,
        type:'CREDIT'
    })

    // email has been sent to both parties about transaction completion

    return res.status(201).json({
        message:"Transaction completed successfully",
        status:"success",
        transaction
    })
}

async function createSystemTransactionController(req,res){
    const {toAccount,amount,idempotencyKey}=req.body;

    if(!toAccount || !amount || !idempotencyKey){
        return res.status(400).json({
            message:"Please enter all fields",
            status:"failed"
        })
    }

    toAccountExists=await accountModel.findById(toAccount).populate('userId', 'email');

    if(!toAccountExists||toAccountExists.status!=='ACTIVE'){
        return res.status(400).json({
            message:"Invalid account ID",
            status:"failed"
        })
    }

    const fromAccount=await accountModel.findOne({systemUser:true});

    if(!fromAccount){
        return res.status(400).json({
            message:"System account not found",
            status:"failed"
        })
    }

    const isTransactionExists=await transactionModel.findOne({idempotencyKey});

    if(isTransactionExists){
        if(isTransactionExists.status==='COMPLETED'){
            return res.status(200).json({
                message:"Transaction already completed",
                status:"success",
                transaction:isTransactionExists
            })
        }

        else if(isTransactionExists.status==='PENDING'){
            return res.status(200).json({
                message:"Transaction is pending",
                status:"success",
                transaction:isTransactionExists
            })
        }

        else if(isTransactionExists.status==='FAILED'){
            return res.status(200).json({
                message:"Transaction failed",
                status:"failed",
                transaction:isTransactionExists
            })
        }

        else if(isTransactionExists.status==='REVERSED'){
            return res.status(200).json({
                message:"Transaction is reversed",
                status:"failed",
                transaction:isTransactionExists
            })
        }
    }

    // create transaction

    const session=await mongoose.startSession();
    session.startTransaction();
    const transaction=await transactionModel.create({
        fromAccount,
        toAccount,
        amount,
        idempotencyKey,
        status:'PENDING'
    },{session})[0]

    const debitLedgerEntry=await ledgerModel.create([{
        account:fromAccount,
        type:'DEBIT',
        amount,
        transaction:transaction._id
    }],{ session })

    const creditLedgerEntry=await ledgerModel.create([{
        account:toAccount,
        type:'CREDIT',
        amount,
        transaction:transaction._id
    }],{ session })

    transaction.status='COMPLETED';
    await transaction.save({ session });
    
    await session.commitTransaction();
    session.endSession();

    // send Email to both partries about transaction completion

    const senderEmail=fromAccount.populated('userId').userId.email;
    const receiverEmail=toAccountExists.populated('userId').userId.email;

    await Email.transactionEmail({
        email:senderEmail,
        amount,
        type:'DEBIT'
    })

    await Email.transactionEmail({
        email:receiverEmail,
        amount,
        type:'CREDIT'
    })

    // email has been sent to both parties about transaction completion

    return res.status(201).json({
        message:"Transaction completed successfully",
        status:"success",
        transaction
    })
}

module.exports={createTransactionController, createSystemTransactionController};