var config = require('../../config');
var webRoot_wehere = config.webRoot_wehere;
var ServiceSet = require('../../model/ServiceSet').ServiceSet;
var ServiceItem = require('../../model/ServiceItem').ServiceItem;
var ServiceItemProfile = require('../../model/ServiceItemProfile').ServiceItemProfile;
var ImageStore = require('../../model/ImageStore').ImageStore;
var MemberCard = require('../../model/MemberCard').MemberCard;
var Coupon = require('../../model/Coupon').Coupon;
var MeteringCard = require('../../model/MeteringCard').MeteringCard;
var swiss = require('../../utils/swiss-kit');
var messageSendRecords = require('./messageSendRecords');
var fileServer = require('../../utils/file-server');
var serviceItemServer = require('../../services/serviceItem-service');
var storeServer = require('../../services/store-service');
var profileServer = require('../../services/profile-service');
var memberPointServer = require('../../services/memberPoint-service');
var pointServer = require('../../services/point-service');

//服务类型
var serviceItemTypes = [
  {key:'MemberCard', value:'会员卡'},
  {key:'Coupon', value:'优惠券'},
  {key:'MeteringCard', value:'计次卡'},
  {key:'GroupOn', value:'团购'},
  {key:'StoreCard', value:'储蓄卡'},
  {key:'Voucher', value:'代金券'}
];

var serviceItemList = function (req, res) {
  var merchant_session = req.session.merchant;
  var merchantId = merchant_session._id;
  serviceItemServer.findServiceItemListByMerchantId(merchantId, function (status, result) {
    storeServer.findStoreListByMerchantId(merchantId, function (status_stores, result_stores) {
      res.render('wehere/serviceItemList', {
        merchantId  :merchantId,
        stores      :result_stores.stores,
        serviceItems:result.serviceItems
      });
    });
  });
};

/**
 * 验证服务项目信息
 * @param serviceItemInfo 服务项目信息
 */
var validationServiceItemInfo = function (serviceItemInfo) {
  var result = {flag:false, message:'参数传递错误.'};
  if (serviceItemInfo.serviceItemName && serviceItemInfo.serviceItemName.trim()) {
    if (serviceItemInfo.fromDate && serviceItemInfo.toDate && new Date(serviceItemInfo.fromDate) > new Date(serviceItemInfo.toDate)) {
      result.message = '活动开始时间不能小于结束时间.';
      return result;
    }
    if (serviceItemInfo.quantity && !swiss.isInteger(serviceItemInfo.quantity)) {
      result.message = '优惠券数量必须输入整数.';
      return result;
    }
    if (serviceItemInfo.remainCount && !swiss.isInteger(serviceItemInfo.remainCount)) {
      result.message = '计次卡数量必须输入整数.';
      return result;
    }
    if (serviceItemInfo.serviceItemNumber && !swiss.isInteger(serviceItemInfo.serviceItemNumber)) {
      result.message = '储蓄卡金额必须输入整数.';
      return result;
    }
    if (serviceItemInfo.pointApply && !swiss.isInteger(serviceItemInfo.pointApply)) {
      result.message = '服务申领所需要的积分必须输入整数.';
      return result;
    }
    if (serviceItemInfo.pointUsed && !swiss.isInteger(serviceItemInfo.pointUsed)) {
      result.message = '服务使用所需要的积分必须输入整数.';
      return result;
    }
    if (serviceItemInfo.allowApplyNumber && !swiss.isInteger(serviceItemInfo.allowApplyNumber)) {
      result.message = '服务申领次数必须输入整数.';
      return result;
    }
  } else {
    result.message = '服务项目名称不能为空.';
    return result;
  }
  result.flag = true;
  result.message = '';
  return result;
};

/**
 * 服务信息处理
 * @param serviceItemInfo 服务项目信息
 */
