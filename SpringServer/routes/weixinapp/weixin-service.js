var config = require('../../config.js');
var ObjectId = require('mongoose').Types.ObjectId;
var weiXinInUserServer = require('../../services/weiXinInUser-service');
var userPointServer = require('../../services/userPoint-service');
var memberPointServer = require('../../services/memberPoint-service');
var memberServer = require('../../services/member-service');
var weiXinAppServer = require('../../services/weiXinApp-service');

//返回消息类型：文本
var RESP_MESSAGE_TYPE_TEXT = "text";
//返回消息类型：音乐
var RESP_MESSAGE_TYPE_MUSIC = "music";
//返回消息类型：图文
var RESP_MESSAGE_TYPE_NEWS = "news";

/**
 * 根据微信OpenId获取用户Id
 * @param weiXinObject
 * @param callback
 */
var getUserIdByWeiXinObject = function (FromUserName, merchantId, callback) {
  weiXinInUserServer.getWeiXinInUserByWeiXinObject(FromUserName, function (status_user, result_user) {
    if (status_user === 410) {
      var error = [result_user.error, '\n<a href="', config.webRoot, config.webRoot_weixinapp, '/openCreateWeiXinInUserPage?merchantId=', merchantId , '&FromUserName=' , FromUserName, '">现在绑定</a>'].join('');
      callback(410, {error:error});
    } else {
      callback(status_user, result_user);
    }
  });
};

//获取我的会员服务
var findMyMemberService = function (FromUserName, merchantId, callback) {
  getUserIdByWeiXinObject(FromUserName, merchantId, function (status_user, result_user) {
    if (status_user === 200) {
      var userId = result_user.userId;
      weiXinAppServer.findMyMemberServiceData(merchantId, userId, function (status_wxa, memberServiceList) {
        var Articles = [];
        if (status_wxa === 200 && memberServiceList && memberServiceList.length > 0) {
          memberServiceList.forEach(function (memberService) {
            var item = {
              Title      :memberService.title,
              Description:memberService.description,
              PicUrl     :memberService.imageUrl ? [config.webRoot, config.imageRoot , memberService.imageUrl].join('') : '',
              Url        :[config.webRoot, config.webRoot_weixinapp, '/openMyMemberServiceInfo?FromUserName=' , FromUserName , '&merchantId=', merchantId, '&memberServiceId=', memberService._id, '&type=', memberService.type].join('')
            }
            Articles.push(item);
          });
          var item0 = {
            Title      :'更多我的会员服务  »',
            Description:'查看更多我的会员服务  »',
            PicUrl     :[config.webRoot, config.imageRoot , '/sys/weixin/images/wx_ms80@80.png'].join(''),
            Url        :[config.webRoot, config.webRoot_weixinapp, '/openMyMemberServiceList?merchantId=', merchantId , '&FromUserName=' , FromUserName, '&userId=', userId].join('')
          }
          Articles.push(item0);
        } else {
          var item = {
            Title      :'我的包包',
            Description:'查看在我的会员服务  »',
            PicUrl     :[config.webRoot, config.imageRoot , '/sys/weixin/images/wx_ms640@320.png'].join(''),
            Url        :[config.webRoot, config.webRoot_weixinapp, '/openMyMemberServiceList?merchantId=', merchantId , '&FromUserName=' , FromUserName, '&userId=', userId].join('')
          }
          if(merchantId==config.merchantIds.XSJ){
            item.Title = '我的收藏';
          }
          Articles.push(item);
        }
        var message = {
          MsgType :RESP_MESSAGE_TYPE_NEWS,
          Articles:Articles
        }
        callback(200, {message:message});
      });
    } else {
      var message = {
        MsgType:RESP_MESSAGE_TYPE_TEXT,
        Content:result_user.error
      }
      callback(200, {message:message});
    }
  });
}

