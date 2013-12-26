var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var commonSchemaPlugin = require('./CommonSchemaPlugin');

/**
 * 用户与角色映射表
 * @type {Schema}
 */
var UserInRoleSchema = new Schema({
  user:{type:Schema.ObjectId, required:true, ref:'User'}, // 用户Id
  role:{type:Schema.ObjectId, required:true, ref:'Role'}  //角色Id
});
UserInRoleSchema.index({ user:1, role:1 }, { unique:true });

UserInRoleSchema.plugin(commonSchemaPlugin);

exports.UserInRole = mongoose.model('UserInRole', UserInRoleSchema);