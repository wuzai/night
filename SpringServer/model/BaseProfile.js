var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var commonSchemaPlugin = require('./CommonSchemaPlugin');

/**
 * 公共继承类
 * @type {Schema}
 */
var BaseProfileSchema = new Schema({
  attribute:{type:Schema.ObjectId, required:true, ref:'AttributeDictionary'}, //扩展属性Id
  value    :{type:String} //扩展属性值
}, {collection:'profiles', discriminatorKey:'_type'});

exports.BaseProfileSchema = BaseProfileSchema.plugin(commonSchemaPlugin);
exports.BaseProfile = mongoose.model('BaseProfile', BaseProfileSchema);