var MeteringCard = require('../../model/MeteringCard').MeteringCard;
var ServiceItem = require('../../model/ServiceItem').ServiceItem;
var ObjectId = require('mongoose').Types.ObjectId;
var config = require('../../config');

//通过会员Id获取的计次卡信息
var findMeteringCardByMemberId = function (memberId, callback) {
  var query = {member:memberId};
  findMeteringCardList(query, callback);
};

//获取计次卡列表信息
var findMeteringCardList = function (query, callback) {
  var meteringCard_list = [];
  query.state = '0000-0000-0000';
  MeteringCard.find(query, function (err, meteringCardList) {
    if (err) return callback(404, {error:err});
    var meteringCardLen = meteringCardList.length;

    function meteringCardLoop(i) {
      if (i < meteringCardLen) {
        var meteringCard = meteringCardList[i];
        getMeteringCardData(meteringCard, function (status, result) {
          if (status === 200 && result.meteringCard) {
            meteringCard_list.push(result.meteringCard);
          }
          meteringCardLoop(i + 1);
        });
      } else {
        callback(200, {meteringCards:meteringCard_list});
      }
    }

    meteringCardLoop(0);
  });
};

//通过会员卡Id获取计次卡信息
var getMeteringCardById = function (meteringCardId, callback) {
  MeteringCard.findById(meteringCardId, function (err, meteringCard) {
    if (err) return callback(404, {error:err});
    getMeteringCardData(meteringCard, function (status, result) {
      if (status === 200) {
        callback(200, {meteringCard:result.meteringCard});
      } else {
        callback(status, {error:result.error});
      }
    });
  });
};

//重新组合计次卡数据
var getMeteringCardData = function (meteringCard, callback) {
  if (meteringCard) {
    var meteringCard_data = {
      _id              :meteringCard._id,
      meteringCardName :meteringCard.meteringCardName,
      memberServiceType:'MeteringCard',
      description      :meteringCard.description,
      promptIntro      :meteringCard.promptIntro,
      remainCount      :meteringCard.remainCount,
      forbidden        :meteringCard.forbidden,
      iconImage        :[config.webRoot, config.imageRoot , meteringCard.iconImage].join(''),
      merchantId       :meteringCard.merchant,
      memberId         :meteringCard.member,
      serviceItemId    :meteringCard.serviceItem
    }
    ServiceItem.findById(meteringCard.serviceItem, '_id ruleText allowLargess allowShare usableStores', function (err, serviceItem) {
      if (err) return callback(404, {error:err});
      if (serviceItem) {
        meteringCard_data.usableStores = serviceItem.usableStores ? serviceItem.usableStores.join(',') : null;
        meteringCard_data.allowLargess = serviceItem.allowLargess;
        meteringCard_data.allowShare = serviceItem.allowShare;
        meteringCard_data.ruleText = serviceItem.ruleText;
      }
      callback(200, {meteringCard:meteringCard_data});
    });
  } else {
    callback(200, {});
  }
}

module.exports = {
  getMeteringCardById       :getMeteringCardById,
  findMeteringCardByMemberId:findMeteringCardByMemberId
};