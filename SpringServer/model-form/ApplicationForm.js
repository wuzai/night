var Application = require('../model/Application').Application;

/*
 * 应用系统注册的编辑表单设置
 * */
exports.ApplicationForm = module.exports.ApplicationForm = {
  mongooseModel:Application,
  title        :'%applicationName%', //表单标题
  subTitle     :'管理平台的应用系统注册管理',
  plural       :'应用系统', //复数形式的表单标题

  //字段编辑方式.
  schemaFields :{
    _id            :{display:'Id', placeholder:''},
    applicationName:{display:'应用名称', placeholder:'应用名称', editorType:'text', help:'请输入应用名称'},
    description    :{display:'描述信息', placeholder:'应用描述信息', editorType:'text'}
  },

  //编辑器
  editor       :{
    fieldsets:[
      {legend:'', help:'', fields:['applicationName', 'description']}
    ]
  },

  //列表
  list         :{
    sortOrders :[
      {field:'updatedAt', dir:'desc'},
      {field:'applicationName'}
    ],
    listPerPage:20,
    fields     :['applicationName', 'description']
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