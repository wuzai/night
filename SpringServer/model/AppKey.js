var mongoose = require('mongoose');
var swiss = require('../utils/swiss-kit');
var Schema = mongoose.Schema;
var commonSchemaPlugin = require('./CommonSchemaPlugin');

/**
 * AppKey表
 * @type {Schema}
 */
var AppKeySchema = new Schema({
  phone     :{ type:String, trim:true, required:true}, //电话
  key       :{ type:String, trim:true, required:true}, //密钥
  expireDate:{ type:Date, default:Date.parse('2099-12-31'), get:swiss.getNormalDate }, //终止日期
  keyType   :{ type:String, trim:true, default:'free', enum:['free', '10K', '100K', 'enterprise', 'developer']}//密钥类型
});
AppKeySchema.index({ phone:1, key:1 }, { unique:true });

AppKeySchema.plugin(commonSchemaPlugin);

exports.AppKey = mongoose.model('AppKey', AppKeySchema);
