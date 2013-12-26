var SupplyDemand = require('../model/SupplyDemand').SupplyDemand;

/**
 * 获取商户下的资源供需列表
 * @param merchantId 商户Id
 * @param callback
 */
var findSupplyDemandListByMerchantId = function (merchantId, callback) {
  SupplyDemand.find({merchant:merchantId, state:'0000-0000-0000'}).sort({updatedAt:-1}).exec(function (err, supplyDemandList) {
    if (err) return callback(404, {error:err});
    callback(200, {supplyDemands:supplyDemandList});
  });
};

/**
 * 获取limit数量的最新资源供需列表
 * @param merchantId
 * @param limit
 * @param callback
 */
var findSupplyDemandListOfLimitByMerchantId = function (merchantId, limit, callback) {
  SupplyDemand.find({merchant:merchantId, state:'0000-0000-0000'}).sort({updatedAt:-1}).limit(limit).exec(function (err, supplyDemandList) {
    if (err) return callback(404, {error:err});
    callback(200, {supplyDemands:supplyDemandList});
  });
};

module.exports = {
  findSupplyDemandListByMerchantId       :findSupplyDemandListByMerchantId,
  findSupplyDemandListOfLimitByMerchantId:findSupplyDemandListOfLimitByMerchantId
};

