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
var NewsInfo = require('../../model/NewsInfo').NewsInfo;
var fileServer = require('../../utils/file-server');

//热点新闻列表
var hotNewsList = function (req, res, next) {
  var query = {
    state:'0000-0000-0000',
    newsType:'hotNews'
  };
  newsInfoList(query,function(status,result){
    res.render('sys/newsInfoList', {
      newsInfos:result,
      newsType:query.newsType
    });
  });
};

//时尚新闻列表
var fashionNewsList = function (req, res, next) {
  var query = {
    state:'0000-0000-0000',
    newsType:'fashionNews'
  };
  newsInfoList(query,function(status,result){
    res.render('sys/newsInfoList', {
      newsInfos:result,
      newsType:query.newsType
    });
  });
};

//查询新闻内容
var newsInfoList = function (query,callback) {
  NewsInfo.find(query).sort({updatedAt:-1}).exec(function (err, newsInfoList) {
    callback(err, newsInfoList);
  });
};
//保存新闻内容
var addNewsInfoSave = function (req, res, next) {
  var body = req.body;
  var newsType =body.newsType
  var newsInfoInfo = new NewsInfo({
    title      :body.title,
    subhead      :body.subhead,
    content    :body.content,
//    contentType    :body.contentType,
    source    :body.source,
    newsType    :newsType
  });
  fileServer.uploadFileMain(req, 'postImage', '/sys/user/images', function (data) {
    var imageError = '';
    if (data.success) {
      var url = data.fileUrl;
      var postImage = {
        url:url,
        txt:url
      };
      newsInfoInfo.postImage = postImage;
    } else {
      imageError = data.error;
    }
    newsInfoInfo.save(function (err, new_newsInfo) {
      if (err) {
        req.session.messages = {error:err};
      } else {
        var text = '新闻添加成功！';
        req.session.messages = {notice:text};
      }
      if(newsType=='fashionNews'){
        res.redirect([webRoot_wehere , '/newsInfo/fashionNewsList'].join(''));
      }else{
        res.redirect([webRoot_wehere , '/newsInfo/hotNewsList'].join(''));
      }
    });
  });
};
//to新闻内容编辑页
var newsInfoEditPage = function (req, res, next) {
  var query = req.query;
  var newsInfoId = query.newsInfoId;
  NewsInfo.findOne({_id:newsInfoId}).exec(function (err, newsInfo) {
    if (newsInfo) {
      res.render('sys/newsInfoEdit', {
        newsInfo:newsInfo
      });
    } else {
      req.session.messages = {error:['未获取到相关数据']};
      res.redirect([webRoot_admin , '/dashboard'].join(''));
    }
  });
};
//编辑保存新闻内容
var newsInfoEditSave = function (req, res, next) {
  var body = req.body;
  var newsInfoId = body.newsInfoId;
  var newsType = body.newsType;
  var newsInfoInfo = {
    title      :body.title,
    subhead      :body.subhead,
    content    :body.content,
//    contentType    :body.contentType,
    source    :body.source
  };
  if(newsInfoId){
    fileServer.uploadFileMain(req, 'postImage', '/sys/user/images', function (data) {
      if (data.success) {
        var url = data.fileUrl;
        var postImage = {
          url:url,
          txt:url
        };
      }
      NewsInfo.findById(newsInfoId,function (err, newsInfo) {
        var new_postImage = [];
        if (newsInfo.postImage && Array.isArray(newsInfo.postImage)) {
          new_postImage = newsInfo.postImage;
        }
        if(postImage){
          new_postImage.push(postImage);
        }
        newsInfoInfo.postImage = new_postImage;
        NewsInfo.update({_id:newsInfoId},newsInfoInfo,function(err,new_newsInfo){
          if (err) {
            req.session.messages = err;
            res.redirect([webRoot_wehere , '/newsInfo/editNewsInfo?newsInfoId=' , newsInfoId].join(''));
          } else {
            var text = '新闻内容修改成功！';
            req.session.messages = {notice:text};
            if(newsType=='fashionNews'){
              res.redirect([webRoot_wehere , '/newsInfo/fashionNewsList'].join(''));
            }else{
              res.redirect([webRoot_wehere , '/newsInfo/hotNewsList'].join(''));
            }
          }
        });
      });
    });
  }else{
    req.session.messages = {error:['未获取到相关数据']};
    res.redirect([webRoot_admin , '/dashboard'].join(''));
  }
};
//删除新闻内容
var newsInfoDelete = function (req, res, next) {
  var query = req.query;
  var newsInfoId = query.newsInfoId;
  var newsType = query.newsType;
  if(newsInfoId){
//    NewsInfo.update({_id:newsInfoId}, {state:'1111-1111-1111'}, function (err, count) {
    NewsInfo.remove({_id:newsInfoId}, function (err) {
      if(newsType=='fashionNews'){
        res.redirect([webRoot_wehere , '/newsInfo/fashionNewsList'].join(''));
      }else{
        res.redirect([webRoot_wehere , '/newsInfo/hotNewsList'].join(''));
      }
    });
  }else{
    req.session.messages = {error:['未获取到相关数据']};
    res.redirect([webRoot_admin , '/dashboard'].join(''));
  }
};
//删除新闻展示图
var newsInfoDeleteImage = function (req, res, next) {
  var query = req.query;
  var newsInfoId = query.newsInfoId;
  var postImageId = query.postImageId;
  if(newsInfoId&&postImageId){
    NewsInfo.findOne({_id:newsInfoId}).exec(function (err, newsInfo) {
      if (newsInfo) {
        var new_postImage_data = [];
        var postImage_data = newsInfo.postImage;
        if(postImage_data){
          for(var i=0;i<postImage_data.length;i++){
            var postImage = postImage_data[i];
            if(postImage._id!=postImageId){
              new_postImage_data.push(postImage);
            }
          }
          NewsInfo.update({_id:newsInfoId},{postImage:new_postImage_data},function(err,new_newsInfo){
            res.redirect([webRoot_wehere , '/newsInfo/editNewsInfo?newsInfoId=', newsInfoId].join(''));
          });
        }else{
          res.redirect([webRoot_wehere , '/newsInfo/editNewsInfo?newsInfoId=', newsInfoId].join(''));
        }
      } else {
        req.session.messages = {error:['未获取到相关数据']};
        res.redirect([webRoot_admin , '/dashboard'].join(''));
      }
    });
  }else{
    req.session.messages = {error:['未获取到相关数据']};
    res.redirect([webRoot_admin , '/dashboard'].join(''));
  }
};

module.exports = {
  hotNewsList:hotNewsList,
  fashionNewsList:fashionNewsList,
  addNewsInfoSave:addNewsInfoSave,
  newsInfoEditPage:newsInfoEditPage,
  newsInfoEditSave:newsInfoEditSave,
  newsInfoDelete:newsInfoDelete,
  newsInfoDeleteImage:newsInfoDeleteImage
};