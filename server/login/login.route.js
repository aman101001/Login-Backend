const express=require('express');
const route=express.Router();
const login=require('./login.controller');
// const verify =require ('../auth.controller');

// function verifyToken(req,res,next){
//     const bearerHeader = req.headers['authorization']
//     if(typeof bearerHeader !== 'undefined'){
//         const bearer = bearerHeader.split(' ');
//         const token = bearer[1]
//         req.token=token
//         next();
//     } else {
//         res.send({
//             res:'Token is not valid'
//         })
        
//     }
// }
route.post('/login',login.loginUser);
route.post('/addUser',login.addUser);
route.post('/authenticate',login.authenticateConfigUser)
route.post('/removeUser',login.removeUser);
module.exports=route