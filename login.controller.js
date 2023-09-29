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
        Login.findOne({ email: req.body.email }).then(user => {
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

// exports.authenticateConfigUser = (req, res, next) => {
//     let token = jwt.sign({}, secretkey, {
//         expiresIn: 60 * 60 * 24
//     });
//     res.status(200).json({
//         'token': token
//     });
// };


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

        Login.findOne({ email: req.body.email }).then(user=>{
            if(user){
                return res.status(409).json({
                    mssg:'User already present!'
                })
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
        })
      
    }
})

exports.removeUser = ((req, res) => {
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
        Login.findOneAndDelete({ email: req.body.email }).then(user => {
            if (user) {
                res.status(200).json({
                    'mssg': 'User deleted successfully'
                })

            } else {
                res.status(401).json({
                    'mssg': 'User not found!'
                });
            }
        })

    }
})

exports.generateCode = ((req, res) => {
    let resetCode;
    let DB_URL = req.body.DB_URL;
    // let transporter = nodemailer.createTransport({
    //     service: 'gmail',
    //     auth: {
    //       type: 'OAuth2',
    //       user: 'aman.ha@99games.in',
    //       pass: 'aman@99games',
    //       clientId: '840220904586-4f8gj92fjrcs0fe5o5900uvtfs93ndcl.apps.googleusercontent.com',
    //       clientSecret: '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',
    //       refreshToken: '1//04zL_vhAbb-HWCgYIARAAGAQSNwF-L9Irx1MMjkXbh7eHns0E3nIv4Bt8KZbRxQ3Vfi0SOMQOSLnS-uBc9C-k4vSUplqrqsjgDiQ'
    //     }
    //   });

    let mailConfig = {
        host: "mail3.99games.in",
        port: 587,
        secure: false,
        auth: {
            user: 'donotreply',
            pass: 'Replay#67',
        }
    };
    let transporter = nodemailer.createTransport(mailConfig);

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
        Login.findOne({ email: req.body.email }).then(user => {
            if (user) {
                resetCode = generateRandom4DigitNumber();
                user.resetCode = resetCode;
                user.resetCodeExpiration = Date.now() + 3600000;
                user.save();
                const mailOptions = {
                    from: 'donotreply@99games.in',
                    to: 'aman.ha@99games.in',
                    subject: 'Password Reset Verification Code',
                    text: `Your code for reset password is ${resetCode}`,
                };

                // transporter.sendMail(mailOptions, (error, info) => {
                //     if (error) {
                //       console.error('Error sending password reset email:', error);
                //       return;
                //     } else {
                //       console.log('Password reset email sent:');
                //     }
                //   });

                res.status(200).json({});

            } else {
                res.status(401).json({
                    'mssg': 'User not found!'
                });

            }
        })

    }
})

exports.verifyCode = ((req, res) => {
    let DB_URL = req.body.DB_URL;
    let code = req.body.code;
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
    }
    Login.findOne({ email: req.body.email, resetCodeExpiration: { $gt: Date.now() } }).then((user) => {
        if (!user) {
            return res.status(400).json({ 'mssg': 'Verification code has expired!' });
        }
        if (code == user['_doc']['resetCode']) {
            res.status(200).json({
                mssg: 'Verification successfull'
            })

        } else {
            res.status(401).json({
                'mssg': 'Invalid code!'
            });
        }
    })
})

exports.resetPwd = ((req, res) => {
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
    }
    bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
        if (err) {
            console.error('Error hashing password:', err);
            return;
        }
        Login.updateOne({ email: req.body.email }, { $set: { password: hash, resetCode: null, resetCodeExpiration: null } }).then(() => {
            res.status(200).json({
                msg: 'Password updated successfully!'
            });

        })
            .catch((err) => {
                res.status(404).json({
                    mssg: 'Unable to update password!'
                })
            })
    });

})


function generateRandom4DigitNumber() {
    const min = 1000;
    const max = 9999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
