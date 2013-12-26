var Resource = require('../model/Resource').Resource;
var ResourceType = require('../model/ResourceType').ResourceType;

/*
 * 资源的编辑表单设置
 * */
exports.ResourceForm = module.exports.ResourceForm = {
  mongooseModel:Resource,
  title        :'%resourceName%', //表单标题
  subTitle     :'管理平台的资源信息管理',
  plural       :'资源信息', //复数形式的表单标题

  //字段编辑方式.
  schemaFields :{
    _id         :{display:'Id', placeholder:''},
    resourceName:{display:'资源名称', placeholder:'资源名称', editorType:'text', help:'请输入资源名称'},
    description :{display:'描述信息', placeholder:'描述信息', editorType:'text'},
    resourceType:{display:'资源类型', placeholder:'资源类型', editorType:'refModel', refDisplayField:'resourceTypeName', linkUrlPrefix:'/admin/resourceType/'},
    pattern     :{display:'资源路径及标识表达式', placeholder:'资源路径及标识表达式', editorType:'text'}
  },

  choices:{
    resourceType:{
      kind   :'model',
      model  :ResourceType,
      query  :{},
      fields :'_id resourceTypeName',
      options:{},
      key    :'_id',
      display:'resourceTypeName'
    }
  },

  //编辑器
  editor :{
    fieldsets:[
      {legend:'', help:'', fields:['resourceName', 'description', 'pattern']},
      {legend:'', help:'', fields:['resourceType']}
    ]
  },

  //列表
  list   :{
    sortOrders :[
      {field:'updatedAt', dir:'desc'},
      {field:'resourceName'}
    ],
    populate   :[
      {
        path  :'resourceType',
        select:'_id resourceTypeName'
      }
    ],
    listPerPage:20,
    fields     :['resourceName', 'resourceType', 'description', 'pattern']
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