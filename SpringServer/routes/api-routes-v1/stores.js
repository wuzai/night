var Store = require('../../model/Store').Store;
var ObjectId = require('mongoose').Types.ObjectId;
var serviceItems = require('./serviceItems');

/**
 * 通过商户Id获取门店列表
 * @param merchantId
 * @param callback
 */
var findStoreListByMerchantId = function (merchantId, callback) {
  Store.find({merchant:merchantId, state:'0000-0000-0000'}, function (err, storeList) {
    if (err) callback(200, {stores:[]});
    callback(200, {stores:storeList});
  });
};

var findServiceItemsOfStore = function (req, res, next) {
  var query = req.query;
  var store_id = query.store_id;
  var storeId = new ObjectId(store_id);
  Store.findById(storeId, function (err, store) {
    if (store) {
      var merchant = store.merchant;
      var serviceItemsOfStore_data = [];
      serviceItems.findServiceItemOfMerchant(merchant, function (status, result) {
        if (status === 200) {
          var serviceItems = result;
          serviceItems.forEach(function (serviceItem) {
            if (serviceItem.usableStores) {
              if (serviceItem.usableStores.indexOf(storeId) > -1) {
                serviceItemsOfStore_data.push(serviceItem);
              }
            }
          });
        }
        res.json(200, serviceItemsOfStore_data);
      });
    } else {
      res.json(404, {errors:'未找到该门店.'});
    }
  });
};

module.exports = {
  findStoreListByMerchantId:findStoreListByMerchantId,
  findServiceItemsOfStore  :findServiceItemsOfStore
};