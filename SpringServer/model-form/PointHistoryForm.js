var PointHistory = require('../model/PointHistory').PointHistory;

/*
 * 积分历史记录的编辑表单设置
 * */
exports.PointHistoryForm = module.exports.PointHistoryForm = {
  mongooseModel:PointHistory,
  title        :'%organizationName%', //表单标题
  subTitle     :'管理平台的积分历史记录管理',
  plural       :'积分历史记录', //复数形式的表单标题

  //字段编辑方式.
  schemaFields :{
    _id            :{display:'Id', placeholder:''},
    pointTo        :{display:'谁的积分', placeholder:'', editorType:'refModel', refDisplayField:'_id', linkUrlPrefix:'/admin/basePoint/'},
    transactionType:{display:'交易类型', placeholder:'', editorType:'selector'},
    paymentRecord  :{display:'支付记录', placeholder:'', editorType:'refModel', refDisplayField:'_id', linkUrlPrefix:'/admin/paymentRecord/'},
    sellRecord     :{display:'销售记录', placeholder:'', editorType:'refModel', refDisplayField:'_id', linkUrlPrefix:'/admin/sellRecord/'},
    addPoint       :{display:'增加积分', placeholder:'', editorType:'text'},
    decPoint       :{display:'消耗积分', placeholder:'', editorType:'text'},
    surplusPoint   :{display:'剩余积分', placeholder:'', editorType:'text'},
    isTakeEffected :{display:'是否已经生效', placeholder:'', editorType:'switch'},
    availableDate  :{display:'积分生效日期', placeholder:'', editorType:'date'}
  },

  choices:{
    transactionType:{
      kind:'enum'
    }
  },

  //编辑器
  editor :{
    fieldsets:[
      {legend:'', help:'', fields:['transactionType', 'addPoint', 'decPoint', 'surplusPoint']},
      {legend:'', help:'', fields:['isTakeEffected']},
      {legend:'', help:'', fields:['availableDate']}
    ]
  },

  //列表
  list   :{
    sortOrders :[
      {field:'updatedAt', dir:'desc'}
    ],
    populate   :[
      {
        path  :'pointTo',
        select:'_id'
      },
      {
        path  :'paymentRecord',
        select:'_id'
      },
      {
        path  :'sellRecord',
        select:'_id'
      }
    ],
    listPerPage:20,
    fields     :['transactionType', 'addPoint', 'decPoint', 'surplusPoint', 'isTakeEffected', 'availableDate']
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