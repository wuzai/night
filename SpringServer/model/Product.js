var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var commonSchemaPlugin = require('./CommonSchemaPlugin');

/**
 * 产品介绍表
 * @type {Schema}
 */
var ProductSchema = new Schema({
  merchant    :{type:Schema.ObjectId, ref:'Merchant'}, //商户ID
  title       :{type:String}, //名称
  intro     :{type:String}, //介绍
  originalPrice     :{type:String},//单价
  privilegePrice     :{type:String},//优惠价
  productType :{type:Schema.ObjectId, ref:'ProductType'},//类型
  imageView     :[
    {
      url:{type:String}, //展示图片路径
      txt:{type:String, trim:true} //展示图片说明
    }
  ] //展示图片
});

ProductSchema.plugin(commonSchemaPlugin);

exports.Product = mongoose.model('Product', ProductSchema);
