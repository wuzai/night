var config = require('../../config');
var webRoot_weixinapp = config.webRoot_weixinapp;
var Member = require('../../model/Member').Member;
var memberServer = require('../../services/member-service');
var memberPointServer = require('../../services/memberPoint-service');
var memberCardServer = require('../../services/memberCard-service');
var couponServer = require('../../services/coupon-service');
var meteringCardServer = require('../../services/meteringCard-service');
var memberServiceServer = require('../../services/memberService-service');
var largessRecordServer = require('../../services/largessRecord-service');
var userWXService = require('./userWXService');

//获取某一会员下的所有服务
var getMemberServiceListByMemberId = function (req, res, next) {
  var query = req.query;
  var merchantId = query.merchantId;
  var FromUserName = query.FromUserName;
  var userId = query.userId;
  userWXService.getUserIdByFromUserName(merchantId, FromUserName, userId, function (status, result) {
    if (status === 200) {
      userId = result.userId;
      memberServer.createMemberOfMerchant(merchantId, userId, function (status_m, result_m) {
        if (status_m === 200) {
          var member = result_m.member;
          if (member) {
            var memberId = member._id;
            var member_data = {
              merchantId    :merchantId,
              FromUserName  :FromUserName,
              userId        :userId,
              member        :{
                _id        :memberId,
                memberPoint:0
              },
              memberServices:[]
            };
            //获取会员积分
            memberPointServer.getMemberPoint(memberId, function (status_point, result_point) {
              if (status_point === 200) {
                var memberPoint = result_point.memberPoint;
                member_data.member.memberPoint = memberPoint == null ? 0 : memberPoint.availablePoint;
                memberCardServer.findMemberCardListByMemberId(memberId, function (status_memberCards, result_memberCards) {
                  if (status_memberCards === 200) {
                    member_data.memberServices = member_data.memberServices.concat(result_memberCards.memberCards);
                  }
                  couponServer.findCouponListByMemberId(memberId, function (status_coupons, result_coupons) {
                    if (status_coupons === 200) {
                      member_data.memberServices = member_data.memberServices.concat(result_coupons.coupons);
                    }
                    meteringCardServer.findMeteringCardListByMemberId(memberId, function (status_meteringCards, result_meteringCards) {
                      if (status_meteringCards === 200) {
                        member_data.memberServices = member_data.memberServices.concat(result_meteringCards.meteringCards);
                      }
                      memberServiceServer.findMemberServiceListByMemberId(memberId, function (status_memberServices, result_memberServices) {
                        if (status_memberServices === 200) {
                          member_data.memberServices = member_data.memberServices.concat(result_memberServices.memberServices);
                        }
                        res.render('weixinapp/memberServiceList', member_data);
                      })
                    });
                  });
                });
              }
            });
          } else {
            req.session.messages = {error:['未获取商户会员信息']};
            res.redirect([webRoot_weixinapp, '/error?merchantId=', merchantId , '&FromUserName=', FromUserName].join(''));
          }
        } else {
          req.session.messages = {error:[result_m.error]};
          res.redirect([webRoot_weixinapp, '/error?merchantId=', merchantId , '&FromUserName=', FromUserName].join(''));
        }
      });
    } else {
      req.session.messages = {error:[result.error]};
      res.redirect(result.errorUrl);
    }
  });
};

/**
 * 会员服务数据处理
 * @param memberServiceId
 * @param type
 * @param callback
 */
var getMemberServiceData = function (memberServiceId, type, callback) {
  if (type) {
    if (type === 'MemberCard') {
      memberCardServer.getMemberCardById(memberServiceId, function (status_memberCard, result_memberCard) {
        callback(status_memberCard, {memberService:result_memberCard.memberCard, error:result_memberCard.error});
      });
    } else if (type === 'Coupon') {
      couponServer.getCouponById(memberServiceId, function (status_coupon, result_coupon) {
        callback(status_coupon, {memberService:result_coupon.coupon, error:result_coupon.error});
      });
    } else if (type === 'MeteringCard') {
      meteringCardServer.getMeteringCardById(memberServiceId, function (status_meteringCard, result_meteringCard) {
        callback(status_meteringCard, {memberService:result_meteringCard.meteringCard, error:result_meteringCard.error});
      });
    } else {
      memberServiceServer.getMemberServiceById(memberServiceId, function (status_memberService, result_memberService) {
        callback(status_memberService, {memberService:result_memberService.memberService, error:result_memberService.error});
      });
    }
  } else {
    callback(400, {error:'参数传递错误.'});
  }
};

