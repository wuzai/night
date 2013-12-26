var GlobalSetting = require('../model/GlobalSetting').GlobalSetting;

/*
 * 全局配置的编辑表单设置
 * */
exports.GlobalSettingForm = module.exports.GlobalSettingForm = {
  mongooseModel:GlobalSetting,
  title        :'%settingName%', //表单标题
  subTitle     :'管理平台的全局配置管理',
  plural       :'全局配置', //复数形式的表单标题

  //字段编辑方式.
  schemaFields :{
    _id         :{display:'Id', placeholder:''},
    settingName :{display:'配置名称', placeholder:'配置名称', editorType:'text', help:'请输入配置名称'},
    description :{display:'描述信息', placeholder:'描述信息', editorType:'text'},
    defaultValue:{display:'默认值', placeholder:'默认值', editorType:'text'}
  },

  //编辑器
  editor       :{
    fieldsets:[
      {legend:'', help:'', fields:['settingName', 'description', 'defaultValue']}
    ]
  },

  //列表
  list         :{
    sortOrders :[
      {field:'updatedAt', dir:'desc'},
      {field:'settingName'}
    ],
    listPerPage:20,
    fields     :['settingName', 'description', 'defaultValue']
  },

  //搜索支持
  search       :{
    data     :{search:''}, //default data
    schema   :{
      search:{type:'Text', title:'搜索'}
    },
    fieldsets:[
      {"legend":"Search Group", "fields":["search"]}
    ] //see backbone forms.
  },

  //过滤支持
  filters      :{

  },

  //汇总信息
  summary      :{

  }
};