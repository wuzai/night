var config = require('../../config');
var webRoot_weixinapp = config.webRoot_weixinapp;
var merchantInMerchantServer = require('../../services/merchantInMerchant-service');
var merchantServer = require('../../services/merchant-service');
var profileServer = require('../../services/profile-service');

//打开推荐商户联盟列表
var openMerchantUnionList = function (req, res) {
  var query = req.query;
  var merchantId = query.merchantId;
  var FromUserName = query.FromUserName;
  merchantInMerchantServer.findSubMerchantByMerchantId(merchantId, function (status, result) {
    var merchants = result.merchants;
    if (status === 200 && merchants) {
      res.render('weixinapp/merchantUnionList', {merchantId:merchantId, FromUserName:FromUserName, merchants:merchants});
    } else {
      req.session.messages = {error:[result.error]};
      res.redirect([webRoot_weixinapp, '/error?merchantId=', merchantId , '&FromUserName=', FromUserName].join(''));
    }
  });
};

//打开推荐商户的详细页面
var openMerchantUnionInfo = function (req, res) {
  var query = req.query;
  var merchantId = query.merchantId;
  var FromUserName = query.FromUserName;
  var merchantUnionId = query.merchantUnionId;
  merchantServer.getMerchantById(merchantUnionId, function (status, result) {
    var merchant = result.merchant;
    if (status === 200 && merchant) {
      var merchant_date = {
        _id                 :merchant._id,
        merchantName        :merchant.merchantName,
        merchantRank        :merchant.merchantRank,
        description         :merchant.description,
        customerServicePhone:merchant.customerServicePhone,
        isPublicTel:merchant.isPublicTel,
        webSite             :merchant.webSite,
        creator             :merchant.creator,
        isPerfect           :merchant.isPerfect,
        createdAt           :merchant.createdAt,
        logoImage           :merchant.logoImage ? merchant.logoImage.imageUrl : null,
        rate                :merchant.rate,
        rateExplain         :merchant.rateExplain,
        useExplain          :merchant.useExplain,
        largessExplain      :merchant.largessExplain
      };
      profileServer.findMerchantProfile(merchantUnionId, function (attrJson) {
        var keys = Object.keys(attrJson);
        keys.forEach(function (key) {
          if (attrJson[key]) {
            merchant_date[key] = attrJson[key];
          }
        });
        res.render('weixinapp/merchantInfo', {merchantId:merchantId, FromUserName:FromUserName, merchant:merchant_date});
        //res.render('weixinapp/merchantUnionInfo', {merchantId:merchantId, FromUserName:FromUserName, merchant:merchant_date});
      });
    } else {
      req.session.messages = {error:[result.error]};
      res.redirect([webRoot_weixinapp, '/error?merchantId=', merchantId , '&FromUserName=', FromUserName].join(''));
    }
  });
};

//加载HTML页面
var openToLoadHtmlPage = function (req, res) {
  var query = req.query;
  var merchantId = query.merchantId;
  var FromUserName = query.FromUserName;
  res.render('weixinapp/toLoadHtml', {merchantId:merchantId, FromUserName:FromUserName});
}

module.exports = {
  openMerchantUnionList:openMerchantUnionList,
  openMerchantUnionInfo:openMerchantUnionInfo,
  openToLoadHtmlPage   :openToLoadHtmlPage
};