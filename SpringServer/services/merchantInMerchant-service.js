var MerchantInMerchant = require('../model/MerchantInMerchant').MerchantInMerchant;
var Merchant = require('../model/Merchant').Merchant;

/**
 * 根据商户merchantId,获取与该商户关联的子商户
 * @param merchantId
 * @param callback
 */
var findSubMerchantByMerchantId = function (merchantId, callback) {
  MerchantInMerchant.find({merchant:merchantId, state:'0000-0000-0000'}, function (err, merchantInMerchantList) {
    var subMerchantList_data = [];
    var subMerchantIdList_data = [];
    var merchantInMerchantLen = merchantInMerchantList.length;

    function merchantInMerchantLoop(i) {
      if (i < merchantInMerchantLen) {
        var subMerchant = merchantInMerchantList[i];
        subMerchantIdList_data.push(subMerchant.subMerchant);
        Merchant.findById(subMerchant.subMerchant).populate('logoImage', 'imageUrl').exec(function (err, merchant) {
          if (merchant) {
            subMerchantList_data.push(merchant);
          }
          merchantInMerchantLoop(i + 1);
        });
      } else {
        callback(200, {merchants:subMerchantList_data, merchantIds:subMerchantIdList_data});
      }
    }

    merchantInMerchantLoop(0);
  });
};

/**
 * 根据商户merchantId,获取limit数量的最新该商户关联的子商户列表
 * @param merchantId
 * @param callback
 */
var findSubMerchantListOfLimitByMerchantId = function (merchantId, limit, callback) {
  MerchantInMerchant.find({merchant:merchantId, state:'0000-0000-0000'}).select('subMerchant').sort({updatedAt:-1}).limit(limit).exec(function (err, merchantInMerchantList) {
    var subMerchantIds = [];
    merchantInMerchantList.forEach(function(subMerchantId){
      subMerchantIds.push(subMerchantId.subMerchant);
    });
    Merchant.find().populate('logoImage', 'imageUrl').where('_id').in(subMerchantIds).exec(function (err, merchantList) {
      if (err) return callback(400, {error:err});
      callback(200, {merchants:merchantList});
    });
  });
};

/**
 * 保存商户联盟关联
 * @param merchantId
 * @param subMerchantId
 * @param callback
 */
var saveMerchantInMerchant = function (merchantId, subMerchantId, callback) {
  MerchantInMerchant.findOne({merchant:merchantId, subMerchant:subMerchantId}, function (err, merchantInMerchant) {
    if (!merchantInMerchant) {
      var merchantInMerchant_create = new MerchantInMerchant({
        merchant   :merchantId,
        subMerchant:subMerchantId
      });
      merchantInMerchant_create.save(function (err, new_merchantInMerchant) {
        if (err) return callback(404, {error:err});
        callback(200, {merchantInMerchant:new_merchantInMerchant});
      });
    } else {
      callback(401, {error:err});
    }
  });
};

/**
 * 保存多个商户联盟关联
 * @param merchantId
 * @param subMerchantIds
 * @param callback
 */
var saveMerchantInMerchantBySubIds = function (merchantId, subMerchantIds, callback) {
  if (typeof subMerchantIds === 'object') {
    var subMerchantIdLen = subMerchantIds.length;

    function subMerchantIdLoop(i) {
      if (i < subMerchantIdLen) {
        var subMerchantId = subMerchantIds[i];
        saveMerchantInMerchant(merchantId, subMerchantId, function (status, result) {
          subMerchantIdLoop(i + 1);
        });
      } else {
        callback(200);
      }
    }

    subMerchantIdLoop(0);
  } else {
    callback(400, {error:'参数传递错误'});
  }
}

/**
 * 商户商户联盟关联
 * @param merchantId
 * @param subMerchantId
 * @param callback
 */
var deleteMerchantInMerchant = function (merchantId, subMerchantId, callback) {
  MerchantInMerchant.remove({merchant:merchantId, subMerchant:subMerchantId}, function (err) {
    if (err) return callback(404, {error:err});
    callback(200);
  });
}

module.exports = {
  findSubMerchantByMerchantId           :findSubMerchantByMerchantId,
  findSubMerchantListOfLimitByMerchantId:findSubMerchantListOfLimitByMerchantId,
  saveMerchantInMerchantBySubIds        :saveMerchantInMerchantBySubIds,
  deleteMerchantInMerchant              :deleteMerchantInMerchant
};