var config = require('../config');
var advertisementServer = require('./advertisement-service');
var serviceItemServer = require('./serviceItem-service');
var merchantInMerchantServer = require('./merchantInMerchant-service');
var supplyDemandServer = require('./supplyDemand-service');
var commentServer = require('./comment-service');
var userServiceServer = require('./userService-service');
var messageSendRecordServer = require('./messageSendRecord-service');

/**
 * 获取我的包包会员服务信息列表
 * @param merchantId
 * @param userId
 * @param callback
 */
var findMyMemberServiceData = function (merchantId, userId, callback) {
  userServiceServer.findMemberServiceOfLimitByUserIdAndMerchantId(merchantId, userId, 5, function (status_ms, result_ms) {
    var memberServiceList_data = [];
    if (status_ms === 200) {
      var memberServiceList = result_ms.memberServices;
      for (var i in memberServiceList) {
        var memberService = memberServiceList[i];
        if (memberService) {
          var memberService_data = {
            _id        :memberService._id,
            imageUrl   :memberService.iconImage ? memberService.iconImage : '',
            title      :memberService.memberServiceName,
            type       :memberService.memberServiceType,
            description:memberService.description
          };
          memberServiceList_data.push(memberService_data);
        }
      }
    }
    callback(status_ms, memberServiceList_data);
  });
};

/**
 * 获取商户的广告信息列表
 * @param merchantId
 * @param callback
 */
var findAdvertisementData = function (merchantId, callback) {
  advertisementServer.findAdvertisementListOfLimitByMerchantId(merchantId, 5, function (status_ad, result_ad) {
    var advertisementList_data = [];
    if (status_ad === 200) {
      var advertisementList = result_ad.advertisements;
      for (var i in advertisementList) {
        var advertisement = advertisementList[i];
        if (advertisement) {
          var advertisement_data = {
            _id        :advertisement._id,
            imageUrl   :advertisement.postImage ? advertisement.postImage.imageUrl : '',
            title      :advertisement.title,
            description:advertisement.title
          };
          advertisementList_data.push(advertisement_data);
        }
      }
    }
    callback(status_ad, advertisementList_data);
  });
};

/**
 * 获取商户的服务信息列表
 * @param merchantId
 * @param callback
 */
var findServiceItemData = function (merchantId, callback) {
  serviceItemServer.findServiceItemListOfLimitByMerchantId(merchantId, 5, function (status_item, result_item) {
    var serviceItemList_data = [];
    if (status_item === 200) {
      var serviceItemList = result_item.serviceItems;
      for (var i in serviceItemList) {
        var serviceItem = serviceItemList[i];
        if (serviceItem) {
          var serviceItem_data = {
            _id        :serviceItem._id,
            imageUrl   :serviceItem.postImage ? serviceItem.postImage.imageUrl : '',
            title      :serviceItem.serviceItemName,
            description:serviceItem.description
          };
          serviceItemList_data.push(serviceItem_data);
        }
      }
    }
    callback(status_item, serviceItemList_data);
  });
};

/**
 * 获取对商户的评论
 * @param merchantId
 * @param callback
 */
var findCommentData = function (merchantId, callback) {
  commentServer.findCommentListOfLimitByMerchantId(merchantId, 5, function (status_com, result_com) {
    var commentList_data = [];
    if (status_com === 200) {
      var commentList = result_com.comments;
      for (var i in commentList) {
        var comment = commentList[i];
        if (comment) {
          var ratingStr = comment.rating ? comment.rating + '颗星' : '';
          var content = comment.content ? comment.content : ratingStr;
          var comment_data = {
            _id        :comment._id,
            imageUrl   :comment.user && comment.user.faceIcon ? comment.user.faceIcon : config.systemDefault.userFace,
            title      :content,
            description:content
          };
          commentList_data.push(comment_data);
        }
      }
    }
    callback(status_com, commentList_data);
  });
};

/**
 * 获取用户的消息记录信息
 * @param userId
 * @param callback
 */
var findMyMessageData = function (userId, callback) {
  messageSendRecordServer.findMessageSendRecordOfLimitByUserIdAndMerchantId(userId, 5, function (status_msg, result_msg) {
    var messageSendRecordList_data = [];
    if (status_msg === 200) {
      var messageSendRecordList = result_msg.messageSendRecords;
      for (var i in messageSendRecordList) {
        var messageSendRecord = messageSendRecordList[i];
        if (messageSendRecord) {
          var messageSendRecord_data = {
            _id        :messageSendRecord._id,
            imageUrl   :messageSendRecord.iconImage,
            title      :messageSendRecord.title,
            description:messageSendRecord.content
          };
          messageSendRecordList_data.push(messageSendRecord_data);
        }
      }
    }
    callback(status_msg, messageSendRecordList_data);
  });
};

/**
 * 获取该商户的推荐商户列表
 * @param merchantId
 * @param callback
 */
var findMerchantUnionData = function (merchantId, callback) {
  merchantInMerchantServer.findSubMerchantListOfLimitByMerchantId(merchantId, 5, function (status_m, result_m) {
    var merchantList_data = [];
    if (status_m === 200) {
      var merchantList = result_m.merchants;
      for (var i in merchantList) {
        var merchant = merchantList[i];
        if (merchant) {
          var merchant_data = {
            _id        :merchant._id,
            imageUrl   :merchant.logoImage ? merchant.logoImage.imageUrl : '',
            title      :merchant.merchantName,
            description:merchant.description
          };
          merchantList_data.push(merchant_data);
        }
      }
    }
    callback(status_m, merchantList_data);
  })
};

/**
 * 获取该商户的资源供需列表
 * @param merchantId
 * @param callback
 */
var findSupplyDemandData = function (merchantId, callback) {
  supplyDemandServer.findSupplyDemandListOfLimitByMerchantId(merchantId, 5, function (status_sd, result_sd) {
    var supplyDemandList_data = [];
    if (status_sd === 200) {
      var supplyDemandList = result_sd.supplyDemands;
      for (var i in supplyDemandList) {
        var supplyDemand = supplyDemandList[i];
        if (supplyDemand) {
          var supplyDemand_data = {
            _id        :supplyDemand._id,
            imageUrl   :'',
            title      :supplyDemand.title,
            description:supplyDemand.description
          };
          supplyDemandList_data.push(supplyDemand_data);
        }
      }
    }
    callback(status_sd, supplyDemandList_data);
  })
};

module.exports = {
  findMyMemberServiceData:findMyMemberServiceData,
  findAdvertisementData  :findAdvertisementData,
  findServiceItemData    :findServiceItemData,
  findCommentData        :findCommentData,
  findMyMessageData      :findMyMessageData,
  findMerchantUnionData  :findMerchantUnionData,
  findSupplyDemandData   :findSupplyDemandData
};