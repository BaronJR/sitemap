var views = [{"name":"James", "age":25}];


fs = require ('fs');

fs.writeFile('views.js', JSON.stringify(views), function (err) {
  if (err) throw err;
  console.log('It\'s saved!');
});