var config = require('../../config');
var webRoot_wehere = config.webRoot_wehere;
var Merchant = require('../../model/Merchant').Merchant;
var Store = require('../../model/Store').Store;
var fileServer = require('../../utils/file-server');
var storeServer = require('../../services/store-service');
var swiss = require('../../utils/swiss-kit');

var storeList = function (req, res) {
  var merchant_session = req.session.merchant;
  var merchantId = merchant_session._id;
  storeServer.findStoreListByMerchantId(merchantId, function (status, result) {
    res.render('wehere/storeList', {merchantId:merchantId, stores:result.stores});
  });
};

/**
 * 验证门店信息
 * @param storeInfo 门店信息
 */
var validationStoreInfo = function (storeInfo) {
  var result = {flag:false, message:'参数传递错误.'};
  if (storeInfo.storeName && storeInfo.storeName.trim()) {
    if (storeInfo.telephone && !swiss.isPhone(storeInfo.telephone)) {
      result.message = '客服电话输入错误.';
      return result;
    }
    if (storeInfo.longitude && storeInfo.longitude.trim()) {
      var mp = Number(storeInfo.longitude.trim());
      if (isNaN(mp) || mp < -180 || mp > 180) {
        result.message = '经度输入错误.';
        return result;
      }
    }
    if (storeInfo.latitude && storeInfo.latitude.trim()) {
      var np = Number(storeInfo.latitude.trim());
      if (isNaN(np) || np < -90 || np > 90) {
        result.message = '纬度输入错误.';
        return result;
      }
    }
  } else {
    result.message = '门店名称不能为空.';
    return result;
  }
  result.flag = true;
  result.message = '';
  return result;
};

var addStore = function (req, res) {
  var body = req.body;
  var merchantId = body.merchantId;
  var storeName = body.storeName;
  var description = body.description;
  var slogan = body.slogan;
  var telephone = body.telephone;
  var isPublicTel = body.isPublicTel;
  var address = body.address;
  var longitude = body.longitude;
  var latitude = body.latitude;
  var relevantText = body.relevantText;
  var storeInfo = {
    merchant    :merchantId,
    storeName   :storeName,
    description :description,
    slogan      :slogan,
    telephone   :telephone ? telephone.trim() : null,
    isPublicTel :isPublicTel,
    address     :address,
    longitude   :longitude,
    latitude    :latitude,
    relevantText:relevantText
  };
  var result_validation = validationStoreInfo(storeInfo);
  if (result_validation.flag) {
    storeSave(req, storeInfo, function (status, result) {
      if (status === 200) {
        req.session.messages = {notice:'门店添加成功！'};
      } else {
        req.session.messages = {error:[result.error]};
      }
      res.redirect([webRoot_wehere , '/merchant/storeList'].join(''));
    });
  } else {
    req.session.messages = {error:[result_validation.message]};
    res.redirect([webRoot_wehere , '/merchant/storeList'].join(''));
  }
};

/**
 * 门店信息保存
 * @param req
 * @param storeInfo 门店信息
 * @param callback
 */
var storeSave = function (req, storeInfo, callback) {
  if (storeInfo.storeName && storeInfo.storeName.trim()) {
    var storeName = storeInfo.storeName.trim();
    Store.count({storeName:storeName}, function (err, count) {
      if (err) return callback(404, {error:err});
      if (count > 0) {
        callback(409, {error:'门店名称已经存在.'});
        return;
      }
      var store = new Store({
        storeName  :storeName,
        merchant   :storeInfo.merchant,
        description:storeInfo.description,
        slogan     :storeInfo.slogan,
        telephone  :storeInfo.telephone,
        isPublicTel:storeInfo.isPublicTel,
        address    :storeInfo.address,
        location   :{
          longitude   :storeInfo.longitude,
          latitude    :storeInfo.latitude,
          relevantText:storeInfo.relevantText
        }
      });
      fileServer.uploadFileMain(req, 'vipImage', '/sys/user/images', function (data) {
        if (data.success) {
          var url = data.fileUrl;
          store.vipImage = url;
        }
        store.save(function (err, new_store) {
          if (err) return callback(404, {error:err});
          callback(200, new_store);
        });
      });
    });
  } else {
    callback(400, {error:'门店名称不能为空.'});
    return;
  }
};


var storeEditPage = function (req, res) {
  var query = req.query;
  var storeId = query.storeId;
  Store.findOne({_id:storeId, state:'0000-0000-0000'}, function (err, store) {
    if (store) {
      res.render('wehere/storeEdit', {
        store:store
      });
    } else {
      req.session.messages = {error:['未获取到相关数据']};
      res.redirect([webRoot_wehere , '/dashboard'].join(''));
    }
  });
};

