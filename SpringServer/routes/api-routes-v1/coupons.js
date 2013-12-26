var Coupon = require('../../model/Coupon').Coupon;
var ServiceItem = require('../../model/ServiceItem').ServiceItem;
var config = require('../../config');

//通过会员Id获取的优惠券信息
var findCouponByMemberId = function (memberId, callback) {
  var query = {member:memberId};
  findCouponList(query, callback);
};

//获取的优惠券列表信息
var findCouponList = function (query, callback) {
  var coupon_list = [];
  query.state = '0000-0000-0000';
  Coupon.find(query, function (err, couponList) {
    if (err) return callback(404, {error:err});
    var couponLen = couponList.length;

    function couponLoop(i) {
      if (i < couponLen) {
        var coupon = couponList[i];
        getCouponData(coupon, function (status, result) {
          if (status === 200 && result.coupon) {
            coupon_list.push(result.coupon);
          }
          couponLoop(i + 1);
        });
      } else {
        callback(200, {coupons:coupon_list});
      }
    }

    couponLoop(0);
  });
};

//通过会员卡Id获取优惠券信息
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

//重新组合优惠券数据
var getCouponData = function (coupon, callback) {
  if (coupon) {
    var coupon_data = {
      _id              :coupon._id,
      couponName       :coupon.couponName,
      memberServiceType:'Coupon',
      description      :coupon.description,
      promptIntro      :coupon.promptIntro,
      quantity         :coupon.quantity,
      forbidden        :coupon.forbidden,
      iconImage        :[config.webRoot, config.imageRoot , coupon.iconImage].join(''),
      merchantId       :coupon.merchant,
      memberId         :coupon.member,
      serviceItemId    :coupon.serviceItem
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

module.exports = {
  getCouponById       :getCouponById,
  findCouponByMemberId:findCouponByMemberId
};