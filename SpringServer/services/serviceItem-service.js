var ServiceSet = require('../model/ServiceSet').ServiceSet;
var Product = require('../model/Product').Product;
var ServiceItem = require('../model/ServiceItem').ServiceItem;
var Member = require('../model/Member').Member;
var SellRecord = require('../model/SellRecord').SellRecord;
var ServiceItemProfile = require('../model/ServiceItemProfile').ServiceItemProfile;
var swiss = require('../utils/swiss-kit');
var memberServer = require('./member-service');
var sellRecordServer = require('./sellRecord-service');
var memberPointServer = require('./memberPoint-service');
var pointServer = require('./point-service');
var messageServer = require('./message-service');

/**
 * 根据用户Id申领merchantId商户的serviceItemId服务
 * @param userId
 * @param serviceItemId
 * @param callback
 */
var applicableServiceItemByUserId = function (userId, merchantId, serviceItemId, callback) {
  //获取服务
  var itemDetailFields = '_id isUseUserPoint isRequireAudit isRepeatApply allowApplyNumber state';
  ServiceItem.findById(serviceItemId, itemDetailFields, function (err, serviceItem) {
    if (err) return callback(404, {error:err});
    if (serviceItem) {
      if (serviceItem.state === '0000-0000-0000') {
        ServiceItemProfile.find({_type:'ServiceItemProfile', serviceItem:serviceItem._id}).populate('attribute').exec(function (err, attrs) {
          if (err) return callback(404, {error:err});
          var attrJson = swiss.findProfileToJSON(attrs);

          var executeApplicableServiceItem = function (pointApply, member) {
            var isRepeatApply = serviceItem.isRepeatApply;//是否允许重复申领
            var allowApplyNumber = serviceItem.allowApplyNumber;//允许申领的数量
            //统计会员已申领或待申领的的某项服务的数量
            sellRecordServer.countMemberServerOfServiceItemByMemberId(member._id, serviceItemId, function (status_count, result_count) {
              var count = result_count.count;//可以申领的数量
              var applicableServiceItem = function (pointApply, member) {
                memberPointServer.getMemberPoint(member._id, function (status_point, result_point) {
                  if (status_point === 200) {
                    var memberPoint = result_point.memberPoint;//会员的可用积分
                    if (memberPoint.availablePoint >= pointApply) {
                      var isRequireAudit = serviceItem.isRequireAudit;//是否需要商户审核
                      //创建销售记录
                      var sellRecord = new SellRecord({
                        merchant   :merchantId,
                        member     :member._id,
                        serviceItem:serviceItemId,
                        process    :'待处理',
                        isSucceed  :false,
                        count      :0,
                        sum        :0
                      });
                      sellRecord.save(function (err, new_sellRecord) {
                        if (err) return callback(404, {error:err});
                        //是否需要商户审核
                        if (isRequireAudit) {
                          //创建会员服务发送消息
                          messageServer.applyMemberServiceAudit(serviceItemId, member._id, function (status, result) {
                            console.log(result);
                          });
                          //等待商户审核.审核通过后创建服务
                          callback(203, {error:'申领请求已发出，等待商户审核.'});
                          return;
                        } else {
                          //创建服务
                          sellRecordServer.createMemberServiceOfSellRecord(new_sellRecord._id, function (status, result) {
                            if (status === 200) {
                              //创建会员服务发送消息
                              messageServer.createMemberServiceOfServiceItem(serviceItemId, new_sellRecord.member, function (status, result) {
                                console.log(result);
                              });
                            }
                          });
                          callback(200, {});
                          return;
                        }
                      });
                    } else {
                      //积分不足,判断是否可用平台积分
                      var isUseUserPoint = serviceItem.isUseUserPoint;//是否可使用平台积分
                      if (isUseUserPoint) {
                        //申领服务所差积分
                        var lackPoint = pointApply - memberPoint.availablePoint;
                        //用平台积分，兑换相应的会员积分
                        pointServer.userPointToMember(member._id, lackPoint, function (status_point2, result_point2) {
                          if (status_point2 === 200) {
                            //回调申领函数
                            executeApplicableServiceItem(pointApply, member);
                          } else {
                            callback(status_point2, {error:result_point2.error});
                          }
                        });
                      } else {
                        callback(444, {error:'您的会员积分不足,请到该商户充值.'});
                      }
                    }
                  } else {
                    callback(403, {error:result_point.error});
                  }
                });
              }
              if (isRepeatApply) {
                //允许重复领取(限制领取的数量)
                if (count < allowApplyNumber) {
                  applicableServiceItem(pointApply, member);
                } else {
                  callback(401, {error:['该服务最多只能申领', allowApplyNumber, '次,您已经申领或在审核中.'].join('')});
                  return;
                }
              } else {
                //不允许重复领取
                if (count > 0) {
                  callback(401, {error:'该服务您已经申领,不能重复申领.'});
                  return;
                } else {
                  applicableServiceItem(pointApply, member);
                }
              }
            });
          };

          //申领服务所需积分
          var pointApply = attrJson.pointApply;
          if (pointApply && pointApply > 0) {
            //申领需要pointApply会员积分(提示用户不是会员或积分不足.)
            Member.findOne({merchant:merchantId, user:userId}, function (err, member) {
              if (member) {
                if (member.state === '0000-0000-0000') {
                  //申领服务并扣除积分
                  executeApplicableServiceItem(pointApply, member);
                } else {
                  callback(403, {error:'您在该商户的会员,已被商户禁用,请联系该商户.'});
                  return;
                }
              } else {
                callback(444, {error:'您不是该商户的会员,或您的会员积分不足,请到该商户充值.'});
                return;
              }
            });
          } else {
            //申领不需要积分(如果您不是会员,系统会默认创建会员.)
            memberServer.createMemberOfMerchant(merchantId, userId, function (status_member, result_member) {
              if (status_member === 200) {
                var member = result_member.member;
                if (member.state === '0000-0000-0000') {
                  executeApplicableServiceItem(0, member);
                } else {
                  callback(403, {error:'您在该商户的会员,已被商户禁用,请联系该商户.'});
                  return;
                }
              } else {
                callback(status_member, {error:result_member.error});
                return;
              }
            });
          }
        });
      } else {
        callback(400, {error:'该服务项目已经被删除或禁用.'});
        return;
      }
    } else {
      callback(400, {error:'未获取该服务项目相关数据.'});
      return;
    }
  });
};

