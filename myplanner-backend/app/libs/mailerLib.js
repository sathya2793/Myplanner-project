const nodeMailer = require('nodemailer');
const appConfig = require('./../../config/appConfig');
let transporter = nodeMailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth:{
        user: appConfig.email,
        pass: appConfig.password
    }
});

let mailOptions = {
    from: appConfig.email,
    to: '',
    subject: '',
    html:''
};

let autoEmail = (reciever,subject,msg) =>{
    mailOptions.to = reciever;
    mailOptions.subject = subject;
    mailOptions.html = msg;

    transporter.sendMail(mailOptions, function(err, info){
        if(err){
            console.log(err);
        }else{
            console.log('Email Sented ' + info.response);
        }
    });
}//end autoEmail

module.exports = {
    autoEmail: autoEmail
}