var config = require('../../config');
var webRoot_weixinapp = config.webRoot_weixinapp;
var ObjectId = require('mongoose').Types.ObjectId;
var Member = require('../../model/Member').Member;
var Merchant = require('../../model/Merchant').Merchant;
var userServer = require('../../services/user-service');
var memberServer = require('../../services/member-service');
var pointServer = require('../../services/point-service');
var userPointServer = require('../../services/userPoint-service');
var memberPointServer = require('../../services/memberPoint-service');
var merchantPointServer = require('../../services/merchantPoint-service');
var globalSettingServer = require('../../services/globalSetting-service');
var swiss = require('../../utils/swiss-kit');
var userWXService = require('./userWXService');

//获取积分的历史记录
var openPointHistoryList = function (req, res, next) {
  var query = req.query;
  var merchantId = query.merchantId;
  var FromUserName = query.FromUserName;
  var type = query.type;
  var userId = query.userId;
  if (type === 'user') {
    userPointServer.findUserPointHistory(userId, function (status_ph, result_ph) {
      if (status_ph === 200) {
        res.render('weixinapp/pointHistoryList', {merchantId:merchantId, FromUserName:FromUserName, type:type, pointHistorys:result_ph.pointHistorys});
      } else {
        req.session.messages = {error:[result_ph.error]};
        res.redirect([webRoot_weixinapp, '/error?merchantId=', merchantId, '&FromUserName=', FromUserName].join(''));
      }
    });
  } else if (type === 'merchant') {
    merchantPointServer.findMerchantPointHistory(merchantId, function (status_ph, result_ph) {
      if (status_ph === 200) {
        res.render('weixinapp/pointHistoryList', {merchantId:merchantId, FromUserName:FromUserName, type:type, pointHistorys:result_ph.pointHistorys});
      } else {
        req.session.messages = {error:[result_ph.error]};
        res.redirect([webRoot_weixinapp, '/error?merchantId=', merchantId, '&FromUserName=', FromUserName].join(''));
      }
    });
  } else if (type === 'member') {
    memberPointServer.findMemberPointHistory(userId, merchantId, function (status_ph, result_ph) {
      if (status_ph === 200) {
        res.render('weixinapp/pointHistoryList', {merchantId:merchantId, FromUserName:FromUserName, type:type, pointHistorys:result_ph.pointHistorys});
      } else {
        req.session.messages = {error:[result_ph.error]};
        res.redirect([webRoot_weixinapp, '/error?merchantId=', merchantId, '&FromUserName=', FromUserName].join(''));
      }
    });
  } else {
    req.session.messages = {error:['type is error']};
    res.redirect([webRoot_weixinapp, '/error?merchantId=', merchantId, '&FromUserName=', FromUserName].join(''));
  }
};

//用户积分合并/转赠
var userPointToUser = function (req, res, next) {
  var query = req.query;
  //转赠积分数
  var point = query.point;
  var fromUserId = new ObjectId(query.fromUserId);
  var toUserName = query.toUserName;
  if (swiss.isInteger(point) && Number(point) >= 0 ) {
    userServer.getUserByUserName(toUserName, function (status_user, result_user) {
      if (status_user === 200) {
        var toUser = result_user.user;
        userPointServer.userPointToUser(fromUserId, toUser._id, point, function (status_point, result_point) {
          if (status_point === 200) {
            res.json({status:200});
          } else {
            res.json({status:status_point, error:result_point.error});
          }
        })
      } else {
        res.json({status:status_user, error:result_user.error});
      }
    })
  } else {
    res.json({status:400, error:'输入积分不是整数，或积分小于0.'});
  }
};

//会员积分合并/转赠
var memberPointToMember = function (req, res, next) {
  var query = req.query;
  //转赠积分数
  var point = query.point;
  var fromMemberId = new ObjectId(query.fromMemberId);
  var toUserName = query.toUserName;
  if (swiss.isInteger(point) && Number(point) >= 0) {
    Member.findById(fromMemberId, 'merchant', function (err, member) {
      if (member && member.merchant) {
        memberServer.getMemberOfMerchantByUserName(toUserName, member.merchant, function (status_member, result_member) {
          if (status_member === 200) {
            var toMember = result_member.member;
            memberPointServer.memberPointToMember(fromMemberId, toMember._id, point, function (status_point, result_point) {
              if (status_point === 200) {
                res.json({status:200});
              } else {
                res.json({status:status_point, error:result_point.error});
              }
            })
          } else {
            res.json({status:status_member, error:result_member.error});
          }
        })
      } else {
        res.json({status:400, error:'未获取会员或商户信息数据.'});
      }
    });
  } else {
    res.json({status:400, error:'输入积分不是整数，或积分小于0.'});
  }
};

//会员积分兑换
var memberPointToUser = function (req, res) {
  var query = req.query;
  //兑换积分数
  var point = query.point;
  var memberId = query.memberId;
  if (swiss.isInteger(point) && Number(point)) {
    if(Number(point) > 0){
      pointServer.memberPointToUser(memberId, point, function (status_point, result_point) {
        if (status_point === 200) {
          res.json({status:200});
        } else {
          res.json({status:status_point, error:result_point.error});
        }
      });
    }else{
      res.json({status:400, error:'输入积分必须大于0.'});
    }
  } else {
    res.json({status:400, error:'输入积分不是整数，或积分为0.'});
  }
};

