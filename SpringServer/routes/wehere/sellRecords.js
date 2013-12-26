var config = require('../../config');
var webRoot_wehere = config.webRoot_wehere;
var SellRecord = require('../../model/SellRecord').SellRecord;
var ServiceItem = require('../../model/ServiceItem').ServiceItem;
var Member = require('../../model/Member').Member;
var ConsumeRecord = require('../../model/ConsumeRecord').ConsumeRecord;
var ServiceItemProfile = require('../../model/ServiceItemProfile').ServiceItemProfile;
var swiss = require('../../utils/swiss-kit');
var messageSendRecords = require('./messageSendRecords');
var memberCards = require('./memberCards');
var coupons = require('./coupons');
var meteringCards = require('./meteringCards');
var memberServices = require('./memberServices');
var serviceItems = require('./serviceItems');

var memberPointServer = require('../../services/memberPoint-service');
var captchaRecordServer = require('../../services/captchaRecord-service');
var sellRecordServer = require('../../services/sellRecord-service');
var consumeRecordServer = require('../../services/consumeRecord-service');
var pointServer = require('../../services/point-service');


//服务申领审核页面
var serviceItemApplyPage = function (req, res) {
  var merchant_session = req.session.merchant;
  var merchantId = merchant_session._id;
  sellRecordServer.findSellRecordOfUnfinishedByMerchantId(merchantId, function (status_sell, result_sell) {
    res.render('wehere/serviceItemApplyList', {sellRecords:result_sell.sellRecords});
  });
};

/**
 * 审核通过
 * @param sellRecordId 销售记录Id
 * @param callback
 * @since 1.1
 */
var serviceAuditPass = function (sellRecordId, callback) {
  SellRecord.findById(sellRecordId, function (err, sellRecord) {
    if (err) return callback(404, {error:err});
    if (sellRecord) {
      var serviceItemId = sellRecord.serviceItem;
      memberPointServer.getMemberPoint(sellRecord.member, function (status_point, result_point) {
        if (status_point === 200) {
          var memberPoint = result_point.memberPoint;
          ServiceItemProfile.find({_type:'ServiceItemProfile', serviceItem:serviceItemId}).populate('attribute').exec(function (err, attrs) {
            if (err) return callback(404, {error:err});
            var attrJson = swiss.findProfileToJSON(attrs);
            //申领服务所需积分
            var pointApply = attrJson.pointApply ? attrJson.pointApply : 0;
            if (memberPoint.availablePoint >= pointApply) {
              //申领服务并扣除积分
              sellRecordServer.createMemberServiceOfSellRecord(sellRecord._id, function (status, result) {
                if (status === 200) {
                  //给用户发送消息
                  messageSendRecords.serviceItemAuditPass(sellRecordId, function (status, result) {
                    console.log(status);
                  });
                  callback(200, {error:'审核通过,该申领已完成'});
                } else {
                  callback(status, {error:result.error});
                }
              });
            } else {
              //获取服务
              var itemDetailFields = '_id isUseUserPoint';
              ServiceItem.findOne({_id:serviceItemId, state:'0000-0000-0000'}, itemDetailFields, function (err, serviceItem) {
                if (err) return callback(404, {error:err});
                if (serviceItem) {
                  var isUseUserPoint = serviceItem.isUseUserPoint;//是否可使用平台积分
                  if (isUseUserPoint) {
                    //申领服务所差积分
                    var lackPoint = pointApply - memberPoint.availablePoint;
                    pointServer.userPointToMember(sellRecord.member, lackPoint, function (status_point2, result_point2) {
                      if (status_point2 === 200) {
                        serviceAuditPass(sellRecordId, callback);
                      } else {
                        callback(status_point2, {error:result_point2.error});
                      }
                    });
                  } else {
                    //会员积分不足，请充值.
                    callback(403, {error:'会员积分不足,请充值.'});
                  }
                } else {
                  callback(400, {error:'该服务项目未找到,或者已被禁用.'});
                  return;
                }
              });
            }
          });
        } else {
          callback(status_point, {error:result_point.error});
        }
      });
    } else {
      callback(404, {error:'sellRecord not found.'});
    }
  });
};

//允许通过审核
var serviceItemAuditPass = function (req, res) {
  var query = req.query;
  var sellRecordId = query.sellRecordId;
  var pageNum = query.pageNum;
  serviceAuditPass(sellRecordId, function (status, result) {
    if (status === 200) {
      req.session.messages = {notice:result.error};
    } else {
      req.session.messages = {error:[result.error]};
    }
    if (pageNum) {
      res.redirect([webRoot_wehere , '/dashboard'].join(''));
    } else {
      res.redirect([webRoot_wehere , '/serviceAudit/serviceItemApply'].join(''));
    }
  });
};

/**
 * 审核不通过
 * @param sellRecordId
 * @param callback
 * @since 1.1
 */
var serviceAuditNoPass = function (sellRecordId, noPassTxt, callback) {
  SellRecord.findById(sellRecordId, function (err, sellRecord) {
    if (err) return callback(404, {error:err});
    if (sellRecord) {
      sellRecord.process = '已取消';
      sellRecord.noPassTxt = noPassTxt;
      sellRecord.isSucceed = true;
      sellRecord.save(function (err) {
        if (err) return callback(404, {error:err});
        //给用户发送消息通知
        messageSendRecords.serviceItemAuditNoPass(sellRecordId, function (status, result) {
          console.log(status);
        });
        callback(200, {error:'审核不通过,该申领已取消'});
      }); //修改交易记录状态
    } else {
      callback(404, {error:'sellRecord not found.'});
    }
  });
};

