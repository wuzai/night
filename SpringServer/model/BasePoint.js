var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var commonSchemaPlugin = require('./CommonSchemaPlugin');

/**
 * 积分基本类
 * @type {Schema}
 */
var BasePointSchema = new Schema({
  availablePoint    :{type:Number}, //目前可用积分
  unenforceablePoint:{type:Number}, //未生效的积分
  incomeSumPoint    :{type:Number}, //累积新增积分
  outgoSumPoint     :{type:Number}  //累积支出积分
}, {collection:'points', discriminatorKey:'_type'});

exports.BasePointSchema = BasePointSchema.plugin(commonSchemaPlugin);
exports.BasePoint = mongoose.model('BasePoint', BasePointSchema);