//获取商户广告
var findAdvertisement = function (FromUserName, merchantId, callback) {
  weiXinAppServer.findAdvertisementData(merchantId, function (status_wxa, advertisementList) {
    var Articles = [];
    if (status_wxa === 200 && advertisementList && advertisementList.length > 0) {
      advertisementList.forEach(function (advertisement) {
        var item = {
          Title      :advertisement.title,
          Description:advertisement.description,
          PicUrl     :advertisement.imageUrl ? [config.webRoot, config.imageRoot , advertisement.imageUrl].join('') : '',
          Url        :[config.webRoot, config.webRoot_weixinapp, '/openAdvertisementInfo?FromUserName=' , FromUserName , '&merchantId=', merchantId, '&advertisementId=', advertisement._id].join('')
        }
        Articles.push(item);
      });
      var item0 = {
        Title      :'更多活动动态  »',
        Description:'查看更多活动动态  »',
        PicUrl     :[config.webRoot, config.imageRoot , '/sys/weixin/images/wx_mad80@80.png'].join(''),
        Url        :[config.webRoot, config.webRoot_weixinapp, '/openAdvertisementList?FromUserName=' , FromUserName , '&merchantId=' , merchantId].join('')
      }
      Articles.push(item0);
    } else {
      var item = {
        Title      :'更多活动动态',
        Description:'查看最近发布的活动  »',
        PicUrl     :[config.webRoot, config.imageRoot , '/sys/weixin/images/wx_mad640@320.png'].join(''),
        Url        :[config.webRoot, config.webRoot_weixinapp, '/openAdvertisementList?FromUserName=' , FromUserName , '&merchantId=' , merchantId].join('')
      }
      Articles.push(item);
    }
    var message = {
      MsgType :RESP_MESSAGE_TYPE_NEWS,
      Articles:Articles
    }
    callback(200, {message:message});
  });
}

//获取商户服务
var findServiceItem = function (FromUserName, merchantId, callback) {
  weiXinAppServer.findServiceItemData(merchantId, function (status_wxa, serviceItemList) {
    var Articles = [];
    if (status_wxa === 200 && serviceItemList && serviceItemList.length > 0) {
      serviceItemList.forEach(function (serviceItem) {
        var item = {
          Title      :serviceItem.title,
          Description:serviceItem.description,
          PicUrl     :serviceItem.imageUrl ? [config.webRoot, config.imageRoot , serviceItem.imageUrl].join('') : '',
          Url        :[config.webRoot, config.webRoot_weixinapp, '/openServiceItemInfo?FromUserName=' , FromUserName , '&merchantId=', merchantId, '&serviceItemId=', serviceItem._id].join('')
        }
        Articles.push(item);
      });
      var item0 = {
        Title      :'更多服务  »',//更多商户的服务套餐
        Description:'查看更多服务套餐  »',//查看更多商户的服务套餐
        PicUrl     :[config.webRoot, config.imageRoot , '/sys/weixin/images/wx_item80@80.png'].join(''),
        Url        :[config.webRoot, config.webRoot_weixinapp, '/openServiceItemList?FromUserName=' , FromUserName , '&merchantId=' , merchantId].join('')
      }
      Articles.push(item0);
    } else {
      var item_serviceItem = {
        Title      :'更多服务',//商户发布的服务套餐
        Description:'查看最近发布的活动',//查看商户最近发布服务活动
        PicUrl     :[config.webRoot, config.imageRoot , '/sys/weixin/images/wx_item640@320.png'].join(''),
        Url        :[config.webRoot, config.webRoot_weixinapp, '/openServiceItemList?FromUserName=' , FromUserName , '&merchantId=' , merchantId].join('')
      }
      Articles.push(item_serviceItem);
    }
    var item_merchantInfo = {
      Title      :'关于我们  »',//商户的介绍和详情
      Description:'关于我们  »',//查看商户的介绍和详情
      PicUrl     :[config.webRoot, config.imageRoot , '/sys/weixin/images/wx_info80@80.png'].join(''),
      Url        :[config.webRoot, config.webRoot_weixinapp, '/openMerchantInfoPage?FromUserName=' , FromUserName , '&merchantId=' , merchantId].join('')
    }
    Articles.push(item_merchantInfo);
    var item_store = {
      Title      :'联系我们  »',//商户门店信息
      Description:'联系我们  »',//查看商户的门店信息
      PicUrl     :[config.webRoot, config.imageRoot , '/sys/weixin/images/wx_store80@80.png'].join(''),
      Url        :[config.webRoot, config.webRoot_weixinapp, '/openStoreList?FromUserName=' , FromUserName , '&merchantId=' , merchantId].join('')
    }
    Articles.push(item_store);
    var message = {
      MsgType :RESP_MESSAGE_TYPE_NEWS,
      Articles:Articles
    }
    callback(200, {message:message});
  });
}

