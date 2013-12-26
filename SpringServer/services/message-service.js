var config = require('../config');
var util = require('util');
var ObjectId = require('mongoose').Types.ObjectId;
var User = require('../model/User').User;
var Member = require('../model/Member').Member;
var Merchant = require('../model/Merchant').Merchant;
var ServiceItem = require('../model/ServiceItem').ServiceItem;
var Message = require('../model/Message').Message;
var MessageSendRecord = require('../model/MessageSendRecord').MessageSendRecord;

/**
 * 用户注册发送消息
 * @param userId
 * @param point
 * @param callback
 */
var userSignUp = function (userId, point, callback) {
  //发送消息通知
  var message = new Message({
    iconImage:config.systemParams.iconUri,
    title    :config.systemParams.register.title,
    content  :util.format(config.systemParams.register.content, point),
    isDraft  :false
  });
  message.save(function (err, newMessage) {
    if (err) return callback(404, {error:err});
    var messageSendRecord = new MessageSendRecord({
      message:newMessage,
      toUser :userId,
      hasRead:false
    });
    messageSendRecord.save();
    callback(200, {});
  });
};

/**
 * 用户每日首次登录赠送积分消息通知
 * @param userId
 * @param point
 * @param callback
 */
var userSignInOfFirst = function (userId, point, callback) {
  var message = new Message({
    iconImage:config.systemParams.iconUri,
    title    :config.systemParams.login.title,
    content  :util.format(config.systemParams.login.content, point),
    isDraft  :false
  });
  message.save(function (err, newMessage) {
    if (err) return callback(404, {error:err});
    var messageSendRecord = new MessageSendRecord({
      message:newMessage,
      toUser :userId,
      hasRead:false
    });
    messageSendRecord.save();
    callback(200, {});
  });
};

/**
 * 首次修改个人资料赠送积分消息通知
 * @param userId
 * @param point
 * @param callback
 */
var userUpdateInfoOfFirst = function (userId, point, callback) {
  //发送消息通知
  var message = new Message({
    iconImage:config.systemParams.iconUri,
    title    :config.systemParams.updateUser.title,
    content  :util.format(config.systemParams.updateUser.content, point),
    isDraft  :false
  });
  message.save(function (err, new_message) {
    if (err) return callback(404, {error:err});
    var messageSendRecord = new MessageSendRecord({
      message:new_message,
      toUser :userId,
      hasRead:false
    });
    messageSendRecord.save();
    callback(200, {});
  });
};

/**
 * 创建会员发送信息
 * @param userId
 * @param merchantId
 * @param point
 * @param callback
 */
var createMember = function (userId, merchantId, point, callback) {
  Merchant.findById(merchantId, '_id merchantName logoImage').populate('logoImage', 'imageUrl').exec(function (err, merchant) {
    if (err) return callback(404, {error:err});
    //发送消息通知
    var content = util.format('恭喜您成为%s的会员', merchant.merchantName);
    if (point > 0) {
      content = util.format('恭喜您成为%s的会员,商户赠送您%s个会员积分。', merchant.merchantName, point);
    }
    var message = new Message({
      merchant :merchant._id,
      iconImage:merchant.logoImage.imageUrl,
      title    :'注册会员',
      content  :content,
      isDraft  :false
    });
    message.save(function (err, newMessage) {
      if (err) return callback(404, {error:err});
      var messageSendRecord = new MessageSendRecord({
        message:newMessage,
        toUser :userId,
        hasRead:false
      });
      messageSendRecord.save(function () {
        callback(200, {});
      });
    });
  });
};
/**
 * 用户积分转赠（发送给转赠人的消息）
 * @param fromUserId 转赠人
 * @param toUserId 接收人
 * @param point 用户积分数
 * @param callback
 */
