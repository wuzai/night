var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var commonSchemaPlugin = require('./CommonSchemaPlugin');

/**
 * 支付方式表
 * @type {Schema}
 */
var PaymentKindSchema = new Schema({
  paymentKindName:{type:String}, //支付方式名称
  description    :{type:String}  //支付方式描述信息
});

PaymentKindSchema.plugin(commonSchemaPlugin);

exports.PaymentKind = mongoose.model('PaymentKind', PaymentKindSchema);