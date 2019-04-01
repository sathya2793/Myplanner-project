const express = require('express');
const router = express.Router();
const scheduleController = require("./../../app/controllers/scheduleController");
const appConfig = require("./../../config/appConfig");
const auth = require('./../middlewares/auth');
module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}/schedule`;
    // defining routes.


    // params:adminId, adminName, eventName, start, end, venue, description, participateId, participateName
    app.post(`${baseUrl}/createMeeting`, auth.isAuthorized, scheduleController.addMeeting);
    /**
        * @apiGroup Meeting
        * @apiVersion  1.0.0
        * @api {post} /api/v1/schedule/createMeeting api for create the meeting
        *
        * @apiParam {string} adminId adminId of the who created this meeting. (body) (required)
        * 
        * @apiParam {string} adminName adminName of the who created this meeting. (body) (required)
        * 
        * @apiParam {string} eventName eventName of the this meeting. (body) (required)
        * 
        * @apiParam {number} start starting Date and time of the this meeting. (body) (required)
        * 
        * @apiParam {number} end ending date and time of the this meeting. (body) (required)
        * 
        * @apiParam {string} venue venue of the this meeting. (body) (required)
        * 
        * @apiParam {string} description description about this meeting. (body) (required)
        * 
        * @apiParam {string} participateId participateId to who assigned this meeting. (body) (required)
        * 
        * @apiParam {string} participateName participateName to who assigned this meeting. (body) (required)
        * 
        * @apiParam {string} authToken authToken of user for authorization. (route / body / query / header params) (required)
        * 
        * @apiSuccess {object} myResponse shows error status, message, http status code, result.
        * 
        * @apiSuccessExample {object} Success-Response:
        * 
        * 
        {
          "error": false,
          "message": "Meeting created",
          "status": 200,
          "data": {
                    "id": "FBHODexJK",
                    "adminId": "Rq98M395e",
                    "adminName": "sathya a",
                    "eventName": "selenium1",
                    "start": 1553005809397,
                    "end": 1553005825924,
                    "venue": "sb1 - floor 3",
                    "description": "basic topic",
                    "participateId": "Rq98M3951",
                    "participateName": "demo1",
                    "createdOn": "2019-03-19T15:28:45.000Z",
                    "modifiedOn": "2019-03-19T15:28:45.000Z"
                   }
        }
        * @apiErrorExample {json} Error-Response:
        *{
            "error": true,
            "message": "AuthorizationToken Is Missing In Request",
            "status": 400,
            "data": null
         }
    */

    // params:id, adminId, adminName, eventName, start, end, venue, description, participateId, participateName
    app.post(`${baseUrl}/updateMeeting`, auth.isAuthorized, scheduleController.updateMeeting);
    /**
        * @apiGroup Meeting
        * @apiVersion  1.0.0
        * @api {post} /api/v1/schedule/updateMeeting api for update the meeting
        *
        * @apiParam {string} id id of the this meeting to update. (body) (required)
        * 
        * @apiParam {string} adminId adminId of the who created this meeting. (body) (required)
        * 
        * @apiParam {string} adminName adminName of the who created this meeting. (body) (required)
        * 
        * @apiParam {string} eventName eventName of the this meeting. (body) (required)
        * 
        * @apiParam {number} start starting Date and time of the this meeting. (body) (required)
        * 
        * @apiParam {number} end ending date and time of the this meeting. (body) (required)
        * 
        * @apiParam {string} venue venue of the this meeting. (body) (required)
        * 
        * @apiParam {string} description description about this meeting. (body) (required)
        * 
        * @apiParam {string} participateId participateId to who assigned this meeting. (body) (required)
        * 
        * @apiParam {string} participateName participateName to who assigned this meeting. (body) (required)
        * 
        * @apiParam {string} authToken authToken of user for authorization. (route / body / query / header params) (required)
        * 
        * @apiSuccess {object} myResponse shows error status, message, http status code, result.
        * 
        * @apiSuccessExample {object} Success-Response:
        * 
        {
          "error": false,
          "message": "Meeting Update",
          "status": 200,
          "data": {
                    "n": 1,
                    "nModified": 1,
                    "ok": 1
                    }               
        }
        * @apiErrorExample {json} Error-Response:
        *{
            "error": true,
            "message": "AuthorizationToken Is Missing In Request",
            "status": 400,
            "data": null
         }
    */
        
    //params: id, authToken
    app.post(`${baseUrl}/deleteMeeting`, auth.isAuthorized, scheduleController.deleteMeeting);
    /**
        * @apiGroup Meeting
        * @apiVersion  1.0.0
        * @api {post} /api/v1/schedule/deleteMeeting api for delete the meeting
        *
        * @apiParam {string} id id of the this meeting to delete. (body) (required)
        * 
        * @apiParam {string} authToken authToken of user for authorization. (route / body / query / header params) (required)
        * 
        * @apiSuccess {object} myResponse shows error status, message, http status code, result.
        * 
        * @apiSuccessExample {object} Success-Response:
        * 
        {
          "error": false,
          "message": "List Deleted",
          "status": 200,
          "data": {
                    "n": 1,
                    "ok": 1
                    }
        }
        * @apiErrorExample {json} Error-Response:
        *{
            "error": true,
            "message": "AuthorizationToken Is Missing In Request",
            "status": 400,
            "data": null
         }
    */

    //params: userId, authToken
    app.get(`${baseUrl}/getAllSingleUserSchedule/:userId`, auth.isAuthorized, scheduleController.getAllSingleUserSchedule);
    /**
     * @apiGroup Schedule
     * @apiVersion  1.0.0
     * @api {get} /api/v1/schedule/getAllSingleUserSchedule/:userId api for get All the SingleUser Schedule
     *
     * @apiParam {string} userId userId of the this meeting to get All the SingleUser Schedule. (params) (required)
     * 
     * @apiParam {string} authToken authToken of user for authorization. (route / body / query / header params) (required)
     * 
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
     *{
        "error": false,
        "message": "Schedule Found",
        "status": 200,
        "data": [ {
            "id": "FBHODexJK",
            "adminId": "Rq98M395e",
            "adminName": "sathya a",
            "eventName": "selenium2",
            "start": 1553005809397,
            "end": 1553005825924,
            "venue": "sb1 - floor 2",
            "description": "basic topic2",
            "participateId": "Rq98M3951",
            "participateName": "demo1",
            "createdOn": "2019-03-19T15:28:45.000Z",
            "modifiedOn": "2019-03-19T15:41:01.000Z"
        },
        {
            "id": "x1oC-9Gbw",
            "adminId": "Rq98M395e",
            "adminName": "sathya a",
            "eventName": "java",
            "start": 1553009410757,
            "end": 1553013016041,
            "venue": "s5 - block",
            "description": "array concept",
            "participateId": "Rq98M3951",
            "participateName": "demo1",
            "createdOn": "2019-03-19T15:43:15.000Z",
            "modifiedOn": "2019-03-19T15:43:15.000Z"
        }
        ]
    }
    * @apiErrorExample {json} Error - Response:
        *
        {
            "error": true,
            "message": "AuthorizationToken Is Missing In Request",
            "status": 400,
            "data": null
        }
        */

    //params: adminId, authToken
    app.get(`${baseUrl}/getAllSchedule/:adminId`, auth.isAuthorized, scheduleController.getAllSchedule)
    /**
     * @apiGroup Schedule
     * @apiVersion  1.0.0
     * @api {get} /api/v1/schedule/getAllSchedule/:adminId api get all meeting the scheldule for the single admin
     *
     * @apiParam {string} adminId adminId of the this meeting to get All the Schedule. (params) (required)
     * 
     * @apiParam {string} authToken authToken of user for authorization. (route / body / query / header params) (required)
     * 
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
     *{
        "error": false,
        "message": "All Schedule Found",
        "status": 200,
        "data": [ {
            "id": "FBHODexJK",
            "adminId": "Rq98M395e",
            "adminName": "sathya a",
            "eventName": "selenium2",
            "start": 1553005809397,
            "end": 1553005825924,
            "venue": "sb1 - floor 2",
            "description": "basic topic2",
            "participateId": "Rq98M3951",
            "participateName": "demo1",
            "createdOn": "2019-03-19T15:28:45.000Z",
            "modifiedOn": "2019-03-19T15:41:01.000Z"
        },
        {
            "id": "x1oC-9Gbw",
            "adminId": "Rq98M395e",
            "adminName": "sathya a",
            "eventName": "java",
            "start": 1553009410757,
            "end": 1553013016041,
            "venue": "s5 - block",
            "description": "array concept",
            "participateId": "Rq98M3951",
            "participateName": "demo1",
            "createdOn": "2019-03-19T15:43:15.000Z",
            "modifiedOn": "2019-03-19T15:43:15.000Z"
        }
        ]
    }
    * @apiErrorExample {json} Error - Response:
        *
        {
            "error": true,
            "message": "AuthorizationToken Is Missing In Request",
            "status": 400,
            "data": null
        }
        */

}