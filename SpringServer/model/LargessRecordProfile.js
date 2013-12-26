var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var BaseProfileSchema = require('./BaseProfile').BaseProfileSchema;
var extend = require('mongoose-schema-extend');

/**
 * 转赠记录扩展信息
 * @type {Schema}
 */
var LargessRecordProfileSchema = BaseProfileSchema.extend({
  largessRecord:{type:Schema.ObjectId, required:true, ref:'LargessRecord'} //转赠记录Id
});

exports.LargessRecordProfile = mongoose.model('LargessRecordProfile', LargessRecordProfileSchema);
