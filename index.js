const express=require('express')
const app=express();
const bodyParser=require('body-parser')
const cors = require('cors');
var fs = require('fs');
var https = require('https');

let SERVER = "LOCAL"
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())


app.use(cors());
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

if(SERVER === "TESTING"){
    var options = {
        key: fs.readFileSync('/etc/ssl/certs/nopass.key'),
        cert: fs.readFileSync('/etc/ssl/certs/server.cer'),
    };
}


app.use(require('./server/login/login.route.js'))

if(SERVER === "TESTING"){
    const PORT=8091;
    var server = https.createServer(options, app).listen(PORT, function () {
        console.log("Express server listening on port " + PORT );
    });
    
}
if(SERVER === "LOCAL"){
    app.listen(8091,()=>{
        console.log('Server started')
    })
}
