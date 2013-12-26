var ObjectId = require('mongoose').Types.ObjectId;
var LargessRecord = require('../model/LargessRecord').LargessRecord;
var UserCellphoneRecord = require('../model/UserCellphoneRecord').UserCellphoneRecord;
var MemberCard = require('../model/MemberCard').MemberCard;
var Coupon = require('../model/Coupon').Coupon;
var MeteringCard = require('../model/MeteringCard').MeteringCard;
var MemberService = require('../model/MemberService').MemberService;
var memberServer = require('./member-service');
var messageServer = require('./message-service');

/**
 * 发送转赠服务请求
 * @param memberServiceId 转赠的服务Id
 * @param type 服务类型
 * @param telephone 接收人电话
 * @param fromUserId 发送人Id
 * @param storeId 发送者相关门店Id
 * @param callback
 */
var sendLargessOfMemberService = function (memberServiceId, type, telephone, fromUserId, storeId, callback) {
  if (type) {
    UserCellphoneRecord.findOne({cellphone:telephone, isUsing:true}, '_id user', function (err, userCellphoneRecord) {
      if (err) return callback(404, {error:err});
      if (userCellphoneRecord) {
        var fromUser_id = new ObjectId(fromUserId);
        if (userCellphoneRecord.user.equals(fromUser_id)) {
          callback(409, {error:'不能转赠给自己.'});
          return;
        }
        //保存转赠记录
        var saveLargessRecord = function (memberService) {
          var largessRecord = new LargessRecord({
            fromUser     :fromUserId,
            toUser       :userCellphoneRecord.user,
            memberService:memberService.memberServiceId,
            memberCard   :memberService.memberCardId,
            meteringCard :memberService.meteringCardId,
            coupon       :memberService.couponId,
            processStatus:'待接受'
          });
          largessRecord.save(function (err, new_largessRecord) {
            if (err) return callback(404, {error:err});
            //发送消息通知
            messageServer.sendLargessOfMemberService(fromUserId, userCellphoneRecord.user, memberService.merchantId, memberService.serviceItemId, storeId, function (status_m, result_m) {
              console.log(result_m);
            });
            callback(200, {largessRecord:new_largessRecord});
          });
        }
        if (type === 'MemberCard') {
          MemberCard.findOneAndUpdate({_id:memberServiceId, forbidden:false}, {forbidden:true}, function (err, memberCard) {
            if (err) return callback(404, {error:err});
            if (memberCard && memberCard.state === '0000-0000-0000') {
              var memberCard_data = {
                memberCardId :memberCard._id,
                merchantId   :memberCard.merchant,
                serviceItemId:memberCard.serviceItem
              }
              saveLargessRecord(memberCard_data);
            } else {
              callback(404, {error:'未获取相关会员卡服务数据.'});
            }
          });
        } else if (type === 'Coupon') {
          Coupon.findOneAndUpdate({_id:memberServiceId, forbidden:false}, {forbidden:true}, function (err, coupon) {
            if (err) return callback(404, {error:err});
            if (coupon && coupon.state === '0000-0000-0000') {
              var coupon_data = {
                couponId     :coupon._id,
                merchantId   :coupon.merchant,
                serviceItemId:coupon.serviceItem
              }
              saveLargessRecord(coupon_data);
            } else {
              callback(404, {error:'未获取相关优惠券服务数据.'});
            }
          });
        } else if (type === 'MeteringCard') {
          MeteringCard.findOneAndUpdate({_id:memberServiceId, forbidden:false}, {forbidden:true}, function (err, meteringCard) {
            if (err) return callback(404, {error:err});
            if (meteringCard && meteringCard.state === '0000-0000-0000') {
              var meteringCard_data = {
                meteringCardId:meteringCard._id,
                merchantId    :meteringCard.merchant,
                serviceItemId :meteringCard.serviceItem
              }
              saveLargessRecord(meteringCard_data);
            } else {
              callback(404, {error:'未获取相关计次卡服务数据.'});
            }
          });
        } else {
          MemberService.findOneAndUpdate({_id:memberServiceId, forbidden:false}, {forbidden:true}, function (err, memberService) {
            if (err) return callback(404, {error:err});
            if (memberService && memberService.state === '0000-0000-0000') {
              var memberService_data = {
                memberServiceId:memberService._id,
                merchantId     :memberService.merchant,
                serviceItemId  :memberService.serviceItem
              }
              saveLargessRecord(memberService_data);
            } else {
              callback(404, {error:'未获取相关会员服务数据.'});
            }
          });
        }
      } else {
        callback(404, {error:'无法获取该用户的相关数据,或该用户已禁用.'});
      }
    });
  } else {
    callback(400, {error:'参数传递错误.'});
  }
};

/**
 * 取消转赠请求
 * @param memberServiceId 转赠的服务Id
 * @param type 服务类型
 * @param fromUserId 发送人Id
 * @param storeId 发送者相关门店Id
 * @param callback
 */
