var util = require('util');
var Member = require('../model/Member').Member;
var merchantServer = require('./merchant-service');
var memberPointServer = require('./memberPoint-service');
var userPointServer = require('./userPoint-service');
var messageServer = require('./message-service');

/**
 * 会员积分兑换为用户平台积分
 * @param memberId 会员Id
 * @param point 兑换的平台积分数
 * @param callback
 */
var memberPointToUser = function (memberId, point, callback) {
  var point = Number(point);//积分数强制转化为浮点数
  point = point ? point : 0;
  Member.findById(memberId, 'merchant user', function (err, member) {
    if (member && member.merchant && member.user) {
      merchantServer.getMerchantById(member.merchant, function (status_merchant, result_merchant) {
        if (status_merchant === 200) {
          var merchant = result_merchant.merchant;
          if (merchant.rate && Number(merchant.rate) && merchant.rate > 0) {
            var user_point = point;//要兑换的用户平台的积分数
            var member_point = user_point * merchant.rate;//所需要的商户会员积分数
            memberPointServer.getMemberPoint(memberId, function (status_point, result_point) {
              if (status_point === 200) {
                var memberPoint = result_point.memberPoint;//获取会员的可用积分
                if (memberPoint.availablePoint >= member_point) {
                  memberPointServer.changeMemberPoint(memberId, member_point, -1, 'exchange', function (status_outgo, result_outgo) {
                    if (status_outgo === 200) {
                      //积分兑换发送信息(会员积分减少发送信息)
                      messageServer.memberPointToUser_fromMember(merchant._id, member.user, member_point, user_point, function (status_fm, result_fm) {
                        console.log(result_fm);
                      });
                      userPointServer.changeUserPoint(member.user, user_point, 1, 'exchange', function (status_income, result_income) {
                        if (status_income === 200) {
                          //积分兑换发送信息（用户积分增加发送信息）
                          messageServer.memberPointToUser_toUser(merchant._id, member.user, member_point, user_point, function (status_tu, result_tu) {
                            console.log(result_tu);
                          });
                          callback(200, {});
                        } else {
                          callback(403, {error:'会员积分兑换失败(1).'});
                        }
                      });
                    } else {
                      callback(403, {error:'会员积分兑换失败(-1).'});
                    }
                  });
                } else {
                  var text = util.format('会员积分不足.兑换%s个用户积分,需要该商户%s个会员积分.', user_point, member_point);
                  callback(403, {error:text});
                }
              } else {
                callback(status_point, {error:result_point.error});
              }
            });
          } else {
            callback(400, {error:'该商户不支持积分兑换功能.'});
          }
        } else {
          callback(status_merchant, {error:result_merchant.error});
        }
      });
    } else {
      callback(404, {error:'未获取到会员信息,或会员数据错误'});
    }
  })
};

/**
 * 用户平台积分兑换为会员积分
 * @param memberId 会员Id
 * @param point 兑换的平台积分数
 * @param callback
 */
var userPointToMember = function (memberId, point, callback) {
  var point = Number(point);//积分数强制转化为浮点数
  point = point ? point : 0;//要兑换的商户会员积分数
  Member.findById(memberId, 'merchant user', function (err, member) {
    if (member && member.merchant && member.user) {
      merchantServer.getMerchantById(member.merchant, function (status_merchant, result_merchant) {
        if (status_merchant === 200) {
          var merchant = result_merchant.merchant;
          if (merchant.rate && Number(merchant.rate) && merchant.rate > 0) {
            var user_point = Math.ceil(point / merchant.rate);//所需要的用户平台的积分数
            var member_point = user_point * merchant.rate;//所需要的用户平台的积分数可以兑换的会员积分
            var userId = member.user;
            userPointServer.getUserPoint(userId, function (status_point, result_point) {
              if (status_point === 200) {
                var userPoint = result_point.userPoint;//获取会员的可用积分
                if (userPoint.availablePoint >= user_point) {
                  userPointServer.changeUserPoint(userId, user_point, -1, 'exchange', function (status_outgo, result_outgo) {
                    if (status_outgo === 200) {
                      //积分兑换发送信息(用户平台积分减少发送消息)
                      messageServer.userPointToMember_fromUser(merchant._id, userId, member_point, user_point, function (status_fu, result_fu) {
                        console.log(result_fu);
                      });
                      memberPointServer.changeMemberPoint(memberId, member_point, 1, 'exchange', function (status_income, result_income) {
                        if (status_income === 200) {
                          //积分兑换发送信息（会员积分增加发送消息）
                          messageServer.userPointToMember_toMember(merchant._id, userId, member_point, user_point, function (status_tm, result_tm) {
                            console.log(result_tm);
                          });
                          callback(200, {});
                        } else {
                          callback(403, {error:'用户平台积分兑换失败(1).'});
                        }
                      });
                    } else {
                      callback(403, {error:'用户平台积分兑换失败(-1).'});
                    }
                  });
                } else {
                  var text = util.format('平台积分不足.兑换该商户%s个会员积分,至少需要%s个用户积分.', member_point, user_point);
                  callback(403, {error:text});
                }
              } else {
                callback(status_point, {error:result_point.error});
              }
            });
          } else {
            callback(400, {error:'该商户不支持积分兑换功能.'});
          }
        } else {
          callback(status_merchant, {error:result_merchant.error});
        }
      });
    } else {
      callback(404, {error:'未获取到会员信息,或会员数据错误'});
    }
  })
};

module.exports = {
  userPointToMember:userPointToMember,
  memberPointToUser:memberPointToUser
};