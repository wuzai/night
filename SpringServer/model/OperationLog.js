var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var swiss = require('../utils/swiss-kit');
var commonSchemaPlugin = require('./CommonSchemaPlugin');

/**
 * 操作日志表
 * @type {Schema}
 */
var OperationLogSchema = new Schema({
  operation    :{type:String}, //操作
  entityName   :{type:String}, //对应数据实体
  entityPk     :[
    {type:String}
  ], //对应数据记录主键字段
  fields       :{type:String}, //操作字段
  oldValues    :{type:String}, //操作之前的旧值
  newValues    :{type:String}, //操作之后的新值
  operator     :{type:Schema.ObjectId, ref:'User'}, //操作者Id
  operationTime:{type:Date, default:Date.now, get:swiss.getDetailDateTime}, //操作时间
  ipAddress    :{type:String}, //IP地址
  detailInfo   :{type:String} //详细信息
});

OperationLogSchema.plugin(commonSchemaPlugin);

exports.OperationLog = mongoose.model('OperationLog', OperationLogSchema);