//获取商户评论
var findComment = function (FromUserName, merchantId, callback) {
  weiXinAppServer.findCommentData(merchantId, function (status_wxa, commentList) {
    var Articles = [];
    if (status_wxa === 200 && commentList && commentList.length > 0) {
      commentList.forEach(function (comment, index) {
        var pic = '';
        if (index == 0) {
          pic = [config.webRoot, config.imageRoot , '/sys/weixin/images/wx_com640@320.png'].join('');
        } else {
          pic = comment.imageUrl ? [config.webRoot, config.imageRoot , comment.imageUrl].join('') : '';
        }
        var item = {
          Title      :comment.title,
          Description:comment.description,
          PicUrl     :pic,
          Url        :[config.webRoot, config.webRoot_weixinapp, '/openCommentList?FromUserName=' , FromUserName , '&merchantId=' , merchantId].join('')
        }
        Articles.push(item);
      });
    } else {
      var item = {
        Title      :'商户评论',
        Description:'查看更多对商户的评论',
        PicUrl     :[config.webRoot, config.imageRoot , '/sys/weixin/images/wx_com640@320.png'].join(''),
        Url        :[config.webRoot, config.webRoot_weixinapp, '/openCommentList?FromUserName=' , FromUserName , '&merchantId=' , merchantId].join('')
      }
      Articles.push(item);
    }
    var message = {
      MsgType :RESP_MESSAGE_TYPE_NEWS,
      Articles:Articles
    }
    callback(200, {message:message});
  });
}

