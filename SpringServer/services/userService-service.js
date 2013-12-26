var MemberService = require('../model/MemberService').MemberService;
var MemberCard = require('../model/MemberCard').MemberCard;
var Coupon = require('../model/Coupon').Coupon;
var MeteringCard = require('../model/MeteringCard').MeteringCard;
var memberServer = require('./member-service');

/**
 * 根据用户Id和商户Id,获取limit数量的商户下某会员的服务信息
 * @param merchantId
 * @param userId
 * @param limit
 * @param callback
 */
var findMemberServiceOfLimitByUserIdAndMerchantId = function (merchantId, userId, limit, callback) {
  var memberServiceList_data = [];
  memberServer.getMemberByMerchantAndUser(merchantId, userId, function (status_member, result_member) {
    var member = result_member.member;
    if (status_member === 200 && member) {
      var memberId = member._id;
      MemberService.find({member:memberId, merchant:merchantId, state:'0000-0000-0000'}).select('_id memberServiceName memberServiceType description iconImage updatedAt').sort({updatedAt:-1}).limit(limit).exec(function (err, memberServiceList) {
        if (err || !memberServiceList)memberServiceList = [];
        MemberCard.find({member:memberId, merchant:merchantId, state:'0000-0000-0000'}).select('_id memberCardName description iconImage updatedAt').sort({updatedAt:-1}).limit(limit).exec(function (err, memberCardList) {
          if (err || !memberCardList)memberCardList = [];
          Coupon.find({member:memberId, merchant:merchantId, state:'0000-0000-0000'}).select('_id couponName description iconImage updatedAt').sort({updatedAt:-1}).limit(limit).exec(function (err, couponList) {
            if (err || !couponList)couponList = [];
            MeteringCard.find({member:memberId, merchant:merchantId, state:'0000-0000-0000'}).select('_id meteringCardName description iconImage updatedAt').sort({updatedAt:-1}).limit(limit).exec(function (err, meteringCardList) {
              if (err || !meteringCardList)meteringCardList = [];
              var data_list = [].concat(memberServiceList, memberCardList, couponList, meteringCardList);
              data_list.sort(function (a, b) {
                return a.updatedAt < b.updatedAt;
              });
              data_list.forEach(function (memberService) {
                var memberServiceName = '';
                var memberServiceType = '';
                if (memberService.memberServiceName) {
                  memberServiceName = memberService.memberServiceName;
                  memberServiceType = memberService.memberServiceType;
                } else if (memberService.memberCardName) {
                  memberServiceName = memberService.memberCardName;
                  memberServiceType = 'MemberCard';
                } else if (memberService.couponName) {
                  memberServiceName = memberService.couponName;
                  memberServiceType = 'Coupon';
                } else if (memberService.meteringCardName) {
                  memberServiceName = memberService.meteringCardName;
                  memberServiceType = 'MeteringCard';
                }
                if (memberServiceName && memberServiceList_data.length < limit) {
                  var data = {
                    _id              :memberService._id,
                    memberServiceName:memberServiceName,
                    memberServiceType:memberServiceType,
                    description      :memberService.description,
                    iconImage        :memberService.iconImage,
                    updatedAt        :memberService.updatedAt
                  }
                  memberServiceList_data.push(data);
                }
              });
              callback(200, {memberServices:memberServiceList_data});
            });
          });
        });
      });
    } else {
      callback(200, {memberServices:[]});
    }
  });
};

module.exports = {
  findMemberServiceOfLimitByUserIdAndMerchantId:findMemberServiceOfLimitByUserIdAndMerchantId
};