//我的积分页面
var openMyPointPage = function (req, res) {
  var query = req.query;
  var merchantId = query.merchantId;
  var FromUserName = query.FromUserName;
  var userId = query.userId;
  userWXService.getUserIdByFromUserName(merchantId, FromUserName, userId, function (status, result) {
    if (status === 200) {
      userId = result.userId;
      userPointServer.getUserPoint(userId, function (status_userPoint, result_userPoint) {
        var param = {
          memberId   :null,
          userPoint  :0,
          memberPoint:0
        };
        if (status_userPoint === 200) {
          param.userPoint = result_userPoint.userPoint ? result_userPoint.userPoint.availablePoint : 0;
        }
        memberPointServer.getMemberPointByUserAndMerchant(userId, merchantId, function (status_memberPoint, result_memberPoint) {
          if (status_memberPoint === 200) {
            param.memberPoint = result_memberPoint.memberPoint ? result_memberPoint.memberPoint.availablePoint : 0;
            param.memberId = result_memberPoint.memberId
          }
          res.render('weixinapp/myPointPage', {merchantId:merchantId, FromUserName:FromUserName, userId:userId, param:param});
        });
      });
    } else {
      req.session.messages = {error:[result.error]};
      res.redirect(result.errorUrl);
    }
  });
};

//贝壳积分兑换页面
var openMemberToUser = function (req, res) {
  var query = req.query;
  var merchantId = query.merchantId;
  var FromUserName = query.FromUserName;
  var userId = query.userId;
  Merchant.findById(merchantId).populate('logoImage', 'imageUrl').exec(function (err, merchant) {
    var param = {
      memberId   :null,
      maxChangePoint:0,//最多可兑换的贝客积分
      memberPoint:0,
      userPoint:0,
      imageUrl   :'/default/images/5zzg_logo.png'
    }
    memberPointServer.getMemberPointByUserAndMerchant(userId, merchantId, function (status_memberPoint, result_memberPoint) {
      if (status_memberPoint === 200) {
        param.memberPoint = result_memberPoint.memberPoint ? result_memberPoint.memberPoint.availablePoint : 0;
        param.memberId = result_memberPoint.memberId;
      }
      userPointServer.getUserPoint(userId, function (status_userPoint, result_userPoint) {
        if (status_userPoint === 200) {
          param.userPoint = result_userPoint.userPoint ? result_userPoint.userPoint.availablePoint : 0;
        }
        if(merchant.rate && Number(merchant.rate) && merchant.rate > 0){
          //最多可兑换的贝客积分
          param.maxChangePoint = Math.floor(param.memberPoint/merchant.rate);
        }
        res.render('weixinapp/point-memberToUser', {merchantId:merchantId, FromUserName:FromUserName, userId:userId, merchant:merchant, param:param});
      });
    });
  });
};

//会员积分转赠页面
var openMemberToMember = function (req, res) {
  var query = req.query;
  var merchantId = query.merchantId;
  var FromUserName = query.FromUserName;
  var userId = query.userId;
  Merchant.findById(merchantId).populate('logoImage', 'imageUrl').exec(function (err, merchant) {
    var memberPoint = 0;
    memberPointServer.getMemberPointByUserAndMerchant(userId, merchantId, function (status_memberPoint, result_memberPoint) {
      var param = {
        memberId   :null,
        memberPoint:memberPoint
      }
      if (status_memberPoint === 200) {
        param.memberPoint = result_memberPoint.memberPoint ? result_memberPoint.memberPoint.availablePoint : 0;
        param.memberId = result_memberPoint.memberId;
      }
      res.render('weixinapp/point-memberToMember', {merchantId:merchantId, FromUserName:FromUserName, userId:userId, merchant:merchant, param:param});
    });
  });
};

//贝壳积分转赠页面
var openUserToUser = function (req, res) {
  var query = req.query;
  var merchantId = query.merchantId;
  var FromUserName = query.FromUserName;
  var userId = query.userId;
  userPointServer.getUserPoint(userId, function (status_userPoint, result_userPoint) {
    var userPoint = 0;
    if (status_userPoint === 200) {
      userPoint = result_userPoint.userPoint ? result_userPoint.userPoint.availablePoint : 0;
    }
    globalSettingServer.getGlobalSettingBySettingName('pointLargessExplain', function (status_conf, result_conf) {
      var param = {
        userPoint          :userPoint,
        imageUrl           :'/default/images/5zzg_logo.png',
        pointLargessExplain:''
      }
      if (status_conf === 200) {
        param.pointLargessExplain = result_conf.defaultValue;
      }
      res.render('weixinapp/point-userToUser', {merchantId:merchantId, FromUserName:FromUserName, userId:userId, param:param});
    });
  });
};

module.exports = {
  openPointHistoryList      :openPointHistoryList,
  userPointToUser_weixin    :userPointToUser,
  memberPointToMember_weixin:memberPointToMember,
  memberPointToUser_weixin  :memberPointToUser,
  openMyPointPage           :openMyPointPage,
  openUserToUser            :openUserToUser,
  openMemberToMember        :openMemberToMember,
  openMemberToUser          :openMemberToUser
};