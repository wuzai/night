var SellRecord = require('../model/SellRecord').SellRecord;
var User = require('../model/User').User;
var Member = require('../model/Member').Member;
var ServiceItem = require('../model/ServiceItem').ServiceItem;
var ServiceItemProfile = require('../model/ServiceItemProfile').ServiceItemProfile;
var swiss = require('../utils/swiss-kit');
var MemberService = require('../model/MemberService').MemberService;
var MemberCard = require('../model/MemberCard').MemberCard;
var Coupon = require('../model/Coupon').Coupon;
var MeteringCard = require('../model/MeteringCard').MeteringCard;

var memberPointServer = require('./memberPoint-service');

/**
 * 根据销售记录创建会员服务
 * @param sellRecordId 销售记录Id
 * @param callback
 */
var createMemberServiceOfSellRecord = function (sellRecordId, callback) {
  SellRecord.findById(sellRecordId, function (err, sellRecord) {
    if (sellRecord) {
      var serviceItemId = sellRecord.serviceItem;
      ServiceItem.findById(serviceItemId).populate('postImage').exec(function (err, serviceItem) {
        if (err) return callback(404, {error:err});
        if (serviceItem) {
          if (serviceItem.state === '0000-0000-0000') {
            ServiceItemProfile.find({_type:'ServiceItemProfile', serviceItem:serviceItemId}).populate('attribute').exec(function (err, attrs) {
              if (err) return callback(404, {error:err});
              var attrJson = swiss.findProfileToJSON(attrs);
              //扣除积分
              var deductPoint = function (point, callback) {
                if (point && point > 0) {
                  //扣除积分
                  memberPointServer.changeMemberPoint(sellRecord.member, point, -1, 'use', function (status_point, result_point) {
                    if (err) return callback(404, {error:err});
                    sellRecord.sum = point;
                    sellRecord.count = 1;
                    sellRecord.process = '已完成';
                    sellRecord.isSucceed = true;
                    sellRecord.save(); //修改交易记录状态
                    callback(200, {point:point});
                  });
                } else {
                  //发送消息通知用户
                  sellRecord.sum = 0;
                  sellRecord.count = 1;
                  sellRecord.process = '已完成';
                  sellRecord.isSucceed = true;
                  sellRecord.save(); //修改交易记录状态
                  callback(200, {point:0});
                }
              };
              //创建服务项目
              if (serviceItem.serviceItemType === 'MemberCard') {
                var memberCard = new MemberCard({
                  memberCardName:serviceItem.serviceItemName,
                  description   :serviceItem.description,
                  promptIntro   :attrJson.promptIntro,
                  iconImage     :serviceItem.postImage ? serviceItem.postImage.imageUrl : '',
                  serviceItem   :sellRecord.serviceItem,
                  merchant      :sellRecord.merchant,
                  member        :sellRecord.member,
                  validFromDate :serviceItem.fromDate,
                  validToDate   :serviceItem.toDate,
                  forbidden     :false
                });
                memberCard.save(function (err, new_memberCard) {
                  if (err) return callback(404, {error:err});
                  deductPoint(attrJson.pointApply, callback);
                });
              } else if (serviceItem.serviceItemType === 'Coupon') {
                var coupon = new Coupon({
                  couponName   :serviceItem.serviceItemName,
                  description  :serviceItem.description,
                  promptIntro  :attrJson.promptIntro,
                  iconImage    :serviceItem.postImage ? serviceItem.postImage.imageUrl : '',
                  prefix       :attrJson.prefix,
                  quantity     :attrJson.quantity,
                  serviceItem  :sellRecord.serviceItem,
                  merchant     :sellRecord.merchant,
                  member       :sellRecord.member,
                  validFromDate:serviceItem.fromDate,
                  validToDate  :serviceItem.toDate,
                  forbidden    :false
                });
                coupon.save(function (err, new_coupon) {
                  if (err) return callback(404, {error:err});
                  deductPoint(attrJson.pointApply, callback);
                });
              } else if (serviceItem.serviceItemType === 'MeteringCard') {
                var meteringCard = new MeteringCard({
                  meteringCardName:serviceItem.serviceItemName,
                  description     :serviceItem.description,
                  promptIntro     :attrJson.promptIntro,
                  iconImage       :serviceItem.postImage ? serviceItem.postImage.imageUrl : '',
                  remainCount     :attrJson.remainCount,
                  serviceItem     :sellRecord.serviceItem,
                  merchant        :sellRecord.merchant,
                  member          :sellRecord.member,
                  validFromDate   :serviceItem.fromDate,
                  validToDate     :serviceItem.toDate,
                  forbidden       :false
                });
                meteringCard.save(function (err, new_meteringCard) {
                  if (err) return callback(404, {error:err});
                  deductPoint(attrJson.pointApply, callback);
                });
              } else {
                var memberService = new MemberService({
                  memberServiceName  :serviceItem.serviceItemName,
                  memberServiceType  :serviceItem.serviceItemType,
                  memberServiceNumber:serviceItem.serviceItemNumber,
                  description        :serviceItem.description,
                  promptIntro        :attrJson.promptIntro,
                  iconImage          :serviceItem.postImage ? serviceItem.postImage.imageUrl : '',
                  serviceItem        :sellRecord.serviceItem,
                  merchant           :sellRecord.merchant,
                  member             :sellRecord.member,
                  validFromDate      :serviceItem.fromDate,
                  validToDate        :serviceItem.toDate,
                  forbidden          :false
                });
                memberService.save(function (err, new_memberService) {
                  if (err) return callback(404, {error:err});
                  deductPoint(attrJson.pointApply, callback);
                });
              }
            });
          } else {
            callback(400, {error:'该服务项已被删除或禁用.'});
            return;
          }
        } else {
          callback(400, {error:'该服务项目未找到.'});
          return;
        }
      });
    }
  });
};

