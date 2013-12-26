var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var commonSchemaPlugin = require('./CommonSchemaPlugin');

/**
 * 用户对商户的评论
 * @type {Schema}
 */
var CommentSchema = new Schema({
  merchant     :{type:Schema.ObjectId, ref:'Merchant'}, //商户Id
  user         :{type:Schema.ObjectId, ref:'User'}, //会员Id
  commentType  :{type:String, enum:['评价', '咨询', '投诉']}, //评论类型
  commenterName:{type:String}, //评论人姓名
  content      :{type:String}, //评论内容
  rating       :{type:Number}  //评论星级
});

CommentSchema.plugin(commonSchemaPlugin);

exports.Comment = mongoose.model('Comment', CommentSchema);
