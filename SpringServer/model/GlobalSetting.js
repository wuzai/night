var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var commonSchemaPlugin = require('./CommonSchemaPlugin');

/**
 * 全局配置表
 * @type {Schema}
 */
var GlobalSettingSchema = new Schema({
  settingName :{type:String}, //配置名称
  description :{type:String}, //配置描述
  defaultValue:{type:String}, //默认值
  choiceList  :[
    {type:String}
  ] //备选项列表
});

GlobalSettingSchema.plugin(commonSchemaPlugin);

exports.GlobalSetting = mongoose.model('GlobalSetting', GlobalSettingSchema);
