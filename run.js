const {
    Client,
    Location,
    List,
    Buttons,
    LocalAuth,
    MessageMedia,
} = require("./index");
const qrcode = require("qrcode-terminal");
var nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const md5 = require("md5");
const multer = require("multer");
var mysql = require("mysql");
const port = "3007";
var server = app.listen(port);
const util = require("util");

console.log("listen on port", server?.address()?.port);

app.use(bodyParser.json());

app.use(
    bodyParser.urlencoded({
        // to support URL-encoded bodies
        extended: true,
    })
);

var connection = mysql.createConnection({
    host: "172.16.4.59",
    user: "tavsir",
    password: "jmt02022!#",
    database: "tavsir_dev",
});

var connectionprod = mysql.createConnection({
    host: "172.16.4.48",
    user: "tavsir",
    password: "jmt02022!#",
    database: "tavsir_dev",
});

const queryAsync = util.promisify(connectionprod.query).bind(connectionprod);
const queryAsyncdev = util.promisify(connection.query).bind(connection);

var connectioncim = mysql.createConnection({
    host: "172.16.4.25",
    user: "jmto",
    password: "J4asamargaTO2022!#",
    database: "jmto_hrd",
    port: "14045",
});

var connectionjmtc = mysql.createConnection({
    host: "172.16.4.48",
    user: "tavsir",
    password: "jmt02022!#",
    database: "chatbot_jmtc",
});
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});

var upload = multer({ storage: storage });
const fs = require("fs");
const { stringify } = require("querystring");
const { error } = require("console");
const e = require("express");
const dir = "./uploads";

var smtpTransport = nodemailer.createTransport({
    host: "mail.jmto.co.id",
    secure: false,
    port: "26",
    auth: {
        //type: 'OAuth2',
        user: "travoymerchant@jmto.co.id",
        pass: "travoymerchant",
    },
    tls: {
        secure: false,
        ignoreTLS: true,
        rejectUnauthorized: false,
    },
});

const client = new Client({
    authStrategy: new LocalAuth(),
    // proxyAuthentication: { username: 'username', password: 'password' },
    puppeteer: {
        // args: ['--proxy-server=proxy-server-that-requires-authentication.example.com'],
        headless: true,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-extensions",
        ],
    },
});

client.initialize();

client.on("loading_screen", (percent, message) => {
    console.log("LOADING SCREEN", percent, message);
});

client.on("qr", (qr) => {
    // NOTE: This event will not be fired if a session is specified.
    console.log("QR RECEIVED", qr);
    qrcode.generate(qr, { small: true });
});

client.on("authenticated", () => {
    console.log("AUTHENTICATED");
});

client.on("auth_failure", (msg) => {
    // Fired if session restore was unsuccessful
    console.error("AUTHENTICATION FAILURE", msg);
});

