var config = require('../../config');
var ObjectId = require('mongoose').Types.ObjectId;
var MemberCard = require('../../model/MemberCard').MemberCard;
var ServiceItem = require('../../model/ServiceItem').ServiceItem;
var serviceItems = require('./serviceItems');

//会员卡使用确认
var memberCardUsedConfirm = function (memberCardId, callback) {
  MemberCard.findById(memberCardId).populate('serviceItem').exec(function (err, memberCard) {
    if (err) return callback(400, {error:err});
    if (memberCard) {
      var serviceItem = memberCard.serviceItem;
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
        if (memberCard.validFromDate && date > new Date(memberCard.validFromDate)) {
          callback(403, {error:'会员卡活动未开始.'});
          return;
        }
        if (memberCard.validToDate && date < new Date(memberCard.validToDate)) {
          callback(403, {error:'会员卡已过期.'});
          return;
        }
        //扣除会员积分
        serviceItems.serviceItemUsedConfirm(memberCard.serviceItem, memberCard.member, function (status, result) {
          if (status === 200) {
            callback(200, {error:'会员卡成功使用，已经扣除相应消费'});
          } else {
            callback(status, {error:result.error});
          }
        });
      } else {
        callback(404, {error:'商户服务项目未找到，或已停止.'});
      }
    } else {
      callback(404, {error:'会员卡未找到，或已禁用.'});
    }
  });
};

module.exports = {
  memberCardUsedConfirm:memberCardUsedConfirm
};