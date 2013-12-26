var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var commonSchemaPlugin = require('./CommonSchemaPlugin');

/**
 * 支付记录表
 * @type {Schema}
 */
var PaymentRecordSchema = new Schema({
  sellRecord  :{type:Schema.ObjectId, ref:'BaseSellRecord'}, //销售记录Id
  paymentKind :{type:Schema.ObjectId, ref:'PaymentKind'}, //支付方式Id
  amount      :{type:Number}, //付费金额
  currencyType:{type:String}, //货币类型
  account     :{type:String}, //账号
  bank        :{type:String}  //银行
});

PaymentRecordSchema.plugin(commonSchemaPlugin);

exports.PaymentRecord = mongoose.model('PaymentRecord', PaymentRecordSchema);