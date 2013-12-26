//数据校正处理
var config = require('../config');
var mongoose = require('mongoose');
var Store = require('../model/Store').Store;
var MemberCard = require('../model/MemberCard').MemberCard;
var Coupon = require('../model/Coupon').Coupon;
var MeteringCard = require('../model/MeteringCard').MeteringCard;

//连接MongoDB数据库
if (!mongoose.connection || (mongoose.connection.readyState == 0)) {
  mongoose.connect(config.db);
}

//修正图片路径
var correctionImageUrl = function () {

  var correctionMemberServerList = function (memberCardList, callback) {
    var memberCardLen = memberCardList.length;

    function memberCardLoop(i) {
      if (i < memberCardLen) {
        var memberCard = memberCardList[i];
        console.log(memberCard.iconImage);
        var sss = memberCard.iconImage.replace('http://www.5zzg.com/sys/fileServer/showImages?fileUrl=', '')
        console.log(sss);
        memberCard.iconImage = sss;
        memberCard.save();
        memberCardLoop(i + 1);
      } else {
        console.log('@@:' + memberCardLen);
        callback();
      }
    }

    memberCardLoop(0);
  };

  MemberCard.find(function (err, memberCardList) {
    correctionMemberServerList(memberCardList, function () {
      Coupon.find(function (err, couponList) {
        correctionMemberServerList(couponList, function () {
          MeteringCard.find(function (err, meteringCardList) {
            correctionMemberServerList(meteringCardList, function () {
              console.log('end');
            });
          });
        });
      });
    });
  });
};

//修正图片路径
var correctionImagePath = function () {
  Store.find(function (err, memberCardList) {
    var memberCardLen = memberCardList.length;

    function memberCardLoop(i) {
      if (i < memberCardLen) {
        var memberCard = memberCardList[i];
        console.log(memberCard.vipImage);
        var sss = memberCard.vipImage.replace(/\\/g, '/')
        console.log(sss);
        memberCard.vipImage = sss;
        memberCard.save();
        memberCardLoop(i + 1);
      } else {
        console.log('@@:' + memberCardLen);
      }
    }

    memberCardLoop(0);
  });
};

var init_data = function () {
  correctionImageUrl();
  correctionImagePath();
};


init_data();
