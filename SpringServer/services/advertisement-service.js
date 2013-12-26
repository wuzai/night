var Advertisement = require('../model/Advertisement').Advertisement;

/**
 * 获取商户下的广告
 * @param merchantId 商户Id(id==null，则获取所有商户的广告)
 * @param callback
 */
var findAdvertisementListByMerchantId = function (merchantId, callback) {
  var query = {
    state:'0000-0000-0000'
  }
  if (merchantId) {
    query.merchant = merchantId;
  }
  Advertisement.find(query).sort({updatedAt:-1}).populate('postImage', 'imageUrl').exec(function (err, advertisementList) {
    if (err) return callback(400, {error:err});
    callback(200, {advertisements:advertisementList});
  })
};

/**
 * 获取limit数量的最新活动列表
 * @param merchantId 商户Id(id==null，则获取所有商户的广告)
 * @param limit
 * @param callback
 */
var findAdvertisementListOfLimitByMerchantId = function (merchantId, limit, callback) {
  var query = {
    state:'0000-0000-0000'
  }
  if (merchantId) {
    query.merchant = merchantId;
  }
  Advertisement.find(query).sort({updatedAt:-1}).limit(limit).populate('postImage', 'imageUrl').exec(function (err, advertisementList) {
    if (err) return callback(400, {error:err});
    callback(200, {advertisements:advertisementList});
  })
};

module.exports = {
  findAdvertisementListByMerchantId:findAdvertisementListByMerchantId,
  findAdvertisementListOfLimitByMerchantId:findAdvertisementListOfLimitByMerchantId
};