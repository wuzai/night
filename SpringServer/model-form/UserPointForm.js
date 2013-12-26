var UserPoint = require('../model/UserPoint').UserPoint;

/*
 * 用户积分的编辑表单设置
 * */
exports.UserPointForm = module.exports.UserPointForm = {
  mongooseModel:UserPoint,
  title        :'用户积分详情', //表单标题
  subTitle     :'管理平台的用户积分管理',
  plural       :'用户积分', //复数形式的表单标题

  //字段编辑方式.
  schemaFields :{
    _id               :{display:'Id', placeholder:''},
    availablePoint    :{display:'目前可用积分', placeholder:'', editorType:'text'},
    unenforceablePoint:{display:'未生效的积分', placeholder:'', editorType:'text'},
    incomeSumPoint    :{display:'累积新增积分', placeholder:'', editorType:'text'},
    outgoSumPoint     :{display:'累积支出积分', placeholder:'', editorType:'text'},
    user              :{display:'用户', placeholder:'', editorType:'refModel', refDisplayField:'userName', linkUrlPrefix:'/admin/user/'}
  },

  //编辑器
  editor       :{
    fieldsets:[
      {legend:'', help:'', fields:['availablePoint', 'unenforceablePoint', 'incomeSumPoint', 'outgoSumPoint']}
    ]
  },

  //列表
  list         :{
    query      :{user:{$exists:true}},
    sortOrders :[
      {field:'updatedAt', dir:'desc'}
    ],
    populate   :[
      {
        path  :'user',
        select:'_id userName'
      }
    ],
    listPerPage:20,
    fields     :['user', 'availablePoint', 'unenforceablePoint', 'incomeSumPoint', 'outgoSumPoint']
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