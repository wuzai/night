var Advertisement = require('../model/Advertisement').Advertisement;
var Merchant = require('../model/Merchant').Merchant;
var ServiceItem = require('../model/ServiceItem').ServiceItem;

/*
 * 广告的编辑表单设置
 * */
exports.AdvertisementForm = module.exports.AdvertisementForm = {
  mongooseModel:Advertisement,
  title        :'%title%', //表单标题
  subTitle     :'可以在智能手机客户端展示的宣传广告',
  plural       :'宣传广告', //复数形式的表单标题

  lockedFields:['_id', 'merchant'],

  //字段编辑方式.
  schemaFields:{
    _id         :{display:'Id', placeholder:''},
    title       :{display:'标题', placeholder:'广告标题', editorType:'text', help:'请输入广告标题'},
    postImage   :{display:'海报', placeholder:'广告的海报图片', editorType:'image', refDisplayField:'imageUrl', linkUrlPrefix:'/admin/imageStore/'},
    content     :{display:'内容', placeholder:'广告的内容', editorType:'wysiwyg'},
    merchant    :{display:'商户', placeholder:'商户', editorType:'refModel', refDisplayField:'merchantName', linkUrlPrefix:'/admin/merchant/list'},
    serviceItem :{display:'服务项目', placeholder:'服务项目', editorType:'refModel', refDisplayField:'serviceItemName', linkUrlPrefix:'/admin/serviceItem/'},
    showFromDate:{display:'首页起始日期', placeholder:'首页起始日期', editorType:'date'},
    showToDate  :{display:'首页截止日期', placeholder:'首页截止日期', editorType:'date'},
    fromDate    :{display:'有效起始日期', placeholder:'次页有效起始日期', editorType:'date'},
    toDate      :{display:'有效截止日期', placeholder:'次页有效截止日期', editorType:'date'},
    isApproved  :{display:'是否批准', placeholder:'', editorType:'switch'}
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
      {legend:'', help:'', fields:['title', 'content', 'postImage']},
      {legend:'', help:'', fields:['merchant', 'serviceItem']},
      {legend:'', help:'', fields:['showFromDate', 'showToDate', 'fromDate', 'toDate']},
      {legend:'', help:'', fields:['isApproved']}
    ]
  },

  //列表
  list   :{
    sortOrders :[
      {field:'updatedAt', dir:'desc'},
      {field:'merchant'}
    ],
    populate   :[
      {
        path  :'merchant',
        select:'_id merchantName'
      },
      {
        path  :'serviceItem',
        select:'_id serviceItemName'
      },
      {
        path  :'postImage',
        select:'_id imageUrl'
      }
    ],
    listPerPage:20,
    fields     :['title', 'merchant', 'serviceItem', 'postImage', 'showFromDate', 'showToDate', 'fromDate', 'toDate', 'isApproved']
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