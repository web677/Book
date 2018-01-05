## server端代码组织与部署

服务器买的阿里云的ECS云服务器，安装的系统是Ubuntu14.04，部署了NodeJs v8.6.0。安装了Nginx v1.4.6、MongoDB v3.4.9、Redis v2.8.4、pm2 v2.7.1。

 - Nginx: 
 	- 对于简单静态站点的请求，Nginx充当一个http服务器的角色，如book.xxxx.com下的请求，都只是gitbook构建好的静态html页面，所以这时候Nginx就直接将主页指向到gitbook目录下的index.html
 
 	- 反向代理服务器：比如自动监听github的push提交，是通过github的webhook发出post请求到book.xxxx.com/webhook，Nginx指向到127.0.0.1:4001，然后通过nodejs启动一个简单的http服务器监听4001端口，解析post过来的数据，然后执行git更新、gitbook build及后续操作
 	
 	- 防火墙配置：`/etc/iptables.up.rules`，简单配置规则记录在[防火墙配置基础](../chapter3/section2.html)
 	
 	- 反向代理配置：`/etc/nginx/conf.d/`，简单配置规则记录在[Nginx配置基础](../chapter3/section1.html)

 - MongoDB
 
 选用MongoDB，因为在前端角度看，key-value的数据存储方式比较容易理解和清晰
 
  - 启动：`sudo mongod —config /etc/mongod.conf`，配置文件`/etc/mongod.conf`，默认fork

 - Redis
 
 Redis主要是为了做配合session存储用户的登录态，用了ioredis的库，很省心
 
 - pm2

 用于进程和服务的管理，比如blog.xxxx.com的主服务以及github的监听都是通过pm2管理。使用很简单（高级功能没用到）。
 
###服务端部署

基于Koa2开发框架及配套中间件，koa-router，koa-static，koa2-cros，koa-bodyparser，koa-session2。通过Nginx反向代理，对blog.xxxx.com下的请求指向到127.0.0.1:3000，然后通过`new koa()`启动web服务，监听3000端口。对不同的请求路径进行分发，到不同的action。

```javascript
koaRouter
    .use("/", IndexAction.routes(), IndexAction.allowedMethods())
    .use("/center", CenterAction.routes(), CenterAction.allowedMethods())
    .use("/finder", FinderAction.routes(), FinderAction.allowedMethods())
```
在action中对收到的请求再次分发

```javascript
koaRouter
    .get("/regist", CenterLoginRegist)
    .get("/ajaxregist", AjaxCenterRegist)
    .get("/login", CenterLoginRegist)
    .get("/ajaxlogin", AjaxCenterLogin)
    .get("/ajaxlogout", AjaxCenterLogout)
```
然后对应的请求调用对应的Model处理

```javascript
const AjaxCenterLogin = async (ctx) => {
    let result = await CenterLoginModel(ctx.query, ctx.host, ctx)
    ctx.response.body = result
}
```
这是一个基本的登录请求从服务端收到之后到返回的过程。

###代码结构

服务端采用MVC模式，M对应的是Model，进行逻辑和数据处理，V对应的是WebPack打包压缩好的前端静态单页面文件，C对应的是Action，进行请求的分发和调用Model处理。

 - Action: C层
 - Config: 代码依赖的配置，比如环境、连接MongoDB的URL/端口/db/账号密码
 - DB: 各个Model中的db相关操作
 - Model: M层
  - Common: 一些公用的Modle，比如验证、DB增删改查方法的封装、Redis存储Session方法封装等
  - Center/Finder/Index: 业务相关Model
 - static: 静态文件存放，比如js/css/images/fonts
 - View: V层，存放WebPack打包后的html文件
 - index.js: 服务的主入口，启动web服务，进行路由分发

 

