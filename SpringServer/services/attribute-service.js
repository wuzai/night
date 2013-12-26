var attributeDictionary = require('../model/AttributeDictionary').AttributeDictionary;
var userProfile = require('../model/UserProfile').UserProfile;
var ObjectId = require('mongoose').Types.ObjectId;

var getUserAttributes = function (req, res, next) {
  var userId = new ObjectId(req.param.user_id);
  userProfile.find({user:userId}, function (err, attributes) {
    console.log(attributes);
  });
};