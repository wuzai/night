var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var swiss = require('../utils/swiss-kit');
var commonSchemaPlugin = require('./CommonSchemaPlugin');

/**
 * 广告信息表
 * @type {Schema}
 */
var AdvertisementSchema = new Schema({
  title       :{type:String}, //标题
  postImage   :{type:Schema.ObjectId, ref:'ImageStore'}, //海报图片
  videoUrl    :{type:String}, //视频路径
  content     :{type:String}, //内容
  merchant    :{type:Schema.ObjectId, ref:'Merchant'}, //商户ID
  serviceItem :{type:Schema.ObjectId, ref:'ServiceItem'}, //服务项目ID
  showFromDate:{type:Date, default:Date.now, get:swiss.getNormalDate}, //首页展示开始日期
  showToDate  :{type:Date, default:Date.now, get:swiss.getNormalDate}, //首页展示结束日期
  fromDate    :{type:Date, default:Date.now, get:swiss.getNormalDate}, //二级页面展示开始日期
  toDate      :{type:Date, get:swiss.getNormalDate}, //二级页面展示结束日期
  isApproved  :{type:Boolean} //是否通过验证
});

AdvertisementSchema.plugin(commonSchemaPlugin);

exports.Advertisement = mongoose.model('Advertisement', AdvertisementSchema);
