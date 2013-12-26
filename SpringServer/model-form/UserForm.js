var User = require('../model/User').User;
var UserRank = require('../model/UserRank').UserRank;

/*
 * 用户的编辑表单设置
 * */
exports.UserForm = module.exports.UserForm = {
  mongooseModel:User,
  title        :'%userName%', //表单标题
  subTitle     :'管理平台的用户信息管理',
  plural       :'用户信息', //复数形式的表单标题

  //字段编辑方式.
  schemaFields :{
    _id                   :{display:'Id', placeholder:''},
    userName              :{display:'用户名', placeholder:'用户名', editorType:'text', help:'请输入用户名'},
    isApproved            :{display:'是否通过验证', placeholder:'', editorType:'switch'},
    isLockedOut           :{display:'是否锁定', placeholder:'', editorType:'switch'},
    isPerfect             :{display:'是否完善资料', placeholder:'', editorType:'switch'},
    inviter               :{display:'邀请人', placeholder:'', editorType:'refModel', refDisplayField:'userName', linkUrlPrefix:'/admin/user/'},
    userRank              :{display:'用户等级', placeholder:'', editorType:'refModel', refDisplayField:'userRankName', linkUrlPrefix:'/admin/userRank/'},
    lastActivityTime      :{display:'最后登录时间', placeholder:'', editorType:'date'},
    lastChangePasswordTime:{display:'最后修改密码时间', placeholder:'', editorType:'date'}
  },

  choices:{
    userRank:{
      kind   :'model',
      model  :UserRank,
      query  :{},
      fields :'_id userRankName',
      options:{},
      key    :'_id',
      display:'userRankName'
    }
  },

  //编辑器
  editor :{
    fieldsets:[
      {legend:'', help:'', fields:['userName']},
      {legend:'', help:'', fields:['userRank']},
      {legend:'', help:'', fields:['isApproved', 'isLockedOut']}
    ]
  },

  //列表
  list   :{
    sortOrders :[
      {field:'updatedAt', dir:'desc'},
      {field:'userName'}
    ],
    populate   :[
      {
        path  :'inviter',
        select:'_id userName'
      },
      {
        path  :'userRank',
        select:'_id userRankName'
      }
    ],
    listPerPage:20,
    fields     :['userName', 'userRank', 'isApproved', 'isLockedOut', 'isPerfect', 'inviter', 'lastActivityTime', 'lastChangePasswordTime']
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