client.on("ready", () => {
    console.log("READY");

    app.post("/api/resetpwd", function (req, res) {
        var id = req.body.id;
        let phone = req.body.cust_phone;
        let chatIds = convertPhoneNumber(phone) + "@c.us";
        let r = Math.floor(100000 + Math.random() * 900000);
        const saltRounds = 10;
        const myPlaintextPassword = r.toString();
        const salt = bcrypt.genSaltSync(saltRounds);
        const hash = bcrypt.hashSync(myPlaintextPassword, salt);
        const message = `RAHASIA! Password QR Anda adalah : ${myPlaintextPassword}`;
        try {
            client
                .sendMessage(chatIds, message)
                .then(() => {
                    let get_flags =
                        "UPDATE ref_voucher set password  = '" +
                        hash +
                        "'where id =" +
                        id;
                    connection.query(get_flags);
                    res.send(hash);
                })
                .catch((erro) => {
                    console.error("Error when sending: ", erro); //return object error
                    res.send(erro);
                });
        } catch (error) {
            console.error("Error when sending: ", error);
            res.send(error);
        }
    });

    app.post("/api/resetpwdprod", function (req, res) {
        var id = req.body.id;
        let phone = req.body.cust_phone;
        let chatIds = convertPhoneNumber(phone) + "@c.us";
        //let r = (Math.random() + 1).toString(36).substring(7);
        let r = Math.floor(100000 + Math.random() * 900000);
        const saltRounds = 10;
        const myPlaintextPassword = r.toString();
        const salt = bcrypt.genSaltSync(saltRounds);
        const hash = bcrypt.hashSync(myPlaintextPassword, salt);
        // const message = `Password QR Paystation anda adalah : ${myPlaintextPassword}`;
        const message = `RAHASIA! Password QR Anda adalah : ${myPlaintextPassword}`;

        try {
            client
                .sendMessage(chatIds, message)
                .then(() => {
                    // const hasha = new String(hash);
                    let get_flags =
                        "UPDATE ref_voucher set password  = '" +
                        hash +
                        "'where id =" +
                        id;
                    connectionprod.query(get_flags);
                    res.send(hash);
                })
                .catch((erro) => {
                    console.error("Error when sending: ", erro); //return object error
                    res.send(erro);
                });
        } catch (error) {
            console.error("Error when sending: ", error);
            res.send(error);
        }
    });

    app.post("/api/resetpwdcim", function (req, res) {
        var nik = req.body.nik;
        let phone = req.body.phones;
        let chatIds = convertPhoneNumber(phone) + "@c.us";
        let r = (Math.random() + 1).toString(36).substring(7);
        const saltRounds = 10;
        const myPlaintextPassword = r;
        const hash = md5(myPlaintextPassword);

        try {
            client.sendMessage(
                chatIds,
                `Password My-Data Anda adalah : ${myPlaintextPassword}`
            );
            client
                .sendMessage(
                    chatIds,
                    "Segera lakukan perubahan password My-Data anda pada halaman profile!"
                )
                .then(() => {
                    try {
                        let get_flags =
                            "UPDATE users set password  = '" +
                            hash +
                            "'where nik =" +
                            nik;

                        console.log("Yeay Success");
                        connectioncim.query(get_flags);
                        res.send({
                            status: 1,
                            message: "Berhasil Reset Password",
                        });
                    } catch (error) {
                        console.log("Catching Up");
                    }
                })
                .catch((erro) => {
                    console.error("Error when sending: ", erro); //return object error
                    res.send(erro);
                });
        } catch (error) {
            res.send("Error");
        }
    });
    app.post("/api/image-upload", upload.single("image"), (req, res) => {
        const image = req.image;
        const trx_id = req.body.trx_id;
        let phone = req.body.cust_phone;
        let chatIds = convertPhoneNumber(phone) + "@c.us";
        // const capt = `Selamat, Transaksi kamu dengan id : ${trx_id} telah berhasil kami terima`;
        // const sponsor =
        //     "Download aplikasi Travoy untuk melakukan pemesanan di rest area lebih mudah dan cepat";

        try {
            async function sendImage(client, chatIds, ack = "", filesnames) {
                return new Promise(async function (resolve, reject) {
                    var media = MessageMedia.fromFilePath(
                        "./uploads/" + filesnames
                    );
                    await client
                        .sendMessage(chatIds, media, { caption: ack })
                        .then((res) => resolve(res))
                        .catch((error) =>
                            reject("Can not send message.", error)
                        );
                });
            }

            async function fetchData(id) {
                try {
                    const results = await queryAsync(
                        'SELECT * FROM trans_order a join ref_tenant b on a.tenant_id = b.id where a.order_id ="' +
                            id +
                            '"'
                    );

                    const result2 = await queryAsyncdev(
                        'SELECT * FROM trans_order a join ref_tenant b on a.tenant_id = b.id where a.order_id ="' +
                            id +
                            '"'
                    );

                    const myVariable = results.length > 0 ? results : result2;

                    console.log("Query results:", myVariable);

                    return myVariable;
                } catch (e) {
                    console.error("Error executing query:", e);
                }
            }
            // const media = MessageMedia.fromFilePath('./uploads/'+req.file.originalname);
            const ack = req.file.originalname;
            const filesnames = ack;
            fetchData(trx_id).then((resultss) => {
                console.log("dsadasd", resultss[0]);
                const a = resultss[0]["name"];
                const b = resultss[0]["total"];
                const c = resultss[0]["status"];
                const rupiahFormat = b
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");

                const capt =
                    c === "REFUND"
                        ? `Transaksi kamu di *${a}*, dengan total transaksi *Rp${rupiahFormat}* telah berhasil dikembalikan!`
                        : `Selamat, Transaksi kamu di *${a}*, dengan total transaksi *Rp${rupiahFormat}* telah berhasil kami terima🎉\n\nTerima kasih telah belanja di ${a}😊`;

                const finalCapt =
                    capt + `\n\n Dengan Getpay, semua #JadiAdaPeluang`;

                sendImage(client, chatIds, finalCapt, filesnames)
                    .then((result) => {
                        // client.sendMessage(chatIds, sponsor).then(() => {
                        //     // client.sendMessage(chatIds, sponsor);
                        // });
                        console.log("Result: ", result); //return object success
                        fs.unlinkSync("./uploads/" + req.file.originalname);
                        res.send(result);
                    })
                    .catch((erro) => {
                        console.error("Error when sending: ", erro); //return object error
                    });
            });
        } catch (e) {
            console.log(e);
        }
    });
});