var dataHandlingServiceItemInfo = function (serviceItemInfo) {
  var type = serviceItemInfo.serviceItemType;
  if (type === 'MemberCard') {
    serviceItemInfo.serviceItemNumber = 0;
    serviceItemInfo.quantity = 0;
    serviceItemInfo.remainCount = 0;
    serviceItemInfo.pointApply = 0;
    serviceItemInfo.pointUsed = 0;
    serviceItemInfo.isUseUserPoint = false;
    serviceItemInfo.isRepeatApply = false;
    serviceItemInfo.allowApplyNumber = 0;
  } else if (type === 'Coupon') {
    serviceItemInfo.serviceItemNumber = 0;
    serviceItemInfo.quantity = 1;
    serviceItemInfo.remainCount = 0;
  } else if (type === 'MeteringCard') {
    serviceItemInfo.serviceItemNumber = 0;
    serviceItemInfo.quantity = 0;
  } else if (type === 'StoreCard') {
    serviceItemInfo.quantity = 0;
    serviceItemInfo.remainCount = 0;
    serviceItemInfo.pointUsed = 0;
    serviceItemInfo.allowApplyNumber = 0;
  } else if (type === 'GroupOn') {
    serviceItemInfo.serviceItemNumber = 0;
    serviceItemInfo.quantity = 0;
    serviceItemInfo.remainCount = 0;
    serviceItemInfo.isRepeatApply = false;
    serviceItemInfo.allowApplyNumber = 0;
  } else if (type === 'Voucher') {
    serviceItemInfo.serviceItemNumber = 0;
    serviceItemInfo.quantity = 0;
    serviceItemInfo.remainCount = 0;
  }
  return serviceItemInfo;
}

var addServiceItem = function (req, res) {
  var body = req.body;
  var isChangePoint = body.isChangePoint;//判断服务是申领扣除积分还是使用扣除积分（true是申领时扣除,false是使用时扣除）
  var serviceItemInfo = {
    merchant         :body.merchantId, //商户Id,
    serviceItemName  :body.serviceItemName, //服务名称
    description      :body.description, //描述信息/服务详情
    serviceItemType  :body.serviceItemType, //服务类型
    serviceItemNumber:body.serviceItemNumber, //服务数量/积分/次数等
    quantity         :body.quantity, //优惠券数量
    remainCount      :body.remainCount, //计次卡次数
    promptIntro      :body.promptIntro, //提示信息
    ruleText         :body.ruleText, //服务使用规则
    fromDate         :body.fromDate, //开始日期
    toDate           :body.toDate, //结束日期
    applyExplain     :body.applyExplain, //申领说明
    pointApply       :isChangePoint ? body.pointApply : 0, //申领所需积分
    pointUsed        :isChangePoint ? 0 : body.pointUsed, //使用所需积分
    isMinMemberPoint   :body.isMinMemberPoint,
    isUseUserPoint   :body.isUseUserPoint, //是否使用用户平台积分
    isRepeatApply    :body.isRepeatApply, //是否可以重复领取
    allowApplyNumber :body.allowApplyNumber, //允许领取的数量
    isRequireAudit   :body.isRequireAudit, //是否需要审核
    allowLargess     :body.allowLargess, //是否允许转赠
    allowShare       :body.allowShare, //是否允许分享
    postImage        :body.postImage, //服务海报图片
    usableStores     :body.usableStores//可用门店
  };
  var result_validation = validationServiceItemInfo(serviceItemInfo);
  if (result_validation.flag) {
    var new_serviceItemInfo = dataHandlingServiceItemInfo(serviceItemInfo);
    serviceItemSave(req, new_serviceItemInfo, function (status, result) {
      if (status === 200) {
        req.session.messages = {notice:'服务项目添加成功！'};
      } else {
        req.session.messages = {error:[result.error]};
      }
    });
    res.redirect([webRoot_wehere , '/service/serviceItemList'].join(''));
  } else {
    req.session.messages = {error:[result_validation.message]};
    res.redirect([webRoot_wehere , '/service/serviceItemList'].join(''));
  }
};

