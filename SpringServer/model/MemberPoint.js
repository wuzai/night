var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var BasePointSchema = require('./BasePoint').BasePointSchema;
var extend = require('mongoose-schema-extend');

/**
 * 会员积分信息表
 * @type {Schema}
 */
var MemberPointSchema = BasePointSchema.extend({
  member:{type:Schema.ObjectId, ref:'Member'} //会员Id
});


exports.MemberPoint = mongoose.model('MemberPoint', MemberPointSchema);
