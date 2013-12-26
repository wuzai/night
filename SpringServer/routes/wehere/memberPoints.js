var config = require('../../config');
var webRoot = config.webRoot_wehere;
var User = require('../../model/User').User;
var Member = require('../../model/Member').Member;
var MemberPoint = require('../../model/MemberPoint').MemberPoint;
var messageSendRecords = require('./messageSendRecords');
var memberPointServer = require('../../services/memberPoint-service');
var captchaRecordServer = require('../../services/captchaRecord-service');
var messageServer = require('../../services/message-service');
var memberServer = require('../../services/member-service');
var swiss = require('../../utils/swiss-kit');

var pointAddPage = function (req, res) {
  var merchant_session = req.session.merchant;
  var merchantId = merchant_session._id;
  res.render('wehere/memberPointAdd', {merchantId:merchantId});
};

var checkPointAdd = function (point, userName, merchantId, callback) {
  if (userName.trim()) {
    if (swiss.isInteger(point)) {
      User.findOne({userName:userName, state:'0000-0000-0000'}, '_id', function (err, user) {
        if (user) {
          Member.findOne({user:user._id, merchant:merchantId, state:'0000-0000-0000'}, function (err, member) {
            if (member) {
              callback(200, {userId:user._id, memberId:member._id});
            } else {
              callback(401, {userId:user._id, error:'该用户不是商户的会员..'});
            }
          });
        } else {
          callback(404, {error:'用户数据未找到,可能不存在，或者已经被禁用.'});
        }
      });
    } else {
      callback(400, {error:'输入会员积分不能为空,且必须是整数.'});
    }
  } else {
    callback(400, {error:'用户名或电话输入有误.'});
  }
};

//会员充值验证
var memberPointAddCheck = function (req, res) {
  var query = req.query;
  var merchantId = query.merchantId;
  var userName = query.userName;
  var point = query.point;
  checkPointAdd(point, userName, merchantId, function (status, result) {
    res.json({status:status, error:result.error});
  })
};

var pointAddSave = function (req, res) {
  var body = req.body;
  var merchantId = body.merchantId;
  var userName = body.userName;
  var point = body.point;
  checkPointAdd(point, userName, merchantId, function (status, result) {
    var memberAddPoint = function (memberId, userId) {
      memberPointServer.changeMemberPoint(memberId, point, 1, 'charge', function (status, result) {
        var memberPoint = result.memberPoint;
        //会员账户充值成功发送信息
        messageSendRecords.memberChargePoint(memberId, point, function (status_m, result_m) {
          console.log(result_m);
        });
        if (status === 200) {
          req.session.messages = {notice:'充值成功.'};
          res.redirect([webRoot , '/point/memberPointAdd'].join(''));
        } else {
          req.session.messages = {error:[result.error]};
          res.redirect([webRoot , '/point/memberPointAdd'].join(''));
        }
      });
    };
    if (status === 200) {
      memberAddPoint(result.memberId, result.userId);
    } else if (status === 401) {
      //不是商户会员，创建会员
      memberServer.createMemberOfMerchant(merchantId, result.userId, function (status_member, result_member) {
        if (status_member === 200) {
          var member = result_member.member;
          memberAddPoint(member._id, member.user);
        } else {
          req.session.messages = {error:[result_member.error]};
          res.redirect([webRoot , '/point/memberPointAdd'].join(''));
        }
      });
    } else {
      req.session.messages = {error:[result.error]};
      res.redirect([webRoot , '/point/memberPointAdd'].join(''));
    }
  })
};

var memberPointUsedPage = function (req, res) {
  var merchant_session = req.session.merchant;
  var merchantId = merchant_session._id;
  memberServer.findMemberListByMerchantId(merchantId, function (status, result) {
    res.render('wehere/memberPointUsed', {merchantId:merchantId, members:result.members});
  })
};

