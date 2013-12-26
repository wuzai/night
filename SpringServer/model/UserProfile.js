var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var BaseProfileSchema = require('./BaseProfile').BaseProfileSchema;
var extend = require('mongoose-schema-extend');
/**
 * 用户信息扩展表，绑定到属性字典
 * @type {Schema}
 */
var UserProfileSchema = BaseProfileSchema.extend({
  user:{type:Schema.ObjectId, required:true, ref:'User'} //用户Id
});

exports.UserProfile = mongoose.model('UserProfile', UserProfileSchema);
