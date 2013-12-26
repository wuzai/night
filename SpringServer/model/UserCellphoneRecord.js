var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var commonSchemaPlugin = require('./CommonSchemaPlugin');

/**
 * 用户绑定手机号码记录表
 * @type {Schema}
 */
var UserCellphoneRecordSchema = new Schema({
  user     :{type:Schema.ObjectId, ref:'User'}, //发送用户Id
  cellphone:{type:String}, //手机号码
  isUsing  :{type:Boolean}  //是否目前在用
});

UserCellphoneRecordSchema.plugin(commonSchemaPlugin);

exports.UserCellphoneRecord = mongoose.model('UserCellphoneRecord', UserCellphoneRecordSchema);
