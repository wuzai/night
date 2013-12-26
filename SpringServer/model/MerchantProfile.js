var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var BaseProfileSchema = require('./BaseProfile').BaseProfileSchema;
var extend = require('mongoose-schema-extend');
/**
 * 商户扩展信息表
 * @type {Schema}
 */
var MerchantProfileSchema = BaseProfileSchema.extend({
  merchant:{type:Schema.ObjectId, required:true, ref:'Merchant'} //会员卡Id
});

exports.MerchantProfile = mongoose.model('MerchantProfile', MerchantProfileSchema);
