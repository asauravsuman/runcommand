var express = require('express'),
    path = require('path'),
    exec = require('child-process-promise').exec,
    router = express.Router();

var child_process = require('child_process');
// var multer   =  require( 'multer' );
var upload_files = require('multer')();
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var sanitize = require("sanitize-filename");

/********** Adding routes ************/
router.get('/',function(req,res){
  res.render(path.join(__dirname+'/html/index.html'));
});

router.get('/index',function(req,res){
  res.render(path.join(__dirname+'/html/index.html'));
});

router.get('/aboutus',function(req,res){
  res.render(path.join(__dirname+'/html/aboutus.html'));
});

router.get('/reports',function(req,res){
  res.render(path.join(__dirname+'/html/reports.html'));
});

router.get('/report/:id',function(req,res){
  res.render(path.join(__dirname+'/html/report.html'));
});

router.get('/show-report/:id/:name',function(req,res){
  res.render(path.join(__dirname+'/html/pdf.html'));
});

router.get('/notfound',function(req,res){
  res.render(path.join(__dirname+'/html/notfound.html'));
});

// working now
router.post('/run',function(req,res){
  var nameFolder = req.body.foldername
  var upload_dir='data'+path.sep+'temp'+path.sep+nameFolder;  //somewhere relevant
  var strCommand = 'start cmd /k echo Hello, World!';  // working command
  // var strCommand = 'bin'+path.sep+'test.bat';  // working with bat file
  // var strCommand = 'bin'+path.sep+'open-chrome.bat';  // working with bat file open chrome
  child_process.exec(strCommand, function(error, stdout, stderr) {
  //   console.log(stdout);
  //   console.log(error);
  //   console.log(stderr);
    res.json({'status':true, 'msg':stdout, 'stderr':stderr, 'err':error});
  });
});

router.post('/upload-files', upload_files.array('source_file[]'), process_upload);
function process_upload(req, res) {
  if(req.files) { 
    // console.log("req.files.length = ", req.files.length);
    var nameFolder = randomString(10);
    var upload_dir='data'+path.sep+'temp'+path.sep+nameFolder;  //somewhere relevant
    if (!fs.existsSync(upload_dir)){
        fs.mkdirSync(upload_dir);
    }
    Promise.resolve(req.files)
      .each(function(file_incoming, idx) {
          // console.log("  Writing POSTed data :", file_incoming.originalname);
          var sanitized_filename = sanitize(file_incoming.originalname);
          var file_to_save = path.join( upload_dir, sanitized_filename );
    
          return fs.writeFileAsync(file_to_save, file_incoming.buffer)    
      })
      .then( _ => {
        // console.log("Added files : Success");
        res.json({'status':true, 'msg':'success', 'nameFolder':nameFolder, 'err':false});
      });
  }
}


router.get('/fetch-reports',function(req,res){
  var patha = 'data'+path.sep+'temp'+path.sep; ;
  var arrList = [];
  fs.readdirSync(patha).forEach(file => {
    arrList.push(file);
  });
  res.json({'status':true, 'msg':'success', 'arrList':arrList, 'err':false});
});

router.get('/fetch-report/:id',function(req,res){
  var patha = 'data'+path.sep+'temp'+path.sep+req.params.id; ;
  var arrList = [];
  fs.readdirSync(patha).forEach(file => {
    arrList.push(file);
  });
  res.json({'status':true, 'msg':'success', 'arrList':arrList, 'err':false});
});

router.get('/read-report/:id/:name',function(req,res){
  var patha = path.sep+'data'+path.sep+'temp'+path.sep+req.params.id+path.sep+req.params.name;

  console.log('patha', patha);
    fs.readFile(__dirname + patha , function (err,data){
        console.log('er', err);
        res.contentType("application/pdf");
        res.send(data);
    });
});





function randomString(length ) {
    var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
  }


/********** No Change from here ************/
// always last route for any invalid routes
// router.get('/*', function(req, res) {
//     res.redirect('/notfound')
// });
module.exports = router;