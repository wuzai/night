var Bulletin = require('../model/Bulletin.js').Bulletin;
var FollowBulletin = require('../model/FollowBulletin.js').FollowBulletin;
var ObjectId = require('mongoose').Types.ObjectId;

//根据条件获取主题
var findBulletinsByParam = function (query, callback) {
  Bulletin.find(query).sort({updatedAt:-1}).populate('user', 'userName').exec(function (err, bulletinlist) {
    if (err) callback(404, {errors:'查找出错'});
    if (bulletinlist) {
      var data_bulletin = [];
      var bulletinLength = bulletinlist.length;
      function bulletinLoop(i) {
        if (i < bulletinLength) {
          var bulletin = bulletinlist[i];
          var bulletinData = {
            _id     :bulletin._id,
            title:bulletin.title,
            content:bulletin.content,
            postImages:bulletin.postImages,
            user:{
              _id:bulletin.user._id,
              name:bulletin.user.userName
            },
            followBulletins:[]
          };
          FollowBulletin.find({bulletin:bulletin._id}).sort({updatedAt:-1}).populate('user', 'userName').exec(function (err, followBulletinlist) {
            if (err) callback(404, {errors:'查找出错'});
            if (followBulletinlist) {
              var followBulletinLength = followBulletinlist.length;
              var data_followBulletin = [];
              function followBulletinLoop(j) {
                if (j < followBulletinLength) {
                  var followBulletin = followBulletinlist[j];
                  var followBulletinData = {
                    _id     :followBulletin._id,
                    content:followBulletin.content,
                    postImages:followBulletin.postImages,
                    user:{
                      _id:followBulletin.user._id,
                      name:followBulletin.user.userName
                    },
                    bulletin:followBulletin.bulletin
                  };
                  data_followBulletin.push(followBulletinData);
                  bulletinData.followBulletins = data_followBulletin;
                  followBulletinLoop(j + 1);
                }else{
                  data_bulletin.push(bulletinData);
                  bulletinLoop(i+1);
                }
              }
              followBulletinLoop(0);
            }else{
              data_bulletin.push(bulletinData);
              bulletinLoop(i+1);
            }
          });
        }else{
          callback(200, data_bulletin);
        }
      }
      bulletinLoop(0);
    } else {
      callback(200, []);
    }
  });
}

module.exports = {
  findBulletinsByParam  :findBulletinsByParam
};