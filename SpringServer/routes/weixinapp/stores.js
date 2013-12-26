var config = require('../../config');
var webRoot_weixinapp = config.webRoot_weixinapp;
var ObjectId = require('mongoose').Types.ObjectId;
var Store = require('../../model/Store').Store;
var storeServer = require('../../services/store-service');
var serviceItemServer = require('../../services/serviceItem-service');

var openStoreInfo = function (req, res) {
  var query = req.query;
  var merchantId = query.merchantId;
  var FromUserName = query.FromUserName;
  var storeId = query.storeId;
  Store.findById(storeId, function (err, store) {
    if (store && store.state === '0000-0000-0000') {
      serviceItemServer.findServiceItemListByMerchantId(store.merchant, function (status_item, result_item) {
        var serviceItemsOfStore_data = [];
        if (status_item === 200) {
          var serviceItemList = result_item.serviceItems;
          serviceItemList.forEach(function (serviceItem) {
            if (serviceItem.usableStores) {
              if (serviceItem.usableStores.indexOf(storeId) > -1) {
                serviceItemsOfStore_data.push(serviceItem);
              }
            }
          });
        }
        res.render('weixinapp/storeInfo', {merchantId:merchantId, FromUserName:FromUserName, store:store, serviceItems:serviceItemsOfStore_data});
      });
    } else {
      req.session.messages = {error:['未获取到相关数据.']};
      res.redirect([webRoot_weixinapp, '/error?merchantId=', merchantId , '&FromUserName=', FromUserName].join(''));
    }
  });
};

//获取商户下的门店
var openStoreList = function (req, res) {
  var query = req.query;
  var merchantId = query.merchantId;
  var FromUserName = query.FromUserName;
  storeServer.findStoreListByMerchantId(merchantId, function (status_store, result_store) {
    if (status_store === 200) {
      res.render('weixinapp/storeList', {merchantId:merchantId, FromUserName:FromUserName, stores:result_store.stores});
    } else {
      req.session.messages = {error:['未获取到相关数据.']};
      res.redirect([webRoot_weixinapp, '/error?merchantId=', merchantId , '&FromUserName=', FromUserName].join(''));
    }
  });
}


module.exports = {
  openStoreInfo:openStoreInfo,
  openStoreList:openStoreList
};