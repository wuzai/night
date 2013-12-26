var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var commonSchemaPlugin = require('./CommonSchemaPlugin');

/**
 * 单位部门信息表
 * @type {Schema}
 */
var DepartmentSchema = new Schema({
  departmentName:{type:String}, //部门名称
  organization  :{type:Schema.ObjectId, ref:'Organization'}, //法人机构Id
  description   :{type:String}, //描述信息
  parent        :{type:Schema.ObjectId, ref:'Department'}, //上级部门Id
  sortOrder     :{type:Number}  //排序次序
});

DepartmentSchema.plugin(commonSchemaPlugin);

exports.Department = mongoose.model('Department', DepartmentSchema);