//获取我的积分
var findMyPoint = function (FromUserName, merchantId, callback) {
  getUserIdByWeiXinObject(FromUserName, merchantId, function (status_user, result_user) {
    if (status_user === 200) {
      var userId = result_user.userId;
      var Articles = [];
      userPointServer.getUserPoint(userId, function (status_userPoint, result_userPoint) {
        var userPoint = 0;
        var memberPoint = 0;
        if (status_userPoint === 200) {
          userPoint = result_userPoint.userPoint ? result_userPoint.userPoint.availablePoint : 0;
        }
        memberPointServer.getMemberPointByUserAndMerchant(userId, merchantId, function (status_memberPoint, result_memberPoint) {
          if (status_memberPoint === 200) {
            memberPoint = result_memberPoint.memberPoint ? result_memberPoint.memberPoint.availablePoint : 0;
          }
          var item1 = {
            Title      :'我的积分',
            Description:'查看在该商户的会员积分和贝壳积分,点击进入',
            PicUrl     :[config.webRoot, config.imageRoot , '/sys/weixin/images/wx_mypoint640@320.png'].join(''),
            Url        :[config.webRoot, config.webRoot_weixinapp, '/openMyPointPage?FromUserName=' , FromUserName, '&merchantId=' , merchantId, '&userId=', userId].join('')
          }
          var item2 = {
            Title      :'贝壳积分转赠',
            Description:'贝壳积分转赠,点击查看积分记录',
            //PicUrl     :[config.webRoot, config.imageRoot , '/sys/weixin/images/wx_userpointsend80@80.png'].join(''),
            PicUrl     :'',
            Url        :[config.webRoot, config.webRoot_weixinapp, '/openUserToUser?FromUserName=' , FromUserName, '&merchantId=' , merchantId, '&userId=', userId].join('')
          }
          var item3 = {
            Title      :'会员积分转赠',
            Description:'会员积分转赠,点击查看积分记录',
            //PicUrl     :[config.webRoot, config.imageRoot , '/sys/weixin/images/wx_memberpointsend80@80.png'].join(''),
            PicUrl     :'',
            Url        :[config.webRoot, config.webRoot_weixinapp, '/openMemberToMember?FromUserName=' , FromUserName, '&merchantId=' , merchantId, '&userId=', userId].join('')
          }
          var item4 = {
            Title      :'贝壳积分兑换',
            Description:'贝壳积分兑换,点击查看积分记录',
            //PicUrl     :[config.webRoot, config.imageRoot , '/sys/weixin/images/wx_pointchange80@80.png'].join(''),
            PicUrl     :'',
            Url        :[config.webRoot, config.webRoot_weixinapp, '/openMemberToUser?FromUserName=' , FromUserName, '&merchantId=' , merchantId, '&userId=', userId].join('')
          }
          var item5 = {
            Title      :'我的贝壳积分：' + userPoint,
            Description:'我的贝壳积分：' + userPoint + ',点击查看积分记录',
            //PicUrl     :[config.webRoot, config.imageRoot , '/sys/weixin/images/wx_userpoint80@80.png'].join(''),
            PicUrl     :'',
            Url        :[config.webRoot, config.webRoot_weixinapp, '/openPointHistoryList?type=user&FromUserName=' , FromUserName, '&merchantId=' , merchantId, '&userId=', userId].join('')
          }
          var item6 = {
            Title      :'我的会员积分：' + memberPoint,
            Description:'我的会员积分：' + memberPoint + ',点击查看积分记录',
            //PicUrl     :[config.webRoot, config.imageRoot , '/sys/weixin/images/wx_memberpoint80@80.png'].join(''),
            PicUrl     :'',
            Url        :[config.webRoot, config.webRoot_weixinapp, '/openPointHistoryList?type=member&FromUserName=' , FromUserName, '&merchantId=' , merchantId, '&userId=', userId].join('')
          }
          Articles.push(item1, item2, item3, item4, item5, item6);
          var message = {
            MsgType :RESP_MESSAGE_TYPE_NEWS,
            Articles:Articles
          }
          callback(200, {message:message});
        });
      });
    } else {
      var message = {
        MsgType:RESP_MESSAGE_TYPE_TEXT,
        Content:result_user.error
      }
      callback(200, {message:message});
    }
  });
}

//获取我的消息
var findMyMessage = function (FromUserName, merchantId, callback) {
  getUserIdByWeiXinObject(FromUserName, merchantId, function (status_user, result_user) {
    if (status_user === 200) {
      var userId = result_user.userId;
      weiXinAppServer.findMyMessageData(userId, function (status_wxa, messageSendRecordList) {
        var Articles = [];
        if (status_wxa === 200 && messageSendRecordList && messageSendRecordList.length > 0) {
          messageSendRecordList.forEach(function (messageSendRecord) {
            var item = {
              Title      :messageSendRecord.title,
              Description:messageSendRecord.description,
              PicUrl     :messageSendRecord.imageUrl ? [config.webRoot, config.imageRoot , messageSendRecord.imageUrl].join('') : '',
              Url        :[config.webRoot, config.webRoot_weixinapp, '/openMyMessageSendRecordList?FromUserName=' , FromUserName , '&merchantId=', merchantId, '&userId=', userId].join('')
            }
            Articles.push(item);
          });
        } else {
          var item = {
            Title      :'我的消息',
            Description:'查看更多我的信息',
            PicUrl     :[config.webRoot, config.imageRoot , '/sys/weixin/images/wx_msg640@320.png'].join(''),
            Url        :[config.webRoot, config.webRoot_weixinapp, '/openMyMessageSendRecordList?FromUserName=' , FromUserName , '&merchantId=', merchantId, '&userId=', userId].join('')
          }
          Articles.push(item);
        }
        var message = {
          MsgType :RESP_MESSAGE_TYPE_NEWS,
          Articles:Articles
        }
        callback(200, {message:message});
      });
    } else {
      var message = {
        MsgType:RESP_MESSAGE_TYPE_TEXT,
        Content:result_user.error
      }
      callback(200, {message:message});
    }
  });
}

