var config = require('../../config');
var Advertisement = require('../../model/Advertisement.js').Advertisement;
var ServiceItem = require('../../model/ServiceItem.js').ServiceItem;
var ServiceItemProfile = require('../../model/ServiceItemProfile.js').ServiceItemProfile;
var ObjectId = require('mongoose').Types.ObjectId;

//获取所有广告列表
var advertisementList = function (req, res, next) {
  findAdvertisementOfMerchantId(null, function (status, result) {
    if (status === 200) {
      res.json(200, result);
    } else {
      res.json(status, {errors:result.error});
    }
  });
};

//获取商户的广告
var findAdvertisementOfMerchantId = function (merchantId, callback) {
  var query = {
    state     :'0000-0000-0000'
  }
  if (merchantId) {
    query.merchant = merchantId;
  }
  Advertisement.find(query).populate('postImage', 'imageUrl').exec(function (err, advertisementList) {
    if (err) return callback(400, {error:err});
    var advertisements_data = [];
    var advertisementLen = advertisementList.length;

    function advertisementLoop(i) {
      if (i < advertisementLen) {
        var advertisement = advertisementList[i];
        var ad_data = {
          _id         :advertisement._id,
          title       :advertisement.title,
          content     :advertisement.content,
          merchantId  :advertisement.merchant,
          createdAt   :advertisement.createdAt,
          postImage   :[config.webRoot, config.imageRoot , advertisement.postImage ? advertisement.postImage.imageUrl : ''].join('')
        }
        advertisements_data.push(ad_data);
        advertisementLoop(i + 1);
      } else {
        callback(200, advertisements_data);
      }
    }
    advertisementLoop(0);
  })
};

//获取门店下的可用广告
var findAdvertisementOfMerchant = function (req, res, next) {
  var query = req.query;
  var merchant_id = query.merchant_id;
  var merchantId = new ObjectId(merchant_id);
  findAdvertisementOfMerchantId(merchantId, function (status, result) {
    if (status === 200) {
//      var ad_data = [];
//      var advertisements = result;
//      advertisements.forEach(function (ad) {
//        if (ad.serviceItem && ad.serviceItem.usableStores) {
//          if (ad.serviceItem.usableStores.indexOf(storeId) > -1) {
//            ad_data.push(ad);
//          }
//        }
//      });
      res.json(200, result);
    } else {
      res.json(status, {errors:result.error});
    }
  });
};

module.exports = {
  advertisementList          :advertisementList,
  findAdvertisementOfMerchant:findAdvertisementOfMerchant
};
