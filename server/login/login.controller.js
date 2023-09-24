const Login = require('./login.model');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const secretkey = "secretkey";
const bcrypt = require('bcrypt');
const saltRounds = 10;


exports.loginUser = ((req, res) => {
    let body = {
        email: req.body.email,
        password: req.body.password
    };
    let DB_URL = req.body.DB_URL;
    if (!DB_URL) {
        var ActiveDirectory = require('activedirectory');
        var username = 'uid=' + req.body.email + ',cn=users,cn=accounts,dc=ldapnew,dc=99games,dc=in';
        var password = req.body.password;
        var ad = new ActiveDirectory({
            "url": "ldap://ldapnew.99games.in",
            "baseDN": "dc=ldapnew,dc=99games,dc=in",
            "bindDN": username,
        });
        ad.authenticate(username, password, function (err, auth) {
            if (err) {
                res.status(401).json({
                    'mssg': 'Invalid Credentials!!',
                    'data': false
                })
            }
            if (auth) {
                console.log('Authenticated from Active directory!');
                let token = jwt.sign({
                    auth
                }, secretkey, {
                    expiresIn: 60 * 60 * 24
                });
                res.status(200).json({
                    'token': token,
                    'msg': 'Success',
                    'data': true,
                    'email': body.email + '@99games.in'
                });
            }
        });
    } else {
        //Database connection
        try {
            const con = mongoose.connect(DB_URL,
                {
                    useNewUrlParser: true, useUnifiedTopology: true,
                })
            console.log('Connection successful to provided URL')
        } catch (err) {
            console.log(err)
        }
            Login.findOne({ email: req.body.email}).then(user => {
                if (user) {
                    //if present, compare the password with the stored(hashed) password
                    bcrypt.compare(req.body.password, user.password, (err, result) => {
                        if (err) {
                          console.error('Error comparing passwords:', err);
                          return;
                        }
                        if (result) {
                          //If user credentials are successfully validated, generate jwt token
                          let token = jwt.sign({
                            user
                        }, secretkey, {
                            expiresIn: 60 * 60 * 24
                        });
                            // Allow access to the user
                        res.status(200).json({
                            'token': token,
                            'email': user['_doc']['email']
                        });
                      
                        } else {
                        // Deny access to the user
                          res.status(401).json({
                            'mssg': 'Incorrect Password!'
                        });
                        }
                      });
                } else {
                    res.status(401).json({
                        'mssg': 'Invalid credentials!'
                    });
                }
            })
    }
})

exports.authenticateConfigUser = (req, res, next) => {
    let token = jwt.sign({}, secretkey, {
        expiresIn: 60 * 60 * 24
    });
    res.status(200).json({
        'token': token
    });
};


exports.addUser = ((req, res) => {
    let DB_URL = req.body.DB_URL;
    if (DB_URL) {
        try {
            const con = mongoose.connect(DB_URL,
                {
                    useNewUrlParser: true, useUnifiedTopology: true,
                })
            console.log('Connection successful to provided URL')
        } catch (err) {
            console.log(err)
        }
        bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
            if (err) {
                console.error('Error hashing password:', err);
                return;
            }
            var data = new Login({
                email: req.body.email,
                password: hash
            })
            data.save()
                .then((doc) => {
                    res.status(200).json();
                })
                .catch((err) => {
                    res.status(404).json({
                        mssg: 'Unable to add user details'
                    })
                })
        });
    }
})

exports.removeUser = ((req,res) => {
    let DB_URL = req.body.DB_URL;
    if (DB_URL) {
        try {
            const con = mongoose.connect(DB_URL,
                {
                    useNewUrlParser: true, useUnifiedTopology: true,
                })
            console.log('Connection successful to provided URL')
        } catch (err) {
            console.log(err)
        }
        Login.findOneAndDelete({ email: req.body.email}).then(user => {
            if(user){
                res.status(200).json({
                    'mssg':'User deleted successfully'
                })
            } else {
                res.status(401).json({
                    'mssg': 'User not found!'
                });
            }
        })

    }
})

exports.resetPwd = ((req,res) => {
    let DB_URL=req.body.DB_URL;
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'haa39610@gmail.com',
          pass: 'amanha110'
        }
      });
      const mailOptions = {
        from: 'haa39610@gmail.com',
        to: 'aman163690@gmail.com',
        subject: 'Hello from Nodemailer',
        text: 'This is a test email sent from Nodemailer.',
      };
    if (DB_URL) {
        try {
            const con = mongoose.connect(DB_URL,
                {
                    useNewUrlParser: true, useUnifiedTopology: true,
                })
            console.log('Connection successful to provided URL')
        } catch (err) {
            console.log(err)
        }
        Login.findOne({ email: req.body.email}).then(user => {
            if(user){
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                      console.error('Error sending email:', error);
                    } else {
                      console.log('Email sent:', info.response);
                    }
                  });
                res.status(200).json({
                    'mssg':'User is present'
                })
            } else {
                res.status(401).json({
                    'mssg': 'User not found!'
                });
            }
        })

    }
})