var Comment = require('../model/Comment').Comment;

/**
 * 获取商户下的评论
 * @param merchantId 商户Id
 * @param callback
 */
var findCommentListByMerchantId = function (merchantId, callback) {
  Comment.find({merchant:merchantId, state:'0000-0000-0000'}).sort({createdAt:-1}).populate('user', '_id userName faceIcon').exec(function (err, commentList) {
    callback(200, {comments:commentList});
  });
};

/**
 * 获取limit数量的商户下的评论
 * @param merchantId 商户Id
 * @param callback
 */
var findCommentListOfLimitByMerchantId = function (merchantId, limit, callback) {
  Comment.find({merchant:merchantId, state:'0000-0000-0000'}).sort({createdAt:-1}).limit(limit).populate('user', '_id userName faceIcon').exec(function (err, commentList) {
    callback(200, {comments:commentList});
  });
};

module.exports = {
  findCommentListByMerchantId       :findCommentListByMerchantId,
  findCommentListOfLimitByMerchantId:findCommentListOfLimitByMerchantId
};

