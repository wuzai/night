var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var commonSchemaPlugin = require('./CommonSchemaPlugin');

/**
 * 用户配置信息
 * @type {Schema}
 */
var UserSettingSchema = new Schema({
  user        :{type:Schema.ObjectId, required:true, ref:'User'}, //用户Id
  setting     :{type:Schema.ObjectId, required:true, ref:'GlobalSetting'}, //全局配置Id
  settingValue:{type:String} //配置信息值
});
UserSettingSchema.index({ user:1, setting:1 }, { unique:true });

UserSettingSchema.plugin(commonSchemaPlugin);

exports.UserSetting = mongoose.model('UserSetting', UserSettingSchema);
