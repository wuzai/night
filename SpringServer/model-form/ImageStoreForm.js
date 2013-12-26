var ImageStore = require('../model/ImageStore').ImageStore;

/*
 * 图片存储的编辑表单设置
 * */
exports.ImageStoreForm = module.exports.ImageStoreForm = {
  mongooseModel:ImageStore,
  title        :'图片记录详细', //表单标题
  subTitle     :'管理平台的图片记录管理',
  plural       :'图片记录', //复数形式的表单标题

  //字段编辑方式.
  schemaFields :{
    _id         :{display:'Id', placeholder:''},
    imageUrl    :{display:'图片路径', placeholder:'', editorType:'image'},
    retinaUrl   :{display:'高清图路径', placeholder:'', editorType:'image'},
    smallUrl    :{display:'小图路径', placeholder:'', editorType:'image'},
    thumbnailUrl:{display:'缩略图路径', placeholder:'', editorType:'image'}
  },

  //编辑器
  editor       :{
    fieldsets:[
      {legend:'', help:'', fields:['imageUrl', 'retinaUrl', 'smallUrl', 'thumbnailUrl']}
    ]
  },

  //列表
  list         :{
    sortOrders :[
      {field:'updatedAt', dir:'desc'}
    ],
    listPerPage:20,
    fields     :['imageUrl']
  },

  //搜索支持
  search       :{
    data     :{search:''}, //default data
    schema   :{
      search:{type:'Text', title:'搜索'}
    },
    fieldsets:[
      {"legend":"Search Group", "fields":["search"]}
    ] //see backbone forms.
  },

  //过滤支持
  filters      :{

  },

  //汇总信息
  summary      :{

  }
};