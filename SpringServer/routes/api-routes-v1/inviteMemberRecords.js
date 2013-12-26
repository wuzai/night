var InviteMemberRecord = require('../../model/InviteMemberRecord').InviteMemberRecord;
var UserCellphoneRecord = require('../../model/UserCellphoneRecord').UserCellphoneRecord;
var User = require('../../model/User').User;
var ObjectId = require('mongoose').Types.ObjectId;

//推荐用户
var recommend = function (req, res, next) {
  var body = req.body;
  var userName = body.telephone;
  var recommend_id = body.recommend_id;
  var recommendId = new ObjectId(recommend_id);
  User.count({userName:userName}, function (err, count) {
    if (err) return next(err);
    if (count > 0) {
      res.json(409, {errors:'该用户已经注册.'});
      return;
    }
    UserCellphoneRecord.findOne({cellphone:userName, isUsing:true}, '_id user', function (err, userCellphoneRecord) {
      if (err) return next(err);
      if (userCellphoneRecord) {
        res.json(409, {errors:'该手机号码已经注册.'});
        return;
      } else {
        var inviteMemberRecord = new InviteMemberRecord({
          inviter     :recommendId,
          userName    :userName,
          inviteStatus:'待确认'
        });
        inviteMemberRecord.save(function (err, new_inviteMemberRecord) {
          if (err) return next(err);
          res.json(200, new_inviteMemberRecord);
        });
      }
    });
  });
};


module.exports = {
  recommend:recommend
};