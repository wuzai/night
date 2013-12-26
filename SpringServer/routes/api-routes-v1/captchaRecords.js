var User = require('../../model/User').User;
var captchaRecordServer = require('../../services/captchaRecord-service');

/**
 * iOS端获取验证码
 * @since 1.0
 */
var getCaptcha = function (req, res, next) {
  var query = req.query;
  var cellphone = query.cellphone;
  if (!query || !cellphone) {
    res.json(400, {errors:'电话号码必须输入.'});
    return;
  }
  User.findOne({userName:cellphone, state:'0000-0000-0000'}, '_id userName', function (err, user) {
    if (user && user._id) {
      captchaRecordServer.createCaptcha(cellphone, '找回密码', function (status, result) {
        if (status === 200) {
          var captchaRecord = result.captchaRecord;
          //TODO 验证码发送至手机号码
          res.json(200, {});
        } else {
          res.json(status, {errors:result.error});
        }
      });
    } else {
      res.json(400, {errors:'用户未找到或用户已禁用.'});
      return;
    }
  });
};

module.exports = {
  getCaptcha:getCaptcha
};