var Store = require('../model/Store').Store;
var Merchant = require('../model/Merchant').Merchant;

/*
 * 商户门店的编辑表单设置
 * */
exports.StoreForm = module.exports.StoreForm = {
  mongooseModel:Store,
  title        :'%storeName%', //表单标题
  subTitle     :'商户的门店信息管理',
  plural       :'门店信息', //复数形式的表单标题

  //字段编辑方式.
  schemaFields :{
    _id        :{display:'Id', placeholder:''},
    merchant   :{display:'所属商户', placeholder:'', editorType:'refModel', refDisplayField:'merchantName', linkUrlPrefix:'/admin/merchant/'},
    storeName  :{display:'门店名称', placeholder:'门店名称', editorType:'text', help:'请输入门店名称'},
    description:{display:'描述信息', placeholder:'描述信息', editorType:'text'},
    telephone  :{display:'门店电话', placeholder:'门店电话', editorType:'text'},
    address    :{display:'门店地址', placeholder:'门店地址', editorType:'text'},
    slogan     :{display:'标语', placeholder:'标语', editorType:'text'},
    vipImage   :{display:'门店图标', placeholder:'', editorType:'image', help:'请选择图片'}
  },

  choices:{
    merchant:{
      kind   :'model',
      model  :Merchant,
      query  :{},
      fields :'_id merchantName',
      options:{},
      key    :'_id',
      display:'merchantName'
    }
  },

  //编辑器
  editor :{
    fieldsets:[
      {legend:'', help:'', fields:['storeName', 'description', 'telephone', 'address', 'slogan', 'vipImage']},
      {legend:'', help:'', fields:['merchant']}
    ]
  },

  //列表
  list   :{
    sortOrders :[
      {field:'updatedAt', dir:'desc'},
      {field:'storeName'}
    ],
    populate   :[
      {
        path  :'merchant',
        select:'_id merchantName'
      }
    ],
    listPerPage:20,
    fields     :['storeName', 'merchant', 'telephone', 'address', 'slogan']
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