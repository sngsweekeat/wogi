/*
 * Starter Project for Messenger Platform Quick Start Tutorial
 *
 * Remix this as the starting point for following the Messenger Platform
 * quick start tutorial.
 *
 * https://developers.facebook.com/docs/messenger-platform/getting-started/quick-start/
 *
 */

'use strict';
require('dotenv').load();
// Imports dependencies and set up http server
const
  request = require('request'),
  express = require('express'),
  body_parser = require('body-parser'),
  app = express().use(body_parser.json()); // creates express http server

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening: '));

// Accepts POST requests at /webhook endpoint
app.post('/webhook', (req, res) => {
  console.log("receiing post");
  // Parse the request body from the POST
  let body = req.body;
  // console.log(req);
  // Check the webhook event is from a Page subscription
  if (body.object === 'page') {

    // Iterate over each entry - there may be multiple if batched
    body.entry.forEach(function(entry) {

    // Gets the body of the webhook event
    let webhook_event = entry.messaging[0];
    console.log(webhook_event);

    // Get the sender PSID
    let sender_psid = webhook_event.sender.id;
    console.log('Sender PSID: ' + sender_psid);


    if (webhook_event.message) {
      handleMessage(sender_psid, webhook_event.message);
    } else if (webhook_event.postback) {
      handlePostback(sender_psid, webhook_event.postback);
    } else if (webhook_event.read) {
      handleReadEvent(sender_psid, webhook_event.read);
    }
  });


    // Return a '200 OK' response to all events
    res.status(200).send('EVENT_RECEIVED');

  } else {
    // Return a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }

});

// Accepts GET requests at the /webhook endpoint
app.get('/webhook', (req, res) => {

  /** UPDATE YOUR VERIFY TOKEN **/
  const VERIFY_TOKEN = "wogi-test-token";

  // Parse params from the webhook verification request
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];

  // Check if a token and mode were sent
  if (mode && token) {

    // Check the mode and token sent are correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {

      // Respond with 200 OK and challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);

    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});

// Accepts GET requests at the /webhook endpoint
app.get('/sendmsg', (req, res) => {

  /** UPDATE YOUR VERIFY TOKEN **/
  const VERIFY_TOKEN = "wogi-test-token";

  // Parse params from the webhook verification request
  const message = req.query['message'];
  const psid = req.query["psid"];
  console.log("sending message: ",message);
  console.log("psid is: ",psid);
  const response = {
      "text": message
    }
  callSendAPI(psid, response);

  res.status(200).send('EVENT_RECEIVED');
});

// Handles messages events
function handleMessage(sender_psid, received_message) {
  console.log("handleMessage...");
  let response;

  // Check if the message contains text
  if (received_message.text) {

    // Create the payload for a basic text message
    response = {
      "text": `You sent the message: "${received_message.text}". Now send me an image!`
    }
  }

  // Sends the response message
  callSendAPI(sender_psid, response);
}

// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {

}

// Handles messaging_postbacks events
function handleReadEvent(sender_psid, read_event) {
  console.log("read event triggered: ",read_event);
}


// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
  console.log("callSendAPI...");
  // Construct the message body
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }

  // Send the HTTP request to the Messenger Platform
  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": process.env.PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent!')
    } else {
      console.error("Unable to send message:" + err);
    }
  });
}