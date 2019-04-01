const mongoose = require('mongoose');
const shortid = require('shortid');
const time = require('./../libs/timeLib');
const response = require('./../libs/responseLib');
const logger = require('./../libs/loggerLib');
const validateInput = require('../libs/paramsValidationLib');
const check = require('../libs/checkLib');
const passwordLib = require('./../libs/generatePasswordLib');
const token = require('./../libs/tokenLib');
const mailer = require('./../libs/mailerLib');
const appConfig = require("../../config/appConfig");
const randomstring = require('randomstring');
const events = require('events');
const eventEmitter = new events.EventEmitter();
eventEmitter.setMaxListeners(100);
/* Models */
const UserModel = mongoose.model('User');
const AuthModel = mongoose.model('Auth');

//Create an event handler:
let mailEventHandler = (data) => {
    logger.info(`mailEventHandler called for ${data.email}`, 'mailEventHandler', 10)
    mailer.autoEmail(data.email, data.message, data.html);
}

//Assign the event handler to an event
eventEmitter.on('mail', mailEventHandler);


// Get single user details
let getSingleUser = (req, res) => {
    if (check.isEmpty(req.body.userId)) {
        logger.error("userId is missing", "UserController:getSingleUser()", 10);
        let apiResponse = response.generate(true, "UserId is missing", 400, null);
        res.send(apiResponse);
    } else {
        UserModel.findOne({
                'userId': req.params.userId
            })
            .select('-secretToken -active -createdOn -userId -__v -_id')
            .lean()
            .exec((err, result) => {
                if (err) {
                    // handle the error in db connect
                    logger.error(err.message, 'User Controller: getSingleUser', 10)
                    let apiResponse = response.generate(true, 'Failed To Find User Details', 500, null)
                    res.send(apiResponse)
                }
                //check for empty
                else if (check.isEmpty(result)) {
                    logger.info('No User Found', 'User Controller:getSingleUser')
                    let apiResponse = response.generate(true, 'No User Found', 403, null)
                    res.send(apiResponse)
                } else {
                    let apiResponse = response.generate(false, 'User Details Found', 200, result)
                    res.send(apiResponse)
                }
            })
    }
} // end get single user

// edit single user details
let editUser = (req, res) => {
    if (check.isEmpty(req.params.userId)) {
        logger.error("userId is missing", "UserController:editUser()", 10);
        let apiResponse = response.generate(true, "UserId is missing", 400, null);
        res.send(apiResponse);
    } else {
        let options = req.body;
        UserModel.updateMany({
            'userId': req.params.userId
        }, options).exec((err, result) => {
            // handle the error in db connect
            if (err) {
                logger.error(err.message, 'UserController:editUser()', 10)
                let apiResponse = response.generate(true, 'Failed To edit user details', 500, null)
                res.send(apiResponse)
            }
            //check for empty
            else if (check.isEmpty(result)) {
                logger.info('No User Found', 'UserController:editUser()')
                let apiResponse = response.generate(true, 'No User Found', 403, null)
                res.send(apiResponse)
            } else {
                let apiResponse = response.generate(false, 'User details edited', 200, result)
                res.send(apiResponse)
            }
        }); // end user model update
    }
} // end edit user

