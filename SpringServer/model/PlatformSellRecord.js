var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var BaseSellRecordSchema = require('./BaseSellRecord').BaseSellRecordSchema;
var extend = require('mongoose-schema-extend');

/* 平台的销售记录表
 * @type {Schema}
 */
var PlatformSellRecordSchema = BaseSellRecordSchema.extend({
  //TO BE DEFINED.
});


exports.PlatformSellRecord = mongoose.model('PlatformSellRecord', PlatformSellRecordSchema);