app.post("/api/mail-upload", upload.single("image"), (req, res) => {
    const image = req.image;
    let mails = req.body.cust_mail;

    async function fetchData(id) {
        try {
            const results = await queryAsync(
                'SELECT * FROM trans_order a join ref_tenant b on a.tenant_id = b.id where a.order_id ="' +
                    id +
                    '"'
            );
            const result2 = await queryAsyncdev(
                'SELECT * FROM trans_order a join ref_tenant b on a.tenant_id = b.id where a.order_id ="' +
                    id +
                    '"'
            );

            // Assign the result to a variable
            const myVariable = results.length > 0 ? results : result2;
            // Assign the result to a variable
            // const myVariable = results;

            console.log("Query results:", myVariable);

            return myVariable;
        } catch (e) {
            console.error("Error executing query:", e);
        }
    }

    fetchData(req.body.trx_id)
        .then((result) => {
            console.log(result);

            const a = result[0]["order_id"];
            const b = result[0]["name"];
            const c = result[0]["total"];
            const d = result[0]["status"];
            const rupiahFormat = c
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ".");

            const datas =
                d === "REFUND"
                    ? `
            <h4>Refund Berhasil🎉 </h4>
            Transaksi kamu di <b>${b}</b>, dengan total transaksi <b>Rp${rupiahFormat}</b> telah berhasil dikembalikan!
            <br><br>
            <br><br>
            <br><img src='cid:unique@cid' width='50%' height='50%'/><br>
            Dengan Getpay, semua #JadiAdaPeluang`
                    : `
            <h4>Transaksi Berhasil🎉 </h4>
            Transaksi kamu di ${b}, dengan total transaksi <b>Rp${rupiahFormat}</b> telah berhasil kami terima🎉
            <br><br>
            Terima kasih telah belanja di ${b}😊
            <br><br>
            <br><img src='cid:unique@cid' width='50%' height='50%'/><br>
            Dengan Getpay, semua #JadiAdaPeluang`;

            return datas;
        })
        .then((datas) => {
            console.log("asdasd", datas);
            var mainOptions = {
                from: "travoymerchant@jmto.co.id",
                to: mails,
                subject: "Get Pay E-Receipt" + req.body.trx_id,
                pool: true,
                attachments: [
                    {
                        // stream as an attachment
                        filename: req.file.originalname,
                        content: fs.createReadStream(
                            "./uploads/" + req.file.originalname
                        ),
                        cid: "unique@cid",
                    },
                ],
                html: datas,
                //  +'<img src="cid:'+cid+'"/>'
            };

            smtpTransport.sendMail(mainOptions, function (err, info) {
                if (err) {
                    res.send(err);
                } else {
                    fs.unlinkSync("./uploads/" + req.file.originalname);
                    res.send({
                        status: "1",
                        head: "Success",
                        detail: req.file.originalname,
                    });
                }
            });
        });
});

app.post("/api/mail-register", function (req, res) {
    const { email, link, uuid } = req.body;

    const datas =`
            <h4> Link Aktivasi 🎉 </h4>
            Berikut link aktivasi kamu ${link}/${uuid}
            <br><br>
            Dengan Getpay, semua #JadiAdaPeluang`

    var mainOptions = {
        from: "travoymerchant@jmto.co.id",
        to: email,
        subject: "Link Aktivasi Getpay",
        pool: true,
        attachments: [],
        html: datas,
    };

    smtpTransport.sendMail(mainOptions, function (err, info) {
        if (err) {
            // res.send(err);
            res.send({
                status: "0",
                head: "Failed",
                detail: "Email Aktivasi Gagal Terkirim",
            });
        } else {
            res.send({
                status: "1",
                head: "Success",
                detail: "Email Aktivasi Terkirim",
            });
        }
    });
});

