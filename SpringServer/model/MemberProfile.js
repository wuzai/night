var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var BaseProfileSchema = require('./BaseProfile').BaseProfileSchema;
var extend = require('mongoose-schema-extend');

/**
 * 会员扩展信息
 * @type {Schema}
 */
var MemberProfileSchema = BaseProfileSchema.extend({
  member:{type:Schema.ObjectId, required:true, ref:'Member'} //会员Id
});

exports.MemberProfile = mongoose.model('MemberProfile', MemberProfileSchema);
