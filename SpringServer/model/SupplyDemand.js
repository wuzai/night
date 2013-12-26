var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var commonSchemaPlugin = require('./CommonSchemaPlugin');
var swiss = require('../utils/swiss-kit');

/**
 * 资源供需信息表
 * @type {Schema}
 */
var SupplyDemandSchema = new Schema({
  merchant   :{type:Schema.ObjectId, ref:'Merchant'}, //所属商户Id
  title      :{type:String}, //资源供需标题
  description:{type:String}, //资源供需描述信息
  type       :{type:String, enum:['供应', '需求']}, //资源供需类型【供应/需求】
  fromDate   :{type:Date, get:swiss.getNormalDate}, //有效开始日期
  toDate     :{type:Date, get:swiss.getNormalDate} //有效结束日期
});

SupplyDemandSchema.plugin(commonSchemaPlugin);

exports.SupplyDemand = mongoose.model('SupplyDemand', SupplyDemandSchema);