function convertPhoneNumber(phoneNumber) {
    // Remove all non-digit characters from the phone number
    console.log("//", phoneNumber);
    const cleanedNumber = phoneNumber.replace(/\D/g, "");

    // Check if the first digit is 0 and replace it with "62"
    if (cleanedNumber.charAt(0) === "0") {
        const convertNumber = "62" + cleanedNumber.substr(1);
        return convertNumber;
    }

    // Check if the first two digits are already "62" and skip adding the country code
    if (cleanedNumber.substr(0, 2) === "62") {
        return cleanedNumber;
    }

    // Add the country code "62" to the cleaned number
    const convertedNumber = "62" + cleanedNumber;

    return convertedNumber;
}

client.on("message", async (msg) => {
    console.log("MESSAGE RECEIVED", msg);

    // if (msg.body === '!ping reply') {
    //     // Send a new message as a reply to the current one
    //     msg.reply('pong');

    // } else if (msg.body === '!ping') {
    //     // Send a new message to the same chat
    //     client.sendMessage(msg.from, 'pong');

    // } else if (msg.body.startsWith('!sendto ')) {
    //     // Direct send a new message to specific id
    //     let number = msg.body.split(' ')[1];
    //     let messageIndex = msg.body.indexOf(number) + number.length;
    //     let message = msg.body.slice(messageIndex, msg.body.length);
    //     number = number.includes('@c.us') ? number : `${number}@c.us`;
    //     let chat = await msg.getChat();
    //     chat.sendSeen();
    //     client.sendMessage(number, message);

    // } else if (msg.body.startsWith('!subject ')) {
    //     // Change the group subject
    //     let chat = await msg.getChat();
    //     if (chat.isGroup) {
    //         let newSubject = msg.body.slice(9);
    //         chat.setSubject(newSubject);
    //     } else {
    //         msg.reply('This command can only be used in a group!');
    //     }
    // } else if (msg.body.startsWith('!echo ')) {
    //     // Replies with the same message
    //     msg.reply(msg.body.slice(6));
    // } else if (msg.body.startsWith('!desc ')) {
    //     // Change the group description
    //     let chat = await msg.getChat();
    //     if (chat.isGroup) {
    //         let newDescription = msg.body.slice(6);
    //         chat.setDescription(newDescription);
    //     } else {
    //         msg.reply('This command can only be used in a group!');
    //     }
    // } else if (msg.body === '!leave') {
    //     // Leave the group
    //     let chat = await msg.getChat();
    //     if (chat.isGroup) {
    //         chat.leave();
    //     } else {
    //         msg.reply('This command can only be used in a group!');
    //     }
    // } else if (msg.body.startsWith('!join ')) {
    //     const inviteCode = msg.body.split(' ')[1];
    //     try {
    //         await client.acceptInvite(inviteCode);
    //         msg.reply('Joined the group!');
    //     } catch (e) {
    //         msg.reply('That invite code seems to be invalid.');
    //     }
    // } else if (msg.body === '!groupinfo') {
    //     let chat = await msg.getChat();
    //     if (chat.isGroup) {
    //         msg.reply(`
    //             *Group Details*
    //             Name: ${chat.name}
    //             Description: ${chat.description}
    //             Created At: ${chat.createdAt.toString()}
    //             Created By: ${chat.owner.user}
    //             Participant count: ${chat.participants.length}
    //         `);
    //     } else {
    //         msg.reply('This command can only be used in a group!');
    //     }
    // } else if (msg.body === '!chats') {
    //     const chats = await client.getChats();
    //     client.sendMessage(msg.from, `The bot has ${chats.length} chats open.`);
    // } else if (msg.body === '!info') {
    //     let info = client.info;
    //     client.sendMessage(msg.from, `
    //         *Connection info*
    //         User name: ${info.pushname}
    //         My number: ${info.wid.user}
    //         Platform: ${info.platform}
    //     `);
    // } else if (msg.body === '!mediainfo' && msg.hasMedia) {
    //     const attachmentData = await msg.downloadMedia();
    //     msg.reply(`
    //         *Media info*
    //         MimeType: ${attachmentData.mimetype}
    //         Filename: ${attachmentData.filename}
    //         Data (length): ${attachmentData.data.length}
    //     `);
    // } else if (msg.body === '!quoteinfo' && msg.hasQuotedMsg) {
    //     const quotedMsg = await msg.getQuotedMessage();

    //     quotedMsg.reply(`
    //         ID: ${quotedMsg.id._serialized}
    //         Type: ${quotedMsg.type}
    //         Author: ${quotedMsg.author || quotedMsg.from}
    //         Timestamp: ${quotedMsg.timestamp}
    //         Has Media? ${quotedMsg.hasMedia}
    //     `);
    // } else if (msg.body === '!resendmedia' && msg.hasQuotedMsg) {
    //     const quotedMsg = await msg.getQuotedMessage();
    //     if (quotedMsg.hasMedia) {
    //         const attachmentData = await quotedMsg.downloadMedia();
    //         client.sendMessage(msg.from, attachmentData, { caption: 'Here\'s your requested media.' });
    //     }
    // } else if (msg.body === '!location') {
    //     msg.reply(new Location(37.422, -122.084, 'Googleplex\nGoogle Headquarters'));
    // } else if (msg.location) {
    //     msg.reply(msg.location);
    // } else if (msg.body.startsWith('!status ')) {
    //     const newStatus = msg.body.split(' ')[1];
    //     await client.setStatus(newStatus);
    //     msg.reply(`Status was updated to *${newStatus}*`);
    // } else if (msg.body === '!mention') {
    //     const contact = await msg.getContact();
    //     const chat = await msg.getChat();
    //     chat.sendMessage(`Hi @${contact.number}!`, {
    //         mentions: [contact]
    //     });
    // } else if (msg.body === '!delete') {
    //     if (msg.hasQuotedMsg) {
    //         const quotedMsg = await msg.getQuotedMessage();
    //         if (quotedMsg.fromMe) {
    //             quotedMsg.delete(true);
    //         } else {
    //             msg.reply('I can only delete my own messages');
    //         }
    //     }
    // } else if (msg.body === '!pin') {
    //     const chat = await msg.getChat();
    //     await chat.pin();
    // } else if (msg.body === '!archive') {
    //     const chat = await msg.getChat();
    //     await chat.archive();
    // } else if (msg.body === '!mute') {
    //     const chat = await msg.getChat();
    //     // mute the chat for 20 seconds
    //     const unmuteDate = new Date();
    //     unmuteDate.setSeconds(unmuteDate.getSeconds() + 20);
    //     await chat.mute(unmuteDate);
    // } else if (msg.body === '!typing') {
    //     const chat = await msg.getChat();
    //     // simulates typing in the chat
    //     chat.sendStateTyping();
    // } else if (msg.body === '!recording') {
    //     const chat = await msg.getChat();
    //     // simulates recording audio in the chat
    //     chat.sendStateRecording();
    // } else if (msg.body === '!clearstate') {
    //     const chat = await msg.getChat();
    //     // stops typing or recording in the chat
    //     chat.clearState();
    // } else if (msg.body === '!jumpto') {
    //     if (msg.hasQuotedMsg) {
    //         const quotedMsg = await msg.getQuotedMessage();
    //         client.interface.openChatWindowAt(quotedMsg.id._serialized);
    //     }
    // } else if (msg.body === '!buttons') {
    //     let button = new Buttons('Button body', [{ body: 'bt1' }, { body: 'bt2' }, { body: 'bt3' }], 'title', 'footer');
    //     client.sendMessage(msg.from, button);
    // } else if (msg.body === '!list') {
    //     let sections = [{ title: 'sectionTitle', rows: [{ title: 'ListItem1', description: 'desc' }, { title: 'ListItem2' }] }];
    //     let list = new List('List body', 'btnText', sections, 'Title', 'footer');
    //     client.sendMessage(msg.from, list);
    // } else if (msg.body === '!reaction') {
    //     msg.react('👍');
    // }
});

