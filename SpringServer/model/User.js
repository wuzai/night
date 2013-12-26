var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var swiss = require('../utils/swiss-kit');
var commonSchemaPlugin = require('./CommonSchemaPlugin');
var config = require('../config');

/**
 * 用户验证信息表
 * @type {Schema}
 */
var UserSchema = new Schema({
  application           :{type:Schema.ObjectId, ref:'Application'}, //应用系统Id
  userName              :{type:String}, //用户名
  nickName              :{type:String}, //昵称
  inviter               :{type:Schema.ObjectId, ref:'User'}, //邀请人
  passwordDigest        :{type:String}, //密码摘要
  hashFormat            :{type:String, default:'md5', enum:['sha1', 'md5', 'sha256', 'sha512']}, //密码摘要算法
  passwordSalt          :{type:String}, //密码干扰
  isApproved            :{type:Boolean}, //是否通过验证
  isLockedOut           :{type:Boolean}, //用户是否被锁定
  faceIcon              :{type:String}, //用户头像图标
  userRank              :{type:Schema.ObjectId, ref:'UserRank'}, //用户等级Id
  isPerfect             :{type:Boolean, default:false}, //用户是否填写资料
  lastActivityTime      :{type:Date, default:Date.now, get:swiss.getDetailDateTime}, //最后登录时间
  lastChangePasswordTime:{type:Date, default:Date.now, get:swiss.getDetailDateTime}, //最后修改密码时间
  gender :{type:String}, //用户性别
  birth :{type:String}, //用户生日
  email :{type:String}, //用户邮箱
  qqNum :{type:String}, //用户qq号
  location      :{
    longitude   :{type:Number}, //经度
    latitude    :{type:Number} //纬度
  }, //地理位置
  postImage     :[
    {
      url:{type:String} //展示图片路径
    }
  ] //展示图片列表
});

UserSchema.plugin(commonSchemaPlugin);

exports.User = mongoose.model('User', UserSchema);
