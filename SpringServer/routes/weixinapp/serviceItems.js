var config = require('../../config');
var webRoot_weixinapp = config.webRoot_weixinapp;
var ServiceItem = require('../../model/ServiceItem').ServiceItem;
var serviceItemServer = require('../../services/serviceItem-service');
var memberPointServer = require('../../services/memberPoint-service');
var memberServer = require('../../services/member-service');
var userWXService = require('./userWXService');

//商户服务列表
var openServiceItemList = function (req, res) {
  var query = req.query;
  var merchantId = query.merchantId;
  var FromUserName = query.FromUserName;
  serviceItemServer.findServiceItemListByMerchantId(merchantId, function (status_item, result_item) {
    if (status_item === 200) {
      res.render('weixinapp/serviceItemList', {merchantId:merchantId, FromUserName:FromUserName, serviceItems:result_item.serviceItems});
    } else {
      req.session.messages = {error:['未获取到相关数据.']};
      res.redirect([webRoot_weixinapp, '/error?merchantId=', merchantId , '&FromUserName=', FromUserName].join(''));
    }
  });
}

//服务详情页面
var openServiceItemInfo = function (req, res) {
  var query = req.query;
  var merchantId = query.merchantId;
  var FromUserName = query.FromUserName;
  var serviceItemId = query.serviceItemId;
  var pageNum = query.pageNum;
  ServiceItem.findById(serviceItemId).populate('postImage', 'imageUrl').exec(function (err, serviceItem) {
    if (serviceItem && serviceItem.state === '0000-0000-0000') {

      //打开服务详情页面
      var callbackServiceItemInfoPage = function (merchantId, FromUserName, serviceItemId, flag) {
        res.render('weixinapp/serviceItemInfo-full', {merchantId:merchantId, FromUserName:FromUserName, serviceItem:serviceItem, joinFlag:flag});
      };

      //如果是希斯杰商户（需要做出限定，积分不足2000的不可以申领服务）
      if (config.merchantIds.XSJ == merchantId && serviceItem.isMinMemberPoint) {
        //获取会员积分
        userWXService.getUserIdByFromUserName(merchantId, FromUserName, null, function (status_userId, result_userId) {
          if (status_userId === 200) {
            var userId = result_userId.userId;
            memberPointServer.getMemberPointByUserAndMerchant(userId, merchantId, function (status_mp, result_mp) {
              if (status_mp === 200) {
                var memberPoint = result_mp.memberPoint ? result_mp.memberPoint.availablePoint : 0;
                var minMemberPoint = config.constantConf.XSJ.minMemberPoint;//希斯杰申领服务最少需要的积分数
                if (Number(memberPoint) >= Number(minMemberPoint)) {
                  callbackServiceItemInfoPage(merchantId, FromUserName, serviceItemId, {flag:true, isMinMemberPoint:serviceItem.isMinMemberPoint});
                } else {
                  callbackServiceItemInfoPage(merchantId, FromUserName, serviceItemId, {flag:false, isMinMemberPoint:serviceItem.isMinMemberPoint, error:'您的会员积分只有' + memberPoint + '请充值后再申领.'});
                }
              } else {
                callbackServiceItemInfoPage(merchantId, FromUserName, serviceItemId, {flag:false, isMinMemberPoint:serviceItem.isMinMemberPoint, error:result_mp.error});
              }
            });
          } else {
            callbackServiceItemInfoPage(merchantId, FromUserName, serviceItemId, {flag:false, isMinMemberPoint:serviceItem.isMinMemberPoint, error:result_userId.error});
          }
        });
      } else {
        callbackServiceItemInfoPage(merchantId, FromUserName, serviceItemId, {flag:true, isMinMemberPoint:serviceItem.isMinMemberPoint});
      }
    } else {
      req.session.messages = {error:['未获取到相关数据.']};
      res.redirect([webRoot_weixinapp, '/error?merchantId=', merchantId, '&FromUserName=', FromUserName].join(''));
    }
  });
};

//服务项目的申领（用户如果不是该商户会员，只能申领免费的服务，默认创建会员）
var applicableServiceItem_weixin = function (req, res) {
  var query = req.query;
  var merchantId = query.merchantId;
  var FromUserName = query.FromUserName;
  var userId = query.userId;
  var serviceItemId = query.serviceItemId;

  if (!query || !serviceItemId || !merchantId || !FromUserName) {
    res.json({status:400, error:'请求参数错误.'});
    return;
  }
  userWXService.getUserIdByFromUserName(merchantId, FromUserName, userId, function (status_userId, result_userId) {
    if (status_userId === 200) {
      var userId = result_userId.userId;

      var callbackApplicableServiceItem = function (userId, merchantId, serviceItemId) {
        serviceItemServer.applicableServiceItemByUserId(userId, merchantId, serviceItemId, function (status_s, result_s) {
          if (status_s === 200) {
            res.json({status:status_s});
          } else {
            res.json({status:status_s, error:result_s.error});
          }
        });
      };

      ServiceItem.findById(serviceItemId, '_id isMinMemberPoint', function (err, serviceItem) {
        if (err) return res.json({status:404, error:err});
        if (serviceItem) {
          //如果是希斯杰商户（需要做出限定，积分不足2000的不可以申领服务）
          if (config.merchantIds.XSJ == merchantId && serviceItem.isMinMemberPoint) {
            memberPointServer.getMemberPointByUserAndMerchant(userId, merchantId, function (status_mp, result_mp) {
              if (status_mp === 200) {
                var memberPoint = result_mp.memberPoint ? result_mp.memberPoint.availablePoint : 0;
                var minMemberPoint = config.constantConf.XSJ.minMemberPoint;//希斯杰申领服务最少需要的积分数
                if (Number(memberPoint) >= Number(minMemberPoint)) {
                  callbackApplicableServiceItem(userId, merchantId, serviceItemId);
                } else {
                  res.json({status:444, error:'您的会员积分只有' + memberPoint + '请充值后再申领.'});
                }
              } else {
                res.json({status:400, error:result_mp.error});
              }
            });
          } else {
            callbackApplicableServiceItem(userId, merchantId, serviceItemId);
          }
        } else {
          res.json({status:400, error:'未获取该服务项目相关数据'});
          return;
        }
      });
    } else {
      res.json({status:400, error:result_userId.error});
    }
  });
};

module.exports = {
  openServiceItemInfo         :openServiceItemInfo,
  openServiceItemList         :openServiceItemList,
  applicableServiceItem_weixin:applicableServiceItem_weixin
};