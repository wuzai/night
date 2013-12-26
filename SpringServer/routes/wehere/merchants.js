var config = require('../../config');
var webRoot_wehere = config.webRoot_wehere;
var webRoot_admin = config.webRoot_admin;
var Merchant = require('../../model/Merchant').Merchant;
var MerchantTypeList = require('../../model/Merchant').MerchantTypeList;
var ImageStore = require('../../model/ImageStore').ImageStore;
var Employee = require('../../model/Employee').Employee;
var ObjectId = require('mongoose').Types.ObjectId;
var fileServer = require('../../utils/file-server');
var profileServer = require('../../services/profile-service');
var merchantServer = require('../../services/merchant-service');
var merchantInMerchantServer = require('../../services/merchantInMerchant-service');
var weiXinInMerchantServer = require('../../services/weiXinInMerchant-service');
var storeServer = require('../../services/store-service');
var userServer = require('../../services/user-service');
var swiss = require('../../utils/swiss-kit');

/**
 * 验证商户信息
 * @param merchantInfo 商户信息
 */
var validationMerchantInfo = function (merchantInfo) {
  var result = {flag:false, message:'参数传递错误.'};
  if (merchantInfo.merchantName && merchantInfo.merchantName.trim()) {
    if (merchantInfo.telPrincipalValue && !swiss.isPhone(merchantInfo.telPrincipalValue)) {
      result.message = '负责人电话输入错误.';
    } else if (merchantInfo.webSite && !swiss.isUrl(merchantInfo.webSite)) {
      result.message = '网站地址输入错误.';
    } else {
      result.flag = true;
      result.message = '';
    }
  } else {
    result.message = '商户名称不能为空.';
  }
  return result;
};

/**
 * 商户注册页面
 * @param req
 * @param res
 */
var signUpPage = function (req, res) {
  var query = req.query;
  //userId从会话中获取，如果userId为空，提醒用户登录
  var user = req.session.user;
  if (user && user._id) {
    var userId = user._id;
    Merchant.findOne({creator:userId}, '_id', function (err, merchant) {
      if (merchant) {
        if(merchant.state=='0000-0000-1111'){
          req.session.messages = {error:['您的账号已被禁用']};
          res.redirect([webRoot_wehere , '/dashboard'].join(''));
        }else{
          req.session.messages = {error:['您的账号已经创建了商户']};
          res.redirect([webRoot_wehere , '/dashboard'].join(''));
        }
      } else {
        res.render('wehere/merchantSignUp', {
          merchantTypeList:MerchantTypeList,
          userId          :userId
        });
      }
    });
  } else {
    req.session.messages = {error:['用户未登录，请先登录']};
    res.redirect('/userSignIn');
  }
};

/**
 * 商户信息保存
 * @param req
 * @param merchantInfo 商户信息
 * @param callback
 */
var merchantSave = function (req, merchantInfo, callback) {
  if (merchantInfo.merchantName && merchantInfo.merchantName.trim()) {
    var merchantName = merchantInfo.merchantName.trim();
    Merchant.count({merchantName:merchantName}, function (err, count) {
      if (err) return callback(404, {error:err});
      if (count > 0) {
        callback(409, {error:'商户名称已被注册.'});
        return;
      }
      if (merchantInfo.rate && !swiss.isInteger(merchantInfo.rate)) {
        callback(400, {error:'兑换率必须是整数.'});
        return;
      }
      var merchant = new Merchant({
        merchantName :merchantName,
        merchantType  :merchantInfo.merchantType,
        description  :merchantInfo.description,
        customerPhone:merchantInfo.customerPhone,
        webSite      :merchantInfo.webSite,
        intro        :merchantInfo.intro,
        creator      :merchantInfo.creator
      });
      fileServer.uploadFileMain(req, 'logoImage', '/sys/user/images', function (data) {
        if (data.success) {
          var url = data.fileUrl;
          merchant.logoImage = url;
        }
        fileServer.uploadFileMain(req, 'postImage', '/sys/user/images', function (data) {
          var imageError = '';
          if (data.success) {
            var url = data.fileUrl;
            var postImage = {
              url:url,
              txt:url
            };
            merchant.postImage = postImage;
          } else {
            imageError = data.error;
          }
          merchant.save(function (err, new_merchant) {
            if (err) return callback(404, {error:err});
            callback(200, new_merchant);
          });
        });
      });
    });
  } else {
    callback(400, {error:'商户名称不能为空.'});
    return;
  }
};

