
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
const shortid = require('shortid');
const base64 = require('base-64');
const isBase64 = require('is-base64');
const { Message } = require('./message.model');

const saveMessage = (message) => {
  console.log('message is: ', message);
  return new Promise((resolve, reject) => {
    const messageToSave = new Message({ id: shortid.generate(), ...message });

    messageToSave.save((err) => {
      if (err) { reject(err); }
      resolve();
    });
  });
};

exports.lambdaHandler = async (event) => {
  try {
    const { body } = event;
    console.log('Incoming body is: ', body);
    let message;
    if (typeof body === 'string') {
      if (isBase64(body)) {
        message = JSON.parse(base64.decode(body));
      } else {
        message = JSON.parse(body);
      }
    } else {
      message = body;
    }
    await saveMessage(message);
    const response = {
      statusCode: 200,
      body: JSON.stringify({
        message,
      }),
    };
    return response;
  } catch (err) {
    console.log(err);
    return err;
  }
};
