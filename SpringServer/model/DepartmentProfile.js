var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var BaseProfileSchema = require('./BaseProfile').BaseProfileSchema;
var extend = require('mongoose-schema-extend');
/**
 * 部门扩展信息表
 * @type {Schema}
 */
var DepartmentProfileSchema = BaseProfileSchema.extend({
  department:{type:Schema.ObjectId, required:true, ref:'Department'} //部门Id
});

exports.DepartmentProfile = mongoose.model('DepartmentProfile', DepartmentProfileSchema);
