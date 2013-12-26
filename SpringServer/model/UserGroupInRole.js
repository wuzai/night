var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var commonSchemaPlugin = require('./CommonSchemaPlugin');

/**
 * 用户组与角色映射表
 * @type {Schema}
 */
var UserGroupInRoleSchema = new Schema({
  userGroup:{type:Schema.ObjectId, required:true, ref:'UserGroup'}, //用户分组Id
  role     :{type:Schema.ObjectId, required:true, ref:'Role'}       //角色Id
});
UserGroupInRoleSchema.index({ userGroup:1, role:1 }, { unique:true });

UserGroupInRoleSchema.plugin(commonSchemaPlugin);

exports.UserGroupInRole = mongoose.model('UserGroupInRole', UserGroupInRoleSchema);