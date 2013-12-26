var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var commonSchemaPlugin = require('./CommonSchemaPlugin');
var swiss = require('../utils/swiss-kit');

/**
 * 会员服务基本信息（memberServiceType、memberServiceNumber、Status、Point、Amount、RemainC）
 * @type {Schema}
 */
var MemberServiceSchema = new Schema({
  memberServiceName  :{type:String}, //会员服务名称
  memberServiceType  :{type:String, required:true}, //会员服务类型
  memberServiceNumber:{type:Number}, //会员服务数量/次数/积分
  description        :{type:String}, //会员服务描述信息
  promptIntro        :{type:String}, //温馨提示
  iconImage          :{type:String}, //会员服务（卡/券）图标
  serviceItem        :{type:Schema.ObjectId, ref:'ServiceItem'}, //服务项目ID
  merchant           :{type:Schema.ObjectId, ref:'Merchant'}, //商户ID
  member             :{type:Schema.ObjectId, ref:'Member'}, //持有人会员Id
  user               :{type:Schema.ObjectId, ref:'User'}, //持有人用户Id
  validFromDate      :{type:Date, get:swiss.getNormalDate}, //有效开始日期
  validToDate        :{type:Date, get:swiss.getNormalDate}, //有效结束日期
  forbidden          :{type:Boolean, default:false}  //是否被禁用（true是禁用,用于转赠之后的状态标志）
});

MemberServiceSchema.plugin(commonSchemaPlugin);

exports.MemberService = mongoose.model('MemberService', MemberServiceSchema);


