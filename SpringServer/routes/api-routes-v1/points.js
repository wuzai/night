var ObjectId = require('mongoose').Types.ObjectId;
var Member = require('../../model/Member').Member;
var userServer = require('../../services/user-service');
var memberServer = require('../../services/member-service');
var pointServer = require('../../services/point-service');
var userPointServer = require('../../services/userPoint-service');
var memberPointServer = require('../../services/memberPoint-service');
var merchantPointServer = require('../../services/merchantPoint-service');
var swiss = require('../../utils/swiss-kit');

//获取积分的历史记录
var findPointRecord = function (req, res, next) {
  var query = req.query;
  var type = query.type;
  var user_id = query.user_id;
  var merchant_id = query.merchant_id;
  var userId = new ObjectId(user_id);
  var merchantId = new ObjectId(merchant_id);
  if (type === 'user') {
    userPointServer.findUserPointHistory(userId, function (status_ph, result_ph) {
      if (status_ph === 200) {
        res.json(200, result_ph.pointHistorys);
      } else {
        res.json(status_ph, {errors:result_ph.error});
      }
    });
  } else if (type === 'merchant') {
    merchantPointServer.findMerchantPointHistory(merchantId, function (status_ph, result_ph) {
      if (status_ph === 200) {
        res.json(200, result_ph.pointHistorys);
      } else {
        res.json(status_ph, {errors:result_ph.error});
      }
    });
  } else if (type === 'member') {
    memberPointServer.findMemberPointHistory(userId, merchantId, function (status_ph, result_ph) {
      if (status_ph === 200) {
        res.json(200, result_ph.pointHistorys);
      } else {
        res.json(status_ph, {errors:result_ph.error});
      }
    });
  } else {
    res.json(400, {errors:'type is error'});
  }
};

//用户积分合并/转赠
var userPointToUser = function (req, res, next) {
  var body = req.body;
  //转赠积分数
  var point = body.point;
  var fromUserId = new ObjectId(body.fromUser_id);
  var toUserName = body.toUserName;
  if (swiss.isInteger(point) && Number(point)) {
    userServer.getUserByUserName(toUserName, function (status_user, result_user) {
      if (status_user === 200) {
        var toUser = result_user.user;
        userPointServer.userPointToUser(fromUserId, toUser._id, point, function (status_point, result_point) {
          if (status_point === 200) {
            res.json(200, {user:{_id:fromUserId, userPoint:result_point.userPoint}});
          } else {
            res.json(status_point, {errors:result_point.error});
          }
        })
      } else {
        res.json(status_user, {errors:result_user.error});
      }
    })
  } else {
    res.json(400, {errors:'输入积分不是整数，或积分为0.'});
  }
};

//会员积分合并/转赠
var memberPointToMember = function (req, res, next) {
  var body = req.body;
  //转赠积分数
  var point = body.point;
  var fromMemberId = new ObjectId(body.fromMember_id);
  var toUserName = body.toUserName;
  if (swiss.isInteger(point) && Number(point)) {
    Member.findById(fromMemberId, 'merchant', function (err, member) {
      if (member && member.merchant) {
        memberServer.getMemberOfMerchantByUserName(toUserName, member.merchant, function (status_member, result_member) {
          if (status_member === 200) {
            var toMember = result_member.member;
            memberPointServer.memberPointToMember(fromMemberId, toMember._id, point, function (status_point, result_point) {
              if (status_point === 200) {
                res.json(200, {member:{_id:fromMemberId, memberPoint:result_point.memberPoint}});
              } else {
                res.json(status_point, {errors:result_point.error});
              }
            })
          } else {
            res.json(status_member, {errors:result_member.error});
          }
        })
      } else {
        res.json(400, {errors:'未获取会员或商户信息数据.'});
      }
    });
  } else {
    res.json(400, {errors:'输入积分不是整数，或积分为0.'});
  }
};

//会员积分兑换
var memberPointToUser = function (req, res, next) {
  var body = req.body;
  //兑换积分数
  var point = body.point;
  var memberId = body.member_id;
  if (swiss.isInteger(point) && Number(point)) {
    pointServer.memberPointToUser(memberId, point, function (status_point, result_point) {
      if (status_point === 200) {
        res.json(200, {});
      } else {
        res.json(status_point, {errors:result_point.error});
      }
    });
  } else {
    res.json(400, {errors:'输入积分不是整数，或积分为0.'});
  }
};

module.exports = {
  findPointRecord    :findPointRecord,
  userPointToUser    :userPointToUser,
  memberPointToMember:memberPointToMember,
  memberPointToUser  :memberPointToUser
};