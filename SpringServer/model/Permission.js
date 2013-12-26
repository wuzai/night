var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var commonSchemaPlugin = require('./CommonSchemaPlugin');

/**
 * 资源操作许可定义表
 * @type {Schema}
 */
var PermissionSchema = new Schema({
  resource       :{type:Schema.ObjectId, ref:'Resource'}, //资源Id
  allowOperations:[
    {type:String}
  ], //允许操作项
  allowTimeSpan  :{type:String}  //允许进行操作的时间段
});

PermissionSchema.plugin(commonSchemaPlugin);

exports.Permission = mongoose.model('Permission', PermissionSchema);