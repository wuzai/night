var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var commonSchemaPlugin = require('./CommonSchemaPlugin');

/**
 * 转赠记录表
 * @type {Schema}
 */
var LargessRecordSchema = new Schema({
  fromUser     :{type:Schema.ObjectId, ref:'User'}, //发送用户Id
  toUser       :{type:Schema.ObjectId, ref:'User'}, //接受用户Id
  memberService:{type:Schema.ObjectId, ref:'MemberService'}, //会员服务Id
  memberCard   :{type:Schema.ObjectId, ref:'MemberCard'}, //会员卡Id
  meteringCard :{type:Schema.ObjectId, ref:'MeteringCard'}, //计次卡Id
  coupon       :{type:Schema.ObjectId, ref:'Coupon'}, //优惠卷Id
  processStatus:{type:String, enum:['待接受', '已接受', '已取消', '已拒绝'], default:'待接受'}  //转赠过程状态
});

LargessRecordSchema.plugin(commonSchemaPlugin);

exports.LargessRecord = mongoose.model('LargessRecord', LargessRecordSchema);