//我的会员服务列表
var openMyMemberServiceInfo = function (req, res) {
  var query = req.query;
  var merchantId = query.merchantId;
  var FromUserName = query.FromUserName;
  var memberServiceId = query.memberServiceId;
  var type = query.type;
  getMemberServiceData(memberServiceId, type, function (status_memberService, result_memberService) {
    if (status_memberService === 200) {
      res.render('weixinapp/memberServiceInfo', {merchantId:merchantId, FromUserName:FromUserName, memberService:result_memberService.memberService});
    } else {
      req.session.messages = {error:[result_memberService.error]};
      res.redirect([webRoot_weixinapp, '/openMyMemberServiceList?merchantId=', merchantId, '&FromUserName=', FromUserName].join(''));
    }
  });
}

//服务转赠页面
var openLargessOfMemberService = function (req, res) {
  var query = req.query;
  var merchantId = query.merchantId;
  var FromUserName = query.FromUserName;
  var userId = query.userId;
  var memberServiceId = query.memberServiceId;
  var type = query.type;
  getMemberServiceData(memberServiceId, type, function (status_memberService, result_memberService) {
    if (status_memberService === 200) {
      res.render('weixinapp/memberService-largess', {merchantId:merchantId, FromUserName:FromUserName, userId:userId, memberService:result_memberService.memberService});
    } else {
      req.session.messages = {error:[result_memberService.error]};
      res.redirect([webRoot_weixinapp, '/openMyMemberServiceList?merchantId=', merchantId, '&FromUserName=', FromUserName, '&userId=', userId].join(''));
    }
  });
}

//发出转赠请求
var sendLargessSubmit = function (req, res, next) {
  var query = req.query;
  var merchantId = query.merchantId;
  var FromUserName = query.FromUserName;
  var userId = query.userId;
  var type = query.type;
  var memberServiceId = query.memberServiceId;
  var telephone = query.telephone;
  console.log(query);
  userWXService.getUserIdByFromUserName(merchantId, FromUserName, userId, function (status_userId, result_userId) {
    if (status_userId === 200) {
      var fromUserId = result_userId.userId;
      largessRecordServer.sendLargessOfMemberService(memberServiceId, type, telephone, fromUserId, null, function (status, result) {
        if (status === 200) {
          res.json({status:200});
        } else {
          res.json({status:status, error:result.error});
          return;
        }
      });
    } else {
      res.json({status:status_userId, error:result_userId.error});
    }
  });
};

//取消转赠请求
var cancelLargessSubmit = function (req, res) {
  var query = req.query;
  var merchantId = query.merchantId;
  var FromUserName = query.FromUserName;
  var userId = query.userId;
  var memberServiceId = query.memberServiceId;
  var type = query.type;
  userWXService.getUserIdByFromUserName(merchantId, FromUserName, userId, function (status_userId, result_userId) {
    if (status_userId === 200) {
      var fromUserId = result_userId.userId;
      largessRecordServer.cancelLargessOfMemberService(memberServiceId, type, fromUserId, null, function (status, result) {
        if (status === 200) {
          res.json({status:200});
        } else {
          res.json({status:status, error:result.error});
        }
      });
    } else {
      res.json({status:status_userId, error:result_userId.error});
    }
  });
};

