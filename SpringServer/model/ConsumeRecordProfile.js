var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var BaseProfileSchema = require('./BaseProfile').BaseProfileSchema;
var extend = require('mongoose-schema-extend');
/**
 * 消费记录扩展信息
 * @type {Schema}
 */
var ConsumeRecordProfileSchema = BaseProfileSchema.extend({
  consumeRecord:{type:Schema.ObjectId, required:true, ref:'ConsumeRecord'} //消费记录Id
});

exports.ConsumeRecordProfile = mongoose.model('ConsumeRecordProfile', ConsumeRecordProfileSchema);
