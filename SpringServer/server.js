var config = require('./config');
var locationServer = require('./services/location-service');

exports = module.exports = function (app) {
  app.get('/findAllLocation', function (req, res, next) {
    locationServer.findAllProvinceCityArea(function (err, result_pro) {
      if (err) return next(err);
      res.json(200, {provinces:result_pro.provinces});
    });
  });

};