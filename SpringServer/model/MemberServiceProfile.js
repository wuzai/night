var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var BaseProfileSchema = require('./BaseProfile').BaseProfileSchema;
var extend = require('mongoose-schema-extend');
/**
 * 会员服务扩展信息
 * @type {Schema}
 */
var MemberServiceProfileSchema = BaseProfileSchema.extend({
  memberService:{type:Schema.ObjectId, required:true, ref:'MemberService'} //会员服务Id
});

exports.MemberServiceProfile = mongoose.model('MemberServiceProfile', MemberServiceProfileSchema);