var nodemailer = require("nodemailer");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const port = "3007";

var server = app.listen(port);

app.use(bodyParser.json());

app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

var smtpTransport = nodemailer.createTransport({
    host: "smtp.jasamarga.co.id",
    secure: false,
    port: "587",
    auth: {
        //type: 'OAuth2',
        user: "e-procurement@jmto.co.id",
        pass: "tehgelas123!",
    },
    tls: {
        secure: false,
        ignoreTLS: true,
        rejectUnauthorized: false,
    },
});

console.log("listen on port", server?.address()?.port);

app.post("/api/mail-testing", (req, res) => {
    // const image = req.image;
    const mails = req.body.email;
    const subject = req.body.subject;
    const message = req.body.message;
    var mainOptions = {
        from: "e-procurement@jmto.co.id",
        to: `${mails}`,
        subject: `${subject}`,
        pool: true,

        html: `${message}`,
    };

    smtpTransport.sendMail(mainOptions, function (err, info) {
        if (err) {
            console.log(err);
            res.send({ err: err });
        } else {
            res.send("oke");
        }
    });
});
