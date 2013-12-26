var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var BasePointSchema = require('./BasePoint').BasePointSchema;
var extend = require('mongoose-schema-extend');

/**
 * 商户积分信息表
 * @type {Schema}
 */
var MerchantPointSchema = BasePointSchema.extend({
  merchant:{type:Schema.ObjectId, ref:'Merchant'} //商户Id
});

exports.MerchantPoint = mongoose.model('MerchantPoint', MerchantPointSchema);
