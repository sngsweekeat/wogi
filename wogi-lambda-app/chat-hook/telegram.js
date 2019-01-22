const dynamoose = require('dynamoose');

exports.handler = async (event, context) => {
  console.log("HANDLING TELEGRAM")
  const Cat = dynamoose.model('Cat', { id: Number, name: String });

  // Create a new cat object
  const garfield = new Cat({ id: 666, name: 'Garfield' });

  // Save to DynamoDB
  await garfield.save();

  // Lookup in DynamoDB
  const badCat = await Cat.get(666);

  return {
    statusCode: 200,
    body: JSON.stringify({ cat: badCat }),
  };
}