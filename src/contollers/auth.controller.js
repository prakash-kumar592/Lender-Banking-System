const userModel = require("../models/user.model");
const jwt=require('jsonwebtoken');
require('dotenv').config();
const sendEmail=require('../utils/emailService');
const blackListModel=require('../models/blackList.model');

const registerController = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "Please enter all fields",
      status: "failed",
    });
  }



  const AlreadyExistingUser = await userModel.findOne({ email });
  
  if (AlreadyExistingUser) {
    return res.status(400).json({
      message: "User already exists",
      status: "failed",
    });
  }


  const newUser=await  userModel.create({
    email,name,password
  })

  await sendEmail.sendEmail({email,name});


  const token=await jwt.sign({id:newUser._id},process.env.JWT_SECRET,{
    expiresIn:'3d'
  })

  res.cookie('token',token,{
        httpOnly:true,
        maxAge:3*24*60*60*1000
  })

  return res.status(201).json({
    user:{
        _id:newUser._id,
        email:newUser.email,
        name:newUser.name
    },
    status:"success",
  })
};


const loginController=async(req,res)=>{
    const {email,password}=req.body;

    if(!email || !password){
        return res.status(400).json({
            message:"Please enter all fields",
            status:"failed"
        })
    }

    const user=await userModel.findOne({email}).select('+password');

    if(!user){
        return res.status(400).json({
            message:"User does not exist",
            status:"failed"
        })
    }
        
    const isPasswordMatched=await user.comparePassword(password);

    if(!isPasswordMatched){
        return res.status(400).json({
            message:"Invalid credentials",
            status:"failed"
        })  
    }

    const token=await jwt.sign({id:user._id},process.env.JWT_SECRET,{
        expiresIn:'3d'
    })

    res.cookie('token',token,{
        httpOnly:true,
        maxAge:3*24*60*60*1000
    })

    return res.status(200).json({
        user:{
            _id:user._id,
            email:user.email,
            name:user.name
        },
        status:"success",
    })
}

const logoutController=async(req,res)=>{
   const token=req.cookies.token||req.headers.authorization?.split(" ")[1];

   if(!token){
      return res.status(400).json({
        message:"No token provided",
        status:"failed"
      })
   }

   res.clearCookie('token');

   await blackListModel.create({token});

   return res.status(200).json({
     message:"Logged out successfully",
      status:"success"
   })
}


module.exports = { registerController, loginController, logoutController };   
