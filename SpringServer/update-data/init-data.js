var config = require('../config');
var mongoose = require('mongoose');
var AttributeDictionary = require('./../model/AttributeDictionary').AttributeDictionary;
var GlobalSetting = require('./../model/GlobalSetting').GlobalSetting;
var MerchantRank = require('./../model/MerchantRank').MerchantRank;

//连接MongoDB数据库
if (!mongoose.connection || (mongoose.connection.readyState == 0)) {
  mongoose.connect(config.db);
}


//初始化扩展属性字典属性
var initAttributeDictionaryData = function () {
  //用户昵称
  var name = new AttributeDictionary({
    category         :'User',
    attributeName    :'name',
    description      :'用户昵称',
    isEnabled        :true,
    isRequired       :false,
    verifyRegex      :null,
    choiceList       :null,
    isEditable       :true,
    isMultiSelectable:false,
    defaultValue     :null,
    bindTable        :null,
    bindPKFields     :null,
    sortOrder        :null,
    isEncrypt        :true
  });
  //用户邮箱
  var email = new AttributeDictionary({
    category         :'User',
    attributeName    :'email',
    description      :'用户邮箱',
    isEnabled        :true,
    isRequired       :false,
    verifyRegex      :'/^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/',
    choiceList       :null,
    isEditable       :true,
    isMultiSelectable:false,
    defaultValue     :null,
    bindTable        :null,
    bindPKFields     :null,
    sortOrder        :null,
    isEncrypt        :true
  });
  //用户性别
  var gender = new AttributeDictionary({
    category         :'User',
    attributeName    :'gender',
    description      :'用户性别',
    isEnabled        :true,
    isRequired       :false,
    verifyRegex      :null,
    choiceList       :['男', '女'],
    isEditable       :true,
    isMultiSelectable:false,
    defaultValue     :null,
    bindTable        :null,
    bindPKFields     :null,
    sortOrder        :null,
    isEncrypt        :true
  });
  //用户生日
  var birth = new AttributeDictionary({
    category         :'User',
    attributeName    :'birth',
    description      :'用户生日',
    isEnabled        :true,
    isRequired       :false,
    verifyRegex      :null,
    choiceList       :null,
    isEditable       :true,
    isMultiSelectable:false,
    defaultValue     :null,
    bindTable        :null,
    bindPKFields     :null,
    sortOrder        :null,
    isEncrypt        :true
  });
  //商户地址
  var address = new AttributeDictionary({
    category         :'Merchant',
    attributeName    :'address',
    description      :'商户地址',
    isEnabled        :true,
    isRequired       :false,
    verifyRegex      :null,
    choiceList       :null,
    isEditable       :true,
    isMultiSelectable:false,
    defaultValue     :null,
    bindTable        :null,
    bindPKFields     :null,
    sortOrder        :null,
    isEncrypt        :true
  });
  //商户说明
  var explain = new AttributeDictionary({
    category         :'Merchant',
    attributeName    :'explain',
    description      :'商户说明',
    isEnabled        :true,
    isRequired       :false,
    verifyRegex      :null,
    choiceList       :null,
    isEditable       :true,
    isMultiSelectable:false,
    defaultValue     :null,
    bindTable        :null,
    bindPKFields     :null,
    sortOrder        :null,
    isEncrypt        :true
  });
  //商户简介
  var intro = new AttributeDictionary({
    category         :'Merchant',
    attributeName    :'intro',
    description      :'商户简介',
    isEnabled        :true,
    isRequired       :false,
    verifyRegex      :null,
    choiceList       :null,
    isEditable       :true,
    isMultiSelectable:false,
    defaultValue     :null,
    bindTable        :null,
    bindPKFields     :null,
    sortOrder        :null,
    isEncrypt        :true
  });
  //成为商户会员，初始赠送积分
  var regPoint = new AttributeDictionary({
    category         :'Merchant',
    attributeName    :'regPoint',
    description      :'成为商户会员，初始赠送积分',
    isEnabled        :true,
    isRequired       :false,
    verifyRegex      :null,
    choiceList       :null,
    isEditable       :true,
    isMultiSelectable:false,
    defaultValue     :0,
    bindTable        :null,
    bindPKFields     :null,
    sortOrder        :null,
    isEncrypt        :true
  });

  //温馨提示
  var promptIntro = new AttributeDictionary({
    category         :'ServiceItem',
    attributeName    :'promptIntro',
    description      :'温馨提示',
    isEnabled        :true,
    isRequired       :false,
    verifyRegex      :null,
    choiceList       :null,
    isEditable       :true,
    isMultiSelectable:false,
    defaultValue     :null,
    bindTable        :null,
    bindPKFields     :null,
    sortOrder        :null,
    isEncrypt        :true
  });

  //优惠卷数量
  var quantity = new AttributeDictionary({
    category         :'ServiceItem',
    attributeName    :'quantity',
    description      :'优惠卷数量',
    isEnabled        :true,
    isRequired       :false,
    verifyRegex      :null,
    choiceList       :null,
    isEditable       :true,
    isMultiSelectable:false,
    defaultValue     :1,
    bindTable        :null,
    bindPKFields     :null,
    sortOrder        :null,
    isEncrypt        :true
  });

  //计次卡剩余次数
  var remainCount = new AttributeDictionary({
    category         :'ServiceItem',
    attributeName    :'remainCount',
    description      :'计次卡剩余次数',
    isEnabled        :true,
    isRequired       :false,
    verifyRegex      :null,
    choiceList       :null,
    isEditable       :true,
    isMultiSelectable:false,
    defaultValue     :1,
    bindTable        :null,
    bindPKFields     :null,
    sortOrder        :null,
    isEncrypt        :true
  });
  //服务申领需要扣除会员积分
  var pointApply = new AttributeDictionary({
    category         :'ServiceItem',
    attributeName    :'pointApply',
    description      :'服务申领需要扣除会员积分',
    isEnabled        :true,
    isRequired       :false,
    verifyRegex      :null,
    choiceList       :null,
    isEditable       :true,
    isMultiSelectable:false,
    defaultValue     :0,
    bindTable        :null,
    bindPKFields     :null,
    sortOrder        :null,
    isEncrypt        :true
  });
  //服务使用需要扣除会员积分
  var pointUsed = new AttributeDictionary({
    category         :'ServiceItem',
    attributeName    :'pointUsed',
    description      :'服务使用需要扣除会员积分',
    isEnabled        :true,
    isRequired       :false,
    verifyRegex      :null,
    choiceList       :null,
    isEditable       :true,
    isMultiSelectable:false,
    defaultValue     :0,
    bindTable        :null,
    bindPKFields     :null,
    sortOrder        :null,
    isEncrypt        :true
  });

  var objects_user = [name, email, gender, birth];
  var objects_merchant = [address, explain, intro, regPoint];
  var objects_serviceItem = [promptIntro, quantity, remainCount, pointApply, pointUsed];

  var objects_item = objects_user.concat(objects_merchant).concat(objects_serviceItem);

  var len = objects_item.length;

  function loop(i) {
    if (i < len) {
      var item = objects_item[i];
      item.save(function (err, data) {
        if (err) console.log('Attribute save failed');
        loop(i + 1);
      });
    } else {
      console.log('initAttributeDictionaryData is end.Total：' + i);
    }
  }

  loop(0);
};