//商户注册
var signUp = function (req, res) {
  var body = req.body;
  var merchantInfo = {
    merchantName :body.merchantName.trim(),
    merchantType  :body.merchantType.trim(),
    description  :body.description.trim(),
    customerPhone:body.customerPhone ? body.customerPhone.split(',') : [],
    webSite      :body.webSite ? body.webSite.trim() : '',
    creator      :body.userId,
    intro        :body.intro.trim()
  };
  var result_validation = validationMerchantInfo(merchantInfo);
  if (result_validation.flag) {
    merchantSave(req, merchantInfo, function (status, result) {
      if (status === 200) {
        req.session.messages = {notice:'商户加盟成功！'};
        res.redirect([webRoot_wehere, '/merchant/info'].join(''));
      } else {
        req.session.messages = {error:[result.error]};
        res.redirect([webRoot_wehere , '/merchant/signUp'].join(''));
      }
    });
  } else {
    req.session.messages = {error:[result_validation.message]};
    res.redirect([webRoot_wehere , '/merchant/signUp'].join(''));
    return;
  }
};

//获取商户信息
var merchantInfo = function (req, res) {
  var merchant_session = req.session.merchant;
  var merchantId = merchant_session._id;
  Merchant.findById(merchantId).exec(function (err, merchant) {
    if (merchant) {
      var merchant_date = {
        _id          :merchant._id,
        merchantName :merchant.merchantName,
        merchantType :merchant.merchantType,
        description  :merchant.description,
        customerPhone:merchant.customerPhone,
        webSite      :merchant.webSite,
        creator      :merchant.creator,
        createdAt    :merchant.createdAt,
        logoImage    :merchant.logoImage,
        telPrincipal :merchant.telPrincipal,
        imageView    :merchant.imageView,
        postImage    :merchant.postImage,
        location     :merchant.location,
        address      :merchant.address,
        intro        :swiss.formatTextarea(merchant.intro)
      };
      userServer.getUserById(merchant.creator, function (status_user, result_user) {
        //判断绑定的微信公众帐号
        weiXinInMerchantServer.getWeiXinInMerchantByMerchantId(merchantId, function (status_weiXinObject, result_weiXinObject) {
          var weiXinObject = '';
          if (status_weiXinObject === 200) {
            weiXinObject = result_weiXinObject.weiXinObject;
          }
          res.render('wehere/merchantInfo', {
            merchant    :merchant_date,
            user        :result_user.user,
            weiXinObject:weiXinObject
          });
        });
      });
    } else {
      req.session.messages = {error:['未获取到相关数据']};
      res.redirect([webRoot_wehere , '/dashboard'].join(''));
    }
  });
};

var editPage = function (req, res) {
  var query = req.query;
  var merchantId = query.merchantId;
  Merchant.findOne({_id:merchantId, state:'0000-0000-0000'}).exec(function (err, merchant) {
    if (merchant) {
      var locationUpdateTime = '2013-12-6';
      res.render('wehere/merchantEdit', {
        merchant          :merchant,
        merchantTypeList  :MerchantTypeList,
        locationUpdateTime:locationUpdateTime
      });
    } else {
      req.session.messages = {error:['未获取到相关数据']};
      res.redirect([webRoot_wehere , '/dashboard'].join(''));
    }
  });
};

/**
 * 商户信息更新保存
 * @param req
 * @param merchantInfo 商户信息
 * @param callback
 */
