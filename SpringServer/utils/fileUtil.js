var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var config = require('../config');

//随机字节长度
var RANDOM_BYTES_LENGTH = 8;

/**
 * 生成上传文件名与时间序列
 * @param extNameByDot 文件后缀名
 * @param prefix 文件名前缀
 * @return {*}
 */
exports.generateUploadFileName = generateUploadFileName = function (extNameByDot, prefix) {
  var sn = Date.now();
  var buf = crypto.randomBytes(RANDOM_BYTES_LENGTH);
  var ran = buf.toString('hex');
  sn = [sn , '_' , ran].join('');
  if (prefix) {
    return [prefix , sn , extNameByDot].join('');

  } else {
    return [sn , extNameByDot].join('');
  }
};

/**
 * 获取文件后缀名
 * @param fileName 文件名
 * @return {String}
 */
exports.getExtension = getExtension = function (fileName) {
  var pi = fileName.lastIndexOf('.');
  var fileType = pi > 0 ? fileName.substr(pi) : "";
  return fileType;
};

/**
 * 获取上传文件的完整路径
 * @type {Function}
 */
exports.getUploadFileFullPath = getUploadFileFullPath = function (fileName) {
  if (fileName.indexOf('..') != -1) {
    return null;
  }
  return path.join(config.fileServer_dir, fileName);
};

/**
 * 从文件路径中获取文件名
 * @type {Function}
 */
exports.getFileName = getFileName = function (filePath) {
  var fileName = filePath.split('/').slice(-1)[0];
  return fileName;
};

/**
 * 创建所有目录
 * @param dirpath 目录路径
 * @param mode 默认值为0777
 * @param callback
 */
exports.createMkdirs = createMkdirs = function (dirpath, mode, callback) {
  fs.exists(dirpath, function (exists) {
    if (exists) {
      callback(dirpath);
    } else {
      //尝试创建父目录，然后再创建当前目录
      createMkdirs(path.dirname(dirpath), mode, function () {
        fs.mkdir(dirpath, mode, callback);
      });
    }
  });
};