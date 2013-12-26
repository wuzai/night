var Member = require('../model/Member').Member;
var MerchantProfile = require('../model/MerchantProfile').MerchantProfile;
var UserCellphoneRecord = require('../model/UserCellphoneRecord').UserCellphoneRecord;
var swiss = require('../utils/swiss-kit');
var memberPointServer = require('./memberPoint-service');
var messageServer = require('./message-service');
var userServer = require('./user-service');
var userCellphoneRecordServer = require('./userCellphoneRecord-service');

/**
 * 获取商户下所有未删除的会员列表
 * @param merchantId 商户Id
 * @param callback
 */
var findMemberListAllByMerchantId = function (merchantId, callback) {
  Member.find({merchant:merchantId, state:{ $nin:['1111-1111-1111'] } }).sort({updatedAt:-1}).populate('memberRank', 'memberRankName').populate('user', 'userName faceIcon').populate('merchant', '_id merchantName').exec(function (err, memberList) {
    var memberList_data = [];
    var memberLen = memberList.length;

    function memberLoop(i) {
      if (i < memberLen) {
        var member = memberList[i];
        var member_data = {
          _id       :member._id,
          memberRank:member.memberRank,
          user      :member.user,
          merchant  :member.merchant,
          memberCode:member.memberCode,
          amount    :member.amount,
          createdAt :member.createdAt,
          updatedAt :member.updatedAt,
          state     :member.state,
          remark    :member.remark
        };
        memberPointServer.getMemberPoint(member._id, function (status, result) {
          member_data.memberPoint = 0;
          if (status === 200) {
            member_data.memberPoint = result.memberPoint.availablePoint;
          }
          memberList_data.push(member_data);
          memberLoop(i + 1);
        })
      } else {
        callback(200, {members:memberList_data});
      }
    }

    memberLoop(0);
  });
};

/**
 * 获取商户下的会员启用状态的会员列表
 * @param merchantId 商户Id
 * @param callback
 */
var findMemberListByMerchantId = function (merchantId, callback) {
  Member.find({merchant:merchantId, state:'0000-0000-0000'}).sort({updatedAt:-1}).populate('memberRank', 'memberRankName').populate('user', 'userName faceIcon').populate('merchant', '_id merchantName').exec(function (err, memberList) {
    var memberList_data = [];
    var memberLen = memberList.length;

    function memberLoop(i) {
      if (i < memberLen) {
        var member = memberList[i];
        var member_data = {
          _id       :member._id,
          memberRank:member.memberRank,
          user      :member.user,
          merchant  :member.merchant,
          memberCode:member.memberCode,
          amount    :member.amount,
          createdAt :member.createdAt,
          updatedAt :member.updatedAt,
          state     :member.state,
          remark    :member.remark
        };
        memberPointServer.getMemberPoint(member._id, function (status, result) {
          member_data.memberPoint = 0;
          if (status === 200) {
            member_data.memberPoint = result.memberPoint.availablePoint;
          }
          memberList_data.push(member_data);
          memberLoop(i + 1);
        })
      } else {
        callback(200, {members:memberList_data});
      }
    }

    memberLoop(0);
  });
};

/**
 * 获取商户下的最近新增的number个会员
 * @param merchantId 商户Id
 * @param number 最近多少会员数
 * @param callback
 */
var findMemberListOfNewByMerchantId = function (merchantId, number, callback) {
  Member.find({merchant:merchantId, state:'0000-0000-0000'}).sort({updatedAt:-1}).limit(number).populate('memberRank', 'memberRankName').populate('user', 'userName faceIcon').populate('merchant', '_id merchantName').exec(function (err, memberList) {
    var memberList_data = [];
    var memberLen = memberList.length;

    function memberLoop(i) {
      if (i < memberLen) {
        var member = memberList[i];
        var member_data = member;
        memberPointServer.getMemberPoint(member._id, function (status, result) {
          member_data.memberPoint = 0;
          if (status === 200) {
            member_data.memberPoint = result.memberPoint.availablePoint;
          }
          memberList_data.push(member_data);
          memberLoop(i + 1);
        })
      } else {
        callback(200, {members:memberList_data});
      }
    }

    memberLoop(0);
  });
};

/**
 * 创建某一商户下的会员
 * @param merchantId 商户Id
 * @param userId 用户Id
 * @param callback
 */
