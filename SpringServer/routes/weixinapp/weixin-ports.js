var config = require('../../config');
var node_xml = require('node-xml');
var util = require('util');
var tokenHelper = require('../../utils/token-helper');
var weiXinInMerchantServer = require('../../services/weiXinInMerchant-service');
var weixinService = require('./weixin-service');

//返回消息类型：文本
var RESP_MESSAGE_TYPE_TEXT = "text";
//返回消息类型：音乐
var RESP_MESSAGE_TYPE_MUSIC = "music";
//返回消息类型：图文
var RESP_MESSAGE_TYPE_NEWS = "news";
//请求消息类型：文本
var REQ_MESSAGE_TYPE_TEXT = "text";
//请求消息类型：图片
var REQ_MESSAGE_TYPE_IMAGE = "image";
//请求消息类型：链接
var REQ_MESSAGE_TYPE_LINK = "link";
//请求消息类型：地理位置
var REQ_MESSAGE_TYPE_LOCATION = "location";
//请求消息类型：音频
var REQ_MESSAGE_TYPE_VOICE = "voice";
//请求消息类型：推送
var REQ_MESSAGE_TYPE_EVENT = "event";
//事件类型：subscribe(订阅)
var EVENT_TYPE_SUBSCRIBE = "subscribe";
//事件类型：unsubscribe(取消订阅)
var EVENT_TYPE_UNSUBSCRIBE = "unsubscribe";
//事件类型：CLICK(自定义菜单点击事件)
var EVENT_TYPE_CLICK = "CLICK";

/**
 * 验证签名
 * @param signature 微信加密签名
 * @param timestamp 时间戳
 * @param nonce 随机数
 * @param token token
 * @return {Boolean}
 */
var checkSignature = function (signature, timestamp, nonce, token) {
  var str = [ token, timestamp, nonce ];
  str.sort();// 字典序排序
  var bigStr = [str[0] , str[1] , str[2]].join('');
  // SHA1加密
  var digest = tokenHelper.encryptCrypto('sha1', bigStr);
  if (digest === signature) {
    return true;
  } else {
    return false;
  }
}

/**
 * 消息推送
 * @param data
 * @param callback
 */
var processMessage = function (data, callback) {
  var ToUserName = "";//公众帐号
  var FromUserName = "";//发送方帐号（open_id）
  var MsgType = "";//消息类型
  var CreateTime = "";//消息创建时间 （整型）
  //文本消息
  var Content = "";//文本消息内容
  //图片消息
  var PicUrl = "";//图片链接
  //地理位置消息
  var Location_X = "";//地理位置纬度
  var Location_Y = "";//地理位置纬度
  var Scale = 1;//地图缩放大小
  var Label = "";//地理位置信息
  //推送事件
  var Event = "";//事件类型（只适用于事件推送,即MsgType = event）
  var EventKey = "";//事件KEY值，与自定义菜单接口中KEY值对应

  var tempName = "";
  //解析xml请求
  var parse = new node_xml.SaxParser(function (cb) {
    cb.onStartElementNS(function (elem, attra, prefix, uri, namespaces) {
      tempName = elem;
    });

    cb.onCharacters(function (chars) {
      chars = chars.replace(/(^\s*)|(\s*$)/g, "");
      if (tempName == "CreateTime") {
        CreateTime = chars;
      } else if (tempName == "Location_X") {
        Location_X = chars;
      } else if (tempName == "Location_Y") {
        Location_Y = chars;
      } else if (tempName == "Scale") {
        Scale = chars;
      }
    });

    cb.onCdata(function (cdata) {
      if (tempName == "ToUserName") {
        ToUserName = cdata;
      } else if (tempName == "FromUserName") {
        FromUserName = cdata;
      } else if (tempName == "MsgType") {
        MsgType = cdata;
      } else if (tempName == "Content") {
        Content = cdata;
      } else if (tempName == "PicUrl") {
        PicUrl = cdata;
      } else if (tempName == "Label") {
        Label = cdata;
      } else if (tempName == "Event") {
        Event = cdata;
      } else if (tempName == "EventKey") {
        EventKey = cdata;
      }
    });

    cb.onEndElementNS(function (elem, prefix, uri) {
      tempName = "";
    });

    cb.onEndDocument(function () {
      tempName = "";
      var REQ_MESSAGE = {
        ToUserName  :ToUserName,
        FromUserName:FromUserName,
        MsgType     :MsgType,
        CreateTime  :CreateTime,
        Content     :Content,
        PicUrl      :PicUrl,
        Location_X  :Location_X,
        Location_Y  :Location_Y,
        Scale       :Scale,
        Label       :Label,
        Event       :Event,
        EventKey    :EventKey
      };
      processReplyMessageOfWeixin(REQ_MESSAGE, function (RESP_MESSAGE) {
        var xmlMessage = '';
        if (RESP_MESSAGE) {
          if (RESP_MESSAGE.MsgType == RESP_MESSAGE_TYPE_TEXT) {
            xmlMessage = textMessageToXml(RESP_MESSAGE);
          } else if (RESP_MESSAGE.MsgType == RESP_MESSAGE_TYPE_MUSIC) {
            xmlMessage = musicMessageToXml(RESP_MESSAGE);
          } else if (RESP_MESSAGE.MsgType == RESP_MESSAGE_TYPE_NEWS) {
            xmlMessage = newsMessageToXml(RESP_MESSAGE);
          }
        }
        callback(xmlMessage);
      });
    });
  });
  parse.parseString(data);
}

