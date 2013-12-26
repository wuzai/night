var config = require('../../config');
var NewsInfo = require('../../model/NewsInfo.js').NewsInfo;


var findNewsInfos = function (req, res, next) {
  var query_req = req.query;
  var newsType = query_req.newsType;//新闻类型：热点新闻(hotNews)；时尚新闻(fashionNews)
  if (!newsType) {
    res.json(400, {errors:'请求参数错误.'});
    return;
  }
  var query = {
    newsType:newsType,
    state   :'0000-0000-0000'
  };
  NewsInfo.find(query).sort({updatedAt:-1}).exec(function (err, newsInfolist) {
    if (err) res.json(404, {errors:'查找出错'});
    if (newsInfolist) {
      var data_newsInfo = [];
      var newsInfoLength = newsInfolist.length;

      function newsInfoLoop(i) {
        if (i < newsInfoLength) {
          var newsInfo = newsInfolist[i];
          var postImage_data = newsInfo.postImage;
          var postImage = '';
          if (postImage_data && postImage_data.length > 0) {
            for (var j = 0; j < postImage_data.length; j++) {
              var url = config.webRoot + config.imageRoot + postImage_data[j].url;
              if (postImage) {
                postImage = postImage + "," + url;
              } else {
                postImage = url;
              }
            }
          }
          var newsInfoData = {
            _id      :newsInfo._id,
            title    :newsInfo.title,
            subhead  :newsInfo.subhead,
            content  :newsInfo.content,
            source   :newsInfo.source,
            newsType :newsInfo.newsType,
            postImage:postImage
          };
          data_newsInfo.push(newsInfoData);
          newsInfoLoop(i + 1);
        } else {
          res.json(200, data_newsInfo);
        }
      }

      newsInfoLoop(0);
    } else {
      res.json(200, []);
    }
  });
};

module.exports = {
  findNewsInfos:findNewsInfos
};