var userPointToUser_fromUser = function (fromUserId, toUserId, point, callback) {
  User.findById(fromUserId, 'userName', function (err, fromUser) {
    User.findById(toUserId, 'userName', function (err, toUser) {
      var content = util.format('您的%s用户转赠给用户%s【%s】个平台积分.您的用户积分支出【%s】贝客积分.', fromUser.userName, toUser.userName, point, point);
      var message_fromUser = new Message({
        iconImage:config.systemParams.iconUri,
        title    :'用户积分转赠',
        content  :[content, config.systemParams.msgInfo].join(''),
        isDraft  :false
      });
      message_fromUser.save(function (err, newMessage) {
        if (err) return callback(404, {error:err});
        var messageSendRecord = new MessageSendRecord({
          message:newMessage,
          toUser :fromUserId,
          hasRead:false
        });
        messageSendRecord.save(function () {
          callback(200, {});
        });
      });
    });
  });
}

/**
 * 用户积分转赠（发送给接收人的消息）
 * @param fromUserId 转赠人
 * @param toUserId 接收人
 * @param point 用户积分数
 * @param callback
 */
var userPointToUser_toUser = function (fromUserId, toUserId, point, callback) {
  User.findById(fromUserId, 'userName', function (err, fromUser) {
    User.findById(toUserId, 'userName', function (err, toUser) {
      var content = util.format('用户%s转赠给您%s用户【%s】个平台积分.您的用户积分收入【%s】贝客积分.', toUser.userName, fromUser.userName, point, point);
      var message_toUser = new Message({
        iconImage:config.systemParams.iconUri,
        title    :'用户积分转赠',
        content  :[content, config.systemParams.msgInfo].join(''),
        isDraft  :false
      });
      message_toUser.save(function (err, newMessage) {
        if (err) return callback(404, {error:err});
        var messageSendRecord = new MessageSendRecord({
          message:newMessage,
          toUser :toUserId,
          hasRead:false
        });
        messageSendRecord.save(function () {
          callback(200, {});
        });
      });
    });
  });
}

/**
 * 会员积分转赠（发送给转赠人的消息）
 * @param fromMemberId 转赠人
 * @param toMemberId 接收人
 * @param point 用户积分数
 * @param callback
 */
var memberPointToMember_fromMember = function (fromMemberId, toMemberId, point, callback) {
  Member.findById(fromMemberId, 'merchant user').populate('user', 'userName').exec(function (err, fromMember) {
    if (err) return callback(404, {error:err});
    if (fromMember && fromMember.user) {
      Member.findById(toMemberId, 'user').populate('user', 'userName').exec(function (err, toMember) {
        if (err) return callback(404, {error:err});
        if (toMember && toMember.user) {
          Merchant.findById(fromMember.merchant, '_id merchantName logoImage').populate('logoImage', 'imageUrl').exec(function (err, merchant) {
            if (err) return callback(404, {error:err});
            var content = util.format('您的%s用户在商户%s下的会员转赠给会员%s【%s】个会员积分.您的在该商户下的会员积分支出【%s】.', fromMember.user.userName, merchant.merchantName, toMember.user.userName, point, point);
            var message_fromUser = new Message({
              merchant :merchant._id,
              iconImage:merchant.logoImage ? merchant.logoImage.imageUrl : config.systemParams.iconUri,
              title    :'会员积分转赠',
              content  :[content, '【', merchant.merchantName, '】'].join(''),
              isDraft  :false
            });
            message_fromUser.save(function (err, newMessage) {
              if (err) return callback(404, {error:err});
              var messageSendRecord = new MessageSendRecord({
                message:newMessage,
                toUser :fromMember.user._id,
                hasRead:false
              });
              messageSendRecord.save(function () {
                callback(200, {});
              });
            });
          });
        } else {
          callback(404, {error:'未获取用户信息数据(1)'});
        }
      });
    } else {
      callback(404, {error:'未获取用户信息数据(-1)'});
    }
  });
}

/**
 * 会员积分转赠（发送给接收人的消息）
 * @param fromMemberId 转赠人
 * @param toMemberId 接收人
 * @param point 用户积分数
 * @param callback
 */
