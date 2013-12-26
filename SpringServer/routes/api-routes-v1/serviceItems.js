var ServiceItem = require('../../model/ServiceItem').ServiceItem;
var ServiceSet = require('../../model/ServiceSet').ServiceSet;
var SellRecord = require('../../model/SellRecord').SellRecord;
var Member = require('../../model/Member').Member;
var User = require('../../model/User').User;

var ServiceItemProfile = require('../../model/ServiceItemProfile').ServiceItemProfile;
var ObjectId = require('mongoose').Types.ObjectId;
var config = require('../../config');
var swiss = require('../../utils/swiss-kit');
var largessRecords = require('./largessRecords');
var memberCards = require('./memberCards');
var coupons = require('./coupons');
var meteringCards = require('./meteringCards');
var memberServices = require('./memberServices');

var pointServer = require('../../services/point-service');
var memberServer = require('../../services/member-service');
var userPointServer = require('../../services/userPoint-service');
var memberPointServer = require('../../services/memberPoint-service');
var sellRecordServer = require('../../services/sellRecord-service');
var messageServer = require('../../services/message-service');
var memberCardServer = require('../../services/memberCard-service');
var couponServer = require('../../services/coupon-service');
var meteringCardServer = require('../../services/meteringCard-service');
var memberServiceServer = require('../../services/memberService-service');
var largessRecordServer = require('../../services/largessRecord-service');


var checkApplicableItem = function (userId, merchantId, isMinMemberPoint, callback) {
  //如果是希斯杰商户并且 isMinMemberPoint == true（需要做出限定，积分不足2000的不可以申领服务）
  if (config.merchantIds.XSJ == merchantId && isMinMemberPoint) {
    memberPointServer.getMemberPointByUserAndMerchant(userId, merchantId, function (status_mp, result_mp) {
      if (status_mp === 200) {
        var memberPoint = result_mp.memberPoint ? result_mp.memberPoint.availablePoint : 0;
        var minMemberPoint = config.constantConf.XSJ.minMemberPoint;//希斯杰申领服务最少需要的积分数
        if (Number(memberPoint) >= Number(minMemberPoint)) {
          callback(200);
        } else {
          var err = '会员积分多于' + minMemberPoint + '积分的才可以参与该活动.您的会员积分只有' + memberPoint + '请充值后再申领.';
          callback(403, {error:err});
        }
      } else {
        callback(403, {error:result_mp.error});
      }
    });
  } else {
    callback(200);
  }
};


