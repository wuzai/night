var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var commonSchemaPlugin = require('./CommonSchemaPlugin');

/**
 * 消费记录表
 * @type {Schema}
 */
var ConsumeRecordSchema = new Schema({
  member       :{type:Schema.ObjectId, ref:'Member'}, //会员Id
  memberService:{type:Schema.ObjectId, ref:'MemberService'}, //会员服务Id
  memberCard   :{type:Schema.ObjectId, ref:'MemberCard'}, //会员卡Id
  meteringCard :{type:Schema.ObjectId, ref:'MeteringCard'}, //计次卡Id
  coupon       :{type:Schema.ObjectId, ref:'Coupon'}, //优惠卷Id
  process      :{type:String, enum:['已下单', '待处理', '已完成', '已作废', '已取消', '已删除']} //进行步骤
});

ConsumeRecordSchema.plugin(commonSchemaPlugin);

exports.ConsumeRecord = mongoose.model('ConsumeRecord', ConsumeRecordSchema);
