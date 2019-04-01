'use strict'
/**
 * Module Dependencies
 */
const mongoose = require('mongoose'),
Schema = mongoose.Schema;
const time = require('../libs/timeLib');

let scheduleSchema = new Schema({
    id: {
        type: String,
        default: '',
        index: true,
        unique: true
    },
    adminId:{
        type: String,
        default:''
    },
    adminName:{
        type: String,
        default: ''
    },
    eventName:{
        type: String,
        default: ''
    },
    start:{
        type: Number,
        default: 0
    },
    end:{
        type: Number,
        default: 0
    },
    venue:{
        type: String,
        default: ''
    },
    description:{
        type: String,
        default: ''
    },
    participateId:{
        type: String,
        default: ''
    },
    participateName:{
        type: String,
        default: ''
    },
    createdOn:{
        type: Date,
        default: time.now()
    },
    modifiedOn:{
        type: Date,
        default: time.now()
    }
});

module.exports = mongoose.model('ScheduleModel', scheduleSchema);