//服务项目的申领（用户如果不是该商户会员，只能申领免费的服务，默认创建会员）
var applicableServiceItem = function (req, res, next) {
  var body = req.body;
  var serviceItem_id = body.serviceItem_id;
  var merchant_id = body.merchant_id;
  var user_id = body.user_id;
  if (!body || !serviceItem_id || !merchant_id || !user_id) {
    res.json(400, {errors:'request data error.'});
    return;
  }
  var serviceItemId = new ObjectId(serviceItem_id);
  var merchantId = new ObjectId(merchant_id);
  var userId = new ObjectId(user_id);
  //获取服务
  var itemDetailFields = '_id isUseUserPoint isRequireAudit isRepeatApply allowApplyNumber state isMinMemberPoint';
  ServiceItem.findById(serviceItemId, itemDetailFields, function (err, serviceItem) {
    if (err) return next(err);
    if (serviceItem) {
      checkApplicableItem(userId, merchantId, serviceItem.isMinMemberPoint, function (status_c, result_c) {
        if (status_c === 200) {
          if (serviceItem.state === '0000-0000-0000') {
            ServiceItemProfile.find({_type:'ServiceItemProfile', serviceItem:serviceItem._id}).populate('attribute').exec(function (err, attrs) {
              if (err) return next(err);
              var attrJson = swiss.findProfileToJSON(attrs);

              var executeApplicableServiceItem = function (pointApply, member) {
                sellRecordServer.countMemberServerOfServiceItemByMemberId(member._id, serviceItemId, function (status_count, result_count) {
                  var isRepeatApply = serviceItem.isRepeatApply;//是否允许重复申领
                  var allowApplyNumber = serviceItem.allowApplyNumber;//允许申领的数量
                  var count = result_count.count;
                  var applicableServiceItem = function (pointApply, member) {
                    memberPointServer.getMemberPoint(member._id, function (status_point, result_point) {
                      if (status_point === 200) {
                        var memberPoint = result_point.memberPoint;
                        if (memberPoint.availablePoint >= pointApply) {
                          var isRequireAudit = serviceItem.isRequireAudit;//是否需要商户审核
                          //创建销售记录
                          var sellRecord = new SellRecord({
                            merchant   :merchantId,
                            member     :member._id,
                            serviceItem:serviceItemId,
                            process    :'待处理',
                            isSucceed  :false,
                            count      :0,
                            sum        :0
                          });
                          sellRecord.save(function (err, new_sellRecord) {
                            if (err) return next(err);
                            //是否需要商户审核
                            if (isRequireAudit) {
                              //创建会员服务发送消息
                              messageServer.applyMemberServiceAudit(serviceItemId, member._id, function (status, result) {
                                console.log(result);
                              });
                              //等待商户审核.审核通过后创建服务
                              res.json(203, {errors:'申领请求已发出，等待商户审核.'});
                              return;
                            } else {
                              //创建服务
                              sellRecordServer.createMemberServiceOfSellRecord(new_sellRecord._id, function (status, result) {
                                if (status === 200) {
                                  //创建会员服务发送消息
                                  messageServer.createMemberServiceOfServiceItem(serviceItemId, new_sellRecord.member, function (status, result) {
                                    console.log(result);
                                  });
                                }
                              });
                              var member_data = {
                                _id       :member._id,
                                point     :memberPoint.availablePoint,
                                amount    :member.amount,
                                userId    :member.user,
                                merchantId:member.merchant,
                                createdAt :member.createdAt
                              }
                              res.json(201, member_data);
                              return;
                            }
                          });
                        } else {
                          var isUseUserPoint = serviceItem.isUseUserPoint;//是否可使用平台积分
                          if (isUseUserPoint) {
                            //申领服务所差积分
                            var lackPoint = pointApply - memberPoint.availablePoint;
                            pointServer.userPointToMember(member._id, lackPoint, function (status_point2, result_point2) {
                              if (status_point2 === 200) {
                                executeApplicableServiceItem(pointApply, member);
                              } else {
                                res.json(status_point2, {errors:result_point2.error});
                              }
                            });
                          } else {
                            res.json(403, {errors:'您的会员积分不足,请到该商户充值.'});
                          }
                        }
                      } else {
                        res.json(403, {errors:result_point.error});
                      }
                    });
                  }
                  if (isRepeatApply) {
                    if (count < allowApplyNumber) {
                      applicableServiceItem(pointApply, member);
                    } else {
                      res.json(401, {errors:['该服务最多只能申领', allowApplyNumber, '次,您已经申领或在审核中.'].join('')});
                      return;
                    }
                  } else {
                    if (count > 0) {
                      res.json(401, {errors:'该服务您已经申领,不能重复申领.'});
                      return;
                    } else {
                      applicableServiceItem(pointApply, member);
                    }
                  }
                });
              };

              //申领服务所需积分
              var pointApply = attrJson.pointApply;
              if (pointApply && pointApply > 0) {
                //申领需要pointApply会员积分
                Member.findOne({merchant:merchantId, user:userId}, function (err, member) {
                  if (member) {
                    if (member.state === '0000-0000-0000') {
                      //申领服务并扣除积分
                      executeApplicableServiceItem(pointApply, member);
                    } else {
                      res.json(403, {errors:'您在该商户的会员,已被商户禁用,请联系该商户.'});
                      return;
                    }
                  } else {
                    res.json(403, {errors:'您不是该商户的会员,或您的会员积分不足,请到该商户充值.'});
                    return;
                  }
                });
              } else {
                //申领不需要积分
                memberServer.createMemberOfMerchant(merchantId, userId, function (status_member, result_member) {
                  if (status_member === 200) {
                    var member = result_member.member;
                    if (member.state === '0000-0000-0000') {
                      executeApplicableServiceItem(0, member);
                    } else {
                      res.json(403, {errors:'您在该商户的会员,已被商户禁用,请联系该商户.'});
                      return;
                    }
                  } else {
                    res.json(403, {errors:result_member.error});
                    return;
                  }
                });
              }
            });
          } else {
            res.json(403, {errors:'该服务项目已经被删除或禁用.'});
            return;
          }
        } else {
          res.json(403, {errors:result_c.error});
          return;
        }
      });
    } else {
      res.json(404, {errors:'未找到该服务项目数据'});
      return;
    }
  });
};

