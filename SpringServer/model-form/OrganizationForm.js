var Organization = require('../model/Organization').Organization;

/*
 * 法人机构的编辑表单设置
 * */
exports.OrganizationForm = module.exports.OrganizationForm = {
  mongooseModel:Organization,
  title        :'%organizationName%', //表单标题
  subTitle     :'管理平台的组织机构管理',
  plural       :'组织机构', //复数形式的表单标题

  //字段编辑方式.
  schemaFields :{
    _id             :{display:'Id', placeholder:''},
    organizationName:{display:'机构名称', placeholder:'法人机构名称', editorType:'text', help:'请输入机构名称'},
    description     :{display:'描述信息', placeholder:'描述信息', editorType:'text'},
    parent          :{display:'上级组织', placeholder:'', editorType:'refModel', refDisplayField:'organizationName', linkUrlPrefix:'/admin/organization/'},
    sortOrder       :{display:'排序次序', placeholder:'', editorType:'text'}
  },

  choices:{
    parent:{
      kind   :'model',
      model  :Organization,
      query  :{},
      fields :'_id organizationName',
      options:{},
      key    :'_id',
      display:'organizationName'
    }
  },

  //编辑器
  editor :{
    fieldsets:[
      {legend:'', help:'', fields:['organizationName', 'description']},
      {legend:'', help:'', fields:['parent']},
      {legend:'', help:'', fields:['sortOrder']}
    ]
  },

  //列表
  list   :{
    sortOrders :[
      {field:'updatedAt', dir:'desc'},
      {field:'organizationName'}
    ],
    populate   :[
      {
        path  :'parent',
        select:'_id organizationName'
      }
    ],
    listPerPage:20,
    fields     :['organizationName', 'description', 'parent']
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