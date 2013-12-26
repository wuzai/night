AbaloneWebServer
================

## 登陆/注册模块

* 用户注册
>* 请求方式 ： POST
>* 路由地址 ： /api/v1/signup
>* 请求接受类型 ： application/json
>* 请求实体 : {"username":"13912345678","password":"密码","captcha":"验证码"}
>* 返回代码JSON实体 : {"_id":"用户Id", "username":"13912345678","point":"用户贝客积分数量(即用户平台积分)"}
>* 返回值 :
           * 201 - 成功：允许注册
           * 400 - 错误：用户名和密码不能为空
           * 409 - 错误：该手机号码已经被注册

* 用户登录
>* 请求方式 ： POST
>* 路由地址 ： /api/v1/signin
>* 请求接受类型 ： application/json
>* 请求实体 : {"username":"13912345678","password":"密码"}
>* 返回代码JSON实体 : {"_id":"用户Id","userName":"13912345678","email":"用户邮箱","gender":"性别","brith":"生日","config":{"_id":"配置Id","pointLargessExplain":"平台积分赠送说明","lastUpdateTime":"最后更新时间"}}
>* 返回值 ：
          * 200 - 成功：登录成功
          * 400 - 错误：用户名和密码不能为空
          * 404 - 错误：用户不存在
          * 410 - 错误：密码错误

## 用户模块

* 获取相关用户
>* 请求方式 ： GET
>* 路由地址 ：/api/v1/users     //"userName":"用户昵称","email":"用户昵称","maxDistance":"距离","location":"经纬度以逗号相隔"
>* 请求接受类型 ： application/json
>* 请求实体 : {}
>* 返回代码JSON实体 : [{"_id":"用户Id","userName":"用户名称","faceIcon":"用户头像"}]
>* 返回值 ：
          * 200 - 成功
          * 400 - 请求的参数有问题

* 获取用户数据/同步用户信息
>* 请求方式 ： GET
>* 路由地址 ： /api/v1/users/:id
>* 请求接受类型 ： application/json
>* 请求实体 : {}
>* 返回代码JSON实体 : {"_id":"用户名Id","userName":"用户名","email":"用户邮箱","gender":"性别","brith":"生日"}
>* 返回值 ：
          * 200 - 成功
          * 400 - 请求的参数有问题
          * 404 - 错误：用户不存在