/**
 * 获取商户下的服务项目
 * @param merchantId 商户Id
 * @param callback
 */
var findServiceItemListByMerchantId = function (merchantId, callback) {
  var serviceItemList_data = [];
  ServiceSet.find({merchant:merchantId, state:'0000-0000-0000'}, '_id').sort({createdAt:-1}).exec(function (err, serviceSetList) {
    var serviceSetLen = serviceSetList.length;

    function serviceSetLoop(i) {
      if (i < serviceSetLen) {
        var serviceSet = serviceSetList[i];
        ServiceItem.find({serviceSet:serviceSet._id, state:'0000-0000-0000'}).sort({createdAt:-1}).populate('postImage', 'imageUrl').exec(function (err, serviceItemList) {
          for (var m in serviceItemList) {
            var serviceItem = serviceItemList[m];
            serviceItemList_data.push(serviceItem);
          }
          serviceSetLoop(i + 1);
        });
      } else {
        callback(200, {serviceItems:serviceItemList_data});
      }
    }

    serviceSetLoop(0);
  });
};

/**
 *  获取limit数量的最新商户服务列表
 * @param merchantId
 * @param limit
 * @param callback
 */
var findServiceItemListOfLimitByMerchantId = function (merchantId, limit, callback) {
  ServiceSet.find({merchant:merchantId, state:'0000-0000-0000'}).select('_id').exec(function (err, serviceSetList) {
    ServiceItem.find({state:'0000-0000-0000'}).sort({updatedAt:-1}).limit(limit).populate('postImage', 'imageUrl').where('serviceSet').in(serviceSetList).exec(function (err, serviceItemList) {
      if (err) return callback(400, {error:err});
      callback(200, {serviceItems:serviceItemList});
    });
  });
};

/**
 * 统计商户下的服务项目数量
 * @param merchantId
 * @param callback
 */
var countServiceItemsByMerchantId = function (merchantId, callback) {
  var count_data = 0;
  ServiceSet.find({merchant:merchantId, state:'0000-0000-0000'}, '_id', function (err, serviceSetList) {
    var serviceSetLen = serviceSetList.length;

    function serviceSetLoop(i) {
      if (i < serviceSetLen) {
        var serviceSet = serviceSetList[i];
        ServiceItem.count({serviceSet:serviceSet._id, state:'0000-0000-0000'}, function (err, count) {
          count_data += count;
          serviceSetLoop(i + 1);
        });
      } else {
        callback(200, {count:count_data});
      }
    }

    serviceSetLoop(0);
  });
};
/**
 * 统计商户下的服务指南数量
 * @param merchantId
 * @param callback
 */
var countProductByMerchantId = function (merchantId, callback) {
  Product.count({merchant:merchantId, state:'0000-0000-0000'}, function (err,count) {
    callback(200, {count:count});
//    function serviceSetLoop(i) {
//      if (i < serviceSetLen) {
//        var serviceSet = serviceSetList[i];
//        ServiceItem.count({serviceSet:serviceSet._id, state:'0000-0000-0000'}, function (err, count) {
//          count_data += count;
//          serviceSetLoop(i + 1);
//        });
//      } else {
//        callback(200, {count:count_data});
//      }
//    }

//    serviceSetLoop(0);
  });
};
module.exports = {
  applicableServiceItemByUserId         :applicableServiceItemByUserId,
  countServiceItemsByMerchantId         :countServiceItemsByMerchantId,
  findServiceItemListOfLimitByMerchantId:findServiceItemListOfLimitByMerchantId,
  findServiceItemListByMerchantId       :findServiceItemListByMerchantId,
  countProductByMerchantId       :countProductByMerchantId
};