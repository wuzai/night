var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var swiss = require('../utils/swiss-kit');
var commonSchemaPlugin = require('./CommonSchemaPlugin');

/**
 * 服务项目
 * @type {Schema}
 */
var ServiceItemSchema = new Schema({
  serviceSet       :{type:Schema.ObjectId, ref:'ServiceSet'}, //服务套餐Id
  serviceItemName  :{type:String}, //服务项目名称
  serviceItemType  :{type:String, enum:['MemberCard', 'Coupon', 'MeteringCard', 'PromotionActivity', 'Gift', 'StoreCard', 'Discount', 'GroupOn', 'Voucher']}, //服务项目类型[会员卡、优惠券、计次卡、促销活动、赠品活动、储蓄卡、折扣卡、团购、代金券]
  serviceItemNumber:{type:Number}, //服务项目数量/积分/次数等
  description      :{type:String}, //服务详情描述信息
  ruleText         :{type:String}, //使用说明
  applyExplain     :{type:String}, //申领说明
  isMemberOnly     :{type:Boolean}, //是否仅限于会员
  isMinMemberPoint     :{type:Boolean}, //是否只有会员积分超过2000才可以参与(仅限于希斯杰商户)
  isRequireApply   :{type:Boolean}, //是否需要申请
  isApplicable     :{type:Boolean}, //用户可否申请，也就是必须由商户开通
  isUseUserPoint   :{type:Boolean}, //是否可使用平台积分
  isRequireAudit   :{type:Boolean}, //是否需要商户审核
  isRepeatApply    :{type:Boolean}, //是否可重复申领
  allowApplyNumber :{type:Number}, //最多可申领多少次
  allowMemberRanks :[
    {type:Schema.ObjectId, ref:'MemberRank'}
  ], //允许会员等级类型
  usableStores     :[
    {type:Schema.ObjectId, ref:'Store'}
  ], //可用的门店
  fromDate         :{type:Date, get:swiss.getNormalDate}, //开始日期
  toDate           :{type:Date, get:swiss.getNormalDate}, //结束日期
  allowLargess     :{type:Boolean}, //是否允许转赠
  allowShare       :{type:Boolean}, //是否允许分享
  postImage        :{type:Schema.ObjectId, ref:'ImageStore'} //活动项目海报图片
});

ServiceItemSchema.plugin(commonSchemaPlugin);

exports.ServiceItem = mongoose.model('ServiceItem', ServiceItemSchema);