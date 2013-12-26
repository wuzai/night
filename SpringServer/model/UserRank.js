var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var commonSchemaPlugin = require('./CommonSchemaPlugin');

/**
 * 用户等级表
 * @type {Schema}
 */
var UserRankSchema = new Schema({
  userRankName:{type:String}, //用户等级名称
  description :{type:String}  //用户等级描述信息
});
UserRankSchema.plugin(commonSchemaPlugin);

exports.UserRank = mongoose.model('UserRank', UserRankSchema);
