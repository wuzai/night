var SellRecord = require('../model/SellRecord').SellRecord;
var Merchant = require('../model/Merchant').Merchant;
var ServiceItem = require('../model/ServiceItem').ServiceItem;

/*
 * 商户的销售记录的编辑表单设置
 * */
exports.SellRecordForm = module.exports.SellRecordForm = {
  mongooseModel:SellRecord,
  title        :'销售记录', //表单标题
  subTitle     :'管理平台的商户的销售记录管理',
  plural       :'商户的销售记录', //复数形式的表单标题

  //字段编辑方式.
  schemaFields :{
    _id        :{display:'Id', placeholder:''},
    member     :{display:'会员', placeholder:'', editorType:'refModel', refDisplayField:'_id', linkUrlPrefix:'/admin/member/'},
    merchant   :{display:'商户', placeholder:'', editorType:'refModel', refDisplayField:'merchantName', linkUrlPrefix:'/admin/merchant/'},
    serviceItem:{display:'服务项目', placeholder:'服务项目', editorType:'refModel', refDisplayField:'serviceItemName', linkUrlPrefix:'/admin/serviceItem/'},
    process    :{display:'进行步骤', placeholder:'', editorType:'selector'},
    isSucceed  :{display:'是否完成销售', placeholder:'', editorType:'switch'},
    count      :{display:'数量', placeholder:'', editorType:'text'},
    sum        :{display:'金额', placeholder:'', editorType:'text'}
  },

  choices:{
    merchant   :{
      kind   :'model',
      model  :Merchant,
      query  :{},
      fields :'_id merchantName',
      options:{},
      key    :'_id',
      display:'merchantName'
    },
    serviceItem:{
      kind   :'model',
      model  :ServiceItem,
      query  :{},
      fields :'_id serviceItemName',
      options:{},
      key    :'_id',
      display:'serviceItemName'
    },
    process    :{
      kind:'enum'
    }
  },

  //编辑器
  editor :{
    fieldsets:[
      {legend:'', help:'', fields:['process', 'count', 'sum']},
      {legend:'', help:'', fields:['merchant', 'serviceItem']},
      {legend:'', help:'', fields:['isSucceed']}
    ]
  },

  //列表
  list   :{
    query      :{member:{$exists:true}},
    sortOrders :[
      {field:'updatedAt', dir:'desc'}
    ],
    populate   :[
      {
        path  :'member',
        select:'_id'
      },
      {
        path  :'merchant',
        select:'_id merchantName'
      },
      {
        path  :'serviceItem',
        select:'_id serviceItemName'
      }
    ],
    listPerPage:20,
    fields     :['member', 'merchant', 'serviceItem', 'process', 'count', 'sum', 'isSucceed']
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