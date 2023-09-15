const mongoose=require('mongoose')

var schema=new mongoose.Schema({
    email:{
        type:String,
    },
    password:{
        type:String,
    }
})

module.exports=new mongoose.model('tests',schema)