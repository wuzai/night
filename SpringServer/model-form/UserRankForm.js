var UserRank = require('../model/UserRank').UserRank;

/*
 * 用户级别的编辑表单设置
 * */
exports.UserRankForm = module.exports.UserRankForm = {
  mongooseModel:UserRank,
  title        :'%userRankName%', //表单标题
  subTitle     :'管理平台的用户级别管理',
  plural       :'用户级别', //复数形式的表单标题

  //字段编辑方式.
  schemaFields :{
    _id         :{display:'Id', placeholder:''},
    userRankName:{display:'用户级别名称', placeholder:'用户级别名称', editorType:'text', help:'请输入用户级别名称'},
    description :{display:'描述信息', placeholder:'描述信息', editorType:'text'}
  },

  //编辑器
  editor       :{
    fieldsets:[
      {legend:'', help:'', fields:['userRankName', 'description']}
    ]
  },

  //列表
  list         :{
    sortOrders :[
      {field:'updatedAt', dir:'desc'},
      {field:'userRankName'}
    ],
    listPerPage:20,
    fields     :['userRankName', 'description']
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