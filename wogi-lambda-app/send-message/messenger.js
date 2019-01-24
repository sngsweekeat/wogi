const axios = require('axios');

const FB_MESSENGER_URL = 'https://graph.facebook.com/v2.6/me/messages';

const callMessengerSendAPI = async (chatId, message) => {
  console.log('callMessengerSendAPI...');
  // Construct the message body
  const body = {
    recipient: {
      id: chatId,
    },
    message,
  };
  const params = { access_token: process.env.PAGE_ACCESS_TOKEN };
  // Send the HTTP request to the Messenger Platform
  const response = await axios.post(FB_MESSENGER_URL, body, { params });
  return response;
};

const createMessageWithOptions = (messageDeliveryId, text, options) => {
  const buttons = options.map((option) => {
    const button = {
      type: 'postback',
      title: option,
      payload: JSON.stringify({
        messageDeliveryId,
        optionSelected: option,
      }),
    };
    return button;
  });
  const msgWithButton = {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'button',
        text,
        buttons,
      },
    },
  };
  return msgWithButton;
};

const createMessageWithText = text => ({ text });

const constructMessageText = ({ message, messageTitle, agencyId }) => `_From agency: ${agencyId}_\n*${messageTitle}*\n\n${message}`;

exports.handler = async ({
  chatId, message, messageDeliveryId, options, messageTitle, agencyId,
}) => {
  let deliveryStatus;
  try {
    const messageText = constructMessageText({ message, messageTitle, agencyId });
    let messageToSend;
    if (options) {
      messageToSend = createMessageWithOptions(messageDeliveryId, messageText, options);
    } else {
      messageToSend = createMessageWithText(messageText);
    }

    console.log('Sending message through messenger...');
    const result = await callMessengerSendAPI(chatId, messageToSend);
    deliveryStatus = 'SUCCESS';
    console.log('Messenger result is: ', result);
    return deliveryStatus;
  } catch (e) {
    console.log('error is: ', e);
    if (e.response.status >= 400 && e.response.status < 500) {
      deliveryStatus = 'FAIL';
    } else {
      throw e;
    }
    return deliveryStatus;
  }
};
