const { response, request } = require('express');
import request from "request";

require('dotenv').config();

let getHomePage = (req, res) => {
    return res.render("homepage.ejs");
}

let postWebhook = (req, res) => {
    let body = req.body;

    console.log(`\u{1F7EA} Received webhook:`);
    console.dir(body, { depth: null });
    if (body.object === "page") {
        body.entry.foreach(function(entry) {
            let webhook_event = entry.messaging[0];
            console.log(webhook_event);

            let sender_psid = webhook_event.sender.id;
            console.log('Sender PSID: ' + sender_psid);

            if(webhook_event.message){
                handleMessage(sender_psid, webhook_event.message);
            }else if (webhook_event.postback){
                handlePostback(sender_psid, webhook_event.postback)
            }
        })
        res.status(200).send("EVENT_RECEIVED");
    } else {
        res.sendStatus(404);
    }
}

let getWebhook = (req, res) => {

    let VERIFY_TOKEN = process.env.VERIFY_TOKEN;
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    
    if (mode && token) {
        // Check the mode and token sent is correct
        if (mode === "subscribe" && token === VERIFY_TOKEN) {
            // Respond with the challenge token from the request
            console.log("WEBHOOK_VERIFIED");
            res.status(200).send(challenge);
        } else {
            // Respond with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);
        }
    }
}

function handleMessage(sender_psid, received_message) {
    let response;

    if(received_message.text){
        response = {
            "text": `You sent the message: "${received_message.text}". Now send me an attachment!`
        }
    }

    callSendAPI(sender_psid, response);
}

function handlePostback(sender_psid, received_postback) {
    let request_body = {
        "recipient": {
            "id": sender_psid
        },
        "message":  response
    }

    request({
        "uri": "https://graph.facebook.com/v2.6/me/messages",
        "qs": {"access_token": process.env.PAGE_ACCESS_TOKEN},
        "method": "POST",
        "json": request_body
    }, (err, res, body)=> {
        if(!err){
            console.log('message sent')
        }else{
            console.log('Unable to send message:' + err);
        }
    })
}

function callSendAPI(sender_psid, response) {}

module.exports = {
    getHomePage: getHomePage,
    postWebhook: postWebhook,
    getWebhook: getWebhook
}
