var config = require('./config');
var webRoot_wehere = config.webRoot_wehere;
exports.menuConfig = module.exports.menuConfig = {
  uriPrefix :webRoot_wehere,
  appModules:[
    {
      name       :'工作面板',
      description:'用户当前的常用任务列表',
      uriRoute   :'/dashboard',
      iconCode   :'icon-dashboard',
      menus      :[]
    },
    {
      name       :'商户管理',
      description:'在平台中注册的商户',
      uriRoute   :'/merchant',
      iconCode   :'icon-leaf',
      menus      :[
        {
          name       :'商户注册',
          description:'用户注册商户信息',
          uriRoute   :'/signUp',
          iconCode   :'icon-rocket'
        },
        {
          name       :'商户',
          description:'商户信息',
          uriRoute   :'/info',
          iconCode   :'icon-bookmark'
        }
//        {
//          name       :'门店',
//          description:'商户的门店信息',
//          uriRoute   :'/storeList',
//          iconCode   :'icon-laptop'
//        },
//        {
//          name       :'会员',
//          description:'商户的会员',
//          uriRoute   :'/memberList',
//          iconCode   :'icon-user-md'
//        }
//        {
//          name       :'商务会所',//商户联盟
//          description:'建立商户与商户之间的联盟',
//          uriRoute   :'/merchantUnion',
//          iconCode   :'icon-sitemap',
//          islockOut   : true
//        },
//        {
//          name       :'资源供需',
//          description:'客户之间的信息交流',
//          uriRoute   :'/supplyDemandList',
//          iconCode   :'icon-shopping-cart',
//          islockOut   : true
//        }
      ]
    },
    {
      name       :'服务指南',
      description:'商户在这里发布产品信息',
      uriRoute   :'/club',
      iconCode   :'icon-fire',
      menus      :[
        {
          name       :'产品管理',
          description:'商户的产品信息',
          uriRoute   :'/clubProductList',
          iconCode   :'icon-rss'
        }
//        {
//          name       :'商户销售记录',
//          description:'商户的服务销售情况',
//          uriRoute   :'/sellRecordList',
//          iconCode   :'icon-book'
//        }
      ]
    },
//    {
//      name       :'服务审核',
//      description:'商户对用户的服务信息操作审核',
//      uriRoute   :'/serviceAudit',
//      iconCode   :'icon-legal',
//      menus      :[
//        {
//          name       :'申领服务',
//          description:'用户申领商户的服务',
//          uriRoute   :'/serviceItemApply',
//          iconCode   :'icon-star'
//        },
//        {
//          name       :'使用服务',
//          description:'用户使用商户的服务',
//          uriRoute   :'/serviceItemUsed',
//          iconCode   :'icon-star-empty'
//        }
//      ]
//    },
//    {
//      name       :'积分管理',
//      description:'商户的积分管理',
//      uriRoute   :'/point',
//      iconCode   :'icon-tint',
//      menus      :[
//        {
//          name       :'会员充值服务',
//          description:'商户的服务销售情况',
//          uriRoute   :'/memberPointAdd',
//          iconCode   :'icon-money'
//        },
//        {
//          name       :'会员积分使用',
//          description:'会员到商户处使用积分',
//          uriRoute   :'/memberPointUsed',
//          iconCode   :'icon-arrow-down'
//        },
//        {
//          name       :'会员消费记录',
//          description:'会员的消费记录',
//          uriRoute   :'/consumeRecordList',
//          iconCode   :'icon-hdd'
//        }
//      ]
//    },
    {
      name       :'活动发布',
      description:'用户当前的常用任务列表',
      uriRoute   :'/advertisement',
      iconCode   :'icon-tags',
      menus      :[]
    },
    {
      name       :'消息管理',
      description:'用户当前的常用任务列表',
      uriRoute   :'/message',
      iconCode   :'icon-signal',
      menus      :[
//        {
//          name       :'商户消息',
//          description:'发送给商户的信息',
//          uriRoute   :'/messagesOfMerchant',
//          iconCode   :'icon-envelope'
//        },
//        {
//          name       :'发布消息',
//          description:'商户的服务销售情况',
//          uriRoute   :'/messageSend',
//          iconCode   :'icon-retweet'
//        }
        {
          name       :'用户评论',
          description:'查看用户的评论、留言',
          uriRoute   :'/commentList',
          iconCode   :'icon-comments-alt'
        }
      ]
    }
//    {
//      name       :'test',
//      description:'用户当前的常用任务列表',
//      uriRoute   :'/test',
//      iconCode   :'icon-dashboard',
//      menus      :[]
//    }
    //,
//    {
//      name       :'权限管理',
//      description:'消息、设置、图片的管理',
//      uriRoute   :'/others',
//      iconCode   :'icon-indent-right',
//      menus      :[
//        {
//          name       :'角色管理',
//          description:'消息的发送记录',
//          uriRoute   :'/message',
//          iconCode   :'icon-align-right'
//        },
//        {
//          name       :'员工管理',
//          description:'记录级的操作记录',
//          uriRoute   :'/log',
//          iconCode   :'icon-align-left'
//        }
//      ]
//    }
  ]
};