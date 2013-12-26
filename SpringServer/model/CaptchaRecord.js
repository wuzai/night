var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var commonSchemaPlugin = require('./CommonSchemaPlugin');

/**
 * 验证码记录表
 * @type {Schema}
 */
var CaptchaRecordSchema = new Schema({
  captcha    :{type:String}, //验证码
  cellphone  :{type:String}, //手机号码
  captchaType:{ type:String, trim:true, default:'用户注册', enum:['用户注册', '使用', '找回密码']}, //验证码类型
  hasUsed    :{type:Boolean, default:false} //是否已经使用过
});

CaptchaRecordSchema.plugin(commonSchemaPlugin);

exports.CaptchaRecord = mongoose.model('CaptchaRecord', CaptchaRecordSchema);
