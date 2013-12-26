
var config = require('../../config');
var webRoot = config.webRoot;
var imageRoot = config.imageRoot;
var Product = require('../../model/Product.js').Product;
var productServer = require('../../services/product-service');

//获取服务指南列表
var findProducts = function (req, res, next) {
  var query_req = req.query;
  var merchantId = query_req.merchantId;
  if (!merchantId) {
    res.json(400, []);
    return;
  }
  productServer.findProductsByMerchantId(merchantId,function(status_product,result_product){
    if(status_product===200){
      res.json(200, result_product);
    }else{
      res.json(404, []);
    }
  });
};

module.exports = {
  findProducts   :findProducts
};