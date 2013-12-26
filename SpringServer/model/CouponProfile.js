var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var BaseProfileSchema = require('./BaseProfile').BaseProfileSchema;
var extend = require('mongoose-schema-extend');
/**
 * 优惠券扩展信息
 * @type {Schema}
 */
var CouponProfileSchema = BaseProfileSchema.extend({
  coupon:{type:Schema.ObjectId, required:true, ref:'CouponRecord'} //优惠卷Id
});

exports.CouponProfile = mongoose.model('CouponProfile', CouponProfileSchema);
