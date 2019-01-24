const axios = require("axios");

exports.handler = async (chatId, message) => {
	try {

		let msg = {
			"text": message
		}
		let msgWithButton = msg = {
			"attachment": {
				"type": "template",
				"payload": {
					"template_type": "button",
					"text": message,
					"buttons": [
						{
							"type": "postback",
							"title": "Yes",
							"payload": "{ messageDeliveryId, optionValue: \"Yes\" }"
						},
						{
							"type": "postback",
							"title": "No",
							"payload": "{ messageDeliveryId, optionValue: \"Yes\" }"
						},
						{
							"type": "postback",
							"title": "Don't bother me",
							"payload": "{ messageDeliveryId, optionValue: \"Yes\" }"
						}
					]
				}
			}
		}
		console.log("Sending message through messenger...");
		const result = await callMessengerSendAPI(chatId, msgWithButton);
		deliveryStatus = "SUCCESS";
		console.log("Messenger result is: ", result);
		return deliveryStatus;
	}
	catch (e) {
		console.log('error is: ', e);
		if (e.response.status >= 400 && e.response.status < 500) {
			deliveryStatus = "FAIL";
		}
		else {
			throw e;
		}
	}

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

