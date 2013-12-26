var Store = require('../model/Store').Store;

/**
 * 获取门店信息
 * @param storeId
 * @param callback
 */
var findStoreListById = function (storeId, callback) {
  Store.findOne({_id:storeId, state:'0000-0000-0000'}, function (err, store) {
    if (err) return callback(404, {error:err});
    callback(200, {store:store});
  });
};

/**
 * 获取商户下的门店列表
 * @param merchantId 商户Id
 * @param callback
 */
var findStoreListByMerchantId = function (merchantId, callback) {
  Store.find({merchant:merchantId, state:'0000-0000-0000'},function (err, storeList) {
    if (err) return callback(404, {error:err});
    callback(200, {stores:storeList});
  }).sort({updatedAt:-1});
};

/**
 * 统计商户下的门店数量
 * @param merchantId
 * @param callback
 */
var countStoresByMerchantId = function (merchantId, callback) {
  Store.count({merchant:merchantId, state:'0000-0000-0000'}, function (err, count) {
    if (err) return callback(404, {error:err});
    callback(200, {count:count});
  });
};

module.exports = {
  findStoreListById        :findStoreListById,
  findStoreListByMerchantId:findStoreListByMerchantId,
  countStoresByMerchantId  :countStoresByMerchantId
};

