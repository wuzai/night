var MemberCard = require('../../model/MemberCard').MemberCard;
var ServiceItem = require('../../model/ServiceItem').ServiceItem;
var ObjectId = require('mongoose').Types.ObjectId;
var config = require('../../config');
var consumeRecordServer = require('../../services/consumeRecord-service');
var captchaRecordServer = require('../../services/captchaRecord-service');

//通过会员Id获取的会员卡
var findMemberCardByMemberId = function (memberId, callback) {
  var query = {member:memberId};
  findMemberCardList(query, callback);
};

//获取会员卡列表信息
var findMemberCardList = function (query, callback) {
  var memberCard_list = [];
  query.state = '0000-0000-0000';
  MemberCard.find(query, function (err, memberCardList) {
    if (err) return callback(404, {error:err});
    var memberCardLen = memberCardList.length;

    function memberCardLoop(i) {
      if (i < memberCardLen) {
        var memberCard = memberCardList[i];
        getMemberCardData(memberCard, function (status, result) {
          if (status === 200 && result.memberCard) {
            memberCard_list.push(result.memberCard);
          }
          memberCardLoop(i + 1);
        });
      } else {
        callback(200, {memberCards:memberCard_list});
      }
    }

    memberCardLoop(0);
  });
}

//通过会员卡Id获取会员卡信息
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

//重新组合会员卡数据
var getMemberCardData = function (memberCard, callback) {
  if (memberCard) {
    var memberCard_data = {
      _id              :memberCard._id,
      memberCardName   :memberCard.memberCardName,
      memberServiceType:'MemberCard',
      description      :memberCard.description,
      promptIntro      :memberCard.promptIntro,
      forbidden        :memberCard.forbidden,
      iconImage        :[config.webRoot, config.imageRoot , memberCard.iconImage].join(''),
      merchantId       :memberCard.merchant,
      memberId         :memberCard.member,
      serviceItemId    :memberCard.serviceItem
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

module.exports = {
  getMemberCardById       :getMemberCardById,
  findMemberCardByMemberId:findMemberCardByMemberId
};