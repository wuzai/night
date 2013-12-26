var config = require('./config');
var webRoot_wehere = config.webRoot_wehere;

exports.menuConfig = module.exports.menuConfig = {
  uriPrefix :[webRoot_wehere, ''].join(''),
  appModules:[
    {
      name       :'工作面板',
      description:'用户当前的常用任务列表',
      uriRoute   :'/admin/dashboard',
      iconCode   :'icon-dashboard',
      menus      :[]
    },
    {
      name       :'商户管理',
      description:'在平台中注册的商户',
      uriRoute   :'/merchant/merchantControlList',
      iconCode   :'icon-leaf',
      menus      :[]
    },
    {
      name       :'新闻资讯',
      description:'发布热点新闻与时尚新闻',
      uriRoute   :'/newsInfo',
      iconCode   :'icon-book',
      menus      :[
        {
          name       :'热点新闻',
          description:'热点新闻信息',
          uriRoute   :'/hotNewsList',
          iconCode   :'icon-fire'
        },
        {
          name       :'时尚新闻',
          description:'时尚新闻信息',
          uriRoute   :'/fashionNewsList',
          iconCode   :'icon-globe'
        }
      ]
    },
    {
      name       :'服务指南',
      description:'商户在这里发布产品信息',
      uriRoute   :'/club',
      iconCode   :'icon-fire',
      menus      :[
        {
          name       :'产品类型管理',
          description:'商户的产品类型信息',
          uriRoute   :'/clubProductTypeList',
          iconCode   :'icon-tasks'
        }
      ]
    },
    {
      name       :'消息管理',
      description:'用户当前的常用任务列表',
      uriRoute   :'/message',
      iconCode   :'icon-signal',
      menus      :[
        {
          name       :'帖子管理',
          description:'查看用户发布的主题回复',
          uriRoute   :'/bulletinList',
          iconCode   :'icon-tags',
          menus      :[]
        },
        {
          name       :'评论管理',
          description:'管理用户发布的评论、留言',
          uriRoute   :'/commentControlList',
          iconCode   :'icon-comments-alt',
          menus      :[]
        }
      ]
    }

  ]
};