/**
 * 服务信息保存
 * @param req
 * @param serviceItemInfo 商户信息
 * @param callback
 */
var serviceItemSave = function (req, serviceItemInfo, callback) {
  if (serviceItemInfo.serviceItemName && serviceItemInfo.serviceItemName.trim()) {
    var serviceItemName = serviceItemInfo.serviceItemName.trim();
    var serviceItem = new ServiceItem({
      serviceItemName  :serviceItemName,
      description      :serviceItemInfo.description,
      serviceItemType  :serviceItemInfo.serviceItemType,
      serviceItemNumber:serviceItemInfo.serviceItemNumber,
      ruleText         :serviceItemInfo.ruleText,
      fromDate         :serviceItemInfo.fromDate,
      toDate           :serviceItemInfo.toDate,
      applyExplain     :serviceItemInfo.applyExplain,
      isMinMemberPoint   :serviceItemInfo.isMinMemberPoint,
      isUseUserPoint   :serviceItemInfo.isUseUserPoint,
      isRequireAudit   :serviceItemInfo.isRequireAudit,
      isRepeatApply    :serviceItemInfo.isRepeatApply,
      allowApplyNumber :serviceItemInfo.allowApplyNumber,
      allowLargess     :serviceItemInfo.allowLargess,
      allowShare       :serviceItemInfo.allowShare,
      usableStores     :serviceItemInfo.usableStores,
      isMemberOnly     :true,
      isRequireApply   :true,
      isApplicable     :true
    });
    fileServer.uploadFileMain(req, 'postImage', '/sys/user/images', function (data) {
      if (data.success) {
        var url = data.fileUrl;
        var imageStore = new ImageStore({
          imageUrl    :url,
          retinaUrl   :url,
          smallUrl    :url,
          thumbnailUrl:url
        });
        serviceItem.postImage = imageStore;
        imageStore.save();
      }
      var serviceSet = new ServiceSet({
        merchant      :serviceItemInfo.merchant,
        serviceSetName:serviceItemInfo.serviceItemName,
        description   :serviceItemInfo.description,
        isEnabled     :true,
        isApproved    :true
      });
      serviceSet.save(function (err, new_serviceSet) {
        if (err) return callback(404, {error:err});
        serviceItem.serviceSet = new_serviceSet;
        serviceItem.save(function (err, new_serviceItem) {
          if (err) return callback(404, {error:err});
          //保存服务扩展属性
          profileServer.addServiceItemOfProfile('quantity', new_serviceItem._id, serviceItemInfo.quantity, function (status, result) {
            profileServer.addServiceItemOfProfile('remainCount', new_serviceItem._id, serviceItemInfo.remainCount, function (status, result) {
              profileServer.addServiceItemOfProfile('promptIntro', new_serviceItem._id, serviceItemInfo.promptIntro, function (status, result) {
                profileServer.addServiceItemOfProfile('pointApply', new_serviceItem._id, serviceItemInfo.pointApply, function (status, result) {
                  profileServer.addServiceItemOfProfile('pointUsed', new_serviceItem._id, serviceItemInfo.pointUsed, function (status, result) {
                    callback(200, new_serviceItem);
                  });
                });
              });
            });
          });
        });
      });
    });
  } else {
    callback(400, {error:'服务项目名称不能为空.'});
    return;
  }
};

var openServiceItemAddPage = function (req, res) {
  var merchant_session = req.session.merchant;
  var merchantId = merchant_session._id;
  storeServer.findStoreListByMerchantId(merchantId, function (status_stores, result_stores) {
    res.render('wehere/serviceItemAdd', {merchantId:merchantId, serviceItemTypes:serviceItemTypes, stores:result_stores.stores});
  });
};

