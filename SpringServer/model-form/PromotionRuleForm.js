var PromotionRule = require('../model/PromotionRule').PromotionRule;

/*
 * 业务规则的编辑表单设置
 * */
exports.PromotionRuleForm = module.exports.PromotionRuleForm = {
  mongooseModel:PromotionRule,
  title        :'%ruleName%', //表单标题
  subTitle     :'商户的业务规则管理',
  plural       :'业务规则', //复数形式的表单标题

  //字段编辑方式.
  schemaFields :{
    _id        :{display:'Id', placeholder:''},
    ruleName   :{display:'业务规则名称', placeholder:'业务规则名称', editorType:'text', help:'请输入业务规则名称'},
    description:{display:'描述信息', placeholder:'描述信息', editorType:'text'},
    expression :{display:'表述内容', placeholder:'业务规则表述内容', editorType:'wysiwyg'}
  },

  //编辑器
  editor       :{
    fieldsets:[
      {legend:'', help:'', fields:['ruleName', 'description', 'expression']}
    ]
  },

  //列表
  list         :{
    sortOrders :[
      {field:'updatedAt', dir:'desc'},
      {field:'ruleName'}
    ],
    listPerPage:20,
    fields     :['ruleName', 'expression']
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