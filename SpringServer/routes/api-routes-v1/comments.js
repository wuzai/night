var Comment = require('../../model/Comment').Comment;
var UserProfile = require('../../model/UserProfile').UserProfile;
var ObjectId = require('mongoose').Types.ObjectId;

/**
 * 添加商户评论
 * @since 1.0
 */
var add = function (req, res, next) {
  var body = req.body;
  var _merchant_id = body.merchant_id;
  var _user_id = body.user_id;
  var _content = body.content;
  var _rating = body.rating;
  if (!body || !_merchant_id || !_user_id) {
    res.json(400, {errors:'请求参数错误.'});
    return;
  }
  if (!_content) {
    res.json(400, {errors:'评论内容不能为空.'});
    return;
  }
  var merchantId = new ObjectId(_merchant_id);
  var userId = new ObjectId(_user_id);
  var comment = new Comment({
    merchant   :merchantId,
    user       :userId,
    commentType:'评价',
    content    :_content,
    rating     :_rating
  });
  UserProfile.find({_type:'UserProfile', user:userId}).populate('attribute', 'attributeName').exec(function (err, attrs) {
    if (err) return next(err);
    for (var i in attrs) {
      var attr = attrs[i];
      if (attr.attribute.attributeName === 'name') {
        comment.commenterName = attr.value;
        break;
      }
    }
    comment.save(function (err, comment) {
      if (err) return next(err);
      res.json(201, {_id:comment._id});
    });
  });
};

/**
 * 获取某商户的评论列表
 * @since 1.0
 */
var list = function (req, res, next) {
  var query = req.query;
  var merchant_id = query.merchant_id;
  if (!query || !merchant_id) {
    res.json(400, {errors:'request data error.'});
    return;
  }
  Comment.find({merchant:merchant_id, state:'0000-0000-0000'}, function (err, commentList) {
    if (err) return next(err);
    res.json(200, commentList);
  });
};

/**
 * 删除评论
 * @since 1.0
 */
var deleteComment = function (req, res, next) {
  var body = req.body;
  var commentId = req.params.id;
  Comment.update({_id:commentId}, {state:'0000-0000-1111'}, function (err, count) {
    if (err) return next(err);
    res.json(200, {});
  })
};

module.exports = {
  list         :list,
  add          :add,
  deleteComment:deleteComment
};