var serviceItemEditPage = function (req, res) {
  var merchant = req.session.merchant;
  var query = req.query;
  var serviceItemId = query.serviceItemId;
  ServiceItem.findOne({_id:serviceItemId, state:'0000-0000-0000'}).populate('postImage', 'imageUrl').exec(function (err, serviceItem) {
    if (serviceItem) {
      ServiceItemProfile.find({_type:'ServiceItemProfile', serviceItem:serviceItem._id}).populate('attribute').exec(function (err, attrs) {
        var attrJson = swiss.findProfileToJSON(attrs);
        var serviceItemInfo = {
          _id              :serviceItem._id,
          serviceItemName  :serviceItem.serviceItemName,
          description      :serviceItem.description,
          serviceItemType  :serviceItem.serviceItemType,
          serviceItemNumber:serviceItem.serviceItemNumber,
          quantity         :attrJson.quantity,
          remainCount      :attrJson.remainCount,
          promptIntro      :attrJson.promptIntro,
          ruleText         :serviceItem.ruleText,
          fromDate         :serviceItem.fromDate,
          toDate           :serviceItem.toDate,
          applyExplain     :serviceItem.applyExplain,
          pointApply       :attrJson.pointApply,
          pointUsed        :attrJson.pointUsed,
          isMinMemberPoint   :serviceItem.isMinMemberPoint,
          isUseUserPoint   :serviceItem.isUseUserPoint,
          isRepeatApply    :serviceItem.isRepeatApply,
          allowApplyNumber :serviceItem.allowApplyNumber,
          isRequireAudit   :serviceItem.isRequireAudit,
          allowLargess     :serviceItem.allowLargess,
          allowShare       :serviceItem.allowShare,
          postImage        :serviceItem.postImage ? serviceItem.postImage.imageUrl : null
        };
        res.render('wehere/serviceItemEdit', {
          merchantId     :merchant._id,
          serviceItem     :serviceItemInfo,
          serviceItemTypes:serviceItemTypes
        });
      });
    } else {
      req.session.messages = {error:['未获取到相关数据']};
      res.redirect([webRoot_wehere , '/dashboard'].join(''));
    }
  });
};

var serviceItemEditSave = function (req, res) {
  var body = req.body;
  var serviceItemId = body.serviceItemId;
  var isChangePoint = body.isChangePoint ? true : false;//判断服务是申领扣除积分还是使用扣除积分（true是申领时扣除,false是使用时扣除）
  var serviceItemInfo = {
    _id              :serviceItemId, //服务Id
    serviceItemName  :body.serviceItemName, //服务名称
    description      :body.description, //描述信息/服务详情
    serviceItemType  :body.serviceItemType, //服务类型
    serviceItemNumber:body.serviceItemNumber, //服务数量/积分/次数等
    quantity         :body.quantity, //优惠券数量
    remainCount      :body.remainCount, //计次卡次数
    promptIntro      :body.promptIntro, //提示信息
    ruleText         :body.ruleText, //服务使用规则
    fromDate         :body.fromDate, //开始日期
    toDate           :body.toDate, //结束日期
    applyExplain     :body.applyExplain, //申领说明
    pointApply       :isChangePoint ? body.pointApply : 0, //申领所需积分
    pointUsed        :isChangePoint ? 0 : body.pointUsed, //使用所需积分
    isMinMemberPoint   :body.isMinMemberPoint,
    isUseUserPoint   :body.isUseUserPoint, //是否使用用户平台积分
    isRepeatApply    :body.isRepeatApply, //是否可以重复领取
    allowApplyNumber :body.allowApplyNumber, //允许领取的数量
    isRequireAudit   :body.isRequireAudit, //是否需要审核
    allowLargess     :body.allowLargess, //是否允许转赠
    allowShare       :body.allowShare, //是否允许分享
    postImage        :body.postImage //服务海报图片
  };
  var result_validation = validationServiceItemInfo(serviceItemInfo);
  if (result_validation.flag) {
    var new_serviceItemInfo = dataHandlingServiceItemInfo(serviceItemInfo);
    serviceItemUpdate(req, new_serviceItemInfo, function (status, result) {
      if (status === 200) {
        req.session.messages = {notice:'服务信息修改成功！'};
        res.redirect([webRoot_wehere , '/service/serviceItemList'].join(''));
      } else {
        req.session.messages = {error:[result.error]};
        res.redirect([webRoot_wehere , '/service/serviceItemEdit?serviceItemId=' , serviceItemId].join(''));
      }
    });
  } else {
    req.session.messages = {error:[result_validation.message]};
    res.redirect([webRoot_wehere , '/service/serviceItemEdit?serviceItemId=' , serviceItemId].join(''));
  }
};

