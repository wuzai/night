var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var commonSchemaPlugin = require('./CommonSchemaPlugin');

/**
 * 用户和用户分组映射表
 * @type {Schema}
 */
var MerchantInMerchantSchema = new Schema({
  merchant   :{type:Schema.ObjectId, required:true, ref:'Merchant'}, //商户Id
  subMerchant:{type:Schema.ObjectId, required:true, ref:'Merchant'}  //关联子商户Id
});
MerchantInMerchantSchema.plugin(commonSchemaPlugin);

exports.MerchantInMerchant = mongoose.model('MerchantInMerchant', MerchantInMerchantSchema);