var merchantUpdate = function (req, merchantInfo, callback) {
  if (merchantInfo.merchantName && merchantInfo.merchantName.trim()) {
    var merchantName = merchantInfo.merchantName.trim();
    Merchant.count({merchantName:merchantName, _id:{$ne:merchantInfo._id}}, function (err, count) {
      if (err) return callback(404, {error:err});
      if (count > 0) {
        callback(409, {error:'商户名称已被注册.'});
        return;
      }
      var update_data = {
        merchantName           :merchantName,
        merchantType            :merchantInfo.merchantType,
        description            :merchantInfo.description,
        customerPhone          :merchantInfo.customerPhone,
        'telPrincipal.value'   :merchantInfo.telPrincipalValue,
        'telPrincipal.isPublic':merchantInfo.isPublicTel ? true : false,
        webSite                :merchantInfo.webSite,
        address                :[merchantInfo.province, merchantInfo.city, merchantInfo.area, merchantInfo.street].join(''),
        'location.province'    :merchantInfo.province,
        'location.city'        :merchantInfo.city,
        'location.area'        :merchantInfo.area,
        'location.street'      :merchantInfo.street,
        'location.longitude'   :merchantInfo.longitude,
        'location.latitude'    :merchantInfo.latitude,
        'location.relevantText':merchantInfo.relevantText,
        intro                  :merchantInfo.intro
      };

      fileServer.uploadFileMain(req, 'logoImage', '/sys/user/images', function (logoImage_data) {
        if (logoImage_data.success) {
          var url = logoImage_data.fileUrl;
          update_data.logoImage = url;
        }
        fileServer.uploadFileMain(req, 'postImage', '/sys/user/images', function (postImage_data) {
          var postImage = null;
          if (postImage_data.success) {
            var url = postImage_data.fileUrl;
            postImage = {
              url:url,
              txt:url
            };
          }
          Merchant.findById(merchantInfo._id, function (merchantInfo_err, merchantInfo_data) {
            var new_postImage = [];
            if (merchantInfo_data.postImage && Array.isArray(merchantInfo_data.postImage)) {
              new_postImage = merchantInfo_data.postImage;
            }
            if (postImage) {
              new_postImage.push(postImage);
            }
            update_data.postImage = new_postImage;
            Merchant.update({_id:merchantInfo._id}, update_data, function (merchant_err, new_merchant) {
              if (merchant_err) return callback(404, {error:merchant_err});
              callback(200, new_merchant);
            });
          });
        });
      });
    });
  } else {
    callback(400, {error:'商户名称不能为空.'});
    return;
  }
};

var editSave = function (req, res) {
  var body = req.body;
  var merchantInfo = {
    _id              :body.merchantId,
    merchantName     :body.merchantName.trim(),
    merchantType      :body.merchantType.trim(),
    description      :body.description.trim(),
    customerPhone    :body.customerPhone ? body.customerPhone.split(',') : [],
    telPrincipalValue:body.telPrincipalValue.trim(),
    isPublicTel      :body.isPublicTel,
    webSite          :body.webSite.trim(),
    province         :body.province ? body.province.trim() : '',
    city             :body.city ? body.city.trim() : '',
    area             :body.area ? body.area.trim() : '',
    street           :body.street.trim(),
    relevantText     :body.relevantText.trim(),
    longitude        :body.longitude.trim(),
    latitude         :body.latitude.trim(),
    intro            :body.intro.trim()
  };
  var result_validation = validationMerchantInfo(merchantInfo);
  if (result_validation.flag) {
    merchantUpdate(req, merchantInfo, function (status, result) {
      if (status === 200) {
        req.session.messages = {notice:'商户信息修改成功！'};
        res.redirect([webRoot_wehere, '/merchant/info'].join(''));
      } else {
        req.session.messages = {error:[result.error]};
        res.redirect([webRoot_wehere , '/merchant/edit?merchantId=' , merchantInfo._id].join(''));
      }
    });
  } else {
    req.session.messages = {error:[result_validation.message]};
    res.redirect([webRoot_wehere , '/merchant/edit?merchantId=' , merchantInfo._id].join(''));
    return;
  }
};

//删除商户展示图
var merchantDeleteImage = function (req, res, next) {
  var query = req.query;
  var merchantId = query.merchantId;
  var postImageId = query.postImageId;
  if (merchantId && postImageId) {
    Merchant.findOne({_id:merchantId}).exec(function (err, merchant) {
      if (merchant) {
        var new_postImage_data = [];
        var postImage_data = merchant.postImage;
        if (postImage_data) {
          for (var i = 0; i < postImage_data.length; i++) {
            var postImage = postImage_data[i];
            if (postImage._id != postImageId) {
              new_postImage_data.push(postImage);
            }
          }
          Merchant.update({_id:merchantId}, {postImage:new_postImage_data}, function (err, new_merchant) {
            res.redirect([webRoot_wehere , '/merchant/edit?merchantId=', merchantId].join(''));
          });
        }
        res.redirect([webRoot_wehere , '/merchant/edit?merchantId=', merchantId].join(''));
      } else {
        req.session.messages = {error:['未获取到相关数据']};
        res.redirect([webRoot_wehere , '/dashboard'].join(''));
      }
    });
  } else {
    req.session.messages = {error:['未获取到相关数据']};
    res.redirect([webRoot_wehere , '/dashboard'].join(''));
  }
};

