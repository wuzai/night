var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var commonSchemaPlugin = require('./CommonSchemaPlugin');

/**
 * 用户和用户分组映射表
 * @type {Schema}
 */
var UserInGroupSchema = new Schema({
  user     :{type:Schema.ObjectId, required:true, ref:'User'}, //用户Id
  userGroup:{type:Schema.ObjectId, required:true, ref:'UserGroup'} // 用户分组Id
});
UserInGroupSchema.index({ user:1, userGroup:1 }, { unique:true });

UserInGroupSchema.plugin(commonSchemaPlugin);

exports.UserInGroup = mongoose.model('UserInGroup', UserInGroupSchema);