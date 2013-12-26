var AttributeDictionary = require('../model/AttributeDictionary').AttributeDictionary;
var MerchantProfile = require('../model/MerchantProfile').MerchantProfile;
var ServiceItemProfile = require('../model/ServiceItemProfile').ServiceItemProfile;
var UserProfile = require('../model/UserProfile').UserProfile;
var swiss = require('../utils/swiss-kit');

/**
 * 添加商户的扩展属性值
 * @param attributeName 属性名称
 * @param merchantId 扩展属性对应的商户Id
 * @param value 扩展属性值
 * @param callback
 */
var addMerchantOfProfile = function (attributeName, merchantId, value, callback) {
  AttributeDictionary.findOne({category:'Merchant', attributeName:attributeName}, '_id', function (err, attribute) {
    if (err) return callback(404, {error:err});
    if (attribute) {
      var merchantProfile = new MerchantProfile({
        merchant :merchantId,
        attribute:attribute._id,
        value    :value
      });
      merchantProfile.save(function (err, new_merchantProfile) {
        if (err) return callback(404, {error:err});
        callback(200, new_merchantProfile);
      });
    } else {
      callback(400, {error:'扩展属性不存在'});
    }
  });
};
/**
 * 获取商户扩展属性的值
 * @param attributeName
 * @param merchantId
 * @param callback
 */
var getMerchantOfProfileValue = function (attributeName, merchantId, callback) {
  AttributeDictionary.findOne({category:'Merchant', attributeName:attributeName}, '_id', function (err, attribute) {
    if (err) return callback(404, {error:err});
    if (attribute) {
      MerchantProfile.findOne({merchant:merchantId, attribute:attribute._id}, function (err, merchantProfile) {
        if (err) return callback(404, {error:err});
        callback(200, merchantProfile);
      });
    } else {
      callback(400, {error:'扩展属性不存在'});
    }
  });
};

/**
 * 修改商户的扩展属性值
 * @param attributeName 属性名称
 * @param merchantId 扩展属性对应的服务项目Id
 * @param value 扩展属性值
 * @param callback
 */
var editMerchantOfProfile = function (attributeName, merchantId, value, callback) {
  if (value) {
    AttributeDictionary.findOne({category:'Merchant', attributeName:attributeName}, '_id', function (err, attribute) {
      if (err) return callback(404, {error:err});
      if (attribute) {
        MerchantProfile.findOne({attribute:attribute._id, merchant:merchantId}, function (err, merchantProfile) {
          var merchantProfileSave = function (profile) {
            profile.save(function (err, new_merchantProfile) {
              if (err) return callback(404, {error:err});
              callback(200, new_merchantProfile);
            });
          };
          if (merchantProfile) {
            merchantProfile.value = value;
            merchantProfileSave(merchantProfile);
          } else {
            var merchantProfile = new MerchantProfile({
              merchant :merchantId,
              attribute:attribute._id,
              value    :value
            });
            merchantProfileSave(merchantProfile);
          }
        });
      } else {
        callback(400, {error:'扩展属性不存在'});
      }
    });
  } else {
    callback(200, null);
  }
};

var findMerchantProfile = function (merchantId, callback) {
  MerchantProfile.find({_type:'MerchantProfile', merchant:merchantId}).populate('attribute').exec(function (err, attrs) {
    var attrJson = swiss.findProfileToJSON(attrs);
    callback(attrJson);
  });
};


/**
 * 添加用户的扩展属性值
 * @param attributeName 属性名称
 * @param userId 扩展属性对应的用户Id
 * @param value 扩展属性值
 * @param callback
 */
var addUserOfProfile = function (attributeName, userId, value, callback) {
  AttributeDictionary.findOne({category:'User', attributeName:attributeName}, '_id', function (err, attribute) {
    if (err) return callback(404, {error:err});
    if (attribute) {
      var userProfile = new UserProfile({
        user     :userId,
        attribute:attribute._id,
        value    :value
      });
      userProfile.save(function (err, new_userProfile) {
        if (err) return callback(404, {error:err});
        callback(200, new_userProfile);
      });
    } else {
      callback(400, {error:'扩展属性不存在'});
    }
  });
};


/**
 * 添加服务项目的扩展属性值
 * @param attributeName 属性名称
 * @param serviceItemId 扩展属性对应的服务项目Id
 * @param value 扩展属性值
 * @param callback
 */
var addServiceItemOfProfile = function (attributeName, serviceItemId, value, callback) {
  if (value) {
    AttributeDictionary.findOne({category:'ServiceItem', attributeName:attributeName}, '_id', function (err, attribute) {
      if (err) return callback(404, {error:err});
      if (attribute) {
        var serviceItemProfile = new ServiceItemProfile({
          serviceItem:serviceItemId,
          attribute  :attribute._id,
          value      :value
        });
        serviceItemProfile.save(function (err, new_serviceItemProfile) {
          if (err) return callback(404, {error:err});
          callback(200, new_serviceItemProfile);
        });
      } else {
        callback(400, {error:'扩展属性不存在'});
      }
    });
  } else {
    callback(200, null);
  }
};

/**
 * 修改服务项目的扩展属性值
 * @param attributeName 属性名称
 * @param serviceItemId 扩展属性对应的服务项目Id
 * @param value 扩展属性值
 * @param callback
 */
var editServiceItemOfProfile = function (attributeName, serviceItemId, value, callback) {
  if (value || value === 0) {
    AttributeDictionary.findOne({category:'ServiceItem', attributeName:attributeName}, '_id', function (err, attribute) {
      if (err) return callback(404, {error:err});
      if (attribute) {
        ServiceItemProfile.findOne({attribute:attribute._id, serviceItem:serviceItemId}, function (err, serviceItemProfile) {
          var serviceItemProfileSave = function (profile) {
            profile.save(function (err, new_serviceItemProfile) {
              if (err) return callback(404, {error:err});
              callback(200, new_serviceItemProfile);
            });
          };
          if (serviceItemProfile) {
            serviceItemProfile.value = value;
            serviceItemProfileSave(serviceItemProfile);
          } else {
            var serviceItemProfile = new ServiceItemProfile({
              serviceItem:serviceItemId,
              attribute  :attribute._id,
              value      :value
            });
            serviceItemProfileSave(serviceItemProfile);
          }
        });
      } else {
        callback(400, {error:'扩展属性不存在'});
      }
    });
  } else {
    callback(200, null);
  }
};

module.exports = {
  addMerchantOfProfile     :addMerchantOfProfile,
  getMerchantOfProfileValue:getMerchantOfProfileValue,
  editMerchantOfProfile    :editMerchantOfProfile,
  findMerchantProfile      :findMerchantProfile,
  addUserOfProfile         :addUserOfProfile,
  addServiceItemOfProfile  :addServiceItemOfProfile,
  editServiceItemOfProfile :editServiceItemOfProfile
};
