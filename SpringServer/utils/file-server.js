/**
 * 文件处理工具类.
 * ======================================================================
 * 文件服务区目录结构
 * ======================================================================
 *  /default:系统默认文件
 *      /images:图片文件
 *      /flashs:flash文件
 *      /medias:媒体文件
 *      /files:文件
 * /sys:系统文件总路径
 *    /user/:id/:用户文件
 *      /face:头像
 *      /member:会员
 *      /merchant:商户
 *      /store:门店
 *    /web：其他web文件
 * ======================================================================
 * @since 1.0
 */

var fs = require('fs');
var path = require('path');
var moment = require('moment');
var imageinfo = require('imageinfo');
var config = require('../config');
var fileUtil = require('../utils/fileUtil');


/**
 * 移动文件
 * @param sourceFile 源文件
 * @param destDir 目标目录
 * @param destFile 源文件名称
 * @param callback
 */
exports.moveFile = moveFile = function (sourceFile, destDir, destFile, callback) {
  var fileServerDir = config.fileServer_dir;//服务器路径
  var extName = fileUtil.getExtension(destFile);//获取后缀名
  var fileName = fileUtil.generateUploadFileName(extName);//创建新文件名
  var dirPaths = path.join(destDir, fileName).replace(/\\/g, '/');//相对文件路径
  var dest = path.join(fileServerDir, dirPaths).replace(/\\/g, '/');//绝对文件路径

  var is = fs.createReadStream(sourceFile);

  is.on('error', function (err) {
    //log.error('moveFile() - Could not open readstream.');
    callback(400, {error:'Sorry, could not open readstream.'});
  });

  is.on('end', function () {
    fs.unlinkSync(sourceFile);
    callback(200, {fileName:fileName, filePath:dirPaths, fileFullPath:dest});
  });

  fileUtil.createMkdirs(path.join(fileServerDir, destDir), '0777', function (dirpath) {
    var os = fs.createWriteStream(dest);
    os.on('error', function (err) {
      //log.error('moveFile() - Could not open writestream.');
      callback(400, {error:'Sorry, could not open writestream.'});
    });

    is.pipe(os);
  });
};

var dealWithOfFile = function (filePath, callback) {
  try {
    fs.readFile(filePath, function (err, data) {
      if (err) callback(400, {error:err});
      var info = imageinfo(data);
      var fileType = info.mimeType;//文件类型
      if (fileType && fileType.split('/')[0] == 'image') {
        var originalWidth = info.width;//图片宽度
        var originalHeight = info.height;//图片高度
        var width = originalWidth;
        var height = originalHeight;
        if (originalWidth > config.imageUpload_width) {
          width = config.imageUpload_width;
          height = Math.round(originalHeight / originalWidth * parseInt(width, 10));
        }
        callback(200, {type:fileType, width:width, height:height});
      } else {
        callback(400, {error:'该文件不是图片类型.'});
      }
    });
  } catch (err) {
    callback(404, {error:err});
  }
};

/**
 * 接受和处理文件上传数据异步
 * @param req 上传文件请求
 * @param filed 上传文件字段
 * @param destDir 上传文件相对目录
 * @param callback
 */
