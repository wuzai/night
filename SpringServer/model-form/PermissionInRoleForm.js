var PermissionInRole = require('../model/PermissionInRole').PermissionInRole;
var Permission = require('../model/Permission').Permission;
var Role = require('../model/Role').Role;

/*
 * 角色与许可的映射的编辑表单设置
 * */
exports.PermissionInRoleForm = module.exports.PermissionInRoleForm = {
  mongooseModel:PermissionInRole,
  title        :'%organizationName%', //表单标题
  subTitle     :'管理平台的角色与许可的映射管理',
  plural       :'角色与许可的映射', //复数形式的表单标题

  //字段编辑方式.
  schemaFields :{
    _id       :{display:'Id', placeholder:''},
    permission:{display:'资源操作许可', placeholder:'', editorType:'refModel', refDisplayField:'_id', linkUrlPrefix:'/admin/permission/'},
    role      :{display:'角色', placeholder:'', editorType:'refModel', refDisplayField:'roleName', linkUrlPrefix:'/admin/role/'}
  },

  choices:{
    permission:{
      kind   :'model',
      model  :Permission,
      query  :{},
      fields :'_id',
      options:{},
      key    :'_id',
      display:'_id'
    },
    role      :{
      kind   :'model',
      model  :Role,
      query  :{},
      fields :'_id roleName',
      options:{},
      key    :'_id',
      display:'roleName'
    }
  },

  //编辑器
  editor :{
    fieldsets:[
      {legend:'', help:'', fields:['permission', 'role']}
    ]
  },

  //列表
  list   :{
    sortOrders :[
      {field:'updatedAt', dir:'desc'}
    ],
    populate   :[
      {
        path  :'permission',
        select:'_id'
      },
      {
        path  :'role',
        select:'_id roleName'
      }
    ],
    listPerPage:20,
    fields     :['permission', 'role']
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