//打开商户联盟页面
var openMerchantUnionPage = function (req, res) {
  var merchant_session = req.session.merchant;
  var merchantId = merchant_session._id;
  //获取该商户已联盟的商户
  merchantInMerchantServer.findSubMerchantByMerchantId(merchantId, function (status_subMerchant, result_subMerchant) {
    if (result_subMerchant) {
      var merchantIds = result_subMerchant.merchantIds;
      merchantIds.push(merchantId);
      merchantServer.findMerchantOfUnion(merchantIds, function (status_merchant, result_merchant) {
        if (result_merchant.merchants) {
          res.render('wehere/merchantUnion', {
            merchantId  :merchantId,
            merchants   :result_subMerchant.merchants, //已选商户
            disMerchants:result_merchant.merchants//未选商户
          });
        } else {
          req.session.messages = {error:['未获取到相关数据']};
          res.redirect([webRoot_wehere , '/dashboard'].join(''));
        }
      });
    } else {
      req.session.messages = {error:['未获取到相关数据']};
      res.redirect([webRoot_wehere , '/dashboard'].join(''));
    }
  });
};

//保存商户联盟关联数据
var merchantUnionSave = function (req, res) {
  var body = req.body;
  var merchantId = body.merchantId;
  var merchantIds = body.merchantIds;
  var merchantIdList = [];
  var flag = typeof(merchantIds);
  if (flag === 'string') {
    merchantIdList.push(merchantIds);
  } else {
    merchantIdList = merchantIdList.concat(merchantIds);
  }
  merchantInMerchantServer.saveMerchantInMerchantBySubIds(merchantId, merchantIdList, function (status, result) {
    if (status === 200) {
      req.session.messages = {notice:'该商户已经成功加入商务会所.'};
      res.redirect([webRoot_wehere , '/merchant/merchantUnion'].join(''));
    } else {
      req.session.messages = {error:[result.error]};
      res.redirect([webRoot_wehere , '/merchant/merchantUnion'].join(''));
    }
  });
};

var merchantUnionDelete = function (req, res) {
  var merchant_session = req.session.merchant;
  var merchantId = merchant_session._id;
  var query = req.query;
  var subMerchantId = query.merchantId;
  merchantInMerchantServer.deleteMerchantInMerchant(merchantId, subMerchantId, function (status, result) {
    if (status === 200) {
      req.session.messages = {notice:'该商户与商务会所联盟关系已解除.'};
      res.redirect([webRoot_wehere , '/merchant/merchantUnion'].join(''));
    } else {
      req.session.messages = {error:[result.error]};
      res.redirect([webRoot_wehere , '/merchant/merchantUnion'].join(''));
    }
  });
};
//商户列表
var merchantControlList = function (req, res, next) {
  var query = {
    $or: [ { state: '0000-0000-0000' }, { state: '0000-0000-1111' } ]
  };
  Merchant.find(query).sort({updatedAt:-1}).exec(function (err, merchantList) {
    res.render('sys/merchantControlList', {
      merchants:merchantList
    });
  });
};
//根据状态删除、禁用、启用商户
var changeMerchantByState = function (req, res, next) {
  var query = req.query;
  var merchantId = query.merchantId;
  var merchantState = query.merchantState;
  if(merchantId&&merchantState){
    var state='';
    if(merchantState=='disable'){//禁用
      state = '0000-0000-1111';
    }else if(merchantState=='enabled'){//启用
      state = '0000-0000-0000';
    }else if(merchantState=='delete'){//删除
      state = '1111-1111-1111';
    }
    if(state){
      Merchant.update({_id:merchantId}, {state:state}, function (err, count) {
        res.redirect([webRoot_wehere , '/merchant/merchantControlList'].join(''));
      });
    }else{
      req.session.messages = {error:['未获取到相关数据']};
      res.redirect([webRoot_admin , '/dashboard'].join(''));
    }
  }else{
    req.session.messages = {error:['未获取到相关数据']};
    res.redirect([webRoot_admin , '/dashboard'].join(''));
  }
};

module.exports = {
  merchantInfo         :merchantInfo,
  editPage             :editPage,
  editSave             :editSave,
  signUpPage           :signUpPage,
  signUp               :signUp,
  merchantControlList  :merchantControlList,
  changeMerchantByState    :changeMerchantByState,
  openMerchantUnionPage:openMerchantUnionPage,
  merchantUnionSave    :merchantUnionSave,
  merchantDeleteImage  :merchantDeleteImage,
  merchantUnionDelete  :merchantUnionDelete
};