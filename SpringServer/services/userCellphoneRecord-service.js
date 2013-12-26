var UserCellphoneRecord = require('../model/UserCellphoneRecord').UserCellphoneRecord;

/**
 * 根据绑定电话获取用户Id
 * @param telephone
 * @param callback
 */
var getUserIdByTelephone = function (telephone, callback) {
  UserCellphoneRecord.findOne({cellphone:telephone, isUsing:true}, function (err, userCellphoneRecord) {
    if (err) return callback(404, {error:err});
    if (userCellphoneRecord) {
      if (userCellphoneRecord.state === '0000-0000-0000') {
        callback(200, {userCellphoneRecord:userCellphoneRecord});
      } else {
        callback(403, {error:'用户绑定电话已经禁用或删除.'});
      }
    } else {
      callback(400, {error:'未找到用户绑定电话.'});
    }
  });
};

module.exports = {
  getUserIdByTelephone:getUserIdByTelephone
};