var memberPointToMember_toMember = function (fromMemberId, toMemberId, point, callback) {
  Member.findById(fromMemberId, 'merchant user').populate('user', 'userName').exec(function (err, fromMember) {
    if (err) return callback(404, {error:err});
    if (fromMember && fromMember.user) {
      Member.findById(toMemberId, 'user').populate('user', 'userName').exec(function (err, toMember) {
        if (err) return callback(404, {error:err});
        if (toMember && toMember.user) {
          Merchant.findById(fromMember.merchant, '_id merchantName logoImage').populate('logoImage', 'imageUrl').exec(function (err, merchant) {
            if (err) return callback(404, {error:err});
            var content = util.format('商户%s下的会员%s转赠给您在该商户下的会员%s【%s】个会员积分.您的在该商户下的会员积分收入【%s】.', merchant.merchantName, fromMember.user.userName, toMember.user.userName, point, point);
            var message_fromUser = new Message({
              merchant :merchant._id,
              iconImage:merchant.logoImage ? merchant.logoImage.imageUrl : config.systemParams.iconUri,
              title    :'会员积分转赠',
              content  :[content, '【', merchant.merchantName, '】'].join(''),
              isDraft  :false
            });
            message_fromUser.save(function (err, newMessage) {
              if (err) return callback(404, {error:err});
              var messageSendRecord = new MessageSendRecord({
                message:newMessage,
                toUser :toMember.user._id,
                hasRead:false
              });
              messageSendRecord.save(function () {
                callback(200, {});
              });
            });
          });
        } else {
          callback(404, {error:'未获取用户信息数据(1)'});
        }
      });
    } else {
      callback(404, {error:'未获取用户信息数据(-1)'});
    }
  });
}

/**
 * 会员积分兑换用户平台积分（会员积分减少发送消息）
 * @param merchantId 商户Id
 * @param userId 用户Id
 * @param member_point 会员积分数
 * @param user_point 用户积分数
 * @param callback
 */
var memberPointToUser_fromMember = function (merchantId, userId, member_point, user_point, callback) {
  Merchant.findById(merchantId, 'merchantName logoImage').populate('logoImage', 'imageUrl').exec(function (err, merchant) {
    if (err) return callback(404, {error:err});
    var content = util.format('您使用商户%s下的【%s】个会员积分兑换了【%s】个用户平台积分.您在该商户下的会员支出【%s】个会员积分.', merchant.merchantName, member_point, user_point, member_point);
    var message_fromMember = new Message({
      merchant :merchant._id,
      iconImage:merchant.logoImage ? merchant.logoImage.imageUrl : config.systemParams.iconUri,
      title    :'会员积分兑换',
      content  :[content, '【', merchant.merchantName, '】'].join(''),
      isDraft  :false
    });
    message_fromMember.save(function (err, newMessage) {
      if (err) return callback(404, {error:err});
      var messageSendRecord = new MessageSendRecord({
        message:newMessage,
        toUser :userId,
        hasRead:false
      });
      messageSendRecord.save(function () {
        callback(200, {});
      });
    });
  });
};

/**
 * 会员积分兑换用户平台积分（平台积分增加发送消息）
 * @param merchantId 商户Id
 * @param userId 用户Id
 * @param member_point 会员积分数
 * @param user_point 用户积分数
 * @param callback
 */
var memberPointToUser_toUser = function (merchantId, userId, member_point, user_point, callback) {
  Merchant.findById(merchantId, 'merchantName', function (err, merchant) {
    if (err) return callback(404, {error:err});
    var content = util.format('您使用商户%s下的【%s】个会员积分兑换了【%s】个用户平台积分.您的用户积分收入【%s】贝客积分.', merchant.merchantName, member_point, user_point, user_point);
    var message_toUser = new Message({
      iconImage:config.systemParams.iconUri,
      title    :'会员积分兑换',
      content  :[content, config.systemParams.msgInfo].join(''),
      isDraft  :false
    });
    message_toUser.save(function (err, newMessage) {
      if (err) return callback(404, {error:err});
      var messageSendRecord = new MessageSendRecord({
        message:newMessage,
        toUser :userId,
        hasRead:false
      });
      messageSendRecord.save(function () {
        callback(200, {});
      });
    });
  });
};

