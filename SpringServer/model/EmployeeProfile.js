var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var BaseProfileSchema = require('./BaseProfile').BaseProfileSchema;
var extend = require('mongoose-schema-extend');
/**
 * 员工扩展信息表
 * @type {Schema}
 */
var EmployeeProfileSchema = BaseProfileSchema.extend({
  employee:{type:Schema.ObjectId, required:true, ref:'Employee'} //员工Id
});

exports.EmployeeProfile = mongoose.model('EmployeeProfile', EmployeeProfileSchema);
