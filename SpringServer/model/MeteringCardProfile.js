var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var BaseProfileSchema = require('./BaseProfile').BaseProfileSchema;
var extend = require('mongoose-schema-extend');
/**
 * 计次卡扩展信息
 * @type {Schema}
 */
var MeteringCardProfileSchema = BaseProfileSchema.extend({
  meteringCard:{type:Schema.ObjectId, required:true, ref:'MeteringCard'} //计次卡Id
});

exports.MeteringCardProfile = mongoose.model('MeteringCardProfile', MeteringCardProfileSchema);
