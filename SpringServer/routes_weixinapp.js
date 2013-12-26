var config = require('./config');
var webRoot_weixinapp = config.webRoot_weixinapp;
var Merchant = require('./model/Merchant').Merchant;
var weixinPorts = require('./routes/weixinapp/weixin-ports');
var index = require('./routes/weixinapp/index');
var users = require('./routes/weixinapp/users');
var merchants = require('./routes/weixinapp/merchants');
var stores = require('./routes/weixinapp/stores');
var advertisements = require('./routes/weixinapp/advertisements');
var memberServices = require('./routes/weixinapp/memberServices');
var serviceItems = require('./routes/weixinapp/serviceItems');
var messageSendRecords = require('./routes/weixinapp/messageSendRecords');
var comments = require('./routes/weixinapp/comments');
var points = require('./routes/weixinapp/points');
var merchantInMerchants = require('./routes/weixinapp/merchantInMerchants');
var supplyDemands = require('./routes/weixinapp/supplyDemands');
var weiXinInUsers = require('./routes/weixinapp/weiXinInUsers');
var memberServer = require('./services/member-service');
var weiXinInMerchantServer = require('./services/weiXinInMerchant-service');

var webRoot_weixinapp_wx = config.webRoot_pathapp
exports = module.exports = function (app) {

  //微信网址接入
  app.get([webRoot_weixinapp_wx , '/5zzg'].join(''), function (req, res) {
    var query = req.query;
    // 微信加密签名
    var signature = query.signature;
    // 随机字符串
    var echostr = query.echostr;
    // 时间戳
    var timestamp = query.timestamp;
    // 随机数
    var nonce = query.nonce;
    var flag = weixinPorts.checkSignature(signature, timestamp, nonce, config.TOKEN_weixin);
    // 确认请求来至微信
    if (flag) {
      res.write(echostr);
    }
    res.end();
  });
  //微信消息推送
  app.post([webRoot_weixinapp_wx , '/5zzg'].join(''), function (req, res) {
    var response = res;
    var formData = "";
    req.on("data", function (data) {
      formData += data;
    });
    req.on("end", function () {
      weixinPorts.processMessage(formData, function (xmlMessage) {
        res.write(xmlMessage);
        res.end();
      });
    });
  });

  //商户检测拦截器
  var interceptorMerchantWX = function (req, res, next) {
    var query = req.query;
    var body = req.body;
    var merchantId = query.merchantId ? query.merchantId : body.merchantId;
    var FromUserName = query.FromUserName ? query.FromUserName : body.FromUserName;
    if (merchantId) {
      next();
    } else {
      req.session.messages = {error:['无法获取商户信息']};
      res.redirect([webRoot_weixinapp, '/error?merchantId=', merchantId, '&FromUserName=', FromUserName].join(''));
    }
  }

  //错误页面
  app.get([webRoot_weixinapp_wx , '/error'].join(''), index.errorPage);
  app.get([webRoot_weixinapp_wx , '/index'].join(''), function (req, res) {
    res.render('weixinapp/index', {merchantId:'51f9d79e7bc0000c1600002a', FromUserName:'123123'});
    //res.render('weixinapp/jplayer-demo', {merchantId:'51f9d79e7bc0000c1600002a', FromUserName:'123123'});
  });

  //进入微信web首页
  app.get([webRoot_weixinapp_wx , ''].join(''), function (req, res) {
    res.redirect([webRoot_weixinapp, '/openAdvertisementList'].join(''));
  });

  //【商户详情】
  app.get([webRoot_weixinapp_wx, '/openMerchantInfoPage'].join(''), interceptorMerchantWX, merchants.openMerchantInfoPage);
  //【服务列表】
  app.get([webRoot_weixinapp_wx, '/openServiceItemList'].join(''),interceptorMerchantWX,  serviceItems.openServiceItemList);
  //【门店列表】
  app.get([webRoot_weixinapp_wx, '/openStoreList'].join(''),interceptorMerchantWX,  stores.openStoreList);
  //门店详情
  app.get([webRoot_weixinapp_wx, '/openStoreInfo'].join(''),interceptorMerchantWX,  stores.openStoreInfo);
  //服务详情
  app.get([webRoot_weixinapp_wx, '/openServiceItemInfo'].join(''),interceptorMerchantWX,  serviceItems.openServiceItemInfo);

  //【活动】广告列表页面
  app.get([webRoot_weixinapp_wx, '/openAdvertisementList'].join(''), interceptorMerchantWX, advertisements.openAdvertisementList);
  //广告详情
  app.get([webRoot_weixinapp_wx, '/openAdvertisementInfo'].join(''), interceptorMerchantWX, advertisements.openAdvertisementInfo);
  //【商户评论】商户评论页面
  app.get([webRoot_weixinapp_wx, '/openCommentList'].join(''), interceptorMerchantWX, comments.openCommentList);
  //添加评论
  app.post([webRoot_weixinapp_wx, '/addCommentSubmit'].join(''), comments.addCommentSubmit);

  /**
   * 会员必须登录
   */
    //服务申领
  app.get([webRoot_weixinapp_wx, '/applicableServiceItem'].join(''), serviceItems.applicableServiceItem_weixin);
  //【我的积分】我的积分页面
  app.get([webRoot_weixinapp_wx, '/openMyPointPage'].join(''), interceptorMerchantWX, points.openMyPointPage);
  //贝客积分兑换页面
  app.get([webRoot_weixinapp_wx, '/openMemberToUser'].join(''), interceptorMerchantWX, points.openMemberToUser);
  //会员积分转赠页面
  app.get([webRoot_weixinapp_wx, '/openMemberToMember'].join(''), interceptorMerchantWX, points.openMemberToMember);
  //贝壳积分转赠页面
  app.get([webRoot_weixinapp_wx, '/openUserToUser'].join(''), interceptorMerchantWX, points.openUserToUser);

  //用户积分合并/转赠
  app.get([webRoot_weixinapp_wx, '/userPointToUser'].join(''), points.userPointToUser_weixin);
  //会员积分合并/转赠
  app.get([webRoot_weixinapp_wx, '/memberPointToMember'].join(''), points.memberPointToMember_weixin);
  //会员积分兑换
  app.get([webRoot_weixinapp_wx, '/memberPointToUser'].join(''), points.memberPointToUser_weixin);
  //积分历史记录
  app.get([webRoot_weixinapp_wx, '/openPointHistoryList'].join(''), interceptorMerchantWX, points.openPointHistoryList);

  //【我的】我的会员服务列表
  app.get([webRoot_weixinapp_wx, '/openMyMemberServiceList'].join(''), interceptorMerchantWX, memberServices.getMemberServiceListByMemberId);
  //我的会员服务详情
  app.get([webRoot_weixinapp_wx, '/openMyMemberServiceInfo'].join(''), interceptorMerchantWX, memberServices.openMyMemberServiceInfo);
  //转赠页面
  app.get([webRoot_weixinapp_wx, '/openLargessOfMemberService'].join(''), interceptorMerchantWX, memberServices.openLargessOfMemberService);
  //发送转赠请求
  app.get([webRoot_weixinapp_wx, '/sendLargessSubmit'].join(''), memberServices.sendLargessSubmit);
  app.get([webRoot_weixinapp_wx, '/cancelLargessSubmit'].join(''), memberServices.cancelLargessSubmit);
  app.get([webRoot_weixinapp_wx, '/acceptLargessSubmit'].join(''), memberServices.acceptLargessSubmit);
  app.get([webRoot_weixinapp_wx, '/refuseLargessSubmit'].join(''), memberServices.refuseLargessSubmit);
  //使用页面
  app.get([webRoot_weixinapp_wx, '/openUsedOfMemberService'].join(''), interceptorMerchantWX, memberServices.openUsedOfMemberService);
  //使用用户的会员服务
  app.get([webRoot_weixinapp_wx, '/usedMemberServiceSubmit'].join(''), memberServices.usedMemberServiceSubmit);
  //服务删除
  app.get([webRoot_weixinapp_wx, '/deleteMemberServiceSubmit'].join(''), memberServices.deleteMemberServiceSubmit);


  //【我的消息】我的消息记录列表
  app.get([webRoot_weixinapp_wx, '/openMyMessageSendRecordList'].join(''), interceptorMerchantWX, messageSendRecords.messageSendRecordList);

  //商户联盟推荐列表
  app.get([webRoot_weixinapp_wx, '/openMerchantUnionList'].join(''), interceptorMerchantWX, merchantInMerchants.openMerchantUnionList);
  //推荐商户联盟详细
  app.get([webRoot_weixinapp_wx, '/openMerchantUnionInfo'].join(''), interceptorMerchantWX, merchantInMerchants.openMerchantUnionInfo);
  app.get([webRoot_weixinapp_wx, '/openToLoadHtmlPage'].join(''), interceptorMerchantWX, merchantInMerchants.openToLoadHtmlPage);

  //商户的资源供需信息
  app.get([webRoot_weixinapp_wx, '/openSupplyDemandList'].join(''), interceptorMerchantWX, supplyDemands.openSupplyDemandList);

  //微信端进行注册
  app.get([webRoot_weixinapp_wx , '/openSignUpPage'].join(''),interceptorMerchantWX, users.openSignUpPage);
  app.post([webRoot_weixinapp_wx , '/userSignUp'].join(''), users.userSignUp);

  //打开绑定微信与贝客汇用户页面
  app.get([webRoot_weixinapp_wx , '/openCreateWeiXinInUserPage'].join(''), interceptorMerchantWX, weiXinInUsers.openCreateWeiXinInUserPage);
  //保存绑定微信与贝客汇用户信息
  app.post([webRoot_weixinapp_wx , '/saveWeiXinInUser'].join(''), weiXinInUsers.saveWeiXinInUser);

  //建立微信与贝客汇商户的关联
  app.get([webRoot_weixinapp_wx , '/weixinin'].join(''), function (req, res) {
    var query = req.query;
    if (query.weiXinObject && query.merchantId) {
      weiXinInMerchantServer.createWeiXinInMerchant(query.weiXinObject, query.merchantId, function (status_wx, result_wx) {
        res.json({status:status_wx, result:result_wx});
      });
    } else {
      res.json({status:404, result:'参数错误'});
    }
  });
};