//获取推荐商户
var findMerchantUnion = function (FromUserName, merchantId, callback) {
  getUserIdByWeiXinObject(FromUserName, merchantId, function (status_user, result_user) {
    if (status_user === 200) {
      var userId = result_user.userId;
      weiXinAppServer.findMerchantUnionData(merchantId, function (status_wxa, merchantList) {
        var Articles = [];
        if (status_wxa === 200 && merchantList && merchantList.length > 0) {
          merchantList.forEach(function (merchantUnion) {
            var item = {
              Title      :merchantUnion.title,
              Description:merchantUnion.description,
              PicUrl     :merchantUnion.imageUrl ? [config.webRoot, config.imageRoot , merchantUnion.imageUrl].join('') : '',
              Url        :[config.webRoot, config.webRoot_weixinapp, '/openMerchantUnionInfo?FromUserName=' , FromUserName , '&merchantId=', merchantId, '&merchantUnionId=', merchantUnion._id].join('')
            }
            Articles.push(item);
          });
          var item0 = {
            Title      :'商务会所信息  »',
            Description:'查看商务会所信息  »',
            PicUrl     :[config.webRoot, config.imageRoot , '/sys/weixin/images/wx_munion80@80.png'].join(''),
            Url        :[config.webRoot, config.webRoot_weixinapp, '/openMerchantUnionList?FromUserName=' , FromUserName , '&merchantId=', merchantId, '&userId=', userId].join('')
          }
          Articles.push(item0);
        } else {
          var item = {
            Title      :'商务会所',
            Description:'查看关于商务会所信息',
            PicUrl     :[config.webRoot, config.imageRoot , '/sys/weixin/images/wx_munion640@320.png'].join(''),
            Url        :[config.webRoot, config.webRoot_weixinapp, '/openMerchantUnionList?FromUserName=' , FromUserName , '&merchantId=', merchantId, '&userId=', userId].join('')
          }
          Articles.push(item);
        }
        var message = {
          MsgType :RESP_MESSAGE_TYPE_NEWS,
          Articles:Articles
        }
        callback(200, {message:message});
      });
    } else {
      var message = {
        MsgType:RESP_MESSAGE_TYPE_TEXT,
        Content:result_user.error
      }
      callback(200, {message:message});
    }
  });
}

//获取资源供需
var findSupplyDemand = function (FromUserName, merchantId, callback) {
  getUserIdByWeiXinObject(FromUserName, merchantId, function (status_user, result_user) {
    if (status_user === 200) {
      var userId = result_user.userId;
      memberServer.getMemberByMerchantAndUser(merchantId, userId, function (status_m, result_m) {
        if (status_m === 200) {
          weiXinAppServer.findSupplyDemandData(merchantId, function (status_wxa, supplyDemandList) {
            var Articles = [];
            if (status_wxa === 200 && supplyDemandList && supplyDemandList.length > 0) {
              supplyDemandList.forEach(function (supplyDemand) {
                var item = {
                  Title      :supplyDemand.title,
                  Description:supplyDemand.title,
                  PicUrl     :supplyDemand.imageUrl ? [config.webRoot, config.imageRoot , supplyDemand.imageUrl].join('') : '',
                  Url        :[config.webRoot, config.webRoot_weixinapp, '/openSupplyDemandList?FromUserName=' , FromUserName , '&merchantId=', merchantId, '&userId=', userId, '&supplyDemandId=', supplyDemand._id].join('')
                }
                Articles.push(item);
              });
              var item0 = {
                Title      :'更多资源供需信息  »',
                Description:'查看更多资源供需信息  »',
                PicUrl     :[config.webRoot, config.imageRoot , '/sys/weixin/images/wx_msd80@80.png'].join(''),
                Url        :[config.webRoot, config.webRoot_weixinapp, '/openSupplyDemandList?FromUserName=' , FromUserName , '&merchantId=', merchantId, '&userId=', userId].join('')
              }
              Articles.push(item0);
            } else {
              var item = {
                Title      :'资源供需',
                Description:'查看关于资源供需信息',
                PicUrl     :[config.webRoot, config.imageRoot , '/sys/weixin/images/wx_msd640@320.png'].join(''),
                Url        :[config.webRoot, config.webRoot_weixinapp, '/openSupplyDemandList?FromUserName=' , FromUserName , '&merchantId=', merchantId, '&userId=', userId].join('')
              }
              Articles.push(item);
            }
            var message = {
              MsgType :RESP_MESSAGE_TYPE_NEWS,
              Articles:Articles
            }
            callback(200, {message:message});
          });
        } else {
          var message = {
            MsgType:RESP_MESSAGE_TYPE_TEXT,
            Content:result_m.error + '【*注：只有会员才可以查看资源供需】'
          }
          callback(200, {message:message});
        }
      });
    } else {
      var message = {
        MsgType:RESP_MESSAGE_TYPE_TEXT,
        Content:result_user.error
      }
      callback(200, {message:message});
    }
  });
}

