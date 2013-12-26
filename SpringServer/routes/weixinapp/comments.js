var config = require('../../config');
var webRoot_weixinapp = config.webRoot_weixinapp;
var swiss = require('../../utils/swiss-kit');
var Comment = require('../../model/Comment').Comment;
var UserProfile = require('../../model/UserProfile').UserProfile;
var commentServer = require('../../services/comment-service');
var userWXService = require('./userWXService');

//添加商户评论
var addCommentSubmit = function (req, res, next) {
  var body = req.body;
  var merchantId = body.merchantId;
  var FromUserName = body.FromUserName;
  var userId = body.userId;
  var content = body.content;
  var rating = body.rating;
  if (!body || !merchantId || !FromUserName) {
    req.session.messages = {error:['请求参数错误']};
    res.redirect([webRoot_weixinapp, '/openCommentList?merchantId=', merchantId, '&FromUserName=', FromUserName].join(''));
    return;
  }
  userWXService.getUserIdByFromUserName(merchantId, FromUserName, userId, function (status, result) {
    if (status === 200) {
      var userId = result.userId;
      if (content && content.trim() || rating) {
        var comment = new Comment({
          merchant   :merchantId,
          user       :userId,
          commentType:'评价',
          content    :content,
          rating     :rating
        });
        UserProfile.find({_type:'UserProfile', user:userId}).populate('attribute', 'attributeName').exec(function (err, attrs) {
          if (err) return next(err);
          var attrJson = swiss.findProfileToJSON(attrs);
          comment.commenterName = attrJson.name;
          comment.save(function (err, comment) {
            if (err) return next(err);
            res.redirect([webRoot_weixinapp, '/openCommentList?merchantId=', merchantId, '&FromUserName=', FromUserName].join(''));
          });
        });
      } else {
        req.session.messages = {error:['评论内容不能为空或未选择星级评价.']};
        res.redirect([webRoot_weixinapp, '/openCommentList?merchantId=', merchantId, '&FromUserName=', FromUserName].join(''));
        return;
      }
    } else {
      req.session.messages = {error:[result.error]};
      res.redirect(result.errorUrl);
    }
  });
};

//获取某商户的评论列表
var openCommentList = function (req, res, next) {
  var query = req.query;
  var merchantId = query.merchantId;
  var FromUserName = query.FromUserName;
  commentServer.findCommentListByMerchantId(merchantId, function (status_comment, result_comment) {
    var commentList = [];
    if (result_comment && result_comment.comments) {
      result_comment.comments.forEach(function (comment) {
        if (comment) {
          var messageRecord_data = {
            _id          :comment._id,
            merchant     :comment.merchant,
            user         :comment.user,
            commentType  :comment.commentType,
            commenterName:comment.commenterName,
            content      :comment.content,
            rating       :comment.rating,
            createdAt    :comment.createdAt,
            simpleDate   :swiss.getSimpleDate(comment.createdAt)
          }
          commentList.push(messageRecord_data);
        }
      });
    }
    res.render('weixinapp/commentList', {merchantId:merchantId, FromUserName:FromUserName, comments:commentList});
  });
};

module.exports = {
  openCommentList :openCommentList,
  addCommentSubmit:addCommentSubmit
};