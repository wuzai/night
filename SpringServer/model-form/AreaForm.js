var Area = require('../model/Area').Area;

/*
 * 行政辖区的编辑表单设置
 * */
exports.AreaForm = module.exports.AreaForm = {
  mongooseModel:Area,
  title        :'%areaName%', //表单标题
  subTitle     :'管理平台的行政辖区管理',
  plural       :'行政辖区', //复数形式的表单标题

  //字段编辑方式.
  schemaFields :{
    _id     :{display:'Id', placeholder:''},
    areaName:{display:'地区名称', placeholder:'地区名称', editorType:'text', help:'请输入地区名称'},
    path    :{display:'地区路径', placeholder:'地区路径', editorType:'text'},
    parent  :{display:'上级地区', placeholder:'上级地区', editorType:'refModel', refDisplayField:'areaName', linkUrlPrefix:'/admin/area/'}
  },

  choices:{
    parent:{
      kind   :'model',
      model  :Area,
      query  :{},
      fields :'_id areaName',
      options:{},
      key    :'_id',
      display:'areaName'
    }
  },

  //编辑器
  editor :{
    fieldsets:[
      {legend:'', help:'', fields:['areaName', 'path']},
      {legend:'', help:'', fields:['parent']}
    ]
  },

  //列表
  list   :{
    sortOrders :[
      {field:'updatedAt', dir:'desc'},
      {field:'areaName'}
    ],
    populate   :[
      {
        path  :'parent',
        select:'_id areaName'
      }
    ],
    listPerPage:20,
    fields     :['areaName', 'path', 'parent']
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