client.on("message_create", (msg) => {
    // Fired on all message creations, including your own
    if (msg.fromMe) {
        // do stuff here
    }
});

// client.on("message_revoke_everyone", async (after, before) => {
//     // Fired whenever a message is deleted by anyone (including you)
//     console.log(after); // message after it was deleted.
//     if (before) {
//         console.log(before); // message before it was deleted.
//     }
// });

// client.on("message_revoke_me", async (msg) => {
//     // Fired whenever a message is only deleted in your own view.
//     console.log(msg.body); // message before it was deleted.
// });

client.on("message_ack", (msg, ack) => {
    /*
        == ACK VALUES ==
        ACK_ERROR: -1
        ACK_PENDING: 0
        ACK_SERVER: 1
        ACK_DEVICE: 2
        ACK_READ: 3
        ACK_PLAYED: 4
    */

    if (ack == 3) {
        // The message was read
    }
});

// client.on("group_join", (notification) => {
//     // User has joined or been added to the group.
//     console.log("join", notification);
//     notification.reply("User joined.");
// });

// client.on("group_leave", (notification) => {
//     // User has left or been kicked from the group.
//     console.log("leave", notification);
//     notification.reply("User left.");
// });

// client.on("group_update", (notification) => {
//     // Group picture, subject or description has been updated.
//     console.log("update", notification);
// });

