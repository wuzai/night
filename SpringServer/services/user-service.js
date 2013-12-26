var config = require('../config');
var tokenHelper = require('../utils/token-helper');
var User = require('../model/User').User;
var UserCellphoneRecord = require('../model/UserCellphoneRecord').UserCellphoneRecord;
var userRankServer = require('./userRank-service');
var userPointServer = require('./userPoint-service');
var messageServer = require('./message-service');

/**
 * 用户注册方法
 * @param userName 用户名
 * @param password 密码
 * @param captcha 验证码
 * @param callback
 */
var userSignUp = function (userName, password, captcha, callback) {
  //TODO 对验证码的验证
//  if(!body||!captcha){
//    res.json(400, {error:'验证码错误.'});
//    return;
//  }
  if (!userName || !password) {
    callback(400, {error:'用户名和密码不能为空.'});
    return;
  }
  var userName = userName.trim();
  User.count({userName:userName}, function (err, count) {
    if (err) return callback(404, {error:err});
    if (count > 0) {
      callback(409, {error:'用户名已注册.'});
      return;
    }
    UserCellphoneRecord.findOne({cellphone:userName, isUsing:true}, '_id user', function (err, userCellphoneRecord) {
      if (err) return callback(404, {error:err});
      if (userCellphoneRecord) {
        callback(409, {error:'该电话已注册.'});
        return;
      } else {
        var userRankName = config.systemParams.userType;
        var description = config.systemParams.userTypeDesc;
        userRankServer.getUserRank(userRankName, description, function (status_rank, result_rank) {
          if (status_rank === 200) {
            var userRank = result_rank.userRank;
            var hashFormat = config.app_setting.hash_algorithm;
            var passwordSalt = tokenHelper.generateApiKey(6);
            var digest = tokenHelper.encryptPassword(hashFormat, passwordSalt, password);

            var user = new User({
              userName      :userName,
              passwordDigest:digest,
              hashFormat    :hashFormat,
              passwordSalt  :passwordSalt,
              faceIcon      :config.systemDefault.userFace,
              isApproved    :true,
              isLockOut     :false,
              userRank      :userRank
            });
            user.save(function (err, newUser) {
              if (err) return callback(404, {error:err});
              //保存用户绑定手机号码记录
              var add_userCellphoneRecord = new UserCellphoneRecord({
                user     :newUser._id,
                cellphone:userName,
                isUsing  :true
              });
              add_userCellphoneRecord.save(function (err, new_userCellphoneRecord) {
                if (err) return callback(404, {error:err});
                //注册成功,默认赠送用户贝客积分,并异步发送消息
                var pearlGift = config.systemParams.register.point;
                userPointServer.changeUserPoint(newUser._id, pearlGift, 1, 'largess', function (status_point, result_point) {
                  if (status_point === 200) {
                    var userPoint = result_point.userPoint;
                    //发送消息通知
                    messageServer.userSignUp(newUser._id, userPoint.availablePoint, function (status_m, result_m) {
                      console.log(result_m);
                    });
                    //保存成功，返回用户信息
                    callback(200, {user:newUser, userPoint:userPoint.availablePoint});
                    return;
                  } else {
                    return callback(status_point, {error:result_point.error});
                  }
                });
              });
            });
          } else {
            return callback(status_rank, {error:result_rank.error});
          }
        });
      }
    });
  });
};

/**
 * 用户登录
 * @param userName 用户名
 * @param password 登录密码
 * @param callback
 */
var userSignIn = function (userName, password, callback) {
  if (!userName || !password) {
    callback(400, {error:'用户名和密码不能为空.'});
    return;
  }
  var userName = userName.trim();
  UserCellphoneRecord.findOne({cellphone:userName, isUsing:true, state:'0000-0000-0000'}, '_id user', function (err, userCellphoneRecord) {
    if (err) return callback(404, {error:err});
    if (userCellphoneRecord) {
      User.findById(userCellphoneRecord.user, function (err, user) {
        if (err) return callback(404, {error:err});
        if (user) {
          if (user.state === '0000-0000-0000') {
            var digest = tokenHelper.encryptPassword(user.hashFormat, user.passwordSalt, password);
            if (digest === user.passwordDigest) {
              //登录成功（赠送积分）
              signInSuccess(user._id);
              callback(200, {user:user});
            } else {
              callback(410, {error:'密码错误.'});
              return;
            }
          } else {
            callback(404, {error:'该用户已被禁用或屏蔽.'});
          }
        } else {
          callback(404, {error:'用户不存在,可能未注册,或已禁用.'});
        }
      });
    } else {
      callback(404, {error:'用户不存在,可能未注册,或已禁用.'});
    }
  });
};

