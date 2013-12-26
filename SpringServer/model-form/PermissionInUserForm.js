var PermissionInUser = require('../model/PermissionInUser').PermissionInUser;
var Permission = require('../model/Permission').Permission;
var User = require('../model/User').User;

/*
 * 用户与许可的映射的编辑表单设置
 * */
exports.PermissionInUserForm = module.exports.PermissionInUserForm = {
  mongooseModel:PermissionInUser,
  title        :'%organizationName%', //表单标题
  subTitle     :'管理平台的用户与许可的映射管理',
  plural       :'用户与许可的映射', //复数形式的表单标题

  //字段编辑方式.
  schemaFields :{
    _id       :{display:'Id', placeholder:''},
    permission:{display:'资源操作许可', placeholder:'', editorType:'refModel', refDisplayField:'_id', linkUrlPrefix:'/admin/permission/'},
    user      :{display:'用户', placeholder:'', editorType:'refModel', refDisplayField:'userName', linkUrlPrefix:'/admin/user/'}
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
    user      :{
      kind   :'model',
      model  :User,
      query  :{},
      fields :'_id userName',
      options:{},
      key    :'_id',
      display:'userName'
    }
  },

  //编辑器
  editor :{
    fieldsets:[
      {legend:'', help:'', fields:['permission', 'user']}
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
        path  :'user',
        select:'_id userName'
      }
    ],
    listPerPage:20,
    fields     :['permission', 'user']
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