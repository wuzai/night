var config = require('../../config');
var webRoot_weixinapp = config.webRoot_weixinapp;
var swiss = require('../../utils/swiss-kit');
var userServer = require('../../services/user-service');
var weiXinInUserServer = require('../../services/weiXinInUser-service');

//打开用户注册页面
var openSignUpPage = function (req, res) {
  var query = req.query;
  var merchantId = query.merchantId;
  var FromUserName = query.FromUserName;
  weiXinInUserServer.getWeiXinInUserByWeiXinObject(FromUserName, function (status_wx, result_wx) {
    if (status_wx === 410) {
      res.render('weixinapp/userSignUp', {merchantId:merchantId, FromUserName:FromUserName});
    } else {
      if (status_wx === 200) {
        var userId = result_wx.userId;
        req.session.messages = {error:['该微信帐号已被绑定.']};
        res.redirect([webRoot_weixinapp, '/openMyMemberServiceList?merchantId=', merchantId , '&FromUserName=', FromUserName, '&userId=', userId].join(''));
      } else {
        req.session.messages = {error:[result_wx.error]};
        res.redirect([webRoot_weixinapp, '/openCreateWeiXinInUserPage?merchantId=', merchantId , '&FromUserName=', FromUserName].join(''));
      }
    }
  });
};
//用户注册
var userSignUp = function (req, res) {
  var body = req.body;
  var merchantId = body.merchantId;
  var FromUserName = body.FromUserName;
  var captcha = body.captcha;
  var userName = body.userName ? body.userName.trim() : body.userName;
  var password = body.password;
  var confirmPassword = body.confirmPassword;
  if (merchantId) {
    if (userName && password) {
      if (swiss.isTelephone(userName)) {
        if (password !== confirmPassword) {
          req.session.messages = {error:['两次输入的密码不一致.']};
          res.redirect([webRoot_weixinapp, '/openSignUpPage?merchantId=', merchantId , '&FromUserName=', FromUserName].join(''));
        }
        userServer.userSignUp(userName, password, captcha, function (status, result) {
          if (status === 200) {
            var user = result.user;
            var user_session = {
              _id     :user._id,
              userName:user.userName,
              avatar  :user.faceIcon
            };
            req.session.user = user_session;
            //创建用户微信帐号与贝客汇用户的关联表
            weiXinInUserServer.createWeiXinInUser(FromUserName, user._id, function (status_wx, result_wx) {
              if (status_wx === 200) {
                var userId = result_wx.userId;
                req.session.messages = {notice:'贝客汇用户注册成功！'};
                //进入我的包包
                res.redirect([webRoot_weixinapp, '/openMyMemberServiceList?merchantId=', merchantId , '&FromUserName=', FromUserName, '&userId=', userId].join(''));
              } else {
                req.session.messages = {notice:'贝客汇用户注册成功！', error:[result_wx.error + '您可以重新绑定帐号.']};
                //打开绑定微信与贝客汇用户页面
                res.redirect([webRoot_weixinapp, '/openCreateWeiXinInUserPage?merchantId=', merchantId , '&FromUserName=', FromUserName].join(''));
              }
            });
          } else {
            req.session.messages = {error:[result.error]};
            res.redirect([webRoot_weixinapp, '/openSignUpPage?merchantId=', merchantId , '&FromUserName=', FromUserName].join(''));
          }
        });
      } else {
        req.session.messages = {error:['您输入的电话号码有误,请重新输入.']};
        res.redirect([webRoot_weixinapp, '/openSignUpPage?merchantId=', merchantId , '&FromUserName=', FromUserName].join(''));
      }
    } else {
      req.session.messages = {error:['用户名或密码不能为空.']};
      res.redirect([webRoot_weixinapp, '/openSignUpPage?merchantId=', merchantId , '&FromUserName=', FromUserName].join(''));
    }
  } else {
    req.session.messages = {error:['参数传递错误.']};
    res.redirect([webRoot_weixinapp, '/openSignUpPage?merchantId=', merchantId , '&FromUserName=', FromUserName].join(''));
  }

};

module.exports = {
  openSignUpPage:openSignUpPage,
  userSignUp    :userSignUp
};