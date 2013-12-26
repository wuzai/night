var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var commonSchemaPlugin = require('./CommonSchemaPlugin');
var swiss = require('../utils/swiss-kit');

/**
 * 优惠券
 * @type {Schema}
 */
var CouponSchema = new Schema({
  couponName   :{type:String}, //优惠券名称
  description  :{type:String}, //优惠劵描述信息
  promptIntro  :{type:String}, //温馨提示
  serviceItem  :{type:Schema.ObjectId, ref:'ServiceItem'}, //服务项Id
  merchant     :{type:Schema.ObjectId, ref:'Merchant'}, //商户Id
  member       :{type:Schema.ObjectId, ref:'Member'}, //会员Id
  user         :{type:Schema.ObjectId, ref:'User'}, //持有人用户Id
  iconImage    :{type:String}, //优惠券图标
  prefix       :{type:String}, //优惠劵前缀
  quantity     :{type:Number, default:1}, //优惠劵数量(-1:使用无限制；0：已经使用；>1:未使用和剩余使用次数)
  pointApply   :{type:String, default:0}, //优惠劵申领需要扣除会员积分
  pointUsed    :{type:String, default:0}, //优惠劵使用需要扣除会员积分
  validFromDate:{type:Date, get:swiss.getNormalDate}, //有效开始日期
  validToDate  :{type:Date, get:swiss.getNormalDate}, //有效结束日期
  forbidden    :{type:Boolean, default:false}  //是否被禁用（true是禁用,用于转赠之后的状态标志）
});

CouponSchema.plugin(commonSchemaPlugin);

exports.Coupon = mongoose.model('Coupon', CouponSchema);
