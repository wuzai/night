var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var commonSchemaPlugin = require('./CommonSchemaPlugin');

/**
 * 服务套餐
 * @type {Schema}
 */
var ServiceSetSchema = new Schema({
  merchant      :{type:Schema.ObjectId, ref:'Merchant'}, //商户Id
  serviceSetName:{type:String}, //服务套餐名称
  isEnabled     :{type:Boolean}, //是否启用
  isApproved    :{type:Boolean}, //是否通过验证
  description   :{type:String}  //描述信息
});

ServiceSetSchema.plugin(commonSchemaPlugin);

exports.ServiceSet = mongoose.model('ServiceSet', ServiceSetSchema);