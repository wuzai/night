var ConsumeRecord = require('../model/ConsumeRecord').ConsumeRecord;
var MemberCard = require('../model/MemberCard').MemberCard;
var MeteringCard = require('../model/MeteringCard').MeteringCard;
var Coupon = require('../model/Coupon').Coupon;
var MemberService = require('../model/MemberService').MemberService;
var Member = require('../model/Member').Member;

/**
 * 保存会员消费记录
 * @param memberId 会员Id
 * @param memberServerId 会员服务Id
 * @param type 会员服务类型
 * @param process 消费流程
 * @param callback
 */
var saveConsumeRecord = function (memberId, memberServerId, type, process, callback) {
  ConsumeRecord.update({member:memberId, process:'待处理'}, {process:'已删除'}, { multi:true }, function (err, new_consumeRecord) {
    if (err) return callback(404, {error:err});
    var consumeRecord = new ConsumeRecord({
      member :memberId,
      process:process
    });
    if (type === 'MemberCard') {
      consumeRecord.memberCard = memberServerId;
    } else if (type === 'Coupon') {
      consumeRecord.coupon = memberServerId;
    } else if (type === 'MeteringCard') {
      consumeRecord.meteringCard = memberServerId;
    } else {
      consumeRecord.memberService = memberServerId;
    }
    consumeRecord.save(function (err, new_consumeRecord) {
      if (err) callback(404, {error:err});
      callback(200, {consumeRecord:new_consumeRecord});
    });
  });
};

/**
 * 获取会员的正常的消费记录
 * @param memberId 商户Id
 * @param callback
 */
var findConsumeRecordListByMemberId = function (memberId, callback) {
  var consumeRecordList_data = [];
  Member.findById(memberId).populate('user', 'userName').exec(function (err, member) {
    if (member && member.user) {
      ConsumeRecord.find({member:memberId, state:'0000-0000-0000', $nor:[
        {process:'已删除'},
        {process:'已作废'}
      ]}).sort({createdAt:-1}).populate('memberService', 'memberServiceName memberServiceType').populate('memberCard', 'memberCardName').populate('coupon', 'couponName').populate('meteringCard', 'meteringCardName').exec(function (err, consumeRecordList) {

            var consumeRecordLen = consumeRecordList.length;

            function consumeRecordLoop(i) {
              if (i < consumeRecordLen) {
                var consumeRecord = consumeRecordList[i];
                if (consumeRecord) {
                  var consumeRecord_data = {
                    _id      :consumeRecord._id,
                    member   :member,
                    process  :consumeRecord.process,
                    createdAt:consumeRecord.createdAt,
                    updatedAt:consumeRecord.updatedAt,
                    state    :consumeRecord.state,
                    remark   :consumeRecord.remark
                  };
                  var memberService_data = {};
                  if (consumeRecord.memberCard && consumeRecord.memberCard._id) {
                    memberService_data._id = consumeRecord.memberCard._id;
                    memberService_data.memberServiceName = consumeRecord.memberCard.memberCardName;
                    memberService_data.memberServiceType = 'MemberCard';
                    consumeRecord_data.memberService = memberService_data;
                    consumeRecordList_data.push(consumeRecord_data);
                  } else if (consumeRecord.coupon && consumeRecord.coupon._id) {
                    memberService_data._id = consumeRecord.coupon._id;
                    memberService_data.memberServiceName = consumeRecord.coupon.couponName;
                    memberService_data.memberServiceType = 'Coupon';
                    consumeRecord_data.memberService = memberService_data;
                    consumeRecordList_data.push(consumeRecord_data);
                  } else if (consumeRecord.meteringCard && consumeRecord.meteringCard._id) {
                    memberService_data._id = consumeRecord.meteringCard._id;
                    memberService_data.memberServiceName = consumeRecord.meteringCard.meteringCardName;
                    memberService_data.memberServiceType = 'MeteringCard';
                    consumeRecord_data.memberService = memberService_data;
                    consumeRecordList_data.push(consumeRecord_data);
                  } else if (consumeRecord.memberService && consumeRecord.memberService._id) {
                    memberService_data._id = consumeRecord.memberService._id;
                    memberService_data.memberServiceName = consumeRecord.memberService.memberServiceName;
                    memberService_data.memberServiceType = consumeRecord.memberService.memberServiceType;
                    consumeRecord_data.memberService = memberService_data;
                    consumeRecordList_data.push(consumeRecord_data);
                  }
                }
                consumeRecordLoop(i + 1);
              } else {
                callback(200, {consumeRecords:consumeRecordList_data});
              }
            }

            consumeRecordLoop(0);
          });
    } else {
      callback(200, {consumeRecords:consumeRecordList_data});
    }
  });
};

