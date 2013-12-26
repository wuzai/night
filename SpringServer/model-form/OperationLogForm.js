var OperationLog = require('../model/OperationLog').OperationLog;

/*
 * 操作日志的编辑表单设置
 * */
exports.OperationLogForm = module.exports.OperationLogForm = {
  mongooseModel:OperationLog,
  title        :'%operation%', //表单标题
  subTitle     :'管理平台的操作日志管理',
  plural       :'操作日志', //复数形式的表单标题

  //字段编辑方式.
  schemaFields :{
    _id          :{display:'Id', placeholder:''},
    operation    :{display:'操作', placeholder:'操作项', editorType:'text', help:'请输入操作项'},
    entityName   :{display:'对应数据实体', placeholder:'', editorType:'text'},
    fields       :{display:'操作字段', placeholder:'', editorType:'text'},
    oldValues    :{display:'操作之前的旧值', placeholder:'', editorType:'text'},
    newValues    :{display:'操作之后的新值', placeholder:'', editorType:'text'},
    operator     :{display:'操作者', placeholder:'', editorType:'refModel', refDisplayField:'userName', linkUrlPrefix:'/admin/user/'},
    operationTime:{display:'操作时间', placeholder:'', editorType:'date'},
    ipAddress    :{display:'IP地址', placeholder:'', editorType:'text'},
    detailInfo   :{display:'详细信息', placeholder:'', editorType:'text'}
  },

  //编辑器
  editor       :{
    fieldsets:[
      {legend:'', help:'', fields:['operation', 'entityName', 'fields', 'oldValues', 'newValues', 'ipAddress', 'detailInfo']},
      {legend:'', help:'', fields:['operationTime']}
    ]
  },

  //列表
  list         :{
    sortOrders :[
      {field:'updatedAt', dir:'desc'},
      {field:'operation'}
    ],
    populate   :[
      {
        path  :'operator',
        select:'_id userName'
      }
    ],
    listPerPage:20,
    fields     :['operation', 'entityName', 'fields', 'oldValues', 'newValues', 'ipAddress', 'detailInfo', 'operationTime', 'operator']
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