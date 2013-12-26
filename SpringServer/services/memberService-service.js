var MemberService = require('../model/MemberService').MemberService;
var MemberCard = require('../model/MemberCard').MemberCard;
var Coupon = require('../model/Coupon').Coupon;
var MeteringCard = require('../model/MeteringCard').MeteringCard;
var LargessRecord = require('../model/LargessRecord').LargessRecord;
var ServiceItem = require('../model/ServiceItem').ServiceItem;
var Member = require('../model/Member').Member;
var consumeRecordServer = require('./consumeRecord-service');
var captchaRecordServer = require('./captchaRecord-service');

/**
 * 手机客户端使用会员服务
 * @param memberServiceId
 * @param callback
 */
var useMemberService = function (memberServiceId, callback) {
  MemberService.findById(memberServiceId).populate('serviceItem').populate('member').exec(function (err, memberService) {
    if (err) return callback(404, {error:err});
    if (memberService) {
      if (memberService.member && memberService.member.state === '0000-0000-0000') {
        var serviceItem = memberService.serviceItem;
        if (serviceItem) {
          var date = new Date();
          if (serviceItem.fromDate && date < new Date(serviceItem.fromDate)) {
            callback(404, {error:'商户活动未开始.'});
            return;
          }
          if (serviceItem.toDate && date > new Date(serviceItem.toDate)) {
            callback(404, {error:'商户活动已结束.'});
            return;
          }
          if (memberService.validFromDate && date < new Date(memberService.validFromDate)) {
            callback(404, {error:'会员服务活动未开始.'});
            return;
          }
          if (memberService.validToDate && date > new Date(memberService.validToDate)) {
            callback(403, {error:'会员服务已过期.'});
            return;
          }
          //创建验证信息 ,保存验证码记录(等待用户确认)
          captchaRecordServer.getCaptchaByUserId(memberService.member.user, '使用', function (status_captcha, result_captcha) {
            if (status_captcha === 200) {
              var captchaRecord = result_captcha.captchaRecord;
              var captcha = captchaRecord.captcha;
              //产生消费记录
              consumeRecordServer.saveConsumeRecord(memberService.member, memberService._id, 'MemberService', '待处理', function (status_consume, result_consume) {
                if (status_consume === 200) {
                  callback(200, {captcha:captcha});
                } else {
                  callback(status_consume, {errors:result_consume.error});
                }
              });
            } else {
              callback(403, {error:result_captcha.error});
            }
          });
        } else {
          callback(404, {error:'服务数据获取错误.'});
        }
      } else {
        callback(403, {error:'您在该商户的会员,已被商户禁用,请联系该商户.'});
      }
    } else {
      callback(404, {error:'会员服务数据未找到.'});
    }
  });
};

/**
 * 根据会员Id和商户Id,获取商户下某会员的服务信息
 * @param memberId
 * @param merchantId
 * @param callback
 */
