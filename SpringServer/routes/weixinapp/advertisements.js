var config = require('../../config');
var webRoot_weixinapp = config.webRoot_weixinapp;
var Advertisement = require('../../model/Advertisement').Advertisement;
var advertisementServer = require('../../services/advertisement-service');

//获取广告详情
var openAdvertisementInfo = function (req, res) {
  var query = req.query;
  var merchantId = query.merchantId;
  var FromUserName = query.FromUserName;
  var advertisementId = query.advertisementId;
  Advertisement.findById(advertisementId).populate('postImage').populate('serviceItem').exec(function (err, advertisement) {
    if (advertisement && advertisement.state === '0000-0000-0000') {
      res.render('weixinapp/advertisementInfo', {merchantId:merchantId, FromUserName:FromUserName, advertisement:advertisement});
    } else {
      req.session.messages = {error:['未获取到相关数据.']};
      res.redirect([webRoot_weixinapp, '/openAdvertisementList?merchantId=', merchantId, '&FromUserName=', FromUserName].join(''));
    }
  });
};

var openAdvertisementList = function (req, res) {
  var query = req.query;
  var merchantId = query.merchantId;
  var FromUserName = query.FromUserName;
  advertisementServer.findAdvertisementListByMerchantId(merchantId, function (status_ad, result_ad) {
    res.render('weixinapp/advertisementList', {merchantId:merchantId, FromUserName:FromUserName, advertisements:result_ad.advertisements});
  });
}

module.exports = {
  openAdvertisementList:openAdvertisementList,
  openAdvertisementInfo:openAdvertisementInfo
};