//拒绝转赠请求
var refuseLargessSubmit = function (req, res, next) {
  var query = req.query;
  var merchantId = query.merchantId;
  var FromUserName = query.FromUserName;
  var userId = query.userId;
  var type = query.type;
  var memberServiceId = query.memberServiceId;
  userWXService.getUserIdByFromUserName(merchantId, FromUserName, userId, function (status_userId, result_userId) {
    if (status_userId === 200) {
      var toUserId = result_userId.userId;
      largessRecordServer.refuseLargessOfMemberService(memberServiceId, type, toUserId, null, function (status, result) {
        if (status === 200) {
          res.json({status:200});
        } else {
          res.json({status:status, error:result.error});
        }
      });
    } else {
      res.json({status:status_userId, error:result_userId.error});
    }
  });
};

//接收转赠请求
var acceptLargessSubmit = function (req, res, next) {
  var query = req.query;
  var merchantId = query.merchantId;
  var FromUserName = query.FromUserName;
  var userId = query.userId;
  var type = query.type;
  var memberServiceId = query.memberServiceId;
  userWXService.getUserIdByFromUserName(merchantId, FromUserName, userId, function (status_userId, result_userId) {
    if (status_userId === 200) {
      var toUserId = result_userId.userId;
      largessRecordServer.acceptLargessOfMemberService(memberServiceId, type, toUserId, null, function (status, result) {
        if (status === 200) {
          res.json({status:200});
        } else {
          res.json({status:status, error:result.error});
        }
      });
    } else {
      res.json({status:status_userId, error:result_userId.error});
    }
  });
};


//服务使用页面
var openUsedOfMemberService = function (req, res) {
  var query = req.query;
  var merchantId = query.merchantId;
  var FromUserName = query.FromUserName;
  var memberServiceId = query.memberServiceId;
  var type = query.type;
  getMemberServiceData(memberServiceId, type, function (status_memberService, result_memberService) {
    if (status_memberService === 200) {
      res.render('weixinapp/memberService-used', {merchantId:merchantId, FromUserName:FromUserName, memberService:result_memberService.memberService});
    } else {
      req.session.messages = {error:[result_memberService.error]};
      res.redirect([webRoot_weixinapp, '/openMyMemberServiceList?merchantId=', merchantId, '&FromUserName=', FromUserName].join(''));
    }
  });
}

//使用用户的会员服务
var usedMemberServiceSubmit = function (req, res) {
  var query = req.query;
  var memberServiceId = query.memberServiceId;
  var type = query.type;
  if (type) {
    if (type === 'MemberCard') {
      memberCardServer.useMemberCard(memberServiceId, function (status_memberCard, result_memberCard) {
        if (status_memberCard === 200) {
          res.json({status:200, code:result_memberCard.captcha});
        } else {
          res.json({status:status_memberCard, error:result_memberCard.error});
        }
      });
    } else if (type === 'Coupon') {
      couponServer.useCoupon(memberServiceId, function (status_coupon, result_coupon) {
        if (status_coupon === 200) {
          res.json({status:200, code:result_coupon.captcha});
        } else {
          res.json({status:status_coupon, error:result_coupon.error});
        }
      });
    } else if (type === 'MeteringCard') {
      meteringCardServer.useMeteringCard(memberServiceId, function (status_meteringCard, result_meteringCard) {
        if (status_meteringCard === 200) {
          res.json({status:200, code:result_meteringCard.captcha});
        } else {
          res.json({status:status_meteringCard, error:result_meteringCard.error});
        }
      });
    } else {
      memberServiceServer.useMemberService(memberServiceId, function (status_memberService, result_memberService) {
        if (status_memberService === 200) {
          res.json({status:200, code:result_memberService.captcha});
        } else {
          res.json({status:status_memberService, error:result_memberService.error});
        }
      });
    }
  } else {
    res.json({status:400, error:'参数传递错误.'});
  }
};

