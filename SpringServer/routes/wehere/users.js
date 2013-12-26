var config = require('../../config');
var webRoot_wehere = config.webRoot_wehere;
var webRoot_admin = config.webRoot_admin;
var tokenHelper = require('../../utils/token-helper');
var User = require('../../model/User').User;
var Merchant = require('../../model/Merchant').Merchant;
var captchaRecordServer = require('../../services/captchaRecord-service');
var userServer = require('../../services/user-service');
var swiss = require('../../utils/swiss-kit');

//打开用户注册页面
var openSignUpPage = function (req, res) {
  res.render('wehere/userSignUp', {});
};
//用户注册
var signUp = function (req, res) {
  var body = req.body;
  var captcha = body.captcha;
  var userName = body.userName?body.userName.trim():body.userName;
  var password = body.password;
  var confirmPassword = body.confirmPassword;
  if (userName && password) {
    if (swiss.isTelephone(userName)||userName=='admin') {
      if (password !== confirmPassword) {
        req.session.messages = {error:['两次输入的密码不一致.']};
        res.redirect([webRoot_wehere, '/userSignUp'].join(''));
      }
      userServer.userSignUp(userName, password, captcha, function (status, result) {
        if (status === 200) {
          req.session.messages = {notice:'注册成功！'};
          //注册成功跳转到登录页面
          //res.redirect([webRoot_wehere, '/userSignIn'].join(''));
          //注册成功直接登录
          userLogin(req, res, userName, password);
        } else {
          req.session.messages = {error:[result.error]};
          res.redirect([webRoot_wehere, '/userSignUp'].join(''));
        }
      });
    } else {
      req.session.messages = {error:['您输入的电话号码有误,请重新输入.']};
      res.redirect([webRoot_wehere, '/userSignUp'].join(''));
    }
  } else {
    req.session.messages = {error:['用户名或密码不能为空.']};
    res.redirect([webRoot_wehere, '/userSignUp'].join(''));
  }
};
//打开登录页面
var openSignInPage = function (req, res) {
  res.render('wehere/userSignIn', {});
};
//用户登录
var signIn = function (req, res) {
  var body = req.body;
  var userName = body.userName;
  var password = body.password;
  if (body) {
    userLogin(req, res, userName, password);
  } else {
    req.session.messages = {error:['请求数据有错.']};
    res.redirect([webRoot_wehere, '/userSignIn'].join(''));
  }
};

//用户登录
var userLogin = function (req, res, userName, password) {
  userServer.userSignIn(userName, password, function (status_user, result_user) {
    if (status_user === 200) {
      var user = result_user.user;
      var user_session = {
        _id     :user._id,
        userName:user.userName,
        avatar  :user.faceIcon,
        messages:[
          {_id:1, content:'How are you.'},
          {_id:2, content:'Are you sure.'},
          {_id:3, content:'How do you do.'},
          {_id:4, content:'Hello word!'}
        ]
      };
      req.session.user = user_session;
      Merchant.findOne({creator:user._id, state:'0000-0000-0000'}, '_id merchantName', function (err, merchant) {
        if (merchant) {
          req.session.merchant = {_id:merchant._id, merchantName:merchant.merchantName};
        }
        //TODO 根据权限判定登录到用户系统还是管理员系统
        if (user.userName=='admin') {
          res.redirect([webRoot_admin, '/dashboard'].join(''));
        }else{
          res.redirect([webRoot_wehere, '/dashboard'].join(''));
        }
      });
    } else {
      req.session.messages = {error:[result_user.error]};
      res.redirect([webRoot_wehere, '/userSignIn'].join(''));
    }
  });
};

//用户注销（退出登录）
var signOut = function (req, res) {
  req.session.destroy();
  req.session = null;
  res.redirect(webRoot_wehere);
};

