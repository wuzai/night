var Comment = require('../model/Comment').Comment;
var Merchant = require('../model/Merchant').Merchant;
var User = require('../model/User').User;

/**
 * 用户对商户的评论的编辑表单设置
 * @type {Object}
 */
exports.CommentForm = module.exports.CommentForm = {
  mongooseModel:Comment,
  title        :'评论详情', //表单标题
  subTitle     :'用户对商户下的所有评论信息',
  plural       :'评论信息', //复数形式的表单标题

  lockedFields:['_id', 'merchant'],

  //字段编辑方式.
  schemaFields:{
    _id          :{display:'Id', placeholder:''},
    merchant     :{display:'商户', placeholder:'', editorType:'refModel', refDisplayField:'merchantName', linkUrlPrefix:'/admin/merchant/'},
    user         :{display:'用户', placeholder:'', editorType:'refModel', refDisplayField:'userName', linkUrlPrefix:'/admin/user/'},
    commentType  :{display:'评论类型', placeholder:'评论类型', editorType:'selector'},
    commenterName:{display:'评论人', placeholder:'', editorType:'text'},
    content      :{display:'内容', placeholder:'评论内容', editorType:'wysiwyg'},
    rating       :{display:'评论星级', placeholder:'', editorType:'number'}
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
    user       :{
      kind   :'model',
      model  :User,
      query  :{},
      fields :'_id userName',
      options:{},
      key    :'_id',
      display:'userName'
    },
    commentType:{
      kind:'enum'
    }
  },

  //编辑器
  editor :{
    fieldsets:[
      {legend:'', help:'', fields:['content', 'rating', 'commenterName']},
      {legend:'', help:'', fields:['merchant', 'user']},
      {legend:'', help:'', fields:['commentType']}
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
        path  :'user',
        select:'_id userName'
      }
    ],
    listPerPage:20,
    fields     :['content', 'rating', 'commentType', 'commenterName', 'merchant', 'user']
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