var initMerchantRankData = function () {
  var merchantRankMouth = new MerchantRank({
    merchantRankName:'按月付费',
    description     :'按月付费,99元/月',
    price           :'99',
    isRecommend     :false
  });
  var merchantRankYear = new MerchantRank({
    merchantRankName:'按年付费',
    description     :'按年付费,999元/月',
    price           :'999',
    isRecommend     :true
  });
  var merchantRankMember = new MerchantRank({
    merchantRankName:'按会员数付费',
    description     :'999元/100会员.会员每增加100需要额外付费.',
    price           :'999',
    isRecommend     :false
  });
  var merchantRankOnce = new MerchantRank({
    merchantRankName:'固定付费',
    description     :'一次性付费,可以长期使用.如果需要额外服务,单独处理.',
    price           :'9999',
    isRecommend     :false
  });
  var objects_rank = [merchantRankMouth, merchantRankYear, merchantRankMember, merchantRankOnce];
  objects_rank.forEach(function (object) {
    object.save();
  });
};

var initGlobalSettingData = function () {
  var globalSetting = new GlobalSetting({
    settingName :'pointLargessExplain',
    description :'平台积分赠送说明',
    defaultValue:'平台积分赠送说明测试数据.'
  });
  globalSetting.save(function (err, new_globalSetting) {
    console.log('GlobalSetting save end.');
  });
};

var initData = function () {
  initAttributeDictionaryData();
  initMerchantRankData();
  initGlobalSettingData();
};

//初始化数据
initData();
