var config = require('../../config');
var webRoot_weixinapp = config.webRoot_weixinapp;
var merchantServer = require('../../services/merchant-service');
var profileServer = require('../../services/profile-service');

//商户详情页面
var openMerchantInfoPage = function (req, res) {
  var query = req.query;
  var merchantId = query.merchantId;
  var FromUserName = query.FromUserName;
  merchantServer.getMerchantById(merchantId, function (status_m, result_m) {
    if (status_m === 200 && result_m.merchant) {
      var merchant = result_m.merchant;
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
      profileServer.findMerchantProfile(merchantId, function (attrJson) {
        var keys = Object.keys(attrJson);
        keys.forEach(function (key) {
          if (attrJson[key]) {
            merchant_date[key] = attrJson[key];
          }
        });
        res.render('weixinapp/merchantInfo', {merchantId:merchantId, FromUserName:FromUserName, merchant:merchant_date});
      });
    } else {
      req.session.messages = {error:[result_m.error]};
      res.redirect([webRoot_weixinapp, '/error?merchantId=', merchantId , '&FromUserName=', FromUserName].join(''));
    }
  })
};


module.exports = {
  openMerchantInfoPage:openMerchantInfoPage
};