var Message = require('../model/Message').Message;
var User = require('../model/User').User;
var Merchant = require('../model/Merchant').Merchant;
var Store = require('../model/Store').Store;

/*
 * 消息记录的编辑表单设置
 * */
exports.MessageForm = module.exports.MessageForm = {
  mongooseModel:Message,
  title        :'%title%', //表单标题
  subTitle     :'管理平台的消息记录管理',
  plural       :'消息记录', //复数形式的表单标题

  //字段编辑方式.
  schemaFields :{
    _id      :{display:'Id', placeholder:''},
    title    :{display:'信息标题', placeholder:'信息标题', editorType:'text'},
    content  :{display:'信息内容', placeholder:'信息内容', editorType:'text'},
    owner    :{display:'消息撰写人', placeholder:'', editorType:'refModel', refDisplayField:'userName', linkUrlPrefix:'/admin/user/'},
    merchant :{display:'消息发送者所属商户', placeholder:'', editorType:'refModel', refDisplayField:'merchantName', linkUrlPrefix:'/admin/merchant/'},
    store    :{display:'消息相关联的门店', placeholder:'', editorType:'refModel', refDisplayField:'storeName', linkUrlPrefix:'/admin/store/'},
    iconImage:{display:'消息图标', placeholder:'', editorType:'image'},
    isDraft  :{display:'是否草信息', placeholder:'', editorType:'switch'},
    createdAt:{display:'创建时间', placeholder:'', editorType:'date'}
  },

  choices:{
    owner   :{
      kind   :'model',
      model  :User,
      query  :{},
      fields :'_id userName',
      options:{},
      key    :'_id',
      display:'userName'
    },
    merchant:{
      kind   :'model',
      model  :Merchant,
      query  :{},
      fields :'_id merchantName',
      options:{},
      key    :'_id',
      display:'merchantName'
    },
    store   :{
      kind   :'model',
      model  :Store,
      query  :{},
      fields :'_id storeName',
      options:{},
      key    :'_id',
      display:'storeName'
    }
  },

  //编辑器
  editor :{
    fieldsets:[
      {legend:'', help:'', fields:['title', 'content', 'iconImage']},
      {legend:'', help:'', fields:['owner', 'merchant', 'store']},
      {legend:'', help:'', fields:['isDraft']}
    ]
  },

  //列表
  list   :{
    sortOrders :[
      {field:'updatedAt', dir:'desc'},
      {field:'title'}
    ],
    populate   :[
      {
        path  :'owner',
        select:'_id userName'
      },
      {
        path  :'merchant',
        select:'_id merchantName'
      },
      {
        path  :'store',
        select:'_id storeName'
      }
    ],
    listPerPage:20,
    fields     :['title', 'content', 'iconImage', 'isDraft', 'createdAt']
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