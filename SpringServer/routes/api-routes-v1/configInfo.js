var config = require('../../config');

/**
 * 获取平台积分规则(配置中获取)
 * @since 1.0
 */
var getRegulation = function (req, res) {
  var text = config.systemParams.regulation.text;
  var pictures = config.systemParams.regulation.pictureUrl;
  var pictures_data = [];
  pictures.forEach(function (picture) {
    var picture_data = [config.webRoot, config.imageRoot , picture].join('');
    pictures_data.push(picture_data);
  });
  res.json(200, {rules:text, pictures:pictures_data});
};

module.exports = {
  getRegulation:getRegulation
};