var config = require('../config');
var ServiceItem = require('../model/ServiceItem').ServiceItem;
var Coupon = require('../model/Coupon').Coupon;
var Member = require('../model/Member').Member;
var LargessRecord = require('../model/LargessRecord').LargessRecord;
var consumeRecordServer = require('./consumeRecord-service');
var captchaRecordServer = require('./captchaRecord-service');

/**
 * 手机客户端使用优惠券
 * @param couponId
 * @param callback
 */
var useCoupon = function (couponId, callback) {
  Coupon.findById(couponId).populate('serviceItem').populate('member').exec(function (err, coupon) {
    if (err) return callback(404, {error:err});
    if (coupon) {
      if (coupon.member && coupon.member.state === '0000-0000-0000') {
        var serviceItem = coupon.serviceItem;
        if (serviceItem) {
          var date = new Date();
          if (serviceItem.fromDate && date < new Date(serviceItem.fromDate)) {
            callback(403, {error:'商户服务未开始.'});
            return;
          }
          if (serviceItem.toDate && date > new Date(serviceItem.toDate)) {
            callback(403, {error:'商户服务已结束.'});
            return;
          }
          if (coupon.validFromDate && date < new Date(coupon.validFromDate)) {
            callback(403, {error:'优惠券活动未开始.'});
            return;
          }
          if (coupon.validToDate && date > new Date(coupon.validToDate)) {
            callback(403, {error:'优惠券已过期.'});
            return;
          }
          if (coupon.quantity === 0) {
            callback(403, {error:'优惠券已使用.'});
            return;
          } else {
            //创建验证信息 ,保存验证码记录(等待用户确认)
            captchaRecordServer.getCaptchaByUserId(coupon.member.user, '使用', function (status, result) {
              if (status === 200) {
                var captchaRecord = result.captchaRecord;
                var captcha = captchaRecord.captcha;
                //产生消费记录
                consumeRecordServer.saveConsumeRecord(coupon.member, coupon._id, 'Coupon', '待处理', function (status_consume, result_consume) {
                  if (status_consume === 200) {
                    callback(200, {captcha:captcha});
                  } else {
                    callback(status_consume, {error:result_consume.error});
                  }
                });
              } else {
                callback(403, {error:result.error});
              }
            });
          }
        } else {
          callback(404, {error:'服务数据获取错误.'});
        }
      } else {
        callback(403, {error:'您在该商户的会员,已被商户禁用,请联系该商户.'});
      }
    } else {
      callback(404, {error:'优惠券数据未找到.'});
    }
  });
};

/**
 * 通过会员Id获取的会员卡列表
 * @param memberId
 * @param callback
 */
var findCouponListByMemberId = function (memberId, callback) {
  var query = {member:memberId, state:'0000-0000-0000', forbidden:false};
  var coupon_list = [];
  Coupon.find(query, function (err, couponList) {
    if (err) return callback(404, {error:err});
    var couponLen = couponList.length;

    function couponLoop(i) {
      if (i < couponLen) {
        var coupon = couponList[i];
        getCouponData(coupon, function (status_m, result_m) {
          if (status_m === 200 && result_m.coupon) {
            coupon_list.push(result_m.coupon);
          }
          couponLoop(i + 1);
        });
      } else {
        Member.findById(memberId, 'user', function (err, member) {
          if (err) return callback(404, {error:err});
          if (member) {
            //获取转赠给会员的服务
            findLargessCouponByToUser(member.user, function (status_lm, result_lm) {
              if (status_lm === 200) {
                coupon_list = coupon_list.concat(result_lm.coupons);
              }
              callback(200, {coupons:coupon_list});
            });
          } else {
            callback(200, {coupons:coupon_list});
          }
        });
      }
    }

    couponLoop(0);
  });
};

/**
 * 获取转赠给用户的服务
 * @param userId
 * @param callback
 */
var findLargessCouponByToUser = function (userId, callback) {
  LargessRecord.find({toUser:userId, processStatus:'待接受'}, function (err, largessRecordList) {
    if (err) return callback(404, {error:err});
    var coupon_list = [];
    var largessRecordLen = largessRecordList.length;

    function largessRecordLoop(i) {
      if (i < largessRecordLen) {
        var largessRecord = largessRecordList[i];
        if (largessRecord.coupon) {
          getCouponById(largessRecord.coupon, function (status_coupon, result_coupon) {
            if (status_coupon === 200 && result_coupon.coupon) {
              var coupon_data = result_coupon.coupon;
              coupon_data.submitState = true;
              coupon_list.push(coupon_data);
            }
            largessRecordLoop(i + 1);
          });
        } else {
          largessRecordLoop(i + 1);
        }
      } else {
        callback(200, {coupons:coupon_list});
      }
    }

    largessRecordLoop(0);
  });
};

/**
 * 通过会员服务Id获取会员服务信息
 * @param couponId
 * @param callback
 */
var getCouponById = function (couponId, callback) {
  Coupon.findById(couponId, function (err, coupon) {
    if (err) return callback(404, {error:err});
    getCouponData(coupon, function (status, result) {
      if (status === 200) {
        callback(200, {coupon:result.coupon});
      } else {
        callback(status, {error:result.error});
      }
    });
  });
};

/**
 * 重新组合会员服务数据
 * @param coupon
 * @param callback
 */
var getCouponData = function (coupon, callback) {
  if (coupon) {
    var coupon_data = {
      _id              :coupon._id,
      memberServiceName:coupon.couponName,
      memberServiceType:'Coupon',
      description      :coupon.description,
      promptIntro      :coupon.promptIntro,
      iconImage        :coupon.iconImage,
      merchantId       :coupon.merchant,
      serviceItemId    :coupon.serviceItem,
      memberId         :coupon.member,
      validFromDate    :coupon.validFromDate,
      validToDate      :coupon.validToDate,
      forbidden        :coupon.forbidden
    }
    ServiceItem.findById(coupon.serviceItem, '_id ruleText allowLargess allowShare usableStores', function (err, serviceItem) {
      if (err) return callback(404, {error:err});
      if (serviceItem) {
        coupon_data.usableStores = serviceItem.usableStores ? serviceItem.usableStores.join(',') : null;
        coupon_data.allowLargess = serviceItem.allowLargess;
        coupon_data.allowShare = serviceItem.allowShare;
        coupon_data.ruleText = serviceItem.ruleText;
      }
      callback(200, {coupon:coupon_data});
    });
  } else {
    callback(200, {});
  }
}

var deleteCouponById = function (memberCardId, callback) {
  Coupon.update({_id:memberCardId}, {state:'1111-1111-1111'}, function (err) {
    if (err)callback(404, {error:err});
    callback(200);
  });
}

module.exports = {
  useCoupon               :useCoupon,
  getCouponById           :getCouponById,
  deleteCouponById           :deleteCouponById,
  findCouponListByMemberId:findCouponListByMemberId
};