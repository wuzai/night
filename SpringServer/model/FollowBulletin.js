var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var swiss = require('../utils/swiss-kit');
var commonSchemaPlugin = require('./CommonSchemaPlugin');

/**
 * 论坛帖子回复表
 * @type {Schema}
 */
var FollowBulletinSchema = new Schema({
  bulletin:{type:Schema.ObjectId, ref:'Bulletin'}, //主题ID
  parentFollowBulletin:{type:Schema.ObjectId, ref:'FollowBulletin'}, //回复ID
  content :{type:String, trim:true}, //回复内容
  postImages :{type:String, trim:true},//
  user  :{type:Schema.ObjectId, ref:'User'} //用户ID
});

FollowBulletinSchema.plugin(commonSchemaPlugin);

exports.FollowBulletin = mongoose.model('FollowBulletin', FollowBulletinSchema);
