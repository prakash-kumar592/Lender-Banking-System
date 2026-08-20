const express=require('express');
const cors=require('cors');
const cookieParser=require('cookie-parser');

const authRouter=require('./routes/auth.routes');
const accountRouter=require('./routes/account.routes');
const transactionRouter=require('./routes/transaction.routes');

const app=express();
app.use(cookieParser());

app.use(express.json());
app.use(cors({
    origin:'*',
    methods:['GET','POST','PUT','DELETE'],
}))

app.get('/',(req,res)=>{
  res.send('Welcome to the Banking System API');
})

app.use('/api/auth',authRouter);
app.use('/api/account',accountRouter);
app.use('/api/transaction',transactionRouter);

module.exports=app;