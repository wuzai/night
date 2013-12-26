var config = require('../../config');
var webRoot_wehere = config.webRoot_wehere;
var MerchantRank = require('../../model/MerchantRank').MerchantRank;

var merchantRankPage = function (req, res) {
//  MerchantRank.find({state:'0000-0000-0000'},function (err, merchantRankList) {
//    res.render('wehere/merchantRank', {merchantRanks:merchantRankList});
//  }).sort({updatedAt:-1}).limit(4);
  MerchantRank.findOne({state:'0000-0000-0000'},function (err, merchantRank) {
    res.redirect([webRoot_wehere, '/merchant/signUp'].join(''));
  });
};

module.exports = {
  merchantRankPage:merchantRankPage
};