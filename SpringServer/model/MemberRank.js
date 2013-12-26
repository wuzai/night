var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var commonSchemaPlugin = require('./CommonSchemaPlugin');

/**
 * 会员等级表
 * @type {Schema}
 */
var MemberRankSchema = new Schema({
  memberRankName:{type:String}, //会员等级名称
  description   :{type:String}  //会员等级描述信息
});

MemberRankSchema.plugin(commonSchemaPlugin);

exports.MemberRank = mongoose.model('MemberRank', MemberRankSchema);