//获取某一用户下的所有服务
var getServiceItemsByUserId = function (req, res, next) {
  var query = req.query;
  var user_id = query.user_id;
  var userId = new ObjectId(user_id);
  User.findById(userId, '_id userName', function (err, user) {
    if (err) return next(err);
    if (user) {
      var user_data = {
        _id           :user._id,
        userName      :user.userName,
        userPoint     :0,
        members       :[],
        memberServices:[],
        memberCards   :[],
        coupons       :[],
        meteringCards :[]
      }
      userPointServer.getUserPoint(user._id, function (status_up, result_up) {
        if (status_up === 200) {
          var userPoint = result_up.userPoint;
          user_data.userPoint = userPoint.availablePoint;
        }
        var memberFields = '_id user merchant';
        Member.find({user:userId}, memberFields, function (err, memberList) {
          if (err) return next(err);
          var member_list = [];
          var membersLen = memberList.length;

          function memberLoop(i) {
            if (i < membersLen) {
              var member = memberList[i];
              //获取会员积分
              memberPointServer.getMemberPoint(member._id, function (status_point, result_point) {
                if (status_point === 200) {
                  var memberPoint = result_point.memberPoint;
                  var member_data = {
                    _id        :member._id,
                    merchantId :member.merchant,
                    memberPoint:memberPoint == null ? 0 : memberPoint.availablePoint
                  };
                  member_list.push(member_data);
                  memberCards.findMemberCardByMemberId(member._id, function (status_memberCards, result_memberCards) {
                    if (status_memberCards === 200) {
                      user_data.memberCards = user_data.memberCards.concat(result_memberCards.memberCards);
                    }
                    coupons.findCouponByMemberId(member._id, function (status_coupons, result_coupons) {
                      if (status_coupons === 200) {
                        user_data.coupons = user_data.coupons.concat(result_coupons.coupons);
                      }
                      meteringCards.findMeteringCardByMemberId(member._id, function (status_meteringCards, result_meteringCards) {
                        if (status_meteringCards === 200) {
                          user_data.meteringCards = user_data.meteringCards.concat(result_meteringCards.meteringCards);
                        }
                        memberServices.findMemberServiceByMemberId(member._id, function (status_memberServices, result_memberServices) {
                          if (status_memberServices === 200) {
                            user_data.memberServices = user_data.memberServices.concat(result_memberServices.memberServices);
                          }
                          memberLoop(i + 1);
                        })
                      });
                    });
                  });
                }
              });
            } else {
              //获取别人转借的卡/券
              largessRecords.findLargessServiceItemByToUser(userId, function (err, memberCard_list, coupon_list, meteringCard_list) {
                if (!err) {
                  user_data.memberCards = user_data.memberCards.concat(memberCard_list);
                  user_data.coupons = user_data.coupons.concat(coupon_list);
                  user_data.meteringCards = user_data.meteringCards.concat(meteringCard_list);
                }
                user_data.members = user_data.members.concat(member_list);
                res.json(200, user_data);
                return;
              });
            }
          }

          memberLoop(0);
        });
      });
    } else {
      res.json(404, {error:'user not found'});
    }
  });
};

//发出转赠请求
var sendLargess = function (req, res, next) {
  var query = req.query;
  var type = query.type;
  var memberServiceId = query.activity_id;
  var cellphone = query.cellphone;
  var fromUserId = query.fromUser_id;
  var storeId = query.store_id;
  largessRecordServer.sendLargessOfMemberService(memberServiceId, type, cellphone, fromUserId, storeId, function (status, result) {
    if (status === 200) {
      res.json(200, result.largessRecord);
    } else {
      res.json(status, {error:result.error});
      return;
    }
  });
};

//取消转赠请求
var cancelLargess = function (req, res, next) {
  var query = req.query;
  var type = query.type;
  var fromUserId = query.fromUser_id;
  var memberServiceId = query.activity_id;
  var storeId = query.store_id;
  largessRecordServer.cancelLargessOfMemberService(memberServiceId, type, fromUserId, storeId, function (status, result) {
    if (status === 200) {
      res.json(200, {});
    } else {
      res.json(404, {errors:result.error});
    }
  });
};

//拒绝转赠请求
var refuseLargess = function (req, res, next) {
  var query = req.query;
  var type = query.type;
  var memberServiceId = query.activity_id;
  var toUserId = query.user_id;
  var storeId = query.store_id;

  largessRecordServer.refuseLargessOfMemberService(memberServiceId, type, toUserId, storeId, function (status, result) {
    if (status === 200) {
      res.json(200, {_id:result.memberServiceId});
    } else {
      res.json(404, {errors:result.error});
    }
  });
};

