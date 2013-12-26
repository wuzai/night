var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var BaseProfileSchema = require('./BaseProfile').BaseProfileSchema;
var extend = require('mongoose-schema-extend');

/**
 * 赠品活动扩展信息表
 * @type {Schema}
 */
var GiftProfileSchema = BaseProfileSchema.extend({
  gift:{type:Schema.ObjectId, required:true, ref:'Gift'} //赠品活动Id
});

exports.GiftProfile = mongoose.model('GiftProfile', GiftProfileSchema);
