var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var commonSchemaPlugin = require('./CommonSchemaPlugin');

/**
 * 区域表。省
 * @type {Schema}
 */
var ProvinceSchema = new Schema({
  provinceID:{type:Number}, //省级ID
  province  :{type:String} //省级名称
});

ProvinceSchema.plugin(commonSchemaPlugin);

exports.Province = mongoose.model('Province', ProvinceSchema);