var cancelLargessOfMemberService = function (memberServiceId, type, fromUserId, storeId, callback) {
  if (type) {
    //更新转赠记录
    var updateLargessRecord = function (merchantId, serviceItemId, param) {
      param.processStatus = '待接受';
      LargessRecord.findOneAndUpdate(param, {processStatus:'已取消'}, function (err, largessRecord) {
        if (err) return callback(404, {error:err});
        //发送消息通知
        messageServer.cancelLargessOfMemberService(largessRecord.fromUser, largessRecord.toUser, merchantId, serviceItemId, storeId, function (err) {
          console.log(err)
        });
        callback(200, {});
      });
    }
    if (type === 'MemberCard') {
      MemberCard.findOneAndUpdate({_id:memberServiceId, forbidden:true}, {forbidden:false}, function (err, memberCard) {
        if (err) return callback(404, {error:err});
        if (memberCard) {
          updateLargessRecord(memberCard.merchant, memberCard.serviceItem, {fromUser:fromUserId, memberCard:memberServiceId});
        } else {
          callback(404, {error:'未获取相关会员卡服务数据.'});
        }
      });
    } else if (type === 'Coupon') {
      Coupon.findOneAndUpdate({_id:memberServiceId, forbidden:true}, {forbidden:false}, function (err, coupon) {
        if (err) return callback(404, {error:err});
        if (coupon) {
          updateLargessRecord(coupon.merchant, coupon.serviceItem, {fromUser:fromUserId, memberCard:memberServiceId});
        } else {
          callback(404, {error:'未获取相关优惠券服务数据.'});
        }
      });
    } else if (type === 'MeteringCard') {
      MeteringCard.findOneAndUpdate({_id:memberServiceId, forbidden:true}, {forbidden:false}, function (err, meteringCard) {
        if (err) return callback(404, {error:err});
        if (meteringCard) {
          updateLargessRecord(meteringCard.merchant, meteringCard.serviceItem, {fromUser:fromUserId, memberCard:memberServiceId});
        } else {
          callback(404, {error:'未获取相关计次卡服务数据.'});
        }
      });
    } else {
      MemberService.findOneAndUpdate({_id:memberServiceId, forbidden:true}, {forbidden:false}, function (err, memberService) {
        if (err) return callback(404, {error:err});
        if (memberService) {
          updateLargessRecord(memberService.merchant, memberService.serviceItem, {fromUser:fromUserId, memberCard:memberServiceId});
        } else {
          callback(404, {error:'未获取相关会员服务数据.'});
        }
      });
    }
  } else {
    callback(400, {error:'参数传递错误.'});
  }
};

/**
 * 拒绝转赠请求
 * @param memberServiceId 转赠的服务Id
 * @param type 服务类型
 * @param toUserId 接收人Id
 * @param storeId 发送者相关门店Id
 * @param callback
 */
var refuseLargessOfMemberService = function (memberServiceId, type, toUserId, storeId, callback) {
  if (type) {
    //更新转赠记录
    var updateLargessRecord = function (merchantId, serviceItemId, param) {
      param.processStatus = '待接受';
      LargessRecord.findOneAndUpdate(param, {processStatus:'已拒绝'}, function (err, largessRecord) {
        if (err) return callback(404, {error:err});
        if (largessRecord) {
          messageServer.refuseLargessOfMemberService(largessRecord.fromUser, largessRecord.toUser, merchantId, serviceItemId, storeId, function (err) {
            console.log(err)
          });
        }
        callback(200, {memberServiceId:memberServiceId});
      });
    }

    if (type === 'MemberCard') {
      MemberCard.findOneAndUpdate({_id:memberServiceId, forbidden:true}, {forbidden:false}, function (err, memberCard) {
        if (err) return callback(404, {error:err});
        if (memberCard) {
          updateLargessRecord(memberCard.merchant, memberCard.serviceItem, {toUser:toUserId, memberCard:memberServiceId});
        } else {
          callback(404, {error:'未获取相关会员卡服务数据.'});
        }
      });
    } else if (type === 'Coupon') {
      Coupon.findOneAndUpdate({_id:memberServiceId, forbidden:true}, {forbidden:false}, function (err, coupon) {
        if (err) return next(err);
        if (coupon) {
          updateLargessRecord(coupon.merchant, coupon.serviceItem, {toUser:toUserId, coupon:memberServiceId});
        } else {
          callback(404, {error:'未获取相关优惠券服务数据.'});
        }
      });
    } else if (type === 'MeteringCard') {
      MeteringCard.findOneAndUpdate({_id:memberServiceId, forbidden:true}, {forbidden:false}, function (err, meteringCard) {
        if (err) return callback(404, {error:err});
        if (meteringCard) {
          updateLargessRecord(meteringCard.merchant, meteringCard.serviceItem, {toUser:toUserId, meteringCard:memberServiceId});
        } else {
          callback(404, {error:'未获取相关计次卡服务数据.'});
        }
      });
    } else {
      MemberService.findOneAndUpdate({_id:memberServiceId, forbidden:true}, {forbidden:false}, function (err, memberService) {
        if (err) return callback(404, {error:err});
        if (memberService) {
          updateLargessRecord(memberService.merchant, memberService.serviceItem, {toUser:toUserId, memberService:memberServiceId});
        } else {
          callback(404, {error:'未获取相关会员服务数据.'});
        }
      });
    }
  } else {
    callback(400, {error:'参数传递错误.'});
  }
};

