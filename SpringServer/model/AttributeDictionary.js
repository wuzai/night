var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var commonSchemaPlugin = require('./CommonSchemaPlugin');

/**
 * 扩展属性字典表
 * @type {Schema}
 */
var AttributeDictionarySchema = new Schema({
  category         :{type:String, trim:true, required:true}, //属性类别
  attributeName    :{type:String, trim:true, required:true}, //属性名称
  description      :{type:String}, //属性描述信息
  isEnabled        :{type:Boolean}, //是否启用/禁用
  isRequired       :{type:Boolean}, //是否是必须的
  verifyRegex      :{type:String}, //验证规则
  choiceList       :[
    {type:String}
  ], //备选项列表
  isEditable       :{type:Boolean}, //是否可编辑
  isMultiSelectable:{type:Boolean}, //是否可多选
  defaultValue     :{type:String}, //默认值
  bindTable        :{type:String}, //所属表
  bindPKFields     :{type:String}, //所属公共键字段
  sortOrder        :{type:Number}, //排序次序
  isEncrypt        :{type:Boolean}//是否加密
});
AttributeDictionarySchema.index({ category:1, attributeName:1 }, { unique:true });

AttributeDictionarySchema.plugin(commonSchemaPlugin);

exports.AttributeDictionary = mongoose.model('AttributeDictionary', AttributeDictionarySchema);