/**
 * 用户平台积分兑换会员积分（用户平台积分减少发送消息）
 * @param merchantId 商户Id
 * @param userId 用户Id
 * @param member_point 会员积分数
 * @param user_point 用户积分数
 * @param callback
 */
var userPointToMember_fromUser = function (merchantId, userId, member_point, user_point, callback) {
  Merchant.findById(merchantId, 'merchantName', function (err, merchant) {
    if (err) return callback(404, {error:err});
    var content = util.format('您使用【%s】个用户平台积分兑换了商户%s下的【%s】个会员积分.您的用户积分支出【%s】贝客积分.', user_point, merchant.merchantName, member_point, user_point);
    var message_fromUser = new Message({
      iconImage:config.systemParams.iconUri,
      title    :'用户平台积分兑换',
      content  :[content, config.systemParams.msgInfo].join(''),
      isDraft  :false
    });
    message_fromUser.save(function (err, newMessage) {
      if (err) return callback(404, {error:err});
      var messageSendRecord = new MessageSendRecord({
        message:newMessage,
        toUser :userId,
        hasRead:false
      });
      messageSendRecord.save(function () {
        callback(200, {});
      });
    });
  });
};

/**
 * 用户平台积分兑换会员积分（会员积分增加发送消息）
 * @param merchantId 商户Id
 * @param userId 用户Id
 * @param member_point 会员积分数
 * @param user_point 用户积分数
 * @param callback
 */
var userPointToMember_toMember = function (merchantId, userId, member_point, user_point, callback) {
  Merchant.findById(merchantId, 'merchantName logoImage').populate('logoImage', 'imageUrl').exec(function (err, merchant) {
    if (err) return callback(404, {error:err});
    var content = util.format('您使用【%s】个用户平台积分兑换了商户%s下的【%s】个会员积分.您的在该商户下的会员积分收入【%s】.', user_point, merchant.merchantName, member_point, member_point);
    var message_toMember = new Message({
      merchant :merchant._id,
      iconImage:merchant.logoImage ? merchant.logoImage.imageUrl : config.systemParams.iconUri,
      title    :'用户平台积分兑换',
      content  :[content, '【', merchant.merchantName, '】'].join(''),
      isDraft  :false
    });
    message_toMember.save(function (err, newMessage) {
      if (err) return callback(404, {error:err});
      var messageSendRecord = new MessageSendRecord({
        message:newMessage,
        toUser :userId,
        hasRead:false
      });
      messageSendRecord.save(function () {
        callback(200, {});
      });
    });
  });
};

/**
 * 创建会员服务通知
 * @param serviceItemId
 * @param memberId
 * @param callback
 */
var createMemberServiceOfServiceItem = function (serviceItemId, memberId, callback) {
  Member.findById(memberId, 'user merchant', function (err, member) {
    if (err) return callback(404, {error:err});
    if (member) {
      Merchant.findById(member.merchant, 'merchantName logoImage').populate('logoImage', 'imageUrl').exec(function (err, merchant) {
        if (err) return callback(404, {error:err});
        if (merchant) {
          ServiceItem.findById(serviceItemId, 'serviceItemName', function (err, serviceItem) {
            if (err) return callback(404, {error:err});
            if (serviceItem) {
              var message = new Message({
                merchant :merchant._id,
                iconImage:merchant.logoImage ? merchant.logoImage.imageUrl : config.systemParams.iconUri,
                title    :'申领服务通知',
                content  :util.format('您申领了%s商户的一项%s服务.【%s】', merchant.merchantName, serviceItem.serviceItemName, merchant.merchantName),
                isDraft  :false
              });
              message.save(function (err, newMessage) {
                if (err) return callback(404, {error:err});
                var messageSendRecord = new MessageSendRecord({
                  message:newMessage,
                  toUser :member.user,
                  hasRead:false
                });
                messageSendRecord.save();
                callback(200, {});
              });
            } else {
              callback(404, {error:'未获取该服务项目数据.'});
              return;
            }
          });
        } else {
          callback(404, {error:'未获取该商户数据.'});
          return;
        }
      });
    } else {
      callback(404, {error:'未获取该会员数据.'});
      return;
    }
  });
};

