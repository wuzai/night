var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var BaseProfileSchema = require('./BaseProfile').BaseProfileSchema;
var extend = require('mongoose-schema-extend');
/**
 * 会员卡扩展信息
 * @type {Schema}
 */
var MemberCardProfileSchema = BaseProfileSchema.extend({
  memberCard:{type:Schema.ObjectId, required:true, ref:'MemberCard'} //会员卡Id
});

exports.MemberCardProfile = mongoose.model('MemberCardProfile', MemberCardProfileSchema);