//处理文本信息
var dealWithTextMessage = function (FromUserName, merchantId, content, callback) {
  //判断商户是否是希斯杰商户
  var isXSJ = isXSJOfMerchant(merchantId);
  if (content && content.trim()) {
    var t = content.trim();

    //识别中文和英文"?"
    if (t === '?' || t === '？') {
      var buffer = ['您好，我是小助手，请回复数字选择服务：\n\n'];
      //如果是希斯杰 -- 一期一会商户，7和8被屏蔽
      if (isXSJ) {
        buffer.push("1  我的收藏\n");
        buffer.push("2  一期一会\n");
        buffer.push("3  加入会员\n");
        //buffer.push("4  商户评论\n");
        buffer.push("5  我的积分\n");
        buffer.push("6  我的消息\n");
        buffer.push("7  商务会所\n");
        buffer.push("8  资源供需\n");
      }else{
        buffer.push("1  我的包包\n");
        buffer.push("2  商户活动\n");
        buffer.push("3  商户服务\n");
        buffer.push("4  商户评论\n");
        buffer.push("5  我的积分\n");
        buffer.push("6  我的消息\n");
      }
      buffer.push("\n");
      buffer.push("回复“?”显示此帮助菜单");
      var text = buffer.join('');
      var message = {
        MsgType:RESP_MESSAGE_TYPE_TEXT,
        Content:text
      }
      callback(200, {message:message});
    } else if (t == '1') {
      findMyMemberService(FromUserName, merchantId, callback);
    } else if (t == '2') {
      findAdvertisement(FromUserName, merchantId, callback);
    } else if (t == '3') {
      findServiceItem(FromUserName, merchantId, callback);
    } else if (t == '4' && !isXSJ) {
      findComment(FromUserName, merchantId, callback);
    } else if (t == '5') {
      findMyPoint(FromUserName, merchantId, callback);
    } else if (t == '6') {
      findMyMessage(FromUserName, merchantId, callback);
    } else if (t == '7' && isXSJ) {
      findMerchantUnion(FromUserName, merchantId, callback);
    } else if (t == '8' && isXSJ) {
      findSupplyDemand(FromUserName, merchantId, callback);
    } else {
      callback(200, null);
    }
  } else {
    callback(200, null);
  }
};

//判断是否是希斯杰商户
var isXSJOfMerchant = function (merchantId) {
  var flag = false;
  var merchantIdOfXSJ = config.merchantIds.XSJ;
  //var _id = new ObjectId(merchantIdOfXSJ);
  if (merchantId == merchantIdOfXSJ) {
    flag = true;
  }
  return flag;
}

module.exports = {
  dealWithTextMessage:dealWithTextMessage,
  findMyMemberService:findMyMemberService,
  findAdvertisement  :findAdvertisement,
  findServiceItem    :findServiceItem,
  findComment        :findComment,
  findMyPoint        :findMyPoint,
  findMyMessage      :findMyMessage,
  findMerchantUnion  :findMerchantUnion,
  findSupplyDemand   :findSupplyDemand
};