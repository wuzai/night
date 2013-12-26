var webRoot_href = '/spring';
var webRoot = 'http://211.151.134.11' + webRoot_href;
var webRoot_pathwehere = '/wehere';
var webRoot_pathadmin = '/wehere/admin';
var webRoot_wehere = webRoot_href + webRoot_pathwehere;
var webRoot_admin = webRoot_href + webRoot_pathadmin;
var webRoot_pathapp = '/weixinapp';
var webRoot_weixinapp = webRoot_href + webRoot_pathapp;
var imageRoot = '/fileServer/showImages?fileUrl=';
exports = module.exports = {
  server_setting:{
    name    :'AbaloneWebServer', //server name
    port    :4000,
    ssl_port:3333,
    v_r     :[
      {
        prefix:'/api',
        ver   :'/v1',
        routes:__dirname + '/routes/api-routes-v1'
      }
    ]    //version-route map
  },

  app_setting             :{
    key_length    :20,
    hash_algorithm:'sha256'
  },

  // routes (RegExp) exclude to authorize.
  exclude_authority_routes:[
    /^\/api\/v1\/dev\/(.*)/                            //development test.
  ],

  db:'mongodb://' + (process.env.DB_HOST || 'localhost') + '/spring',

  log_setting      :[
    {
      level :'info',
      stream:process.stdout
    },
    {
      level:'error',
      path :'error.log'
    }
  ],
  fileServer_dir   :__dirname + '/fileServer/',
  tmp_dir          :__dirname + '/tmp/',
  webRoot          :webRoot, //web服务根目录路径
  webRoot_href      :webRoot_href, //系统文件目录路径
  webRoot_wehere    :webRoot_wehere, //商户端目录路径
  webRoot_admin    :webRoot_admin, //商户端管理目录路径
  webRoot_pathwehere:webRoot_pathwehere, //商户端目录路径
  webRoot_weixinapp :webRoot_weixinapp, //微信端目录路径
  webRoot_pathapp   :webRoot_pathapp, //系统相对目录路径
  imageRoot         :imageRoot, //图片服务获取路由
  imageUpload_width:300, //图片上传宽度
  TOKEN_weixin     :'5zzgapp', //微信手机端的token
  systemDefault    :{
    userFace:'/default/images/default-userFace.png', //默认用户头像
    image   :'/default/images/default-image.png'  //默认图片
  }, //系统默认参数
  //系统参数配置
  systemParams     :{
    //贝客汇系统信息图标
    iconUri         :'/default/images/5zzg_logo.png',
    msgInfo         :'【贝客汇系统信息】',
    userType        :'普通用户', //普通用户，中级用户，高级用户
    userTypeDesc    :'普通用户',
    merchantType    :'普通商户',
    merchantTypeDesc:'普通商户',
    //注册配置
    register        :{
      //注册消息标题
      title  :'欢迎使用贝客汇',
      //注册消息内容
      content:'恭喜您注册贝客汇会员成功，系统奖励您%s贝客积分！【贝客汇系统信息】',
      //注册奖励贝客积分
      point  :200
    },
    updateUser      :{
      //用户首次修改资料 消息标题
      title  :'欢迎使用贝客汇',
      //用户首次修改资料消息内容
      content:'您好,您首次完善个人资料，系统奖励您%s贝客积分！【贝客汇系统信息】',
      //用户首次修改资料奖励贝客积分
      point  :20
    },
    login           :{
      //登录成功消息标题
      title  :'欢迎使用贝客汇',
      //登录成功消息内容
      content:'您好，您成功登录系统,系统赠送您%s贝客积分！【贝客汇系统信息】',
      //登录成功系统赠送贝客积分
      point  :1, //默认
      pointA :3, //A类用户
      pointB :2, //B类用户
      pointC :1 //C类用户
    },
    checkIn         :{
      //用户签到消息标题
      title  :'欢迎使用海贝壳',
      //用户签到消息内容
      content:'您好，您成功登录系统,系统赠送您%s贝客积分！【贝客汇系统信息】',
      //用户签到系统赠送贝客积分
      point  :1, //默认
      pointA :3, //A类用户
      pointB :2, //B类用户
      pointC :1 //C类用户
    },
    captchaLength   :4, //重置密码时获取的验证码长度
    randomCodeLength:4, //使用卡/券时产生随机验证码长度
    //平台积分规则
    regulation      :{
      text      :'【积分规则】\n' +
          '1：贝客汇平台积分（简称"贝客积分"），是贝客汇全新推出的线上线下日常消费通用积分，贝客积分覆盖业务面广，积分价值高，积分使用途径多元！\n' +
          '2：1积分＝1元钱，可通过商户提供的服务或平台提供的服务获取\n' +
          '3：贝客积分当钱花，可直接抵扣现金，不限服务，商品和额度，自由支付积分，会员还可利用贝客积分兑换商户提供的服务项目，如体验券，折扣券等\n' +
          '4：贝客积分可以转赠使用，会员间可互转。\n' +
          '5：参与商户活动或贝客汇活动均可获取贝客积分，视具体活动规则。\n' +
          '6：当商户提供的服务可用商户积分进行兑换，但会员积分不足时，贝客积分可自动兑换成商户积分参与兑换，兑换额度为补齐申请兑换所需的不足部分。\n' +
          '7：贝客汇享有贝客积分最终解释权。',
      pictureUrl:['/sys/web/images/rule1.png',
        '/sys/web/images/rule2.png',
        '/sys/web/images/rule3.png']
    }
  },

  merchantIds:{
    XSJ:'524145faaf77716a70000008',//希斯杰
    BKH:'52578e80797e3d9664000008'//贝客汇
  },

  XSJ:{
    minMemberPoint:3000//申领服务最少需要的积分数
  }

};
