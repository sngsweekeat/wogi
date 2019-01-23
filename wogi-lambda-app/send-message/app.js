
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

const createMessageDeliveryObj = require("./message-delivery.model")
const axios = require("axios");
let response;

const saveMessageDelivery = (msgDelivery) => {
	console.log("Saving MessageDelivery: ", msgDelivery);
	const MessageDelivery = createMessageDeliveryObj();
	return new Promise(function(resolve, reject) {
		const msgDeliveryToSave = new MessageDelivery({ id: uuidv1(), ...msgDelivery });

		msgDeliveryToSave.save(function (err) {
			if(err) reject(err);
			else resolve();
		});
	});

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
	const response = await axios.post(FB_MESSENGER_URL,body,{params});
	return response;
  }

const updateMessageDeliveryStatus = (messageDeliveryId, deliveryStatus) => {

}

exports.lambdaHandler = async (event, context) => {
	try {
		for (const record of event.Records) {
			console.log('Stream record: ', JSON.stringify(record, null, 2));
			if (record.eventName == 'INSERT') {
				console.log('inside insert: ', record.eventName);
				const chatId = record.dynamodb.NewImage.chatId.S;
				const platform = record.dynamodb.NewImage.platform.S;
				const message = record.dynamodb.NewImage.message.S;
				const id = record.dynamodb.NewImage.id.S;
				let result;
				console.log(platform);
				// check platofmr
				try{

					if(platform == "MESSENGER"){
						console.log("inside messenger");
						let msg = {
							"text": message
						}
						console.log("Sending message through messenger...");
						result = await callMessengerSendAPI(chatId, msg);
						console.log("result is: ", result);
					}else if(platform == "TELEGRAM"){
						
					} 
				}finally {
					if(!!result) {
						const deliveryStatus = (result.status == 200) ? "SUCCESS":"FAIL";
						await updateMessageDeliveryStatus(id, deliveryStatus);
					}
					
				}
				// call send message for platform
				// wait for response from sendMessage
					// if 200, update MessageDelivery deliveryStatus to true
					// if >=400, throw error, AWS lambda will auto retry with the same stream event (?)
				// exit

			}
			console.log("Complete processing for current stream record");
		};

		response = {
			'statusCode': 200,
			'body': JSON.stringify({
				message: `# of MessageDelivery record processed: ${event.Records.length}`,
				event,
			})
		}
	} catch (err) {
		console.log(err);
		return err;
	}

	return response
};

  