var PaymentRecord = require('../model/PaymentRecord').PaymentRecord;
var PaymentKind = require('../model/PaymentKind').PaymentKind;

/*
 * 支付记录的编辑表单设置
 * */
exports.PaymentRecordForm = module.exports.PaymentRecordForm = {
  mongooseModel:PaymentRecord,
  title        :'%organizationName%', //表单标题
  subTitle     :'管理平台的支付记录管理',
  plural       :'支付记录', //复数形式的表单标题

  //字段编辑方式.
  schemaFields :{
    _id         :{display:'Id', placeholder:''},
    sellRecord  :{display:'销售记录', placeholder:'', editorType:'refModel', refDisplayField:'_id', linkUrlPrefix:'/admin/sellRecord/'},
    paymentKind :{display:'支付方式', placeholder:'', editorType:'refModel', refDisplayField:'paymentKindName', linkUrlPrefix:'/admin/paymentKind/'},
    amount      :{display:'付费金额', placeholder:'', editorType:'text'},
    currencyType:{display:'货币类型', placeholder:'', editorType:'text'},
    account     :{display:'账号', placeholder:'', editorType:'text'},
    bank        :{display:'银行', placeholder:'', editorType:'text'}
  },

  choices:{
    paymentKind:{
      kind   :'model',
      model  :PaymentKind,
      query  :{},
      fields :'_id paymentKindName',
      options:{},
      key    :'_id',
      display:'paymentKindName'
    }
  },

  //编辑器
  editor :{
    fieldsets:[
      {legend:'', help:'', fields:['amount', 'currencyType', 'account', 'bank']},
      {legend:'', help:'', fields:['paymentKind']}
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
        path  :'sellRecord',
        select:'_id'
      },
      {
        path  :'paymentKind',
        select:'_id'
      }
    ],
    listPerPage:20,
    fields     :['amount', 'currencyType', 'account', 'bank']
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