const jwt=require('jsonwebtoken');
require('dotenv').config();
const userModel=require('../models/user.model');
const blackListModel=require('../models/blackList.model');

const authMiddleware=async (req,res,next)=>{
     try{

        const token=req.cookies.token||req.headers.authorization?.split(" ")[1];

        if(!token){
            return res.status(401).json({message:"Unauthorized: No token provided"});
        }

        const isBlackListed=await blackListModel.findOne({token});

        if(isBlackListed){
            return res.status(401).json({message:"Unauthorized: Token is blacklisted"});
        }

        const decoded=await jwt.verify(token,process.env.JWT_SECRET);
        const user=await userModel.findById(decoded.id);
        req.user=user;
        next();

     }
     catch(err){
        res.status(401).json({message:"Unauthorized: Invalid token"});
     }
}

const systemAuthMiddleware=async (req,res,next)=>{
    try{

        const token=req.cookies.token||req.headers.authorization?.split(" ")[1];

        if(!token){
            return res.status(401).json({message:"Unauthorized: No token provided"});
        }

        const isBlackListed=await blackListModel.findOne({token});

        if(isBlackListed){
            return res.status(401).json({message:"Unauthorized: Token is blacklisted"});
        }

        const decoded=await jwt.verify(token,process.env.JWT_SECRET);
        const user=await userModel.findById(decoded.id).select('+systemUser');

        if(!user.systemUser){
            return res.status(403).json({message:"Forbidden: You are not authorized to access this resource"});
        }

        req.user=user;
        next();

     }
     catch(err){
        res.status(401).json({message:"Unauthorized: Invalid token"});
     }
}

module.exports={authMiddleware,systemAuthMiddleware};
