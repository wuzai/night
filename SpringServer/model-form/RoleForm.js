var Role = require('../model/Role').Role;

/*
 * 角色信息的编辑表单设置
 * */
exports.RoleForm = module.exports.RoleForm = {
  mongooseModel:Role,
  title        :'%roleName%', //表单标题
  subTitle     :'管理平台的角色信息管理',
  plural       :'角色信息', //复数形式的表单标题

  //字段编辑方式.
  schemaFields :{
    _id        :{display:'Id', placeholder:''},
    roleName   :{display:'角色名称', placeholder:'角色名称', editorType:'text', help:'请输入角色名称'},
    description:{display:'描述信息', placeholder:'描述信息', editorType:'text'}
  },

  //编辑器
  editor       :{
    fieldsets:[
      {legend:'', help:'', fields:['roleName', 'description']}
    ]
  },

  //列表
  list         :{
    sortOrders :[
      {field:'updatedAt', dir:'desc'},
      {field:'roleName'}
    ],
    listPerPage:20,
    fields     :['roleName', 'description']
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