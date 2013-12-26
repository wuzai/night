var UserRank = require('../model/UserRank').UserRank;

//获取用户等级/如果不存在，则创建用户等级
var getUserRank = function (userRankName, description, callback) {
  UserRank.findOne({userRankName:userRankName}, function (err, userRank) {
    if (err) return callback(404, {error:err});
    if (userRank) {
      callback(200, {userRank:userRank});
    } else {
      var add_userRank = new UserRank({
        userRankName:userRankName,
        description :description
      });
      add_userRank.save(function (err, new_userRank) {
        if (err) return callback(404, {error:err});
        callback(200, {userRank:new_userRank});
      });
    }
  });
};

module.exports = {
  getUserRank:getUserRank
};