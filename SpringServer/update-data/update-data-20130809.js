//数据校正处理
var config = require('../config');
var mongoose = require('mongoose');
var ServiceItem = require('../model/ServiceItem').ServiceItem;
var AttributeDictionary = require('../model/AttributeDictionary').AttributeDictionary;
var ServiceItemProfile = require('../model/ServiceItemProfile').ServiceItemProfile;

//连接MongoDB数据库
if (!mongoose.connection || (mongoose.connection.readyState == 0)) {
  mongoose.connect(config.db);
}

/**
 * 修改服务项目的扩展属性值
 * @param attributeName 属性名称
 * @param serviceItemId 扩展属性对应的服务项目Id
 * @param value 扩展属性值
 * @param callback
 */
var editServiceItemOfProfile = function (attributeName, serviceItemId, value, callback) {
  AttributeDictionary.findOne({category:'ServiceItem', attributeName:attributeName}, '_id', function (err, attribute) {
    if (err) return callback(404, {error:err});
    if (attribute) {
      ServiceItemProfile.findOne({attribute:attribute._id, serviceItem:serviceItemId}, function (err, serviceItemProfile) {
        if (serviceItemProfile) {
          serviceItemProfile.value = value;
          serviceItemProfile.save(function (err, new_serviceItemProfile) {
            if (err) return callback(404, {error:err});
            callback(200, new_serviceItemProfile);
          });
        } else {
          callback(201, {});
        }
      });
    } else {
      callback(400, {error:'扩展属性不存在'});
    }
  });
};

//修正服务的相关属性
var correctionServiceItemParam = function () {
  ServiceItem.find({serviceItemType:'MemberCard'}, function (err, serviceItemList) {
    var serviceItemLen = serviceItemList.length;

    function serviceItemLoop(i) {
      if (i < serviceItemLen) {
        var serviceItem = serviceItemList[i];
        editServiceItemOfProfile('pointApply', serviceItem._id, 0, function (status, result) {
          console.log(status);
          editServiceItemOfProfile('pointUsed', serviceItem._id, 0, function (status, result) {
            console.log(status);
            serviceItemLoop(i + 1);
          });
        });
      } else {
        console.log(serviceItemLen);
      }
    }

    serviceItemLoop(0);
  });
};

var init_data = function () {
  correctionServiceItemParam();
};

init_data();



