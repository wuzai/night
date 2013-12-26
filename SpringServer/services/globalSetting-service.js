var GlobalSetting = require('../model/GlobalSetting').GlobalSetting;

/**
 * 根据配置名称获取全局默认值
 * @param settingName
 * @param callback
 */
var getGlobalSettingBySettingName = function (settingName, callback) {
  GlobalSetting.findOne({settingName:settingName}, function (err, globalSetting) {
    var defaultValue = '';
    if (!err && globalSetting) {
      defaultValue = globalSetting.defaultValue;
    }
    callback(200, {defaultValue:defaultValue});
  });
};

module.exports = {
  getGlobalSettingBySettingName:getGlobalSettingBySettingName
};