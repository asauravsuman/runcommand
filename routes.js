var express = require('express'),
    path = require('path'),
    exec = require('child-process-promise').exec,
    router = express.Router();

var child_process = require('child_process');

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

router.get('/notfound',function(req,res){
  res.render(path.join(__dirname+'/html/notfound.html'));
});

// depricated for now 
router.get('/run-orig',function(req,res){
  var strCommand = '';
  exec(strCommand)
      .then(function (result) {
          var stdout = result.stdout;
          var stderr = result.stderr;
          console.log('stdout: ', stdout);
          console.log('stderr: ', stderr);
          res.json({'status':true, 'msg':stdout});
      })
      .catch(function (err) {
          console.error('ERROR: ', err);
          res.json({'status':false, 'err':err});
      });
  });

// working now
router.get('/run',function(req,res){
  // var strCommand = 'start cmd /k echo Hello, World!';  // working command
  // var strCommand = 'bin'+path.sep+'test.bat';  // working with bat file
  var strCommand = 'bin'+path.sep+'open-chrome.bat';  // working with bat file open chrome
  child_process.exec(strCommand, function(error, stdout, stderr) {
  //   console.log(stdout);
  //   console.log(error);
  //   console.log(stderr);
    res.json({'status':true, 'msg':stdout, 'stderr':stderr, 'err':error});
  });
});




/********** No Change from here ************/
// always last route for any invalid routes
router.get('/*', function(req, res) {
    res.redirect('/notfound')
});
module.exports = router;