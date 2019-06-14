// var http = require('http');
// var app = require('./app');

// app.set('view', __dirname + '/html');
// app.engine('html', require('ejs').renderFile);

// http.createServer(app.handleRequest).listen(8000);


const express = require('express');
const app = express();
const path = require('path');
const router = express.Router();
const exec = require('child-process-promise').exec;

router.get('/',function(req,res){
  res.sendFile(path.join(__dirname+'/html/index.html'));
});

router.get('/index',function(req,res){
  res.sendFile(path.join(__dirname+'/html/index.html'));
});

router.get('/aboutus',function(req,res){
  res.sendFile(path.join(__dirname+'/html/aboutus.html'));
});

router.get('/run',function(req,res){


exec('echo hello')
    .then(function (result) {
        var stdout = result.stdout;
        var stderr = result.stderr;
        console.log('stdout: ', stdout);
        console.log('stderr: ', stderr);
        res.json({'result':stdout});
    })
    .catch(function (err) {
        console.error('ERROR: ', err);
        res.json({'error':err});
    });
});

app.use(express.static('assets'))

//add the router
app.use('/', router);
app.listen(process.env.port || 3000);

console.log('Running at Port 3000');