var Coupon = require('../model/Coupon').Coupon;
var ServiceItem = require('../model/ServiceItem').ServiceItem;
var Merchant = require('../model/Merchant').Merchant;

/*
 * 优惠券的编辑表单设置
 * */
exports.CouponForm = module.exports.CouponForm = {
  mongooseModel:Coupon,
  title        :'%organizationName%', //表单标题
  subTitle     :'商户的优惠券管理',
  plural       :'优惠券', //复数形式的表单标题

  //字段编辑方式.
  schemaFields :{
    _id          :{display:'Id', placeholder:''},
    couponName   :{display:'优惠券名称', placeholder:'优惠券名称', editorType:'text', help:'请输入优惠券名称'},
    description  :{display:'描述信息', placeholder:'优惠券描述信息', editorType:'text'},
    promptIntro  :{display:'温馨提示', placeholder:'温馨提示', editorType:'text'},
    serviceItem  :{display:'服务项目', placeholder:'', editorType:'refModel', refDisplayField:'serviceItemName', linkUrlPrefix:'/admin/serviceItem/'},
    merchant     :{display:'商户', placeholder:'', editorType:'refModel', refDisplayField:'merchantName', linkUrlPrefix:'/admin/merchant/'},
    member       :{display:'会员', placeholder:'', editorType:'refModel', refDisplayField:'_id', linkUrlPrefix:'/admin/member/'},
    iconImage    :{display:'优惠券图标', placeholder:'优惠券图标', editorType:'image'},
    prefix       :{display:'优惠劵前缀', placeholder:'', editorType:'text'},
    quantity     :{display:'优惠劵数量', placeholder:'优惠券数量', editorType:'text'},
    pointApply   :{display:'优惠劵申领需要扣除会员积分', placeholder:'优惠劵申领需要扣除会员积分数', editorType:'text'},
    pointUsed    :{display:'优惠劵使用需要扣除会员积分', placeholder:'优惠劵使用需要扣除会员积分数', editorType:'text'},
    validFromDate:{display:'有效开始日期', placeholder:'有效开始日期', editorType:'date'},
    validToDate  :{display:'有效结束日期', placeholder:'有效结束日期', editorType:'date'},
    forbidden    :{display:'是否禁用', placeholder:'', editorType:'switch'}
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
      {legend:'', help:'', fields:['couponName', 'description', 'promptIntro', 'iconImage', 'prefix', 'quantity', 'pointApply', 'pointUsed']},
      {legend:'', help:'', fields:['serviceItem', 'merchant']},
      {legend:'', help:'', fields:['validFromDate', 'validToDate']}
    ]
  },

  //列表
  list   :{
    sortOrders :[
      {field:'updatedAt', dir:'desc'},
      {field:'couponName'}
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
    fields     :['couponName', 'promptIntro', 'prefix', 'quantity', 'pointApply', 'pointUsed', 'forbidden', 'validFromDate', 'validToDate']
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