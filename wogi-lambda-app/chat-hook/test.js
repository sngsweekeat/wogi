require('dotenv').config();

const dynamoose = require('dynamoose');

const Cat = dynamoose.model('Cat', { id: Number, name: String });

// Create a new cat object
const garfield = new Cat({id: 666, name: 'Garfield'});

// Save to DynamoDB
garfield.save();

// Lookup in DynamoDB
Cat.get(666)
.then(function (badCat) {
  console.log('Never trust a smiling cat. - ' + badCat.name);
});