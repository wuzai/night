var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var commonSchemaPlugin = require('./CommonSchemaPlugin');

/**
 * 推荐商户记录表
 * @type {Schema}
 */
var InviteMerchantRecordSchema = new Schema({
  inviter     :{type:Schema.ObjectId, ref:'User'}, //发送用户Id
  merchantName:{type:String}, //商户名称
  merchantTel :{type:String}, //商户电话
  merchant    :{type:Schema.ObjectId, ref:'Merchant'}, //如果成功，商户记录Id
  inviteStatus:{type:String, enum:['待确认', '已确认', '已取消', '已拒绝'], default:'待确认'}  //邀请状态
});

InviteMerchantRecordSchema.plugin(commonSchemaPlugin);

exports.InviteMerchantRecord = mongoose.model('InviteMerchantRecord', InviteMerchantRecordSchema);
