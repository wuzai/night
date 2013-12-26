var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var commonSchemaPlugin = require('./CommonSchemaPlugin');
var config = require('../config');
var MerchantRank = require('./MerchantRank').MerchantRank;

/**
 * 商户基本信息表
 * @type {Schema}
 */
var MerchantSchema = new Schema({
  merchantName  :{type:String}, //商户名称
  merchantType       :{type:String}, //商户类型
  description   :{type:String}, //描述信息或标语
  customerPhone :[
    {type:String}
  ], //客服电话
  telPrincipal  :{value:{type:String}, isPublic:{type:Boolean}}, //商户负责人电话
  logoImage     :{type:String}, //logo图片Url
  webSite       :{type:String}, //商户网站
  postImage     :[
    {
      url:{type:String}, //展示图片路径
      txt:{type:String, trim:true} //展示图片说明
    }
  ], //商户展示图片列表
  address       :{type:String}, //商户地址
  location      :{
    province       :{type:String}, //省
    city       :{type:String}, //市
    area       :{type:String}, //县/区
    street       :{type:String}, //街道
    longitude   :{type:Number}, //经度
    latitude    :{type:Number}, //纬度
    relevantText:{type:String} //位置相关内容
  }, //地理位置
  creator       :{type:Schema.ObjectId, ref:'User'}, //商户的创建人Id,
  intro   :{type:String}//商户介绍
});

MerchantSchema.plugin(commonSchemaPlugin);

exports.Merchant = mongoose.model('Merchant', MerchantSchema);

exports.MerchantTypeList = ['KTV','酒吧','夜总会','足疗','按摩','茶/咖','桑拿','养生','推拿','影城','代驾','其他'];
