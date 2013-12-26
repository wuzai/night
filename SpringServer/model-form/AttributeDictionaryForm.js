var AttributeDictionary = require('../model/AttributeDictionary').AttributeDictionary;

/*
 * 扩展属性字典的编辑表单设置
 * */
exports.AttributeDictionaryForm = module.exports.AttributeDictionaryForm = {
  mongooseModel:AttributeDictionary,
  title        :'%category%', //表单标题
  subTitle     :'管理平台的扩展属性管理',
  plural       :'扩展属性', //复数形式的表单标题

  //字段编辑方式.
  schemaFields :{
    _id              :{display:'Id', placeholder:''},
    category         :{display:'属性类别', placeholder:'属性类别', editorType:'text', help:'请选择属性类别'},
    attributeName    :{display:'属性名称', placeholder:'属性名称', editorType:'text', help:'请输入属性名称'},
    description      :{display:'描述信息', placeholder:'属性描述信息', editorType:'text'},
    isEnabled        :{display:'是否启用', placeholder:'', editorType:'switch'},
    isRequired       :{display:'是否必须', placeholder:'', editorType:'switch'},
    verifyRegex      :{display:'验证规则', placeholder:'属性验证规则', editorType:'text'},
    isEditable       :{display:'是否编辑', placeholder:'', editorType:'switch'},
    isMultiSelectable:{display:'是否多选', placeholder:'', editorType:'switch'},
    defaultValue     :{display:'默认值', placeholder:'属性默认值', editorType:'text'},
    bindTable        :{display:'所属表', placeholder:'属性所属表', editorType:'text'},
    bindPKFields     :{display:'所属公共键字段', placeholder:'属性所属公共键字段', editorType:'text'},
    sortOrder        :{display:'排序次序', placeholder:'', editorType:'text'},
    isEncrypt        :{display:'是否加密', placeholder:'', editorType:'switch'}
  },

  //编辑器
  editor       :{
    fieldsets:[
      {legend:'', help:'', fields:['category', 'attributeName', 'description', 'verifyRegex', 'defaultValue', 'bindTable', 'bindPKFields']},
      {legend:'', help:'', fields:['isEnabled', 'isRequired', 'isEditable', 'isMultiSelectable', 'isEncrypt']},
      {legend:'', help:'', fields:['sortOrder']}
    ]
  },

  //列表
  list         :{
    sortOrders :[
      {field:'updatedAt', dir:'desc'},
      {field:'category'}
    ],
    listPerPage:20,
    fields     :['category', 'attributeName', 'description', 'defaultValue', 'isEnabled', 'isRequired', 'isEditable', 'isMultiSelectable', 'isEncrypt']
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