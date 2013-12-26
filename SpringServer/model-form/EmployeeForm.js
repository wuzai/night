var Employee = require('../model/Employee').Employee;
var Department = require('../model/Department').Department;
var Organization = require('../model/Organization').Organization;
var User = require('../model/User').User;

/*
 * 员工资料的编辑表单设置
 * */
exports.EmployeeForm = module.exports.EmployeeForm = {
  mongooseModel:Employee,
  title        :'%fullName%', //表单标题
  subTitle     :'商户的员工资料管理',
  plural       :'员工资料', //复数形式的表单标题

  //字段编辑方式.
  schemaFields :{
    _id         :{display:'Id', placeholder:''},
    organization:{display:'法人机构', placeholder:'', editorType:'refModel', refDisplayField:'organizationName', linkUrlPrefix:'/admin/organization/'},
    department  :{display:'单位部门', placeholder:'', editorType:'refModel', refDisplayField:'departmentName', linkUrlPrefix:'/admin/department/'},
    fullName    :{display:'员工名称（全称）', placeholder:'员工名称', editorType:'text'},
    employeeCode:{display:'员工代号', placeholder:'员工代号', editorType:'text'},
    sortOrder   :{display:'排序次序', placeholder:'', editorType:'text'},
    user        :{display:'用户', placeholder:'', editorType:'refModel', refDisplayField:'userName', linkUrlPrefix:'/admin/user/'}
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
    department  :{
      kind   :'model',
      model  :Department,
      query  :{},
      fields :'_id departmentName',
      options:{},
      key    :'_id',
      display:'departmentName'
    },
    user        :{
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
      {legend:'', help:'', fields:['fullName', 'employeeCode']},
      {legend:'', help:'', fields:['organization', 'department', 'user']},
      {legend:'', help:'', fields:['sortOrder']}
    ]
  },

  //列表
  list   :{
    sortOrders :[
      {field:'updatedAt', dir:'desc'},
      {field:'fullName'}
    ],
    populate   :[
      {
        path  :'organization',
        select:'_id organizationName'
      },
      {
        path  :'department',
        select:'_id departmentName'
      },
      {
        path  :'user',
        select:'_id userName'
      }
    ],
    listPerPage:20,
    fields     :['fullName', 'employeeCode', 'organization', 'department', 'user']
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