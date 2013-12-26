var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var commonSchemaPlugin = require('./CommonSchemaPlugin');

/**
 * 图片存储表
 * @type {Schema}
 */
var ImageStoreSchema = new Schema({
  imageUrl    :{type:String}, //图片路径
  retinaUrl   :{type:String}, //高清图路径
  smallUrl    :{type:String}, //小图路径
  thumbnailUrl:{type:String}  //缩略图路径
});

ImageStoreSchema.plugin(commonSchemaPlugin);

exports.ImageStore = mongoose.model('ImageStore', ImageStoreSchema);
