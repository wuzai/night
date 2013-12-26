var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var commonSchemaPlugin = require('./CommonSchemaPlugin');

/**
 * 法人机构基本信息表
 * @type {Schema}
 */
var OrganizationSchema = new Schema({
  organizationName:{type:String}, //法人机构名称
  description     :{type:String}, //法人机构描述信息
  parent          :{type:Schema.ObjectId, ref:'Organization'}, //上级法人机构Id
  sortOrder       :{type:Number} //排序次序
});

OrganizationSchema.plugin(commonSchemaPlugin);

exports.Organization = mongoose.model('Organization', OrganizationSchema);