var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var commonSchemaPlugin = require('./CommonSchemaPlugin');

/**
 * 业务规则表（各种促销、活动、服务规则定义表）
 * @type {Schema}
 */
var PromotionRuleSchema = new Schema({
  ruleName   :{type:String}, //规则名称
  description:{type:String}, //描述信息
  expression :{type:String}  //表述内容
});

PromotionRuleSchema.plugin(commonSchemaPlugin);

exports.PromotionRule = mongoose.model('PromotionRule', PromotionRuleSchema);