exports.uploadFileMain = uploadFileMain = function (req, filed, destDir, callback) {
  //将上传的文件从临时目录移动到文件服务器目录
  var moveToDestination = function (sourceFile, destDir, destFile, fileType) {
    moveFile(sourceFile, path.join(destDir, moment(new Date()).format('YYYYMMDD')), destFile, function (status, result) {
      if (status === 200) {
        dealWithOfFile(result.fileFullPath, function (status_deal, result_deal) {
          if (status_deal === 200) {
            callback({
              success :true,
              fileName:result.fileName,
              fileUrl :result.filePath,
              type    :result_deal.type,
              width   :result_deal.width,
              height  :result_deal.height
            });
          } else {
            callback({
              success:false,
              error  :result_deal.error
            });
          }
        });
      }
      else {
        callback({
          success:false,
          error  :result.error
        });
      }
    });
  };

  if (req.xhr) {
    var fileName = req.header('x-file-name');

    // Be sure you can write to '/tmp/'
    var tmpFile = config.tmp_dir + Date.now();

    // Open a temporary writestream
    var ws = fs.createWriteStream(tmpFile);
    ws.on('error', function (err) {
      log.error("uploadFile() - req.xhr - could not open writestream.");
      callback({
        success:false,
        error  :"Sorry, could not open writestream."
      });
    });
    ws.on('close', function (err) {
      moveToDestination(tmpFile, destDir, fileName);
    });

    // Writing filedata into writestream
    req.on('data', function (data) {
      ws.write(data);
    });
    req.on('end', function () {
      ws.end();
    });
  }
  // Old form-based upload
  else {
    var fileName = req.files[filed].name;
    var filePath = req.files[filed].path;
    if (fileName && filePath) {
      moveToDestination(filePath, destDir, fileName);
    } else {
      callback({
        success:false//,
        //error  :'File is not found.'
      });
    }
  }
};
/**
 * 接受和处理文件上传数据异步
 * 上传多个附件
 * @param req 上传文件请求
 * @param filed 上传文件字段
 * @param destDir 上传文件相对目录
 * @param callback
 */
exports.uploadMoreFile = uploadMoreFile = function (req, filed, destDir, callback) {
  //将上传的文件从临时目录移动到文件服务器目录
  var fileData = [];
  var moveToDestination = function (sourceFile, destDir, destFile, callback) {
    moveFile(sourceFile, path.join(destDir, moment(new Date()).format('YYYYMMDD')), destFile, function (status, result) {
      if (status === 200) {
        dealWithOfFile(result.fileFullPath, function (status_deal, result_deal) {
          if (status_deal === 200) {
            var file = {
              fileName   :result.fileName,
              fileOldName:destFile,
              fileUrl    :result.filePath,
              type       :result_deal.type,
              width      :result_deal.width,
              height     :result_deal.height
            };
            callback({
              success :true,
              fileData:file
            });
          } else {
            callback({
              success:false,
              error  :result_deal.error
            });
          }
        });
      } else {
        callback({
          success:false,
          error  :result.error
        });
      }
    });
  };

  var file_data = req.files[filed];
  if (file_data) {
    if (Array.isArray(file_data)) {//一个附件，此length为附件大小
      //用于去除空附件
      function fileLoop(i) {
        if (i < file_data.length) {
          var file_d = file_data[i];
          if(file_d){
            var fileName = file_d.name;
            var filePath = file_d.path;
            if (fileName && filePath) {
              moveToDestination(filePath, destDir, fileName, function (data) {
                if (data.success) {
                  fileData.push(data.fileData)
                }
                fileLoop(i + 1);
              });
            } else {
              fileLoop(i + 1);
            }
          }else{
            fileLoop(i + 1);
          }
        } else {
          callback({
            success :true,
            fileData:fileData
          });
        }
      }
      fileLoop(0);
    } else {
      var fileName = file_data.name;
      var filePath = file_data.path;
      if (fileName && filePath) {
        moveToDestination(filePath, destDir, fileName, function (data) {
          if (data.success) {
            fileData.push(data.fileData)
          }
          callback({
            success :true,
            fileData:fileData
          });
        });
      } else {
        callback({
          success:false//,
          //error  :'File is not found.'
        });
      }
    }
  } else {
    callback({
      success:false//,
      //error  :'File is not found.'
    });
  }
};
/**
 * 接受和处理文件上传数据异步
 * 2013-10-10添加，用于上传不同类型的文件处理
 * @param req 上传文件请求
 * @param filed 上传文件字段
 * @param destDir 上传文件相对目录
 * @param type 文件类型
 * @param callback
 */
