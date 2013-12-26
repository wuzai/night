var MerchantPoint = require('../model/MerchantPoint').MerchantPoint;
var PointHistory = require('../model/PointHistory').PointHistory;

/**
 * 获取商户平台积分/如果不存在，则创建
 * @param merchantId 商户Id
 * @param callback
 */
var getMerchantPoint = function (merchantId, callback) {
  MerchantPoint.findOne({merchant:merchantId}, function (err, merchantPoint) {
    if (err) return callback(404, {error:err});
    if (merchantPoint) {
      callback(200, merchantPoint);
    } else {
      var add_merchantPoint = new MerchantPoint({
        merchant          :merchantId,
        availablePoint    :0,
        unenforceablePoint:0,
        incomeSumPoint    :0,
        outgoSumPoint     :0
      });
      add_merchantPoint.save(function (err, new_merchantPoint) {
        if (err) return callback(404, {error:err});
        callback(200, {merchantPoint:new_merchantPoint});
      });
    }
  });
};

/**
 * 商户平台积分收入/支出
 * @param merchantId 商户Id
 * @param point 商户平台积分数
 * @param type 用type表示收支：1收入，-1支出
 * @param transactionType enum:['charge', 'invite', 'bonus', 'largess'，'use'，'exchange'], //交易类型[充值,邀请,奖励,赠送,使用,兑换]
 * @param callback
 */
var changeMerchantPoint = function (merchantId, point, type, transactionType, callback) {
  var point = Number(point);//积分数强制转化为浮点数
  point = point ? point : 0;
  getMerchantPoint(merchantId, function (status, result) {
    if (status === 200) {
      var merchantPoint = result.merchantPoint;
      if (type > 0) {
        //收入
        merchantPoint.availablePoint += point;
        merchantPoint.incomeSumPoint += point;
      } else if (type < 0) {
        //支出
        merchantPoint.availablePoint -= point;
        merchantPoint.outgoSumPoint += point;
      }
      merchantPoint.save(function (err, new_merchantPoint) {
        if (err) return callback(404, {error:err});
        //保存商户积分收支历史记录
        var pointHistory = new PointHistory({
          pointTo        :new_merchantPoint._id,
          transactionType:transactionType,
          addPoint       :type > 0 ? point : null,
          decPoint       :type < 0 ? point : null,
          surplusPoint   :new_merchantPoint.availablePoint
        });
        pointHistory.save();
        callback(200, new_merchantPoint);
      });
    } else {
      callback(status, result);
    }
  });
};

//获取商户平台积分的历史记录
var findMerchantPointHistory = function (merchantId, callback) {
  var transactionTypes = {charge:'充值', invite:'邀请', bonus:'奖励', largess:'赠送', use:'使用', exchange:'兑换'};
  MerchantPoint.findOne({merchant:merchantId}, '_id', function (err, merchantPoint) {
    if (err) return callback(404, {error:err});
    var pointHistoryList_data = [];
    if (merchantPoint) {
      PointHistory.find({pointTo:merchantPoint._id}).sort({createdAt:-1}).exec(function (err, pointHistoryList) {
        if (err) return callback(404, {error:err});
        for (var i in pointHistoryList) {
          var pointHistory = pointHistoryList[i];
          var pointHistory_data = {
            _id                :pointHistory._id,
            type               :'merchant',
            merchantId         :merchantId,
            transactionType    :pointHistory.transactionType,
            transactionTypeText:transactionTypes[pointHistory.transactionType],
            addPoint           :pointHistory.addPoint,
            decPoint           :pointHistory.decPoint,
            surplusPoint       :pointHistory.surplusPoint,
            createdAt          :pointHistory.createdAt
          };
          pointHistoryList_data.push(pointHistory_data);
        }
        callback(200, {pointHistorys:pointHistoryList_data});
      });
    } else {
      //如果积分未找到，返回[]记录
      callback(200, {pointHistorys:pointHistoryList_data});
    }
  });
};

module.exports = {
  changeMerchantPoint     :changeMerchantPoint,
  getMerchantPoint        :getMerchantPoint,
  findMerchantPointHistory:findMerchantPointHistory
};