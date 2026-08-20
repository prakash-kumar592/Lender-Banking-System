const nodemailer=require('nodemailer');
const htmlContent=require('../config/emailTemplate');

const transporter=nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASS
    }
})

transporter.verify((error,success)=>{
    if(error){
        console.error('Error connecting to email server:',error);
    }else{
        console.log('Email server is ready to send messages');
    }
})

const sendEmail=async ({email,name})=>{
    try{
        await transporter.sendMail({
            from:process.env.EMAIL_USER,
            to:email,
            subject:'Welcome to our platform',
            text:`Hello ${name},\n\nThank you for registering with us. We're excited to have you on board!\n\nBest regards,\nThe Team`,
            html:htmlContent(name)
        });
        console.log(`Welcome email sent to ${email}`);
    }catch(error){
        console.error(`Failed to send welcome email to ${email}:`, error);
        throw new Error('Email sending failed');        
        }
    
}

const sendTransactionEmail=async (email,amount,type)=>{

    await transporter.sendMail({
        from:process.env.EMAIL_USER,
        to:email,
        subject:'Transaction Notification',
        text:`Hello,\n\nYour ${type} transaction of amount ${amount} has been processed successfully.\n\nBest regards,\nThe Team`,
    })
    
}

module.exports={sendEmail,sendTransactionEmail};
