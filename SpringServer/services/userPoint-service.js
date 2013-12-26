var UserPoint = require('../model/UserPoint').UserPoint;
var PointHistory = require('../model/PointHistory').PointHistory;
var messageServer = require('./message-service');

/**
 * 获取用户平台积分/如果不存在，则创建
 * @param userId 用户Id
 * @param callback
 */
var getUserPoint = function (userId, callback) {
  UserPoint.findOne({user:userId}, function (err, userPoint) {
    if (err) return callback(404, {error:err});
    if (userPoint) {
      callback(200, {userPoint:userPoint});
    } else {
      var add_userPoint = new UserPoint({
        user              :userId,
        availablePoint    :0,
        unenforceablePoint:0,
        incomeSumPoint    :0,
        outgoSumPoint     :0
      });
      add_userPoint.save(function (err, new_userPoint) {
        if (err) return callback(404, {error:err});
        callback(200, {userPoint:new_userPoint});
      });
    }
  });
};

/**
 * 用户平台积分收入/支出
 * @param userId 用户Id
 * @param point 用户平台积分数
 * @param type 用type表示收支：1收入，-1支出
 * @param transactionType enum:['charge', 'invite', 'bonus', 'largess'，'use'，'exchange'], //交易类型[充值,邀请,奖励,赠送,使用,兑换]
 * @param callback
 */
var changeUserPoint = function (userId, point, type, transactionType, callback) {
  var point = Number(point);//积分数强制转化为浮点数
  point = point ? point : 0;
  getUserPoint(userId, function (status, result) {
    if (status === 200) {
      var userPoint = result.userPoint;
      if (type > 0) {
        //收入
        userPoint.availablePoint += point;
        userPoint.incomeSumPoint += point;
      } else if (type < 0) {
        //支出
        userPoint.availablePoint -= point;
        userPoint.outgoSumPoint += point;
      }
      userPoint.save(function (err, new_userPoint) {
        if (err) return callback(404, {error:err});
        //保存用户积分收支历史记录
        var pointHistory = new PointHistory({
          pointTo        :new_userPoint._id,
          transactionType:transactionType,
          addPoint       :type > 0 ? point : null,
          decPoint       :type < 0 ? point : null,
          surplusPoint   :new_userPoint.availablePoint
        });
        pointHistory.save();
        callback(200, {userPoint:new_userPoint});
      });
    } else {
      callback(status, result);
    }
  });
};

/**
 * 用户积分转赠
 * @param fromUserId 转赠人
 * @param toUserId 接收人
 * @param point 积分数
 * @param callback
 */
var userPointToUser = function (fromUserId, toUserId, point, callback) {
  var point = Number(point);//积分数强制转化为浮点数
  point = point ? point : 0;
  if (fromUserId.equals(toUserId)) {
    callback(403, {error:'积分不能转赠给自己.'});
    return;
  } else {
    getUserPoint(fromUserId, function (status, result) {
      if (status === 200) {
        var userPoint = result.userPoint;
        if (userPoint.availablePoint >= point) {
          changeUserPoint(fromUserId, point, -1, 'largess', function (status_outgo, result_outgo) {
            if (status_outgo === 200) {
              //发送信息给转赠人
              messageServer.userPointToUser_fromUser(fromUserId, toUserId, point, function (status_mf, result_mf) {
                console.log(result_mf);
              });
              changeUserPoint(toUserId, point, 1, 'largess', function (status_income, result_income) {
                if (status_income === 200) {
                  //发送信息给接收人
                  messageServer.userPointToUser_toUser(fromUserId, toUserId, point, function (status_mt, result_mt) {
                    console.log(result_mt);
                  });
                  callback(200, {userPoint:result_outgo.userPoint.availablePoint});
                } else {
                  callback(403, {error:'用户积分转赠失败(1).'});
                }
              });
            } else {
              callback(403, {error:'用户积分转赠失败(-1).'});
            }
          });
        } else {
          callback(403, {error:'用户积分不足.'});
        }
      } else {
        callback(status, result);
      }
    });
  }
};

/**
 * 获取用户平台积分的历史记录
 * @param userId 用户Id
 * @param callback
 */
var findUserPointHistory = function (userId, callback) {
  var transactionTypes = {charge:'充值', invite:'邀请', bonus:'奖励', largess:'赠送', use:'使用', exchange:'兑换'};
  UserPoint.findOne({user:userId}, '_id', function (err, userPoint) {
    if (err) return callback(404, {error:err});
    var pointHistoryList_data = [];
    if (userPoint) {
      PointHistory.find({pointTo:userPoint._id}).sort({createdAt:-1}).exec(function (err, pointHistoryList) {
        if (err) return callback(404, {error:err});
        for (var i in pointHistoryList) {
          var pointHistory = pointHistoryList[i];
          var pointHistory_data = {
            _id                :pointHistory._id,
            type               :'user',
            userId             :userId,
            transactionType    :pointHistory.transactionType,
            transactionTypeText:transactionTypes[pointHistory.transactionType],
            addPoint           :pointHistory.addPoint,
            decPoint           :pointHistory.decPoint,
            surplusPoint       :pointHistory.surplusPoint,
            createdAt          :pointHistory.createdAt
          };
          pointHistoryList_data.push(pointHistory_data);
        }
        callback(200, {pointHistorys:pointHistoryList_data});
      });
    } else {
      //如果积分未找到，返回[]记录
      callback(200, {pointHistorys:pointHistoryList_data});
    }
  });
};


module.exports = {
  getUserPoint        :getUserPoint,
  changeUserPoint     :changeUserPoint,
  userPointToUser     :userPointToUser,
  findUserPointHistory:findUserPointHistory
};