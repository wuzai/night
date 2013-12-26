/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 13-11-22
 * Time: 下午5:32
 * To change this template use File | Settings | File Templates.
 */
var config = require('../../config');
var webRoot_wehere = config.webRoot_wehere;
var webRoot_admin = config.webRoot_admin;
var Bulletin = require('../../model/Bulletin').Bulletin;
var FollowBulletin = require('../../model/FollowBulletin').FollowBulletin;

//用户发表的主题列表
var bulletinList = function (req, res, next) {
  var query = {
    state:'0000-0000-0000'
  };
  Bulletin.find(query).sort({updatedAt:-1}).populate('user', 'userName').exec(function (err, bulletinList) {
    res.render('sys/bulletinList', {
      bulletins:bulletinList
    });
  });
};
//删除主题以及回帖
var bulletinDelete = function (req, res, next) {
  var query = req.query;
  var bulletinId = query.bulletinId;
  if(bulletinId){
    FollowBulletin.find({bulletin:bulletinId}).sort({updatedAt:-1}).exec(function (err, followBulletinList) {
      if(err){
        req.session.messages = {error:['删除回帖出错！']};
        res.redirect([webRoot_wehere , '/message/bulletinList'].join(''));
      }else{
        var followBulletinLength = followBulletinList.length;
        function followBulletinDelete(i){
          if(i<followBulletinLength){
            var followBulletin = followBulletinList[i];
            //    FollowBulletin.update({_id:followBulletinId}, {state:'1111-1111-1111'}, function (err, count) {
            FollowBulletin.remove({_id:followBulletin._id}, function (err) {//删除回帖
              if(err){
                req.session.messages = {error:['删除回帖出错！']};
                res.redirect([webRoot_wehere , '/message/bulletinList'].join(''));
              }else{
                followBulletinDelete(i+1);
              }
            });
          }else{
//    Bulletin.update({_id:bulletinId}, {state:'1111-1111-1111'}, function (err, count) {
            Bulletin.remove({_id:bulletinId}, function (err) {//删除主题
              res.redirect([webRoot_wehere , '/message/bulletinList'].join(''));
            });
          }
        }
        followBulletinDelete(0);
      }
    });
  }else{
    req.session.messages = {error:['未获取到相关数据']};
    res.redirect([webRoot_admin , '/dashboard'].join(''));
  }
};
//用户回帖列表
var followBulletinList = function (req, res, next) {
  var query = req.query;
  var bulletinId = query.bulletinId;
  var query = {
    state:'0000-0000-0000'
  };
  if(bulletinId){
    query.bulletin = bulletinId
    FollowBulletin.find(query).sort({updatedAt:-1}).populate('user', 'userName').exec(function (err, followBulletinList) {
      res.render('sys/followBulletinList', {
        followBulletins:followBulletinList,
        bulletinId:bulletinId
      });
    });
  }else{
    req.session.messages = {error:['未获取到相关数据']};
    res.redirect([webRoot_admin , '/dashboard'].join(''));
  }
};
//删除用户回帖
var followBulletinDelete = function (req, res, next) {
  var query = req.query;
  var bulletinId = query.bulletinId;
  var followBulletinId = query.followBulletinId;
  if(followBulletinId){
//    FollowBulletin.update({_id:followBulletinId}, {state:'1111-1111-1111'}, function (err, count) {
    FollowBulletin.remove({_id:followBulletinId}, function (err) {
      res.redirect([webRoot_wehere , '/message/followBulletinList?bulletinId=',bulletinId].join(''));
    });
  }else{
    req.session.messages = {error:['未获取到相关数据']};
    res.redirect([webRoot_admin , '/dashboard'].join(''));
  }
};

module.exports = {
  bulletinList:bulletinList,
  followBulletinList:followBulletinList,
  followBulletinDelete:followBulletinDelete,
  bulletinDelete:bulletinDelete
};