var Permission = require('../model/Permission').Permission;
var Resource = require('../model/Resource').Resource;

/*
 * 资源操作许可的编辑表单设置
 * */
exports.PermissionForm = module.exports.PermissionForm = {
  mongooseModel:Permission,
  title        :'%organizationName%', //表单标题
  subTitle     :'管理平台的资源操作许可管理',
  plural       :'资源操作许可', //复数形式的表单标题

  //字段编辑方式.
  schemaFields :{
    _id          :{display:'Id', placeholder:''},
    resource     :{display:'所属资源', placeholder:'', editorType:'refModel', refDisplayField:'resourceName', linkUrlPrefix:'/admin/resource/'},
    allowTimeSpan:{display:'允许进行操作的时间段', placeholder:'', editorType:'text'}
  },

  choices:{
    resource:{
      kind   :'model',
      model  :Resource,
      query  :{},
      fields :'_id resourceName',
      options:{},
      key    :'_id',
      display:'resourceName'
    }
  },

  //编辑器
  editor :{
    fieldsets:[
      {legend:'', help:'', fields:['resource']},
      {legend:'', help:'', fields:['allowTimeSpan']}
    ]
  },

  //列表
  list   :{
    sortOrders :[
      {field:'updatedAt', dir:'desc'}
    ],
    populate   :[
      {
        path  :'resource',
        select:'_id resourceName'
      }
    ],
    listPerPage:20,
    fields     :['resource', 'allowTimeSpan']
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