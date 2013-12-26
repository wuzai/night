var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var commonSchemaPlugin = require('./CommonSchemaPlugin');

/**
 * 角色信息表
 * @type {Schema}
 */
var RoleSchema = new Schema({
  roleName   :{type:String}, //角色名称
  description:{type:String}  //描述信息
});

RoleSchema.plugin(commonSchemaPlugin);

exports.Role = mongoose.model('Role', RoleSchema);