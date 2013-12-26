var Department = require('../model/Department').Department;
var Organization = require('../model/Organization').Organization;

/*
 * 单位部门的编辑表单设置
 * */
exports.DepartmentForm = module.exports.DepartmentForm = {
  mongooseModel:Department,
  title        :'%departmentName%', //表单标题
  subTitle     :'管理平台的单位部门管理',
  plural       :'单位部门', //复数形式的表单标题

  //字段编辑方式.
  schemaFields :{
    _id           :{display:'Id', placeholder:''},
    departmentName:{display:'部门名称', placeholder:'部门名称', editorType:'text', help:'请输入部门名称'},
    description   :{display:'描述信息', placeholder:'描述信息', editorType:'text'},
    organization  :{display:'法人机构', placeholder:'', editorType:'refModel', refDisplayField:'organizationName', linkUrlPrefix:'/admin/organization/'},
    parent        :{display:'上级部门', placeholder:'', editorType:'refModel', refDisplayField:'departmentName', linkUrlPrefix:'/admin/department/'},
    sortOrder     :{display:'排序次序', placeholder:'', editorType:'text'}
  },

  choices:{
    organization:{
      kind   :'model',
      model  :Organization,
      query  :{},
      fields :'_id organizationName',
      options:{},
      key    :'_id',
      display:'organizationName'
    },
    parent      :{
      kind   :'model',
      model  :Department,
      query  :{},
      fields :'_id departmentName',
      options:{},
      key    :'_id',
      display:'departmentName'
    }
  },

  //编辑器
  editor :{
    fieldsets:[
      {legend:'', help:'', fields:['departmentName', 'description']},
      {legend:'', help:'', fields:['organization', 'parent']},
      {legend:'', help:'', fields:['sortOrder']}
    ]
  },

  //列表
  list   :{
    sortOrders :[
      {field:'updatedAt', dir:'desc'},
      {field:'userName'}
    ],
    populate   :[
      {
        path  :'organization',
        select:'_id organizationName'
      },
      {
        path  :'parent',
        select:'_id departmentName'
      }
    ],
    listPerPage:20,
    fields     :['departmentName', 'description', 'organization', 'parent']
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