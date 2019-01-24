const dynamoose = require("dynamoose");

const options = {
	create: false, // Create table in DB, if it does not exist,
	update: true, // Update remote indexes if they do not match local index structure
}

const messageSchema = new dynamoose.Schema({
	id: {
		type: String,
		hashKey: true,
	},
	message: {
		type: String,
	},
	messageTitle: {
		type: String,
	},
	users: {
		type: [String],
	},
	agencyId: {
		type: String,
	}
});

exports.Message = dynamoose.model('wogi-messages', messageSchema, options);