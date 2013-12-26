var User = require('../../model/User.js').User;
var tokenHelper = require('../../utils/token-helper');
var UserProfile = require('../../model/UserProfile').UserProfile;
var AttributeDictionary = require('../../model/AttributeDictionary').AttributeDictionary;
var ObjectId = require('mongoose').Types.ObjectId;
var captchaRecordServer = require('../../services/captchaRecord-service');
var userServer = require('../../services/user-service');
var fileServer = require('../../utils/file-server');
var ImageStore = require('../../model/ImageStore').ImageStore;
var config = require('../../config');

//获取用户数据
var getUserById = function (req, res, next) {
  var userId = req.params.id;
  User.findById(userId, function (err, user) {
    if (err) return next(err);
    if (user) {
      UserProfile.find({_type:'UserProfile', user:userId}).populate('attribute').exec(function (err, attrs) {
        if (err) return next(err);
        var postImage_data = user.postImage;
        var postImage = '';
        if (postImage_data && postImage_data.length > 0) {
          for (var j = 0; j < postImage_data.length; j++) {
            var url = postImage_data[j].url;
            if (postImage) {
              postImage = postImage + "," + url;
            } else {
              postImage = url;
            }
          }
        }
        var userData = {
          _id:user._id,
          userName:user.userName,
          nickName:user.nickName,
          faceIcon:[config.webRoot, config.imageRoot, user.faceIcon].join(''),
          gender:user.gender ? user.gender : "",
          email:user.email ? user.email : "",
          birth:user.birth ? user.birth : "",
          qqNum:user.qqNum ? user.qqNum : "",
          location:user.location ? (user.location.longitude ? user.location.longitude : "") : "" + "," + user.location ? (user.location.latitude ? user.location.latitude : "") : "",
          postImage:postImage
        };
        res.json(200, userData);
      });
    } else {
      res.json(404, {errors:'用户数据未找到.'});
    }
  });
}
//获取所有用户（根据条件搜索）
var findUsers = function (req, res, next) {
  var query = req.query;
  var queryData = {
    state:'0000-0000-0000'
  };
  if (query.userName) {
    queryData.userName = {$regex:query.userName, $options:'i'};
  }
  if (query.nickName) {
    queryData.nickName = {$regex:query.nickName, $options:'i'};
  }
  //昵称
  if (query.email) {
    queryData.email = {$regex:query.email, $options:'i'};
  }
  var maxDistance = query.maxDistance;
  var longitude = "";
  var latitude = "";
  if (query.location) {
    if (query.location.split(",").length == 2) {
      longitude = query.location.split(",")[0];
      latitude = query.location.split(",")[1];
    }
  }
  var userDetailFields = '_id userName faceIcon location';
  User.find(queryData, userDetailFields, function (err, userlist) {
    if (err) res.json(404, {errors:'查找出错'});
    if (userlist) {
      var data_user = [];
      var userLength = userlist.length;
      function userLoop(i) {
        if (i < userLength) {
          var user = userlist[i];
          user.faceIcon = [config.webRoot, config.imageRoot, user.faceIcon].join('');
          if (latitude && longitude && maxDistance&&tokenHelper.isNum(maxDistance)) {
            var s = tokenHelper.getDistance(latitude, longitude, user.location ? user.location.latitude : '', user.location ? user.location.longitude : '');
            if (s <= maxDistance) {
              data_user.push(user);
            }
            userLoop(i + 1);
          } else {
            data_user.push(user);
            userLoop(i + 1);
          }
        } else {
          res.json(200, data_user);
        }
      }
      userLoop(0);
    } else {
      res.json(404, {errors:'用户数据未找到.'});
    }
  });
}

//修改用户密码
var updatePassword = function (req, res, next) {
  var body = req.body;
  var userId = req.params.id;
  var userDetailFields = 'passwordDigest hashFormat passwordSalt';
  User.findById(userId, userDetailFields, function (err, user) {
    if (err) return next(err);
    if (user) {
      if (!req.body || !req.body.old_password || !req.body.new_password) {
        res.json(400, {errors:'密码必须输入.'});
        return;
      }
      var digest = tokenHelper.encryptPassword(user.hashFormat, user.passwordSalt, body.old_password);
      if (digest === user.passwordDigest) {
        var new_digest = tokenHelper.encryptPassword(user.hashFormat, user.passwordSalt, body.new_password);
        var date = new Date();
        User.update({ _id:userId }, { passwordDigest:new_digest, lastChangePasswordTime:date, updatedAt:date }, function (err, new_user) {
          if (err) return next(err);
          res.json(200, {});
          return;
        });
      } else {
        res.json(410, '原密码错误.');
        return;
      }
    } else {
      res.json(404, {errors:'用户未找到'});
    }
  });
}

