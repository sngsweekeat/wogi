const dynamoose = require('dynamoose');

const messageDeliverySchema = new dynamoose.Schema({
  id: {
    type: String,
    hashKey: true,
  },
  userId: {
    type: String,
  },
  chatId: {
    type: String,
  },
  platform: {
    type: String,
  },
  message: {
    type: String,
  },
  deliveryStatus: {
    type: String,
  },
  messageId: {
    type: String,
  },
  responseStatus: {
    type: String,
  },
});
const options = {
  create: false, // Create table in DB, if it does not exist,
  update: true, // Update remote indexes if they do not match local index structure
};

exports.MessageDelivery = dynamoose.model('wogi-message-deliveries', messageDeliverySchema, options);
