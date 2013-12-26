var MemberService = require('../../model/MemberService').MemberService;
var ServiceItem = require('../../model/ServiceItem').ServiceItem;
var Member = require('../../model/Member').Member;
var LargessRecord = require('../../model/LargessRecord').LargessRecord;
var ObjectId = require('mongoose').Types.ObjectId;
var config = require('../../config');


//通过会员Id获取的会员服务
var findMemberServiceByMemberId = function (memberId, callback) {
  var query = {member:memberId, state:'0000-0000-0000'};
  var memberService_list = [];
  MemberService.find(query, function (err, memberServiceList) {
    if (err) return callback(404, {error:err});
    var memberServiceLen = memberServiceList.length;

    function memberServiceLoop(i) {
      if (i < memberServiceLen) {
        var memberService = memberServiceList[i];
        getMemberServiceData(memberService, function (status_m, result_m) {
          if (status_m === 200 && result_m.memberService) {
            memberService_list.push(result_m.memberService);
          }
          memberServiceLoop(i + 1);
        });
      } else {
        Member.findById(memberId, 'user', function (err, member) {
          if (err) return callback(404, {error:err});
          if (member) {
            //获取转赠给会员的服务
            findLargessMemberServiceByToUser(member.user, function (status_lm, result_lm) {
              if (status_lm === 200) {
                memberService_list = memberService_list.concat(result_lm.memberServices);
              }
              callback(200, {memberServices:memberService_list});
            });
          } else {
            callback(200, {memberServices:memberService_list});
          }
        });
      }
    }

    memberServiceLoop(0);
  });
};

/**
 * 获取转赠给用户的服务
 * @param userId
 * @param callback
 */
var findLargessMemberServiceByToUser = function (userId, callback) {
  LargessRecord.find({toUser:userId, processStatus:'待接受'}, function (err, largessRecordList) {
    if (err) return callback(404, {error:err});
    var memberService_list = [];
    var largessRecordLen = largessRecordList.length;

    function largessRecordLoop(i) {
      if (i < largessRecordLen) {
        var largessRecord = largessRecordList[i];
        if (largessRecord.memberService) {
          getMemberServiceById(largessRecord.memberService, function (status_memberService, result_memberService) {
            if (status_memberService === 200 && result_memberService.memberService) {
              var memberService_data = result_memberService.memberService;
              memberService_data.submitState = true;
              memberService_list.push(memberService_data);
            }
            largessRecordLoop(i + 1);
          });
        } else {
          largessRecordLoop(i + 1);
        }
      } else {
        callback(200, {memberServices:memberService_list});
      }
    }

    largessRecordLoop(0);
  });
};

//通过会员服务Id获取会员服务信息
var getMemberServiceById = function (memberServiceId, callback) {
  MemberService.findById(memberServiceId, function (err, memberService) {
    if (err) return callback(404, {error:err});
    getMemberServiceData(memberService, function (status, result) {
      if (status === 200) {
        callback(200, {memberService:result.memberService});
      } else {
        callback(status, {error:result.error});
      }
    });
  });
};

//重新组合会员服务数据
var getMemberServiceData = function (memberService, callback) {
  if (memberService) {
    var memberService_data = {
      _id                :memberService._id,
      memberServiceName  :memberService.memberServiceName,
      memberServiceType  :memberService.memberServiceType,
      memberServiceNumber:memberService.memberServiceNumber,
      description        :memberService.description,
      promptIntro        :memberService.promptIntro,
      iconImage          :[config.webRoot, config.imageRoot , memberService.iconImage].join(''),
      merchantId         :memberService.merchant,
      serviceItemId      :memberService.serviceItem,
      memberId           :memberService.member,
      forbidden          :memberService.forbidden
    }
    ServiceItem.findById(memberService.serviceItem, '_id ruleText allowLargess allowShare usableStores', function (err, serviceItem) {
      if (err) return callback(404, {error:err});
      if (serviceItem) {
        memberService_data.usableStores = serviceItem.usableStores ? serviceItem.usableStores.join(',') : null;
        memberService_data.allowLargess = serviceItem.allowLargess;
        memberService_data.allowShare = serviceItem.allowShare;
        memberService_data.ruleText = serviceItem.ruleText;
      }
      callback(200, {memberService:memberService_data});
    });
  } else {
    callback(200, {});
  }
}

module.exports = {
  findMemberServiceByMemberId:findMemberServiceByMemberId
};