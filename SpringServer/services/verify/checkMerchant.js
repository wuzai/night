var config = require('../../config.js');

/**
 * 判断商户是否属于某商户
 * @param merchantId 当前商户Id
 * @param regMerchant 验证商户Id
 */
var checkMerchant = function(merchantId,regMerchant){
  var flag = false;
  //var _id = new ObjectId(merchantIdOfXSJ);
  if (merchantId == regMerchant) {
    flag = true;
  }
  return flag;
}

//判断是否是希斯杰商户
var isXSJOfMerchant = function (merchantId) {
  var merchantIdOfXSJ = config.merchantIds.XSJ;
  return checkMerchant(merchantId,merchantIdOfXSJ);
}

//判断是否是贝客汇商户
var isBKHOfMerchant = function (merchantId) {
  var merchantIdOfBKH = config.merchantIds.BKH;
  return checkMerchant(merchantId,merchantIdOfBKH);
}


module.exports = {
  isXSJOfMerchant:isXSJOfMerchant,
  isBKHOfMerchant:isBKHOfMerchant
};


