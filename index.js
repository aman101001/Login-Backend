const express=require('express')
const app=express();
const bodyParser=require('body-parser')
const cors = require('cors');
const mongoose=require('mongoose')
const jwt =require('jsonwebtoken');

app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())

app.use(cors());
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

// try{
//     const con= mongoose.connect('mongodb://0.0.0.0:27017/student',
//     {
//         useNewUrlParser: true, useUnifiedTopology: true,
//     })
//     console.log('Connection successful')
// }catch(err){
//     console.log(err)
// }

app.use(require('./server/login/login.route.js'))

app.listen(8080,()=>{
    console.log('Server started')
})