const express=require('express');

const router=express.Router();
const middleware=require('../middleware/auth.middleware');
const transactionController=require('../contollers/transaction.controller');

router.post('/',middleware.authMiddleware,transactionController.createTransactionController);
router.post('/system/initial-fund',middleware.systemAuthMiddleware,transactionController.createSystemTransactionController);

module.exports=router;