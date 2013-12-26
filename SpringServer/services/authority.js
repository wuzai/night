var config = require('../config');
var tokenHelper = require('../utils/token-helper');
var AppKey = require('../model/AppKey').AppKey;
var swiss = require('../utils/swiss-kit');
var User = require('../model/User').User;
var crypto = require('crypto');
var express = require('express');

// generate a new app key.
// FIXME: auth.requireAuthenticate
exports.getAppKey = function (req, res, next) {
  var phone = req.query.phone;
  AppKey.count({phone:phone}, function (err, count) {
    if (err) next(err);
    if (count > 0) {
      res.send(205, "phone has registered.");
      return next();
    } else {
      var key = tokenHelper.generateApiKey(config.app_setting.key_length);
      var appKey = new AppKey({phone:phone, key:key});
      appKey.save(function (err) {
        if (err) return next(err);
        res.json({phone:phone, key:key});
        return next();
      });
    }
  });
};

//basic authentication.
exports.basicAuth = express.basicAuth(function (username, password, callback) {
  User.findOne({ userName:username }, function (err, user) {
    if (err) {
      callback(err, false);
    }
    if (!user) {
      callback('user not found.', false);
    }
    var digest = tokenHelper.encryptPassword(user.hashFormat, user.passwordSalt, password);
    if (digest !== user.passwordDigest) {
      callback('password error.', false);
    }
    callback(null, true);
  });
}, 'secret area');

//verify app token.
exports.authorizeAppToken = function (req, res, next) {
  var key = req.query.appkey;
  if (!key) {
    //url is not to be authorize?
    if (swiss.isRouteNotToBeAuthorize(req.path)) {
      return next();
    }
    return next('invalid appkey.');
  }
  AppKey.count({key:key}, function (err, count) {
    if (err) return next(err);
    if (count == 0) {
      return next('invalid appkey.');
    }
    AppKey.findOne({key:key}, function (err, appKey) {
      if (err) return next(err);
      //TODO: 1) validate keyType limit.
      return next();
    });
  });
};