/**
 * 登录成功之后的后续操作
 * @param userId 用户Id
 */
var signInSuccess = function (userId) {
  User.findById(userId, '_id userRank lastActivityTime').populate('userRank').exec(function (err, user) {
    var isFirstLogin = false;//表示是否是当日首次登录
    var date = new Date();
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);

    //如果最后一次登录时间 小于 当前日期的0点,则今日是首次登录
    if (new Date(user.lastActivityTime) < date) {
      isFirstLogin = true;
    }

    if (isFirstLogin) {
      //首次登录赠送积分
      var largessPoint = config.systemParams.login.point;
      var userRank = user.userRank;
      if (userRank) {
        if (userRank === '普通用户') {
          largessPoint = config.systemParams.login.pointA;
        } else if (userRank === '中级用户') {
          largessPoint = config.systemParams.login.pointB;
        } else if (userRank === '高级用户') {
          largessPoint = config.systemParams.login.pointC;
        }
      }
      userPointServer.changeUserPoint(userId, largessPoint, 1, 'largess', function (status_point, result_point) {
        if (status_point === 200) {
          var userPoint = result_point.userPoint;
          //发送消息通知
          messageServer.userSignInOfFirst(userId, largessPoint, function (err) {
            console.log(err);
          });
        } else {
          console.log(result_point.error);
        }
      });
    }
    //修改最后登录时间
    user.lastActivityTime = new Date;
    user.save();
  });
};

/**
 * 用户首次修改资料
 * @param userId 用户Id
 * @param callback
 */
var userUpdateInfoOfFirst = function (userId, callback) {
  User.findById(userId, '_id isPerfect', function (err, user) {
    if (err) return callback(404, {error:err});
    //首次修改个人资料赠送积分
    var point = config.systemParams.updateUser.point;
    userPointServer.changeUserPoint(userId, point, 1, 'largess', function (status_point, result_point) {
      if (status_point === 200) {
        var userPoint = result_point.userPoint;
        //发送消息通知
        messageServer.userUpdateInfoOfFirst(userId, point, function (status_m, result_m) {
          console.log(result_m);
        });
        user.isPerfect = true;
        user.save(function (err, new_user) {
          callback(200, new_user);
        });
      } else {
        return callback(status_point, {error:result_point.error});
      }
    });
  });
};

/**
 * 通过Id获取用户信息
 * @param userId
 * @param callback
 */
var getUserById = function (userId, callback) {
  User.findById(userId, function (err, user) {
    if (err) return callback(404, {error:err});
    if (user) {
      var user_data = {
        _id                   :user._id,
        application           :user.application,
        userName              :user.userName,
        inviter               :user.inviter,
        isApproved            :user.isApproved,
        isLockedOut           :user.isLockedOut,
        faceIcon              :[config.imageRoot, user.faceIcon ? user.faceIcon : config.systemDefault.userFace].join(''),
        userRank              :user.userRank,
        isPerfect             :user.isPerfect,
        lastActivityTime      :user.lastActivityTime,
        lastChangePasswordTime:user.lastChangePasswordTime,
        createdAt             :user.createdAt,
        updatedAt             :user.updatedAt,
        state                 :user.state,
        remark                :user.remark
      };
      callback(200, {user:user_data});
    } else {
      callback(400, {error:'未获取到用户信息.'});
    }
  });
};

/**
 * 根据用户名获取用户信息
 * @param userName
 * @param callback
 */
var getUserByUserName = function (userName, callback) {
  User.findOne({userName:userName}, function (err, user) {
    if (err) return callback(404, {error:err});
    if (user) {
      if (user.state === '1111-1111-1111') {
        callback(403, {error:'用户已被删除.'});
      } else if (user.state === '0000-0000-1111') {
        callback(403, {error:'用户已被禁用.'});
      } else {
        callback(200, {user:user});
      }
    } else {
      callback(404, {error:'未获取到用户信息.'});
    }
  });
};


module.exports = {
  userSignUp           :userSignUp,
  userSignIn           :userSignIn,
  userUpdateInfoOfFirst:userUpdateInfoOfFirst,
  getUserById          :getUserById,
  getUserByUserName    :getUserByUserName
};