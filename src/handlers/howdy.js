exports.handler = async (event, context) => {
    const response = {
        'statusCode': 200,
        'body': JSON.stringify({
            message: 'howdy, folks!'
        })
    };
    return response
}