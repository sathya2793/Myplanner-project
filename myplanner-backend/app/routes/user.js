const express = require('express');
const router = express.Router();
const userController = require("./../../app/controllers/userController");
const appConfig = require("./../../config/appConfig");
const auth = require('./../middlewares/auth');
module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}/users`;
    // defining routes.


    // params: firstName, lastName, userName, email, countryName,mobileNumber, password
    app.post(`${baseUrl}/signup`, userController.signUpFunction);
    /**
     * @apiGroup Users
     * @apiVersion  1.0.0
     * @api {post} /api/v1/users/signup api for user SignUp.
     *
     * @apiParam {string} firstName First Name of the user. (body) (required)
     * 
     * @apiParam {string} lastName Last Name of the user. (body) (required)
     * 
     * @apiParam {string} userName userName of the user ,for admin ends with '-admin'. (body) (required)
     * 
     * @apiParam {string} email email of the user. (body) (required)
     * 
     * @apiParam {string} password password of the user. (body) (required)
     * 
     * @apiParam {string} countryName countryName of the user. (body) (required)
     * 
     * @apiParam {number} mobileNumber Mobile Number of the user with code. (body) (required)
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
     *{
        "error": false,
        "message": "User created",
        "status": 200,
        "data": {
            "firstName": " sample",
            "lastName": " testing1",
            "userName": "balu1",
            "email": "testing1@gmail.com",
            "countryName": " Iceland",
            "mobileNumber": " 3541234567890",
            "secretToken": "Kpnpz2",
            "active": false,
            "admin": false,
            "createdOn": "2019-03-19T07:57:02.000Z",
            "updatedOn": "2019-03-19T07:57:02.000Z",
            "userId": "7oBu3hiUD"
        }
    }
    * @apiErrorExample {json} Error - Response:
        *
        {
            "error": true,
            "message": "User Already Present With this Email",
            "status": 403,
            "data": null
        }
        */

    // params: secretToken
    app.post(`${baseUrl}/verify`, userController.verifyLink);
    /**
     * @apiGroup Users
     * @apiVersion  1.0.0
     * @api {post} /api/v1/users/verify api for user activation.
     *  
     * @apiParam {string} SecretToken for verify the email. (body) (required)
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
     * 
     *{
        "error": false,
        "message": "Verify Mail sent Successfully",
        "status": 200,
        "data": {
            "firstName": " sample",
            "lastName": " testing1",
            "userName": "balu2-admin",
            "email": "testing2@gmail.com",
            "countryName": " Iceland",
            "mobileNumber": " 3541234567890",
            "secretToken": "SygDk7",
            "active": false,
            "admin": true,
            "createdOn": "2019-03-19T08:00:30.000Z",
            "updatedOn": "2019-03-19T08:00:30.000Z",
            "userId": "D5jL2k6iM"
        }
    }
    * @apiErrorExample {json} Error - Response:
    *
    {
      "error": true,
      "message": "Token is not valid,try again",
      "status": 500,
      "data": null
    }
    */



    // params: email,password.
    app.post(`${baseUrl}/login`, userController.loginFunction);
    /**
     * @apiGroup Users
     * @apiVersion  1.0.0
     * @api {post} /api/v1/users/login api for user login.
     *
     * @apiParam {string} email email of the user. (body params) (required)
     * 
     * @apiParam {string} password password of the user. (body params) (required)
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
     *{
        "error": false,
        "message": "login Successful",
        "status": 200,
        "data": {
            "authToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RpZCI6InV0aUwxZFRkayIsImlhdCI6MTU1Mjk5MDkwMDMwMiwiZXhwIjoxNTUzMDc3MzAwLCJzdWIiOiJhdXRoVG9rZW4iLCJpc3MiOiJ0by1kbyIsImRhdGEiOnsiZmlyc3ROYW1lIjoiIHNhbXBsZSIsImxhc3ROYW1lIjoiIHRlc3RpbmcxIiwidXNlck5hbWUiOiJiYWx1Mi1hZG1pbiIsImVtYWlsIjoidGVzdGluZzJAZ21haWwuY29tIiwiY291bnRyeU5hbWUiOiIgSWNlbGFuZCIsIm1vYmlsZU51bWJlciI6IiAzNTQxMjM0NTY3ODkwIiwic2VjcmV0VG9rZW4iOiIiLCJhY3RpdmUiOnRydWUsImFkbWluIjp0cnVlLCJ1cGRhdGVkT24iOiIyMDE5LTAzLTE5VDA4OjAwOjMwLjAwMFoiLCJ1c2VySWQiOiJENWpMMms2aU0ifX0.P5CjSgIfNtjVnh8PJdILiDeS5fTLu5m-XqTcmK5FHI8",
            "userDetails": {
                "firstName": " sample",
                "lastName": " testing1",
                "userName": "balu2-admin",
                "email": "testing2@gmail.com",
                "countryName": " Iceland",
                "mobileNumber": " 3541234567890",
                "active": true,
                "admin": true,
                "updatedOn": "2019-03-19T08:00:30.000Z",
                "userId": "D5jL2k6iM"
            }
        }
        }
    * @apiErrorExample {json}Error - Response:
    *
    *{
            "error": true,
            "message": "Password is incorrect",
            "status": 500,
            "data": null
        }
        */

    //params : email
    app.post(`${baseUrl}/forgotPassword`, userController.sendResetLink);
    /**
         * @apiGroup Users
         * @apiVersion  1.0.0
         * @api {post} /api/v1/users/forgotPassword to send an reset email to user.
         *
         * @apiParam {string} email email of the user. (body) (required)
         *
         * @apiSuccess {object} myResponse shows error status, message, http status code, result.
         * 
         * @apiSuccessExample {object} Success-Response:
                {
                    "error": false,
                    "message": "User Details Found",
                     "status": 200,
                    "data": "Mail sent successfully"
                }       
        *  @apiErrorExample {json} Error-Response:
        *
        *  {
                "error": true,
                "message": "email is missing",
                "status": 500,
                "data": null
            }       
        */

    // params: userId,password.
    app.post(`${baseUrl}/resetPassword/:userId`, userController.resetPassword);

    /**
         * @apiGroup Users
         * @apiVersion  1.0.0
         * @api {post} /api/v1/users/resetPassword/:userId to Reset the password of user with request in the mail.
         *
         * @apiParam {string} userId Id of the user. (params) (required)
         * 
         * @apiParam {string} password New password of the user. (body) (required)
         *
         * @apiSuccess {object} myResponse shows error status, message, http status code, result.
         * 
         * @apiSuccessExample {object} Success-Response:
                {
                    "error": false,
                    "message": "Mail sent Successfully",
                    "status": 200,
                    "data": "Password reset successfull"
                }
        *  @apiErrorExample {json} Error-Response:
        *
        *  {
                "error": true,
                "message": "No user Details Found",
                "status": 500,
                "data": null
            }     
        */



    //params: userId,authToken
    app.post(`${baseUrl}/logout`, auth.isAuthorized, userController.logout);
    /**
         * @apiGroup Users
         * @apiVersion  1.0.0
         * @api {post} /api/v1/users/logout to logout user.
         *
         * @apiParam {string} userId userId of the user. (body) (required)
         *
         * @apiParam {string} authToken authToken of user for authorization. (route / body / query / header params) (required)
         *       
         * @apiSuccess {object} myResponse shows error status, message, http status code, result.
         * 
         * @apiSuccessExample {object} Success-Response:
            {
                "error": false,
                "message": "User logged Out",
                "status": 200,
                "data": {
                    "n": 1,
                    "ok": 1
                }
            }
          *  @apiErrorExample {json} Error-Response:
          *
          * {
                "error": true,
                "message": "Invalid Or Expired AuthorizationKey",
                "status": 404,
                "data": null
            }           
     */

    // params: userId,firstName,lastName,countryName,mobileNumber,authToken
    app.post(`${baseUrl}/editUser/:userId`, auth.isAuthorized, userController.editUser);
    /**
     * @apiGroup Users
     * @apiVersion  1.0.0
     * @api {post} /api/v1/users/editUser/:userId api for user editUser.
     * 
     * @apiParam {string} userId userId of the user. (params) (required)
     *
     * @apiParam {string} firstName First Name of the user. (body) (required)
     * 
     * @apiParam {string} lastName Last Name of the user. (body) (required)
     * 
     * @apiParam {string} countryName countryName of the user. (body) (required)
     * 
     * @apiParam {number} mobileNumber Mobile Number of the user with code. (body) (required)
     * 
     * @apiParam {string} authToken authToken of user for authorization. (route / body / query / header params) (required)
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
     * 
        {
            "error": false,
            "message": "User details edited",
            "status": 200,
            "data": {
                    "n": 1,
                    "nModified": 1,
                    "ok": 1
                    }
       }
     * @apiErrorExample {json} Error-Response:
    
        {
            "error": true,
            "message": "AuthorizationToken Is Missing In Request",
            "status": 400,
            "data": null
        }
    */

    //param:userId,password,authToken
    app.post(`${baseUrl}/changePassword/:userId`, auth.isAuthorized, userController.changePassword);
    /**
        * @apiGroup Users
        * @apiVersion  1.0.0
        * @api {post} /api/v1/users/changePassword/:userId api for change Password.
        *
        * @apiParam {string} userId userId of the user. (body) (required)
        * 
        * @apiParam {string} password password of the user. (body) (required)
        * 
        * @apiParam {string} authToken authToken of user for authorization. (route / body / query / header params) (required)
        *
        * @apiSuccess {object} myResponse shows error status, message, http status code, result.
        * 
        * @apiSuccessExample {object} Success-Response:
         {
            "error": false,
            "message": "Password Updated Successfully",
            "status": 200,
            "data": {
                    "n": 0,
                    "nModified": 0,
                    "ok": 1
                    }
         }
        * @apiErrorExample {json} Error-Response:
            {
                "error": true,
                "message": "Password is missing",
                "status": 500,
                "data": null
            }
          */

    //param:pageNo,size,query,authToken
    app.get(`${baseUrl}/getallUserList`, auth.isAuthorized, userController.getallUserList);
    /**
        * @apiGroup Users
        * @apiVersion  1.0.0
        * @api {get} /api/v1/users/getallUserList api for get All UserList
        *
        * @apiParam {number} pageNo pageNo alway start with 1. (body) (required)
        * 
        * @apiParam {number} size Number of record will return in single page. (body) (required)
        * 
        * @apiParam {string} query Search keyowrd for userName. (body) (option)
        * 
        * @apiParam {string} authToken authToken of user for authorization. (route / body / query / header params) (required)
        * 
        * @apiSuccess {object} myResponse shows error status, message, http status code, result.
        * 
        * @apiSuccessExample {object} Success-Response:
        {
            "error":false,
            "message":"Users Found",
            "status":200,
            "data":
            {
                "docs":[
                    {
                        "firstName":"demo",
                        "lastName":"sample",
                        "userName":"demo1",
                        "email":"sathya27593@gmail.com",
                        "countryName":"American Samoa",
                        "mobileNumber":"1-6841212121212",
                        "active":true,
                        "userId":"Rq98M3951",
                        "admin":false
                    }],
                    "total":1,
                    "limit":10,
                    "offset":0
            }
        }
        * @apiErrorExample {json} Error-Response:
    
        {
            "error": true,
            "message": "AuthorizationToken Is Missing In Request",
            "status": 400,
            "data": null
        }
    */

}