/**
 * 申领服务审核通知
 * @param serviceItemId 服务Id
 * @param memberId 会员Id
 * @param callback
 */
var applyMemberServiceAudit = function (serviceItemId, memberId, callback) {
  Member.findById(memberId, 'user merchant', function (err, member) {
    if (err) return callback(404, {error:err});
    if (member) {
      Merchant.findById(member.merchant, 'merchantName logoImage').populate('logoImage', 'imageUrl').exec(function (err, merchant) {
        if (err) return callback(404, {error:err});
        if (merchant) {
          ServiceItem.findById(serviceItemId, 'serviceItemName', function (err, serviceItem) {
            if (err) return callback(404, {error:err});
            if (serviceItem) {
              var message = new Message({
                merchant :merchant._id,
                iconImage:merchant.logoImage ? merchant.logoImage.imageUrl : config.systemParams.iconUri,
                title    :'申领审核通知',
                content  :util.format('您申领了%s商户的一项%s服务,正在等待商户审核.审核之后会尽快通知您的.【%s】', merchant.merchantName, serviceItem.serviceItemName, merchant.merchantName),
                isDraft  :false
              });
              message.save(function (err, newMessage) {
                if (err) return callback(404, {error:err});
                var messageSendRecord = new MessageSendRecord({
                  message:newMessage,
                  toUser :member.user,
                  hasRead:false
                });
                messageSendRecord.save();
                callback(200, {});
              });
            } else {
              callback(404, {error:'未获取该服务项目数据.'});
              return;
            }
          });
        } else {
          callback(404, {error:'未获取该商户数据.'});
          return;
        }
      });
    } else {
      callback(404, {error:'未获取该会员数据.'});
      return;
    }
  });
};

/**
 * 发送转赠请求消息
 * @param fromUserId 转赠发送者Id
 * @param toUserId 转赠接受者Id
 * @param merchantId 转赠关联的商户Id
 * @param serviceItemId 转赠关联的服务Id
 * @param storeId 转赠关联的门店Id
 * @param callback
 */
var sendLargessOfMemberService = function (fromUserId, toUserId, merchantId, serviceItemId, storeId, callback) {
  var image = config.systemParams.iconUri;
  User.findById(fromUserId, 'userName', function (err, fromUser) {
    if (err) return callback(404, {error:err});
    if (fromUser) {
      Merchant.findById(merchantId, 'merchantName logoImage').populate('logoImage', 'imageUrl').exec(function (err, merchant) {
        if (err) return callback(404, {error:err});
        if (merchant) {
          ServiceItem.findById(serviceItemId, 'serviceItemName', function (err, serviceItem) {
            if (err) return callback(404, {error:err});
            if (serviceItem) {
              if (merchant.logoImage && merchant.logoImage.imageUrl) {
                image = merchant.logoImage.imageUrl;
              }
              //发送消息通知
              var message = new Message({
                iconImage:image,
                title    :'转赠请求通知',
                content  :util.format('尊敬的用户您好！%s用户转赠给您一项%s商户的%s服务，请注意查收。【%s】', fromUser.userName, merchant.merchantName, serviceItem.serviceItemName, merchant.merchantName),
                merchant :merchant._id,
                store    :storeId,
                isDraft  :false
              });
              message.save(function (err, new_message) {
                if (err) return callback(404, {error:err});
                var messageSendRecord = new MessageSendRecord({
                  message:new_message,
                  toUser :toUserId,
                  hasRead:false
                });
                messageSendRecord.save();
                callback(200, {});
              });
            } else {
              callback(404, {error:'未获取该服务项目数据.'});
              return;
            }
          });
        } else {
          callback(404, {error:'未获取该商户数据.'});
          return;
        }
      });
    } else {
      callback(404, {error:'未获取该用户数据.'});
      return;
    }
  });
};

/**
 * 取消转赠请求
 /**
 * 发送转赠请求消息
 * @param fromUserId 转赠发送者Id
 * @param toUserId 转赠接受者Id
 * @param merchantId 转赠关联的商户Id
 * @param serviceItemId 转赠关联的服务Id
 * @param storeId 转赠关联的门店Id
 * @param callback
 */
