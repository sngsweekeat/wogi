const User = require('./user').User;

exports.handler = async (event, context) => {
  console.log("EVENT PATH", event.path);
  console.log("EVENT BODY", JSON.stringify(event.body));

  try {
    const Cat = dynamoose.model('Cat', { id: Number, name: String });
    const garfield = new Cat({ id: 333, name: 'TEST CAT' });
    console.log("BEFORE SAVE")
    await garfield.save();

    console.log("AFTER SAVE")
    // Lookup in DynamoDB
    const badCat = await Cat.get(333);

    console.log("GOT bAD CAT", badCat.name)

    return {
      statusCode: 200,
      body: JSON.stringify({ cat: badCat }),
    };
  } catch(e) {
    console.log("ERROR saving", e)

    return {
      statusCod: 500,
      body: JSON.stringify(e)
    }
  }
}