var config = require('../../config');
var ObjectId = require('mongoose').Types.ObjectId;
var MeteringCard = require('../../model/MeteringCard').MeteringCard;
var ServiceItem = require('../../model/ServiceItem').ServiceItem;
var serviceItems = require('./serviceItems');

//计次卡使用确认
var meteringCardUsedConfirm = function (meteringCardId, callback) {
  MeteringCard.findById(meteringCardId).populate('serviceItem').exec(function (err, meteringCard) {
    if (err) return callback(400, {error:err});
    if (meteringCard) {
      var serviceItem = meteringCard.serviceItem;
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
        if (meteringCard.validFromDate && date > new Date(meteringCard.validFromDate)) {
          callback(403, {error:'计次卡活动未开始.'});
          return;
        }
        if (meteringCard.validToDate && date < new Date(meteringCard.validToDate)) {
          callback(403, {error:'计次卡已过期.'});
          return;
        }
        if (meteringCard.remainCount === 0) {
          callback(403, {error:'计次卡已使用完.'});
          return;
        }
        if (meteringCard.remainCount > 0) {
          var remainCount = meteringCard.remainCount - 1;
          meteringCard.remainCount = remainCount;
        }
        meteringCard.save(function (err, new_meteringCard) {
          //扣除会员积分
          serviceItems.serviceItemUsedConfirm(meteringCard.serviceItem, meteringCard.member, function (status, result) {
            if (status === 200) {
              callback(200, {error:'计次卡成功使用，已经扣除相应消费'});
            } else {
              callback(status, {error:result.error});
            }
          });
        });
      } else {
        callback(404, {error:'商户服务项目未找到，或已停止.'});
      }
    } else {
      callback(404, {error:'计次卡未找到，或已禁用.'});
    }
  });
};

module.exports = {
  meteringCardUsedConfirm:meteringCardUsedConfirm
};