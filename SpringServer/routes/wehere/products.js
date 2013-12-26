/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 13-11-22
 * Time: 下午5:32
 * To change this template use File | Settings | File Templates.
 */
var config = require('../../config');
var webRoot_wehere = config.webRoot_wehere;
var Product = require('../../model/Product').Product;
var ProductType = require('../../model/ProductType').ProductType;
var fileServer = require('../../utils/file-server');

//产品列表
var clubProductList = function (req, res, next) {
  var merchant_session = req.session.merchant;
  var merchantId = merchant_session._id;
  var query = {
    state:'0000-0000-0000'
  };
  if (merchantId) {
    query.merchant = merchantId;
  }
  Product.find(query).sort({updatedAt:-1}).populate('productType', 'title').exec(function (product_err, productList) {
    ProductType.find({state:'0000-0000-0000'}).sort({updatedAt:-1}).exec(function (productType_err, productTypeList) {
      res.render('club/productList', {
        products:productList,
        productTypes:productTypeList,
        merchantId:merchantId
      });
    });
  });
};
//保存产品信息
var addProductSave = function (req, res, next) {
  var body = req.body;
  var intro = body.intro;
  intro= intro.replace(/width=\".*?\"/ig, " ");
  var productInfo = new Product({
    merchant      :body.merchantId,
    title      :body.title,
    intro    :intro,
    productType    :body.productTypeId ? body.productTypeId : null,
    originalPrice    :body.originalPrice,
    privilegePrice    :body.privilegePrice
  });
  fileServer.uploadFileMain(req, 'imageView', '/sys/user/images', function (data) {
    var imageError = '';
    if (data.success) {
      var url = data.fileUrl;
      var imageView = {
        url:url,
        fileName:data.fileName,
        txt:url
      };
      productInfo.imageView = imageView;
    } else {
      imageError = data.error;
    }
    productInfo.save(function (err, new_product) {
      if (err) {
        req.session.messages = {error:err};
        res.redirect([webRoot_wehere , '/club/clubProductList'].join(''));
      } else {
        var text = '产品添加成功！';
        req.session.messages = {notice:text};
        res.redirect([webRoot_wehere , '/club/clubProductList'].join(''));
      }
    });
  });
};
//to产品编辑页
var productEditPage = function (req, res, next) {
  var query = req.query;
  var productId = query.productId;
  Product.findOne({_id:productId}).populate('productType', 'title').exec(function (product_err, product) {
    if (product) {
      var queryData = {
        state:'0000-0000-0000',
        merchant : product.merchant
      };
      ProductType.find({state:'0000-0000-0000'}).sort({updatedAt:-1}).exec(function (productType_err, productTypeList) {
        res.render('club/productEdit', {
          product:product,
          productTypes:productTypeList
        });
      });
    } else {
      req.session.messages = {error:['未获取到相关数据']};
      res.redirect([webRoot_wehere , '/dashboard'].join(''));
    }
  });
};
//编辑保存产品信息
var productEditSave = function (req, res, next) {
  var body = req.body;
  var productId = body.productId;
  var intro = body.intro;
  intro= intro.replace(/width=\".*?\"/ig, " ");
  var productInfo = {
    title      :body.title,
    intro    :intro,
    productType    :body.productTypeId ? body.productTypeId : null,
    originalPrice    :body.originalPrice,
    privilegePrice    :body.privilegePrice
  };

  if(productId){
    fileServer.uploadFileMain(req, 'imageView', '/sys/user/images', function (data) {
      if (data.success) {
        var url = data.fileUrl;
        var imageView = {
          url:url,
          txt:url
        };
      }
      Product.findById(productId,function (product_err, product) {
        var new_imageView = [];
        if (product.imageView && Array.isArray(product.imageView)) {
          new_imageView = product.imageView;
        }
        if(imageView){
          new_imageView.push(imageView);
        }
        productInfo.imageView = new_imageView;
        Product.update({_id:productId},productInfo,function(new_product_err,new_product){
          if (new_product_err) {
            req.session.messages = new_product_err;
            res.redirect([webRoot_wehere , '/club/editProduct?productId=' , productId].join(''));
          } else {
            var text = '产品信息修改成功！';
            req.session.messages = {notice:text};
            res.redirect([webRoot_wehere , '/club/clubProductList'].join(''));
          }
        });
      });
    });
  }
};
//删除会所环境
var productDelete = function (req, res, next) {
  var query = req.query;
  var productId = query.productId;
  if(productId){
//    Product.update({_id:productId}, {state:'1111-1111-1111'}, function (err, count) {
    Product.remove({_id:productId}, function (err) {
      res.redirect([webRoot_wehere , '/club/clubProductList'].join(''));
    });
  }else{
    req.session.messages = {error:['未获取到相关数据']};
    res.redirect([webRoot_wehere , '/dashboard'].join(''));
  }
};
//删除会所环境展示图
var productDeleteImage = function (req, res, next) {
  var query = req.query;
  var productId = query.productId;
  var imageViewId = query.imageViewId;
  if(productId&&imageViewId){
    Product.findOne({_id:productId}).exec(function (err, product) {
      if (product) {
        var new_imageView_data = [];
        var imageView_data = product.imageView;
        if(imageView_data){
          for(var i=0;i<imageView_data.length;i++){
            var imageView = imageView_data[i];
            if(imageView._id!=imageViewId){
              new_imageView_data.push(imageView);
            }
          }
          Product.update({_id:productId},{imageView:new_imageView_data},function(err,new_product){
            res.redirect([webRoot_wehere , '/club/editProduct?productId=', productId].join(''));
          });
        }
        res.redirect([webRoot_wehere , '/club/editProduct?productId=', productId].join(''));
      } else {
        req.session.messages = {error:['未获取到相关数据']};
        res.redirect([webRoot_wehere , '/dashboard'].join(''));
      }
    });
  }else{
    req.session.messages = {error:['未获取到相关数据']};
    res.redirect([webRoot_wehere , '/dashboard'].join(''));
  }
};

module.exports = {
  clubProductList:clubProductList,
  addProductSave:addProductSave,
  productEditPage:productEditPage,
  productEditSave:productEditSave,
  productDelete:productDelete,
  productDeleteImage:productDeleteImage

};