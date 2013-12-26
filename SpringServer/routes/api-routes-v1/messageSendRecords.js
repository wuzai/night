var config = require('../../config');
var Message = require('../../model/Message.js').Message;
var User = require('../../model/User.js').User;
var MessageSendRecord = require('../../model/MessageSendRecord').MessageSendRecord;
var ObjectId = require('mongoose').Types.ObjectId;

//获取会员的信息记录列表
var list = function (req, res, next) {
  var query = req.query;
  var user_id = query.user_id;
  var toUserId = new ObjectId(user_id);
  User.findById(toUserId, function (err, user) {
    if (err) return next(err);
    if (user) {
      var con_query = {
        toUser:toUserId,
        state :'0000-0000-0000'
      };
      if (query.timestamp) {
        var updatedAt = new Date(query.timestamp);
        if (updatedAt) {
          con_query.updatedAt = {$gte:updatedAt};
        }
      }
      var fields = '_id hasRead toUser message createdAt';
      MessageSendRecord.find(con_query, fields).sort({createdAt:-1}).populate('message', 'content owner ').exec(function (err, messageSendRecordList) {
        if (err) return next(err);
        var messageSendRecords = [];
        messageSendRecordList.forEach(function (messageSendRecord) {
          if (messageSendRecord && messageSendRecord.message) {
            var messageRecord_data = {
              _id           :messageSendRecord._id,
              content       :messageSendRecord.message.content,
              owner       : messageSendRecord.message.owner,
              toUserId      :messageSendRecord.toUser,
              hasRead      :messageSendRecord.hasRead,
              sentTime      :messageSendRecord.createdAt
            }
            messageSendRecords.push(messageRecord_data);
          }
        });
        res.json(200, messageSendRecords);
      });
    } else {
      res.json(404, {errors:'user not found'});
      return;
    }
  });
};

var deleteAllMessageSendRecords = function (req, res, next) {
  var query = req.query;
  var user_id = query.user_id;
  var userId = new ObjectId(user_id);
  MessageSendRecord.update({toUser:userId}, {state:'1111-1111-1111'}, { multi:true }, function (err, number) {
    res.json(200, {});
    return;
  });
};

var deleteMessageSendRecords = function (req, res, next) {
  var query = req.query;
  var messageSendRecord_id = query.sendMessageRecord_id;
  var messageSendRecordId = new ObjectId(messageSendRecord_id);
  MessageSendRecord.update({_id:messageSendRecordId}, {state:'1111-1111-1111'}, { multi:true }, function (err, number) {
    res.json(200, {});
    return;
  });
};
//用户发送消息
var sendMessage = function (req, res, next) {
  var query = req.query;
  if (!req.query) {
    res.json(400, {errors:'请求参数错误.'});
  }else{
    if(query.owner&&query.toUser){
      res.json(400, {errors:'请求参数错误.'});
    }
    var message = new Message({
      owner :query.owner,
      content:query.content
    });
    message.save(function(err,new_message){
      if (err) {
        res.json(401, {errors:'保存出错.'});
      } else {
        var messageSendRecord = new MessageSendRecord({
          message:new_message._id,
          toUser :  query.toUserId,
          hasRead : false
        });
        messageSendRecord.save(function(err_messageSendRecord,new_messageSendRecord){
          if (err_messageSendRecord) {
            res.json(401, {errors:'保存出错.'});
          } else {
            res.json(200, {});
          }
        });
      }
    });
  }
};
//用户查看消息
var readMessage = function (req, res, next) {
  var query = req.query;
  if (!req.query) {
    res.json(400, {errors:'请求参数错误.'});
  }else{
    var messageSendRecordId = query.messageSendRecordId;
    if (!messageSendRecordId) {
      res.json(400, {errors:'请求参数错误.'});
    }
    MessageSendRecord.findByIdAndUpdate(messageSendRecordId, {hasRead:true}, function (err, messageSendRecord) {
      if (err) return next(err);
      if (!messageSendRecord) {
        res.json(401, {errors:'保存出错.'});
        return;
      }
      res.json(200, {});
    });
  }
};
function getFlatternDistance(lat1,lng1,lat2,lng2){
  var f = getRad((lat1 + lat2)/2);
  var g = getRad((lat1 - lat2)/2);
  var l = getRad((lng1 - lng2)/2);

  var sg = Math.sin(g);
  var sl = Math.sin(l);
  var sf = Math.sin(f);

  var s,c,w,r,d,h1,h2;
  var a = EARTH_RADIUS;
  var fl = 1/298.257;
  sg = sg*sg;
  sl = sl*sl;
  sf = sf*sf;
  s = sg*(1-sl) + (1-sf)*sl;
  c = (1-sg)*(1-sl) + sf*sl;
  w = Math.atan(Math.sqrt(s/c));
  r = Math.sqrt(s*c)/w;
  d = 2*w*a;
  h1 = (3*r -1)/2/c;
  h2 = (3*r +1)/2/s;
  return d*(1 + fl*(h1*sf*(1-sg) - h2*(1-sf)*sg));
}
module.exports = {
  list                       :list,
  deleteAllMessageSendRecords:deleteAllMessageSendRecords,
  deleteMessageSendRecords   :deleteMessageSendRecords,
  sendMessage   :sendMessage,
  readMessage   :readMessage
};