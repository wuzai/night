var config = require('./config');
var webRoot_wehere = config.webRoot_wehere;
var index = require('./routes/sys/index');
var fileServer = require('./utils/file-server');

exports = module.exports = function (app) {
  //登录拦截器
  var interceptorLogin = function (req, res, next) {
    if (!req.session || !req.session.user) {
      req.session.messages = {error:['用户未登录，请先登录']};
      res.redirect([webRoot_wehere, '/userSignIn'].join(''));
    } else {
      next();
    }
  };
  //后台系统管理web端
  app.get(['' , '/wehere/admin/dashboard'].join(''),interceptorLogin, index.index);

  app.get('/exit', function (req, res) {
    res.json(200, {message:'server closed'});
    process.exit(0);
  });

  //上传图片
  app.post('/imageUploadServer', fileServer.imageUploadServer);

  app.get('/test', function(req,res){
    res.render('test', {});
  });
};