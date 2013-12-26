var config = require('../config');
var ObjectId = require('mongoose').Types.ObjectId;
var CaptchaRecord = require('../model/CaptchaRecord').CaptchaRecord;
var UserCellphoneRecord = require('../model/UserCellphoneRecord').UserCellphoneRecord;
var User = require('../model/User').User;
var tokenHelper = require('../utils/token-helper');

/**
 * 通过userId获取验证码
 * @param userId 用户Id
 * @param captchaType 验证码类型
 * @param callback
 */
var getCaptchaByUserId = function (userId, captchaType, callback) {
  UserCellphoneRecord.findOne({user:userId, isUsing:true, state:'0000-0000-0000'}, '_id cellphone', function (err, userCellphoneRecord) {
    if (err) return callback(404, {error:err});
    if (userCellphoneRecord) {
      createCaptcha(userCellphoneRecord.cellphone, captchaType, function (status, result) {
        var captchaRecord = result.captchaRecord;
        callback(status, {captchaRecord:captchaRecord});
      });
    } else {
      callback(400, {error:'未找到用户电话.'});
      return;
    }
  });
}

/**
 * 创建验证码
 * @param cellphone 电话号码
 * @param captchaType 验证码类型
 * @param callback
 */
var createCaptcha = function (cellphone, captchaType, callback) {
  CaptchaRecord.update({cellphone:cellphone, captchaType:captchaType}, {hasUsed:true}, { multi:true }, function (err, captcha_record) {
    if (err) return callback(404, {error:err});
    var captcha = tokenHelper.createRandomCode(config.systemParams.captchaLength);
    //TODO 如果是找回密码，暂时没有发送短信功能,给出默认密码（2013-08-05注）
    if (captchaType === '找回密码') {
      captcha = '123456';
    }
    var captchaRecord = new CaptchaRecord({
      captcha    :captcha,
      cellphone  :cellphone,
      captchaType:captchaType,
      hasUsed    :false
    });
    captchaRecord.save(function (err, new_captchaRecord) {
      if (err) return callback(404, {error:err});
      callback(200, {captchaRecord:new_captchaRecord});
    });
  });
};

/**
 * 检验验证码是否正确
 * @param captcha 验证码
 * @param cellphone 电话
 * @param captchaType 验证码类型
 * @param callback
 */
var checkCaptcha = function (captcha, cellphone, captchaType, callback) {
  CaptchaRecord.findOne({captcha:captcha.toUpperCase(), cellphone:cellphone, captchaType:captchaType, hasUsed:false}, function (err, captchaRecord) {
    if (captchaRecord) {
      var createTime = new Date(captchaRecord.createdAt);
      var ct = createTime.getTime() + 2 * 60 * 60 * 1000;//验证码有效期2小时
      var d = new Date();
      var dt = d.getTime();
      if (dt < ct) {
        callback(200, {captchaRecord:captchaRecord});
      } else {
        callback(410, {error:'验证码已过期,请重新获取验证码'});
      }
    } else {
      callback(410, {error:'验证码错误,请重新输入'});
    }
  });
}

var checkCaptchaByUserId = function (captcha, userId, captchaType, callback) {
  UserCellphoneRecord.findOne({user:userId, isUsing:true, state:'0000-0000-0000'}, '_id cellphone', function (err, userCellphoneRecord) {
    if (err) return callback(404, {error:err});
    if (userCellphoneRecord) {
      checkCaptcha(captcha, userCellphoneRecord.cellphone, captchaType, function (status, result) {
        if (status === 200) {
          callback(200, {captchaRecord:result.captchaRecord});
        } else {
          callback(status, {error:result.error});
        }
      });
    } else {
      callback(400, {error:'验证失败,未找到相关验证用户.'});
      return;
    }
  });
};

var checkCaptchaById = function (captchaRecordId, captcha, callback) {
  CaptchaRecord.findById(captchaRecordId, function (err, captchaRecord) {
    if (captchaRecord && captcha) {
      if (captchaRecord.captcha == captcha.toUpperCase()) {
        if (captchaRecord.hasUsed) {
          callback(410, {error:'验证码已经被使用,请重新获取'});
        } else {
          var createTime = new Date(captchaRecord.createdAt);
          var ct = createTime.getTime() + 2 * 60 * 60 * 1000;//验证码有效期2小时
          var d = new Date();
          var dt = d.getTime();
          if (dt < ct) {
            callback(200, {captchaRecord:captchaRecord});
          } else {
            callback(410, {error:'验证码已过期,请重新获取验证码'});
          }
        }
      } else {
        callback(410, {error:'验证码错误,请重新输入'});
      }
    } else {
      callback(410, {error:'验证码错误,请重新输入'});
    }
  });
};

module.exports = {
  createCaptcha       :createCaptcha,
  getCaptchaByUserId  :getCaptchaByUserId,
  checkCaptcha        :checkCaptcha,
  checkCaptchaById    :checkCaptchaById,
  checkCaptchaByUserId:checkCaptchaByUserId
};