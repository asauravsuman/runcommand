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
var lineReader = require('line-reader');

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
    var nameFolder = (req.body.foldername) ? req.body.foldername : randomString(10);
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
        var patha = 'data'+path.sep+'temp'+path.sep+nameFolder ;
        var arrList = [];
        fs.readdirSync(patha).forEach(file => {
          var filename = patha+path.sep+file;
          arrList.push({'name': file, 'size': fs.statSync(filename).size});
        });
        res.json({'status':true, 'msg':'success', 'nameFolder':nameFolder, 'files': arrList, 'err':false});
      });
  }
}


router.get('/fetch-reports',function(req,res){
  var patha = 'data'+path.sep+'temp'+path.sep; ;
  var arrList = [];
  fs.readdirSync(patha).forEach(file => {
    var filename = patha+path.sep+file;
    arrList.push({'name': file, 'size': fs.statSync(filename).size});
  });
  res.json({'status':true, 'msg':'success', 'arrList':arrList, 'err':false});
});

router.get('/read-progress/:id',function(req,res){
  var patha = 'data'+path.sep+'log'+path.sep+'cube_2019-8-26_12-13.log';
  var arrList = {};
  lineReader.eachLine(patha, function(line, last) {
    // console.log(line);
    var title= parseTitleFromLog(line)
    var tempObj = {
      status: parseStatusFromLog(line),
      duration: parseDurationFromLog(line),
    }
    arrList[title] = tempObj;
    if(last){
      if (line.indexOf('FINISHED') > -1){
        res.json({'status':true, 'msg':'Processing successful.', 'arrList':arrList, 'perct': 100});
      }else{
        res.json({'status':false, 'msg':'Processing in progress.', 'arrList':arrList, 'perct': 80});
      } 
    }
  });
  // fs.readdirSync(patha).forEach(file => {
  //   var filename = patha+path.sep+file;
  //   arrList.push({'name': file, 'size': fs.statSync(filename).size});
  // });
  // res.json({'status':true, 'msg':'success', 'arrList':arrList, 'err':false});
});

router.get('/fetch-report/:id',function(req,res){
  var patha = 'data'+path.sep+'temp'+path.sep+req.params.id; ;
  var arrList = [];
  fs.readdirSync(patha).forEach(file => {
    var filename = patha+path.sep+file;
    arrList.push({'name': file, 'size': fs.statSync(filename).size});
  });
  res.json({'status':true, 'msg':'success', 'arrList':arrList, 'err':false});
});

router.get('/read-report/:id/:name',function(req,res){
  var patha = path.sep+'data'+path.sep+'temp'+path.sep+req.params.id+path.sep+req.params.name;
    fs.readFile(__dirname + patha , function (err,data){
        res.contentType("application/pdf");
        res.send(data);
    });
});

router.get('/view-file/:id/:name',function(req,res){
  res.json({'status':true, 'msg':'success', 'err':false});
});
router.get('/remove-file/:id/:name',function(req,res){
  var arrList = [];
  var patha = 'data'+path.sep+'temp'+path.sep+req.params.id;
  fs.unlink(path.join(patha, req.params.name), err => {
    if (err) throw err;

    fs.readdirSync(patha).forEach(file => {
      var filename = patha+path.sep+file;
      arrList.push({'name': file, 'size': fs.statSync(filename).size});
    });
    res.json({'status':true, 'msg':'success', 'files':arrList, 'err':false});
  });
});



function randomString(length ) {
    var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
  }

function parseTitleFromLog(line) {
  var title = '';
  var array = line.split(",");
  return array[2];
}
function parseStatusFromLog(line) {
  var title = '';
  var array = line.split(",");
  if (array[4].indexOf('CuBe analysis is done') > -1){
    return 'done';
  }else{
    return 'progress';
  }
}
function parseDurationFromLog(line) {
  var title = '';
  var array = line.split(",");
  return array[3];
}

/********** No Change from here ************/
// always last route for any invalid routes
// router.get('/*', function(req, res) {
//     res.redirect('/notfound')
// });
module.exports = router;