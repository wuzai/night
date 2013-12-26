//验证是否是整数
var isInteger = function (str) {
  var regStr = /^[-]{0,1}[0-9]{1,}$/;
  return regStr.test(str);
};

//验证手机号码
var isTelephone = function (telephone) {
  var reg = /^0?(13[0-9]|15[012356789]|18[0236789]|14[57])[0-9]{8}$/;
  return reg.test(telephone);
};


//验证价格，小数点后只有两位
var isPrice = function (price) {
  var reg = /^(-?\d+)(\.\d{1,2})?$/;
  return reg.test(price);
};

//电话号码正则表达式
var isPhone = function (phone) {
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
var isUrl = function (str) {
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
var isEmail = function (str) {
  var reg = /^([a-z0-9]+[-_]?[a-z0-9]+)*@([a-z0-9]*[-_]?[a-z0-9]+)+[\.][a-z]{2,3}([\.][a-z]{2})?$/i;
  //var reg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
  return reg.test(str);
};

//文本长度截取
var overflowContent = function (value, length) {
  //默认长度为100个字符
  if (length == null) {
    length = 100;
  }
  var strText = "";
  if (value != null) {
    strText = value.toString().trim();
  }

  var flag = strText.length > length;
  if (flag) {
    strText = strText.substring(0, length) + "...";
  }
  return strText;
}


// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
// 例子：
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
Date.prototype.Format = function (fmt) { //author: meizz
  var o = {
    "M+":this.getMonth() + 1, //月份
    "d+":this.getDate(), //日
    "h+":this.getHours(), //小时
    "m+":this.getMinutes(), //分
    "s+":this.getSeconds(), //秒
    "q+":Math.floor((this.getMonth() + 3) / 3), //季度
    "S" :this.getMilliseconds() //毫秒
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
}

//日期格式化
var dateFormatter = function (date, fmt) {
  if (!date) {
    date = new Date();
  }
  if (!fmt) {
    fmt = 'yyyy-MM-dd hh:mm:ss'
  }
  var date_g = date.replace(/-/g, "/");
  return new Date(date_g).Format(fmt);
}

/**
 * 去掉字符串左右两端的空格 gongtao  add
 */
//写成类的方法格式如下：（str.trim();)

String.prototype.trim = function(){ //删除左右两端的空格
  return this.replace(/(^\s*)|(\s*$)/g, "");
}
String.prototype.ltrim = function(){ //删除左边的空格
  return this.replace(/(^\s*)/g,"");
}
String.prototype.rtrim = function(){ //删除右边的空格
  return this.replace(/(\s*$)/g,"");
}