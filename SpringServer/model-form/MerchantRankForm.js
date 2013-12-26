var MerchantRank = require('../model/MerchantRank').MerchantRank;

/*
 * 商户级别的编辑表单设置
 * */
exports.MerchantRankForm = module.exports.MerchantRankForm = {
  mongooseModel:MerchantRank,
  title        :'%merchantRankName%', //表单标题
  subTitle     :'管理平台的商户级别管理',
  plural       :'商户级别', //复数形式的表单标题

  //字段编辑方式.
  schemaFields :{
    _id             :{display:'Id', placeholder:''},
    merchantRankName:{display:'商户级别名称', placeholder:'商户级别名称', editorType:'text', help:'请输入商户级别名称'},
    description     :{display:'描述信息', placeholder:'描述信息', editorType:'text'},
    price           :{display:'价格', placeholder:'该商户级别价格', editorType:'text'},
    isRecommend     :{display:'是否推荐', editorType:'switch'}
  },

  //编辑器
  editor       :{
    fieldsets:[
      {legend:'', help:'', fields:['merchantRankName', 'description', 'price']},
      {legend:'', help:'', fields:['isRecommend']}
    ]
  },

  //列表
  list         :{
    sortOrders :[
      {field:'updatedAt', dir:'desc'},
      {field:'merchantRankName'}
    ],
    listPerPage:20,
    fields     :['merchantRankName', 'description', 'price', 'isRecommend']
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