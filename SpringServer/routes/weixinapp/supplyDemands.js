var config = require('../../config');
var ObjectId = require('mongoose').Types.ObjectId;
var webRoot_wehere = config.webRoot_wehere;
var SupplyDemand = require('../../model/SupplyDemand').SupplyDemand;
var supplyDemandServer = require('../../services/supplyDemand-service');

//资源供需列表
var openSupplyDemandList = function (req, res) {
  var query = req.query;
  var merchantId = query.merchantId;
  var FromUserName = query.FromUserName;
  var supplyDemandId = query.supplyDemandId;
  supplyDemandServer.findSupplyDemandListByMerchantId(merchantId, function (status, result) {
    var supplyDemandList = result.supplyDemands;
    if (supplyDemandId) {
      var supplyDemand_id = new ObjectId(supplyDemandId);
      var firstSupplyDemand = '';
      var index = -1;
      for (var i in supplyDemandList) {
        if (i > 10) break;
        var supplyDemand = supplyDemandList[i];
        if (supplyDemand && supplyDemand_id.equals(supplyDemand._id)) {
          firstSupplyDemand = supplyDemand;
          index = i;
          break;
        }
      }
      if (firstSupplyDemand && index >= 0) {
        supplyDemandList.splice(index, 1);
        supplyDemandList.unshift(firstSupplyDemand);
      }
    }
    res.render('weixinapp/supplyDemandList', {merchantId:merchantId, FromUserName:FromUserName, supplyDemands:supplyDemandList});
  });
};

module.exports = {
  openSupplyDemandList:openSupplyDemandList
};