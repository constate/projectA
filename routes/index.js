var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  const userInfo = {
    user_id: req.session['user_id'],
    username: req.session['username'],
    email: req.session['email'],
  };
  console.log(userInfo);
  res.render('index',
    {
      title: 'Express',
      userInfo: userInfo
    });

});

module.exports = router;
