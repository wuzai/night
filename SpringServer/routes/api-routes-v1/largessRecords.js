var LargessRecord = require('../../model/LargessRecord').LargessRecord;
var coupons = require('./coupons');
var memberCards = require('./memberCards');
var meteringCards = require('./meteringCards');

//获取已转借但未接受的服务活动
var findLargessServiceItemByToUser = function (userId, callback) {
  var fields = '_id fromUser memberService memberCard meteringCard coupon';
  LargessRecord.find({toUser:userId, processStatus:'待接受'}, fields, function (err, largessRecordList) {
    if (err) return callback(err);
    var memberCard_list = [];
    var coupon_list = [];
    var meteringCard_list = [];
    var largessRecordLen = largessRecordList.length;

    function largessRecordLoop(i) {
      if (i < largessRecordLen) {
        var largessRecord = largessRecordList[i];
        memberCards.getMemberCardById(largessRecord.memberCard, function (status_memberCard, result_memberCard) {
          if (status_memberCard === 200 && result_memberCard.memberCard) {
            var memberCard_data = result_memberCard.memberCard;
            memberCard_data.submitState = true;
            memberCard_list.push(memberCard_data);
          }
          coupons.getCouponById(largessRecord.coupon, function (status_coupon, result_coupon) {
            if (status_coupon === 200 && result_coupon.coupon) {
              var coupon_data = result_coupon.coupon;
              coupon_data.submitState = true;
              coupon_list.push(coupon_data);
            }
            meteringCards.getMeteringCardById(largessRecord.meteringCard, function (status_meteringCard, result_meteringCard) {
              if (status_meteringCard === 200 && result_meteringCard.meteringCard) {
                var meteringCard_data = result_meteringCard.meteringCard;
                meteringCard_data.submitState = true;
                meteringCard_list.push(meteringCard_data);
              }
              largessRecordLoop(i + 1);
            });
          });
        });
      } else {
        callback(err, memberCard_list, coupon_list, meteringCard_list);
      }
    }

    largessRecordLoop(0);
  });
};

module.exports = {
  findLargessServiceItemByToUser:findLargessServiceItemByToUser
};