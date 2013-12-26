var MemberCard = require('../model/MemberCard').MemberCard;
var ServiceItem = require('../model/ServiceItem').ServiceItem;
var Merchant = require('../model/Merchant').Merchant;

/*
 * 会员卡的编辑表单设置
 * */
exports.MemberCardForm = module.exports.MemberCardForm = {
  mongooseModel:MemberCard,
  title        :'%memberCardName%', //表单标题
  subTitle     :'商户的会员卡管理',
  plural       :'会员卡', //复数形式的表单标题

  //字段编辑方式.
  schemaFields :{
    _id           :{display:'Id', placeholder:''},
    memberCardName:{display:'会员卡名称', placeholder:'会员卡名称', editorType:'text', help:'请输入会员卡名称'},
    description   :{display:'描述信息', placeholder:'会员卡描述信息', editorType:'text'},
    promptIntro   :{display:'温馨提示', placeholder:'温馨提示', editorType:'text'},
    serviceItem   :{display:'服务项目', placeholder:'', editorType:'refModel', refDisplayField:'serviceItemName', linkUrlPrefix:'/admin/serviceItem/'},
    merchant      :{display:'商户', placeholder:'', editorType:'refModel', refDisplayField:'merchantName', linkUrlPrefix:'/admin/merchant/'},
    member        :{display:'会员', placeholder:'', editorType:'refModel', refDisplayField:'_id', linkUrlPrefix:'/admin/member/'},
    iconImage     :{display:'会员卡图标', placeholder:'会员卡图标', editorType:'image'},
    pointApply    :{display:'会员卡申领需要扣除会员积分', placeholder:'会员卡申领需要扣除会员积分数', editorType:'text'},
    pointUsed     :{display:'会员卡使用需要扣除会员积分', placeholder:'会员卡使用需要扣除会员积分数', editorType:'text'},
    validFromDate :{display:'有效开始日期', placeholder:'有效开始日期', editorType:'date'},
    validToDate   :{display:'有效结束日期', placeholder:'有效结束日期', editorType:'date'},
    forbidden     :{display:'是否禁用', placeholder:'', editorType:'switch'}
  },

  choices:{
    merchant   :{
      kind   :'model',
      model  :Merchant,
      query  :{},
      fields :'_id merchantName',
      options:{},
      key    :'_id',
      display:'merchantName'
    },
    serviceItem:{
      kind   :'model',
      model  :ServiceItem,
      query  :{},
      fields :'_id serviceItemName',
      options:{},
      key    :'_id',
      display:'serviceItemName'
    }
  },

  //编辑器
  editor :{
    fieldsets:[
      {legend:'', help:'', fields:['memberCardName', 'description', 'promptIntro', 'iconImage', 'pointApply', 'pointUsed']},
      {legend:'', help:'', fields:['serviceItem', 'merchant']},
      {legend:'', help:'', fields:['validFromDate', 'validToDate']}
    ]
  },

  //列表
  list   :{
    sortOrders :[
      {field:'updatedAt', dir:'desc'},
      {field:'memberCardName'}
    ],
    populate   :[
      {
        path  :'serviceItem',
        select:'_id serviceItemName'
      },
      {
        path  :'merchant',
        select:'_id merchantName'
      },
      {
        path  :'member',
        select:'_id'
      }
    ],
    listPerPage:20,
    fields     :['memberCardName', 'promptIntro', 'pointApply', 'pointUsed', 'forbidden', 'validFromDate', 'validToDate']
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