// client.on("change_state", (state) => {
//     console.log("CHANGE STATE", state);
// });

// Change to false if you don't want to reject incoming calls
// let rejectCalls = true;

// client.on("call", async (call) => {
//     console.log("Call received, rejecting. GOTO Line 261 to disable", call);
//     if (rejectCalls) await call.reject();
//     await client.sendMessage(
//         call.from,
//         `[${call.fromMe ? "Outgoing" : "Incoming"}] Phone call from ${
//             call.from
//         }, type ${call.isGroup ? "group" : ""} ${
//             call.isVideo ? "video" : "audio"
//         } call. ${
//             rejectCalls
//                 ? "This call was automatically rejected by the script."
//                 : ""
//         }`
//     );
// });

client.on("disconnected", (reason) => {
    console.log("Client was logged out", reason);
});

// client.on("contact_changed", async (message, oldId, newId, isContact) => {
//     /** The time the event occurred. */
//     const eventTime = new Date(message.timestamp * 1000).toLocaleString();

//     console.log(
//         `The contact ${oldId.slice(0, -5)}` +
//             `${
//                 !isContact
//                     ? " that participates in group " +
//                       `${
//                           (await client.getChatById(message.to ?? message.from))
//                               .name
//                       } `
//                     : " "
//             }` +
//             `changed their phone number\nat ${eventTime}.\n` +
//             `Their new phone number is ${newId.slice(0, -5)}.\n`
//     );

//     /**
//      * Information about the {@name message}:
//      *
//      * 1. If a notification was emitted due to a group participant changing their phone number:
//      * {@name message.author} is a participant's id before the change.
//      * {@name message.recipients[0]} is a participant's id after the change (a new one).
//      *
//      * 1.1 If the contact who changed their number WAS in the current user's contact list at the time of the change:
//      * {@name message.to} is a group chat id the event was emitted in.
//      * {@name message.from} is a current user's id that got an notification message in the group.
//      * Also the {@name message.fromMe} is TRUE.
//      *
//      * 1.2 Otherwise:
//      * {@name message.from} is a group chat id the event was emitted in.
//      * {@name message.to} is @type {undefined}.
//      * Also {@name message.fromMe} is FALSE.
//      *
//      * 2. If a notification was emitted due to a contact changing their phone number:
//      * {@name message.templateParams} is an array of two user's ids:
//      * the old (before the change) and a new one, stored in alphabetical order.
//      * {@name message.from} is a current user's id that has a chat with a user,
//      * whos phone number was changed.
//      * {@name message.to} is a user's id (after the change), the current user has a chat with.
//      */
// });

// client.on("group_admin_changed", (notification) => {
//     if (notification.type === "promote") {
//         /**
//          * Emitted when a current user is promoted to an admin.
//          * {@link notification.author} is a user who performs the action of promoting/demoting the current user.
//          */
//         console.log(`You were promoted by ${notification.author}`);
//     } else if (notification.type === "demote")
//         /** Emitted when a current user is demoted to a regular user. */
//         console.log(`You were demoted by ${notification.author}`);
// });