var deleteMemberServiceSubmit = function(req, res){
  var query = req.query;
  var merchantId = query.merchantId;
  var FromUserName = query.FromUserName;
  var memberServiceId = query.memberServiceId;
  var type = query.type;
  console.log(query);
  if (type) {
    if (type === 'MemberCard') {
      memberCardServer.deleteMemberCardById(memberServiceId, function (status_memberCard, result_memberCard) {
        if (status_memberCard === 200) {
          req.session.messages = {notice:['一项会员卡已被成功删除']};
          res.redirect([webRoot_weixinapp, '/openMyMemberServiceList?merchantId=', merchantId, '&FromUserName=', FromUserName].join(''));
        } else {
          req.session.messages = {error:[result_memberCard.error]};
          res.redirect([webRoot_weixinapp, '/openMyMemberServiceInfo?merchantId=', merchantId, '&FromUserName=', FromUserName,'&memberServiceId=',memberServiceId+'&type=',type].join(''));
        }
      });
    } else if (type === 'Coupon') {
      couponServer.deleteCouponById(memberServiceId, function (status_coupon, result_coupon) {
        if (status_coupon === 200) {
          req.session.messages = {notice:['一项优惠券已被成功删除']};
          res.redirect([webRoot_weixinapp, '/openMyMemberServiceList?merchantId=', merchantId, '&FromUserName=', FromUserName].join(''));
        } else {
          req.session.messages = {error:[result_coupon.error]};
          res.redirect([webRoot_weixinapp, '/openMyMemberServiceInfo?merchantId=', merchantId, '&FromUserName=', FromUserName,'&memberServiceId=',memberServiceId+'&type=',type].join(''));
        }
      });
    } else if (type === 'MeteringCard') {
      meteringCardServer.deleteMeteringCardById(memberServiceId, function (status_meteringCard, result_meteringCard) {
        if (status_meteringCard === 200) {
          req.session.messages = {notice:['一项计次卡已被成功删除']};
          res.redirect([webRoot_weixinapp, '/openMyMemberServiceList?merchantId=', merchantId, '&FromUserName=', FromUserName].join(''));
        } else {
          res.json({status:status_meteringCard, error:result_meteringCard.error});
          req.session.messages = {error:[result_meteringCard.error]};
          res.redirect([webRoot_weixinapp, '/openMyMemberServiceInfo?merchantId=', merchantId, '&FromUserName=', FromUserName,'&memberServiceId=',memberServiceId+'&type=',type].join(''));
        }
      });
    } else {
      memberServiceServer.deleteMemberServiceById(memberServiceId, function (status_memberService, result_memberService) {
        if (status_memberService === 200) {
          var typeItem = {
            MemberCard:'会员卡',
            Coupon:'优惠券',
            MeteringCard:'计次卡',
            GroupOn:'团购',
            StoreCard:'储蓄卡',
            Voucher:'代金券'
          };
          req.session.messages = {notice:['一项'+ typeItem[type] +'已被成功删除']};
          res.redirect([webRoot_weixinapp, '/openMyMemberServiceList?merchantId=', merchantId, '&FromUserName=', FromUserName].join(''));
        } else {
          req.session.messages = {error:[result_memberService.error]};
          res.redirect([webRoot_weixinapp, '/openMyMemberServiceInfo?merchantId=', merchantId, '&FromUserName=', FromUserName,'&memberServiceId=',memberServiceId+'&type=',type].join(''));
        }
      });
    }
  } else {
    req.session.messages = {error:['参数传递错误']};
    res.redirect([webRoot_weixinapp, '/openMyMemberServiceInfo?merchantId=', merchantId, '&FromUserName=', FromUserName,'&memberServiceId=',memberServiceId+'&type=',type].join(''));
  }
};

module.exports = {
  openMyMemberServiceInfo       :openMyMemberServiceInfo,
  getMemberServiceListByMemberId:getMemberServiceListByMemberId,
  openLargessOfMemberService    :openLargessOfMemberService,
  sendLargessSubmit             :sendLargessSubmit,
  cancelLargessSubmit           :cancelLargessSubmit,
  refuseLargessSubmit           :refuseLargessSubmit,
  acceptLargessSubmit           :acceptLargessSubmit,
  usedMemberServiceSubmit       :usedMemberServiceSubmit,
  deleteMemberServiceSubmit       :deleteMemberServiceSubmit,
  openUsedOfMemberService       :openUsedOfMemberService
};