var Gift = require('../model/Gift').Gift;
var PromotionRule = require('../model/PromotionRule').PromotionRule;

/*
 * 赠品活动的编辑表单设置
 * */
exports.GiftForm = module.exports.GiftForm = {
  mongooseModel:Gift,
  title        :'%giftName%', //表单标题
  subTitle     :'商户的赠品活动管理',
  plural       :'赠品活动', //复数形式的表单标题

  //字段编辑方式.
  schemaFields :{
    _id          :{display:'Id', placeholder:''},
    giftName     :{display:'赠品活动名称', placeholder:'赠品活动名称', editorType:'text', help:'请输入赠品活动名称'},
    description  :{display:'描述信息', placeholder:'赠品活动描述信息', editorType:'text'},
    promptIntro  :{display:'温馨提示', placeholder:'温馨提示', editorType:'text'},
    content      :{display:'赠品活动内容', placeholder:'赠品活动内容', editorType:'text'},
    rule         :{display:'活动规则', placeholder:'', editorType:'refModel', refDisplayField:'ruleName', linkUrlPrefix:'/admin/promotionRule/'},
    validFromDate:{display:'有效开始日期', placeholder:'', editorType:'date'},
    validToDate  :{display:'有效结束日期', placeholder:'', editorType:'date'},
    forbidden    :{display:'是否禁用', placeholder:'', editorType:'switch'}
  },

  choices:{
    rule:{
      kind   :'model',
      model  :PromotionRule,
      query  :{},
      fields :'_id ruleName',
      options:{},
      key    :'_id',
      display:'ruleName'
    }
  },

  //编辑器
  editor :{
    fieldsets:[
      {legend:'', help:'', fields:['giftName', 'description', 'promptIntro', 'content']},
      {legend:'', help:'', fields:['rule']},
      {legend:'', help:'', fields:['validFromDate', 'validToDate']}
    ]
  },

  //列表
  list   :{
    sortOrders :[
      {field:'updatedAt', dir:'desc'},
      {field:'giftName'}
    ],
    populate   :[
      {
        path  :'rule',
        select:'_id promotionRuleName'
      }
    ],
    listPerPage:20,
    fields     :['giftName', 'description', 'promptIntro', 'content', 'forbidden', 'validFromDate', 'validToDate']
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