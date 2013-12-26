/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 13-11-22
 * Time: 下午5:32
 * To change this template use File | Settings | File Templates.
 */
var config = require('../../config');
var webRoot_wehere = config.webRoot_wehere;
var webRoot_admin = config.webRoot_admin;
var ProductType = require('../../model/ProductType').ProductType;

//会所产品类型列表
var clubProductTypeList = function (req, res, next) {
  var query = {
    state:'0000-0000-0000'
  };
  if (req.session&&req.session.merchant) {
    var merchant_session = req.session.merchant;
    var merchantId = merchant_session._id;
    query.merchant = merchantId;
  }
  ProductType.find(query).sort({updatedAt:-1}).exec(function (err, productTypeList) {
    res.render('sys/productTypeList', {
      productTypes:productTypeList,
      merchantId:merchantId
    });
  });
};
//保存会所产品类型信息
var addProductTypeSave = function (req, res, next) {
  var body = req.body;
  var productTypeInfo = new ProductType({
    merchant      :body.merchantId?body.merchantId:null,
    title      :body.title,
    intro    :body.intro
  });
  productTypeInfo.save(function(err,new_productType){
    if (err) {
      req.session.messages = {error:err};
    } else {
      var text = '产品类型添加成功！';
      req.session.messages = {notice:text};
    }
    res.redirect([webRoot_wehere , '/club/clubProductTypeList'].join(''));
  });
};
//to会所产品类型编辑页
var productTypeEditPage = function (req, res, next) {
  var query = req.query;
  var productTypeId = query.productTypeId;
  ProductType.findOne({_id:productTypeId}).exec(function (err, productType) {
    if (productType) {
      res.render('sys/productTypeEdit', {
        productType:productType
      });
    } else {
      req.session.messages = {error:['未获取到相关数据']};
      res.redirect([webRoot_admin , '/dashboard'].join(''));
    }
  });
};
//编辑保存会所产品类型信息
var productTypeEditSave = function (req, res, next) {
  var body = req.body;
  var productTypeId = body.productTypeId;
  var productTypeInfo = {
    title      :body.title,
    intro    :body.intro
  };
  ProductType.update({_id:productTypeId},productTypeInfo,function(err,new_productType){
    if (err) {
      req.session.messages = {error:err};
      res.redirect([webRoot_wehere , '/club/editProductType?productTypeId=' , productTypeId].join(''));
    } else {
      var text = '产品类型修改成功！';
      req.session.messages = {notice:text};
      res.redirect([webRoot_wehere , '/club/clubProductTypeList'].join(''));
    }
  });
};
//删除会所产品类型
var productTypeDelete = function (req, res, next) {
  var query = req.query;
  var productTypeId = query.productTypeId;
  if(productTypeId){
//    ProductType.update({_id:productTypeId}, {state:'1111-1111-1111'}, function (err, count) {
    ProductType.remove({_id:productTypeId}, function (err) {
      res.redirect([webRoot_wehere , '/club/clubProductTypeList'].join(''));
    });
  }else{
    req.session.messages = {error:['未获取到相关数据']};
    res.redirect([webRoot_admin , '/dashboard'].join(''));
  }
};


module.exports = {
  clubProductTypeList:clubProductTypeList,
  addProductTypeSave:addProductTypeSave,
  productTypeEditPage:productTypeEditPage,
  productTypeEditSave:productTypeEditSave,
  productTypeDelete:productTypeDelete
};