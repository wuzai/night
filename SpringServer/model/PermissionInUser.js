var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var commonSchemaPlugin = require('./CommonSchemaPlugin');

/**
 * 用户与许可的映射表
 * @type {Schema}
 */
var PermissionInUserSchema = new Schema({
  permission:{type:Schema.ObjectId, required:true, ref:'Permission'}, // 资源操作许可Id
  user      :{type:Schema.ObjectId, required:true, ref:'User'} //用户Id
});
PermissionInUserSchema.index({ permission:1, user:1 }, { unique:true });

PermissionInUserSchema.plugin(commonSchemaPlugin);

exports.PermissionInUser = mongoose.model('PermissionInUser', PermissionInUserSchema);
