var Product = require('../model/Product.js').Product;
var config = require('../config');
var webRoot = config.webRoot;
var imageRoot = config.imageRoot;

/**
 * 获取服务指南列表
 * @param callback
 */
var findProductsByMerchantId = function (merchantId, callback) {
  if (!merchantId) {
    callback(400, {errors:'请求参数错误.'});
    return;
  }
  var query = {
    merchant:merchantId,
    state     :'0000-0000-0000'
  };
  Product.find(query).sort({updatedAt:-1}).populate('productType', 'title').exec(function (err, productlist) {
    if (err) callback(404, {errors:'查找出错'});
    if (productlist) {
      var data_product = [];
      var productLength = productlist.length;
      function productLoop(i) {
        if (i < productLength) {
          var product = productlist[i];
          var imageView_data = product.imageView;
          var imageView = '';
          if(imageView_data&&imageView_data.length>0){
            for(var j=0;j<imageView_data.length;j++){
              var url = webRoot+imageRoot+imageView_data[j].url;
              if(imageView){
                imageView = imageView+","+url;
              }else{
                imageView = url;
              }
            }
          }
          var productData = {
            _id     :product._id,
            merchant:product.merchant,
            title:product.title,
            intro:product.intro,
            originalPrice:product.originalPrice,
            privilegePrice:product.privilegePrice,
            productType:product.productType? product.productType.title : '',
            imageView:imageView
          };
          data_product.push(productData);
          productLoop(i + 1);
        }else{
          callback(200, data_product);
        }
      }
      productLoop(0);
    } else {
      callback(200, []);
    }
  });
};

module.exports = {
  findProductsByMerchantId:findProductsByMerchantId
};