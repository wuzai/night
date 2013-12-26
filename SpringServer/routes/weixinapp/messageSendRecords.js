var config = require('../../config');
var webRoot_weixinapp = config.webRoot_weixinapp;
var swiss = require('../../utils/swiss-kit');
var Message = require('../../model/Message.js').Message;
var User = require('../../model/User.js').User;
var MessageSendRecord = require('../../model/MessageSendRecord').MessageSendRecord;
var userWXService = require('./userWXService');

//获取会员的信息记录列表
var messageSendRecordList = function (req, res, next) {
  var query = req.query;
  var merchantId = query.merchantId;
  var FromUserName = query.FromUserName;
  var userId = query.userId;
  userWXService.getUserIdByFromUserName(merchantId, FromUserName, userId, function (status, result) {
    if (status === 200) {
      var userId = result.userId;
      User.findById(userId, function (err, user) {
        if (err) return next(err);
        if (user) {
          var con_query = {
            toUser:userId,
            state :'0000-0000-0000'
          };
          var fields = '_id hasRead toUser message createdAt';
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
                  fromStoreId   :messageSendRecord.message.store,
                  fromMerchantId:messageSendRecord.message.merchant,
                  sentTime      :messageSendRecord.createdAt,
                  sentSimpleDate:swiss.getSimpleDate(messageSendRecord.createdAt)
                }
                messageSendRecords.push(messageRecord_data);
              }
            });
            res.render('weixinapp/messageSendRecordList', {merchantId:merchantId, FromUserName:FromUserName, userId:userId, messageSendRecords:messageSendRecords});
          });
        } else {
          req.session.messages = {error:['未获取到相关用户数据']};
          res.redirect([webRoot_weixinapp, '/error?merchantId=', merchantId, '&FromUserName=', FromUserName].join(''));
        }
      });
    } else {
      req.session.messages = {error:[result.error]};
      res.redirect(result.errorUrl);
    }
  });
};

var deleteAllMessageSendRecords = function (req, res, next) {
  var query = req.query;
  var userId = query.userId;
  MessageSendRecord.update({toUser:userId}, {state:'1111-1111-1111'}, { multi:true }, function (err, number) {
    res.redirect([webRoot_weixinapp, '/openMyMessageSendRecordList'].join(''));
  });
};

var deleteMessageSendRecords = function (req, res, next) {
  var query = req.query;
  var messageSendRecordId = query.messageSendRecordId;
  MessageSendRecord.update({_id:messageSendRecordId}, {state:'1111-1111-1111'}, { multi:true }, function (err, number) {
    res.redirect([webRoot_weixinapp, '/openMyMessageSendRecordList'].join(''));
  });
};

module.exports = {
  messageSendRecordList      :messageSendRecordList,
  deleteAllMessageSendRecords:deleteAllMessageSendRecords,
  deleteMessageSendRecords   :deleteMessageSendRecords
};