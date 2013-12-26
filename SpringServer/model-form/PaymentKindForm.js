var PaymentKind = require('../model/PaymentKind').PaymentKind;

/*
 * 支付方式的编辑表单设置
 * */
exports.PaymentKindForm = module.exports.PaymentKindForm = {
  mongooseModel:PaymentKind,
  title        :'%paymentKindName%', //表单标题
  subTitle     :'管理平台的支付方式管理',
  plural       :'支付方式', //复数形式的表单标题

  //字段编辑方式.
  schemaFields :{
    _id            :{display:'Id', placeholder:''},
    paymentKindName:{display:'支付方式名称', placeholder:'支付方式名称', editorType:'text', help:'请输入支付方式名称'},
    description    :{display:'描述信息', placeholder:'描述信息', editorType:'text'}
  },

  //编辑器
  editor       :{
    fieldsets:[
      {legend:'', help:'', fields:['paymentKindName', 'description']}
    ]
  },

  //列表
  list         :{
    sortOrders :[
      {field:'updatedAt', dir:'desc'},
      {field:'paymentKindName'}
    ],
    listPerPage:20,
    fields     :['paymentKindName', 'description']
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