// start user signup function 
let signUpFunction = (req, res) => {

    //check the parameter(s) and then email and password regex
    let validateUserInput = () => {
        return new Promise((resolve, reject) => {
            //check paramter
            if (!(check.isEmpty(req.body.firstName)) && !(check.isEmpty(req.body.lastName)) && !(check.isEmpty(req.body.userName)) && !(check.isEmpty(req.body.email)) && !(check.isEmpty(req.body.countryName)) && !(check.isEmpty(req.body.mobileNumber)) && !(check.isEmpty(req.body.password))) {
                //check email requirement
                if (!validateInput.Email(req.body.email)) {
                    logger.error('Email Does not met the requirement', 'userController:signUpFunction.createUser()', 5)
                    let apiResponse = response.generate(true, 'Email Does not met the requirement', 400, null)
                    reject(apiResponse)
                }
                //end inner if
                //check password requirement
                else if (!validateInput.Password(req.body.password)) {
                    logger.error('password Does not met the requirement', 'userController:signUpFunction.createUser()', 5)
                    let apiResponse = response.generate(true, 'password Does not met the requirement', 400, null)
                    reject(apiResponse)
                }
                //end inner else-if
                else {
                    resolve(req)
                }
                //end inner else
            } //end if
            else {
                logger.error('Field Missing During User Creation', 'userController:signUpFunction.createUser()', 5)
                let apiResponse = response.generate(true, 'One or More Parameter(s) is missing', 400, null)
                reject(apiResponse)
            } //end else
        }) //end promise
    } // end validate user input

    //check user name for unique
    let checkUserName = () => {
        return new Promise((resolve, reject) => {
            UserModel.findOne({
                    userName: req.body.userName
                })
                .exec((err, result) => {
                    // handle the error in db connect
                    if (err) {
                        logger.error(err.message, 'userController:signUpFunction.checkUserName', 10)
                        let apiResponse = response.generate(true, 'Failed To Find the UserName', 500, null)
                        reject(apiResponse)
                    } //check for empty
                    else if (check.isEmpty(result)) {
                        resolve(req)
                    } else {
                        logger.info('User Cannot Be Created.User Name Already Present', 'userController:signUpFunction.checkUserName', 10)
                        let apiResponse = response.generate(true, 'User Already Present With this user Name', 403, null)
                        reject(apiResponse)
                    } //end else
                }); //end model
        }); //end promise
    } //end checkUserName

    //check email for unique and then save to db and then send Verify Link mail 
    let createUser = () => {
        return new Promise((resolve, reject) => {
            UserModel.findOne({
                    email: req.body.email
                })
                .exec((err, retrievedUserDetails) => {
                    // handle the error in db connect
                    if (err) {
                        logger.error(err.message, 'userController:signUpFunction.createUser', 10)
                        let apiResponse = response.generate(true, 'Failed To Create User', 500, null)
                        reject(apiResponse)
                    } //end if
                    //check for empty
                    else if (check.isEmpty(retrievedUserDetails)) {
                        const secretToken = randomstring.generate(6);
                        //set admin
                        let check_admin;
                        if ((req.body.userName).endsWith('-admin')) {
                            check_admin = true;
                        } else {
                            check_admin = false;
                        }
                        // data to store
                        let newUser = new UserModel({
                            userId: shortid.generate(),
                            firstName: req.body.firstName,
                            lastName: req.body.lastName,
                            userName: req.body.userName,
                            email: req.body.email.toLowerCase(),
                            countryName: req.body.countryName,
                            mobileNumber: req.body.mobileNumber,
                            password: passwordLib.hashpassword(req.body.password),
                            secretToken: secretToken,
                            admin: check_admin,
                            createdOn: time.now(),
                            updatedOn: time.now()
                        })
                        newUser.save((err, newUser) => {
                            // handle the error in db connect
                            if (err) {
                                logger.error(err.message, 'userController:signUpFunction.createUser', 10)
                                let apiResponse = response.generate(true, 'Failed to create new User', 500, null)
                                reject(apiResponse)
                            } else {
                                let newUserObj = newUser.toObject();
                                const html = `Hi ${newUserObj.firstName +" "+ newUserObj.lastName},<br/>Thank you for registering!<br/><br/>Please verify your email by typing the following token:<br/>Token: <b>${newUserObj.secretToken}</b><br/>On the following page:<a href="https://myplanner.sathyainfotechpro.com/verify">${appConfig.url}/verify</a><br/><br/>Have a pleasant day.`;
                                let details = {
                                    email: newUserObj.email,
                                    message: "Verify Link",
                                    html: html
                                };
                                setTimeout(() => {
                                    //Fire the 'mail' event:
                                    eventEmitter.emit('mail', details);
                                }, 2000);

                                resolve(newUserObj)
                            }
                        }) //end save
                    } //end if
                    else {
                        logger.info('User Cannot Be Created.User Already Present', 'userController:signUpFunction.createUser', 4)
                        let apiResponse = response.generate(true, 'User Already Present With this Email', 403, null)
                        reject(apiResponse)
                    } //end else
                }) // end model
        }) // end promise
    } // end create user function


    validateUserInput(req, res)
        .then(checkUserName)
        .then(createUser)
        .then((resolve) => {
            delete resolve.password
            delete resolve._id
            delete resolve.__v
            let apiResponse = response.generate(false, 'User created', 200, resolve);
            res.send(apiResponse)
        })
        .catch((err) => {
            console.log(err);
            res.send(err);
        })

} // end user signup function 

