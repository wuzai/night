var ServiceItem = require('../model/ServiceItem').ServiceItem;
var ServiceSet = require('../model/ServiceSet').ServiceSet;
var PromotionRule = require('../model/PromotionRule').PromotionRule;
var ServiceItemProfile = require('../model/ServiceItemProfile').ServiceItemProfile;

/*
 * 服务项目的编辑表单设置
 * */
exports.ServiceItemForm = module.exports.ServiceItemForm = {
  mongooseModel:ServiceItem,
  title        :'%serviceItemName%', //表单标题
  subTitle     :'商户的服务项目管理',
  plural       :'服务项目', //复数形式的表单标题
  profileModel :ServiceItemProfile,
  profileField :'serviceItem',

  //字段编辑方式.
  schemaFields :{
    _id            :{display:'Id', placeholder:''},
    serviceItemName:{display:'服务项目名称', placeholder:'服务项目名称', editorType:'text', help:'请输入服务项目名称'},
    description    :{display:'描述信息', placeholder:'描述信息', editorType:'text'},
    serviceSet     :{display:'服务套餐', placeholder:'服务套餐', editorType:'refModel', refDisplayField:'serviceSetName', linkUrlPrefix:'/admin/serviceSet/'},
    rule           :{display:'服务规则', placeholder:'服务规则', editorType:'refModel', refDisplayField:'promotionRuleName', linkUrlPrefix:'/admin/promotionRule/'},
    serviceItemType:{display:'服务项目类型', placeholder:'服务项目类型', editorType:'selector'},
    isMemberOnly   :{display:'是否仅限于会员', placeholder:'', editorType:'switch'},
    isRequireApply :{display:'是否需要申请', placeholder:'', editorType:'switch'},
    isApplicable   :{display:'用户可否申请', placeholder:'', editorType:'switch'},
    isRequireAudit :{display:'是否需要商户审核', placeholder:'', editorType:'switch'},
    fromDate       :{display:'开始日期', placeholder:'开始日期', editorType:'date'},
    toDate         :{display:'结束日期', placeholder:'结束日期', editorType:'date'},
    allowLargess   :{display:'是否允许转赠', placeholder:'', editorType:'switch'},
    allowShare     :{display:'是否允许分享', placeholder:'', editorType:'switch'},
    postImage      :{display:'海报图片', placeholder:'服务项目海报图片', editorType:'image', refDisplayField:'imageUrl', linkUrlPrefix:'/admin/imageStore/'}
  },

  choices:{
    serviceSet     :{
      kind   :'model',
      model  :ServiceSet,
      query  :{state:'0000-0000-0000'},
      fields :'_id serviceSetName',
      options:{},
      key    :'_id',
      display:'serviceSetName'
    },
    rule           :{
      kind   :'model',
      model  :PromotionRule,
      query  :{},
      fields :'_id ruleName',
      options:{},
      key    :'_id',
      display:'ruleName'
    },
    serviceItemType:{
      kind:'enum'
    }
  },

  //编辑器
  editor :{
    fieldsets:[
      {legend:'', help:'', fields:['serviceItemName', 'description', 'serviceItemType', 'postImage']},
      {legend:'', help:'', fields:['serviceSet', 'rule']},
      {legend:'', help:'', fields:['fromDate', 'toDate']},
      {legend:'', help:'', fields:['isMemberOnly', 'isRequireApply', 'isApplicable', 'isRequireAudit', 'allowLargess', 'allowShare']}
    ]
  },

  //列表
  list   :{
    sortOrders :[
      {field:'updatedAt', dir:'desc'},
      {field:'serviceItemName'}
    ],
    populate   :[
      {
        path  :'serviceSet',
        select:'_id serviceSetName'
      },
      {
        path  :'rule',
        select:'_id promotionRuleName'
      },
      {
        path  :'postImage',
        select:'_id imageUrl'
      }
    ],
    listPerPage:20,
    fields     :['serviceItemName', 'serviceSet', 'serviceItemType', 'postImage', 'fromDate', 'toDate', 'isMemberOnly', 'isRequireApply', 'isApplicable', 'isRequireAudit', 'allowLargess', 'allowShare']
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