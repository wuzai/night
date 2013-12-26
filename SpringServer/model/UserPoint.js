var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var BasePointSchema = require('./BasePoint').BasePointSchema;
var extend = require('mongoose-schema-extend');

/**
 * 用户积分信息表
 * @type {Schema}
 */
var UserPointSchema = BasePointSchema.extend({
  user:{type:Schema.ObjectId, ref:'User'} //用户Id
});


exports.UserPoint = mongoose.model('UserPoint', UserPointSchema);
