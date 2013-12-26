var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var commonSchemaPlugin = require('./CommonSchemaPlugin');

/**
 * 会员基本信息表
 * @type {Schema}
 */
var MemberSchema = new Schema({
  memberCode:{type:String}, //会员昵称
  memberRank:{type:Schema.ObjectId, ref:'MemberRank'}, //会员等级Id
  merchant  :{type:Schema.ObjectId, ref:'Merchant'}, //商户ID
  user      :{type:Schema.ObjectId, ref:'User'}, //用户ID
  amount    :{type:String}  //用户余额
});

MemberSchema.plugin(commonSchemaPlugin);

exports.Member = mongoose.model('Member', MemberSchema);

