var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var commonSchemaPlugin = require('./CommonSchemaPlugin');

/**
 * 微信帐号与用户绑定表
 * @type {Schema}
 */
var WeiXinInUserSchema = new Schema({
  weiXinObject:{type:String, required:true, unique:true}, //绑定微信帐号的OpenID
  user        :{type:Schema.ObjectId, required:true, ref:'User'}  // 用户Id
});

WeiXinInUserSchema.plugin(commonSchemaPlugin);

exports.WeiXinInUser = mongoose.model('WeiXinInUser', WeiXinInUserSchema);