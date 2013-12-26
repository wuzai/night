var config = require('../config');
var mongoose = require('mongoose');
var LargessRecord = require('../model/LargessRecord').LargessRecord;


//连接MongoDB数据库
if (!mongoose.connection || (mongoose.connection.readyState == 0)) {
  mongoose.connect(config.db);
}

//修正服务的相关属性
var correctionLargessRecord = function () {
  LargessRecord.update({processStatus:'待接受'}, {processStatus:'已取消'}, { multi:true }, function (err, number) {
    console.log('The number of updated documents was %d', number);
  });
};

var init_data = function () {
  correctionLargessRecord();
};

init_data();



