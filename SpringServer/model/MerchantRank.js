var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var commonSchemaPlugin = require('./CommonSchemaPlugin');

/**
 * 商户等级表
 * @type {Schema}
 */
var MerchantRankSchema = new Schema({
  merchantRankName:{type:String}, //商户等级名称
  description     :{type:String}, //商户等级描述信息
  price           :{type:Number, default:0}, //购买该商户类型需要的价格
  isRecommend     :{type:Boolean, default:false} //是否产品推荐
});
MerchantRankSchema.plugin(commonSchemaPlugin);

exports.MerchantRank = mongoose.model('MerchantRank', MerchantRankSchema);
