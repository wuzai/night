var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var commonSchemaPlugin = require('./CommonSchemaPlugin');

/**
 * 角色与许可的映射表
 * @type {Schema}
 */
var PermissionInRoleSchema = new Schema({
  permission:{type:Schema.ObjectId, required:true, ref:'Permission'}, // 资源操作许可Id
  role      :{type:Schema.ObjectId, required:true, ref:'Role'} //角色Id
});
PermissionInRoleSchema.index({ permission:1, role:1 }, { unique:true });

PermissionInRoleSchema.plugin(commonSchemaPlugin);

exports.PermissionInRole = mongoose.model('PermissionInRole', PermissionInRoleSchema);
