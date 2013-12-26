var ResourceType = require('../model/ResourceType').ResourceType;

/*
 * 资源类型的编辑表单设置
 * */
exports.ResourceTypeForm = module.exports.ResourceTypeForm = {
  mongooseModel:ResourceType,
  title        :'%resourceTypeName%', //表单标题
  subTitle     :'管理平台的资源类型管理',
  plural       :'资源类型', //复数形式的表单标题

  //字段编辑方式.
  schemaFields :{
    _id             :{display:'Id', placeholder:''},
    resourceTypeName:{display:'资源类型名称', placeholder:'资源类型名称', editorType:'text', help:'请输入资源类型名称'},
    description     :{display:'描述信息', placeholder:'描述信息', editorType:'text'}
  },

  //编辑器
  editor       :{
    fieldsets:[
      {legend:'', help:'', fields:['resourceTypeName', 'description']}
    ]
  },

  //列表
  list         :{
    sortOrders :[
      {field:'updatedAt', dir:'desc'},
      {field:'resourceTypeName'}
    ],
    listPerPage:20,
    fields     :['resourceTypeName', 'description']
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