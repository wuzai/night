var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var commonSchemaPlugin = require('./CommonSchemaPlugin');

/**
 * 资源类型表（URI Pattern、页面元素ID（含菜单）、记录集、记录字段）
 * @type {Schema}
 */
var ResourceTypeSchema = new Schema({
  resourceTypeName:{type:String}, //资源类型名称
  description     :{type:String}  //资源类型描述
});

ResourceTypeSchema.plugin(commonSchemaPlugin);

exports.ResourceType = mongoose.model('ResourceType', ResourceTypeSchema);