var MemberRank = require('../model/MemberRank').MemberRank;

/*
 * 会员级别的编辑表单设置
 * */
exports.MemberRankForm = module.exports.MemberRankForm = {
  mongooseModel:MemberRank,
  title        :'%memberRankName%', //表单标题
  subTitle     :'管理平台的会员级别管理',
  plural       :'会员级别', //复数形式的表单标题

  //字段编辑方式.
  schemaFields :{
    _id           :{display:'Id', placeholder:''},
    memberRankName:{display:'会员级别名称', placeholder:'会员级别名称', editorType:'text', help:'请输入会员级别名称'},
    description   :{display:'描述信息', placeholder:'描述信息', editorType:'text'}
  },

  //编辑器
  editor       :{
    fieldsets:[
      {legend:'', help:'', fields:['memberRankName', 'description']}
    ]
  },

  //列表
  list         :{
    sortOrders :[
      {field:'updatedAt', dir:'desc'},
      {field:'memberRankName'}
    ],
    listPerPage:20,
    fields     :['memberRankName', 'description']
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