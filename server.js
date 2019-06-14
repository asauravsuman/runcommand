const express = require('express');
const app = express();

const ejs = require('ejs'); 

app.use(express.static('assets'));
app.engine('html', require('ejs').renderFile); 
app.set('view engine', 'ejs')

//add the router
var pathRoutes = require('./routes');
app.use('/', pathRoutes);
app.listen(process.env.port || 3000);

console.log('Running at Port 3000');