var config = require('../../config');
var ObjectId = require('mongoose').Types.ObjectId;
var Coupon = require('../../model/Coupon').Coupon;
var ServiceItem = require('../../model/ServiceItem').ServiceItem;
var serviceItems = require('./serviceItems');

//优惠券使用确认
var couponUsedConfirm = function (couponId, callback) {
  Coupon.findById(couponId).populate('serviceItem').exec(function (err, coupon) {
    if (err) return callback(400, {error:err});
    if (coupon) {
      if (coupon.state === '0000-1111-0000') {
        callback(403, {error:['该优惠券已经被使用.'].join('')});
        return;
      }
      var serviceItem = coupon.serviceItem;
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
        if (coupon.validFromDate && date > new Date(coupon.validFromDate)) {
          callback(403, {error:'优惠券活动未开始.'});
          return;
        }
        if (coupon.validToDate && date < new Date(coupon.validToDate)) {
          callback(403, {error:'优惠券已过期.'});
          return;
        }
        if (coupon.quantity === 0) {
          callback(403, {error:'优惠券已使用完.'});
          return;
        }
        if (coupon.quantity > 0) {
          var quantity = coupon.quantity - 1;
          coupon.quantity = quantity;
        }
        coupon.state = '0000-1111-0000';
        coupon.save(function (err, new_coupon) {
          //扣除会员积分
          serviceItems.serviceItemUsedConfirm(coupon.serviceItem, coupon.member, function (status, result) {
            if (status === 200) {
              callback(200, {error:'优惠券成功使用，已经扣除相应消费'});
            } else {
              callback(status, {error:result.error});
            }
          });
        });
      } else {
        callback(404, {error:'商户服务项目未找到，或已停止.'});
      }
    } else {
      callback(404, {error:'优惠券未找到，或已禁用.'});
    }
  });
};

module.exports = {
  couponUsedConfirm:couponUsedConfirm
};