var serviceItemUpdate = function (req, serviceItemInfo, callback) {
  if (serviceItemInfo.serviceItemName && serviceItemInfo.serviceItemName.trim()) {
    var serviceItemName = serviceItemInfo.serviceItemName.trim();
    var update_data = {
      serviceItemName  :serviceItemName,
      serviceItemNumber:serviceItemInfo.serviceItemNumber,
      description      :serviceItemInfo.description,
      ruleText         :serviceItemInfo.ruleText,
      fromDate         :serviceItemInfo.fromDate,
      toDate           :serviceItemInfo.toDate,
      applyExplain     :serviceItemInfo.applyExplain,
      isMinMemberPoint   :serviceItemInfo.isMinMemberPoint ? true : false,
      isUseUserPoint   :serviceItemInfo.isUseUserPoint ? true : false,
      isRepeatApply    :serviceItemInfo.isRepeatApply ? true : false,
      allowApplyNumber :serviceItemInfo.allowApplyNumber,
      isRequireAudit   :serviceItemInfo.isRequireAudit ? true : false,
      allowLargess     :serviceItemInfo.allowLargess ? true : false,
      allowShare       :serviceItemInfo.allowShare ? true : false
    };
    fileServer.uploadFileMain(req, 'postImage', '/sys/user/images', function (data) {
      if (data.success) {
        var url = data.fileUrl;
        var imageStore = new ImageStore({
          imageUrl    :url,
          retinaUrl   :url,
          smallUrl    :url,
          thumbnailUrl:url
        });
        update_data.postImage = imageStore;
        imageStore.save();
      }
      ServiceItem.update({_id:serviceItemInfo._id}, update_data, function (err, new_serviceItem) {
        if (err) return callback(404, {error:err});
        profileServer.editServiceItemOfProfile('quantity', serviceItemInfo._id, serviceItemInfo.quantity, function (status, result) {
          profileServer.editServiceItemOfProfile('remainCount', serviceItemInfo._id, serviceItemInfo.remainCount, function (status, result) {
            profileServer.editServiceItemOfProfile('promptIntro', serviceItemInfo._id, serviceItemInfo.promptIntro, function (status, result) {
              profileServer.editServiceItemOfProfile('pointApply', serviceItemInfo._id, serviceItemInfo.pointApply, function (status, result) {
                profileServer.editServiceItemOfProfile('pointUsed', serviceItemInfo._id, serviceItemInfo.pointUsed, function (status, result) {
                  callback(200, new_serviceItem);
                });
              });
            });
          });
        });
      });
    });
  } else {
    callback(400, {error:'商户名称不能为空.'});
    return;
  }
};

var serviceItemDelete = function (req, res) {
  var query = req.query;
  var serviceItemId = query.serviceItemId;
  ServiceItem.update({_id:serviceItemId}, {state:'1111-1111-1111'}, function (err, count) {
    res.redirect([webRoot_wehere , '/service/serviceItemList'].join(''));
  });
};

