var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var BaseProfileSchema = require('./BaseProfile').BaseProfileSchema;
var extend = require('mongoose-schema-extend');

/**
 * 服务项目详细信息扩展表（可以包含会员权益等信息）
 * @type {Schema}
 */
var ServiceItemProfileSchema = BaseProfileSchema.extend({
  serviceItem:{type:Schema.ObjectId, required:true, ref:'ServiceItem'} //服务项目Id
});

exports.ServiceItemProfile = mongoose.model('ServiceItemProfile', ServiceItemProfileSchema);
