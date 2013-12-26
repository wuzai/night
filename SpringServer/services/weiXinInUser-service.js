var WeiXinInUser = require('../model/WeiXinInUser').WeiXinInUser;


/**
 * 根据用户微信帐号OpenId获取该帐号对应的用户Id
 * @param weiXinObject
 * @param callback
 */
var getWeiXinInUserByWeiXinObject = function (weiXinObject, callback) {
  WeiXinInUser.findOne({weiXinObject:weiXinObject}, function (err, weiXinInUser) {
    if (weiXinInUser) {
      if (weiXinInUser.state === '0000-0000-0000') {
        callback(200, {userId:weiXinInUser.user});
      } else {
        callback(400, {error:'该微信帐号绑定的贝客汇用户已经被系统禁用.'});
      }
    } else {
      callback(410, {error:'该微信帐号未绑定贝客汇用户.'});
    }
  });
};

/**
 * 创建用户微信帐号与贝客汇用户的关联表
 * @param weiXinObject
 * @param userId
 * @param callback
 */
var createWeiXinInUser = function (weiXinObject, userId, callback) {
  if (weiXinObject && userId) {
    WeiXinInUser.count({weiXinObject:weiXinObject}, function (err, count) {
      if (err) return callback(404, {error:'微信帐号与贝客汇用户绑定错误.'});
      if (count < 1) {
        var weiXinInUser = new WeiXinInUser({
          weiXinObject:weiXinObject,
          user        :userId
        });
        weiXinInUser.save(function (err, new_weiXinInUser) {
          if (err) return callback(404, {error:'微信帐号与贝客汇用户户绑定错误.'});
          callback(200, {weiXinInUser:new_weiXinInUser});
        });
      } else {
        callback(400, {error:'该微信帐号或该贝客汇用户帐号已经被绑定.'});
      }
    });
  } else {
    callback(400, {error:'微信帐号绑定传递参数错误.'});
  }
};
var createWeiXinInUser2 = function (weiXinObject, userId, callback) {
  if (weiXinObject && userId) {
    WeiXinInUser.count({$or:[
      {weiXinObject:weiXinObject},
      {user:userId}
    ]}, function (err, count) {
      if (err) return callback(404, {error:'微信帐号与贝客汇用户绑定错误.'});
      if (count < 1) {
        var weiXinInUser = new WeiXinInUser({
          weiXinObject:weiXinObject,
          user        :userId
        });
        weiXinInUser.save(function (err, new_weiXinInUser) {
          if (err) return callback(404, {error:'微信帐号与贝客汇用户户绑定错误.'});
          callback(200, {weiXinInUser:new_weiXinInUser});
        });
      } else {
        callback(400, {error:'该微信帐号或该贝客汇用户帐号已经被绑定.'});
      }
    });
  } else {
    callback(400, {error:'微信帐号绑定传递参数错误.'});
  }
};

module.exports = {
  getWeiXinInUserByWeiXinObject:getWeiXinInUserByWeiXinObject,
  createWeiXinInUser           :createWeiXinInUser
};
