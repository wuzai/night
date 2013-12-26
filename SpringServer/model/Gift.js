var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var commonSchemaPlugin = require('./CommonSchemaPlugin');
var swiss = require('../utils/swiss-kit');

/**
 * 赠品及兑换礼品活动表
 * @type {Schema}
 */
var GiftSchema = new Schema({
  giftName     :{type:String}, //赠品活动名称
  description  :{type:String}, //描述信息
  content      :{type:String}, //赠品活动内容
  promptIntro  :{type:String}, //温馨提示
  rule         :{type:Schema.ObjectId, ref:'PromotionRule'}, //规则Id
  validFromDate:{type:Date, default:Date.now, get:swiss.getNormalDate}, //有效开始日期
  validToDate  :{type:Date, default:Date.now, get:swiss.getNormalDate}, //有效结束日期
  forbidden    :{type:Boolean, default:false}  //是否被禁用
});

GiftSchema.plugin(commonSchemaPlugin);

exports.Gift = mongoose.model('Gift', GiftSchema);
