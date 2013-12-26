var config = require('../config');
var ServiceItem = require('../model/ServiceItem').ServiceItem;
var MeteringCard = require('../model/MeteringCard').MeteringCard;
var Member = require('../model/Member').Member;
var LargessRecord = require('../model/LargessRecord').LargessRecord;
var consumeRecordServer = require('./consumeRecord-service');
var captchaRecordServer = require('./captchaRecord-service');

/**
 * 手机客户端使用计次卡
 * @param meteringCardId
 * @param callback
 */
var useMeteringCard = function (meteringCardId, callback) {
  MeteringCard.findById(meteringCardId).populate('serviceItem').populate('member').exec(function (err, meteringCard) {
    if (err) return callback(404, {error:err});
    if (meteringCard) {
      if (meteringCard.member && meteringCard.member.state === '0000-0000-0000') {
        var serviceItem = meteringCard.serviceItem;
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
          if (meteringCard.validFromDate && date < new Date(meteringCard.validFromDate)) {
            callback(403, {error:'计次卡活动未开始.'});
            return;
          }
          if (meteringCard.validToDate && date > new Date(meteringCard.validToDate)) {
            callback(403, {error:'计次卡已过期.'});
            return;
          }
          if (meteringCard.remainCount === 0) {
            callback(403, {error:'计次卡已使用完.'});
            return;
          } else {
            //创建验证信息 ,保存验证码记录(等待用户确认)
            captchaRecordServer.getCaptchaByUserId(meteringCard.member.user, '使用', function (status, result) {
              if (status === 200) {
                var captchaRecord = result.captchaRecord;
                var captcha = captchaRecord.captcha;
                //产生消费记录
                consumeRecordServer.saveConsumeRecord(meteringCard.member, meteringCard._id, 'MeteringCard', '待处理', function (status_consume, result_consume) {
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
      callback(404, {error:'计次卡数据未找到.'});
    }
  });
};

/**
 * 通过会员Id获取的会员卡列表
 * @param memberId
 * @param callback
 */
var findMeteringCardListByMemberId = function (memberId, callback) {
  var query = {member:memberId, state:'0000-0000-0000', forbidden:false};
  var meteringCard_list = [];
  MeteringCard.find(query, function (err, meteringCardList) {
    if (err) return callback(404, {error:err});
    var meteringCardLen = meteringCardList.length;

    function meteringCardLoop(i) {
      if (i < meteringCardLen) {
        var meteringCard = meteringCardList[i];
        getMeteringCardData(meteringCard, function (status_m, result_m) {
          if (status_m === 200 && result_m.meteringCard) {
            meteringCard_list.push(result_m.meteringCard);
          }
          meteringCardLoop(i + 1);
        });
      } else {
        Member.findById(memberId, 'user', function (err, member) {
          if (err) return callback(404, {error:err});
          if (member) {
            //获取转赠给会员的服务
            findLargessMeteringCardByToUser(member.user, function (status_lm, result_lm) {
              if (status_lm === 200) {
                meteringCard_list = meteringCard_list.concat(result_lm.meteringCards);
              }
              callback(200, {meteringCards:meteringCard_list});
            });
          } else {
            callback(200, {meteringCards:meteringCard_list});
          }
        });
      }
    }

    meteringCardLoop(0);
  });
};

/**
 * 获取转赠给用户的服务
 * @param userId
 * @param callback
 */
var findLargessMeteringCardByToUser = function (userId, callback) {
  LargessRecord.find({toUser:userId, processStatus:'待接受'}, function (err, largessRecordList) {
    if (err) return callback(404, {error:err});
    var meteringCard_list = [];
    var largessRecordLen = largessRecordList.length;

    function largessRecordLoop(i) {
      if (i < largessRecordLen) {
        var largessRecord = largessRecordList[i];
        if (largessRecord.meteringCard) {
          getMeteringCardById(largessRecord.meteringCard, function (status_meteringCard, result_meteringCard) {
            if (status_meteringCard === 200 && result_meteringCard.meteringCard) {
              var meteringCard_data = result_meteringCard.meteringCard;
              meteringCard_data.submitState = true;
              meteringCard_list.push(meteringCard_data);
            }
            largessRecordLoop(i + 1);
          });
        } else {
          largessRecordLoop(i + 1);
        }
      } else {
        callback(200, {meteringCards:meteringCard_list});
      }
    }

    largessRecordLoop(0);
  });
};

/**
 * 通过会员服务Id获取会员服务信息
 * @param meteringCardId
 * @param callback
 */
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

/**
 * 重新组合会员服务数据
 * @param meteringCard
 * @param callback
 */
var getMeteringCardData = function (meteringCard, callback) {
  if (meteringCard) {
    var meteringCard_data = {
      _id              :meteringCard._id,
      memberServiceName:meteringCard.meteringCardName,
      memberServiceType:'MeteringCard',
      remainCount      :meteringCard.remainCount,
      description      :meteringCard.description,
      promptIntro      :meteringCard.promptIntro,
      iconImage        :meteringCard.iconImage,
      merchantId       :meteringCard.merchant,
      serviceItemId    :meteringCard.serviceItem,
      memberId         :meteringCard.member,
      validFromDate    :meteringCard.validFromDate,
      validToDate      :meteringCard.validToDate,
      forbidden        :meteringCard.forbidden
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

var deleteMeteringCardById = function (memberCardId, callback) {
  MeteringCard.update({_id:memberCardId}, {state:'1111-1111-1111'}, function (err) {
    if (err)callback(404, {error:err});
    callback(200);
  });
}

module.exports = {
  useMeteringCard               :useMeteringCard,
  getMeteringCardById           :getMeteringCardById,
  deleteMeteringCardById           :deleteMeteringCardById,
  findMeteringCardListByMemberId:findMeteringCardListByMemberId
};