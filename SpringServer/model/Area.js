var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var commonSchemaPlugin = require('./CommonSchemaPlugin');

/**
 * 区域表。省-市-县区
 * @type {Schema}
 */
var AreaSchema = new Schema({
  fatherID:{type:Number}, //市级ID
  areaID  :{type:Number}, //县区级ID
  area    :{type:String} //县区名称
});

AreaSchema.plugin(commonSchemaPlugin);

exports.Area = mongoose.model('Area', AreaSchema);
