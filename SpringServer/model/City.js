var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var commonSchemaPlugin = require('./CommonSchemaPlugin');

/**
 * 区域表。市
 * @type {Schema}
 */
var CitySchema = new Schema({
  fatherID:{type:Number}, //省级ID
  cityID  :{type:Number}, //市级ID
  city    :{type:String} //市级名称
});


CitySchema.plugin(commonSchemaPlugin);

exports.City = mongoose.model('City', CitySchema);