// start verify Link function
let verifyLink = (req, res) => {

    //check the token
    let validatetoken = () => {
        return new Promise((resolve, reject) => {
            //check for empty
            if ((check.isEmpty(req.body.secretToken))) {
                logger.error('Field Missing During verify token', 'userController:verifyLink.validatetoken()', 5)
                let apiResponse = response.generate(true, 'Token parameter is missing', 400, null)
                reject(apiResponse)
            } else {
                resolve(req)
            }
        }) //end promise
    } //end validatetoken()

    // update the db and seend welcome msg mail
    let updateToken = () => {
        return new Promise((resolve, reject) => {
            let query = UserModel.findOne({
                secretToken: req.body.secretToken
            }).select('-password -_id -__v');
            query.exec((err, userDetails) => {
                // handle the error in db connect
                if (err) {
                    logger.error('Failed During verify token in db', "userController:verifyLink.updateToken()", 10);
                    let apiResponse = response.generate(true, "failed to find the user with given secret Token", 500, null);
                    reject(apiResponse);
                }
                //check for empty
                else if (check.isEmpty(userDetails)) {
                    logger.error("No Token Found", "userController:verifyLink.updateToken()", 10);
                    let apiResponse = response.generate(true, "Token is not valid,try again", 400, null);
                    reject(apiResponse);
                } else {
                    logger.info("user found", "userController:verifyLink.updateToken()", 10);
                    let updateUser = {
                        secretToken: '',
                        active: true
                    };
                    UserModel.updateOne({
                        'userId': userDetails.userId
                    }, updateUser).exec((err, newUser) => {
                        // handle the error in db connect
                        if (err) {
                            logger.error(err.message, 'userController:verifyLink.updateToken()', 10)
                            let apiResponse = response.generate(true, 'Failed To edit user details', 500, null)
                            reject(apiResponse)
                        }
                        //check for empty
                        else if (check.isEmpty(newUser)) {
                            logger.info('No User Found', 'userController:verifyLink.updateToken()')
                            let apiResponse = response.generate(true, 'No User Found', 403, null)
                            reject(apiResponse)
                        } else {
                            const html = `<h1>Welcome to My planner</h1>`;
                            var details = {
                                email: userDetails.email,
                                message: "welcome",
                                html: html
                            };
                            setTimeout(() => {
                                //Fire the 'mail' event:
                                eventEmitter.emit('mail', details);
                            }, 2000);

                            let apiResponse = response.generate(false, 'updated user', 200, null)
                            resolve(apiResponse)
                        }
                    });
                    resolve(userDetails);
                }
            });
        }) //end promise
    } //end updateToken()

    validatetoken(req, res)
        .then(updateToken)
        .then((message) => {
            let apiResponse = response.generate(false, "Verify Mail sent Successfully", 200, message);
            res.status(200);
            res.send(apiResponse);
        })
        .catch((err) => {
            console.log(err);
            res.send(err);
        });

} // end verifyLink function