//接收转赠请求
var acceptLargess = function (req, res, next) {
  var query = req.query;
  var type = query.type;
  var memberServiceId = query.activity_id;
  var toUserId = query.user_id;
  var storeId = query.store_id;
  largessRecordServer.acceptLargessOfMemberService(memberServiceId, type, toUserId, storeId, function (status, result) {
    if (status === 200) {
      var memberService = result.memberService;
      memberService.iconImage = [config.webRoot, config.imageRoot , memberService.iconImage].join('');
      res.json(200, memberService);
    } else {
      res.json(404, {errors:result.error});
    }
  });
};

//活动的使用（会员卡/优惠券/计次卡）
var useServiceItem = function (req, res, next) {
  var query = req.query;
  var type = query.type;
  var activity_id = query.activity_id;
  var activityId = new ObjectId(activity_id);
  if (type) {
    if (type === 'MemberCard') {
      memberCardServer.useMemberCard(activityId, function (status_memberCard, result_memberCard) {
        if (status_memberCard === 200) {
          res.json(200, {code:result_memberCard.captcha});
        } else {
          res.json(status_memberCard, {errors:result_memberCard.error});
        }
      });
    } else if (type === 'Coupon') {
      couponServer.useCoupon(activityId, function (status_coupon, result_coupon) {
        if (status_coupon === 200) {
          res.json(200, {code:result_coupon.captcha});
        } else {
          res.json(status_coupon, {errors:result_coupon.error});
        }
      });
    } else if (type === 'MeteringCard') {
      meteringCardServer.useMeteringCard(activityId, function (status_meteringCard, result_meteringCard) {
        if (status_meteringCard === 200) {
          res.json(200, {code:result_meteringCard.captcha});
        } else {
          res.json(status_meteringCard, {errors:result_meteringCard.error});
        }
      });
    } else {
      memberServiceServer.useMemberService(activityId, function (status_memberService, result_memberService) {
        if (status_memberService === 200) {
          res.json(200, {code:result_memberService.captcha});
        } else {
          res.json(status_memberService, {errors:result_memberService.error});
        }
      });
    }
  } else {
    res.json(400, {errors:'参数传递错误.'});
  }
}

//根据商户获取所有服务
var findServiceItemOfMerchant = function (merchantId, callback) {
  var serviceItems_data = [];
  ServiceSet.find({merchant:merchantId, state:'0000-0000-0000', isEnabled:true, isApproved:true}, '_id', function (err, serviceSetList) {
    var serviceSetLen = serviceSetList.length;

    function serviceSetLoop(i) {
      if (i < serviceSetLen) {
        var serviceSet = serviceSetList[i];
        ServiceItem.find({serviceSet:serviceSet._id, state:'0000-0000-0000'}).populate('postImage', 'imageUrl').exec(function (err, serviceItemList) {
          var serviceItemLen = serviceItemList.length;

          function serviceItemLoop(j) {
            if (j < serviceItemLen) {
              var serviceItem = serviceItemList[j];
              var serviceItem_data = {
                _id             :serviceItem._id,
                allowLargess    :serviceItem.allowLargess,
                allowShare      :serviceItem.allowShare,
                isApplicable    :serviceItem.isApplicable,
                isMemberOnly    :serviceItem.isMemberOnly,
                isRequireApply  :serviceItem.isRequireApply,
                isRequireAudit  :serviceItem.isRequireAudit,
                posterImage     :[config.webRoot, config.imageRoot , serviceItem.postImage ? serviceItem.postImage.imageUrl : ''].join(''),
                ruleText        :serviceItem.ruleText,
                serviceItemName :serviceItem.serviceItemName,
                description     :serviceItem.description,
                serviceItemType :serviceItem.serviceItemType,
                fromDate        :serviceItem.fromDate,
                toDate          :serviceItem.toDate,
                usableStores    :serviceItem.usableStores,
                allowMemberRanks:serviceItem.allowMemberRanks
              }
              serviceItems_data.push(serviceItem_data);
              serviceItemLoop(j + 1);
            } else {
              serviceSetLoop(i + 1);
            }
          }

          serviceItemLoop(0);
        });
      } else {
        callback(200, serviceItems_data)
      }
    }

    serviceSetLoop(0);
  })
};

module.exports = {
  applicableServiceItem    :applicableServiceItem,
  getServiceItemsByUserId  :getServiceItemsByUserId,
  sendLargess              :sendLargess,
  cancelLargess            :cancelLargess,
  refuseLargess            :refuseLargess,
  acceptLargess            :acceptLargess,
  useServiceItem           :useServiceItem,
  findServiceItemOfMerchant:findServiceItemOfMerchant
};