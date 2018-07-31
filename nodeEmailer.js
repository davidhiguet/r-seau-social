var nodemailer = require("nodemailer");
var smtpTransport = require("nodemailer-smtp-transport");
module.exports.sendEmail = (mailOptions) => {



var transport = nodemailer.createTransport(smtpTransport( {
    service: "Gmail",
    host: 'smtp.gmail.com',
    auth: {
        user: "davidhiguet@gmail.com",
        pass: "Nala240984"
    }
}));


    transport.sendMail(mailOptions, function(error, response) {
      if (error) {
        console.log(error);
      } else {
        console.log("Message sent: " + response.message);
      }

      // if you don't want to use this transport object anymore, uncomment following line
      //smtpTransport.close(); // shut down the connection pool, no more messages
    });
}