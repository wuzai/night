var ConsumeRecord = require('../../model/ConsumeRecord').ConsumeRecord;
var ObjectId = require('mongoose').Types.ObjectId;
var memberServer = require('../../services/member-service');
var consumeRecordServer = require('../../services/consumeRecord-service');


//销售记录列表
var consumeRecordList = function (req, res) {
  var merchant_session = req.session.merchant;
  var merchantId = merchant_session._id;
  var consumeRecordList_data = [];
  memberServer.findMemberListByMerchantId(merchantId, function (status, result) {
    var memberList = status === 200 ? result.members : [];
    var memberLen = memberList.length;

    function memberLoop(i) {
      if (i < memberLen) {
        var member_data = memberList[i];
        if (member_data && member_data._id) {
          consumeRecordServer.findConsumeRecordListByMemberId(member_data._id, function (status_consume, result_consume) {
            var consumeRecordList = status_consume === 200 ? result_consume.consumeRecords : [];
            if (consumeRecordList && consumeRecordList.length > 0) {
              consumeRecordList_data = consumeRecordList_data.concat(consumeRecordList);
            }
            memberLoop(i + 1);
          });
        } else {
          memberLoop(i + 1);
        }
      } else {
        res.render('wehere/consumeRecordList', {
          merchantId    :merchantId,
          consumeRecords:consumeRecordList_data
        });
      }
    }

    memberLoop(0);
  });
};

module.exports = {
  consumeRecordList:consumeRecordList
};