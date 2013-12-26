var moment = require('moment');
var crypto = require('crypto');
var config = require('../config');
var fs = require('fs');

var RANDOM_BYTES_LENGTH = 8;

// format date style to yyyy-mm-dd.
exports.getSimpleDate = function (d) {
  if (!d) return d;
  return moment(d).format('MM-DD');
};

// format date style to yyyy-mm-dd.
exports.getNormalDate = function (d) {
  if (!d) return d;
  return moment(d).format('YYYY-MM-DD');
};

// format date style to yyyy-mm-dd hh:mi:ss.
exports.getDetailDateTime = function (d) {
  if (!d) return d;
  return moment(d).format('YYYY-MM-DD HH:mm:ss');
};

//获取当前时间戳
exports.getTimestamp = function() {
  var date = new Date();
  var yy = date.getYear();
  var MM = date.getMonth() + 1;
  var dd = date.getDay();
  var hh = date.getHours();
  var mm = date.getMinutes();
  var ss = date.getSeconds();
  var sss = date.getMilliseconds();
  var result = Date.UTC(yy, MM, dd, hh, mm, ss, sss);
  return result;
}
exports.formatTextarea = function (content) {
  if (content) {
    content = content.replace(/\r\n/g, '<br>');
    content = content.replace(/\r/g, '<br>');
    content = content.replace(/\s/g, '&nbsp;');
  }
  return content;
}
// generate simple serial number with prefix.
exports.genSerialNumber = function (prefix) {
  var sn = Date.now();
  var buf = crypto.randomBytes(RANDOM_BYTES_LENGTH);
  var ran = buf.toString('hex');
  sn = sn + '_' + ran;
  if (prefix) {
    sn = prefix + sn;
  }
  return sn;
};

// generate uploaded fileName with time sequence.
exports.generateUploadFileName = function (extNameByDot, prefix) {
  var sn = Date.now();
  var buf = crypto.randomBytes(RANDOM_BYTES_LENGTH);
  var ran = buf.toString('hex');
  sn = sn + '_' + ran;
  if (prefix) {
    return prefix + sn + extNameByDot;
  } else {
    return sn + extNameByDot;
  }
};

exports.replaceAll = function (str, oldStr, newStr) {
  if (!str) return str;
  return str.replace(new RegExp(oldStr, 'gm'), newStr);
};

/**
 * Test a route is not to be authorize appkey.
 * @route {String} restify route string.
 */
exports.isRouteNotToBeAuthorize = function (path) {
  var isNotToBeVerify = false;
  if (config.exclude_authority_routes) {
    config.exclude_authority_routes.forEach(function (item) {
      if (item.test(path)) {
        isNotToBeVerify = true;
        return;
      }
    });
  }
  return isNotToBeVerify;
};

// get uploaded file's full path.
exports.getUploadFileFullPath = getUploadFileFullPath = function (filename) {
  if (filename.indexOf('..') != -1) {
    return null;
  }
  var len = config.fileServer_dir.length;
  if (config.fileServer_dir[len - 1] === '/') {
    return config.fileServer_dir + filename;
  } else {
    return config.fileServer_dir + '/' + filename;
  }
};

// get extension of string fileName.
exports.getExtension = function (fileName) {
  var i = fileName.lastIndexOf('.');
  return (i < 0) ? '' : fileName.substr(i);
};

/**
 * send http file.
 * @filePath {String} file path wish to send.
 * @mime {String} mime type.
 * @isAttachment {Boolean} decide to set http header: 'Content-Disposition' = 'attachment; filename=xxx'.
 * @res {Object} response object.
 * @next {Function} next route function.
 */
exports.sendHttpFile = function (filePath, mime, isAttachment, res, next) {
  if (fs.existsSync(filePath)) {
    var fileName = getFileName(filePath);
    var headers = {'Content-Type':mime};
    if (isAttachment) {
      headers['Content-Disposition'] = 'attachment; filename=' + fileName;
    }
    res.writeHead(200, headers);
  } else {
    return next('file not fount.');
  }
  var stuff = fs.readFileSync(filePath);
  res.end(stuff);
};

/**
 * get fileName from filePath string.
 * @return {String} fileName.
 */
exports.getFileName = getFileName = function (filePath) {
  var fileName = filePath.split('/').slice(-1)[0];
  return fileName;
};

//JSON数据排序
exports.sort_by = function (field, reverse) {
  reverse = (reverse) ? -1 : 1;//是否倒序
  return function (a, b) {
    a = a[field];
    b = b[field];
    if (a < b) return reverse * -1;
    if (a > b) return reverse * 1;
    return 0;
  }
};

exports.findProfileToJSON = function (attrs) {
  var attrJson = {};
  attrs.forEach(function (attr) {
    attrJson[attr.attribute.attributeName] = attr.value;
  });
  return attrJson;
}

//验证是否是整数
exports.isInteger = isInteger = function (str) {
  var regStr = /^[-]{0,1}[0-9]{1,}$/;
  return regStr.test(str);
};

//验证手机号码
exports.isTelephone = isTelephone = function (telephone) {
  var reg = /^0?(13[0-9]|15[012356789]|18[0236789]|14[57])[0-9]{8}$/;
  return reg.test(telephone);
};

//电话号码正则表达式
exports.isPhone = isPhone = function (phone) {
  //匹配手机号码
  var flag = isTelephone(phone);
  if (!flag) {
    //匹配固定电话
    var reg = /(^(0\d{2,3}-?)\d{3,8}$)|(^\(0\d{2,3}\)\d{3,8}$)/;
    flag = reg.test(phone);
  }
  return flag;
};

//验证URL
exports.isUrl = isUrl = function (str) {
  var strRegex = "^((https|http|ftp|rtsp|mms)?://)"
      + "?(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?" //ftp的user@
      + "(([0-9]{1,3}\.){3}[0-9]{1,3}" // IP形式的URL- 199.194.52.184
      + "|" // 允许IP和DOMAIN（域名）
      + "([0-9a-z_!~*'()-]+\.)*" // 域名- www.
      + "([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\." // 二级域名
      + "[a-z]{2,6})" // first level domain- .com or .museum
      + "(:[0-9]{1,4})?" // 端口- :80
      + "((/?)|" // a slash isn't required if there is no file name
      + "(/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+/?)$";
  var reg = new RegExp(strRegex);
  return reg.test(str);
};

//验证邮箱E-mail
exports.isEmail = isEmail = function (str) {
  var reg = /^([a-z0-9]+[-_]?[a-z0-9]+)*@([a-z0-9]*[-_]?[a-z0-9]+)+[\.][a-z]{2,3}([\.][a-z]{2})?$/i;
  //var reg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
  return reg.test(str);
};
