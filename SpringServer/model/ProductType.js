var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var commonSchemaPlugin = require('./CommonSchemaPlugin');

/**
 * 产品类型表
 * @type {Schema}
 */
var ProductTypeSchema = new Schema({
  parent    :{type:Schema.ObjectId, ref:'Product'},//父级id
  merchant    :{type:Schema.ObjectId, ref:'Merchant'}, //商户ID
  title       :{type:String}, //名称
  intro     :{type:String} //介绍
});

ProductTypeSchema.plugin(commonSchemaPlugin);

exports.ProductType = mongoose.model('ProductType', ProductTypeSchema);
