var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var swiss = require('../utils/swiss-kit');
var commonSchemaPlugin = require('./CommonSchemaPlugin');

/**
 * 论坛帖子信息表
 * @type {Schema}
 */
var BulletinSchema = new Schema({
  title:{type:String, trim:true},//标题
  user  :{type:Schema.ObjectId, ref:'User'}, //用户ID
  content:{type:String, trim:true},//内容
  postImages :{type:String, trim:true}
});

BulletinSchema.plugin(commonSchemaPlugin);

exports.Bulletin = mongoose.model('Bulletin', BulletinSchema);
