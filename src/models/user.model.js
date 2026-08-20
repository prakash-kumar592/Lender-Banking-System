const mongoose=require('mongoose');
const bcrypt=require('bcryptjs')

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true, "Please enter your name"],
        trim:true
    },

    email:{
        type:String,
        required:[true, "Please enter your email"],
        unique:true,
        trim:true
    },

    password:{
        type:String,
        required:[true, "Please enter your password"],
        minlength:[6, "Password must be at least 6 characters long"],
        select:false
    },

    systemUser:{
        type:Boolean,
        default:false,
        immutable:true
    }

},{timestamps:true});


userSchema.pre('save',async  function(){
    if(this.isModified('password')){
        this.password= await bcrypt.hash(this.password,10);
    }
});

userSchema.methods.comparePassword=async function(Password){
    return await bcrypt.compare(Password,this.password);
}

const userModel=mongoose.model('User', userSchema);

module.exports=userModel;