//审核不通过
var serviceItemAuditNoPass = function (req, res) {
  var query = req.query;
  var sellRecordId = query.sellRecordId;
  var noPassTxt = query.noPassTxt?query.noPassTxt.trim():'';
  var pageNum = query.pageNum;
  serviceAuditNoPass(sellRecordId, noPassTxt, function (status, result) {
    if (status === 200) {
      req.session.messages = {notice:result.error};
    } else {
      req.session.messages = {error:[result.error]};
    }
    if (pageNum) {
      res.redirect([webRoot_wehere , '/dashboard'].join(''));
    } else {
      res.redirect([webRoot_wehere , '/serviceAudit/serviceItemApply'].join(''));
    }
  });
};

//服务使用审核页面
var serviceItemUsedPage = function (req, res) {
  var merchant_session = req.session.merchant;
  var merchantId = merchant_session._id;
  consumeRecordServer.findConsumeRecordOfUnfinishedByMerchantId(merchantId, function (status_consume, result_consume) {
    res.render('wehere/serviceItemUsedList', {consumeRecords:result_consume.consumeRecords});
  })
};
//允许服务使用
var serviceItemUsedCheck = function (req, res) {
  var body = req.body;
  var consumeRecordId = body.consumeRecordId;
  var cellphone = body.cellphone;
  var captcha = body.captcha;
  var serviceNumber = body.serviceNumber;
  var pageNum = body.pageNum;
  var backPageFunction = function () {
    if (pageNum) {
      res.redirect([webRoot_wehere , '/dashboard'].join(''));
    } else {
      res.redirect([webRoot_wehere , '/serviceAudit/serviceItemUsed'].join(''));
    }
  };
  if (serviceNumber && !Number(serviceNumber) && !swiss.isInteger(serviceNumber)) {
    req.session.messages = {error:['输入的消费金额或积分必须是整数.']};
    backPageFunction();
  } else {
    captchaRecordServer.checkCaptcha(captcha, cellphone, '使用', function (status, result) {
      if (status === 200) {
        var captchaRecord = result.captchaRecord;
        //用户修改成功,验证码修改为已使用状态
        captchaRecord.hasUsed = true;
        captchaRecord.save(function (err, new_captchaRecord) {
          //验证码正确，使用服务
          ConsumeRecord.findById(consumeRecordId, function (err, consumeRecord) {
            if (consumeRecord.memberCard) {
              memberCards.memberCardUsedConfirm(consumeRecord.memberCard, function (status, result) {
                if (status === 200) {
                  req.session.messages = {notice:'已经成功使用'};
                  consumeRecord.process = '已完成';
                } else {
                  req.session.messages = {error:[result.error]};
                  consumeRecord.process = '已作废';
                }
                consumeRecord.save();
                backPageFunction();
              });
            } else if (consumeRecord.coupon) {
              coupons.couponUsedConfirm(consumeRecord.coupon, function (status, result) {
                if (status === 200) {
                  req.session.messages = {notice:'已经成功使用'};
                  consumeRecord.process = '已完成';
                } else {
                  req.session.messages = {error:[result.error]};
                  consumeRecord.process = '已作废';
                }
                consumeRecord.save();
                backPageFunction();
              });
            } else if (consumeRecord.meteringCard) {
              meteringCards.meteringCardUsedConfirm(consumeRecord.meteringCard, function (status, result) {
                if (status === 200) {
                  req.session.messages = {notice:'已经成功使用'};
                  consumeRecord.process = '已完成';
                } else {
                  req.session.messages = {error:[result.error]};
                  consumeRecord.process = '已作废';
                }
                consumeRecord.save();
                backPageFunction();
              });
            } else {
              memberServices.memberServiceUsedConfirm(consumeRecord.memberService, serviceNumber, function (status, result) {
                if (status === 200) {
                  req.session.messages = {notice:'已经成功使用'};
                  consumeRecord.process = '已完成';
                } else {
                  req.session.messages = {error:[result.error]};
                  consumeRecord.process = '已作废';
                }
                consumeRecord.save();
                backPageFunction();
              });
            }
          })
        });
      } else {
        req.session.messages = {error:[result.error]};
        backPageFunction();
      }
    });
  }
};
//服务使用取消
var serviceItemUsedCancel = function (req, res) {
  var query = req.query;
  var consumeRecordId = query.consumeRecordId;
  var pageNum = query.pageNum;
  ConsumeRecord.findByIdAndUpdate(consumeRecordId, {process:'已取消'}, function (err, consumeRecord) {
    if (err) {
      req.session.messages = {error:[err]};
    } else {
      req.session.messages = {notice:'已经取消用户使用请求'};
    }
    if (pageNum) {
      res.redirect([webRoot_wehere , '/dashboard'].join(''));
    } else {
      res.redirect([webRoot_wehere , '/serviceAudit/serviceItemUsed'].join(''));
    }
  });
};

//销售记录列表
var sellRecordList = function (req, res) {
  var merchant_session = req.session.merchant;
  var merchantId = merchant_session._id;
  sellRecordServer.findSellRecordListByMerchantId(merchantId, function (status, result) {
    res.render('wehere/sellRecordList', {merchantId:merchantId, sellRecords:result.sellRecords});
  });
};

module.exports = {
  sellRecordList        :sellRecordList,
  serviceItemApplyPage  :serviceItemApplyPage,
  serviceItemUsedPage   :serviceItemUsedPage,
  serviceItemAuditPass  :serviceItemAuditPass,
  serviceItemAuditNoPass:serviceItemAuditNoPass,
  serviceItemUsedCheck  :serviceItemUsedCheck,
  serviceItemUsedCancel :serviceItemUsedCancel
};