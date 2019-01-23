const dynamoose = require("dynamoose");

module.exports = function MessageDelivery() {

	const options = {
		create: false, // Create table in DB, if it does not exist,
		update: true, // Update remote indexes if they do not match local index structure
	}

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
		message: {
			type: String,
		},
		deliveryStatus: {
			type: String,
		},
		messageId: {
			type: String
		}
	});
	const MessageDelivery = dynamoose.model('wogi-message-deliveries', messageDeliverySchema, options);
	return MessageDelivery;
}
