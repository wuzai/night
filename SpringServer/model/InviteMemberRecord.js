var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var commonSchemaPlugin = require('./CommonSchemaPlugin');

/**
 * 推荐商户记录表
 * @type {Schema}
 */
var InviteMemberRecordSchema = new Schema({
  inviter     :{type:Schema.ObjectId, ref:'User'}, //发送用户Id
  userName    :{type:String}, //用户名称（电话）
  user        :{type:Schema.ObjectId, ref:'User'}, //如果成功，用户记录Id
  inviteStatus:{type:String, enum:['待确认', '已确认', '已取消', '已拒绝'], default:'待确认'}  //邀请状态
});

InviteMemberRecordSchema.plugin(commonSchemaPlugin);

exports.InviteMemberRecord = mongoose.model('InviteMemberRecord', InviteMemberRecordSchema);
