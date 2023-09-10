const Login=require('./login.model')
const mongoose=require('mongoose')
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')
const secretkey="secretkey";

exports.loginUser=((req,res)=>{
    var enteredEmail =req.body.email;
    var password=req.body.password;
    var DB_URL=req.body.DB_URL;
    if(DB_URL===""){
        try{
            const con= mongoose.connect('mongodb://0.0.0.0:27017/test2',
            {
                useNewUrlParser: true, useUnifiedTopology: true,
            })
            console.log('Connection successful')
        }catch(err){
            console.log(err)
        }
    } else {
        try{
            const con= mongoose.connect(DB_URL,
            {
                useNewUrlParser: true, useUnifiedTopology: true,
            })
            console.log('Connection successful')
        }catch(err){
            console.log(err)
        }
    }
    
    Login.findOne({email:enteredEmail})
    .then(user =>{
        if(user){
            if(user.password===password){
            jwt.sign({user},secretkey,{expiresIn:'300s'},(err,token)=>{
                res.json({
                    message:'Login Successful',
                    status:200,
                    token:token
                })
            })
            }
                else{
                    res.send({
                    message:'Incorrect password',
                    status:404
                    })
            }
        }else{ 
            res.json({
                message:'User not found',
                status:404
            })
        }
    })
    })

    exports.exm=((req,res)=>{
       jwt.verify(req.token,secretkey,(err,authData)=>{
        if(err){
            res.send({
                result:"Invalid token"
            })
        }else{
            res.json({
                message:"Sucess",
                authData
            })
        }
       })
    })
