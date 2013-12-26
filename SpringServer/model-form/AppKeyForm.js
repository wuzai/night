var AppKey = require('../model/AppKey').AppKey;

/*
 * AppKey的编辑表单设置
 * */
exports.AppKeyForm = module.exports.AppKeyForm = {
  mongooseModel:AppKey,
  title        :'%phone%', //表单标题
  subTitle     :'管理平台的AppKey管理',
  plural       :'AppKey', //复数形式的表单标题

  //字段编辑方式.
  schemaFields :{
    _id       :{display:'Id', placeholder:''},
    phone     :{display:'电话', placeholder:'电话', editorType:'text', help:'请输入电话'},
    key       :{display:'密钥', placeholder:'密钥', editorType:'text', help:'请输入密钥'},
    expireDate:{display:'终止日期', placeholder:'终止日期', editorType:'date'},
    keyType   :{display:'密钥类型', placeholder:'密钥类型', editorType:'selector'}
  },

  choices:{
    keyType:{
      kind:'enum'
    }
  },

  //编辑器
  editor :{
    fieldsets:[
      {legend:'', help:'', fields:['phone', 'key']},
      {legend:'', help:'', fields:['expireDate']},
      {legend:'', help:'', fields:['keyType']}
    ]
  },

  //列表
  list   :{
    sortOrders :[
      {field:'updatedAt', dir:'desc'},
      {field:'expireDate'}
    ],
    listPerPage:20,
    fields     :['phone', 'key', 'expireDate', 'keyType']
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