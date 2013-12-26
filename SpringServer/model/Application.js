var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var commonSchemaPlugin = require('./CommonSchemaPlugin');

/**
 * 应用系统注册表
 * @type {Schema}
 */
var ApplicationSchema = new Schema({
  applicationName:{type:String, required:true}, //应用系统名称
  description    :{type:String} //描述信息
});

ApplicationSchema.plugin(commonSchemaPlugin);

exports.Application = mongoose.model('Application', ApplicationSchema);
