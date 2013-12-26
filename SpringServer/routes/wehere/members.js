var config = require('../../config');
var webRoot = config.webRoot_wehere;
var Member = require('../../model/Member').Member;
var memberServer = require('../../services/member-service');
var memberServiceServer = require('../../services/memberService-service');

var memberList = function (req, res) {
  var merchant_session = req.session.merchant;
  var merchantId = merchant_session._id;
  memberServer.findMemberListAllByMerchantId(merchantId, function (status, result) {
    res.render('wehere/memberList', {merchantId:merchantId, members:result.members});
  });
};

var memberEnabled = function (req, res) {
  var query = req.query;
  var memberId = query.memberId;
  Member.update({_id:memberId, state:'0000-0000-1111'}, {state:'0000-0000-0000'}, function (err, count) {
    res.redirect([webRoot , '/merchant/memberList'].join(''));
  });
};

var memberDisEnabled = function (req, res) {
  var query = req.query;
  var memberId = query.memberId;
  Member.update({_id:memberId}, {state:'0000-0000-1111'}, function (err, count) {
    res.redirect([webRoot , '/merchant/memberList'].join(''));
  });
};

var openMemberInfoPage = function (req, res) {
  var merchant_session = req.session.merchant;
  var merchantId = merchant_session._id;
  var query = req.query;
  var memberId = query.memberId;
  memberServer.getMemberByMemberId(memberId, function (status_member, resultmember) {
    //获取会员在该商户服务
    memberServiceServer.findMemberServiceByMemberIdAndMerchantId(memberId, merchantId, function (status_memberServices, result_memberServices) {
      res.render('wehere/memberInfo', {member:resultmember.member, memberServices:result_memberServices.memberServices});
    })
  });
};

module.exports = {
  memberList        :memberList,
  openMemberInfoPage:openMemberInfoPage,
  memberEnabled     :memberEnabled,
  memberDisEnabled  :memberDisEnabled
};