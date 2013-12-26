var WeiXinInMerchant = require('../model/WeiXinInMerchant').WeiXinInMerchant;


/**
 * 根据微信公共帐号获取该帐号对应的商户Id
 * @param weiXinObject
 * @param callback
 */
var getWeiXinInMerchantByWeiXinObject = function (weiXinObject, callback) {
  WeiXinInMerchant.findOne({weiXinObject:weiXinObject}, function (err, weiXinInMerchant) {
    if (weiXinInMerchant) {
      if (weiXinInMerchant.state === '0000-0000-0000') {
        callback(200, {merchantId:weiXinInMerchant.merchant});
      } else {
        callback(400, {error:'该微信公共帐号已经被贝客汇系统禁用.'});
      }
    } else {
      callback(404, {error:'该微信公共帐号未绑定贝客汇商户帐号.'});
    }
  });
};

/**
 * 根据商户Id获取该帐号对应的微信公共帐号
 * @param merchantId
 * @param callback
 */
var getWeiXinInMerchantByMerchantId = function (merchantId, callback) {
  WeiXinInMerchant.findOne({merchant:merchantId}, function (err, weiXinInMerchant) {
    if (weiXinInMerchant) {
      if (weiXinInMerchant.state === '0000-0000-0000') {
        callback(200, {weiXinObject:weiXinInMerchant.weiXinObject});
      } else {
        callback(400, {error:'该微信公共帐号已经被贝客汇系统禁用.'});
      }
    } else {
      callback(404, {error:'该微信公共帐号未绑定贝客汇商户帐号.'});
    }
  });
};

/**
 * 创建微信公共帐号与贝客汇商户的关联表
 * @param weiXinObject
 * @param merchantId
 * @param callback
 */
var createWeiXinInMerchant = function (weiXinObject, merchantId, callback) {
  if (weiXinObject && merchantId) {
    WeiXinInMerchant.count({$or:[
      {weiXinObject:weiXinObject},
      {merchant:merchantId}
    ]}, function (err, count) {
      if (err) return callback(404, {error:'公共帐号与贝客汇商户绑定错误.'});
      if (count < 1) {
        var weiXinInMerchant = new WeiXinInMerchant({
          weiXinObject:weiXinObject,
          merchant    :merchantId
        });
        weiXinInMerchant.save(function (err, new_weiXinInMerchant) {
          if (err) return callback(404, {error:'公共帐号与贝客汇商户绑定错误.'});
          callback(200, {weiXinInMerchant:new_weiXinInMerchant});
        });
      } else {
        callback(400, {error:'该公共帐号或该贝客汇商户帐号已经被绑定.'});
      }
    });
  } else {
    callback(404, {error:'微信公共帐号绑定传递参数错误.'});
  }
};

/**
 * 修改微信公共帐号与贝客汇商户的关联表
 * @param weiXinObject
 * @param merchantId
 * @param callback
 */
var updateWeiXinInMerchant = function (weiXinObject, merchantId, callback) {
  if (weiXinObject && merchantId) {
    WeiXinInMerchant.count({weiXinObject:weiXinObject}, function (err, count) {
      if (err) return callback(404, {error:'公共帐号与贝客汇商户绑定错误.'});
      if (count < 1) {
        WeiXinInMerchant.findOne({merchant:merchantId}, function (err, weiXinInMerchant) {
          if (weiXinInMerchant) {
            weiXinInMerchant.weiXinObject = weiXinObject;
            weiXinInMerchant.save(function (err, new_weiXinInMerchant) {
              if (err) return callback(404, {error:'公共帐号与贝客汇商户绑定错误.'});
              callback(200, {weiXinInMerchant:new_weiXinInMerchant});
            });
          } else {
            //不存在,就创建关联
            createWeiXinInMerchant(weiXinObject, merchantId, callback);
          }
        });
      } else {
        callback(400, {error:'该公共帐号或该贝客汇商户帐号已经被绑定.'});
      }
    });
  } else {
    callback(404, {error:'微信公共帐号绑定传递参数错误.'});
  }
};

module.exports = {
  getWeiXinInMerchantByWeiXinObject:getWeiXinInMerchantByWeiXinObject,
  getWeiXinInMerchantByMerchantId:getWeiXinInMerchantByMerchantId,
  createWeiXinInMerchant           :createWeiXinInMerchant,
  updateWeiXinInMerchant           :updateWeiXinInMerchant
};
