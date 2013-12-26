var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var BaseSellRecordSchema = require('./BaseSellRecord').BaseSellRecordSchema;
var extend = require('mongoose-schema-extend');
var Member = require('./Member').Member;


/* 商户的销售记录表
 * @type {Schema}
 */
var SellRecordSchema = BaseSellRecordSchema.extend({
  member:{type:Schema.ObjectId, ref:'Member'} //会员Id
});

exports.SellRecord = mongoose.model('SellRecord', SellRecordSchema);