var findMemberServiceByMemberIdAndMerchantId = function (memberId, merchantId, callback) {
  var memberServiceList_data = [];
  MemberService.find({member:memberId, merchant:merchantId, state:'0000-0000-0000'}, function (err, memberServiceList) {
    var memberServiceLen = memberServiceList.length;

    function memberServiceLoop(i) {
      if (i < memberServiceLen) {
        var memberService = memberServiceList[i];
        var memberService_data = {
          _id                :memberService._id,
          memberServiceName  :memberService.memberServiceName,
          memberServiceType  :memberService.memberServiceType,
          memberServiceNumber:memberService.memberServiceNumber,
          description        :memberService.description,
          promptIntro        :memberService.promptIntro,
          iconImage          :memberService.iconImage,
          serviceItem        :memberService.serviceItem,
          merchant           :memberService.merchant,
          member             :memberService.member,
          validFromDate      :memberService.validFromDate,
          validToDate        :memberService.validToDate,
          forbidden          :memberService.forbidden,
          createdAt          :memberService.createdAt,
          updatedAt          :memberService.updatedAt,
          state              :memberService.state,
          remark             :memberService.remark
        };
        memberServiceList_data.push(memberService_data);
        memberServiceLoop(i + 1);
      } else {
        MemberCard.find({member:memberId, merchant:merchantId, state:'0000-0000-0000'}, function (err, memberCardList) {
          var memberCardLen = memberCardList.length;

          function memberCardLoop(j) {
            if (j < memberCardLen) {
              var memberCard = memberCardList[j];
              var memberCard_data = {
                _id                :memberCard._id,
                memberServiceName  :memberCard.memberCardName,
                memberServiceType  :'MemberCard',
                memberServiceNumber:-1,
                description        :memberCard.description,
                promptIntro        :memberCard.promptIntro,
                iconImage          :memberCard.iconImage,
                serviceItem        :memberCard.serviceItem,
                merchant           :memberCard.merchant,
                member             :memberCard.member,
                validFromDate      :memberCard.validFromDate,
                validToDate        :memberCard.validToDate,
                forbidden          :memberCard.forbidden,
                createdAt          :memberCard.createdAt,
                updatedAt          :memberCard.updatedAt,
                state              :memberCard.state,
                remark             :memberCard.remark
              };
              memberServiceList_data.push(memberCard_data);
              memberCardLoop(j + 1);
            } else {
              Coupon.find({member:memberId, merchant:merchantId, state:'0000-0000-0000'}, function (err, couponList) {
                var couponLen = couponList.length;

                function couponLoop(k) {
                  if (k < couponLen) {
                    var coupon = couponList[k];
                    var coupon_data = {
                      _id                :coupon._id,
                      memberServiceName  :coupon.couponName,
                      memberServiceType  :'Coupon',
                      memberServiceNumber:coupon.quantity,
                      description        :coupon.description,
                      promptIntro        :coupon.promptIntro,
                      iconImage          :coupon.iconImage,
                      serviceItem        :coupon.serviceItem,
                      merchant           :coupon.merchant,
                      member             :coupon.member,
                      validFromDate      :coupon.validFromDate,
                      validToDate        :coupon.validToDate,
                      forbidden          :coupon.forbidden,
                      createdAt          :coupon.createdAt,
                      updatedAt          :coupon.updatedAt,
                      state              :coupon.state,
                      remark             :coupon.remark
                    };
                    memberServiceList_data.push(coupon_data);
                    couponLoop(k + 1);
                  } else {
                    MeteringCard.find({member:memberId, merchant:merchantId, state:'0000-0000-0000'}, function (err, meteringCardList) {
                      var meteringCardLen = meteringCardList.length;

                      function meteringCardLoop(l) {
                        if (l < meteringCardLen) {
                          var meteringCard = meteringCardList[l];
                          var meteringCard_data = {
                            _id                :meteringCard._id,
                            memberServiceName  :meteringCard.meteringCardName,
                            memberServiceType  :'MeteringCard',
                            memberServiceNumber:meteringCard.remainCount,
                            description        :meteringCard.description,
                            promptIntro        :meteringCard.promptIntro,
                            iconImage          :meteringCard.iconImage,
                            serviceItem        :meteringCard.serviceItem,
                            merchant           :meteringCard.merchant,
                            member             :meteringCard.member,
                            validFromDate      :meteringCard.validFromDate,
                            validToDate        :meteringCard.validToDate,
                            forbidden          :meteringCard.forbidden,
                            createdAt          :meteringCard.createdAt,
                            updatedAt          :meteringCard.updatedAt,
                            state              :meteringCard.state,
                            remark             :meteringCard.remark
                          };
                          memberServiceList_data.push(meteringCard_data);
                          meteringCardLoop(l + 1);
                        } else {
                          callback(200, {memberServices:memberServiceList_data});
                        }
                      }

                      meteringCardLoop(0);
                    });
                  }
                }

                couponLoop(0);
              });
            }
          }

          memberCardLoop(0);
        });
      }
    }

    memberServiceLoop(0);
  });
};

