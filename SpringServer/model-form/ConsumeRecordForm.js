var ConsumeRecord = require('../model/ConsumeRecord').ConsumeRecord;
var Member = require('../model/Member').Member;
var MemberCard = require('../model/MemberCard').MemberCard;
var MeteringCard = require('../model/MeteringCard').MeteringCard;
var Coupon = require('../model/Coupon').Coupon;
var Gift = require('../model/Gift').Gift;

/*
 * 消费记录的编辑表单设置
 * */
exports.ConsumeRecordForm = module.exports.ConsumeRecordForm = {
  mongooseModel:ConsumeRecord,
  title        :'消费记录详情', //表单标题
  subTitle     :'管理平台的消费记录管理',
  plural       :'消费记录', //复数形式的表单标题

  //字段编辑方式.
  schemaFields :{
    _id         :{display:'Id', placeholder:''},
    member      :{display:'会员', placeholder:'', editorType:'refModel', refDisplayField:'_id', linkUrlPrefix:'/admin/member/'},
    memberCard  :{display:'会员卡', placeholder:'', editorType:'refModel', refDisplayField:'memberCardName', linkUrlPrefix:'/admin/memberCard/'},
    meteringCard:{display:'计次卡', placeholder:'', editorType:'refModel', refDisplayField:'meteringCardName', linkUrlPrefix:'/admin/meteringCard/'},
    coupon      :{display:'优惠券', placeholder:'', editorType:'refModel', refDisplayField:'couponName', linkUrlPrefix:'/admin/coupon/'},
    gift        :{display:'赠品活动', placeholder:'', editorType:'refModel', refDisplayField:'giftName', linkUrlPrefix:'/admin/gift/'},
    process     :{display:'进行步骤', placeholder:'', editorType:'selector'}
  },

  choices:{
    member      :{
      kind   :'model',
      model  :Member,
      query  :{},
      fields :'_id',
      options:{},
      key    :'_id',
      display:'_id'
    },
    memberCard  :{
      kind   :'model',
      model  :MemberCard,
      query  :{},
      fields :'_id memberCardName',
      options:{},
      key    :'_id',
      display:'memberCardName'
    },
    meteringCard:{
      kind   :'model',
      model  :MeteringCard,
      query  :{},
      fields :'_id meteringCardName',
      options:{},
      key    :'_id',
      display:'meteringCardName'
    },
    coupon      :{
      kind   :'model',
      model  :Coupon,
      query  :{},
      fields :'_id couponName',
      options:{},
      key    :'_id',
      display:'couponName'
    },
    gift        :{
      kind   :'model',
      model  :Gift,
      query  :{},
      fields :'_id giftName',
      options:{},
      key    :'_id',
      display:'giftName'
    },
    process     :{
      kind:'enum'
    }
  },

  //编辑器
  editor :{
    fieldsets:[
      {legend:'', help:'', fields:['member', 'memberCard', 'meteringCard', 'coupon', 'gift', 'process']}
    ]
  },

  //列表
  list   :{
    sortOrders :[
      {field:'updatedAt', dir:'desc'}
    ],
    populate   :[
      {
        path  :'member',
        select:'_id'
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
    fields     :['member', 'memberCard', 'meteringCard', 'coupon', 'gift', 'process']
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