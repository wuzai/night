var config = require('./config');
var webRoot_wehere = config.webRoot_wehere;
var Merchant = require('./model/Merchant').Merchant;
var index = require('./routes/wehere/index');
var merchants = require('./routes/wehere/merchants');
var users = require('./routes/wehere/users');
var stores = require('./routes/wehere/stores');
var members = require('./routes/wehere/members');
var serviceItems = require('./routes/wehere/serviceItems');
var memberPoints = require('./routes/wehere/memberPoints');
var sellRecords = require('./routes/wehere/sellRecords');
var supplyDemands = require('./routes/wehere/supplyDemands');
var advertisements = require('./routes/wehere/advertisements');
var consumeRecords = require('./routes/wehere/consumeRecords');
var comments = require('./routes/wehere/comments');
var newsInfos = require('./routes/wehere/newsInfos');
var products = require('./routes/wehere/products');
var productTypes = require('./routes/wehere/productTypes');
var bulletins = require('./routes/wehere/bulletins');
var messageSendRecords = require('./routes/wehere/messageSendRecords');
var memberServices = require('./routes/wehere/memberServices');
var fileServer = require('./utils/file-server');
var weiXinInMerchantServer = require('./services/weiXinInMerchant-service');

var webRoot_wehere_wx = config.webRoot_pathwehere;
//后台商户web端
exports = module.exports = function (app) {
  //登录拦截器
  var interceptorLogin = function (req, res, next) {
    if (!req.session || !req.session.user) {
      req.session.messages = {error:['用户未登录，请先登录']};
      res.redirect([webRoot_wehere, '/userSignIn'].join(''));
    } else {
      next();
    }
  };
  //商户检测拦截器/审核商户是否存在且登录
  var interceptorMerchant = function (req, res, next) {
    //userId从会话中获取，如果userId为空，提醒用户登录
    var user = req.session.user;
    if (user && user._id) {
      var merchant = req.session.merchant;
      if (merchant && merchant._id) {
        next();
      } else {
        Merchant.findOne({creator:user._id, state:'0000-0000-0000'}, '_id merchantName', function (err, mer) {
          if (mer) {
            req.session.merchant = {_id:mer._id, merchantName:mer.merchantName};
            next();
          } else {
            req.session.messages = {'error':['您的帐号还未创建商户,是否需要创建商户.']};
            res.redirect([webRoot_wehere, '/merchant/signUp'].join(''));
          }
        });
      }
    } else {
      req.session.messages = {error:['用户未登录，请先登录']};
      res.redirect([webRoot_wehere, '/userSignIn'].join(''));
    }
  };

  //文件服务器---显示图片路由接口
  app.get('/fileServer/showImages', fileServer.getFileByFileUrl);
  //文件服务器---显示视屏路由接口
  app.get('/fileServer/showVideos', fileServer.getFileByFileUrl);
  //kindEditor上传文件接口
  app.post('/kindEditor/nodeJs/upload_json.js', function (req, res) {
    fileServer.uploadFileMain(req, 'imgFile', '/sys/kindEditor/images', function (data) {
      if (data.success) {
        var fileFullUrl = [config.webRoot, config.imageRoot, data.fileUrl].join('');
        res.json({error:0, url:fileFullUrl, width:data.width ? data.width.toString() : null, height:data.height ? data.height.toString() : null});
      } else {
        res.json({error:1, message:data.error});
      }
    });
  });

  app.get('/', function (req, res) {
    res.redirect([webRoot_wehere , '/userSignIn'].join(''));
  });
  //商户首页登录
  app.get(webRoot_wehere_wx, function (req, res) {
    res.redirect([webRoot_wehere , '/userSignIn'].join(''));
  });

  //用户注册
  app.get([webRoot_wehere_wx , '/userSignUp'].join(''), users.openSignUpPage);
  app.post([webRoot_wehere_wx , '/userSignUp'].join(''), users.signUp);
  //用户登录
  app.get([webRoot_wehere_wx , '/userSignIn'].join(''), users.openSignInPage);
  app.post([webRoot_wehere_wx , '/userSignIn'].join(''), users.signIn);
  app.get([webRoot_wehere_wx , '/userSignOut'].join(''), users.signOut);
  //找回密码
  app.get([webRoot_wehere_wx , '/forgetPassword'].join(''), users.forgetPassword);
  //重置密码
  app.get([webRoot_wehere_wx , '/resetPassword'].join(''), users.openResetPasswordPage);
  app.post([webRoot_wehere_wx , '/resetPassword'].join(''), users.resetPassword);
  //重新获取验证码
  app.get([webRoot_wehere_wx , '/afreshCaptcha'].join(''), users.afreshCaptcha);

  //用户空间主页
  app.get([webRoot_wehere_wx , '/dashboard'].join(''), interceptorLogin, index.index);
  //商户加入
  app.get([webRoot_wehere_wx , '/merchant/signUp'].join(''), interceptorLogin, merchants.signUpPage);
  app.post([webRoot_wehere_wx , '/merchant/signUp'].join(''), interceptorLogin, merchants.signUp);

  //商户详情页面
  app.get([webRoot_wehere_wx , '/merchant/info'].join(''), interceptorMerchant, merchants.merchantInfo);
  app.get([webRoot_wehere_wx , '/merchant/edit'].join(''), interceptorMerchant, merchants.editPage);
  app.post([webRoot_wehere_wx , '/merchant/editSave'].join(''), interceptorMerchant, merchants.editSave);
  app.get([webRoot_wehere_wx , '/merchant/merchantDeleteImage'].join(''), interceptorMerchant, merchants.merchantDeleteImage);

  //门店列表
  app.get([webRoot_wehere_wx , '/merchant/storeList'].join(''), interceptorMerchant, stores.storeList);
  app.post([webRoot_wehere_wx , '/merchant/addStore'].join(''), interceptorMerchant, stores.addStore);
  app.get([webRoot_wehere_wx , '/merchant/storeEdit'].join(''), interceptorMerchant, stores.storeEditPage);
  app.post([webRoot_wehere_wx , '/merchant/storeEditSave'].join(''), interceptorMerchant, stores.storeEditSave);
  app.get([webRoot_wehere_wx , '/merchant/storeImageView'].join(''), interceptorMerchant, stores.storeImageView);
  app.post([webRoot_wehere_wx , '/merchant/uploadImageView'].join(''), interceptorMerchant, stores.uploadImageView);
  app.get([webRoot_wehere_wx , '/merchant/storeDelete'].join(''), interceptorMerchant, stores.storeDelete);
  //商户会员列表
  app.get([webRoot_wehere_wx , '/merchant/memberList'].join(''), interceptorMerchant, members.memberList);
  app.get([webRoot_wehere_wx , '/merchant/memberEnabled'].join(''), interceptorMerchant, members.memberEnabled);
  app.get([webRoot_wehere_wx , '/merchant/memberDisEnabled'].join(''), interceptorMerchant, members.memberDisEnabled);
  app.get([webRoot_wehere_wx , '/merchant/memberInfo'].join(''), interceptorMerchant, members.openMemberInfoPage);

  //商户联盟页面
  app.get([webRoot_wehere_wx , '/merchant/merchantUnion'].join(''), interceptorMerchant, merchants.openMerchantUnionPage);
  //保存商户联盟关联
  app.post([webRoot_wehere_wx , '/merchant/merchantUnionSave'].join(''), interceptorMerchant, merchants.merchantUnionSave);
  //接触商户联盟关联
  app.get([webRoot_wehere_wx , '/merchant/merchantUnionDelete'].join(''), interceptorMerchant, merchants.merchantUnionDelete);

  //打开资源供需列表页面
  app.get([webRoot_wehere_wx , '/merchant/supplyDemandList'].join(''), interceptorMerchant, supplyDemands.supplyDemandList);
  app.post([webRoot_wehere_wx , '/merchant/addSupplyDemand'].join(''), interceptorMerchant, supplyDemands.addSupplyDemand);
  app.get([webRoot_wehere_wx , '/merchant/supplyDemandEdit'].join(''), interceptorMerchant, supplyDemands.supplyDemandEditPage);
  app.post([webRoot_wehere_wx , '/merchant/supplyDemandEditSave'].join(''), interceptorMerchant, supplyDemands.supplyDemandEditSave);
  app.get([webRoot_wehere_wx , '/merchant/supplyDemandDelete'].join(''), interceptorMerchant, supplyDemands.supplyDemandDelete);

  //服务项目
  app.get([webRoot_wehere_wx , '/service/serviceItemList'].join(''), interceptorMerchant, serviceItems.serviceItemList);
  app.get([webRoot_wehere_wx , '/service/openServiceItemAddPage'].join(''), interceptorMerchant, serviceItems.openServiceItemAddPage);
  app.post([webRoot_wehere_wx , '/service/addServiceItem'].join(''), interceptorMerchant, serviceItems.addServiceItem);
  app.get([webRoot_wehere_wx , '/service/serviceItemEdit'].join(''), interceptorMerchant, serviceItems.serviceItemEditPage);
  app.post([webRoot_wehere_wx , '/service/serviceItemEditSave'].join(''), interceptorMerchant, serviceItems.serviceItemEditSave);
  app.get([webRoot_wehere_wx , '/service/serviceItemDelete'].join(''), interceptorMerchant, serviceItems.serviceItemDelete);
  app.get([webRoot_wehere_wx, '/service/findStoresByServiceItemId'].join(''), interceptorMerchant, serviceItems.findStoresByServiceItemId);
  app.post([webRoot_wehere_wx , '/service/usableStoresSave'].join(''), interceptorMerchant, serviceItems.usableStoresSave);
  //销售记录列表
  app.get([webRoot_wehere_wx , '/service/sellRecordList'].join(''), interceptorMerchant, sellRecords.sellRecordList);

  //服务申领审核
  app.get([webRoot_wehere_wx , '/serviceAudit/serviceItemApply'].join(''), interceptorMerchant, sellRecords.serviceItemApplyPage);
  //审核通过申领
  app.get([webRoot_wehere_wx , '/serviceAudit/serviceItemAuditPass'].join(''), interceptorMerchant, sellRecords.serviceItemAuditPass);
  //审核取消申领
  app.get([webRoot_wehere_wx , '/serviceAudit/serviceItemAuditNoPass'].join(''), interceptorMerchant, sellRecords.serviceItemAuditNoPass);
  //审核服务使用
  app.get([webRoot_wehere_wx , '/serviceAudit/serviceItemUsed'].join(''), interceptorMerchant, sellRecords.serviceItemUsedPage);
  //商户端审核用户使用请求
  app.post([webRoot_wehere_wx , '/serviceAudit/serviceItemUsedCheck'].join(''), interceptorMerchant, sellRecords.serviceItemUsedCheck);
  //商户端取消用户使用请求
  app.get([webRoot_wehere_wx , '/serviceAudit/serviceItemUsedCancel'].join(''), interceptorMerchant, sellRecords.serviceItemUsedCancel);

  //商户端服务使用发送验证码
  app.get([webRoot_wehere_wx , '/memberService/sendCaptchaOfUsedByMerchant'].join(''), interceptorMerchant, memberServices.sendCaptchaOfUsedByMerchant);
  app.get([webRoot_wehere_wx , '/memberService/memberServiceUsed'].join(''), interceptorMerchant, memberServices.memberServiceUsed);
  app.get([webRoot_wehere_wx , '/memberService/gotoMemberInfoPage'].join(''), interceptorMerchant, memberServices.gotoMemberInfoPage);
  //会员充值
  app.get([webRoot_wehere_wx , '/point/memberPointAdd'].join(''), interceptorMerchant, memberPoints.pointAddPage);
  app.get([webRoot_wehere_wx , '/point/memberPointAddCheck'].join(''), interceptorMerchant, memberPoints.memberPointAddCheck);
  app.post([webRoot_wehere_wx , '/point/memberPointAddSave'].join(''), interceptorMerchant, memberPoints.pointAddSave);
  app.get([webRoot_wehere_wx , '/point/consumeRecordList'].join(''), interceptorMerchant, consumeRecords.consumeRecordList);
  //会员积分使用
  app.get([webRoot_wehere_wx , '/point/memberPointUsed'].join(''), interceptorMerchant, memberPoints.memberPointUsedPage);
  app.get([webRoot_wehere_wx , '/point/getCaptchaByPointUsed'].join(''), interceptorMerchant, memberPoints.getCaptchaByPointUsed);
  app.get([webRoot_wehere_wx , '/point/memberPointUsedSave'].join(''), interceptorMerchant, memberPoints.memberPointUsedSave);


  //发布活动、广告
  app.get([webRoot_wehere_wx , '/advertisement'].join(''), interceptorMerchant, advertisements.advertisementList);
  app.post([webRoot_wehere_wx , '/advertisement/addAdvertisementSave'].join(''), interceptorMerchant, advertisements.advertisementAddSave);
  app.get([webRoot_wehere_wx , '/advertisement/editAdvertisement'].join(''), interceptorMerchant, advertisements.advertisementEditPage);
  app.post([webRoot_wehere_wx , '/advertisement/editAdvertisementSave'].join(''), interceptorMerchant, advertisements.advertisementEditSave);
  app.get([webRoot_wehere_wx , '/advertisement/advertisementDelete'].join(''), interceptorMerchant, advertisements.advertisementDelete);

  //商户消息发布
  app.get([webRoot_wehere_wx , '/message/messageSend'].join(''), interceptorMerchant, messageSendRecords.openMessageSendPage);
  app.post([webRoot_wehere_wx , '/message/messageSendSave'].join(''), interceptorMerchant, messageSendRecords.messageSendSave);
  //商户消息
  app.get([webRoot_wehere_wx , '/message/messagesOfMerchant'].join(''), interceptorMerchant, messageSendRecords.openMessagesOfMerchant);
  //用户评论列表
  app.get([webRoot_wehere_wx , '/message/commentList'].join(''), interceptorMerchant, comments.commentList);
  app.get([webRoot_wehere_wx , '/message/commentControlList'].join(''), interceptorLogin, comments.commentControlList);
  app.get([webRoot_wehere_wx , '/message/commentDelete'].join(''), interceptorLogin, comments.commentDelete);
  //帖子管理，用户发表的主题列表
  app.get([webRoot_wehere_wx , '/message/bulletinList'].join(''), interceptorLogin, bulletins.bulletinList);
  app.get([webRoot_wehere_wx , '/message/bulletinDelete'].join(''), interceptorLogin, bulletins.bulletinDelete);
  //用户回帖列表
  app.get([webRoot_wehere_wx , '/message/followBulletinList'].join(''), interceptorLogin, bulletins.followBulletinList);
  app.get([webRoot_wehere_wx , '/message/followBulletinDelete'].join(''), interceptorLogin, bulletins.followBulletinDelete);

  //新闻类
  app.get([webRoot_wehere_wx , '/newsInfo/hotNewsList'].join(''), interceptorLogin, newsInfos.hotNewsList);
  app.get([webRoot_wehere_wx , '/newsInfo/fashionNewsList'].join(''), interceptorLogin, newsInfos.fashionNewsList);
  app.post([webRoot_wehere_wx , '/newsInfo/addNewsInfoSave'].join(''), interceptorLogin, newsInfos.addNewsInfoSave);
  app.get([webRoot_wehere_wx , '/newsInfo/editNewsInfo'].join(''), interceptorLogin, newsInfos.newsInfoEditPage);
  app.post([webRoot_wehere_wx , '/newsInfo/editNewsInfoSave'].join(''), interceptorLogin, newsInfos.newsInfoEditSave);
  app.get([webRoot_wehere_wx , '/newsInfo/newsInfoDelete'].join(''), interceptorLogin, newsInfos.newsInfoDelete);
  app.get([webRoot_wehere_wx , '/newsInfo/newsInfoDeleteImage'].join(''), interceptorLogin, newsInfos.newsInfoDeleteImage);

  //产品类
  app.get([webRoot_wehere_wx , '/club/clubProductList'].join(''), interceptorMerchant, products.clubProductList);
  app.post([webRoot_wehere_wx , '/club/addProductSave'].join(''), interceptorMerchant, products.addProductSave);
  app.get([webRoot_wehere_wx , '/club/editProduct'].join(''), interceptorMerchant, products.productEditPage);
  app.post([webRoot_wehere_wx , '/club/editProductSave'].join(''), interceptorMerchant, products.productEditSave);
  app.get([webRoot_wehere_wx , '/club/productDelete'].join(''), interceptorMerchant, products.productDelete);
  app.get([webRoot_wehere_wx , '/club/productDeleteImage'].join(''), interceptorMerchant, products.productDeleteImage);
  //产品类型
  app.get([webRoot_wehere_wx , '/club/clubProductTypeList'].join(''), interceptorLogin, productTypes.clubProductTypeList);
  app.post([webRoot_wehere_wx , '/club/addProductTypeSave'].join(''), interceptorLogin, productTypes.addProductTypeSave);
  app.get([webRoot_wehere_wx , '/club/editProductType'].join(''), interceptorLogin, productTypes.productTypeEditPage);
  app.post([webRoot_wehere_wx , '/club/editProductTypeSave'].join(''), interceptorLogin, productTypes.productTypeEditSave);
  app.get([webRoot_wehere_wx , '/club/productTypeDelete'].join(''), interceptorLogin, productTypes.productTypeDelete);
  //商户管理
  app.get([webRoot_wehere_wx , '/merchant/merchantControlList'].join(''), interceptorLogin, merchants.merchantControlList);
  app.get([webRoot_wehere_wx , '/merchant/changeMerchantByState'].join(''), interceptorLogin, merchants.changeMerchantByState);

  //建立微信与贝客汇商户的关联
  app.get([webRoot_wehere_wx , '/weiXinInMerchant'].join(''), function (req, res) {
    var query = req.query;
    var merchantId = query.merchantId;
    var weiXinObject = query.weiXinObject ? query.weiXinObject.trim() : '';
    if (weiXinObject && merchantId) {
      weiXinInMerchantServer.updateWeiXinInMerchant(weiXinObject, merchantId, function (status_wx, result_wx) {
        if (status_wx === 200) {
          res.json({status:200});
        } else {
          res.json({status:404, error:result_wx.error});
        }
      });
    } else {
      res.json({status:404, error:'参数传递错误'});
    }
  });
};