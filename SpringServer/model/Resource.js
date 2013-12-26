var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var commonSchemaPlugin = require('./CommonSchemaPlugin');

/**
 * 资源定义表
 * @type {Schema}
 */
var ResourceSchema = new Schema({
  resourceName:{type:String}, //资源名称
  description :{type:String}, //描述信息
  resourceType:{type:Schema.ObjectId, ref:'ResourceType'}, //资源类型Id
  pattern     :{type:String}  //资源路径及标识表达式
});

ResourceSchema.plugin(commonSchemaPlugin);

exports.Resource = mongoose.model('Resource', ResourceSchema);