//文本消息对象转换成xml
function textMessageToXml(textMessage) {
  var xmlStr = '<xml>' +
      '<ToUserName><![CDATA[%s]]></ToUserName>' +
      '<FromUserName><![CDATA[%s]]></FromUserName>' +
      '<CreateTime>%s</CreateTime>' +
      '<MsgType><![CDATA[%s]]></MsgType>' +
      '<Content><![CDATA[%s]]></Content>' +
      '<FuncFlag><![CDATA[%s]]></FuncFlag>' +
      '</xml>';
  return util.format(xmlStr, textMessage.ToUserName, textMessage.FromUserName, textMessage.CreateTime, textMessage.MsgType, textMessage.Content, textMessage.FuncFlag);
}

//音乐消息对象转换成xml
function musicMessageToXml(musicMessage) {
  var musicStr = '';
  if (musicMessage && musicMessage.music) {
    var musicJson = musicMessage.music;
    var music = '<Music>' +
        '<Title><![CDATA[%s]]></Title>' +
        '<Description><![CDATA[%s]]></Description>' +
        '<MusicUrl><![CDATA[%s]]></MusicUrl>' +
        '<HQMusicUrl><![CDATA[%s]]></HQMusicUrl>' +
        '</Music>';
    musicStr = util.format(music, musicJson.Title, musicJson.Description, musicJson.MusicUrl, musicJson.HQMusicUrl);
  }
  var xmlStr = '<xml>' +
      '<ToUserName><![CDATA[%s]]></ToUserName>' +
      '<FromUserName><![CDATA[%s]]></FromUserName>' +
      '<CreateTime>%s</CreateTime>' +
      '<MsgType><![CDATA[%s]]></MsgType>' + musicStr +
      '</xml>';
  return util.format(xmlStr, musicMessage.ToUserName, musicMessage.FromUserName, musicMessage.CreateTime, musicMessage.MsgType);
}

//图文消息对象转换成xml
function newsMessageToXml(newsMessage) {
  var articlesStr = '';
  var ArticleCount = 0;
  if (newsMessage && newsMessage.Articles) {
    var articleList = newsMessage.Articles;
    var articleListStr = [];
    ArticleCount = articleList.length;
    if (ArticleCount > 0) {
      articleListStr.push('<Articles>');
      for (var i in articleList) {
        var itemJson = articleList[i];
        if (itemJson) {
          var item = '<item>' +
              '<Title><![CDATA[%s]]></Title>' +
              '<Description><![CDATA[%s]]></Description>' +
              '<PicUrl><![CDATA[%s]]></PicUrl>' +
              '<Url><![CDATA[%s]]></Url>' +
              '</item>';
          var itemStr = util.format(item, itemJson.Title, itemJson.Description, itemJson.PicUrl?itemJson.PicUrl:'', itemJson.Url);
          articleListStr.push(itemStr);
        }
      }
      articleListStr.push('</Articles>');
    }
    articlesStr = articleListStr.join('');
  }
  var xmlStr = '<xml>' +
      '<ToUserName><![CDATA[%s]]></ToUserName>' +
      '<FromUserName><![CDATA[%s]]></FromUserName>' +
      '<CreateTime>%s</CreateTime>' +
      '<MsgType><![CDATA[%s]]></MsgType>' +
      '<ArticleCount><![CDATA[%s]]></ArticleCount>' + articlesStr +
      '</xml>';
  return util.format(xmlStr, newsMessage.ToUserName, newsMessage.FromUserName, newsMessage.CreateTime, newsMessage.MsgType, ArticleCount);
}

