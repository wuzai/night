var config = require('../../config');
var webRoot_weixinapp = config.webRoot_weixinapp;
var weiXinInUserServer = require('../../services/weiXinInUser-service');

/**
 * 通过FromUserName获取用户Id
 * @param merchantId
 * @param FromUserName
 * @param userId
 * @param callback
 */
var getUserIdByFromUserName = function (merchantId, FromUserName, userId, callback) {
  if (userId) {
    callback(200, {userId:userId});
  } else {
    weiXinInUserServer.getWeiXinInUserByWeiXinObject(FromUserName, function (status_user, result_user) {
      if (status_user === 200) {
        callback(200, {userId:result_user.userId});
      } else {
        var errorUrl = [webRoot_weixinapp, '/error?merchantId=', merchantId , '&FromUserName=', FromUserName].join('');
        if (status_user === 410) {
          errorUrl = [webRoot_weixinapp, '/openCreateWeiXinInUserPage?merchantId=', merchantId , '&FromUserName=', FromUserName].join('');
        }
        callback(status_user, {error:result_user.error, errorUrl:errorUrl});
      }
    });
  }
};


module.exports = {
  getUserIdByFromUserName:getUserIdByFromUserName
};