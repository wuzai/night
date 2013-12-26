var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var commonSchemaPlugin = require('./CommonSchemaPlugin');

/**
 * 微信公共帐号与商户绑定表
 * @type {Schema}
 */
var WeiXinInMerchantSchema = new Schema({
  weiXinObject:{type:String, required:true, unique:true}, //绑定微信公共帐号原始Id
  merchant    :{type:Schema.ObjectId, required:true, unique:true, ref:'Merchant'} // 用户Id
});

WeiXinInMerchantSchema.plugin(commonSchemaPlugin);

exports.WeiXinInMerchant = mongoose.model('WeiXinInMerchant', WeiXinInMerchantSchema);