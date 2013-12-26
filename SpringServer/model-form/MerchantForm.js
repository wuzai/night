var Merchant = require('../model/Merchant').Merchant;
var Organization = require('../model/Organization').Organization;
var MerchantRank = require('../model/MerchantRank').MerchantRank;
var Employee = require('../model/Employee').Employee;

/*
 * 商户的编辑表单设置
 * */
exports.MerchantForm = module.exports.MerchantForm = {
  mongooseModel:Merchant,
  title        :'%merchantName%', //表单标题
  subTitle     :'管理平台的商户信息管理',
  plural       :'商户信息', //复数形式的表单标题

  //字段编辑方式.
  schemaFields :{
    _id                 :{display:'Id', placeholder:''},
    merchantName        :{display:'商户名称', placeholder:'商户名称', editorType:'text', help:'请输入商户名称'},
    description         :{display:'描述信息', placeholder:'商户描述信息', editorType:'wysiwyg'},
    organization        :{display:'所属组织', placeholder:'商户所属组织', editorType:'refModel', refDisplayField:'organizationName', linkUrlPrefix:'/admin/organization/'},
    merchantRank        :{display:'商户等级', placeholder:'', editorType:'refModel', refDisplayField:'merchantRankName', linkUrlPrefix:'/admin/merchantRank/'},
    customerServicePhone:{display:'客服电话', placeholder:'客服电话', editorType:'text'},
    logoImage           :{display:'logo图片', placeholder:'商户logo图片', editorType:'image', help:'请选择商户logo图片'},
    webSite             :{display:'商户网站', placeholder:'商户网站', editorType:'text'},
    isPerfect           :{display:'是否完善资料', placeholder:'', editorType:'switch'},
    manager             :{display:'管理者', placeholder:'', editorType:'refModel', refDisplayField:'fullName', linkUrlPrefix:'/admin/employee/'}
  },

  choices:{
    organization:{
      kind   :'model',
      model  :Organization,
      query  :{},
      fields :'_id organizationName',
      options:{},
      key    :'_id',
      display:'organizationName'
    },
    merchantRank:{
      kind   :'model',
      model  :MerchantRank,
      query  :{},
      fields :'_id merchantRankName',
      options:{},
      key    :'_id',
      display:'merchantRankName'
    },
    manager     :{
      kind   :'model',
      model  :Employee,
      query  :{},
      fields :'_id fullName',
      options:{},
      key    :'_id',
      display:'fullName'
    }
  },

  //编辑器
  editor :{
    fieldsets:[
      {legend:'', help:'', fields:['merchantName', 'description', 'customerServicePhone', 'logoImage', 'webSite']},
      {legend:'', help:'', fields:['organization', 'merchantRank', 'manager']}
    ]
  },

  //列表
  list   :{
    sortOrders :[
      {field:'updatedAt', dir:'desc'},
      {field:'merchantName'}
    ],
    populate   :[
      {
        path  :'organization',
        select:'_id organizationName'
      },
      {
        path  :'merchantRank',
        select:'_id merchantRankName'
      },
      {
        path  :'manager',
        select:'_id fullName'
      }
    ],
    listPerPage:20,
    fields     :['merchantName', 'organization', 'merchantRank', 'manager', 'customerServicePhone', 'webSite']
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