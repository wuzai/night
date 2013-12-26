var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var swiss = require('../utils/swiss-kit');

/**
 * 公共属性
 * 注：state状态
 * [0000-0000-0000:正常使用状态/启用状态]
 * [0000-0000-1111:禁用状态]
 * [0000-1111-0000:已使用状态]
 * [1111-0000-0000:待审核状态]
 * [1111-1111-1111:已删除状态]
 * @type {Function}
 */
module.exports = exports = function commonFieldsPlugin(schema) {
  schema.add({
    createdAt:{type:Date, default:Date.now, get:swiss.getDetailDateTime}, //创建时间
    updatedAt:{type:Date, default:Date.now, get:swiss.getDetailDateTime}, //更新时间
    state    :{type:String, default:'0000-0000-0000'}, //状态
    remark   :{type:String} //备注
  });

  schema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
  });
};