//通过会员Id获取的会员卡列表
var findMemberServiceListByMemberId = function (memberId, callback) {
  var query = {member:memberId, state:'0000-0000-0000', forbidden:false};
  var memberService_list = [];
  MemberService.find(query, function (err, memberServiceList) {
    if (err) return callback(404, {error:err});
    var memberServiceLen = memberServiceList.length;

    function memberServiceLoop(i) {
      if (i < memberServiceLen) {
        var memberService = memberServiceList[i];
        getMemberServiceData(memberService, function (status_m, result_m) {
          if (status_m === 200 && result_m.memberService) {
            memberService_list.push(result_m.memberService);
          }
          memberServiceLoop(i + 1);
        });
      } else {
        Member.findById(memberId, 'user', function (err, member) {
          if (err) return callback(404, {error:err});
          if (member) {
            //获取转赠给会员的服务
            findLargessMemberServiceByToUser(member.user, function (status_lm, result_lm) {
              if (status_lm === 200) {
                memberService_list = memberService_list.concat(result_lm.memberServices);
              }
              callback(200, {memberServices:memberService_list});
            });
          } else {
            callback(200, {memberServices:memberService_list});
          }
        });
      }
    }

    memberServiceLoop(0);
  });
};

/**
 * 获取转赠给用户的服务
 * @param userId
 * @param callback
 */
var findLargessMemberServiceByToUser = function (userId, callback) {
  LargessRecord.find({toUser:userId, processStatus:'待接受'}, function (err, largessRecordList) {
    if (err) return callback(404, {error:err});
    var memberService_list = [];
    var largessRecordLen = largessRecordList.length;

    function largessRecordLoop(i) {
      if (i < largessRecordLen) {
        var largessRecord = largessRecordList[i];
        if (largessRecord.memberService) {
          getMemberServiceById(largessRecord.memberService, function (status_memberService, result_memberService) {
            if (status_memberService === 200 && result_memberService.memberService) {
              var memberService_data = result_memberService.memberService;
              memberService_data.submitState = true;
              memberService_list.push(memberService_data);
            }
            largessRecordLoop(i + 1);
          });
        } else {
          largessRecordLoop(i + 1);
        }
      } else {
        callback(200, {memberServices:memberService_list});
      }
    }

    largessRecordLoop(0);
  });
};

//通过会员服务Id获取会员服务信息
var getMemberServiceById = function (memberServiceId, callback) {
  MemberService.findById(memberServiceId, function (err, memberService) {
    if (err) return callback(404, {error:err});
    getMemberServiceData(memberService, function (status, result) {
      if (status === 200) {
        callback(200, {memberService:result.memberService});
      } else {
        callback(status, {error:result.error});
      }
    });
  });
};

//重新组合会员服务数据
var getMemberServiceData = function (memberService, callback) {
  if (memberService) {
    var memberService_data = {
      _id                :memberService._id,
      memberServiceName  :memberService.memberServiceName,
      memberServiceType  :memberService.memberServiceType,
      memberServiceNumber:memberService.memberServiceNumber,
      description        :memberService.description,
      promptIntro        :memberService.promptIntro,
      iconImage          :memberService.iconImage,
      merchantId         :memberService.merchant,
      serviceItemId      :memberService.serviceItem,
      memberId           :memberService.member,
      validFromDate      :memberService.validFromDate,
      validToDate        :memberService.validToDate,
      forbidden          :memberService.forbidden
    }
    ServiceItem.findById(memberService.serviceItem, '_id ruleText allowLargess allowShare usableStores', function (err, serviceItem) {
      if (err) return callback(404, {error:err});
      if (serviceItem) {
        memberService_data.usableStores = serviceItem.usableStores ? serviceItem.usableStores.join(',') : null;
        memberService_data.allowLargess = serviceItem.allowLargess;
        memberService_data.allowShare = serviceItem.allowShare;
        memberService_data.ruleText = serviceItem.ruleText;
      }
      callback(200, {memberService:memberService_data});
    });
  } else {
    callback(200, {});
  }
}

var deleteMemberServiceById = function (memberCardId, callback) {
  MemberService.update({_id:memberCardId}, {state:'1111-1111-1111'}, function (err) {
    if (err)callback(404, {error:err});
    callback(200);
  });
}

module.exports = {
  useMemberService                        :useMemberService,
  getMemberServiceById                    :getMemberServiceById,
  deleteMemberServiceById                    :deleteMemberServiceById,
  findMemberServiceByMemberIdAndMerchantId:findMemberServiceByMemberIdAndMerchantId,
  findMemberServiceListByMemberId         :findMemberServiceListByMemberId
};
