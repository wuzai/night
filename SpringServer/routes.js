var config = require('./config');
var authority = require('./services/authority');
var userAuthorization = require('./routes/api-routes-v1/user-authorization');
var merchants = require('./routes/api-routes-v1/merchants');
var user = require('./routes/api-routes-v1/user');
var messageSendRecords = require('./routes/api-routes-v1/messageSendRecords');
var serviceItems = require('./routes/api-routes-v1/serviceItems');
var comments = require('./routes/api-routes-v1/comments');
var inviteMerchantRecords = require('./routes/api-routes-v1/inviteMerchantRecords');
var inviteMemberRecords = require('./routes/api-routes-v1/inviteMemberRecords');
var advertisements = require('./routes/api-routes-v1/advertisements');
var configInfo = require('./routes/api-routes-v1/configInfo');
var captchaRecords = require('./routes/api-routes-v1/captchaRecords');
var stores = require('./routes/api-routes-v1/stores');
var points = require('./routes/api-routes-v1/points');
var bulletins = require('./routes/api-routes-v1/bulletins');
var newsInfos = require('./routes/api-routes-v1/newsInfos');
var products = require('./routes/api-routes-v1/products');

exports = module.exports = function (app) {
  //用户注册
  app.post('/api/v1/signup', userAuthorization.signUp);
  //用户登录
  app.post('/api/v1/signin', userAuthorization.signIn);

  //根据用户Id获取用户信息
  app.get('/api/v1/users/:id', user.getUserById);
  //获取所有用户
  app.get('/api/v1/users', user.findUsers);
  //修改用户资料
  app.put('/api/v1/users/:id', user.updateUserById);
  //修改密码
  app.put('/api/v1/password/:id', user.updatePassword);
  //忘记密码时,重置密码
  app.put('/api/v1/resetPassword', user.resetPassword);

  //重置密码时,用户获取验证码
  app.get('/api/v1/captchaRecord', captchaRecords.getCaptcha);

  //获取商户列表信息
  app.get('/api/v1/merchants', merchants.list);
  app.get('/api/v1/merchantTypes', merchants.findMerchantTypeList);
  //根据商户Id获取商户详细信息
  app.get('/api/v1/merchants/:id', merchants.detail);

  //获取门店下可用的服务
  app.get('/api/v1/findServiceItemsOfStore', stores.findServiceItemsOfStore);

  //推荐用户接口
  app.post('/api/v1/recommendUser', inviteMemberRecords.recommend);
  //商户推荐接口
  app.post('/api/v1/recommend', inviteMerchantRecords.recommend);

  //申领服务
  app.post('/api/v1/applicableServiceItem', serviceItems.applicableServiceItem);
  //获取用户下所有的服务
  app.get('/api/v1/servicesOfUser', serviceItems.getServiceItemsByUserId);

  //服务转赠接口
  app.get('/api/v1/sendLargess', serviceItems.sendLargess);
  //取消转借
  app.get('/api/v1/cancelLargess', serviceItems.cancelLargess);
  //拒接接收转借
  app.get('/api/v1/refuseLargess', serviceItems.refuseLargess);
  //同意接收转借
  app.get('/api/v1/acceptLargess', serviceItems.acceptLargess);

  //使用用户服务
  app.get('/api/v1/useServiceItem', serviceItems.useServiceItem);

  //商户评论
  app.post('/api/v1/comments', authority.basicAuth, comments.add);
  //获取商户评论列表
  app.get('/api/v1/comments', authority.basicAuth, comments.list);

  //获取某一用户下的消息发送记录列表
  app.post('/api/v1/sendMessageRecords', messageSendRecords.sendMessage);
  //获取某一用户下的消息发送记录列表
  app.get('/api/v1/sendMessageRecords', messageSendRecords.list);
  //用户查看消息
  app.post('/api/v1/readMessage',messageSendRecords.readMessage);
  //清空消息
  app.get('/api/v1/deleteAllSendMessageRecords', messageSendRecords.deleteAllMessageSendRecords);
  //删除一条消息
  app.get('/api/v1/deleteSendMessageRecords', messageSendRecords.deleteMessageSendRecords);

  //获取广告列表
  app.get('/api/v1/advertisements', advertisements.advertisementList);
  //获取门店下的可用广告
  app.get('/api/v1/findAdvertisementOfMerchant', advertisements.findAdvertisementOfMerchant);

  //获取积分记录
  app.get('/api/v1/pointRecords', points.findPointRecord);
  //用户积分合并/转赠
  app.post('/api/v1/userPointToUser', points.userPointToUser);
  //会员积分合并/转赠
  app.post('/api/v1/memberPointToMember', points.memberPointToMember);
  //会员积分兑换
  app.post('/api/v1/memberPointToUser', points.memberPointToUser);

  //获取平台积分规则(配置中获取)
  app.get('/api/v1/regulation', configInfo.getRegulation);

  //获取论坛主题列表
  app.get('/api/v1/bulletins', bulletins.findBulletins);
  //发布主题
  app.post('/api/v1/bulletins', bulletins.publishBulletin);
  //回复主题
  app.post('/api/v1/followBulletins', bulletins.followBulletin);
  //获取主题下的回复
  app.get('/api/v1/followBulletins', bulletins.findFollowBulletins);

  //获取新闻资讯列表
  app.get('/api/v1/newsInfos', newsInfos.findNewsInfos);
  //获取服务指南列表
  app.get('/api/v1/products', products.findProducts);


  //app.get('/wehere/test', user.test);

};