var storeEditSave = function (req, res) {
  var body = req.body;
  var storeId = body.storeId;
  var storeName = body.storeName;
  var description = body.description;
  var slogan = body.slogan;
  var telephone = body.telephone;
  var isPublicTel = body.isPublicTel;
  var address = body.address;
  var longitude = body.longitude;
  var latitude = body.latitude;
  var relevantText = body.relevantText;
  var storeInfo = {
    _id         :storeId,
    storeName   :storeName,
    description :description,
    slogan      :slogan,
    telephone   :telephone ? telephone.trim() : null,
    isPublicTel :isPublicTel,
    address     :address,
    longitude   :longitude,
    latitude    :latitude,
    relevantText:relevantText
  };
  var result_validation = validationStoreInfo(storeInfo);
  if (result_validation.flag) {
    storeUpdate(req, storeInfo, function (status, result) {
      if (status === 200) {
        req.session.messages = {notice:'门店信息修改成功！'};
        res.redirect([webRoot_wehere , '/merchant/storeList'].join(''));
      } else {
        req.session.messages = {error:[result.error]};
        res.redirect([webRoot_wehere , '/merchant/storeEdit?storeId=' , storeId].join(''));
      }
    });
  } else {
    req.session.messages = {error:[result_validation.message]};
    res.redirect([webRoot_wehere , '/merchant/storeEdit?storeId=' , storeId].join(''));
  }
};

var storeUpdate = function (req, storeInfo, callback) {
  if (storeInfo.storeName && storeInfo.storeName.trim()) {
    var storeName = storeInfo.storeName.trim();
    Store.count({storeName:storeName, _id:{$ne:storeInfo._id}}, function (err, count) {
      if (err) return callback(404, {error:err});
      if (count > 0) {
        callback(409, {error:'门店名称已被使用.'});
        return;
      }
      var update_data = {
        storeName  :storeName,
        description:storeInfo.description,
        slogan     :storeInfo.slogan,
        telephone  :storeInfo.telephone,
        isPublicTel:storeInfo.isPublicTel ? true : false,
        address    :storeInfo.address,
        location   :{
          longitude   :storeInfo.longitude,
          latitude    :storeInfo.latitude,
          relevantText:storeInfo.relevantText
        }
      };
      fileServer.uploadFileMain(req, 'vipImage', '/sys/user/images', function (data) {
        if (data.success) {
          var url = data.fileUrl;
          update_data.vipImage = url;
        }
        Store.update({_id:storeInfo._id}, update_data, function (err, new_merchant) {
          if (err) return callback(404, {error:err});
          callback(200, new_merchant);
        });
      });
    });
  } else {
    callback(400, {error:'门店名称不能为空.'});
    return;
  }
};

var storeImageView = function (req, res) {
  var query = req.query;
  var storeId = query.storeId;
  Store.findById(storeId, '_id storeName imageView', function (err, store) {
    if (store) {
      res.render('wehere/storeImageView', {
        store:store
      });
    } else {
      req.session.messages = {error:['未获取到相关数据']};
      res.redirect([webRoot_wehere , '/dashboard'].join(''));
    }
  });
};

var uploadImageView = function (req, res) {
  var body = req.body;
  var storeId = body.storeId;
  var imageViewTxt = body.imageViewTxt;
  fileServer.uploadFileMain(req, 'imageViewUrl', '/sys/user/images', function (data) {
    if (data.success) {
      var imageViewUrl = data.fileUrl;
      var imageView = {
        url:imageViewUrl,
        txt:imageViewTxt
      };
      Store.findById(storeId,function (err, store) {
        var new_imageView = [];
        if (store.imageView && Array.isArray(store.imageView)) {
          new_imageView = store.imageView;
        }
        new_imageView.push(imageView);
        store.imageView = new_imageView;
        store.save(function (err, new_merchant) {
          if (err) {
            req.session.messages = {error:['图片上传失败.']};
          } else {
            req.session.messages = {notice:['图片上传成功.']};
          }
          res.redirect([webRoot_wehere ,  '/merchant/storeImageView?storeId=',storeId].join(''));
        });
      });
    } else {
      req.session.messages = {error:['图片上传失败.']};
      res.redirect([webRoot_wehere , '/merchant/storeImageView?storeId=',storeId].join(''));
    }
  });
};

var storeDelete = function (req, res) {
  var query = req.query;
  var storeId = query.storeId;
  Store.update({_id:storeId}, {state:'1111-1111-1111'}, function (err, count) {
    res.redirect([webRoot_wehere , '/merchant/storeList'].join(''));
  });
};

module.exports = {
  storeList      :storeList,
  addStore       :addStore,
  storeEditPage  :storeEditPage,
  storeEditSave  :storeEditSave,
  storeImageView :storeImageView,
  uploadImageView:uploadImageView,
  storeDelete    :storeDelete
};