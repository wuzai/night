var config = require('../../config');
var webRoot = config.webRoot_wehere;
var Member = require('../../model/Member').Member;
var MemberService = require('../../model/MemberService').MemberService;
var ConsumeRecord = require('../../model/ConsumeRecord').ConsumeRecord;
var serviceItems = require('./serviceItems');

var captchaRecordServer = require('../../services/captchaRecord-service');
var memberServer = require('../../services/member-service');
var consumeRecordServer = require('../../services/consumeRecord-service');
var messageSendRecords = require('./messageSendRecords');

//会员服务使用确认
var memberServiceUsedConfirm = function (memberServiceId, serviceNumber, callback) {
  MemberService.findById(memberServiceId).populate('serviceItem').exec(function (err, memberService) {
    if (err) return callback(400, {error:err});
    if (memberService) {
      if (memberService.state === '0000-1111-0000') {
        callback(403, {error:['该会员服务已经被使用.'].join('')});
        return;
      }
      var serviceItem = memberService.serviceItem;
      if (serviceItem) {
        var date = new Date();
        if (serviceItem.fromDate && date > new Date(serviceItem.fromDate)) {
          callback(403, {error:'服务项目活动未开始.'});
          return;
        }
        if (serviceItem.toDate && date < new Date(serviceItem.toDate)) {
          callback(403, {error:'服务项目活动已结束.'});
          return;
        }
        if (memberService.validFromDate && date > new Date(memberService.validFromDate)) {
          callback(403, {error:'会员服务活动未开始.'});
          return;
        }
        if (memberService.validToDate && date < new Date(memberService.validToDate)) {
          callback(403, {error:'会员服务已过期.'});
          return;
        }
        var number = Number(serviceNumber);//积分数强制转化为浮点数
        number = number ? number : 0;
        if (memberService.memberServiceNumber && number && memberService.memberServiceNumber < number) {
          if (memberService.memberServiceType === 'StoreCard') {
            callback(403, {error:['储蓄卡金额不足.(剩余', memberService.memberServiceNumber, ')'].join('')});
          } else {
            callback(403, {error:['会员服务数量不足.(剩余', memberService.memberServiceNumber, ')'].join('')});
          }
        } else {
          if (memberService.memberServiceNumber > 0) {
            var quantity = memberService.memberServiceNumber - number;
            memberService.memberServiceNumber = quantity;
          }
          if (memberService.memberServiceType === 'GroupOn' || memberService.memberServiceType === 'Voucher') {
            memberService.state = '0000-1111-0000';
          }
          memberService.save(function (err, new_memberService) {
            //扣除会员积分
            serviceItems.serviceItemUsedConfirm(memberService.serviceItem, memberService.member, function (status, result) {
              if (status === 200) {
                callback(200, {error:'会员服务成功使用，已经扣除相应消费'});
              } else {
                callback(status, {error:result.error});
              }
            });
          });
        }
      } else {
        callback(404, {error:'商户服务项目未找到，或已停止.'});
      }
    } else {
      callback(404, {error:'会员服务未找到，或已禁用.'});
    }
  });
};


//商户端服务使用发送验证码
var sendCaptchaOfUsedByMerchant = function (req, res) {
  var merchant_session = req.session.merchant;
  var merchantId = merchant_session._id;
  var query = req.query;
  var userId = query.userId;
  captchaRecordServer.getCaptchaByUserId(userId, '使用', function (status, result) {
    if (status === 200) {
      var captchaRecord = result.captchaRecord;
      messageSendRecords.sendCaptchaOfUsedByMerchant(captchaRecord.captcha, userId, merchantId, function (status_message, result_message) {
        if (status_message === 200) {
          res.json({status:status_message});
        } else {
          res.json({status:status_message, error:'验证码发送失败.'});
        }
      })
    } else {
      res.json({status:status, error:result.error});
    }
  })
};

var memberServiceUsed = function (req, res) {
  var query = req.query;
  var userId = query.userId;
  var memberId = query.memberId;
  var memberServiceId = query.memberServiceId;
  var memberServiceType = query.memberServiceType;
  var captcha = query.captcha;
  if (captcha && captcha.trim()) {
    captchaRecordServer.checkCaptchaByUserId(captcha, userId, '使用', function (status, result) {
      if (status === 200) {
        //保存消费记录
        consumeRecordServer.saveConsumeRecord(memberId, memberServiceId, memberServiceType, '已完成', function (status_consume, result_consume) {
          if (status_consume === 200) {
            res.json({status:status_consume});
          } else {
            res.json({status:status_consume, error:result_consume.error});
          }
        });
      } else {
        res.json({status:status, error:result.error});
      }
    });
  } else {
    res.json({status:400, error:'请输入验证码.'});
  }
};

//打开进入会员详细页面
var gotoMemberInfoPage = function (req, res) {
  var merchant_session = req.session.merchant;
  var merchantId = merchant_session._id;
  var query = req.query;
  var telephone = query.telephone;
  memberServer.getMemberOfMerchantByTelephone(telephone, merchantId, function (status, result) {
    if (status === 200) {
      res.json({status:status, memberId:result.member._id});
    } else {
      res.json({status:status, error:result.error});
    }
  })
}
module.exports = {
  memberServiceUsedConfirm   :memberServiceUsedConfirm,
  sendCaptchaOfUsedByMerchant:sendCaptchaOfUsedByMerchant,
  memberServiceUsed          :memberServiceUsed,
  gotoMemberInfoPage         :gotoMemberInfoPage
};