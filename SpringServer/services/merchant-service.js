var Merchant = require('../model/Merchant').Merchant;
var User = require('../model/User').User;
var Store = require('../model/Store').Store;
var Member = require('../model/Member').Member;
var MerchantProfile = require('../model/MerchantProfile').MerchantProfile;
var ObjectId = require('mongoose').Types.ObjectId;

/**
 * 根据商户Id获取商户信息
 * @param merchantId
 * @param callback
 */
var getMerchantById = function (merchantId, callback) {
  Merchant.findById(merchantId).populate('logoImage', 'imageUrl').exec(function (err, merchant) {
    if (err) return callback(404, {error:err});
    if (merchant) {
      if (merchant.state === '0000-0000-0000') {
        callback(200, {merchant:merchant});
      } else {
        callback(400, {error:'该商户已被商户或禁用.'});
      }
    } else {
      callback(404, {error:'未获取到商户信息数据.'});
    }
  });
};

/**
 * 通过商户名称获取商户信息
 * @param merchantName
 * @param callback
 */
var getMerchantByMerchantName = function (merchantName, callback) {
  Merchant.findOne({merchantName:merchantName}).exec(function (err, merchant) {
    if (err) return callback(404, {error:err});
    if (merchant) {
      if (merchant.state === '0000-0000-0000') {
        callback(200, {merchant:merchant});
      } else {
        callback(400, {error:'该商户已被商户或禁用.'});
      }
    } else {
      callback(404, {error:'未获取到商户信息数据.'});
    }
  });
};

/**
 * 通过商户创建人名称获取商户信息
 * @param creatorName
 * @param callback
 */
var getMerchantByCreatorName = function (creatorName, callback) {
  User.findOne({userName:creatorName}, '_id state', function (err, user) {
    if (err) return callback(404, {error:err});
    if (user) {
      if (user.state === '0000-0000-0000') {
        Merchant.findOne({creator:user._id}).exec(function (err, merchant) {
          if (err) return callback(404, {error:err});
          if (merchant) {
            if (merchant.state === '0000-0000-0000') {
              callback(200, {merchant:merchant});
            } else {
              callback(400, {error:'该商户已被商户或禁用.'});
            }
          } else {
            callback(404, {error:'未获取到商户信息数据.'});
          }
        });
      } else {
        callback(404, {error:'未获取到创建人已被禁用.'});
      }
    } else {
      callback(404, {error:'未获取到创建人信息数据.'});
    }
  });
};

/**
 * 通过门店Id信息获取商户信息
 * @param storeId
 * @param callback
 */
var getMerchantByStoreId = function (storeId, callback) {
  var merchant_data = {};
  Store.findById(storeId, '_id merchant', function (err, store) {
    if (err) return callback(404, {error:err});
    if (store) {
      Merchant.findById(store.merchant).populate('logoImage', 'imageUrl').exec(function (err, merchant) {
        if (err) return callback(404, {error:err});
        if (merchant) {
          merchant_data = merchant;
          merchant_data.logoImage = merchant.logoImage ? merchant.logoImage.imageUrl : ''
          callback(200, {merchant:merchant_data});
        } else {
          callback(400, {error:'未获取商户数据.'});
        }
      });
    } else {
      callback(400, {error:'未获取门店数据.'});
    }
  });
};

/**
 * 通过用户Id获取该用户创建的商户信息
 * @param userId 用户Id
 * @param callback
 */
var getMerchantByUserId = function (userId, callback) {
  Merchant.findOne({creator:userId, state:'0000-0000-0000'}, function (err, merchant) {
    callback(200, {merchant:merchant});
  });
};

/**
 * 获取除merchantIds外的所有商户
 * @param merchantId
 * @param callback
 */
var findMerchantOfUnion = function (merchantIds, callback) {
  Merchant.find({_id:{ $nin:merchantIds }, state:'0000-0000-0000'}).populate('logoImage', 'imageUrl').exec(function (err, merchantList) {
    callback(200, {merchants:merchantList});
  });
};

module.exports = {
  getMerchantById          :getMerchantById,
  getMerchantByMerchantName:getMerchantByMerchantName,
  getMerchantByCreatorName :getMerchantByCreatorName,
  getMerchantByStoreId     :getMerchantByStoreId,
  getMerchantByUserId      :getMerchantByUserId,
  findMerchantOfUnion      :findMerchantOfUnion
};

