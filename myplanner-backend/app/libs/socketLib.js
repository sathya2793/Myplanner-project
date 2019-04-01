/**
 * modules dependencies.
 */

const socketio = require('socket.io');
const tokenLib = require("./tokenLib.js");
const response = require('./../libs/responseLib');
const check = require('../libs/checkLib');
const redisLib = require("./redisLib");
const events = require('events');
const mailer = require('./../libs/mailerLib');
const logger = require('./../libs/loggerLib');
const eventEmitter = new events.EventEmitter();
eventEmitter.setMaxListeners(100);
const mongoose = require('mongoose');
let UserModel = require('./../models/User');
mongoose.model('User');

let setServer = (server) => {

    let io = socketio.listen(server);
    io.set('origins', '*:*');
    let myIo = io.of('/');
    myIo.on('connection', (socket) => {

        console.log("Connected to Socket: " + socket.id);

        //handshaking with user
        /**
         * @api {listen} /verifyUser Verification the init user
         * @apiVersion 0.0.1
         * @apiGroup Listen 
         *@apiDescription This event <b>("verify-user")</b> has to be listened on the user's end to verify user
        */
        socket.emit("verify-user", "");
      

        // code to verify the user and make him online
         /**
         * @api {emit} /set-user Setting user online
         * @apiVersion 0.0.1
         * @apiGroup Emit 
         *@apiDescription This event <b>("set-user")</b> has to be emitted when a user comes online.
         *@apiExample The following data has to be emitted
                        {
                            userId  : string,
                            fullName: string
                        }
        */
       /**
         * @api {listen} /auth-error event
         * @apiVersion 0.0.1
         * @apiGroup Listen 
         *@apiDescription This event <b>("auth-error")</b>  has to be listened to know if any error has occurred on socket.
        */
        /**
         * @api {listen} /onlineUsersPlanner event
         * @apiVersion 0.0.1
         * @apiGroup Listen 
         *@apiDescription This event <b>("onlineUsersPlanner")</b>  has to be listened all the online user.
        */
        socket.on('set-user', (authToken) => {
            console.log("set-user called")
            tokenLib.verifyClaimWithoutSecret(authToken, (err, user) => {
                if (err) {
                    socket.emit('auth-error', {
                        status: 500,
                        error: 'Please provide correct auth token'
                    })
                } else {
                    console.log("user is verified..setting details");
                    let currentUser = user.data;
                    // setting socket user id 
                    socket.id = currentUser.userId
                    let key = currentUser.userId.toString();
                    let value = `${currentUser.firstName} ${currentUser.lastName}`

                    redisLib.setANewOnlineUserInHash("onlineUsersPlanner", key, value, (err, result) => {
                        if (err) {
                            console.log(`some error occurred`)
                        } else {
                            // getting online users list.
                            redisLib.getAllUsersInAHash('onlineUsersPlanner', (err, result) => {
                                console.log(`--- inside getAllUsersInAHas function ---`)
                                if (err) {
                                    console.log(err)
                                } else {
                                    console.log(`${value} is online`);
                                    io.of('/').emit("onlineUsersPlannerList", result);
                                }
                            })
                        }
                    })
                }
            })
        }) // end of listening set-user event

         /**
         * @api {emit} /notify when admin is online/offline
         * @apiVersion 0.0.1
         * @apiGroup Emit 
         *@apiDescription This event <b>("notify")</b> has to be emitted when a admin came to online/offline.
         *@apiExample The following data has to be emitted
         *
         {
           message: string
         }
        */
        socket.on('notify', (data) => {
            socket.broadcast.emit("msg",data);
        });//end notify.

         /**
         * @api {emit} /notifyById when admin create/update/delete or reminder the meeting
         * @apiVersion 0.0.1
         * @apiGroup Emit 
         *@apiDescription This event <b>("notifyById")</b> has to be emitted when admin create/update/delete or reminder the meeting to the  participate User.
         *@apiExample The following data has to be emitted
         *
         {
           status :string,
           message: string,
           userId :string,
           info: string
        }
        */
        socket.on('notifyById', (data) => {
            console.log("notifyById user");
            setTimeout(function () {
                eventEmitter.emit('sent-mail', data);
            }, 2000)
            io.of('/').emit(data.userId,data);
        });//end notifyById.

         /**
         * @api {emit} /disconnect when user logout
         * @apiVersion 0.0.1
         * @apiGroup Emit 
         *@apiDescription This event <b>("disconnect")</b> has to be emitted when a user logout/closed the browser.
         *@apiExample The following data has to be emitted
         *
         {
           userId :string,
           fullName: string
         } 
        */
        socket.on('disconnect', () => {
            //user will emit when disconnected
            //will remove user from online user list
            console.log("ID :"+ socket.id);
            if (socket.id) {
                redisLib.deleteUserFromHash('onlineUsersPlanner', socket.id);
            }
            redisLib.getAllUsersInAHash('onlineUsersPlanner', (err, result) => {
                if (err) {
                    logger.error(err.message, "socketLib.disconnect():getAllUsersInAHash", 10);
                }
                else {
                    console.log("Logout  :"+JSON.stringify(result));
                    myIo.emit("onlineUsersPlannerList", result);
                    socket.disconnect(true);
                }
            });//end getAllUsersInAHash
        });//end disconnect event

    });

 // send-mail and findone to emit
    eventEmitter.on('sent-mail', (data) => {
        console.log("\n\n\n send-mail"+JSON.stringify(data));
        UserModel.findOne({
            'userId': data.userId
        })
        .select('firstName lastName email -_id')
        .lean()
        .exec((err, result) => {
            if (err) {
                logger.error(err.message, 'socketLib:sent-mail', 10)
            } else if (check.isEmpty(result)) {
                logger.info('No User Found', 'socketLib:sent-mail')
                let apiResponse = response.generate(true, 'No User Found', 404, null)
                console.log(apiResponse)
            } else {
                let message,subject,details;
                let apiResponse = response.generate(false, 'User Found and sent Mail', 200, result)
                console.log(apiResponse)
                if(data.status == "Created"){
                    subject = "New Schedule assigned";
                    message = `<h1>Hi ${result.firstName} ${result.lastName},</h1>
                    <h3> Information about schedule </h3>
                    <table  cellpadding="10">
                    <tbody>
                      <tr>
                        <td>Event Name</td>
                        <td>${data.info.eventName}</td>
                      </tr>
                      <tr>
                        <td>Date & Timing</td>
                        <td>${new Date(data.info.start)} - ${new Date(data.info.end)}</td>
                      </tr>
                      <tr>
                        <td>Venue</td>
                        <td>${data.info.venue}</td>
                      </tr>
                      <tr>
                        <td>Purpose Description</td>
                        <td>${data.info.description}</td>
                      </tr>
                      <tr>
                        <td>Assigned By</td>
                        <td>${data.info.adminName}</td>
                      </tr>
                    </tbody>
                  </table>`;
                    details = {
                    email: result.email,
                    message: subject,
                    html: message
                };
                }
                else if (data.status == "Updated"){
                    subject ="Updated Schedule";
                    message = `<h1>Hi ${result.firstName} ${result.lastName},</h1>
                    <h3> Information about schedule </h3>
                    <table cellpadding="10">
                    <tbody>
                      <tr>
                        <td>Event Name</td>
                        <td>${data.info.eventName}</td>
                      </tr>
                      <tr>
                        <td>Date & Timing</td>
                        <td>${new Date(data.info.start)} - ${new Date(data.info.end)}</td>
                      </tr>
                      <tr>
                        <td>Venue</td>
                        <td>${data.info.venue}</td>
                      </tr>
                      <tr>
                        <td>Purpose Description</td>
                        <td>${data.info.description}</td>
                      </tr>
                      <tr>
                        <td>Assigned By</td>
                        <td>${data.info.adminName}</td>
                      </tr>
                    </tbody>
                  </table>`;

                 details = {
                    email: result.email,
                    message: subject,
                    html: message
                };
                }
                else if(data.status == "Deleted"){
                    subject ="cancelled schedule";
                    details = {
                    email: result.email,
                    message: subject,
                    html: data.message
                };
            }
            else if(data.status == "Reminder"){
                subject ="Gentle Reminder";
                details = {
                    email: result.email,
                    message: subject,
                    html: data.message
                };
            }
                else{

                }

                setTimeout(() => {
                    //Fire the 'mail' event:
                    eventEmitter.emit('mail', details);
                }, 2000);
            }
        })
    });

    let mailEventHandler = (data) => {
        console.log("mailEventHandler called for " + data.email);
        mailer.autoEmail(data.email, data.message, data.html);
    }
    
    //Assign the event handler to an event
    eventEmitter.on('mail', mailEventHandler);
}
module.exports = {
    setServer: setServer
}