//send the resent link for reset password in mail
let sendResetLink = (req, res) => {
    //check the email parameter
    if (check.isEmpty(req.body.email)) {
        logger.error("email is missing", "UserController:sendResetLink()", 10);
        let apiResponse = response.generate(true, "email is missing", 400, null);
        res.send(apiResponse);
    } else {
        UserModel.findOne({
            email: req.body.email
        }, (err, userDetails) => {
            /* handle the error if the user is not found */
            if (err) {
                logger.error(err.message, "userController:sendResetLink()", 10);
                let apiResponse = response.generate(true, "failed to find the user with given email", 500, null);
                res.send(apiResponse);
            } /* if company details is not found */
            else if (check.isEmpty(userDetails)) {
                logger.error("No User Found", "userController:sendResetLink", 10);
                let apiResponse = response.generate(true, "No user Found", 403, null);
                res.send(apiResponse);
            } else {
                logger.info("user found", "userController: sendResetLink", 10);
                const html = `<a href='https://myplanner.sathyainfotechpro.com/reset-password/${userDetails.userId}'>click here to reset password</a>`;
                var details = {
                    email: req.body.email,
                    message: "Reset ur password Link",
                    html: html
                };
                setTimeout(() => {
                    //Fire the 'mail' event:
                    eventEmitter.emit('mail', details);
                }, 2000);

                let apiResponse = response.generate(false, "User Details Found", 200, "Mail sent successfully");
                res.send(apiResponse);
            }
        }); //end model
    } //end else
} //sendResetLink

// reset password
let resetPassword = (req, res) => {

    //find user with user id
    let findUser = () => {
        return new Promise((resolve, reject) => {
                UserModel.findOne({
                    userId: req.params.userId
                }, (err, userDetails) => {
                    /* handle the error if the user is not found */
                    if (err) {
                        logger.error('Failed to retrieve user Data', "UserController:resetPassword.findUser()", 10);
                        let apiResponse = response.generate(true, "failed to find the user with given userId", 500, null);
                        reject(apiResponse);
                    } /* if company details is not found */
                    else if (check.isEmpty(userDetails)) {
                        logger.error("No User Found", "userController: resetPassword.findUser()", 10);
                        let apiResponse = response.generate(true, "No user Details Found", 403, null);
                        reject(apiResponse);
                    } else {
                        logger.info("user found", "userController: resetPassword.findUser()", 10);
                        resolve(userDetails);
                    }
                });
        }); //end promise
    } //end findUser()

    //update the password
    let updatePassword = (userDetails) => {
        return new Promise((resolve, reject) => {
            if (check.isEmpty(req.body.password)) {
                logger.error("password is missing", "UserController:resetPassword.updatePassword()", 10);
                let apiResponse = response.generate(true, "Password is missing", 400, null);
                reject(apiResponse);
            } else {
                UserModel.updateOne({
                    userId: req.params.userId
                }, {
                    password: passwordLib.hashpassword(req.body.password)
                }, {
                    multi: true
                }, (err, result) => {
                    if (err) {
                        // handle the error in db connect
                        logger.error("Failed to change Password ", "userController: resetPassword.updatePassword()", 10);
                        let apiResponse = response.generate(true, "Failed to change Password", 500, null);
                        reject(apiResponse);
                    } else if (check.isEmpty(result)) {
                        logger.error("User Not found", "userController: resetPassword.updatePassword()", 10);
                        let apiResponse = response.generate(true, "User not found", 403, null);
                        reject(apiResponse);
                    } else {
                        logger.info("Password updated", "userController: resetPassword.updatePassword()", 10);
                        const html = `<b> Hi ${userDetails.firstName + " " + userDetails.lastName}, your password has been changed succesfully</b>`;
                        var details = {
                            email: userDetails.email,
                            message: "Password updated sucessfully",
                            html: html
                        };
                        setTimeout(() => {
                            //Fire the 'mail' event:
                            eventEmitter.emit('mail', details);
                        }, 2000);
                        resolve("Password reset successfull");
                    }
                });
            }
        }); //end promise
    } //end update password

    findUser(req, res)
        .then(updatePassword)
        .then((message) => {
            let apiResponse = response.generate(false, "Mail sent Successfully", 200, message);
            res.status(200);
            res.send(apiResponse);
        })
        .catch((err) => {
            res.status(err.status);
            res.send(err);
        });


} //end reset password

