var config = require('../../config');
var webRoot_weixinapp = config.webRoot_weixinapp;

exports.errorPage = function (req, res) {
  var query = req.query;
  var merchantId = query.merchantId;
  var FromUserName = query.FromUserName;
  var error = {
    status:404,
    error :"You are not where you're supposed to be."
  }
  if (req.session && req.session.messages) {
    var messages = req.session.messages;
    error.status = messages.status;
    error.error = messages.error;
    req.session.messages = null;
  }
  res.render('weixinapp/errorPage', {merchantId:merchantId, FromUserName:FromUserName, error:error});
};