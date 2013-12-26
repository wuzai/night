var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var commonSchemaPlugin = require('./CommonSchemaPlugin');

/**
 * 新闻信息表
 * @type {Schema}
 */
var NewsInfoSchema = new Schema({
  title       :{type:String}, //标题、新闻标题
  subhead       :{type:String}, //副标题
  content     :{type:String}, //内容
  contentType:{ type:String}, //内容类型
  source:{ type:String}, //来源、新闻作者
  newsType:{ type:String, trim:true, default:'hotNews', enum:['hotNews', 'fashionNews']}, //新闻类型：热点新闻；时尚新闻
  postImage     :[
    {
      url:{type:String}, //展示图片路径
      txt:{type:String, trim:true} //展示图片说明
    }
  ] //新闻展示图
});

NewsInfoSchema.plugin(commonSchemaPlugin);

exports.NewsInfo = mongoose.model('NewsInfo', NewsInfoSchema);
