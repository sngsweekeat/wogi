const axios = require("axios");

exports.handler = async (chatId, message) => {
  let msg = {
    "text": message
  }
  console.log("Sending message through messenger...");
  result = await callMessengerSendAPI(chatId, msg);
  deliveryStatus = "SUCCESS";
  console.log("Messenger result is: ", result);

}

const FB_MESSENGER_URL = "https://graph.facebook.com/v2.6/me/messages";

const callMessengerSendAPI = async (sender_psid, message) => {
	console.log("callMessengerSendAPI...");
	// Construct the message body
	const body = {
		"recipient": {
			"id": sender_psid
		},
		"message": message
	}
	const params = { "access_token": process.env.PAGE_ACCESS_TOKEN };
	// Send the HTTP request to the Messenger Platform
	const response = await axios.post(FB_MESSENGER_URL, body, { params });
	return response;
}