* 提交个人信息修改
>* 请求方式 ： PUT
>* 路由地址 ： /api/v1/users/:id
>* 请求接受类型 ： application/json
>* 请求实体 : {"username": "用户名","gender" : "性别","email":"邮箱","birth":"生日","faceIcon":"头像","qqNum":"qq号","location:"经纬度以逗号相隔","postImage":"相片url"}
>* 返回代码JSON实体 : {}
>* 返回值 ：
          * 200 - 成功
          * 400 - 请求的参数有问题
          * 401 - 用户未登录

* 提交修改密码
>* 请求方式 ： PUT
>* 路由地址 ： /api/v1/password/:id
>* 请求接受类型 ： application/json
>* 请求实体 : {"id":"用户Id","old_password":"旧密码","new_password":"新密码"}
>* 返回代码JSON实体 : {}
>* 返回值 ：
          * 200 - 成功
          * 400 - 请求的参数有问题
          * 404 - 错误：用户不存在
          * 410 - 错误：密码错误

* 删除用户
>* 请求方式 ： DELETE
>* 路由地址 ： /api/v1/users/:id
>* 请求接受类型 ： application/json
>* 请求实体 : {}
>* 返回代码JSON实体 : {}
>* 返回值 ：
          * 200 - 成功
          * 400 - 请求的参数有问题

* 忘记密码时,重置密码
>* 请求方式 ： PUT
>* 路由地址 ： /api/v1/resetPassword
>* 请求接受类型 ： application/json
>* 请求实体 : {"cellphone":"电话(用户名)","password":"新密码","captcha":"验证码"}
>* 返回代码JSON实体 : {"_id":"用户Id","userName":"13912345678","email":"用户邮箱","gender":"性别","brith":"生日"}
>* 返回值 ：
          * 200 - 成功
          * 400 - 电话号码/密码/验证码不能为空
          * 404 - 错误：用户不存在
          * 410 - 错误：验证码错误

* 重置密码时,获取验证码
>* 请求方式 ： GET
>* 路由地址 ： /api/v1/captchaRecord?cellphone="电话号码(用户名)"
>* 请求接受类型 ： application/json
>* 请求实体 : {}
>* 返回代码JSON实体 : {}
>* 返回值 ：
          * 200 - 成功
          * 400 - 手机号码不能为空
          * 404 - 用户不存在

* 推荐用户
>* 请求方式 ： POST
>* 路由地址 ： /api/v1/recommendUser
>* 请求接受类型 ： application/json
>* 请求实体 : {"telephone":"用户电话(用户电话)","recommend_id":"推荐人Id"}
>* 返回代码JSON实体 : {}
>* 返回值 ：
          * 200 - 成功
          * 400 - 错误：请求的参数有问题
          * 409 - 错误：用户已经注册该系统

## 商户模块

* 获取商户详情数据/同步商户信息
>* 请求方式 ： GET
>* 路由地址 ： /api/v1/merchants/:id
>* 请求接受类型 ： application/json
>* 请求实体 : {}
>* 返回代码JSON实体 : {"_id":"商户Id","merchantName":"商户名称","description":"描述信息","customerServicePhone":"客服电话",
"webSite":"商户网站","address":"商户地址","explain":"说明","intro":"简介","serviceItems":[{"_id":"服务项目Id",
"description":"描述信息","serviceItemName":"服务名称","logoImage":"服务logo图","posterImage":"服务海报图","ruleText":"服务规则",
"usableStores":"可用门店Id（用','隔开的字符串）"}],"comments":[{"_id":"评论Id","content":"评论内容","rating":"评论等级","commentType":"评论类型",
"commenterName":"评论人名称","createdAt":"创建时间"}]}
>* 返回值 ：
          * 200 - 成功
          * 400 - 请求的参数有问题
          * 404 - 错误：商户未找到

* 提交商户资料修改
>* 请求方式 ： PUT
>* 路由地址 ： /api/v1/merchants/:id
>* 请求接受类型 ： application/json
>* 请求实体 : {"merchantName":"商户名称","description":"描述信息","customerServicePhone":"客服电话",
"webSite":"商户网站","address":"商户地址","logo":"商户logo","explain":"说明","intro":"简介"}
>* 返回代码JSON实体 : {}
>* 返回值 ：
          * 200 - 成功
          * 400 - 请求的参数有问题
          * 404 - 错误：商户未找到

* 删除商户
>* 请求方式 ： DELETE
>* 路由地址 ： /api/v1/merchants/:id
>* 请求接受类型 ： application/json
>* 请求实体 : {}
>* 返回代码JSON实体 : {}
>* 返回值 ：
          * 200 - 成功
          * 400 - 请求的参数有问题

* 同步商户信息/获取商户列表数据
>* 请求方式 ： GET
>* 路由地址 ： /api/v1/merchants
>* 请求接受类型 ： application/json
>* 请求实体 : {}
>* 返回代码JSON实体 : [{"_id":"商户Id","merchantName":"商户名称","memberNum":"商户会员数","point":"商户平台积分","createdAt":"商户创建时间","state":"商户状态","logoUrl":"商户logo","rate":"商户的会员积分与平台积分的兑换率","rateExplain":"商户的会员积分与平台积分的兑换说明/规则","useExplain":"商户的会员积分的使用说明/规则","largessExplain":"商户的会员积分的赠送说明/规则",
"stores":[{"_id":"门店Id","storeName":"门店名称","description":"门店描述","telphone":"门店电话","address":"门店地址","slogan":"标语","vipImage":"门店图标","location":{"longitude":"经度","latitude","纬度","relevantText":"地理位置描述"}}]}]
>* 返回值 ：
          * 200 - 成功
          * 400 - 请求的参数有问题

* 商户推荐
>* 请求方式 ： POST
>* 路由地址 ： /api/v1/recommend
>* 请求接受类型 ： application/json
>* 请求实体 : {"merchantName":"商户名","telephone":"商户联系电话","recommend_id":"推荐人Id"}
>* 返回代码JSON实体 : {}
>* 返回值 ：
          * 200 - 成功
          * 400 - 错误：请求的参数有问题

## 服务模块

* 申领服务
>* 请求方式 ： POST
>* 路由地址 ： /api/v1/applicableServiceItem
>* 请求接受类型 ： application/json
>* 请求实体 : {"serviceItem_id":"服务项目Id","merchant_id":"商户Id","user_id":"用户Id"}
>* 返回代码JSON实体 : {"_id":"会员Id","point":"积分","amount":"余额","userId":"用户Id","merchantId":"商户Id","createdAt":"创建时间"}//会员信息
>* 返回值 ：
          * 201 - 成功：申领成功
          * 203 - 申领失败：会员积分不足等
          * 400 - 请求的参数有问题
          * 404 - 服务项目未找到

* 获取某一用户下的所有服务数据
>* 请求方式 ： GET
>* 路由地址 ： /api/v1/servicesOfUser?user_id="用户Id"
>* 请求接受类型 ： application/json
>* 请求实体 : {}
>* 返回代码JSON实体 : [{"_id":"用户Id","userName":"用户名(电话)",
"members":["memberId":"会员Id","merchantId":"商户Id","memberPoint":"会员积分",],
"memberCards":["_id":"会员卡id","memberCardName":"名称","description":"描述","promptIntro":"温馨提示","forbidden":"是否禁用(true是禁用)","iconImage":"卡图片","merchantId":"商户Id","usableStores":"可用门店Id（用','隔开的字符串）","allowLargess":"是否允许转赠","allowShare":"是否允许分享","submitState":"是否需要转借确认的(true需要)","ruleText":"服务规则"],
"coupons":["_id":"优惠劵id","couponName":"名称","description":"描述","promptIntro":"温馨提示","quantity":"优惠券数量","forbidden":"是否禁用(true是禁用)","iconImage":"劵图片","quantity":"优惠劵数量","point":"优惠劵积分","merchantId":"商户Id","usableStores":"可用门店Id（用','隔开的字符串）","allowLargess":"是否允许转赠","allowShare":"是否允许分享","submitState":"是否需要转借确认的(true需要)","ruleText":"服务规则"],
"meteringCards":["_id":"计次卡id","meteringCardName":"名称","description":"描述","promptIntro":"温馨提示","remainCount":"计次卡次数","forbidden":"是否禁用(true是禁用)","iconImage":"卡图片","vendingDate":"出售日期","validToDate":"有效日期","merchantId":"商户Id","usableStores":"可用门店Id（用','隔开的字符串）","allowLargess":"是否允许转赠","allowShare":"是否允许分享","submitState":"是否需要转借确认的(true需要)","ruleText":"服务规则"],
"memberServices":["_id":"会员服务id","memberServiceName":"会员服务名称","memberServiceType":"会员服务类型","memberServiceNumber":"会员服务次数/数量","description":"描述","promptIntro":"温馨提示","forbidden":"是否禁用(true是禁用)","iconImage":"卡图片","vendingDate":"出售日期","validToDate":"有效日期","merchantId":"商户Id","usableStores":"可用门店Id（用','隔开的字符串）","allowLargess":"是否允许转赠","allowShare":"是否允许分享","submitState":"是否需要转借确认的(true需要)","ruleText":"服务规则"]}]
>* 返回值 ：
          * 200 - 成功
          * 400 - 请求的参数有问题
          * 404 - 用户未找到

* 发出服务转赠申请
>* 请求方式 ： get
>* 路由地址 ： /api/v1/sendLargess?cellphone="接收人电话"&type="活动类型(MemberCard/Coupon/MeteringCard)"&activity_id="活动Id(会员卡Id/优惠券Id等)"&fromUser_id="当前用户Id(发送人)"&store_id="门店Id"
>* 请求接受类型 ： application/json
>* 请求实体 : {}
>* 返回代码JSON实体 : {"_id":"转赠记录Id","":"toUser":"接收人Id","processStatus":"转赠状态","createdAt":"转赠时间"}
>* 返回值 ：
          * 201 - 成功：服务转赠申请已发出，等待对方确认
          * 400 - 请求的参数有问题
          * 404 - 用户未找到/活动未找到
          * 409 - 不能转赠给自己

* 取消转赠请求
>* 请求方式 ： get
>* 路由地址 ： /api/v1/cancelLargess?largessRecord_id="转赠记录Id"&type="活动类型(MemberCard/Coupon/MeteringCard)"&activity_id="活动Id(会员卡Id/优惠券Id等)"&fromUser_id="当前用户Id(发送人)"
>* 请求接受类型 ： application/json
>* 请求实体 : {}
>* 返回代码JSON实体 : {}
>* 返回值 ：
          * 201 - 成功：服务转赠申请已取消
          * 400 - 请求的参数有问题
          * 404 - 服务项目未找到

* 拒接转赠请求
>* 请求方式 ： get
>* 路由地址 ： /api/v1/refuseLargess?largessRecord_id="转赠记录Id"&type="活动类型(MemberCard/Coupon/MeteringCard)"&activity_id="活动Id(会员卡Id/优惠券Id等)"&fromUser_id="发送服务的用户Id"
>* 请求接受类型 ： application/json
>* 请求实体 : {}
>* 返回代码JSON实体 : {"_id":"memberCardId/couponId/meteringCardId(活动Id)"}
>* 返回值 ：
          * 201 - 成功：拒接转赠请求已发出
          * 400 - 请求的参数有问题
          * 404 - 服务项目未找到

* 活动的使用（会员卡/优惠券/计次卡）
>* 请求方式 ： get
>* 路由地址 ： /api/v1/useServiceItem?type="活动类型(MemberCard/Coupon/MeteringCard)"&activity_id="活动Id(会员卡Id/优惠券Id等)"
>* 请求接受类型 ： application/json
>* 请求实体 : {}
>* 返回代码JSON实体 : {"code":"验证码"}
>* 返回值 ：
          * 201 - 成功
          * 203 - 验证不通过(活动仅会员可以参与/活动已经结束/活动未开始/活动已经使用等)
          * 400 - 请求的参数有问题
          * 404 - 活动未找到/服务项目未找到或数据错误

* 接受转赠请求
>* 请求方式 ： get
>* 路由地址 ： /api/v1/acceptLargess?largessRecord_id="转赠记录Id"&type="活动类型(MemberCard/Coupon/MeteringCard)"&activity_id="活动Id(会员卡Id/优惠券Id等)"&user_id="当前用户Id(接收人)"&fromUser_id="发送服务的用户Id"
>* 请求接受类型 ： application/json
>* 请求实体 : {}
>* 返回代码JSON实体 : {}
or{"_id":"会员卡id","memberCardName":"名称","description":"描述","promptIntro":"温馨提示","forbidden":"是否禁用(true是禁用)","iconImage":"卡图片","merchantId":"商户Id","allowLargess":"是否允许转赠","allowShare":"是否允许分享"}
or{"_id":"优惠劵id","couponName":"名称","description":"描述","promptIntro":"温馨提示","forbidden":"是否禁用(true是禁用)","iconImage":"劵图片","quantity":"优惠劵数量","point":"优惠劵积分","merchantId":"商户Id","allowLargess":"是否允许转赠","allowShare":"是否允许分享"}
or{"_id":"计次卡id","meteringCardName":"名称","description":"描述","promptIntro":"温馨提示","forbidden":"是否禁用(true是禁用)","iconImage":"卡图片","remainCount":"剩余次数","vendingDate":"出售日期","validToDate":"有效日期","merchantId":"商户Id","allowLargess":"是否允许转赠","allowShare":"是否允许分享"}
or{"_id":"会员服务id","memberServiceName":"名称","memberServiceType":"类型","memberServiceNumber":"会员服务次数/数量","description":"描述","promptIntro":"温馨提示","forbidden":"是否禁用(true是禁用)","iconImage":"卡图片","vendingDate":"出售日期","validToDate":"有效日期","merchantId":"商户Id","allowLargess":"是否允许转赠","allowShare":"是否允许分享"}
>* 返回值 ：
          * 201 - 成功：接受转赠请求已发出
          * 400 - 请求的参数有问题
          * 404 - 服务项目未找到

* 获取门店的可用服务
>* 请求方式 ： get
>* 路由地址 ： /api/v1/findServiceItemsOfStore?store_id="门店Id"
>* 请求接受类型 ： application/json
>* 请求实体 : {}
>* 返回代码JSON实体 : [{"_id":"服务项目Id","serviceItemType":"服务类型",
                       "description":"描述信息","serviceItemName":"服务名称","posterImage":"服务海报图","ruleText":"服务规则",
                       "usableStores":"可用门店Id（用','隔开的字符串）"}]
>* 返回值 ：
          * 201 - 成功
          * 404 - 门店未未找到

## 评论模块

* 对商户发表评论
>* 请求方式 ： POST
>* 路由地址 ： /api/v1/comments
>* 请求接受类型 ： application/json
>* 请求实体 : {"merchant_id":"商户Id","user_id":"用户Id","content":"评论内容","rating":"评论等级(Number类型)"}
>* 返回代码JSON实体 : {"_id":"评论Id"}//评论信息
>* 返回值 ：
          * 201 - 成功：评论成功
          * 400 - 请求的参数有问题

* 获取某一商户下评论列表数据
>* 请求方式 ： GET
>* 路由地址 ： /api/v1/comments?merchant_id="商户Id"
>* 请求接受类型 ： application/json
>* 请求实体 : {}
>* 返回代码JSON实体 : [{"_id":"评论Id","content":"评论内容","rating":"评论等级","commentType":"评论类型","commenterName":"评论人名称","createdAt":"创建时间"}]
>* 返回值 ：
          * 200 - 成功
          * 400 - 请求的参数有问题

## 广告模块

* 获取广告列表数据
>* 请求方式 ： GET
>* 路由地址 ： /api/v1/advertisements
>* 请求接受类型 ： application/json
>* 请求实体 : {}
>* 返回代码JSON实体 : [{"_id":"广告Id","title":"广告标题","content":"广告内容","merchantId":"商户Id",
"showFromDate":"首页展示开始日期","showToDate":"首页展示结束日期","fromDate":"二级页面展示开始日期","toDate":"二级页面展示结束日期",
"postImage":"海报图片",
"serviceItem":{"_id":"服务项目Id","description":"描述信息","serviceItemName":"服务名称",
"logoImage":"服务logo图","posterImage":"服务海报图","usableStores":"可用门店Id（用','隔开的字符串）"}}]
>* 返回值 ：
          * 200 - 成功
          * 400 - 请求的参数有问题

* 获取门店的广告列表
>* 请求方式 ： GET
>* 路由地址 ： /api/v1/findAdvertisementOfMerchant?merchant_id="商户Id"&store_id="门店Id"
>* 请求接受类型 ： application/json
>* 请求实体 : {}
>* 返回代码JSON实体 : [{"_id":"广告Id","title":"广告标题","content":"广告内容","merchantId":"商户Id",
"showFromDate":"首页展示开始日期","showToDate":"首页展示结束日期","fromDate":"二级页面展示开始日期","toDate":"二级页面展示结束日期",
"postImage":"海报图片",
"serviceItem":{"_id":"服务项目Id","description":"描述信息","serviceItemName":"服务名称",
"logoImage":"服务logo图","posterImage":"服务海报图","usableStores":"可用门店Id（用','隔开的字符串）"}}]
>* 返回值 ：
          * 200 - 成功
          * 400 - 请求的参数有问题

## 消息记录模块

* 发送消息
>* 请求方式 ： post
>* 路由地址 ： /api/v1/sendMessage
>* 请求接受类型 ： application/json
>* 请求实体 : {"owner":"消息撰写人用户Id" , "content":"消息内容","toUserId":"收件人用户Id"}
>* 返回代码JSON实体 : {}
>* 返回值 ：
          * 200 - 成功
          * 400 - 请求的参数有问题
	        * 401 - 保存出错

* 获取某一用户下的消息列表数据
>* 请求方式 ： GET
>* 路由地址 ： /api/v1/sendMessageRecords?user_id="用户Id"&timestamp="时间戳"
>* 请求接受类型 ： application/json
>* 请求实体 : {}
>* 返回代码JSON实体 : [{"_id":"发送消息记录Id","content":"消息内容",
"toUserId":"收信人Id","sentTime":"发送时间","owner":"消息发送的用户id","hasRead":"消息是否查看"}]
>* 返回值 ：
          * 200 - 成功
          * 400 - 请求的参数有问题

* 用户查看消息
>* 请求方式 ： post
>* 路由地址 ： /api/v1/readMessage
>* 请求接受类型 ： application/json
>* 请求实体 : {"MessageSendRecordId":"消息记录id" }
>* 返回代码JSON实体 : {}
>* 返回值 ：
          * 200 - 成功
          * 400 - 请求的参数有问题
	        * 401 - 保存出错

* 清空某一用户下的消息数据
>* 请求方式 ： GET
>* 路由地址 ： /api/v1/deleteAllSendMessageRecords
>* 请求接受类型 ： application/json
>* 请求实体 : {"user_id":"用户Id"}
>* 返回代码JSON实体 : {}
>* 返回值 ：
          * 200 - 成功
          * 400 - 请求的参数有问题

* 删除某一条消息数据
>* 请求方式 ： GET
>* 路由地址 ： /api/v1/deleteSendMessageRecords
>* 请求接受类型 ： application/json
>* 请求实体 : {"sendMessageRecord_id":"消息记录Id"}
>* 返回代码JSON实体 : {}
>* 返回值 ：
          * 200 - 成功
          * 400 - 请求的参数有问题

## 平台积分模块

* 获取用户平台积分的历史记录(已合并)
>* 请求方式 ： GET
>* 路由地址 ： /api/v1/userPointRecords?user_id="用户Id"
>* 请求接受类型 ： application/json
>* 请求实体 : {}
>* 返回代码JSON实体 : [{"_id":"积分记录Id","transactionType":"积分交易类型","addPoint":"积分增加量",
"decPoint":"积分减少量","surplusPoint":"余额(交易结束剩余积分)","createdAt":"积分交易时间"}]
>* 返回值 ：
          * 200 - 成功
          * 400 - 请求的参数有问题
          * 404 - 积分记录未找到，可能是数据错误

* 获取商户平台积分的历史记录(已合并)
>* 请求方式 ： GET
>* 路由地址 ： /api/v1/merchantPointRecords?merchant_id="商户Id"
>* 请求接受类型 ： application/json
>* 请求实体 : {}
>* 返回代码JSON实体 : [{"_id":"积分记录Id","transactionType":"积分交易类型","addPoint":"积分增加量",
"decPoint":"积分减少量","surplusPoint":"余额(交易结束剩余积分)","operater":"操作人","storeId":"交易发生的门店Id","createdAt":"积分交易时间"}]
>* 返回值 ：
          * 200 - 成功
          * 400 - 请求的参数有问题
          * 404 - 积分记录未找到，可能是数据错误

* 获取会员积分记录(已合并)
>* 请求方式 ： GET
>* 路由地址 ： /api/v1/memberPointRecords?user_id="用户Id"&merchant_id="商户Id"
>* 请求接受类型 ： application/json
>* 请求实体 : {}
>* 返回代码JSON实体 : [{"_id":"积分记录Id","userId":"会员对应用户Id","merchantId":"会员对应商户Id","transactionType":"积分交易类型","addPoint":"积分增加量",
"decPoint":"积分减少量","surplusPoint":"余额(交易结束剩余积分)","operater":"操作人","storeId":"交易发生的门店Id","createdAt":"积分交易时间"}]
>* 返回值 ：
          * 200 - 成功
          * 400 - 请求的参数有问题
          * 404 - 会员未找到/积分记录未找到，可能是数据错误

* 获取积分记录
>* 请求方式 ： GET
>* 路由地址 ： /api/v1/pointRecords?type="记录类型('user','merchant','member')"&user_id="用户Id"&merchant_id="商户Id"
>* 请求接受类型 ： application/json
>* 请求实体 : {}
>* 返回代码JSON实体 : [{"_id":"积分记录Id","type":"记录类型('user','merchant','member')","userId":"会员对应用户Id","merchantId":"会员对应商户Id","transactionType":"积分交易类型","addPoint":"积分增加量",
"decPoint":"积分减少量","surplusPoint":"余额(交易结束剩余积分)","createdAt":"积分交易时间"}]
>* 返回值 ：
          * 200 - 成功
          * 400 - 请求的参数有问题
          * 404 - 会员未找到/积分记录未找到，可能是数据错误

* 用户积分转赠
>* 请求方式 ： POST
>* 路由地址 ： /api/v1/userPointToUser
>* 请求接受类型 ： application/json
>* 请求实体 : {"fromUser_id":"转赠人Id","toUserName":"接收人名称","point":"转赠积分数"}
>* 返回代码JSON实体 : {}
>* 返回值 ：
          * 200 - 成功
          * 400 - 请求的参数有问题
          * 403 - 转赠失败
          * 404 - 会员未找到/积分记录未找到，可能是数据错误

* 会员积分转赠
>* 请求方式 ： POST
>* 路由地址 ： /api/v1/memberPointToMember
>* 请求接受类型 ： application/json
>* 请求实体 : {"fromMember_id":"转赠人Id","toUserName":"接收人名称","point":"转赠积分数"}
>* 返回代码JSON实体 : {}
>* 返回值 ：
          * 200 - 成功
          * 400 - 请求的参数有问题
          * 403 - 转赠失败
          * 404 - 会员未找到/积分记录未找到，可能是数据错误

* 会员积分兑换
>* 请求方式 ： POST
>* 路由地址 ： /api/v1/memberPointToUser
>* 请求接受类型 ： application/json
>* 请求实体 : {"member_id":"会员Id","point":"要兑换的平台用户积分数"}
>* 返回代码JSON实体 : {}
>* 返回值 ：
          * 200 - 成功
          * 400 - 请求的参数有问题
          * 403 - 转赠失败
          * 404 - 会员未找到/积分记录未找到，可能是数据错误

## 获取配置信息

* 获取平台积分规则(配置中获取)
>* 请求方式 ： GET
>* 路由地址 ： /api/v1/regulation?timestamp="时间戳"
>* 请求接受类型 ： application/json
>* 请求实体 : {}
>* 返回代码JSON实体 : {"rules":"规则(包含换行符)","pictures":["图片uri"]}
>* 返回值 ：
          * 200 - 成功
