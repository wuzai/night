var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var commonSchemaPlugin = require('./CommonSchemaPlugin');

/**
 * 员工基本信息表
 * @type {Schema}
 */
var EmployeeSchema = new Schema({
  organization:{type:Schema.ObjectId, ref:'Organization'}, //组织机构Id
  department  :{type:Schema.ObjectId, ref:'Department'}, //部门名称Id
  fullName    :{type:String}, //员工名称（全称）
  employeeCode:{type:String}, //员工代号
  sortOrder   :{type:Number}, //排序次序
  user        :{type:Schema.ObjectId, ref:'User'} //用户Id
});

EmployeeSchema.plugin(commonSchemaPlugin);

exports.Employee = mongoose.model('Employee', EmployeeSchema);
