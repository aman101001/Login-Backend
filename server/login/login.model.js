const mongoose=require('mongoose')

var schema=new mongoose.Schema({
    email:{
        type:String,
    },
    password:{
        type:String,
    },
    resetCode:{
        type:String,
    },
    resetCodeExpiration:{
        type:Date
    }
})

module.exports=new mongoose.model('users',schema)