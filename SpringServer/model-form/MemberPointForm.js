var MemberPoint = require('../model/MemberPoint').MemberPoint;

/*
 * 会员积分的编辑表单设置
 * */
exports.MemberPointForm = module.exports.MemberPointForm = {
  mongooseModel:MemberPoint,
  title        :'会员积分详情', //表单标题
  subTitle     :'管理平台的会员积分管理',
  plural       :'会员积分', //复数形式的表单标题

  //字段编辑方式.
  schemaFields :{
    _id               :{display:'Id', placeholder:''},
    availablePoint    :{display:'目前可用积分', placeholder:'', editorType:'text'},
    unenforceablePoint:{display:'未生效的积分', placeholder:'', editorType:'text'},
    incomeSumPoint    :{display:'累积新增积分', placeholder:'', editorType:'text'},
    outgoSumPoint     :{display:'累积支出积分', placeholder:'', editorType:'text'},
    member            :{display:'会员', placeholder:'', editorType:'refModel', refDisplayField:'_id', linkUrlPrefix:'/admin/member/'}
  },

  //编辑器
  editor       :{
    fieldsets:[
      {legend:'', help:'', fields:['availablePoint', 'unenforceablePoint', 'incomeSumPoint', 'outgoSumPoint']}
    ]
  },

  //列表
  list         :{
    query      :{member:{$exists:true}},
    sortOrders :[
      {field:'updatedAt', dir:'desc'}
    ],
    populate   :[
      {
        path  :'member',
        select:'_id'
      }
    ],
    listPerPage:20,
    fields     :['member', 'availablePoint', 'unenforceablePoint', 'incomeSumPoint', 'outgoSumPoint']
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