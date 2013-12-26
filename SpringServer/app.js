var http = require('http');
var config = require('./config');
var Logger = require('bunyan');
var express = require('express');
var restify = require('./utils/express-restify-mongoose');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var routes = require('./routes');
var server = require('./server');
var routes_sys = require('./routes_sys');
var routes_wehere = require('./routes_wehere');
var routes_weixinapp = require('./routes_weixinapp');
var menuConfig_sys = require('./menu-config-sys').menuConfig;
var menuConfig_wehere = require('./menu-config-wehere').menuConfig;
var msg = require('./utils/express-message');
var entityRoutes = require('./sweet-entity-routes');

//连接MongoDB数据库
if (!mongoose.connection || (mongoose.connection.readyState == 0)) {
  mongoose.connect(config.db);
}

var log = new Logger({
  name   :config.server_setting.name,
  streams:config.log_setting
});

process.on('uncaughtException', function (err) {
  log.fatal(err);
});

var app = express();

function setExpressApp() {

  var viewsRoot = __dirname + '/views';
  app.set('views', viewsRoot);
  app.set('view engine', 'jade');
  app.set('view options', {layout:false});
  app.use(express.bodyParser());
  app.use(express.methodOverride());

  // cookieParser should be above session
  app.use(express.cookieParser("bengxia_love_sexygirl"));
  app.use(express.session());

  config.server_setting.v_r.forEach(function (route) {
    var routes = require(route.routes);
    routes.forEach(function (item) {
      restify.serve(app, item, {prefix:routes.prefix, version:routes.ver});
    });
  });

  app.use(function (req, res, next) {
    res.locals.request = req;
    //res.locals.base = ('/' == app.route ? '' : app.route);
    res.locals.hasMessages = (req.session ? Object.keys(req.session.flash || {}).length : false);
    res.locals.messages = msg(req, res);
    res.locals.gAppName = 'AbaloneWeb';
    res.locals.gTitle = '夜店指南 - 后台管理';
    res.locals.gKeywords = '夜店指南,夜店,会员,后台';
    res.locals.imageRoot = config.webRoot + config.imageRoot;
    res.locals.webRoot_href = config.webRoot_href;
    res.locals.webRoot_wehere = config.webRoot_wehere;
    res.locals.webRoot_weixinapp = config.webRoot_weixinapp;
    res.locals.config_merchantId = config.merchantIds;
    res.locals.serviceItemTypes = [
      {key:'MemberCard', value:'会员卡', short:'会'},
      {key:'Coupon', value:'优惠券', short:'优'},
      {key:'MeteringCard', value:'计次卡', short:'计'},
      {key:'GroupOn', value:'团购', short:'团'},
      {key:'StoreCard', value:'储蓄卡', short:'储'},
      {key:'Voucher', value:'代金券', short:'代'}
    ];
    //res.locals.gUserInfo = req.session.user;

    res.locals.gMenus = menuConfig_sys; //TODO: require user authorize middleware.
    res.locals.gMenus_where = menuConfig_wehere; //TODO: require user authorize middleware.
    next();
  });

  app.use(express.logger(':method :url :status'));
}

app.configure(setExpressApp);
var static_dir = __dirname + '/public';
var staticFile_dir = __dirname + '/fileServer';
var oneYear = 31557600000;
app.configure('development', function () {
  app.use(express.static(static_dir), { maxAge:oneYear });
  app.use(express.static(staticFile_dir));
  app.use(express.errorHandler({ dumpExceptions:true, showStack:true }));
});

app.configure('production', function () {
  app.use(express.static(static_dir), { maxAge:oneYear });
  app.use(express.static(staticFile_dir));
  app.use(express.errorHandler());
  app.set('view cache', true);
});

routes(app);
server(app);
routes_sys(app);
routes_wehere(app);
routes_weixinapp(app);
entityRoutes(app);

//var initData = require('./init-data.default');
//initData.initSaveAllProvinceCityArea();

// app is a callback function or an express application
module.exports = app;
if (!module.parent) {
  http.createServer(app).listen(config.server_setting.port, function () {
    console.log("AbaloneWebServer listening on port " + config.server_setting.port);
  });
}