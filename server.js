const express = require('express');
const app = express();

const ejs = require('ejs'); 

app.use(express.static('assets'));
app.engine('html', require('ejs').renderFile); 
app.set('view engine', 'ejs');

var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

//add the router
var pathRoutes = require('./routes');
app.use('/', pathRoutes);
app.listen(process.env.port || 3002);

console.log('Running at Port 3000');