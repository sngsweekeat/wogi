
/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 * @param {string} event.resource - Resource path.
 * @param {string} event.path - Path parameter.
 * @param {string} event.httpMethod - Incoming request's method name.
 * @param {Object} event.headers - Incoming request headers.
 * @param {Object} event.queryStringParameters - query string parameters.
 * @param {Object} event.pathParameters - path parameters.
 * @param {Object} event.stageVariables - Applicable stage variables.
 * @param {Object} event.requestContext - Request context, including authorizer-returned key-value pairs, requestId, sourceIp, etc.
 * @param {Object} event.body - A JSON string of the request payload.
 * @param {boolean} event.body.isBase64Encoded - A boolean flag to indicate if the applicable request payload is Base64-encode
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html
 * @param {Object} context
 * @param {string} context.logGroupName - Cloudwatch Log Group name
 * @param {string} context.logStreamName - Cloudwatch Log stream name.
 * @param {string} context.functionName - Lambda function name.
 * @param {string} context.memoryLimitInMB - Function memory.
 * @param {string} context.functionVersion - Function version identifier.
 * @param {function} context.getRemainingTimeInMillis - Time in milliseconds before function times out.
 * @param {string} context.awsRequestId - Lambda request ID.
 * @param {string} context.invokedFunctionArn - Function ARN.
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * @returns {boolean} object.isBase64Encoded - A boolean flag to indicate if the applicable payload is Base64-encode (binary support)
 * @returns {string} object.statusCode - HTTP Status Code to be returned to the client
 * @returns {Object} object.headers - HTTP Headers to be returned
 * @returns {Object} object.body - JSON Payload to be returned
 *
 */

const uuidv1 = require("uuid/v1");
const User = require("./user.model").User;
const MessageDelivery = require("./message-delivery.model").MessageDelivery;
let response;

const getUsers = (users) => {
	console.log("Executing query for users: ", users);
	return new Promise(function (resolve, reject) {
		User.scan('id').in(users).exec(function (err, userList) {
			console.log("Query executed...");
			if (err) reject(err);
			else resolve(userList);
		});
	});

}

const saveMessageDelivery = (msgDelivery) => {
	console.log("Saving MessageDelivery: ", msgDelivery);
	return new Promise(function (resolve, reject) {
		const msgDeliveryToSave = new MessageDelivery({ id: uuidv1(), ...msgDelivery });

		msgDeliveryToSave.save(function (err) {
			if (err) reject(err);
			else resolve();
		});
	});

}

exports.lambdaHandler = async (event, context) => {
	try {
		for (const record of event.Records) {
			console.log('Stream record: ', JSON.stringify(record, null, 2));
			if (record.eventName == 'INSERT') {
				let messageId = record.dynamodb.NewImage.id.S;
				let agencyId = record.dynamodb.NewImage.agencyId.S;
				let message = record.dynamodb.NewImage.message.S;
				let users = record.dynamodb.NewImage.users.SS;

				let usersToMsg = await getUsers(users);
				if (usersToMsg) {
					for (const userRecord of usersToMsg) {
						console.log(`Saving message id ${messageId} for user ${userRecord.id}`);
						const { chatId, platform } = userRecord;
						await saveMessageDelivery({ userId: userRecord.id, chatId, platform, message, messageId, deliveryStatus: "PENDING" })
					}
				}
			}

			console.log("Complete processing for current stream record");
		};

		response = {
			'statusCode': 200,
			'body': JSON.stringify({
				message: `# of Message record processed: ${event.Records.length}`,
				event,
			})
		}
	} catch (err) {
		console.log(err);
		return err;
	}

	return response
};
