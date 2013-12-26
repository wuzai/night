var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var swiss = require('../utils/swiss-kit');
var commonSchemaPlugin = require('./CommonSchemaPlugin');

/**
 * 积分历史记录
 * @type {Schema}
 */
var PointHistorySchema = new Schema({
  pointTo        :{type:Schema.ObjectId, ref:'BasePoint'}, //谁的积分
  transactionType:{type:String, enum:['charge', 'invite', 'bonus', 'largess', 'use', 'exchange']}, //交易类型[充值,邀请,奖励,赠送,使用,兑换]
  paymentRecord  :{type:Schema.ObjectId, ref:'PaymentRecord'}, //支付记录
  sellRecord     :{type:Schema.ObjectId, ref:'SellRecord'}, //销售记录
  addPoint       :{type:Number}, //增加积分
  decPoint       :{type:Number}, //消耗积分
  surplusPoint   :{type:Number}, //剩余积分（余额）
  isTakeEffected :{type:Boolean, default:true}, //是否已经生效
  availableDate  :{type:Date, default:Date.now, get:swiss.getNormalDate} //积分生效日期
});

PointHistorySchema.plugin(commonSchemaPlugin);

exports.PointHistory = mongoose.model('PointHistory', PointHistorySchema);
