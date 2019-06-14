var express = require('express'),
    path = require('path'),
    exec = require('child-process-promise').exec,
    router = express.Router();


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

router.get('/run',function(req,res){
  var strCommand = 'echo hello';
  exec(strCommand)
      .then(function (result) {
          var stdout = result.stdout;
          var stderr = result.stderr;
          // console.log('stdout: ', stdout);
          // console.log('stderr: ', stderr);
          res.json({'status':true, 'msg':stdout});
      })
      .catch(function (err) {
          // console.error('ERROR: ', err);
          res.json({'status':false, 'err':err});
      });
  });




/********** No Change from here ************/
// always last route for any invalid routes
router.get('/*', function(req, res) {
    res.redirect('/notfound')
});
module.exports = router;