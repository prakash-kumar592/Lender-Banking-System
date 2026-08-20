const express=require('express');

const Middleware=require('../middleware/auth.middleware');
const accountController=require('../contollers/account.controller');

const router=express.Router();

router.post('/',Middleware.authMiddleware,accountController.createAccountController);
router.get('/',Middleware.authMiddleware,accountController.getAccountController);
// api/account/balance/:accountId

router.get('/balance/:accountId',Middleware.authMiddleware,accountController.getAccountBalanceController);

module.exports=router;