var getCaptchaByPointUsed = function (req, res) {
  var query = req.query;
  var userId = query.userId;
  var merchantId = query.merchantId;
  var point = Number(query.point);//积分数强制转化为浮点数
  point = point ? point : 0;
  if (userId && merchantId) {
    if (swiss.isInteger(point) && point > 0) {
      Member.findOne({merchant:merchantId, user:userId}, function (err, member) {
        if (err) return res.json({status:404, error:err});
        if (member) {
          memberPointServer.getMemberPoint(member._id, function (status_m, result_m) {
            if (status_m === 200) {
              var memberPoint = result_m.memberPoint;
              if (memberPoint.availablePoint >= point) {
                captchaRecordServer.getCaptchaByUserId(userId, '使用', function (status, result) {
                  if (status === 200) {
                    var captchaRecord = result.captchaRecord;
                    messageServer.sendCaptchaOfMemberPointUsed(userId, merchantId, point, captchaRecord.captcha, function (status_message, result_message) {
                      if (status_message === 200) {
                        res.json({status:200, captchaRecordId:captchaRecord._id});
                      } else {
                        res.json({status:status_message, error:'验证码发送失败.'});
                      }
                    })
                  } else {
                    res.json({status:status, error:result.error});
                  }
                });
              } else {
                res.json({status:402, error:'会员积分不足，该会员的积分只有' + memberPoint.availablePoint +',请重新输入'});
              }
            } else {
              res.json({status:status_m, error:result_m.error});
            }
          });
        } else {
          res.json({status:404, error:'数据传递错误'});
        }
      });
    } else {
      res.json({status:401, error:'积分必须是大于0的整数.'});
    }
  } else {
    res.json({status:404, error:'数据传递错误'});
  }
}

var memberPointUsedSave = function (req, res) {
  var query = req.query;
  var merchantId = query.merchantId;
  var captcha = query.captcha;
  var userId = query.userId;
  var captchaRecordId = query.captchaRecordId;
  var point = Number(query.point);//积分数强制转化为浮点数
  point = point ? point : 0;
  if (merchantId && userId && captchaRecordId) {
    if (swiss.isInteger(point) && point > 0) {
      captchaRecordServer.checkCaptchaById(captchaRecordId, captcha, function (status, result) {
        if (status === 200) {
          Member.findOne({merchant:merchantId, user:userId}, function (err, member) {
            if (err) return res.json({status:404, error:err});
            if (member) {
              memberPointServer.getMemberPoint(member._id, function (status_m, result_m) {
                if (status_m === 200) {
                  var memberPoint = result_m.memberPoint;
                  if (memberPoint.availablePoint >= point) {
                    memberPointServer.changeMemberPoint(member._id, point, -1, 'use', function (status_mp, result_mp) {
                      if (status_mp === 200) {
                        messageServer.memberPointUsed(userId, merchantId, point, function (status_mt, result_mt) {
                          console.log(result_mt);
                        });
                        req.session.messages = {notice:'积分使用成功'};
                        res.json({status:200});
                      } else {
                        res.json({status:status_mp, error:'会员积分使用失败.'});
                      }
                    });
                  } else {
                    res.json({status:402, error:'会员积分不足，该会员的积分只有' + memberPoint.availablePoint});
                  }
                } else {
                  res.json({status:status_m, error:result_m.error});
                }
              });
            } else {
              res.json({status:404, error:'数据传递错误'});
            }
          });
        } else {
          res.json({status:status, error:result.error});
        }
      });
    } else {
      res.json({status:401, error:'积分必须是大于0的整数.'});
    }
  } else {
    res.json({status:404, error:'数据传递错误'});
  }
}

module.exports = {
  pointAddPage         :pointAddPage,
  memberPointAddCheck  :memberPointAddCheck,
  pointAddSave         :pointAddSave,
  memberPointUsedPage  :memberPointUsedPage,
  memberPointUsedSave  :memberPointUsedSave,
  getCaptchaByPointUsed:getCaptchaByPointUsed
};