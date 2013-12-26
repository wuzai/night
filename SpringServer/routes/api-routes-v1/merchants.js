var config = require('../../config');
var Merchant = require('../../model/Merchant').Merchant;
var MerchantTypeList = require('../../model/Merchant').MerchantTypeList;
var MerchantProfile = require('../../model/MerchantProfile').MerchantProfile;
var ServiceSet = require('../../model/ServiceSet').ServiceSet;
var ServiceItem = require('../../model/ServiceItem').ServiceItem;
var ServiceItemProfile = require('../../model/ServiceItemProfile').ServiceItemProfile;
var Store = require('../../model/Store.js').Store;
var Product = require('../../model/Product.js').Product;
var Comment = require('../../model/Comment').Comment;
var memberServer = require('../../services/member-service');
var productServer = require('../../services/product-service');
var advertisementServer = require('../../services/advertisement-service');

//获取商户列表
var list = function (req, res, next) {
  var query = req.query;
  var address = query.address;
  var queryData = {
    state:'0000-0000-0000'
  };
  if(address){
    queryData.address = {$regex:address,$options:'i'};
  }
  //var briefFields = '_id merchantName logoImage createdAt state rate rateExplain useExplain largessExplain';
  findMerchantsByParam(queryData,function(status,result){
    if(status===200){
      res.json(200, result);
    }else{
      next(result);
    }
  });
};

//获取商户详细信息
var detail = function (req, res, next) {
  var merchantId = req.params.id;
  //查询商户信息
  //var detailFields = '_id merchantName description customerServicePhone webSite';
  Merchant.findById(merchantId, function (err, merchant) {
    if (err) return next(err);
    if (merchant) {
      var postImage_data = merchant.postImage;
      var postImage = '';
      if(postImage_data&&postImage_data.length>0){
        for(var j=0;j<postImage_data.length;j++){
          var url = config.webRoot+config.imageRoot+postImage_data[j].url;
          if(postImage){
            postImage = postImage+","+url;
          }else{
            postImage = url;
          }
        }
      }
      //缓存商户数据
      var merchantData = {
        _id           :merchant._id,
        merchantName  :merchant.merchantName, //商户名称
        merchantType  :merchant.merchantType, //商户名称
        description   :merchant.description, //描述信息或标语
        customerPhone  :merchant.customerPhone, //客服电话
        webSite          :merchant.webSite, //商户网站
        address          :merchant.address, //商户地址
        location          :merchant.location, //地理位置
        longitude          :merchant.location?(merchant.location.longitude?merchant.location.longitude:''):'', //经度
        latitude          :merchant.location?(merchant.location.latitude?merchant.location.latitude:''):'', //纬度
        creator          :merchant.creator, //商户的创建人Id,
        intro             :merchant.intro, //商户介绍
        createdAt     :merchant.createdAt, //商户的加盟时间
        postUrl          :postImage, //商户展示图片
        logoUrl       :[config.webRoot, config.imageRoot , merchant.logoImage ? merchant.logoImage: ''].join('')//商户logo
      };
      productServer.findProductsByMerchantId(merchant._id,function(status_product,result_product){
        var product_data = [];
        if(status_product===200){
          product_data = result_product;
        }
        advertisementServer.findAdvertisementListByMerchantId(merchant._id,function(status_advertisement,result_advertisement){
          var advertisement_data = [];
          if(status_advertisement===200){
            advertisement_data = result_advertisement.advertisements;
          }
          Comment.find({merchant:merchant._id, state:'0000-0000-0000'}, function (status_comment,result_comment) {
            var comment_data = [];
            if(!status_comment){
              comment_data = result_comment;
            }
            merchantData.products = product_data; //商户下的服务指南（产品）
            merchantData.advertisements=advertisement_data //商户下的活动
            merchantData.comments=comment_data //商户下的评论
            res.json(200, merchantData);
          });
        });
      });
    } else {
      res.json(404, {errors:'商户数据未找到.'});
    }
  });
};
var findMerchantsByParam = function(query,callback){
  Merchant.find(query).exec(function (err, merchantList) {
    if (err) return callback(404,err);
    var data = [];
    var merchantLen = merchantList.length;
    function merchantLoop(i) {
      if (i < merchantLen) {
        var merchant = merchantList[i];
        var postImage_data = merchant.postImage;
        var postImage = '';
        if(postImage_data&&postImage_data.length>0){
          for(var j=0;j<postImage_data.length;j++){
            var url = config.webRoot+config.imageRoot+postImage_data[j].url;
            if(postImage){
              postImage = postImage+","+url;
            }else{
              postImage = url;
            }
          }
        }
        productServer.findProductsByMerchantId(merchant._id,function(status_product,result_product){
          var product_data = [];
          if(status_product===200){
            product_data = result_product;
          }
          advertisementServer.findAdvertisementListByMerchantId(merchant._id,function(status_advertisement,result_advertisement){
            var advertisement_data = [];
            if(status_advertisement===200){
              advertisement_data = result_advertisement.advertisements;
            }
            Comment.find({merchant:merchant._id, state:'0000-0000-0000'}, function (status_comment,result_comment) {
              var comment_data = [];
              if(!status_comment){
                comment_data = result_comment;
              }
              var mer = {
                _id           :merchant._id,
                merchantName  :merchant.merchantName, //商户名称
                merchantType  :merchant.merchantType, //商户名称
                description   :merchant.description, //描述信息或标语
                customerPhone  :merchant.customerPhone? merchant.customerPhone : '', //客服电话
                webSite          :merchant.webSite? merchant.webSite : '', //商户网站
                address          :merchant.address? merchant.address : '', //商户地址
                longitude          :merchant.location?(merchant.location.longitude?merchant.location.longitude:''):'', //经度
                latitude          :merchant.location?(merchant.location.latitude?merchant.location.latitude:''):'', //纬度
                location          :merchant.location, //地理位置
                creator          :merchant.creator? merchant.creator : '', //商户的创建人Id,
                intro             :merchant.intro? merchant.intro : '', //商户介绍
                products        :product_data, //商户下的服务指南（产品）
                advertisements  :advertisement_data, //商户下的活动
                comments        :comment_data, //商户下的评论
                createdAt     :merchant.createdAt, //商户的加盟时间
                postUrl          :postImage, //商户展示图片
                logoUrl       :[config.webRoot, config.imageRoot , merchant.logoImage ? merchant.logoImage: ''].join('')//商户logo
              };
              data.push(mer)
              merchantLoop(i + 1);
            });
          });
        });
      } else {
        callback(200, data);
      }
    }
    merchantLoop(0);
  });
};

var findMerchantTypeList = function(req, res, next){
  res.json(200, {merchantTypeList:MerchantTypeList});
};

module.exports = {
  list  :list,
  findMerchantTypeList  :findMerchantTypeList,
  detail:detail
};