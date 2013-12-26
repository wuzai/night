var ServiceSet = require('../model/ServiceSet').ServiceSet;
var Merchant = require('../model/Merchant').Merchant;

/*
 * 服务套餐的编辑表单设置
 * */
exports.ServiceSetForm = module.exports.ServiceSetForm = {
  mongooseModel:ServiceSet,
  title        :'%serviceSetName%', //表单标题
  subTitle     :'商户的服务套餐管理',
  plural       :'服务套餐', //复数形式的表单标题

  //字段编辑方式.
  schemaFields :{
    _id           :{display:'Id', placeholder:''},
    merchant      :{display:'商户', placeholder:'', editorType:'refModel', refDisplayField:'merchantName', linkUrlPrefix:'/admin/merchant/'},
    serviceSetName:{display:'服务套餐名称', placeholder:'服务套餐名称', editorType:'text', help:'请输入服务套餐名称'},
    description   :{display:'描述信息', placeholder:'描述信息', editorType:'text'},
    isEnabled     :{display:'是否启用', placeholder:'', editorType:'switch'},
    isApproved    :{display:'是否通过验证', placeholder:'', editorType:'switch'}
  },

  choices:{
    merchant:{
      kind   :'model',
      model  :Merchant,
      query  :{state:'0000-0000-0000'},
      fields :'_id merchantName',
      options:{},
      key    :'_id',
      display:'merchantName'
    }
  },

  //编辑器
  editor :{
    fieldsets:[
      {legend:'', help:'', fields:['serviceSetName', 'description']},
      {legend:'', help:'', fields:['merchant']},
      {legend:'', help:'', fields:['isEnabled', 'isApproved']}
    ]
  },

  //列表
  list   :{
    sortOrders :[
      {field:'updatedAt', dir:'desc'},
      {field:'serviceSetName'}
    ],
    populate   :[
      {
        path  :'merchant',
        select:'_id merchantName'
      }
    ],
    listPerPage:20,
    fields     :['serviceSetName', 'merchant', 'description', 'isEnabled', 'isApproved']
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