/**
 * 处理回复消息
 * @param REQ_MESSAGE
 * @param callback RESP_MESSAGE
 */
var processReplyMessageOfWeixin = function (REQ_MESSAGE, callback) {
  var RESP_MESSAGE = {
    ToUserName  :REQ_MESSAGE.FromUserName,
    FromUserName:REQ_MESSAGE.ToUserName,
    CreateTime  :new Date().getTime(),
    MsgType     :RESP_MESSAGE_TYPE_TEXT,
    Content     :'',
    FuncFlag    :0
  };
  weiXinInMerchantServer.getWeiXinInMerchantByWeiXinObject(REQ_MESSAGE.ToUserName, function (status_wx, result_wx) {
    if (status_wx === 200) {
      var merchantId = result_wx.merchantId;
      if (REQ_MESSAGE.MsgType == REQ_MESSAGE_TYPE_TEXT) {
        // 文本消息
        weixinService.dealWithTextMessage(REQ_MESSAGE.FromUserName, merchantId, REQ_MESSAGE.Content, function (status, result) {
          if (status === 200 && result) {
            var message = result.message;
            RESP_MESSAGE.MsgType = message.MsgType;
            RESP_MESSAGE.Articles = message.Articles;
            RESP_MESSAGE.Content = message.Content;
            callback(RESP_MESSAGE);
          } else {
            callback(null);
          }
        });
      } else if (REQ_MESSAGE.MsgType == REQ_MESSAGE_TYPE_IMAGE) {
        // 图片消息
        callback(null);
      } else if (REQ_MESSAGE.MsgType == REQ_MESSAGE_TYPE_LOCATION) {
        // 地理位置消息
        callback(null);
      } else if (REQ_MESSAGE.MsgType == REQ_MESSAGE_TYPE_LINK) {
        // 链接消息
        callback(null);
      } else if (REQ_MESSAGE.MsgType == REQ_MESSAGE_TYPE_VOICE) {
        // 音频消息
        callback(null);
      } else if (REQ_MESSAGE.MsgType == REQ_MESSAGE_TYPE_EVENT) {
        // 事件推送
        var eventType = REQ_MESSAGE.Event;// 事件类型
        if (eventType == EVENT_TYPE_SUBSCRIBE) {
          // 订阅
          RESP_MESSAGE.Content = "谢谢您的关注！╰(￣▽￣)╮\n\n回复“?”显示此帮助菜单";
          if(merchantId==config.merchantIds.XSJ){
            RESP_MESSAGE.Content = '亲！欢迎关注希斯杰公众平台！' +
                '开发后的平台不仅可以让你随时轻松获取我们的服务内容和线下活动信息。' +
                '捆绑注册贝客汇会员后,将可以查阅更多的商业资讯供求信息；商务会所资源；专家资源库信息；' +
                '分享更可获得希分奖励。赶快来注册吧，开启您的商业资源增值之旅。\n\n\n' +
                '如果您还没有注册贝客汇商户,' +
                '<a href="'+ config.webRoot + config.webRoot_weixinapp + '/openSignUpPage?merchantId='+
                merchantId + '&FromUserName=' + REQ_MESSAGE.FromUserName + '">请点击此处立即注册</a>,' +
                '同时会绑定希斯杰公众帐号.';
          }
          callback(RESP_MESSAGE);
        } else if (eventType == EVENT_TYPE_UNSUBSCRIBE) {
          // 取消订阅
          // TODO 取消订阅后用户再收不到公众号发送的消息，因此不需要回复消息
          callback(null);
        } else if (eventType == EVENT_TYPE_CLICK) {
          // 事件KEY值，与创建自定义菜单时指定的KEY值对应
          var eventKey = REQ_MESSAGE.EventKey;
          if (eventKey == 'V1001_TODAY_MYSERVICE') {
            //点击我的包包
            weixinService.findMyMemberService(REQ_MESSAGE.FromUserName, merchantId, function (status, result) {
              if (status === 200) {
                var message = result.message;
                RESP_MESSAGE.MsgType = message.MsgType;
                RESP_MESSAGE.Articles = message.Articles;
                RESP_MESSAGE.Content = message.Content;
              } else {
                RESP_MESSAGE.Content = '我的包包暂时无法使用.';
              }
              callback(RESP_MESSAGE);
            });
          } else if (eventKey == 'V1001_TODAY_ADVERTISEMENT') {
            //点击活动
            weixinService.findAdvertisement(REQ_MESSAGE.FromUserName, merchantId, function (status, result) {
              if (status === 200) {
                var message = result.message;
                RESP_MESSAGE.MsgType = message.MsgType;
                RESP_MESSAGE.Articles = message.Articles;
                RESP_MESSAGE.Content = message.Content;
              } else {
                RESP_MESSAGE.Content = '商户活动暂时无法使用.';
              }
              callback(RESP_MESSAGE);
            });
          } else if (eventKey == 'V1001_MENU_SERVICEITEM') {
            //点击商户服务
            weixinService.findServiceItem(REQ_MESSAGE.FromUserName, merchantId, function (status, result) {
              if (status === 200) {
                var message = result.message;
                RESP_MESSAGE.MsgType = message.MsgType;
                RESP_MESSAGE.Articles = message.Articles;
                RESP_MESSAGE.Content = message.Content;
              } else {
                RESP_MESSAGE.Content = '商户服务暂时无法使用.';
              }
              callback(RESP_MESSAGE);
            });
          } else if (eventKey == 'V1001_MENU_COMMENT') {
            //点击商户评论
            weixinService.findComment(REQ_MESSAGE.FromUserName, merchantId, function (status, result) {
              if (status === 200) {
                var message = result.message;
                RESP_MESSAGE.MsgType = message.MsgType;
                RESP_MESSAGE.Articles = message.Articles;
                RESP_MESSAGE.Content = message.Content;
              } else {
                RESP_MESSAGE.Content = '商户评论暂时无法使用.';
              }
              callback(RESP_MESSAGE);
            });
          } else if (eventKey == 'V1001_MENU_MYPOINT') {
            //点击我的积分
            weixinService.findMyPoint(REQ_MESSAGE.FromUserName, merchantId, function (status, result) {
              if (status === 200) {
                var message = result.message;
                RESP_MESSAGE.MsgType = message.MsgType;
                RESP_MESSAGE.Articles = message.Articles;
                RESP_MESSAGE.Content = message.Content;
              } else {
                RESP_MESSAGE.Content = '我的积分暂时无法使用.';
              }
              callback(RESP_MESSAGE);
            });
          } else if (eventKey == 'V1001_MENU_MYMESSAGE') {
            //点击我的消息
            weixinService.findMyMessage(REQ_MESSAGE.FromUserName, merchantId, function (status, result) {
              if (status === 200) {
                var message = result.message;
                RESP_MESSAGE.MsgType = message.MsgType;
                RESP_MESSAGE.Articles = message.Articles;
                RESP_MESSAGE.Content = message.Content;
              } else {
                RESP_MESSAGE.Content = '我的消息暂时无法使用.';
              }
              callback(RESP_MESSAGE);
            });
          } else if (eventKey == 'V1001_FUNCTION_MERCHANTUNION') {
            //点击推荐商户
            weixinService.findMerchantUnion(REQ_MESSAGE.FromUserName, merchantId, function (status, result) {
              if (status === 200) {
                var message = result.message;
                RESP_MESSAGE.MsgType = message.MsgType;
                RESP_MESSAGE.Articles = message.Articles;
                RESP_MESSAGE.Content = message.Content;
              } else {
                RESP_MESSAGE.Content = '商务会所功能暂时无法使用.';
              }
              callback(RESP_MESSAGE);
            });
          } else if (eventKey == 'V1001_FUNCTION_SUPPLYDEMAND') {
            //点击资源供需
            weixinService.findSupplyDemand(REQ_MESSAGE.FromUserName, merchantId, function (status, result) {
              if (status === 200) {
                var message = result.message;
                RESP_MESSAGE.MsgType = message.MsgType;
                RESP_MESSAGE.Articles = message.Articles;
                RESP_MESSAGE.Content = message.Content;
              } else {
                RESP_MESSAGE.Content = '资源供需暂时无法使用.';
              }
              callback(RESP_MESSAGE);
            });
          } else {
            callback(null);
          }
        } else {
          callback(null);
        }
      }
    } else {
      RESP_MESSAGE.Content = result_wx.error;
      callback(RESP_MESSAGE);
    }
  });
};

module.exports.checkSignature = checkSignature;
module.exports.processMessage = processMessage;