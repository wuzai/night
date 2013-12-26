var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var commonSchemaPlugin = require('./CommonSchemaPlugin');

/**
 * 消息记录表
 * @type {Schema}
 */
var MessageSchema = new Schema({
  owner    :{type:Schema.ObjectId, ref:'User'}, //消息撰写人用户Id
  merchant :{type:Schema.ObjectId, ref:'Merchant'}, //消息发送者所属商户Id
  store    :{type:Schema.ObjectId, ref:'Store'}, //消息相关联的门店Id
  iconImage:{type:String}, //消息图标
  title    :{type:String}, //信息标题
  content  :{type:String}, //信息内容
  isDraft  :{type:Boolean} //是否是草信息
});

MessageSchema.plugin(commonSchemaPlugin);

exports.Message = mongoose.model('Message', MessageSchema);