var cancelLargessOfMemberService = function (fromUserId, toUserId, merchantId, serviceItemId, storeId, callback) {
  callback(200, {});
};

/**
 * 拒绝转赠请求
 * @param fromUserId 转赠发送者Id
 * @param toUserId 转赠接受者Id
 * @param merchantId 转赠关联的商户Id
 * @param serviceItemId 转赠关联的服务Id
 * @param storeId 转赠关联的门店Id
 * @param callback
 */
var refuseLargessOfMemberService = function (fromUserId, toUserId, merchantId, serviceItemId, storeId, callback) {
  var image = config.systemParams.iconUri;
  User.findById(toUserId, 'userName', function (err, toUser) {
    if (err) return callback(404, {error:err});
    if (toUser) {
      Merchant.findById(merchantId, 'merchantName logoImage').populate('logoImage', 'imageUrl').exec(function (err, merchant) {
        if (err) return callback(404, {error:err});
        if (merchant) {
          ServiceItem.findById(serviceItemId, 'serviceItemName', function (err, serviceItem) {
            if (err) return callback(404, {error:err});
            if (serviceItem) {
              if (merchant.logoImage && merchant.logoImage.imageUrl) {
                image = merchant.logoImage.imageUrl;
              }
              //发送消息通知
              var message = new Message({
                iconImage:image,
                title    :'拒绝转赠服务通知',
                content  :util.format('尊敬的用户您好！您转赠给%s用户的一项%s商户的%s服务，已被对方拒绝。【%s】', toUser.userName, merchant.merchantName, serviceItem.serviceItemName, merchant.merchantName),
                merchant :merchant._id,
                store    :storeId,
                isDraft  :false
              });
              message.save(function (err, new_message) {
                if (err) return callback(404, {error:err});
                var messageSendRecord = new MessageSendRecord({
                  message:new_message,
                  toUser :fromUserId,
                  hasRead:false
                });
                messageSendRecord.save();
                callback(200, {});
              });
            } else {
              callback(404, {error:'未获取该服务项目数据.'});
              return;
            }
          });
        } else {
          callback(404, {error:'未获取该商户数据.'});
          return;
        }
      });
    } else {
      callback(404, {error:'未获取该用户数据.'});
      return;
    }
  });
};

/**
 * 接受转赠请求
 * @param fromUserId 转赠发送者Id
 * @param toUserId 转赠接受者Id
 * @param merchantId 转赠关联的商户Id
 * @param serviceItemId 转赠关联的服务Id
 * @param storeId 转赠关联的门店Id
 * @param callback
 */
var acceptLargessOfMemberService = function (fromUserId, toUserId, merchantId, serviceItemId, storeId, callback) {
  var image = config.systemParams.iconUri;
  User.findById(toUserId, 'userName', function (err, toUser) {
    if (err) return callback(404, {error:err});
    if (toUser) {
      Merchant.findById(merchantId, 'merchantName logoImage').populate('logoImage', 'imageUrl').exec(function (err, merchant) {
        if (err) return callback(404, {error:err});
        if (merchant) {
          ServiceItem.findById(serviceItemId, 'serviceItemName', function (err, serviceItem) {
            if (err) return callback(404, {error:err});
            if (serviceItem) {
              if (merchant.logoImage && merchant.logoImage.imageUrl) {
                image = merchant.logoImage.imageUrl;
              }
              //发送消息通知
              var message = new Message({
                iconImage:image,
                title    :'接受转赠服务通知',
                content  :util.format('尊敬的用户您好！您转赠给%s用户的一项%s商户的%s服务，已被对方接受。【%s】', toUser.userName, merchant.merchantName, serviceItem.serviceItemName, merchant.merchantName),
                merchant :merchant._id,
                store    :storeId,
                isDraft  :false
              });
              message.save(function (err, new_message) {
                if (err) return callback(404, {error:err});
                var messageSendRecord = new MessageSendRecord({
                  message:new_message,
                  toUser :fromUserId,
                  hasRead:false
                });
                messageSendRecord.save();
                callback(200, {});
              });
            } else {
              callback(404, {error:'未获取该服务项目数据.'});
              return;
            }
          });
        } else {
          callback(404, {error:'未获取该商户数据.'});
          return;
        }
      });
    } else {
      callback(404, {error:'未获取该用户数据.'});
      return;
    }
  });
};

