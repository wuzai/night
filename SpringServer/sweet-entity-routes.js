var menuConfig_sys = require('./menu-config-sys').menuConfig;
var util = require('util');
var fileServer = require('./utils/file-server');
var config = require('./config');
var ImageStore = require('./model/ImageStore').ImageStore;
var ObjectId = require('mongoose').Types.ObjectId;
var AttributeDictionary = require('./model/AttributeDictionary').AttributeDictionary;


var getModelAttributes = function (mongooseModel, cb) {
  var query = AttributeDictionary.find({category:mongooseModel.modelName});
  query.exec(function (err, attrs) {
    if (err) return cb(err);
    return cb(null, attrs);
  });
};

var modelFormRouteHelper = function (app, appModule, menu, modelForm) {
  var uri_items = util.format('%s%s%s', menuConfig_sys.uriPrefix, appModule.uriRoute, menu.uriRoute);
  var uri_item = uri_items + '/:id';

  var mongooseModel = modelForm.mongooseModel;

  app.get(uri_items, function (req, res, next) {
    var listSection = modelForm.list;
    var que = {};
    if (listSection.query) {
      que = listSection.query;
    }
    var query = mongooseModel.find(que);
    if (listSection && listSection.populate) {
      listSection.populate.forEach(function (p) {
        query = query.populate(p);
      });
    }
    query.exec(function (err, items) {
      if (err) return next(err);
      var entity = {};
      entity.title = modelForm.plural;
      entity.subTitle = modelForm.subTitle;
      entity.iconCode = menu.iconCode;
      entity.tableId = mongooseModel.modelName;
      entity.heading_columns = modelForm.list.fields;
      entity.records = [];
      items.forEach(function (item) {
        var rowUrl = uri_items + '/' + item._id;
        var row = {
          _id              :item._id,
          action_edit_url  :rowUrl,
          action_delete_url:rowUrl
        };
        row.col_values = [];
        entity.heading_columns.forEach(function (col) {
          var schemaField = modelForm.schemaFields[col];
          var col_value = {
            field:col
          };
          if (schemaField && schemaField.editorType === 'refModel' && item[col]) {
            //link to ref model.
            col_value.refId = item[col]._id;
            col_value.content = item[col][schemaField.refDisplayField];
            col_value.linkUrl = schemaField.linkUrlPrefix + col_value.refId;
          } else if (schemaField && schemaField.editorType === 'image' && item[col]) {
            if (mongooseModel.schema.tree[col].type.name === 'ObjectId') {
              col_value.refId = item[col]._id;
              col_value.content = item[col][schemaField.refDisplayField];
              col_value.linkUrl = schemaField.linkUrlPrefix + col_value.refId;
            } else {
              col_value.content = item[col];
            }
          } else {
            col_value.content = item[col];
          }
          row.col_values.push(col_value);
        });
        entity.records.push(row);
      });
      entity.action_post_url = uri_items;
      entity.editor = modelForm.editor;
      entity.schemaFields = modelForm.schemaFields;

      var choices = modelForm.choices;
      entity.choices = choices;
      entity.vv = {};

      var choiceKeys = [];
      if (choices) {
        choiceKeys = Object.keys(choices);
      }

      function loopChoices(cb) {
        if (choiceKeys.length < 1) {
          return cb();
        }
        var key = choiceKeys.shift();
        var choice = choices[key];
        switch (choice.kind) {
          case 'model':
            choice.model.find(choice.query, choice.fields, choice.options, function (err, choiceRecords) {
              if (err) return next(err);
              entity.vv[key] = choiceRecords;
              loopChoices(cb);
            });
            break;
          case 'enum':
            var choiceRecords = [];
            var enumValues = mongooseModel.schema.paths[key].enumValues;
            for (var i_c in enumValues) {
              var choiceRecord = {
                value:enumValues[i_c]
              }
              choiceRecords.push(choiceRecord);
            }
            entity.vv[key] = choiceRecords;
            loopChoices(cb);
            break;
        }
      }

      loopChoices(function () {
        // get extend attributes.
        getModelAttributes(mongooseModel, function (err, attrs) {
          if (err) return next(err);
          entity.extendAttrs = attrs;
          res.render('sys/model-list', {
            breadcrumbs:[
              {iconCode:appModule.iconCode, url:'', title:appModule.name},
              {iconCode:menu.iconCode, url:'', title:menu.name}
            ],
            entity     :entity
          });
        });
      });
    });
  });

  app.get(uri_item, function (req, res, next) {
    var itemId = req.params.id;
    var query = mongooseModel.findById(itemId);
    var listSection = modelForm.list;
    if (listSection && listSection.populate) {
      listSection.populate.forEach(function (p) {
        query = query.populate(p);
      });
    }
    query.exec(function (err, item) {
      if (err) return next(err);
      var entity = {};
      var from = modelForm.title.indexOf('%');
      var to = modelForm.title.lastIndexOf('%');
      var titleVar = modelForm.title.substr(from + 1, to - from - 1);
      if (item && item[titleVar]) {
        entity.title = modelForm.title.replace(modelForm.title.substr(from, to - from + 1), item[titleVar]);
      } else {
        entity.title = modelForm.plural;
      }
      entity.subTitle = modelForm.subTitle;
      entity.iconCode = menu.iconCode;
      entity.record = item;
      entity.action_put_url = uri_items + '/' + itemId;
      entity.action_list_url = uri_items;
      entity.editor = modelForm.editor;
      entity.schemaFields = modelForm.schemaFields;

      var choices = modelForm.choices;
      entity.choices = choices;
      entity.vv = {};

      var choiceKeys = [];
      if (choices) {
        choiceKeys = Object.keys(choices);
      }

      function loopChoices(cb) {
        if (choiceKeys.length < 1) {
          return cb();
        }
        var key = choiceKeys.shift();
        var choice = choices[key];
        switch (choice.kind) {
          case 'model':
            choice.model.find(choice.query, choice.fields, choice.options, function (err, choiceRecords) {
              if (err) return next(err);
              entity.vv[key] = choiceRecords;
              loopChoices(cb);
            });
            break;
          case 'enum':
            var choiceRecords = [];
            var enumValues = mongooseModel.schema.paths[key].enumValues;
            for (var i_c in enumValues) {
              var choiceRecord = {
                value:enumValues[i_c]
              }
              choiceRecords.push(choiceRecord);
            }
            entity.vv[key] = choiceRecords;
            loopChoices(cb);
            break;
        }
      }

      loopChoices(function () {
        res.render('sys/model-show', {
          breadcrumbs:[
            {iconCode:appModule.iconCode, url:'', title:appModule.name},
            {iconCode:menu.iconCode, url:'', title:menu.name},
            {iconCode:'icon-pencil', url:'', title:entity.title}
          ],
          entity     :entity
        });
      });
    });
  });

  app.post(uri_items, function (req, res, next) {
    var newRecord = new mongooseModel();
    var bodyFields = req.body.NewRecord;
    var filesFields = req.files;
    if (!bodyFields && !filesFields) {
      req.session.messages = {error:['参数错误']};
      res.redirect(uri_items);
      return;
    }

    if (bodyFields) {
      var keys = Object.keys(bodyFields);
      keys.forEach(function (key) {
        if (bodyFields[key]) {
          newRecord[key] = bodyFields[key];
        } else {
          newRecord[key] = null;
        }
      });
    }

    var newProfile = function (newRecordId, cb) {
      var profiles = req.body.ProfileRecord;
      var profileModel = modelForm.profileModel;
      var profileField = modelForm.profileField;
      if (!profileModel || !profileField) {
        return cb(null);
      }

      if (profiles) {
        var keys = Object.keys(profiles);
        var profileLen = keys.length;

        function profileLoop(k) {
          if (k < profileLen) {
            var key = keys[k];
            var value = profiles[key];
            if (value) {
              var newProfile = new profileModel();
              newProfile.attribute = new ObjectId(key);
              newProfile.value = value;
              newProfile[profileField] = newRecordId;
              newProfile.save(function (err, new_profile) {
                profileLoop(k + 1);
              });
            } else {
              profileLoop(k + 1);
            }
          } else {
            return cb(null);
          }
        }

        profileLoop(0);
      } else {
        return cb(null);
      }
    };

    //保存model记录信息
    var newRecordSave = function (newRecord) {
      newRecord.save(function (err, record) {
        if (err) {
          req.session.messages = {'error':[err.message]};
        } else {
          req.session.messages = {notice:'成功新建[' + modelForm.plural + ']记录'};
        }
        //save profile info.
        newProfile(record._id, function (err) {
          if (err) return next(err);
          res.redirect(uri_items);
        });
      });
    };

    if (filesFields) {
      var f_keys = Object.keys(filesFields);
      var f_keysLen = f_keys.length;

      function f_keysLoop(i) {
        if (i < f_keysLen) {
          var f_key = f_keys[i];
          fileServer.uploadFileMain(req, f_key, '/sys/web/images', function (data) {
            if (data.success) {
              var imageUrl = data.fileUrl;
              if (newRecord.schema.tree[f_key].type.name === 'ObjectId') {
                var imageStore = new ImageStore({
                  imageUrl    :imageUrl,
                  retinaUrl   :imageUrl,
                  smallUrl    :imageUrl,
                  thumbnailUrl:imageUrl
                });
                newRecord[f_key] = imageStore;
                imageStore.save();
              } else {
                newRecord[f_key] = imageUrl;
              }
            }
            f_keysLoop(i + 1);
          });
        } else {
          newRecordSave(newRecord);
        }
      }

      f_keysLoop(0);
    } else {
      newRecordSave(newRecord);
    }
  });

  app.put(uri_item, function (req, res) {
    var newRecord = new mongooseModel();
    var currentRecord = {};
    var itemId = req.params.id;
    var itemUrl = uri_items + '/' + itemId;
    var bodyFields = req.body.CurrentRecord;
    var filesFields = req.files;
    if (!bodyFields && !filesFields) {
      req.session.messages = {error:['参数错误']};
      res.redirect(itemUrl);
    }
    if (bodyFields) {
      var keys = Object.keys(bodyFields);
      modelForm.editor.fieldsets.forEach(function (fieldset) {
        fieldset.fields.forEach(function (field) {
          if (newRecord.schema.tree[field].type.name === 'Boolean') {
            if (bodyFields[field]) {
              currentRecord[field] = true;
            } else {
              currentRecord[field] = null;
            }
          }
        });
      });
      keys.forEach(function (key) {
        if (newRecord.schema.tree[key].type.name !== 'Boolean') {
          if (bodyFields[key]) {
            currentRecord[key] = bodyFields[key];
          }
        }
      });
    }

    var currentRecordSave = function (currentRecord) {
      mongooseModel.findByIdAndUpdate(itemId, {$set:currentRecord}, function (err) {
        if (err) {
          req.session.messages = {'error':[err.message]};
        } else {
          req.session.messages = {notice:'成功修改[' + modelForm.plural + ']记录'};
        }
        res.redirect(itemUrl);
      });
    };

    if (filesFields) {
      var f_keys = Object.keys(filesFields);
      var f_keysLen = f_keys.length;

      function f_keysLoop(i) {
        if (i < f_keysLen) {
          var f_key = f_keys[i];
          fileServer.uploadFileMain(req, f_key, '/sys/web/images', function (data) {
            if (data.success) {
              var imageUrl = data.fileUrl;
              if (newRecord.schema.tree[f_key].type.name === 'ObjectId') {
                var imageStore = new ImageStore({
                  imageUrl    :imageUrl,
                  retinaUrl   :imageUrl,
                  smallUrl    :imageUrl,
                  thumbnailUrl:imageUrl
                });
                currentRecord[f_key] = imageStore;
                imageStore.save();
              } else {
                currentRecord[f_key] = imageUrl;
              }
            }
            f_keysLoop(i + 1);
          });
        } else {
          currentRecordSave(currentRecord);
        }
      }

      f_keysLoop(0);
    } else {
      currentRecordSave(currentRecord);
    }
  });

  app.del(uri_item, function (req, res) {
    var itemId = req.params.id;
    mongooseModel.findByIdAndRemove(itemId, function (err) {
      if (err) {
        req.session.messages = {'error':[err.message]};
      }
      res.redirect(uri_items);
    });
  });

};

exports = module.exports = function (app) {

  menuConfig_sys.appModules.forEach(function (appModule) {
    if (appModule && appModule.menus) {
      appModule.menus.forEach(function (menu) {
        if (menu && menu.modelForm && menu.enabled) {
          modelFormRouteHelper(app, appModule, menu, menu.modelForm);
        }
      });
    }
  });
};