let changePassword = (req, res) => {
    if (check.isEmpty(req.body.password)) {
        logger.error("password is missing", "userController:changePassword()", 10);
        let apiResponse = response.generate(true, "Password is missing", 400, null);
        res.send(apiResponse);
    } else {
        UserModel.updateOne({
            userId: req.body.userId
        }, {
            password: passwordLib.hashpassword(req.body.password)
        }, {
            multi: true
        }, (err, result) => {

            if (err) {
                logger.error("Failed to change Password ", "userController:changePassword()", 10);
                let apiResponse = response.generate(true, "Failed to change Password", 500, null);
                res.send(apiResponse);
            } else if (check.isEmpty(result)) {
                logger.error("User Not found", "userController:changePassword()", 10);
                let apiResponse = response.generate(true, "User not found", 403, null);
                res.send(apiResponse);
            } else {
                logger.info("Password updated", "userController:changePassword()", 10);
                let apiResponse = response.generate(false, "Password Updated Successfully", 200, result);
                res.status(200);
                res.send(apiResponse);
            }
        });
    }
} //end changePassword

// start of login function 
let loginFunction = (req, res) => {

    //find user with email before check the parameter
    let findUser = () => {
        return new Promise((resolve, reject) => {
            //check for not empty
            if (!check.isEmpty(req.body.email)) {
                UserModel.findOne({
                    email: req.body.email
                }, (err, userDetails) => {
                    /* handle the error in db connect */
                    if (err) {
                        logger.error('Failed to retrieve user Data', "userController:loginFunction.findUser()", 10);
                        let apiResponse = response.generate(true, "failed to find the user with given email", 500, null);
                        reject(apiResponse);
                    } /* if company details is not found */
                    else if (check.isEmpty(userDetails)) {
                        logger.error("No User Found", "userController:loginFunction.findUser()", 5);
                        let apiResponse = response.generate(true, "No user Details Found", 403, null);
                        reject(apiResponse);
                    } else {
                        logger.info("user found", "userController:loginFunction.findUser()", 10);
                        resolve(userDetails);
                    }
                }); //end model
            } else {
                logger.error("email parameter is missing", "userController:loginFunction.findUser()", 10);
                let apiResponse = response.generate(true, "email parameter is missing", 400, null);
                reject(apiResponse);
            }
        }); //end promise
    } //end findUser()

    //check the parameter and match the password 
    let validatePassword = (retrievedUserDetails) => {
        return new Promise((resolve, reject) => {
            //check for not empty
            if (!check.isEmpty(req.body.password)) {
                //check password match
                passwordLib.comparePassword(req.body.password, retrievedUserDetails.password, (err, isMatch) => {
                    if (err) {
                        // handle the error in db connect
                        logger.error(err.message, "userController:loginFunction.ValidatePassword()", 10);
                        let apiResponse = response.generate(true, "Login Failed", 500, null);
                        reject(apiResponse);
                    } else if (isMatch) {
                        let retrievedUserDetailsObj = retrievedUserDetails.toObject();
                        delete retrievedUserDetailsObj.password;
                        delete retrievedUserDetailsObj._id;
                        delete retrievedUserDetailsObj.__v;
                        delete retrievedUserDetailsObj.createdOn;
                        delete retrievedUserDetailsObj.modifiedOn;
                        delete retrievedUserDetailsObj.secretToken;
                        resolve(retrievedUserDetailsObj);
                    } else {
                        logger.error('login Failed due to invalid password', "userController:loginFunction.validatePassword()", 10);
                        let apiResponse = response.generate(true, "Password is incorrect", 400, null);
                        reject(apiResponse);
                    }
                }); //end password lib
            } else {
                logger.error("password parameter is missing", "userController:loginFunction.findUser()", 10);
                let apiResponse = response.generate(true, "password parameter is missing", 400, null);
                reject(apiResponse);
            }
        }); //end promise
    } //end validateUser()

    // Check if email has been verified
    let verifyEmail = (userDetails) => {
        return new Promise((resolve, reject) => {
            if (!userDetails.active) {
                logger.error('login Failed due to not verify', "userController:loginFunction.verifyEmail()", 10);
                let apiResponse = response.generate(true, "Sorry, you must validate email first", 400, null);
                reject(apiResponse);
            } else {
                logger.info("user verify the email", "userController:loginFunction.verifyEmail()", 10);
                resolve(userDetails);
            }
        }); //end promise
    } // end verifyEmail()

    // updated last logIn time
    let updateTime = (userDetails) => {
        return new Promise((resolve, reject) => {
            if (check.isEmpty(userDetails.updatedOn)) {
                logger.error("updatedOn is missing", "UserController:loginFunction.updateTime()", 10);
                let apiResponse = response.generate(true, "updatedOn is missing", 500, null);
                reject(apiResponse);
            } else {
                let options = {
                    'updatedOn': time.now()
                }
                UserModel.updateOne({
                    'email': req.body.email
                }, options).exec((err, result) => {
                    if (err) {
                        logger.error(err.message, "UserController:loginFunction.updateTime()", 10);
                        let apiResponse = response.generate(true, "Failed to login", 500, null);
                        reject(apiResponse);
                    } else if (check.isEmpty(result)) {
                        logger.error("updatedOn is empty in result", "UserController:loginFunction.updateTime()", 10);
                        let apiResponse = response.generate(true, "updatedOn is empty in result", 500, null);
                        reject(apiResponse);
                    } else {
                        logger.info("updated last login time", "UserController:loginFunction.updateTime()", 10);
                        resolve(userDetails);
                    }
                });
            }
        }) //end promise
    } //end updateTime

    //generate new Token for user
    let generateToken = (userDetails) => {
        return new Promise((resolve, reject) => {
            token.generateToken(userDetails, (err, tokenDetails) => {
                if (err) {
                    logger.error(err.message, "UserController:loginFunction.generateToken()", 10);
                    let apiResponse = response.generate(true, "Failed to generate Token", 500, null);
                    reject(apiResponse);
                } else {
                    tokenDetails.userId = userDetails.userId;
                    tokenDetails.userDetails = userDetails;
                    resolve(tokenDetails);
                }
            });
        }); //end promise
    } //end generateToken

    //save the token
    let saveToken = (tokenDetails) => {
        return new Promise((resolve, reject) => {
            AuthModel.findOne({
                userId: tokenDetails.userId
            }, (err, retrievedTokenDetails) => {
                if (err) {
                    logger.error(err.message, "UserController:loginFunction.saveToken()", 10);
                    let apiResponse = response.generate(true, "Failed To Generate Token", 500, null);
                    reject(apiResponse);
                } else if (check.isEmpty(retrievedTokenDetails)) {
                    let newAuthToken = new AuthModel({
                        userId: tokenDetails.userId,
                        authToken: tokenDetails.token,
                        tokenSecret: tokenDetails.tokenSecret,
                        tokenGenerationTime: time.now()
                    });
                    newAuthToken.save((err, newTokenDetails) => {
                        if (err) {
                            logger.error(err.message, "UserController:loginFunction.saveToken()", 10);
                            let apiResponse = response.generate(true, "Failed To save Token", 500, null);
                            reject(apiResponse);
                        } else {
                            let responseBody = {
                                authToken: newTokenDetails.authToken,
                                userDetails: tokenDetails.userDetails
                            }
                            resolve(responseBody);
                        }
                    });
                } else {
                    retrievedTokenDetails.authToken = tokenDetails.token;
                    retrievedTokenDetails.tokenSecret = tokenDetails.tokenSecret;
                    retrievedTokenDetails.tokenGenerationTime = time.now();

                    retrievedTokenDetails.save((err, newTokenDetails) => {
                        if (err) {
                            logger.error(err.message, "UserController:loginFunction.saveToken()", 10);
                            let apiResponse = response.generate(true, "Failed To Generate Token", 500, null);
                            reject(apiResponse);
                        } else {
                            let responseBody = {
                                authToken: newTokenDetails.authToken,
                                userDetails: tokenDetails.userDetails
                            }
                            resolve(responseBody);
                        }
                    });
                }
            });
        }); //end promise
    } //end of saveToken()

    findUser(req, res)
        .then(validatePassword)
        .then(verifyEmail)
        .then(updateTime)
        .then(generateToken)
        .then(saveToken)
        .then((resolve) => {
            let apiResponse = response.generate(false, "login Successful", 200, resolve);
            res.status(200);
            res.send(apiResponse);
        })
        .catch((err) => {
            console.log(err);
            res.send(err);
        });

} // end of the login function 


