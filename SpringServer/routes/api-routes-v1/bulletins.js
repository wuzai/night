var Bulletin = require('../../model/Bulletin.js').Bulletin;
var FollowBulletin = require('../../model/FollowBulletin.js').FollowBulletin;
var ObjectId = require('mongoose').Types.ObjectId;
var bulletinServer = require('../../services/bulletin-service');

//获取所有主题
var findBulletins = function (req, res, next) {
  var query = {
    state     :'0000-0000-0000'
  };
  bulletinServer.findBulletinsByParam(query,function(status_bulletin,result_bulletin){
    if(status_bulletin===200){
      res.json(200, result_bulletin);
    }else{
      res.json(404, {errors:'查找出错'});
    }
  });
}
//发表主题
var publishBulletin = function (req, res, next) {
  var body = req.body;
  var _title = body.title;
  var _user_id = body.user_id;
  var _content = body.content;
  //var _postImages = body.postImages;
  if (!body || !_user_id) {
    res.json(400, {errors:'请求参数错误.'});
    return;
  }
  if (!_content) {
    res.json(400, {errors:'主题内容不能为空.'});
    return;
  }
  var userId = new ObjectId(_user_id);
  var bulletin = new Bulletin({
    title   :_title,
    user       :userId,
    content:_content
  });
  bulletin.save(function (err, new_bulletin) {
    if (err) return next(err);
    var bulletin_data = {
      _id   :new_bulletin._id,
      title   :_title,
      user       :userId,
      content:_content
    };
    res.json(200, bulletin_data);
  });
}
//获取所有主题回复
var findFollowBulletins = function (req, res, next) {
  var query = req.query;
  var bulletinId = query.bulletinId;
  if (!bulletinId) {
    res.json(400, {errors:'请求参数错误.'});
    return;
  }
  var queryData = {
    bulletin:bulletinId,
    state     :'0000-0000-0000'
  };
  FollowBulletin.find(queryData).sort({updatedAt:-1}).populate('user', 'userName').exec(function (err, followBulletinlist) {
    if (err) res.json(404, {errors:'查找出错'});
    if (followBulletinlist) {
      var data_followBulletin = [];
      var followBulletinLength = followBulletinlist.length;
      function followBulletinLoop(i) {
        if (i < followBulletinLength) {
          var followBulletin = followBulletinlist[i];
          var followBulletinData = {
            _id     :followBulletin._id,
            content:followBulletin.content,
            postImages:followBulletin.postImages,
            user:followBulletin.user.userName,
            bulletin:followBulletin.bulletin
          };
          data_followBulletin.push(followBulletinData);
          followBulletinLoop(i + 1);
        }else{
          res.json(200, data_followBulletin);
        }
      }
      followBulletinLoop(0);
    } else {
      res.json(200, []);
    }
  });
}
//回复主题
var followBulletin = function (req, res, next) {
  var body = req.body;
  var _user_id = body.user_id;
  var _bulletin_id = body.bulletin_id;
  var _content = body.content;
  //var _postImages = body.postImages;
  if (!body || !_user_id||!_bulletin_id) {
    res.json(400, {errors:'请求参数错误.'});
    return;
  }
  if (!_content) {
    res.json(400, {errors:'回复内容不能为空.'});
    return;
  }
  var userId = new ObjectId(_user_id);
  var bulletinId = new ObjectId(_bulletin_id);
  var followBulletin = new FollowBulletin({
    bulletin   :bulletinId,
    user       :userId,
    content:_content
  });
  followBulletin.save(function (err, new_followBulletin) {
    if (err) return next(err);
    var followBulletin_data = {
      _id   :new_followBulletin._id,
      bulletin   :bulletinId,
      user       :userId,
      content:_content
    };
    res.json(200, followBulletin_data);
  });
}


module.exports = {
  findBulletins   :findBulletins,
  publishBulletin   :publishBulletin,
  followBulletin   :followBulletin,
  findFollowBulletins   :findFollowBulletins
};