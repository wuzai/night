var config = require('../../config');
var webRoot_weixinapp = config.webRoot_weixinapp;
var swiss = require('../../utils/swiss-kit');
var tokenHelper = require('../../utils/token-helper');
var userServer = require('../../services/user-service');
var weiXinInUserServer = require('../../services/weiXinInUser-service');


var openCreateWeiXinInUserPage = function (req, res) {
  var query = req.query;
  var merchantId = query.merchantId;
  var FromUserName = query.FromUserName;
  weiXinInUserServer.getWeiXinInUserByWeiXinObject(FromUserName, function (status_wx, result_wx) {
    if (status_wx === 410) {
      res.render('weixinapp/weiXinInUser', {merchantId:merchantId, FromUserName:FromUserName});
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

var saveWeiXinInUser = function (req, res) {
  var body = req.body;
  var merchantId = body.merchantId;
  var FromUserName = body.FromUserName;
  var userName = body.userName ? body.userName.trim() : body.userName;
  var password = body.password ? body.password.trim() : body.password;
  if (merchantId && FromUserName) {
    if (userName && password) {
      if (swiss.isTelephone(userName)) {
        userServer.getUserByUserName(userName, function (status_user, result_user) {
          if (status_user === 200) {
            var user = result_user.user;
            var digest = tokenHelper.encryptPassword(user.hashFormat, user.passwordSalt, password);
            if (digest === user.passwordDigest) {
              //创建用户微信帐号与贝客汇用户的关联表
              weiXinInUserServer.createWeiXinInUser(FromUserName, user._id, function (status_wx, result_wx) {
                if (status_wx === 200) {
                  var userId = result_wx.userId;
                  var user_session = {
                    _id     :user._id,
                    userName:user.userName,
                    avatar  :user.faceIcon
                  };
                  req.session.user = user_session;
                  req.session.messages = {notice:'微信绑定成功.'};
                  //进入我的包包
                  res.redirect([webRoot_weixinapp, '/openMyMemberServiceList?merchantId=', merchantId , '&FromUserName=', FromUserName, '&userId=', userId].join(''));
                } else {
                  req.session.messages = {error:[result_wx.error]};
                  res.redirect([webRoot_weixinapp, '/openCreateWeiXinInUserPage?merchantId=', merchantId , '&FromUserName=', FromUserName].join(''));
                }
              });
            } else {
              req.session.messages = {error:['密码错误.']};
              res.redirect([webRoot_weixinapp, '/openCreateWeiXinInUserPage?merchantId=', merchantId , '&FromUserName=', FromUserName].join(''));
            }
          } else if (status_user === 404) {
            //用户注册链接
            var href = [webRoot_weixinapp , '/openSignUpPage?merchantId=', merchantId , '&FromUserName=' , FromUserName].join('');
            req.session.messages = {error:['用户不存在,是否注册新用户.<br/><a href="' + href + '">现在注册</a>']};
            res.redirect([webRoot_weixinapp, '/openCreateWeiXinInUserPage?merchantId=', merchantId , '&FromUserName=', FromUserName].join(''));
          } else {
            req.session.messages = {error:[result_user.error]};
            res.redirect([webRoot_weixinapp, '/openCreateWeiXinInUserPage?merchantId=', merchantId , '&FromUserName=', FromUserName].join(''));
          }
        });
      } else {
        req.session.messages = {error:['您输入的电话号码有误,请重新输入.']};
        res.redirect([webRoot_weixinapp, '/openCreateWeiXinInUserPage?merchantId=', merchantId , '&FromUserName=', FromUserName].join(''));
      }
    } else {
      req.session.messages = {error:['用户名或密码不能为空.']};
      res.redirect([webRoot_weixinapp, '/openCreateWeiXinInUserPage?merchantId=', merchantId , '&FromUserName=', FromUserName].join(''));
    }
  } else {
    req.session.messages = {error:['参数传递错误.']};
    res.redirect([webRoot_weixinapp, '/openCreateWeiXinInUserPage?merchantId=', merchantId , '&FromUserName=', FromUserName].join(''));
  }
};

module.exports = {
  openCreateWeiXinInUserPage:openCreateWeiXinInUserPage,
  saveWeiXinInUser          :saveWeiXinInUser
};