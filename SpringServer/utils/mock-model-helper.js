var mongoose = require('mongoose');
var swiss = require('./swiss-kit');
exports.mockMongooseModel = function (model) {
  var mockObject = new model();
  if (model && model.schema && model.schema.paths) {
    var paths = Object.keys(model.schema.paths);

    paths.forEach(function (fieldKey) {
      if (fieldKey !== '_id' && fieldKey !== '__v') {
        var field = model.schema.paths[fieldKey];
        if (!field.defaultValue) {
          switch (field.instance) {
            case 'String':
              mockObject[fieldKey] = swiss.genSerialNumber(fieldKey + '-');
              break;
            case 'Number':
              mockObject[fieldKey] = Math.round(Math.random() * 10);
              break;
            case 'Boolean':
              mockObject[fieldKey] = true;
              break;
            default:
              break;
          }
        }
        if (field.enumValues && field.enumValues.length > 0) {
          mockObject[fieldKey] = field.enumValues[0];
        }
      }
    });
  }
  return mockObject;
};