var findStoresByServiceItemId = function (req, res) {
  var merchant_session = req.session.merchant;
  var merchantId = merchant_session._id;
  var query = req.query;
  var serviceItemId = query.serviceItemId;
  ServiceItem.findById(serviceItemId, 'usableStores', function (err, serviceItem) {
    var storeList_data = [];
    if (serviceItem) {
      var selectedStores = serviceItem.usableStores ? serviceItem.usableStores : [];
      storeServer.findStoreListByMerchantId(merchantId, function (status, result) {
        if (status === 200 && result) {
          var storeList = result.stores;
          for (var i in storeList) {
            var store = storeList[i];
            var store_data = {
              _id      :store._id,
              storeName:store.storeName,
              selected :false
            };
            if (selectedStores.indexOf(store._id) > -1) {
              store_data.selected = true;
            }
            storeList_data.push(store_data);
          }
        }
        res.json({status:200, stores:storeList_data});
        return;
      });
    } else {
      res.json({status:200, stores:storeList_data});
      return;
    }
  });
};

var usableStoresSave = function (req, res) {
  var body = req.body;
  var serviceItemId = body.serviceItemId;
  var usableStores = body.usableStores;
  ServiceItem.findById(serviceItemId, function (err, serviceItem) {
    serviceItem.usableStores = usableStores;
    serviceItem.save();
    res.redirect([webRoot_wehere , '/service/serviceItemList'].join(''));
  });
};

/**
 * 服务使用确认并扣除积分
 * @param serviceItemId
 * @param memberId
 * @param callback
 * @since 1.1
 */
var serviceItemUsedConfirm = function (serviceItemId, memberId, callback) {
  ServiceItemProfile.find({_type:'ServiceItemProfile', serviceItem:serviceItemId}).populate('attribute').exec(function (err, attrs) {
    if (err) return callback(400, {error:err});
    var attrJson = swiss.findProfileToJSON(attrs);
    //使用服务所需积分
    var pointUsed = attrJson.pointUsed ? attrJson.pointUsed : 0;
    memberPointServer.getMemberPoint(memberId, function (status, result) {
      var memberPoint = result.memberPoint;
      if (pointUsed && pointUsed > 0) {
        if (memberPoint.availablePoint >= pointUsed) {
          //使用服务并扣除积分
          memberPointServer.changeMemberPoint(memberId, pointUsed, -1, 'use', function (status, result) {
            if (status === 200) {
              //发送消息通知用户
              messageSendRecords.serviceItemUsedConfirm(memberId, 0, function (status, result) {
                callback(200, {})
              })
            } else {
              callback(404, {error:result.error});
            }
          });
        } else {
          //获取服务
          var itemDetailFields = '_id isUseUserPoint';
          ServiceItem.findById(serviceItemId, itemDetailFields, function (err, serviceItem) {
            if (err) return callback(404, {error:err});
            if (serviceItem) {
              var isUseUserPoint = serviceItem.isUseUserPoint;//是否可使用平台积分
              if (isUseUserPoint) {
                //申领服务所差积分
                var lackPoint = pointUsed - memberPoint.availablePoint;
                pointServer.userPointToMember(memberId, lackPoint, function (status_point2, result_point2) {
                  if (status_point2 === 200) {
                    serviceItemUsedConfirm(serviceItemId, memberId, callback);
                  } else {
                    callback(status_point2, {error:result_point2.error});
                  }
                });
              } else {
                //会员积分不足，请充值.
                callback(403, {error:'会员积分不足,请充值.'});
              }
            } else {
              callback(400, {error:'该服务项目未找到,或者已被禁用.'});
              return;
            }
          });
        }
      } else {
        //发送消息通知用户
        messageSendRecords.serviceItemUsedConfirm(memberId, 0, function (status, result) {
          //使用服务不需要积分
          callback(200, {error:'使用服务不需要积分.'})
        })
      }
    });
  });
};

module.exports = {
  serviceItemList          :serviceItemList,
  openServiceItemAddPage   :openServiceItemAddPage,
  addServiceItem           :addServiceItem,
  serviceItemEditPage      :serviceItemEditPage,
  serviceItemEditSave      :serviceItemEditSave,
  serviceItemDelete        :serviceItemDelete,
  findStoresByServiceItemId:findStoresByServiceItemId,
  usableStoresSave         :usableStoresSave,
  serviceItemUsedConfirm   :serviceItemUsedConfirm
};