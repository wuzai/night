var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var commonSchemaPlugin = require('./CommonSchemaPlugin');

/**
 * 消息发送记录表
 * @type {Schema}
 */
var MessageSendRecordSchema = new Schema({
  message   :{type:Schema.ObjectId, ref:'Message'}, //消息Id
  toUser    :{type:Schema.ObjectId, ref:'User'},    //收件人用户Id
  toMerchant:{type:Schema.ObjectId, ref:'Merchant'}, //收件商户Id
  hasRead   :{type:Boolean} //是否已读
});

MessageSendRecordSchema.plugin(commonSchemaPlugin);

exports.MessageSendRecord = mongoose.model('MessageSendRecord', MessageSendRecordSchema);