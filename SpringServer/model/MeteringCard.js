var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var swiss = require('../utils/swiss-kit');
var commonSchemaPlugin = require('./CommonSchemaPlugin');

/**
 * 计次卡
 * @type {Schema}
 */
var MeteringCardSchema = new Schema({
  meteringCardName:{type:String}, //计次卡名称
  description     :{type:String}, //卡描述信息
  promptIntro     :{type:String}, //温馨提示
  iconImage       :{type:String}, //计次卡图标
  serviceItem     :{type:Schema.ObjectId, ref:'ServiceItem'}, //服务项目ID
  merchant        :{type:Schema.ObjectId, ref:'Merchant'}, //商户ID
  member          :{type:Schema.ObjectId, ref:'Member'}, //会员Id
  user            :{type:Schema.ObjectId, ref:'User'}, //持有人用户Id
  remainCount     :{type:Number, default:0}, //剩余次数(-1:剩余无数次；>0:剩余次数)
  pointApply      :{type:String, default:0}, //计次卡申领需要扣除会员积分
  pointUsed       :{type:String, default:0}, //计次卡使用需要扣除会员积分
  validFromDate   :{type:Date, get:swiss.getNormalDate}, //有效开始日期
  validToDate     :{type:Date, get:swiss.getNormalDate}, //有效结束日期
  forbidden       :{type:Boolean, default:false}  //是否被禁用（true是禁用,用于转赠之后的状态标志）
});

MeteringCardSchema.plugin(commonSchemaPlugin);

exports.MeteringCard = mongoose.model('MeteringCard', MeteringCardSchema);

