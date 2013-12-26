var config = require('../../config');
var webRoot = config.webRoot_wehere;
var Message = require('../../model/Message').Message;
var MessageSendRecord = require('../../model/MessageSendRecord').MessageSendRecord;
var ImageStore = require('../../model/ImageStore').ImageStore;
var SellRecord = require('../../model/SellRecord').SellRecord;
var Member = require('../../model/Member').Member;
var Merchant = require('../../model/Merchant').Merchant;
var ObjectId = require('mongoose').Types.ObjectId;
var util = require('util');
var memberServer = require('../../services/member-service');
var merchantServer = require('../../services/merchant-service');

var openMessageSendPage = function (req, res) {
  var merchant_session = req.session.merchant;
  var merchantId = merchant_session._id;
  memberServer.findMemberListByMerchantId(merchantId, function (status, result) {
    res.render('wehere/messageSendPage', {merchantId:merchantId, members:result.members});
  })
};

var messageSendSave = function (req, res) {
  var body = req.body;
  var memberList_data = body.members;
  if (memberList_data && memberList_data.length > 0) {
    merchantServer.getMerchantById(body.merchantId, function (status, result) {
      if (status === 200 && result.merchant) {
        var merchant = result.merchant;
        var message = new Message({
          owner    :merchant.creator,
          merchant :body.merchantId,
          iconImage:merchant.logoImage ? merchant.logoImage.imageUrl : null,
          title    :body.title,
          content  :body.content,
          isDraft  :false
        });
        message.save(function (err, new_message) {
          if (err) {
            req.session.messages = {error:['信息发送失败,可能数据连接失败.']};
            res.redirect([webRoot , '/message/messageSend'].join(''));
          } else {
            var memberList = [];
            var flag = typeof(memberList_data);
            if (flag === 'string') {
              memberList.push(memberList_data);
            } else {
              memberList = memberList.concat(memberList_data);
            }
            memberList.forEach(function (memberId) {
              var messageSendRecord = new MessageSendRecord({
                message:new_message,
                toUser :memberId,
                hasRead:false
              });
              messageSendRecord.save();
            });
            req.session.messages = {notice:['信息已经发送.']};
            res.redirect([webRoot , '/message/messageSend'].join(''));
          }
        });
      } else {
        req.session.messages = {error:['信息发送失败,未找到商户相关数据.']};
        res.redirect([webRoot , '/message/messageSend'].join(''));
      }
    });
  } else {
    req.session.messages = {error:['未选择收件人.']};
    res.redirect([webRoot , '/message/messageSend'].join(''));
  }
};

/**
 * 会员充值成功发送信息
 * @param userId
 * @param point
 * @param callback
 * @since 1.0t
 */
var memberChargePoint = function (memberId, point, callback) {
  Member.findById(memberId, function (err, member) {
    if (err) return callback(404, {error:err});
    if (member) {
      Merchant.findById(member.merchant, 'merchantName logoImage').populate('logoImage').exec(function (err, merchant) {
        if (err) return callback(404, {error:err});
        var icon = config.systemParams.iconUri;
        if (merchant) {
          icon = merchant.logoImage ? merchant.logoImage.imageUrl : icon;
        }
        //发送消息通知
        var message = new Message({
          iconImage:icon,
          title    :'会员充值服务',
          content  :util.format('尊敬的用户您好！您在%s商户的会员已经成功充值%s积分，请注意查收。【%s】', merchant.merchantName, point, merchant.merchantName),
          isDraft  :false
        });
        message.save(function (err, newMessage) {
          if (err) return callback(404, {error:err});
          var messageSendRecord = new MessageSendRecord({
            message:newMessage,
            toUser :member.user,
            hasRead:false
          });
          messageSendRecord.save(function () {
            callback(200, {});
          });
        });
      });
    } else {
      if (err) return callback(404, {error:'会员信息未找到,信息发送失败.'});
    }
  });
};

/**
 * 申领服务审核通过后发送消息
 * @param sellRecordId 销售记录Id
 * @since 1.1
 */
var serviceItemAuditPass = function (sellRecordId, callback) {
  SellRecord.findById(sellRecordId).populate('member').populate('merchant', 'merchantName').populate('serviceItem', 'serviceItemName').exec(function (err, sellRecord) {
    if (err) return callback(404, {error:err});
    var icon = config.systemParams.iconUri;
    var sendMessage = function (iconImage) {
      //发送消息通知
      var message = new Message({
        iconImage:iconImage,
        title    :'申领服务审核通过通知',
        merchant :sellRecord.merchant,
        isDraft  :false
      });
      if (sellRecord.sum && sellRecord.sum == 0) {
        message.content = util.format('尊敬的用户您好！您在%s申领的一项%s服务，商家已经通过审核，您已支出%s个会员积分，请注意查收。', sellRecord.merchant.merchantName, sellRecord.serviceItem.serviceItemName, sellRecord.sum);
      } else {
        message.content = util.format('尊敬的用户您好！您在%s申领的一项%s服务，商家已经通过审核，请注意查收。', sellRecord.merchant.merchantName, sellRecord.serviceItem.serviceItemName);
      }
      message.save(function (err, new_message) {
        if (err) return callback(404, {error:err});
        var messageSendRecord = new MessageSendRecord({
          message:new_message,
          toUser :sellRecord.member.user,
          hasRead:false
        });
        messageSendRecord.save(function () {
          callback(200);
        });
      });
    };
    var merchantId = sellRecord.merchant ? sellRecord.merchant._id : null;
    Merchant.findById(merchantId, 'logoImage').populate('logoImage').exec(function (err, merchant) {
      if (merchant) {
        icon = merchant.logoImage ? merchant.logoImage.imageUrl : icon;
      }
      sendMessage(icon);
    });
  })
};