//忘记密码时,重置密码
var resetPassword = function (req, res, next) {
  var body = req.body;
  var captcha = req.body.captcha;
  var cellphone = req.body.cellphone;
  var password = req.body.password;
  if (!body || !captcha || !cellphone) {
    res.json(400, {errors:'验证码或电话不能为空.'});
    return;
  }
  if (!password) {
    res.json(400, {errors:'重置密码不能为空.'});
    return;
  }
  captchaRecordServer.checkCaptcha(captcha, cellphone, '找回密码', function (status, result) {
    if (status === 200) {
      var captchaRecord = result.captchaRecord;
      User.findOne({userName:cellphone}, function (err, user) {
        if (err) return next(err);
        if (user) {
          var new_digest = tokenHelper.encryptPassword(user.hashFormat, user.passwordSalt, password);
          var date = new Date();
          User.update({ _id:user._id }, { passwordDigest:new_digest, lastChangePasswordTime:date, updatedAt:date }, function (err, new_user) {
            if (err) return next(err);
            //用户修改成功,验证码修改为已使用状态
            captchaRecord.hasUsed = true;
            captchaRecord.save(function (err, new_captchaRecord) {
              UserProfile.find({_type:'UserProfile', user:user._id}).populate('attribute').exec(function (err, attrs) {
                var userData = {
                  _id:user._id,
                  userName:user.userName
                };
                if (!err && attrs) {
                  attrs.forEach(function (attr) {
                    userData[attr.attribute.attributeName] = attr.value;
                  });
                }
                res.json(200, userData);
              });
            });
          });
        } else {
          res.json(404, {errors:'用户数据未找到.'});
        }
      });
    } else {
      res.json(410, {errors:result.error});
    }
  });
};

//修改用户资料
var updateUserById = function (req, res, next) {
  var userId = req.params.id;
  if (!req.body && !userId) {
    res.json(400, {errors:'请求参数错误.'});
  } else {
    getUser(req, function (query_data) {
      User.findByIdAndUpdate(userId, query_data, function (err, user) {
        if (err) return next(err);
        if (!user) {
          res.json(404, {errors:'用户数据未找到.'});
          return;
        }
//        if (!user.isPerfect) {
//          //如果用户首次修改资料
//          userServer.userUpdateInfoOfFirst(userIdObj, function (status, result) {
//            console.log(result);
//          });
//        }
        res.json(200, {});
      });
    });
  }
};

//拼接用户信息
var getUser = function (req, callback) {
  var body = req.body;
  var query_data = {
    updatedAt:new Date()
  };
  if (body.gender) {
    query_data.gender = body.gender ? body.gender : "";
  }
  if (body.nickName) {
    query_data.nickName = body.nickName ? body.nickName : "";
  }
  if (body.email) {
    query_data.email = body.email ? body.email : "";
  }
  if (body.birth) {
    query_data.birth = body.birth ? body.birth : "";
  }
  if (body.qqNum) {
    query_data.qqNum = body.qqNum ? body.qqNum : "";
  }
  if (body.faceIcon) {
    query_data.faceIcon = body.faceIcon;
  }
  if (body.location) {
    if (body.location.split(",").length == 2) {
      var location = {
        longitude:body.location.split(",")[0],
        latitude:body.location.split(",")[1]
      }
      query_data.location = location;
    }
  }
  var new_postImage = [];
  var postImage_data = body.postImage;
  if (postImage_data) {
    var postImage_array = postImage_data.split(",");
    for (var j = 0; j < postImage_array.length; j++) {
      var postImage = {
        url:postImage_array[j]
      };
      new_postImage.push(postImage);
    }
    query_data.postImage = new_postImage;
  }
  callback(query_data);
//  User.findById(userId,function (err_old, user_old) {
//    if (err_old) return next(err_old);
//    if (!user_old) {
//      res.json(404, {errors:'用户数据未找到.'});
//      return;
//    }
//    //拼接原先图片url
//    if(user_old.postImage){
//      new_postImage = new_postImage.concat(user_old.postImage);
//    }
//    query_data.postImage = new_postImage;
//  });
};

var test = function (req, res, next) {
  res.render('test');
};

module.exports = {
  getUserById:getUserById,
  updatePassword:updatePassword,
  resetPassword:resetPassword,
  updateUserById:updateUserById,
  findUsers:findUsers,
  test:test
};