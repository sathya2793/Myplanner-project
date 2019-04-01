'use strict'
/**
 * Module Dependencies
 */
const mongoose = require('mongoose'),
Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate');

let UserSchema = new Schema({
  userId: {
    type: String,
    index: true,
    unique: true
  },
  firstName: {
    type: String,
    default: ''
  },
  lastName: {
    type: String,
    default: ''
  },
  userName:{
    type: String,
    default: '',
    index: true,
    unique: true
  },
  password: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    index: true,
    default: ''
  },
  countryName: {
    type: String,
    default: ''
  },
  mobileNumber: {
    type: String,
    default: ''
  },
  secretToken: {
    type: String,
    default: ''
  },
  active: {
    type: Boolean,
    default: false
  },
  admin:{
    type: Boolean,
    default: false
  },
  createdOn: {
    type: Date,
    default: ""
  },
  updatedOn: {
    type: Date,
    default: ""
  }
});

UserSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('User', UserSchema);