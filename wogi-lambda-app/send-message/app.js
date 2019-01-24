/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
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
const messenger = require('./messenger');
const telegram = require('./telegram');
const { MessageDelivery } = require('./message-delivery.model');

const updateMessageDeliveryStatus = async (messageDeliveryId, deliveryStatus) => MessageDelivery.update(messageDeliveryId, { deliveryStatus });

exports.lambdaHandler = async (event) => {
  try {
    for (const messageDeliveryRecord of event.Records) {
      console.log('Stream record: ', JSON.stringify(messageDeliveryRecord, null, 2));
      if (messageDeliveryRecord.eventName === 'INSERT') {
        const chatId = messageDeliveryRecord.dynamodb.NewImage.chatId.S;
        const platform = messageDeliveryRecord.dynamodb.NewImage.platform.S;
        const message = messageDeliveryRecord.dynamodb.NewImage.message.S;
        const id = messageDeliveryRecord.dynamodb.NewImage.id.S;
        let options;
        if (messageDeliveryRecord.dynamodb.NewImage.options) {
          options = messageDeliveryRecord.dynamodb.NewImage.options.SS;
        }
        let deliveryStatus;

        try {
          switch (platform) {
            case 'MESSENGER':
              deliveryStatus = await messenger.handler({
                chatId, message, messageDeliveryId: id, options,
              });
              break;
            case 'TELEGRAM':
              deliveryStatus = await telegram.handler(id, chatId, message);
              break;
            default:
              console.err('Invalid platform specified');
              return;
          }
        } finally {
          if (deliveryStatus) {
            await updateMessageDeliveryStatus(id, deliveryStatus);
          }
        }
      }
      console.log('Complete processing for current stream record');
    }
    console.log('Complete processing all stream records');
  } catch (err) {
    console.log(err);
  }
};
