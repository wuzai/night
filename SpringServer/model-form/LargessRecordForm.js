var LargessRecord = require('../model/LargessRecord').LargessRecord;
var User = require('../model/User').User;

/*
 * 转赠记录的编辑表单设置
 * */
exports.LargessRecordForm = module.exports.LargessRecordForm = {
  mongooseModel:LargessRecord,
  title        :'转赠记录详细', //表单标题
  subTitle     :'管理平台的转赠记录管理',
  plural       :'转赠记录', //复数形式的表单标题

  //字段编辑方式.
  schemaFields :{
    _id          :{display:'Id', placeholder:''},
    fromUser     :{display:'发送用户', placeholder:'', editorType:'refModel', refDisplayField:'userName', linkUrlPrefix:'/admin/user/'},
    toUser       :{display:'接受用户', placeholder:'', editorType:'refModel', refDisplayField:'userName', linkUrlPrefix:'/admin/user/'},
    memberCard   :{display:'会员卡', placeholder:'', editorType:'refModel', refDisplayField:'memberCardName', linkUrlPrefix:'/admin/memberCard/'},
    meteringCard :{display:'计次卡', placeholder:'', editorType:'refModel', refDisplayField:'meteringCardName', linkUrlPrefix:'/admin/meteringCard/'},
    coupon       :{display:'优惠券', placeholder:'', editorType:'refModel', refDisplayField:'couponName', linkUrlPrefix:'/admin/coupon/'},
    gift         :{display:'赠品活动', placeholder:'', editorType:'refModel', refDisplayField:'giftName', linkUrlPrefix:'/admin/gift/'},
    processStatus:{display:'转赠过程状态', placeholder:'', editorType:'selector'}
  },

  choices:{
    fromUser     :{
      kind   :'model',
      model  :User,
      query  :{},
      fields :'_id userName',
      options:{},
      key    :'_id',
      display:'userName'
    },
    toUser       :{
      kind   :'model',
      model  :User,
      query  :{},
      fields :'_id userName',
      options:{},
      key    :'_id',
      display:'userName'
    },
    processStatus:{
      kind:'enum'
    }
  },

  //编辑器
  editor :{
    fieldsets:[
      {legend:'', help:'', fields:['fromUser', 'toUser']},
      {legend:'', help:'', fields:['processStatus']}
    ]
  },

  //列表
  list   :{
    sortOrders :[
      {field:'updatedAt', dir:'desc'},
      {field:'organizationName'}
    ],
    populate   :[
      {
        path  :'fromUser',
        select:'_id userName'
      },
      {
        path  :'toUser',
        select:'_id userName'
      },
      {
        path  :'memberCard',
        select:'_id memberCardName'
      },
      {
        path  :'meteringCard',
        select:'_id meteringCardName'
      },
      {
        path  :'coupon',
        select:'_id couponName'
      },
      {
        path  :'gift',
        select:'_id giftName'
      }
    ],
    listPerPage:20,
    fields     :['processStatus']
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