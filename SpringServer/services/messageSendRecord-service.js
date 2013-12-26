var MessageSendRecord = require('../model/MessageSendRecord').MessageSendRecord;

var findMessageSendRecordOfLimitByUserIdAndMerchantId = function (userId, limit, callback) {
  MessageSendRecord.find({toUser:userId, state:'0000-0000-0000'}).sort({createdAt:-1}).limit(limit).populate('message', 'title content iconImage store merchant').exec(function (err, messageSendRecordList) {
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
          sentTime      :messageSendRecord.createdAt
        }
        messageSendRecords.push(messageRecord_data);
      }
    });
    callback(200,{messageSendRecords:messageSendRecords});
  });
};

module.exports = {
  findMessageSendRecordOfLimitByUserIdAndMerchantId:findMessageSendRecordOfLimitByUserIdAndMerchantId
};