//找回密码
var forgetPassword = function (req, res) {
  var query = req.query;
  var userName = query.userName;
  User.findOne({userName:userName, state:'0000-0000-0000'}, '_id userName', function (err, user) {
    if (user && user._id) {
      captchaRecordServer.getCaptchaByUserId(user._id, '找回密码', function (status, result) {
        if (status === 200) {
          var captchaRecord = result.captchaRecord;
          //TODO 发送验证码到手机
          res.json({status:200, user:user});
        } else {
          res.json({status:status, error:result.error});
          return;
        }
      });
    } else {
      res.json({status:400, error:'用户未找到或用户已禁用.'});
      return;
    }
  });
};

/**
 * 刷新找回密码验证码
 * @param req
 * @param res
 */
var afreshCaptcha = function (req, res) {
  var query = req.query;
  var userId = query.userId;
  captchaRecordServer.getCaptchaByUserId(userId, '找回密码', function (status, result) {
    if (status === 200) {
      var captchaRecord = result.captchaRecord;
      //TODO 发送验证码到手机
      res.json({status:200, error:'验证码已经发送到您的手机，请注意查收'});
    } else {
      res.json({status:status, error:result.error});
    }
  });
};

//打开重置密码页面
var openResetPasswordPage = function (req, res) {
  var query = req.query;
  var userId = query.userId;
  res.render('wehere/userPasswordResetPage', {userId:userId});
}

//密码重置
var resetPassword = function (req, res) {
  var body = req.body;
  var userId = body.userId;
  var captcha = body.captcha;
  var password = body.password;
  var confirmPassword = body.confirmPassword;
  if (captcha) {
    if (password) {
      if (password !== confirmPassword) {
        req.session.messages = {error:['两次输入的密码不一致.']};
        res.redirect([webRoot_wehere , '/resetPassword?userId=' , userId].join(''));
      } else {
        resetPasswordSave(userId, password, captcha, function (status, result) {
          if (status === 200) {
            res.redirect([webRoot_wehere , '/userSignIn'].join(''));
          } else {
            req.session.messages = {error:[result.error]};
            res.redirect([webRoot_wehere , '/resetPassword?userId=' , userId].join(''));
          }
        });
      }
    } else {
      req.session.messages = {error:['重置密码不能为空.']};
      res.redirect([webRoot_wehere , '/resetPassword?userId=' , userId].join(''));
    }
  } else {
    req.session.messages = {error:['验证码不能为空.']};
    res.redirect([webRoot_wehere , '/resetPassword?userId=' , userId].join(''));
  }
};

//忘记密码时,保存重置密码
var resetPasswordSave = function (userId, password, captcha, callback) {
  User.findById(userId, function (err, user) {
    if (err) return callback(400, {error:err});
    if (user) {
      captchaRecordServer.checkCaptcha(captcha, user.userName, '找回密码', function (status, result) {
        if (status === 200) {
          var captchaRecord = result.captchaRecord;
          var new_digest = tokenHelper.encryptPassword(user.hashFormat, user.passwordSalt, password);
          var date = new Date();
          User.update({ _id:user._id }, { passwordDigest:new_digest, lastChangePasswordTime:date, updatedAt:date }, function (err, new_user) {
            if (err) return callback(400, {error:err});
            //用户修改成功,验证码修改为已使用状态
            captchaRecord.hasUsed = true;
            captchaRecord.save(function (err, new_captchaRecord) {
              if (err) return callback(400, {error:err});
              callback(200, {user:new_user});
            });
          });
        } else {
          callback(status, {error:result.error});
        }
      });
    } else {
      callback(404, {error:'用户未找到'});
    }
  });
};


module.exports = {
  openSignUpPage       :openSignUpPage,
  signUp               :signUp,
  openSignInPage       :openSignInPage,
  signIn               :signIn,
  signOut              :signOut,
  forgetPassword       :forgetPassword,
  afreshCaptcha        :afreshCaptcha,
  openResetPasswordPage:openResetPasswordPage,
  resetPassword        :resetPassword
};