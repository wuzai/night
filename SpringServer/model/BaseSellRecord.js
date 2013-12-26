var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var commonSchemaPlugin = require('./CommonSchemaPlugin');
var Merchant = require('./Merchant').Merchant;
var ServiceItem = require('./ServiceItem').ServiceItem;

/**
 * 销售记录基本表
 * @type {Schema}
 */
var BaseSellRecordSchema = new Schema({
  merchant   :{type:Schema.ObjectId, ref:'Merchant'}, //商户Id, 这里是购买方也可能是销售方
  serviceItem:{type:Schema.ObjectId, ref:'ServiceItem'}, //服务项目Id
  process    :{type:String, enum:['已下单', '待处理', '已完成', '已作废', '已取消']}, //进行步骤
  noPassTxt  :{type:String, trim:true}, //销售不通过理由（取消或作废理由）
  isSucceed  :{type:Boolean}, //是否完成销售
  count      :{type:Number}, //数量
  sum        :{type:Number}   //金额
}, {collection:'sellrecords', discriminatorKey:'_type'});

exports.BaseSellRecordSchema = BaseSellRecordSchema.plugin(commonSchemaPlugin);
exports.BaseSellRecord = mongoose.model('BaseSellRecord', BaseSellRecordSchema);