/**
 * 获取商户的销售记录
 * @param merchantId 商户Id
 * @param callback
 */
var findSellRecordListByMerchantId = function (merchantId, callback) {
  var sellRecordList_data = [];
  SellRecord.find({merchant:merchantId, state:'0000-0000-0000'}).sort({createdAt:-1}).populate('member').populate('serviceItem').exec(function (err, sellRecordList) {
    var sellRecordLen = sellRecordList.length;

    function sellRecordLoop(i) {
      if (i < sellRecordLen) {
        var sellRecord = sellRecordList[i];
        if (sellRecord && sellRecord.member) {
          var userId = sellRecord.member.user;
          User.findById(userId, function (err, user) {
            if (user) {
              sellRecord.user = user;
            }
            sellRecordList_data.push(sellRecord);
            sellRecordLoop(i + 1);
          });
        } else {
          sellRecordLoop(i + 1);
        }
      } else {
        callback(200, {sellRecords:sellRecordList_data});
      }
    }

    sellRecordLoop(0);
  });
};

/**
 * 获取商户待审核的服务列表(未完成的销售记录)
 * @param merchantId 商户Id
 * @param callback
 */
var findSellRecordOfUnfinishedByMerchantId = function (merchantId, callback) {
  SellRecord.find({merchant:merchantId, isSucceed:false, state:'0000-0000-0000'}).populate('member').populate('serviceItem', 'serviceItemName serviceItemType').exec(function (err, sellRecordList) {
    var sellRecordList_data = [];
    var sellRecordLen = sellRecordList.length;

    function sellRecordLoop(i) {
      if (i < sellRecordLen) {
        var sellRecord = sellRecordList[i];
        if (sellRecord) {
          Member.findById(sellRecord.member).populate('user', 'userName').populate('memberRank', 'memberRankName').exec(function (err, member) {
            if (member) {
              sellRecord.member = member;
              sellRecordList_data.push(sellRecord);
            }
            sellRecordLoop(i + 1);
          });
        } else {
          sellRecordLoop(i + 1);
        }
      } else {
        callback(200, {sellRecords:sellRecordList_data});
      }
    }

    sellRecordLoop(0);
  });
};

/**
 * 统计会员已申领或待申领的的某项服务的数量
 * @param memberId
 * @param serviceItemId
 * @param callback
 */
var countMemberServerOfServiceItemByMemberId = function (memberId, serviceItemId, callback) {
  SellRecord.count({member:memberId, serviceItem:serviceItemId, state:'0000-0000-0000', $or:[
    {process:'待处理'},
    {process:'已完成'}
  ]}, function (err, count) {
    var memberServiceCount = 0;
    if (count) {
      memberServiceCount = count;
    }
    callback(200, {count:memberServiceCount});
  });
};

module.exports = {
  createMemberServiceOfSellRecord         :createMemberServiceOfSellRecord,
  countMemberServerOfServiceItemByMemberId:countMemberServerOfServiceItemByMemberId,
  findSellRecordListByMerchantId          :findSellRecordListByMerchantId,
  findSellRecordOfUnfinishedByMerchantId  :findSellRecordOfUnfinishedByMerchantId
};

