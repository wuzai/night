var MemberPoint = require('../model/MemberPoint').MemberPoint;
var Member = require('../model/Member').Member;
var PointHistory = require('../model/PointHistory').PointHistory;
var messageServer = require('./message-service');

/**
 * 获取会员积分/如果不存在，则创建
 * @param memberId 会员Id
 * @param callback
 */
var getMemberPoint = function (memberId, callback) {
  MemberPoint.findOne({member:memberId}, function (err, memberPoint) {
    if (err) return callback(404, {error:err});
    if (memberPoint) {
      callback(200, {memberPoint:memberPoint});
    } else {
      var add_memberPoint = new MemberPoint({
        member            :memberId,
        availablePoint    :0,
        unenforceablePoint:0,
        incomeSumPoint    :0,
        outgoSumPoint     :0
      });
      add_memberPoint.save(function (err, new_memberPoint) {
        if (err) return callback(404, {error:err});
        callback(200, {memberPoint:new_memberPoint});
      });
    }
  });
};

/**
 * 会员积分收入/支出
 * @param memberId 会员Id
 * @param point 会员积分数
 * @param type 用type表示收支：1收入，-1支出
 * @param transactionType enum:['charge', 'invite', 'bonus', 'largess'，'use'，'exchange'], //交易类型[充值,邀请,奖励,赠送,使用,兑换]
 * @param callback
 */
var changeMemberPoint = function (memberId, point, type, transactionType, callback) {
  var point = Number(point);//积分数强制转化为浮点数
  point = point ? point : 0;
  getMemberPoint(memberId, function (status, result) {
    if (status === 200) {
      var memberPoint = result.memberPoint;
      if (type > 0) {
        //收入
        memberPoint.availablePoint += point;
        memberPoint.incomeSumPoint += point;
      } else if (type < 0) {
        //支出
        memberPoint.availablePoint -= point;
        memberPoint.outgoSumPoint += point;
      }
      memberPoint.save(function (err, new_memberPoint) {
        if (err) return callback(404, {error:err});
        //保存会员积分收支历史记录
        var pointHistory = new PointHistory({
          pointTo        :new_memberPoint._id,
          transactionType:transactionType,
          addPoint       :type > 0 ? point : null,
          decPoint       :type < 0 ? point : null,
          surplusPoint   :new_memberPoint.availablePoint
        });
        pointHistory.save();
        callback(200, {memberPoint:new_memberPoint});
      });
    } else {
      callback(status, result);
    }
  });
};

/**
 * 会员积分转赠
 * @param fromUserId 转赠人
 * @param toUserId 接收人
 * @param point 积分数
 * @param callback
 */
var memberPointToMember = function (fromMemberId, toMemberId, point, callback) {
  var point = Number(point);//积分数强制转化为浮点数
  point = point ? point : 0;
  if (fromMemberId.equals(toMemberId)) {
    callback(403, {error:'积分不能转赠给自己.'});
    return;
  } else {
    getMemberPoint(fromMemberId, function (status, result) {
      if (status === 200) {
        var memberPoint = result.memberPoint;
        if (memberPoint.availablePoint >= point) {
          changeMemberPoint(fromMemberId, point, -1, 'largess', function (status_outgo, result_outgo) {
            if (status_outgo === 200) {
              //发送信息给转赠人
              messageServer.memberPointToMember_fromMember(fromMemberId, toMemberId, point, function (status_mf, result_mf) {
                console.log(result_mf);
              });
              changeMemberPoint(toMemberId, point, 1, 'largess', function (status_income, result_income) {
                if (status_income === 200) {
                  //发送信息给接收人
                  messageServer.memberPointToMember_toMember(fromMemberId, toMemberId, point, function (status_mt, result_mt) {
                    console.log(result_mt);
                  });
                  callback(200, {memberPoint:result_outgo.memberPoint.availablePoint});
                } else {
                  callback(403, {error:'会员积分转赠失败(1).'});
                }
              });
            } else {
              callback(403, {error:'会员积分转赠失败(-1).'});
            }
          });
        } else {
          callback(403, {error:'会员积分不足.'});
        }
      } else {
        callback(status, result);
      }
    });
  }
};

/**
 * 根据用户Id和商户Id，获取该用户在该商户下的会员积分
 * @param userId
 * @param merchantId
 * @param callback
 */
var getMemberPointByUserAndMerchant = function (userId, merchantId, callback) {
  Member.findOne({user:userId, merchant:merchantId}, '_id user merchant', function (err, member) {
    if (err) return callback(404, {error:err});
    if (member) {
      getMemberPoint(member._id, function (status_point, result_point) {
        if (status_point === 200) {
          callback(200, {memberId:member._id, memberPoint:result_point.memberPoint});
        } else {
          callback(status_point, {error:result_point.error});
        }
      });
    } else {
      callback(400, {error:'商户的会员数据未找到.'});
    }
  });
};

//获取会员积分的历史记录
var findMemberPointHistory = function (userId, merchantId, callback) {
  var transactionTypes = {charge:'充值', invite:'邀请', bonus:'奖励', largess:'赠送', use:'使用', exchange:'兑换'};
  Member.findOne({user:userId, merchant:merchantId}, '_id user merchant', function (err, member) {
    if (err) return callback(404, {error:err});
    if (member) {
      MemberPoint.findOne({member:member._id}, '_id', function (err, memberPoint) {
        if (err) return callback(404, {error:err});
        var pointHistoryList_data = [];
        if (memberPoint) {
          PointHistory.find({pointTo:memberPoint._id}).sort({createdAt:-1}).exec(function (err, pointHistoryList) {
            if (err) return callback(404, {error:err});
            for (var i in pointHistoryList) {
              var pointHistory = pointHistoryList[i];
              var pointHistory_data = {
                _id                :pointHistory._id,
                userId             :member.user,
                merchantId         :member.merchant,
                type               :'member',
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
    } else {
      callback(400, {error:'商户的会员数据未找到.'});
    }
  });
};

module.exports = {
  getMemberPoint                 :getMemberPoint,
  getMemberPointByUserAndMerchant:getMemberPointByUserAndMerchant,
  changeMemberPoint              :changeMemberPoint,
  memberPointToMember            :memberPointToMember,
  findMemberPointHistory         :findMemberPointHistory
};