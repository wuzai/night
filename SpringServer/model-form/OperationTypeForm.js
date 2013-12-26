var OperationType = require('../model/OperationType').OperationType;

/*
 * 操作类型的编辑表单设置
 * */
exports.OperationTypeForm = module.exports.OperationTypeForm = {
  mongooseModel:OperationType,
  title        :'%operationTypeName%', //表单标题
  subTitle     :'管理平台的操作类型管理',
  plural       :'操作类型', //复数形式的表单标题

  //字段编辑方式.
  schemaFields :{
    _id              :{display:'Id', placeholder:''},
    operationTypeName:{display:'操作类型名称', placeholder:'操作类型名称', editorType:'selector', help:'请输入操作类型名称'},
    description      :{display:'描述信息', placeholder:'描述信息', editorType:'text'}
  },

  choices:{
    operationTypeName:{
      kind:'enum'
    }
  },

  //编辑器
  editor :{
    fieldsets:[
      {legend:'', help:'', fields:['operationTypeName', 'description']}
    ]
  },

  //列表
  list   :{
    sortOrders :[
      {field:'updatedAt', dir:'desc'},
      {field:'operationTypeName'}
    ],
    listPerPage:20,
    fields     :['operationTypeName', 'description']
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