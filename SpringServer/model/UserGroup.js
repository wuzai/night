var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var commonSchemaPlugin = require('./CommonSchemaPlugin');

/**
 * 用户分组
 * @type {Schema}
 */
var UserGroupSchema = new Schema({
  userGroupName:{type:String}, //用户分组名
  description  :{type:String}  //用户分组描述
});

UserGroupSchema.plugin(commonSchemaPlugin);

exports.UserGroup = mongoose.model('UserGroup', UserGroupSchema);