/**
 * 获取商户待审核的服务使用请求(未完成的消费记录)
 * @param merchantId 商户Id
 * @param callback
 */
var findConsumeRecordOfUnfinishedByMerchantId = function (merchantId, callback) {
  Member.find({merchant:merchantId, state:'0000-0000-0000'}).populate('user', 'userName').exec(function (err, memberList) {
    var consumeRecordList_data = [];
    var memberLen = memberList.length;

    function memberLoop(i) {
      if (i < memberLen) {
        var member = memberList[i];
        ConsumeRecord.find({member:member._id, process:'待处理', state:'0000-0000-0000'}).populate('memberService', 'memberServiceName memberServiceType').populate('memberCard', 'memberCardName').populate('coupon', 'couponName').populate('meteringCard', 'meteringCardName').exec(function (err, consumeRecordList) {
          var consumeRecordLen = consumeRecordList.length;

          function consumeRecordLoop(j) {
            if (j < consumeRecordLen) {
              var consumeRecord = consumeRecordList[j];
              var consumeRecord_data = {
                _id      :consumeRecord._id,
                member   :member,
                process  :consumeRecord.process,
                createdAt:consumeRecord.createdAt,
                updatedAt:consumeRecord.updatedAt,
                state    :consumeRecord.state,
                remark   :consumeRecord.remark
              };
              var memberService_data = {};
              if (consumeRecord.memberCard && consumeRecord.memberCard._id) {
                memberService_data._id = consumeRecord.memberCard._id;
                memberService_data.memberServiceName = consumeRecord.memberCard.memberCardName;
                memberService_data.memberServiceType = 'MemberCard';
                consumeRecord_data.memberService = memberService_data;
                consumeRecordList_data.push(consumeRecord_data);
              } else if (consumeRecord.coupon && consumeRecord.coupon._id) {
                memberService_data._id = consumeRecord.coupon._id;
                memberService_data.memberServiceName = consumeRecord.coupon.couponName;
                memberService_data.memberServiceType = 'Coupon';
                consumeRecord_data.memberService = memberService_data;
                consumeRecordList_data.push(consumeRecord_data);
              } else if (consumeRecord.meteringCard && consumeRecord.meteringCard._id) {
                memberService_data._id = consumeRecord.meteringCard._id;
                memberService_data.memberServiceName = consumeRecord.meteringCard.meteringCardName;
                memberService_data.memberServiceType = 'MeteringCard';
                consumeRecord_data.memberService = memberService_data;
                consumeRecordList_data.push(consumeRecord_data);
              } else if (consumeRecord.memberService && consumeRecord.memberService._id) {
                memberService_data._id = consumeRecord.memberService._id;
                memberService_data.memberServiceName = consumeRecord.memberService.memberServiceName;
                memberService_data.memberServiceType = consumeRecord.memberService.memberServiceType;
                consumeRecord_data.memberService = memberService_data;
                consumeRecordList_data.push(consumeRecord_data);
              }
              consumeRecordLoop(j + 1);
            } else {
              memberLoop(i + 1);
            }
          }

          consumeRecordLoop(0);
        });
      } else {
        callback(200, {consumeRecords:consumeRecordList_data});
      }
    }

    memberLoop(0);
  });
};


module.exports = {
  saveConsumeRecord                        :saveConsumeRecord,
  findConsumeRecordListByMemberId          :findConsumeRecordListByMemberId,
  findConsumeRecordOfUnfinishedByMerchantId:findConsumeRecordOfUnfinishedByMerchantId
};