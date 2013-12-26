var Member = require('../model/Member').Member;
var MemberRank = require('../model/MemberRank').MemberRank;

/*
 * 会员的编辑表单设置
 * */
exports.MemberForm = module.exports.MemberForm = {
  mongooseModel:Member,
  title        :'会员详情', //表单标题
  subTitle     :'商户的会员信息管理',
  plural       :'会员信息', //复数形式的表单标题

  //字段编辑方式.
  schemaFields :{
    _id       :{display:'Id', placeholder:''},
    memberRank:{display:'会员等级', placeholder:'', editorType:'refModel', refDisplayField:'memberRankName', linkUrlPrefix:'/admin/memberRank/'},
    merchant  :{display:'商户', placeholder:'', editorType:'refModel', refDisplayField:'merchantName', linkUrlPrefix:'/admin/merchant/'},
    user      :{display:'用户', placeholder:'', editorType:'refModel', refDisplayField:'userName', linkUrlPrefix:'/admin/user/'},
    amount    :{display:'会员余额', placeholder:'', editorType:'text'}
  },

  choices:{
    memberRank:{
      kind   :'model',
      model  :MemberRank,
      query  :{},
      fields :'_id memberRankName',
      options:{},
      key    :'_id',
      display:'memberRankName'
    }
  },

  //编辑器
  editor :{
    fieldsets:[
      {legend:'', help:'', fields:['memberRank']},
      {legend:'', help:'', fields:['amount']}
    ]
  },

  //列表
  list   :{
    sortOrders :[
      {field:'updatedAt', dir:'desc'}
    ],
    populate   :[
      {
        path  :'memberRank',
        select:'_id memberRankName'
      },
      {
        path  :'merchant',
        select:'_id merchantName'
      },
      {
        path  :'user',
        select:'_id userName'
      }
    ],
    listPerPage:20,
    fields     :['merchant', 'user', 'memberRank', 'amount']
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