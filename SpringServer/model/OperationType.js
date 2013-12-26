var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var commonSchemaPlugin = require('./CommonSchemaPlugin');

/**
 * 资源的可用操作类型定义表
 * @type {Schema}
 */
var OperationTypeSchema = new Schema({
  operationTypeName:{type:String, enum:['新建', '修改', '查看', '删除']}, //操作类型名称
  description      :{type:String}   //操作描述
});

OperationTypeSchema.plugin(commonSchemaPlugin);

exports.OperationType = mongoose.model('OperationType', OperationTypeSchema);