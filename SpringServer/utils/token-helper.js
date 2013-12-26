var crypto = require('crypto');

var d = exports.defaults = {
  secret:'This is a secret!'
};

exports.generateApiKey = function (len) {
  return crypto.randomBytes(len).toString('hex');
};

exports.generateToken = function (phone, appid, opts) {
  if (typeof phone !== 'string') {
    throw new Error('phone should be a string.');
  }
  if (typeof appid !== 'string') {
    throw new Error('appid should be a string.');
  }
  var secret = opts && opts.secret || d.secret;
  return crypto.createHmac('sha512', secret).update(phone + appid).digest('base64');
};

exports.encryptCrypto = function (hashFormat, data) {
  var hash = crypto.createHash(hashFormat);
  return hash.update(data).digest('hex');
};

exports.encryptPassword = function (hashFormat, passwordSalt, password) {
  var hash = crypto.createHash(hashFormat);
  return hash.update(password).update(passwordSalt).digest('hex');
}

//产生codeLength位随机码
exports.createRandomCode = function (codeLength) {
  if (codeLength < 1) {
    codeLength = 6;
  }
  //var str = '0123456789ABCDEFGHIGKLMNOPQRSTUVWXYZ';
  var str = '0123456789';
  var codeSequence = str.split('');
  var code = [];
  for (var i = 0; i < codeLength; i++) {
    var index = Math.floor(Math.random() * codeSequence.length);
    code.push(codeSequence[index]);
  }
  return code.join('');
}

exports.isNum = function(num){
  var reg = /^\d+(.\d+)?$/;
  if(reg.test(num)) return true;
  return false;
}

exports.getDistance = function(lat_a, lng_a, lat_b, lng_b) {
  lat_a = Number(lat_a);
  lng_a = Number(lng_a);
  lat_b = Number(lat_b);
  lng_b = Number(lng_b);
  var EARTH_RADIUS = 6378137.0;
  var RAD = Math.PI / 180.0;
  var radLat1 = (lat_a * RAD);
  var radLat2 = (lat_b * RAD);
  var a = radLat1 - radLat2;
  var b = (lng_a - lng_b) * RAD;
  var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
  s = s * EARTH_RADIUS;
  s = Math.round(s * 10000) / 10000;
  return s;
}

