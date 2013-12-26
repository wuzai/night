var config = require('../config');
var ServiceItem = require('../model/ServiceItem').ServiceItem;
var MemberCard = require('../model/MemberCard').MemberCard;
var Member = require('../model/Member').Member;
var LargessRecord = require('../model/LargessRecord').LargessRecord;
var consumeRecordServer = require('./consumeRecord-service');
var captchaRecordServer = require('./captchaRecord-service');

/**
 * 手机客户端使用会员卡
 * @param memberCardId
 * @param callback
 */
var useMemberCard = function (memberCardId, callback) {
  MemberCard.findById(memberCardId).populate('serviceItem').populate('member').exec(function (err, memberCard) {
    if (err) return callback(404, {error:err});
    if (memberCard) {
      if (memberCard.member && memberCard.member.state === '0000-0000-0000') {
        var serviceItem = memberCard.serviceItem;
        if (serviceItem) {
          var date = new Date();
          if (serviceItem.fromDate && date < new Date(serviceItem.fromDate)) {
            callback(403, {error:'商户活动未开始.'});
            return;
          }
          if (serviceItem.toDate && date > new Date(serviceItem.toDate)) {
            callback(403, {error:'商户活动已结束.'});
            return;
          }
          if (memberCard.validFromDate && date < new Date(memberCard.validFromDate)) {
            callback(403, {error:'会员卡活动未开始.'});
            return;
          }
          if (memberCard.validToDate && date > new Date(memberCard.validToDate)) {
            callback(403, {error:'会员卡已过期.'});
            return;
          }
          //创建验证信息 ,保存验证码记录(等待用户确认)
          captchaRecordServer.getCaptchaByUserId(memberCard.member.user, '使用', function (status, result) {
            if (status === 200) {
              var captchaRecord = result.captchaRecord;
              var captcha = captchaRecord.captcha;
              //产生消费记录
              consumeRecordServer.saveConsumeRecord(memberCard.member, memberCard._id, 'MemberCard', '待处理', function (status_consume, result_consume) {
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
        } else {
          callback(404, {error:'服务数据获取错误.'});
        }
      } else {
        callback(403, {error:'您在该商户的会员,已被商户禁用,请联系该商户.'});
      }
    } else {
      callback(404, {error:'会员卡数据未找到.'});
    }
  });
};


/**
 * 通过会员Id获取的会员卡列表
 * @param memberId
 * @param callback
 */
var findMemberCardListByMemberId = function (memberId, callback) {
  var query = {member:memberId, state:'0000-0000-0000', forbidden:false};
  var memberCard_list = [];
  MemberCard.find(query, function (err, memberCardList) {
    if (err) return callback(404, {error:err});
    var memberCardLen = memberCardList.length;

    function memberCardLoop(i) {
      if (i < memberCardLen) {
        var memberCard = memberCardList[i];
        getMemberCardData(memberCard, function (status_m, result_m) {
          if (status_m === 200 && result_m.memberCard) {
            memberCard_list.push(result_m.memberCard);
          }
          memberCardLoop(i + 1);
        });
      } else {
        Member.findById(memberId, 'user', function (err, member) {
          if (err) return callback(404, {error:err});
          if (member) {
            //获取转赠给会员的服务
            findLargessMemberCardByToUser(member.user, function (status_lm, result_lm) {
              if (status_lm === 200) {
                memberCard_list = memberCard_list.concat(result_lm.memberCards);
              }
              callback(200, {memberCards:memberCard_list});
            });
          } else {
            callback(200, {memberCards:memberCard_list});
          }
        });
      }
    }

    memberCardLoop(0);
  });
};

/**
 * 获取转赠给用户的服务
 * @param userId
 * @param callback
 */
var findLargessMemberCardByToUser = function (userId, callback) {
  LargessRecord.find({toUser:userId, processStatus:'待接受'}, function (err, largessRecordList) {
    if (err) return callback(404, {error:err});
    var memberCard_list = [];
    var largessRecordLen = largessRecordList.length;

    function largessRecordLoop(i) {
      if (i < largessRecordLen) {
        var largessRecord = largessRecordList[i];
        if (largessRecord.memberCard) {
          getMemberCardById(largessRecord.memberCard, function (status_memberCard, result_memberCard) {
            if (status_memberCard === 200 && result_memberCard.memberCard) {
              var memberCard_data = result_memberCard.memberCard;
              memberCard_data.submitState = true;
              memberCard_list.push(memberCard_data);
            }
            largessRecordLoop(i + 1);
          });
        } else {
          largessRecordLoop(i + 1);
        }
      } else {
        callback(200, {memberCards:memberCard_list});
      }
    }

    largessRecordLoop(0);
  });
};

/**
 * 通过会员服务Id获取会员服务信息
 * @param memberCardId
 * @param callback
 */
var getMemberCardById = function (memberCardId, callback) {
  MemberCard.findById(memberCardId, function (err, memberCard) {
    if (err) return callback(404, {error:err});
    getMemberCardData(memberCard, function (status, result) {
      if (status === 200) {
        callback(200, {memberCard:result.memberCard});
      } else {
        callback(status, {error:result.error});
      }
    });
  });
};

/**
 * 重新组合会员服务数据
 * @param memberCard
 * @param callback
 */
var getMemberCardData = function (memberCard, callback) {
  if (memberCard) {
    var memberCard_data = {
      _id              :memberCard._id,
      memberServiceName:memberCard.memberCardName,
      memberServiceType:'MemberCard',
      description      :memberCard.description,
      promptIntro      :memberCard.promptIntro,
      iconImage        :memberCard.iconImage,
      merchantId       :memberCard.merchant,
      serviceItemId    :memberCard.serviceItem,
      memberId         :memberCard.member,
      validFromDate    :memberCard.validFromDate,
      validToDate      :memberCard.validToDate,
      forbidden        :memberCard.forbidden
    }
    ServiceItem.findById(memberCard.serviceItem, '_id ruleText allowLargess allowShare usableStores', function (err, serviceItem) {
      if (err) return callback(404, {error:err});
      if (serviceItem) {
        memberCard_data.usableStores = serviceItem.usableStores ? serviceItem.usableStores.join(',') : null;
        memberCard_data.allowLargess = serviceItem.allowLargess;
        memberCard_data.allowShare = serviceItem.allowShare;
        memberCard_data.ruleText = serviceItem.ruleText;
      }
      callback(200, {memberCard:memberCard_data});
    });
  } else {
    callback(200, {});
  }
}

var deleteMemberCardById = function (memberCardId, callback) {
  MemberCard.update({_id:memberCardId}, {state:'1111-1111-1111'}, function (err) {
    if (err)callback(404, {error:err});
    callback(200);
  });
}

module.exports = {
  useMemberCard               :useMemberCard,
  deleteMemberCardById            :deleteMemberCardById,
  getMemberCardById           :getMemberCardById,
  findMemberCardListByMemberId:findMemberCardListByMemberId
};