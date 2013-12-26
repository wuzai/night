var Comment = require('../../model/Comment').Comment;
var commentServer = require('../../services/comment-service');
var config = require('../../config');
var webRoot_wehere = config.webRoot_wehere;
var webRoot_admin = config.webRoot_admin;

var commentList = function (req, res) {
  var merchant_session = req.session.merchant;
  var merchantId = merchant_session._id;
  commentServer.findCommentListByMerchantId(merchantId, function (status, result) {
    res.render('wehere/commentList', {merchantId:merchantId, comments:result.comments});
  });
};

//用户评论列表
var commentControlList = function (req, res, next) {
  var query = {
    state:'0000-0000-0000'
  };
    Comment.find(query).sort({updatedAt:-1}).populate('user', '_id userName faceIcon').populate('merchant', '_id merchantName').exec(function (err, commentList) {
    res.render('sys/commentControlList', {
      comments:commentList
    });
  });
};
//删除用户评论
var commentDelete = function (req, res, next) {
  var query = req.query;
  var commentId = query.commentId;
  if(commentId){
//    Comment.update({_id:commentId}, {state:'1111-1111-1111'}, function (err, count) {
    Comment.remove({_id:commentId}, function (err) {
      res.redirect([webRoot_wehere , '/message/commentControlList'].join(''));
    });
  }else{
    req.session.messages = {error:['未获取到相关数据']};
    res.redirect([webRoot_admin , '/dashboard'].join(''));
  }
};

module.exports = {
  commentList:commentList,
  commentControlList:commentControlList,
  commentDelete:commentDelete
};