var sendCaptchaOfMemberPointUsed = function (toUserId, merchantId, point, captcha, callback) {
  var image = config.systemParams.iconUri;
  Merchant.findById(merchantId, 'merchantName logoImage').populate('logoImage', 'imageUrl').exec(function (err, merchant) {
    if (err) return callback(404, {error:err});
    if (merchant) {
      if (merchant.logoImage && merchant.logoImage.imageUrl) {
        image = merchant.logoImage.imageUrl;
      }
      //发送消息通知
      var message = new Message({
        iconImage:image,
        title    :'会员积分使用请求',
        content  :util.format('尊敬的用户您好！您在%s商户将使用%s会员积分。验证码是:%s', merchant.merchantName, point, captcha),
        merchant :merchant._id,
        isDraft  :false
      });
      message.save(function (err, new_message) {
        if (err) return callback(404, {error:err});
        var messageSendRecord = new MessageSendRecord({
          message:new_message,
          toUser :toUserId,
          hasRead:false
        });
        messageSendRecord.save();
        callback(200, {});
      });
    } else {
      callback(404, {error:'未获取该商户数据.'});
      return;
    }
  });
}

var memberPointUsed = function (toUserId, merchantId, point, callback) {
  var image = config.systemParams.iconUri;
  Merchant.findById(merchantId, 'merchantName logoImage').populate('logoImage', 'imageUrl').exec(function (err, merchant) {
    if (err) return callback(404, {error:err});
    if (merchant) {
      if (merchant.logoImage && merchant.logoImage.imageUrl) {
        image = merchant.logoImage.imageUrl;
      }
      //发送消息通知
      var message = new Message({
        iconImage:image,
        title    :'会员积分使用通知',
        content  :util.format('尊敬的用户您好！您在%s商户已成功使用%s会员积分。【%s】', merchant.merchantName, point, merchant.merchantName),
        merchant :merchant._id,
        isDraft  :false
      });
      message.save(function (err, new_message) {
        if (err) return callback(404, {error:err});
        var messageSendRecord = new MessageSendRecord({
          message:new_message,
          toUser :toUserId,
          hasRead:false
        });
        messageSendRecord.save();
        callback(200, {});
      });
    } else {
      callback(404, {error:'未获取该商户数据.'});
      return;
    }
  });
}

module.exports = {
  userSignUp                      :userSignUp,
  userSignInOfFirst               :userSignInOfFirst,
  userUpdateInfoOfFirst           :userUpdateInfoOfFirst,
  createMember                    :createMember,
  memberPointUsed                 :memberPointUsed,
  userPointToUser_fromUser        :userPointToUser_fromUser,
  userPointToUser_toUser          :userPointToUser_toUser,
  memberPointToMember_fromMember  :memberPointToMember_fromMember,
  memberPointToMember_toMember    :memberPointToMember_toMember,
  userPointToMember_fromUser      :userPointToMember_fromUser,
  userPointToMember_toMember      :userPointToMember_toMember,
  memberPointToUser_fromMember    :memberPointToUser_fromMember,
  memberPointToUser_toUser        :memberPointToUser_toUser,
  createMemberServiceOfServiceItem:createMemberServiceOfServiceItem,
  applyMemberServiceAudit         :applyMemberServiceAudit,
  sendLargessOfMemberService      :sendLargessOfMemberService,
  cancelLargessOfMemberService    :cancelLargessOfMemberService,
  refuseLargessOfMemberService    :refuseLargessOfMemberService,
  sendCaptchaOfMemberPointUsed    :sendCaptchaOfMemberPointUsed,
  acceptLargessOfMemberService    :acceptLargessOfMemberService
};