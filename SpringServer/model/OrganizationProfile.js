var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var BaseProfileSchema = require('./BaseProfile').BaseProfileSchema;
var extend = require('mongoose-schema-extend');
/**
 * 法人机构扩展信息表
 * @type {Schema}
 */
var OrganizationProfileSchema = BaseProfileSchema.extend({
  organization:{type:Schema.ObjectId, required:true, ref:'Organization'} //法人机构Id
});

exports.OrganizationProfile = mongoose.model('OrganizationProfile', OrganizationProfileSchema);
