const mongoose = require('mongoose');
const shortid = require('shortid');
const time = require('./../libs/timeLib');
const response = require('./../libs/responseLib');
const logger = require('./../libs/loggerLib');
const validateInput = require('../libs/paramsValidationLib');
const check = require('../libs/checkLib');
const events = require('events');
const eventEmitter = new events.EventEmitter();
eventEmitter.setMaxListeners(100);
/* Models */
const ScheduleModel = mongoose.model('ScheduleModel');


let addMeeting = (req, res) => {
    //check the parameter
    if (check.isEmpty(req.body.adminId) ||
        check.isEmpty(req.body.adminName) ||
        check.isEmpty(req.body.eventName) ||
        check.isEmpty(req.body.start) ||
        check.isEmpty(req.body.end) ||
        check.isEmpty(req.body.venue) ||
        check.isEmpty(req.body.description) ||
        check.isEmpty(req.body.participateId) ||
        check.isEmpty(req.body.participateName)) {
        logger.error('Field Missing During add Meeting', 'scheduleController:addMeeting()', 5)
        let apiResponse = response.generate(true, 'One or More Parameter(s) is missing', 400, null)
        res.send(apiResponse)
    } else {
        let newUser = new ScheduleModel({
            id: shortid.generate(),
            adminId: req.body.adminId,
            adminName: req.body.adminName,
            eventName: req.body.eventName,
            start: req.body.start,
            end: req.body.end,
            venue: req.body.venue,
            description: req.body.description,
            participateId: req.body.participateId,
            participateName: req.body.participateName
        })
        newUser.save((err, result) => {
            if (err) {
                logger.error(err.message, 'scheduleController:addMeeting()', 10)
                let apiResponse = response.generate(true, 'Failed to create new User', 500, null)
                res.send(apiResponse)
            } else {
                let Obj = result.toObject();
                delete Obj._id
                delete Obj.__v
                let apiResponse = response.generate(false, 'Meeting created', 200, Obj);
                res.send(apiResponse)
            }
        });
    }
}
// end addMeeting function 

let updateMeeting = (req, res) => {
    //check the parameter
    if (check.isEmpty(req.body.id) ||
        check.isEmpty(req.body.adminId) ||
        check.isEmpty(req.body.adminName) ||
        check.isEmpty(req.body.eventName) ||
        check.isEmpty(req.body.start) ||
        check.isEmpty(req.body.end) ||
        check.isEmpty(req.body.venue) ||
        check.isEmpty(req.body.description) ||
        check.isEmpty(req.body.participateId) ||
        check.isEmpty(req.body.participateName)) {
        logger.error('Field Missing During update Meeting', 'scheduleController:updateMeeting()', 5)
        let apiResponse = response.generate(true, 'One or More Parameter(s) is missing', 400, null)
        res.send(apiResponse)
    } else {
        let options = {
            adminId: req.body.adminId,
            adminName: req.body.adminName,
            eventName: req.body.eventName,
            start: req.body.start,
            end: req.body.end,
            venue: req.body.venue,
            description: req.body.description,
            participateId: req.body.participateId,
            participateName: req.body.participateName,
            modifiedOn: time.now()
        }
        ScheduleModel.updateOne({
            'id': req.body.id
        }, options, {
            multi: true
        }).exec((err, result) => {
            if (err) {
                logger.error(err.message, 'scheduleController:updateMeeting()', 10)
                let apiResponse = response.generate(true, 'Failed to update meeting details', 500, null)
                reject(apiResponse)
            } else if (check.isEmpty(result)) {
                logger.error('No Meeting Found to update', 'scheduleController:updateMeeting()',10)
                let apiResponse = response.generate(true, 'No Meeting Found to update', 500, null)
                res.send(apiResponse)
            } else {
                let apiResponse = response.generate(false, 'Meeting Update', 200, result);
                res.send(apiResponse)
            }
        }); //end model
    } //end else
} // end updateMeeting function 

let deleteMeeting = (req, res) => {
    if(check.isEmpty(req.body.id)){
        logger.error('id is missing', 'scheduleController:deleteMeeting()', 5)
        let apiResponse = response.generate(true, 'id is missing', 400, null)
        res.send(apiResponse)
    }
    else{
    ScheduleModel.remove({
        'id': req.body.id
    }, (err, result) => {
        if (err) {
            logger.error(err.message, 'scheduleController:deleteMeeting()', 10)
            let apiResponse = response.generate(true, 'Error Occured', 500, null)
            res.send(apiResponse)
        } else if (check.isEmpty(result)) {
            logger.error('No List Found to deleted', 'scheduleController:deleteMeeting()',10)
            let apiResponse = response.generate(true, 'No List Found to deleted', 404, null)
            res.send(apiResponse)
        } else {
            logger.info("List deleted", "scheduleController:deleteMeeting()",10)
            let apiResponse = response.generate(false, 'List Deleted', 200, result)
            res.send(apiResponse)
        }
    })
}
} //end deleteList

let getAllSingleUserSchedule = (req, res) => {
        ScheduleModel.find({
                'participateId': req.params.userId
            })
            .select('-_id -__v')
            .lean()
            .exec((err, result) => {
                if (err) {
                    logger.error(err.message, 'scheduleController:getAllSingleUserSchedule()', 10)
                    let apiResponse = response.generate(true, 'Failed To Find Schedule Details', 500, null)
                    res.send(apiResponse)
                } else if (check.isEmpty(result)) {
                    logger.error('No User Found', 'scheduleController:getAllSingleUserSchedule()',10)
                    let apiResponse = response.generate(true, 'No Schedule Found', 403, null)
                    res.send(apiResponse)
                } else {
                    logger.info('Schedule Found', 'scheduleController:getAllSingleUserSchedule()',10)
                    let apiResponse = response.generate(false, 'Schedule Found', 200, result)
                    res.send(apiResponse)
                }
            })
} // end get All Schedule for user


let getAllSchedule = (req, res) => {
        ScheduleModel.find({
                'adminId': req.params.adminId
            })
            .select('-_id -__v')
            .lean()
            .exec((err, result) => {
                if (err) {
                    logger.error(err.message, 'scheduleController:getAllSchedule()', 10)
                    let apiResponse = response.generate(true, 'Failed To Find Schedule Details', 500, null)
                    res.send(apiResponse)
                } else if (check.isEmpty(result)) {
                    logger.error('No Schedule Found', 'scheduleController:getAllSchedule()',10)
                    let apiResponse = response.generate(true, 'No Schedule Found', 403, null)
                    res.send(apiResponse)
                } else {
                    logger.info('All Schedule Found', 'scheduleController:getAllSchedule()',10)
                    let apiResponse = response.generate(false, 'All Schedule Found', 200, result)
                    res.send(apiResponse)
                }
            })
} // end get All Schedule

module.exports = {
    addMeeting: addMeeting,
    updateMeeting: updateMeeting,
    deleteMeeting: deleteMeeting,
    getAllSingleUserSchedule: getAllSingleUserSchedule,
    getAllSchedule: getAllSchedule
} // end