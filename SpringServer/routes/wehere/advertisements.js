var config = require('../../config');
var webRoot_wehere = config.webRoot_wehere;
var Advertisement = require('../../model/Advertisement').Advertisement;
var ImageStore = require('../../model/ImageStore').ImageStore;
var fileServer = require('../../utils/file-server');
var advertisementService = require('../../services/advertisement-service');
var serviceItemService = require('../../services/serviceItem-service');

//广告列表
var advertisementList = function (req, res) {
  var merchant_session = req.session.merchant;
  var merchantId = merchant_session._id;
  //获取商户下的广告
  advertisementService.findAdvertisementListByMerchantId(merchantId, function (status, result) {
    res.render('wehere/advertisementList', {
      merchantId    :merchantId,
      advertisements:result.advertisements
    });
  });
};

var advertisementAddSave = function (req, res) {
  var body = req.body;
  var advertisementInfo = {
    merchant   :body.merchantId,
    title      :body.title,
    content    :body.content
  };
  advertisementSave(req, advertisementInfo, function (status, result) {
    if (status === 200) {
      var text = '活动添加成功！';
      if (result.error) {
        text = text + '但' + result.error;
      }
      req.session.messages = {notice:text};
    } else {
      req.session.messages = {error:[result.error]};
    }
    res.redirect([webRoot_wehere , '/advertisement'].join(''));
  });
};

/**
 * 活动、广告信息保存
 * @param req
 * @param advertisementInfo 活动、广告信息
 * @param callback
 */
var advertisementSave = function (req, advertisementInfo, callback) {
  if (advertisementInfo.title && advertisementInfo.title.trim()) {
    var title = advertisementInfo.title.trim();
//    if (advertisementInfo.fromDate && advertisementInfo.toDate && new Date(advertisementInfo.fromDate) > new Date(advertisementInfo.toDate)) {
//      callback(400, {error:'活动开始日期不能小于结束日期.'});
//      return;
//    }
    var advertisement = new Advertisement({
      merchant   :advertisementInfo.merchant,
      title      :title,
      content    :advertisementInfo.content
    });
    fileServer.uploadFileMain(req, 'postImage', '/sys/user/images', function (data) {
      var imageError = '';
      if (data.success) {
        var url = data.fileUrl;
        var imageStore = new ImageStore({
          imageUrl    :url,
          retinaUrl   :url,
          smallUrl    :url,
          thumbnailUrl:url
        });
        advertisement.postImage = imageStore;
        imageStore.save();
      } else {
        imageError = data.error;
      }
      advertisement.save(function (err, new_advertisement) {
        if (err) return callback(404, {error:err});
        callback(200, {error:imageError, advertisement:new_advertisement});
      });
    });
  } else {
    callback(400, {error:'活动标题不能为空.'});
    return;
  }
};


var advertisementEditPage = function (req, res) {
  var query = req.query;
  var advertisementId = query.advertisementId;
  Advertisement.findOne({_id:advertisementId, state:'0000-0000-0000'}).populate('postImage', 'imageUrl').exec(function (err, advertisement) {
    if (advertisement) {
      res.render('wehere/advertisementEdit', {
        advertisement:advertisement
      });
    } else {
      req.session.messages = {error:['未获取到相关数据']};
      res.redirect([webRoot_wehere , '/dashboard'].join(''));
    }
  });
};

var advertisementEditSave = function (req, res) {
  var body = req.body;
  var advertisementId = body.advertisementId;
  var advertisementInfo = {
    _id        :advertisementId,
    title      :body.title,
    content    :body.content
  };
  advertisementUpdate(req, advertisementInfo, function (status, result) {
    if (status === 200) {
      var text = '活动信息修改成功！';
      if (result.error) {
        text = text + '但' + result.error;
      }
      req.session.messages = {notice:text};
      res.redirect([webRoot_wehere , '/advertisement'].join(''));
    } else {
      req.session.messages = {error:[result.error]};
      res.redirect([webRoot_wehere , '/advertisement/editAdvertisement?advertisementId=' , advertisementId].join(''));
    }
  });
};

//广告编辑
var advertisementUpdate = function (req, advertisementInfo, callback) {
  if (advertisementInfo.title && advertisementInfo.title.trim()) {
    var title = advertisementInfo.title.trim();
//    if (advertisementInfo.fromDate && advertisementInfo.toDate && new Date(advertisementInfo.fromDate) > new Date(advertisementInfo.toDate)) {
//      callback(400, {error:'活动开始时间不能小于结束时间.'});
//      return;
//    }
    var update_data = {
      title      :title,
      content    :advertisementInfo.content
    };
//    if (advertisementInfo.isApproved) {
//      update_data.isApproved = advertisementInfo.isApproved ? true : false;
//    }
    fileServer.uploadFileMain(req, 'postImage', '/sys/user/images', function (data) {
      if (data.success) {
        var url = data.fileUrl;
        var imageStore = new ImageStore({
          imageUrl    :url,
          retinaUrl   :url,
          smallUrl    :url,
          thumbnailUrl:url
        });
        update_data.postImage = imageStore;
        imageStore.save();
      }
      Advertisement.update({_id:advertisementInfo._id}, update_data, function (err, new_merchant) {
        if (err) return callback(404, {error:err});
        callback(200, {error:err});
      });
    });
  } else {
    callback(400, {error:'活动标题不能为空.'});
    return;
  }
};

//商户广告删除
var advertisementDelete = function (req, res) {
  var query = req.query;
  var advertisementId = query.advertisementId;
  Advertisement.update({_id:advertisementId}, {state:'1111-1111-1111'}, function (err, count) {
    res.redirect([webRoot_wehere , '/advertisement'].join(''));
  });
};

module.exports = {
  advertisementList    :advertisementList,
  advertisementAddSave :advertisementAddSave,
  advertisementEditPage:advertisementEditPage,
  advertisementEditSave:advertisementEditSave,
  advertisementDelete  :advertisementDelete
};