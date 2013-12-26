var config = require('../../config');
var webRoot_wehere = config.webRoot_wehere;
var SupplyDemand = require('../../model/SupplyDemand').SupplyDemand;
var supplyDemandServer = require('../../services/supplyDemand-service');

//资源供需列表
var supplyDemandList = function (req, res) {
  var merchant_session = req.session.merchant;
  var merchantId = merchant_session._id;
  supplyDemandServer.findSupplyDemandListByMerchantId(merchantId, function (status, result) {
    res.render('wehere/supplyDemandList', {merchantId:merchantId, supplyDemands:result.supplyDemands});
  });
};

/**
 * 验证资源供需信息
 * @param supplyDemandInfo 资源供需信息
 */
var validationSupplyDemandInfo = function (supplyDemandInfo) {
  var result = {flag:false, message:'参数传递错误.'};
  if (supplyDemandInfo.title && supplyDemandInfo.title.trim()) {
    if (supplyDemandInfo.fromDate && supplyDemandInfo.toDate && new Date(supplyDemandInfo.fromDate) > new Date(supplyDemandInfo.toDate)) {
      result.message = '有效开始时间不能小于结束时间.';
      return result;
    }
  } else {
    result.message = '需求标题不能为空.';
    return result;
  }
  result.flag = true;
  result.message = '';
  return result;
};

//添加资源供需信息
var addSupplyDemand = function (req, res) {
  var body = req.body;
  var merchantId = body.merchantId;
  var title = body.title;
  var description = body.description;
  var type = body.type;
  var fromDate = body.fromDate;
  var toDate = body.toDate;
  var supplyDemandInfo = {
    merchant   :merchantId,
    title      :title,
    description:description,
    type       :type,
    fromDate   :fromDate,
    toDate     :toDate
  };
  var result_validation = validationSupplyDemandInfo(supplyDemandInfo);
  if (result_validation.flag) {
    supplyDemandSave(req, supplyDemandInfo, function (status, result) {
      if (status === 200) {
        req.session.messages = {notice:'资源供需添加成功！'};
      } else {
        req.session.messages = {error:[result.error]};
      }
      res.redirect([webRoot_wehere , '/merchant/supplyDemandList'].join(''));
    });
  } else {
    req.session.messages = {error:[result_validation.message]};
    res.redirect([webRoot_wehere , '/merchant/supplyDemandList'].join(''));
  }
};

/**
 * 资源供需信息保存
 * @param req
 * @param supplyDemandInfo 资源供需信息
 * @param callback
 */
var supplyDemandSave = function (req, supplyDemandInfo, callback) {
  if (supplyDemandInfo.title && supplyDemandInfo.title.trim()) {
    var title = supplyDemandInfo.title.trim();
    var supplyDemand = new SupplyDemand({
      title      :title,
      merchant   :supplyDemandInfo.merchant,
      description:supplyDemandInfo.description,
      type       :supplyDemandInfo.type,
      fromDate   :supplyDemandInfo.fromDate,
      toDate     :supplyDemandInfo.toDate
    });
    supplyDemand.save(function (err, new_supplyDemand) {
      if (err) return callback(404, {error:err});
      callback(200, new_supplyDemand);
    });
  } else {
    callback(400, {error:'资源供需标题不能为空.'});
    return;
  }
};


var supplyDemandEditPage = function (req, res) {
  var query = req.query;
  var supplyDemandId = query.supplyDemandId;
  SupplyDemand.findOne({_id:supplyDemandId, state:'0000-0000-0000'}, function (err, supplyDemand) {
    if (supplyDemand) {
      res.render('wehere/supplyDemandEdit', {
        supplyDemand:supplyDemand
      });
    } else {
      req.session.messages = {error:['未获取到相关数据']};
      res.redirect([webRoot_wehere , '/dashboard'].join(''));
    }
  });
};

var supplyDemandEditSave = function (req, res) {
  var body = req.body;
  var supplyDemandId = body.supplyDemandId;
  var title = body.title;
  var description = body.description;
  var fromDate = body.fromDate;
  var toDate = body.toDate;
  var supplyDemandInfo = {
    _id        :supplyDemandId,
    title      :title,
    description:description,
    fromDate   :fromDate,
    toDate     :toDate
  };
  var result_validation = validationSupplyDemandInfo(supplyDemandInfo);
  if (result_validation.flag) {
    supplyDemandUpdate(req, supplyDemandInfo, function (status, result) {
      if (status === 200) {
        req.session.messages = {notice:'资源供需信息修改成功！'};
        res.redirect([webRoot_wehere , '/merchant/supplyDemandList'].join(''));
      } else {
        req.session.messages = {error:[result.error]};
        res.redirect([webRoot_wehere , '/merchant/supplyDemandEdit?supplyDemandId=' , supplyDemandId].join(''));
      }
    });
  } else {
    req.session.messages = {error:[result_validation.message]};
    res.redirect([webRoot_wehere , '/merchant/supplyDemandEdit?supplyDemandId=' , supplyDemandId].join(''));
  }
};

var supplyDemandUpdate = function (req, supplyDemandInfo, callback) {
  if (supplyDemandInfo.title && supplyDemandInfo.title.trim()) {
    var title = supplyDemandInfo.title.trim();
    var update_data = {
      title      :title,
      description:supplyDemandInfo.description,
      fromDate   :supplyDemandInfo.fromDate,
      toDate     :supplyDemandInfo.toDate
    };
    SupplyDemand.update({_id:supplyDemandInfo._id}, update_data, function (err, new_merchant) {
      if (err) return callback(404, {error:err});
      callback(200, new_merchant);
    });
  } else {
    callback(400, {error:'资源供需标题不能为空.'});
    return;
  }
};

var supplyDemandDelete = function (req, res) {
  var query = req.query;
  var supplyDemandId = query.supplyDemandId;
  SupplyDemand.update({_id:supplyDemandId}, {state:'1111-1111-1111'}, function (err, count) {
    res.redirect([webRoot_wehere , '/merchant/supplyDemandList'].join(''));
  });
};

module.exports = {
  supplyDemandList    :supplyDemandList,
  addSupplyDemand     :addSupplyDemand,
  supplyDemandEditPage:supplyDemandEditPage,
  supplyDemandEditSave:supplyDemandEditSave,
  supplyDemandDelete  :supplyDemandDelete
};