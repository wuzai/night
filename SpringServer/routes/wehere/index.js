var config = require('../../config');
var webRoot_wehere = config.webRoot_wehere;
var storeServer = require('../../services/store-service');
var merchantServer = require('../../services/merchant-service');
var memberServer = require('../../services/member-service');
var serviceItemServer = require('../../services/serviceItem-service');
var sellRecordServer = require('../../services/sellRecord-service');
var consumeRecordServer = require('../../services/consumeRecord-service');

/**
 * 进入控制面板页面，获取相关数据
 * @param req
 * @param res
 */
exports.index = function (req, res) {
  //userId从会话中获取，如果userId为空，提醒用户登录
  var user = req.session.user;
  if (user && user._id) {
    merchantServer.getMerchantByUserId(user._id, function (status_merchant, result_merchant) {
      if (status_merchant === 200 && result_merchant.merchant) {
        var merchantId = result_merchant.merchant._id;
        //获取门店数量
        storeServer.countStoresByMerchantId(merchantId, function (status_store, result_store) {
          //获取会员数量
          memberServer.countMembersByMerchantId(merchantId, function (status_member, result_member) {
            //获取服务数量
            serviceItemServer.countProductByMerchantId(merchantId, function (status_serviceItem, result_serviceItem) {
              //获取待审核服务
              sellRecordServer.findSellRecordOfUnfinishedByMerchantId(merchantId, function (status_store, result_sellRecords) {
                //获取待审核的使用请求
                consumeRecordServer.findConsumeRecordOfUnfinishedByMerchantId(merchantId, function (status_store, result_consumeRecords) {
                  //获取新增会员
                  memberServer.findMemberListOfNewByMerchantId(merchantId, 10, function (status_members, result_members) {
                    res.render('wehere/index', {
                      merchant        :result_merchant.merchant,
                      countStore      :result_store.count,
                      countMember     :result_member.count,
                      countServiceItem:result_serviceItem.count,
                      sellRecords     :result_sellRecords.sellRecords,
                      consumeRecords  :result_consumeRecords.consumeRecords,
                      members         :result_members.members
                    });
                  });
                });
              });
            });
          });
        });
      } else {
        res.render('wehere/index', {
          merchant        :null,
          countStore      :0,
          countMember     :0,
          countServiceItem:0,
          sellRecords     :[],
          consumeRecords  :[],
          members         :[]
        });
      }
    });
  } else {
    req.session.messages = {error:['用户未登录，请先登录']};
    res.redirect([webRoot_wehere, '/userSignIn'].join(''));
  }
};