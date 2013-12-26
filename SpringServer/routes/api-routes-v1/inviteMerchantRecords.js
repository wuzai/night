var InviteMerchantRecord = require('../../model/InviteMerchantRecord').InviteMerchantRecord;
var User = require('../../model/User').User;
var UserCellphoneRecord = require('../../model/UserCellphoneRecord').UserCellphoneRecord;

//商户推荐
var recommend = function (req, res, next) {
  var body = req.body;
  var merchantName = body.merchantName;
  var telephone = body.telephone;
  var recommendId = body.recommend_id;
  var inviteMerchantRecord = new InviteMerchantRecord({
    inviter     :recommendId,
    merchantName:merchantName,
    merchantTel :telephone,
    inviteStatus:'待确认'
  });
  inviteMerchantRecord.save(function (err, new_inviteMerchantRecord) {
    if (err) return next(err);
    res.json(200, new_inviteMerchantRecord);
  });
};


module.exports = {
  recommend:recommend
};