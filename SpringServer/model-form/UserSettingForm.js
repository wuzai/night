var UserSetting = require('../model/UserSetting').UserSetting;
var User = require('../model/User').User;
var GlobalSetting = require('../model/GlobalSetting').GlobalSetting;

/*
 * 用户配置信息的编辑表单设置
 * */
exports.UserSettingForm = module.exports.UserSettingForm = {
  mongooseModel:UserSetting,
  title        :'用户配置信息详细', //表单标题
  subTitle     :'管理平台的用户配置信息管理',
  plural       :'用户配置信息', //复数形式的表单标题

  //字段编辑方式.
  schemaFields :{
    _id         :{display:'Id', placeholder:''},
    user        :{display:'用户', placeholder:'选择用户', editorType:'refModel', refDisplayField:'userName', linkUrlPrefix:'/admin/user/'},
    setting     :{display:'配置方式', placeholder:'选择配置方式', editorType:'refModel', refDisplayField:'settingName', linkUrlPrefix:'/admin/globalSetting/'},
    settingValue:{display:'配置信息值', placeholder:'配置信息值', editorType:'text'}
  },

  choices:{
    user   :{
      kind   :'model',
      model  :User,
      query  :{},
      fields :'_id userName',
      options:{},
      key    :'_id',
      display:'userName'
    },
    setting:{
      kind   :'model',
      model  :GlobalSetting,
      query  :{},
      fields :'_id settingName',
      options:{},
      key    :'_id',
      display:'settingName'
    }
  },

  //编辑器
  editor :{
    fieldsets:[
      {legend:'', help:'', fields:['user', 'setting']},
      {legend:'', help:'', fields:['settingValue']}
    ]
  },

  //列表
  list   :{
    sortOrders :[
      {field:'updatedAt', dir:'desc'}
    ],
    populate   :[
      {
        path  :'user',
        select:'_id userName'
      },
      {
        path  :'setting',
        select:'_id settingName'
      }
    ],
    listPerPage:20,
    fields     :['user', 'setting', 'settingValue']
  },

  //搜索支持
  search :{
    data     :{search:''}, //default data
    schema   :{
      search:{type:'Text', title:'搜索'}
    },
    fieldsets:[
      {"legend":"Search Group", "fields":["search"]}
    ] //see backbone forms.
  },

  //过滤支持
  filters:{

  },

  //汇总信息
  summary:{

  }
};