/**
 * 接收转赠请求
 * @param memberServiceId 转赠的服务Id
 * @param type 服务类型
 * @param toUserId 接收人Id
 * @param storeId 发送者相关门店Id
 * @param callback
 */
var acceptLargessOfMemberService = function (memberServiceId, type, toUserId, storeId, callback) {
  if (type) {
    var hasMember = function (merchantId, serviceItemId, param) {
      param.processStatus = '待接受';
      //更新转赠记录
      LargessRecord.findOneAndUpdate(param, {processStatus:'已接受'}, function (err, largessRecord) {
        if (err) return callback(404, {error:err});
        var transferActivity = function (memberId) {
          var sendMessage = function (memberService) {
            messageServer.acceptLargessOfMemberService(largessRecord.fromUser, largessRecord.toUser, merchantId, serviceItemId, storeId, function (status_m, result_m) {
              console.log(result_m)
            });
            callback(200, {memberService:memberService});
          };
          if (type === 'MemberCard') {
            MemberCard.findByIdAndUpdate(memberServiceId, {member:memberId, forbidden:false}, function (err, memberCard) {
              if (err) return callback(404, {error:err});
              if (memberCard) {
                sendMessage(memberCard);
              } else {
                callback(404, {error:'未获取相关会员卡服务数据.'});
              }
            });
          } else if (type === 'Coupon') {
            Coupon.findByIdAndUpdate(memberServiceId, {member:memberId, forbidden:false}, function (err, coupon) {
              if (err) return callback(404, {error:err});
              if (coupon) {
                sendMessage(coupon);
              } else {
                callback(404, {error:'未获取相关优惠券服务数据.'});
              }
            });
          } else if (type === 'MeteringCard') {
            MeteringCard.findByIdAndUpdate(memberServiceId, {member:memberId, forbidden:false}, function (err, meteringCard) {
              if (err) return callback(404, {error:err});
              if (meteringCard) {
                sendMessage(meteringCard);
              } else {
                callback(404, {error:'未获取相关计次卡服务数据.'});
              }
            });
          } else {
            MemberService.findByIdAndUpdate(memberServiceId, {member:memberId, forbidden:false}, function (err, memberService) {
              if (err) return callback(404, {error:err});
              if (memberService) {
                sendMessage(memberService);
              } else {
                callback(404, {error:'未获取相关会员服务数据.'});
              }
            });
          }
        };
        memberServer.createMemberOfMerchant(merchantId, largessRecord.toUser, function (status_member, result_member) {
          if (status_member === 200) {
            var member = result_member.member;
            transferActivity(member._id);
          } else {
            callback(403, {errors:result_member.error});
            return;
          }
        });
      });
    };

    if (type === 'MemberCard') {
      MemberCard.findOne({_id:memberServiceId, forbidden:true}, function (err, memberCard) {
        if (err) return callback(404, {error:err});
        if (memberCard) {
          hasMember(memberCard.merchant, memberCard.serviceItem, {toUser:toUserId, memberCard:memberServiceId});
        } else {
          callback(404, {error:'未获取相关会员卡服务数据.'});
        }
      });
    } else if (type === 'Coupon') {
      Coupon.findOne({_id:memberServiceId, forbidden:true}, function (err, coupon) {
        if (err) return callback(404, {error:err});
        if (coupon) {
          hasMember(coupon.merchant, coupon.serviceItem, {toUser:toUserId, coupon:memberServiceId});
        } else {
          callback(404, {error:'未获取相关优惠券服务数据.'});
        }
      });
    } else if (type === 'MeteringCard') {
      MeteringCard.findOne({_id:memberServiceId, forbidden:true}, function (err, meteringCard) {
        if (err) return callback(404, {error:err});
        if (meteringCard) {
          hasMember(meteringCard.merchant, meteringCard.serviceItem, {toUser:toUserId, meteringCard:memberServiceId});
        } else {
          callback(404, {error:'未获取相关计次卡服务数据.'});
        }
      });
    } else {
      MemberService.findOne({_id:memberServiceId, forbidden:true}, function (err, memberService) {
        if (err) return callback(404, {error:err});
        if (memberService) {
          hasMember(memberService.merchant, memberService.serviceItem, {toUser:toUserId, memberService:memberServiceId});
        } else {
          callback(404, {error:'未获取相关会员服务数据.'});
        }
      });
    }
  } else {
    callback(400, {error:'参数传递错误.'});
  }
};


module.exports = {
  sendLargessOfMemberService  :sendLargessOfMemberService,
  cancelLargessOfMemberService:cancelLargessOfMemberService,
  refuseLargessOfMemberService:refuseLargessOfMemberService,
  acceptLargessOfMemberService:acceptLargessOfMemberService
};