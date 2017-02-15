var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');
var app = express();

// Serving files, such as images, CSS, JavaScript and other static files is accomplished 
// with the help of a built-in middleware in Express - express.static.
app.use(express.static('public'));

// returns middleware to parse json
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// views is directory for all template files (this is where jade files will be)
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.get('/', function(req, res){
	res.render('index.jade');
});

//api call
app.post('/rest',function(req, res){
	//using the request module to send a request for the Zillow API call
	request(req.body.data, function (error, response, body) {
	  if (!error && response.statusCode === 200) {
	    res.send(body);
	  }
	});
});

app.set('port', (process.env.PORT || 4000));

app.listen(app.get('port'), function() {
  console.log('Realtor app is running on port', app.get('port'));
});

