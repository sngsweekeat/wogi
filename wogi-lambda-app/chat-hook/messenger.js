const User = require('./user').User;
const axios = require('axios');

exports.getHandler = async (event, context) => {
  const challenge = event.queryStringParameters['hub.challenge'];

  return {
    statusCode: 200,
    body: challenge,
  };
}

// event.body looks something like this:
// {
//   "object": "page",
//   "entry": [
//       {
//           "id": "303476453638501",
//           "time": 1548234181533,
//           "messaging": [
//               {
//                   "sender": {
//                       "id": "<sender-id>"
//                   },
//                   "recipient": {
//                       "id": "<recipient-id>"
//                   },
//                   "timestamp": 1548234181191,
//                   "message": {
//                       "mid": "L-7mz6nIxyI2RVYl59PTzlJUfq5-1CTjkE5jE10-m_8OPI0r7XoYbxJYTbVcv_OpN2nkEf4fusv6NpJVQRjc4Q",
//                       "seq": 6187,
//                       "text": "<message text>"
//                   }
//               }
//           ]
//       }
//   ]
// }

exports.postHandler = async (event, context) => {
  try {
    const body = JSON.parse(event.body)
    const messaging = body.entry[0].messaging[0];

    if (!messaging.message.text) {
      return {
        statusCode: 204,
      };
    }

    const messageText = messaging.message.text;
    const chatId = messaging.sender.id;

    if (!isValidOtp(messageText)) {
      const response = await callMessengerSendAPI(chatId, "Please enter a valid OTP to register.");
      return {
        statusCode: 200,
        body: JSON.stringify({
          errors: [
            {
              message: "Invalid OTP given",
            },
          ],
        }),
      };
    }

    const otp = messageText;
    const user = await User.queryOne('otp').eq(otp).exec();

    if (!user) {
      await callMessengerSendAPI(chatId, "We couldn't find a user associated with the given OTP. Please try and generate a new one");

      return {
        statusCode: 200,
        body: JSON.stringify({
          errors: [
            {
              message: 'Could not find a user associated with the given OTP.'
            }
          ]
        })
      }
    }

    user.platform = "MESSENGER";
    user.chatId = chatId;
    await user.save()
    await callMessengerSendAPI(chatId, "You have successfully registered with Wogi on Facebook Messenger!");

    return {
      statusCode: 204,
    }
  } catch (e) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        errors: [
          {
            message: `Someting went wrong: ${e.message}`,
          },
        ],
      }),
    }
  }
}

const isValidOtp = (messageText) => {
  return messageText.match(/^WOGI-REG.*/);
}

const FB_MESSENGER_URL = "https://graph.facebook.com/v2.6/me/messages";

const callMessengerSendAPI = async (chatId, message) => {
  console.log("callMessengerSendAPI...");
  // Construct the message body
  const body = {
    "recipient": {
      "id": chatId,
    },
    "message":  { text: message },
  }
  const params = { "access_token": process.env.PAGE_ACCESS_TOKEN };
  try {
    const response = await axios.post(FB_MESSENGER_URL,body,{params});
    return response;
  } catch(e) {
    console.log("Error while calling Messenger Send API", e);
  }
}