var createMemberOfMerchant = function (merchantId, userId, callback) {
  if(merchantId&&userId){
    Member.findOne({merchant:merchantId, user:userId}, function (err, member) {
      if (err) return callback(404, {error:err});
      if (!member) {
        //会员不存在（需要创建会员）
        var new_member = new Member();
        new_member.merchant = merchantId;
        new_member.user = userId;
        new_member.save(function (err, new_member) {
          //通过merchantId获取用户注册会员，商户赠送的积分数
          MerchantProfile.find({_type:'MerchantProfile', merchant:merchantId}).populate('attribute').exec(function (err, attrs) {
            if (err) return callback(404, {error:err});
            var attrJson = swiss.findProfileToJSON(attrs);
            var point = attrJson.regPoint ? attrJson.regPoint : 0;
            //如果创建会员,商户需要赠送积分
            if (point && point > 0) {
              memberPointServer.changeMemberPoint(new_member._id, point, 1, 'largess', function (status_point, result_point) {
                if (status_point === 200) {
                  var memberPoint = result_point.memberPoint;
                  //发送信息告知用户成为某商户会员，赠送积分XXX
                  messageServer.createMember(userId, merchantId, point, function (status_m, result_m) {
                    console.log(result_m);
                  });
                }
                callback(200, {member:new_member});
              });
            } else {
              //发送信息告知用户成为某商户会员
              messageServer.createMember(userId, merchantId, point, function (status_m, result_m) {
                console.log(result_m);
              });
              callback(200, {member:new_member});
            }
          });
        });
      } else {
        callback(200, {member:member});
      }
    });
  }else{
    callback(400, {error:'未获取到相关数据.'});
  }
};

/**
 * 通过商户Id和用户Id获取该商户的会员信息
 * @param merchantId
 * @param userId
 * @param callback
 */
var getMemberByMerchantAndUser = function (merchantId, userId, callback) {
  Member.findOne({merchant:merchantId, user:userId}, function (err, member) {
    if (err) return callback(404, {error:err});
    if (member) {
      if (member.state === '0000-0000-0000') {
        callback(200, {member:member});
      } else {
        callback(400, {error:'该商户会员已被删除或禁用.'});
      }
    } else {
      callback(404, {error:'用户不是该商户的会员.'});
    }
  });
};

/**
 * 统计商户下的会员数量
 * @param merchantId
 * @param callback
 */
var countMembersByMerchantId = function (merchantId, callback) {
  var memberNum = 0;
  Member.count({merchant:merchantId, state:'0000-0000-0000'}, function (err, count) {
    if (!err) {
      memberNum = count;
    }
    callback(200, {count:memberNum});
  });
};

/**
 * 通过会员Id获取会员信息
 * @param memberId
 * @param callback
 */
var getMemberByMemberId = function (memberId, callback) {
  Member.findById(memberId).populate('user', 'userName faceIcon').populate('memberRank').exec(function (err, member) {
    var member_data = member;
    memberPointServer.getMemberPoint(memberId, function (status_point, result_point) {
      member_data.memberPoint = 0;
      if (status_point === 200) {
        member_data.memberPoint = result_point.memberPoint.availablePoint;
      }
      callback(200, {member:member_data});
    });
  });
};

/**
 * 通过用户绑定电话号码获取某商户的会员
 * @param telephone
 * @param merchantId
 * @param callback
 */
var getMemberOfMerchantByTelephone = function (telephone, merchantId, callback) {
  userCellphoneRecordServer.getUserIdByTelephone(telephone, function (status_userId, result_userId) {
    if (status_userId === 200) {
      var userCellphoneRecord = result_userId.userCellphoneRecord;
      getMemberByMerchantAndUser(merchantId, userCellphoneRecord.user, function (status_member, result_member) {
        if (status_member === 200) {
          callback(200, {member:result_member.member});
        } else {
          callback(status_member, {error:result_member.error});
        }
      });
    } else {
      callback(status_userId, {error:result_userId.error});
    }
  });
};

/**
 * 通过用户名获取某商户的会员
 * @param telephone
 * @param merchantId
 * @param callback
 */
var getMemberOfMerchantByUserName = function (userName, merchantId, callback) {
  userServer.getUserByUserName(userName, function (status_user, result_user) {
    if (status_user === 200) {
      var user = result_user.user;
      getMemberByMerchantAndUser(merchantId, user._id, function (status_member, result_member) {
        if (status_member === 200) {
          callback(200, {member:result_member.member});
        } else {
          callback(status_member, {error:result_member.error});
        }
      });
    } else {
      callback(status_user, {error:result_user.error});
    }
  });
};

module.exports = {
  getMemberByMemberId            :getMemberByMemberId,
  createMemberOfMerchant         :createMemberOfMerchant,
  countMembersByMerchantId       :countMembersByMerchantId,
  findMemberListByMerchantId     :findMemberListByMerchantId,
  getMemberByMerchantAndUser     :getMemberByMerchantAndUser,
  findMemberListAllByMerchantId  :findMemberListAllByMerchantId,
  findMemberListOfNewByMerchantId:findMemberListOfNewByMerchantId,
  getMemberOfMerchantByUserName  :getMemberOfMerchantByUserName,
  getMemberOfMerchantByTelephone :getMemberOfMerchantByTelephone
};

