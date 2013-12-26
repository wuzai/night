var UserGroup = require('../model/UserGroup').UserGroup;

/*
 * 用户分组的编辑表单设置
 * */
exports.UserGroupForm = module.exports.UserGroupForm = {
  mongooseModel:UserGroup,
  title        :'%userGroupName%', //表单标题
  subTitle     :'管理平台的用户分组管理',
  plural       :'用户分组', //复数形式的表单标题

  //字段编辑方式.
  schemaFields :{
    _id          :{display:'Id', placeholder:''},
    userGroupName:{display:'分组名称', placeholder:'分组名称', editorType:'text', help:'请输入分组名称'},
    description  :{display:'描述信息', placeholder:'描述信息', editorType:'text'}
  },

  //编辑器
  editor       :{
    fieldsets:[
      {legend:'', help:'', fields:['userGroupName', 'description']}
    ]
  },

  //列表
  list         :{
    sortOrders :[
      {field:'updatedAt', dir:'desc'},
      {field:'userGroupName'}
    ],
    listPerPage:20,
    fields     :['userGroupName', 'description']
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