let logout = (req, res) => {

    if (check.isEmpty(req.body.userId)) {
        logger.error("UserId is missing", "UserController:logout()", 10);
        let apiResponse = response.generate(true, "UserId is missing", 400, null);
        res.send(apiResponse);
    } else {
        AuthModel.deleteOne({
            userId: req.body.userId
        }, (err, result) => {
            if (err) {
                logger.error(err.message, "UserController:logout()", 10);
                let apiResponse = response.generate(true, "Failed to logout the user", 500, null);
                res.send(apiResponse);
            } else if (check.isEmpty(result)) {
                logger.error("Invalid AuthToken/ authToken expired", "UserController:logout()", 10);
                let apiResponse = response.generate(true, "Invalid AuthToken/ authToken expired", 400, null);
                res.send(apiResponse);
            } else {
                logger.info("User Logged Out", "UserController:logout()", 10);
                let apiResponse = response.generate(false, "User logged Out", 200, result);
                res.send(apiResponse);
            }
        });
    }
} // end of the logout function.

let getallUserList = (req, res) => {
    let pageNo = parseInt(req.query.pageNo);
    let size = parseInt(req.query.size);
    let search = req.query.query;
    let query;
    if(!check.isEmpty(pageNo) && !check.isEmpty(size))
    {
    if (pageNo < 0 || pageNo === 0 || isNaN(pageNo)) {
        logger.info('invalid page number, should start with 1', 'userController:getallUserList()')
        let apiResponse = response.generate(true, 'invalid page number, should start with 1', 400, null)
        res.send(apiResponse)
    }
    if (size < 0 || size === 0|| isNaN(size)) {
        logger.info('invalid size should be greater than 1', 'userController:getallUserList()')
        let apiResponse = response.generate(true, 'invalid size should be greater than 1', 400, null)
        res.send(apiResponse)
    }
    if (search === undefined || search === '' || search === null) {
        query = {
            $and: [{
            'active': true
        },
        {
            'admin': false
        }]
    };
    } else {
        query = {
            $and: [{
                'active': true
            }, {
                "userName": {
                    $regex: search,
                    $options: 'i'
                },
            },
            {
                'admin': false
            }]
        }
    };
    let options = {
        select: '-id -_id -__v -secretToken -password -createdOn -updatedOn',
        sort: {
            userName: 1
        },
        lean: true,
        offset: size * (pageNo - 1),
        limit: size
    };
    query = JSON.stringify(query);
    query = query.replace(/\\/g, "");
    query = JSON.parse(query);
    UserModel.paginate(query, options).then((result) => {
        if (check.isEmpty(result)) {
            logger.info('No User Found', 'userController:getallUserList()', 10)
            let apiResponse = response.generate(true, 'No Users Found', 403, null)
            res.send(apiResponse)
        } else {
             for(let i = 0; i < result.docs.length; i++) {
                delete result.docs[i]['id'];
            }
            let apiResponse = response.generate(false, 'Users Found', 200, result)
            res.send(apiResponse)
        }
    })
}
else{
    logger.error('Field Missing During getallUserList', 'userController:getallUserList()', 5)
    let apiResponse = response.generate(true, 'One or More Parameter(s) is missing', 400, null)
    res.send(apiResponse)
}
} // end get All UserList


module.exports = {
    getSingleUser: getSingleUser,
    editUser: editUser,
    signUpFunction: signUpFunction,
    verifyLink: verifyLink,
    loginFunction: loginFunction,
    sendResetLink: sendResetLink,
    resetPassword: resetPassword,
    changePassword: changePassword,
    logout: logout,
    getallUserList: getallUserList
} // end