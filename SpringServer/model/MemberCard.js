var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var commonSchemaPlugin = require('./CommonSchemaPlugin');
var swiss = require('../utils/swiss-kit');

/**
 * 会员卡基本信息（CardType、CardNumber、Status、Point、Amount、RemainC）
 * @type {Schema}
 */
var MemberCardSchema = new Schema({
  memberCardName:{type:String}, //会员卡名称
  description   :{type:String}, //会员卡描述信息
  promptIntro   :{type:String}, //温馨提示
  iconImage     :{type:String}, //会员卡图标
  serviceItem   :{type:Schema.ObjectId, ref:'ServiceItem'}, //服务项目ID
  merchant      :{type:Schema.ObjectId, ref:'Merchant'}, //商户ID
  member        :{type:Schema.ObjectId, ref:'Member'}, //持有人会员Id
  user          :{type:Schema.ObjectId, ref:'User'}, //持有人用户Id
  pointApply    :{type:String, default:0}, //会员卡申领需要扣除会员积分
  pointUsed     :{type:String, default:0}, //会员卡使用需要扣除会员积分
  validFromDate :{type:Date, get:swiss.getNormalDate}, //有效开始日期
  validToDate   :{type:Date, get:swiss.getNormalDate}, //有效结束日期
  forbidden     :{type:Boolean, default:false}  //是否被禁用（true是禁用,用于转赠之后的状态标志）
});

MemberCardSchema.plugin(commonSchemaPlugin);

exports.MemberCard = mongoose.model('MemberCard', MemberCardSchema);

