var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var commonSchemaPlugin = require('./CommonSchemaPlugin');

/**
 * 门店基本信息表
 * @type {Schema}
 */
var StoreSchema = new Schema({
  merchant      :{type:Schema.ObjectId, ref:'Merchant'}, //所属商户Id
  storeName     :{type:String}, //门店名称
  description   :{type:String}, //门店描述信息
  telephone     :{type:String}, //门店电话
  telPrincipal  :{type:String}, //门店负责人电话
  isPublicTel   :{type:Boolean}, //是否公开门店负责人电话
  address       :{type:String}, //门店地址
  slogan        :{type:String}, //标语
  squareImage   :{type:String}, //方图
  rectangleImage:{type:String}, //长图
  vipImage      :{type:String}, //卡图
  imageView     :[
    {
      url:{type:String}, //展示图片路径
      txt:{type:String, trim:true} //展示图片说明
    }
  ], //门店展示图片列表
  location      :{
    longitude   :{type:Number}, //经度
    latitude    :{type:Number}, //纬度
    relevantText:{type:String} //位置相关内容
  }  //地理位置
});

StoreSchema.plugin(commonSchemaPlugin);

exports.Store = mongoose.model('Store', StoreSchema);