exports.uploadFileServiceMain = uploadFileServiceMain = function (req, filed, destDir, type, callback) {
  //将上传的文件从临时目录移动到文件服务器目录
  var moveToDestination = function (sourceFile, destDir, destFile, fileType) {
    moveFile(sourceFile, path.join(destDir, moment(new Date()).format('YYYYMMDD')), destFile, function (status, result) {
      if (status === 200) {
        callback({
          success :true,
          fileName:result.fileName,
          fileUrl :result.filePath,
          type    :fileType
        });
      }
      else {
        callback({
          success:false,
          error  :result.error
        });
      }
    });
  };

  if (req.xhr) {
    var fileName = req.header('x-file-name');

    // Be sure you can write to '/tmp/'
    var tmpFile = config.tmp_dir + Date.now();

    // Open a temporary writestream
    var ws = fs.createWriteStream(tmpFile);
    ws.on('error', function (err) {
      log.error("uploadFile() - req.xhr - could not open writestream.");
      callback({
        success:false,
        error  :"Sorry, could not open writestream."
      });
    });
    ws.on('close', function (err) {
      moveToDestination(tmpFile, destDir, fileName);
    });

    // Writing filedata into writestream
    req.on('data', function (data) {
      ws.write(data);
    });
    req.on('end', function () {
      ws.end();
    });
  }
  // Old form-based upload
  else {
    var file = req.files[filed];
    var fileName = file.name;//文件名称
    var filePath = file.path;//文件路径
    var mimeType = file.type;//文件类型
    var fileSize = file.size;//文件大小
    console.log(mimeType);
    var fileType = mimeType ? mimeType.split('/')[0] : '';
    if (fileName && filePath) {
      if(fileType == type){
        if(type == 'video'){
          //如果是视频格式，做进一步限制
          if(mimeType == 'video/mp4' || mimeType == 'video/ogg' || mimeType == 'video/webm' || mimeType == 'video/quicktime'){
            moveToDestination(filePath, destDir, fileName);
          }else{
            callback({
              success:false,
              error  :'视频上传失败.视频格式只能是video/mp4、video/ogg、video/webm、video/quicktime.'
            });
          }
        }else{
          moveToDestination(filePath, destDir, fileName);
        }
      }else{
        callback({
          success:false,
          error  :'上传文件类型不正确.'
        });
      }
    } else {
      callback({
        success:false//,
        //error  :'File is not found.'
      });
    }
  }
};

//通过文件相对路径获取文件
exports.getFileByFileUrl = getFileByFileUrl = function (req, res, next) {
  var fileUrl = req.query.fileUrl;
  if (!fileUrl || fileUrl.indexOf('..') != -1) {
    return next('file not found.');
  }
  var contentType = req.params.contentType;
  if (!contentType) {
    contentType = 'text/plain';
  }
  var filePath = fileUtil.getUploadFileFullPath(fileUrl);
  sendHttpFile(filePath, contentType, false, res, next);
};

/**
 * send http file.
 * @filePath {String} file path wish to send.
 * @mime {String} mime type.
 * @isAttachment {Boolean} decide to set http header: 'Content-Disposition' = 'attachment; filename=xxx'.
 * @res {Object} response object.
 * @next {Function} next route function.
 */
exports.sendHttpFile = sendHttpFile = function (filePath, mime, isAttachment, res, next) {
  if (fs.existsSync(filePath)) {
    var fileName = fileUtil.getFileName(filePath);
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


//上传文件
exports.uploadFile = uploadFile = function (req, res, next) {
  uploadFileMain(req, 'file', '/sys', function (data) {
    if (data.success) {
      res.send(201, JSON.stringify(data), {
        'Content-Type':'text/plain'
      });
    } else res.send(404, JSON.stringify(data), {
      'Content-Type':'text/plain'
    });
    return next();
  });
};

/**
 * 上传图片文件服务器-临时文件夹tmp下
 * @type {Function}
 */
exports.imageUploadServer = function (req, res, next) {
  //uploadMoreFile
  uploadFileMain(req, 'postImage', '/apios', function (data) {
    if (data.success) {
      var fileUrl = data.fileUrl;
      var fileFullUrl = [config.webRoot, config.imageRoot, data.fileUrl].join('');
      res.json({fileFullUrl:fileFullUrl,fileUrl:fileUrl});
    } else {
      res.json({error:data.error});
    }
  });
};