/**
 * 申领服务审核不通过后发送消息
 * @param sellRecordId 销售记录Id
 */
var serviceItemAuditNoPass = function(sellRecordId, callback){
  SellRecord.findById(sellRecordId).populate('member').populate('merchant', 'merchantName').populate('serviceItem', 'serviceItemName').exec(function (err, sellRecord) {
    if (err) return callback(404, {error:err});
    var icon = config.systemParams.iconUri;
    var sendMessage = function (iconImage) {
      //发送消息通知
      var message = new Message({
        iconImage:iconImage,
        title    :'申领服务审核未通过通知',
        merchant :sellRecord.merchant,
        isDraft  :false
      });
      var text = util.format('尊敬的用户您好！您在%s申领的一项%s服务，未审核通过。', sellRecord.merchant.merchantName, sellRecord.serviceItem.serviceItemName);
      if(sellRecord.noPassTxt){
        text += ('未通过理由：' + sellRecord.noPassTxt);
      }
      message.content = text;
      message.save(function (err, new_message) {
        if (err) return callback(404, {error:err});
        var messageSendRecord = new MessageSendRecord({
          message:new_message,
          toUser :sellRecord.member.user,
          hasRead:false
        });
        messageSendRecord.save(function () {
          callback(200);
        });
      });
    };
    var merchantId = sellRecord.merchant ? sellRecord.merchant._id : null;
    Merchant.findById(merchantId, 'logoImage').populate('logoImage').exec(function (err, merchant) {
      if (merchant) {
        icon = merchant.logoImage ? merchant.logoImage.imageUrl : icon;
      }
      sendMessage(icon);
    });
  })
};

//服务使用确认并扣除积分
var serviceItemUsedConfirm = function (memberId, point, callback) {
  Member.findById(memberId, function (err, member) {
    //发送消息通知用户
    var message = new Message({
      iconImage:config.systemParams.iconUri,
      title    :'【贝客汇系统信息】使用服务扣除积分',
      content  :util.format('尊敬的用户您好！您使用商户服务，支出%s会员积分。', point),
      isDraft  :false
    });
    if (point == 0) {
      message.content = '尊敬的用户您好！您使用了商户一项免费服务！';
    }
    message.save(function (err, new_message) {
      if (err) return callback(404, {error:err});
      var messageSendRecord = new MessageSendRecord({
        message:new_message,
        toUser :member.user,
        hasRead:false
      });
      messageSendRecord.save(function () {
        callback(200, {});
      });
    });
  });
};

/**
 * 商户端服务使用发送验证码
 * @param captcha 验证码
 * @param userId 用户Id
 * @param merchantId 商户Id
 * @param callback
 */
var sendCaptchaOfUsedByMerchant = function (captcha, userId, merchantId, callback) {
  Merchant.findById(merchantId, 'merchantName logoImage').populate('logoImage', 'imageUrl').exec(function (err, merchant) {
    if (err) return callback(404, {error:err});
    //发送消息通知
    var message = new Message({
      iconImage:merchant.logoImage ? merchant.logoImage.imageUrl : '',
      title    :'会员服务使用',
      content  :util.format('尊敬的用户您好！您在%s商户使用服务的验证码是：%s', merchant.merchantName, captcha),
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

//获取商户的信息
var openMessagesOfMerchant = function (req, res, next) {
  var merchant_session = req.session.merchant;
  var merchantId = merchant_session._id;
  var con_query = {
    toMerchant:merchantId,
    state     :'0000-0000-0000'
  };
  var fields = '_id hasRead toMerchant message createdAt';
  MessageSendRecord.find(con_query, fields).sort({createdAt:-1}).populate('message', 'title content iconImage store merchant').exec(function (err, messageSendRecordList) {
    if (err) return next(err);
    var messageSendRecords = [];
    messageSendRecordList.forEach(function (messageSendRecord) {
      if (messageSendRecord && messageSendRecord.message) {
        var messageRecord_data = {
          _id           :messageSendRecord._id,
          title         :messageSendRecord.message.title,
          content       :messageSendRecord.message.content,
          iconImage     :messageSendRecord.message.iconImage,
          toUserId      :messageSendRecord.toUser,
          toMerchant    :messageSendRecord.toMerchant,
          fromStoreId   :messageSendRecord.message.store,
          fromMerchantId:messageSendRecord.message.merchant,
          sentTime      :messageSendRecord.createdAt
        }
        messageSendRecords.push(messageRecord_data);
      }
    });
    res.render('wehere/messageListOfMerchant', {merchantId:merchantId, messageSendRecords:messageSendRecords});
  });
}

module.exports = {
  openMessageSendPage        :openMessageSendPage,
  messageSendSave            :messageSendSave,
  openMessagesOfMerchant     :openMessagesOfMerchant,
  serviceItemUsedConfirm     :serviceItemUsedConfirm,
  memberChargePoint          :memberChargePoint,
  serviceItemAuditPass       :serviceItemAuditPass,
  serviceItemAuditNoPass       :serviceItemAuditNoPass,
  sendCaptchaOfUsedByMerchant:sendCaptchaOfUsedByMerchant
};