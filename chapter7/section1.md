## vue-cli + es6 多页面项目开发及部署

前端时间项目组计划快速开发一个新的App项目，App开发那边提供壳子和部分系统级功能，所有的页面由h5完成，考虑兼容性安卓4.1及ios7.1。全新的项目，没有历史包袱，就尝试了新的开发模式，采用了`webpack + vue-cli + vue-router + es6 + axios`这一套，从`webpack`配置到文件目录，从开发流程到上线部署，摸索尝试，到目前第一版已经上线。后面会继续优化，先把目前的基本部署方式记录下来。

    webpack -- ^3.6.0  |   vue -- ^2.5.2    | vue-router -- ^3.0.1  |    axios -- ^0.17.1

#### 简介

* 项目采用前后端分离，后端开发只负责提供接口及静态服务器
* 前端采用多个入口、多个单页（每个单页可能含vue-router路由到不同的子页面）的方式，最终在dist下生成多个`.html`及对应的`.js/.css`文件
* 域名根目录直接指向到`npm run build`之后生成的dist目录，可以通过`http://m.example.com/index.html`直接访问到`index.html`

最终生成的dist目录类似于：

- dist
    - index.html
    - center/
        - index.html
        - regist.html
        - login.html
    - static/
        - js/
            - vendor.[chunkhash].js
            - index.[chunkhash].js
            - regist.[chunkhash].js
            - login.[chunkhash].js
        - css/
            - index.[chunkhash].css
            - regist.[chunkhash].css
            - login.[chunkhash].css

例：`http://m.example.com/index.html`可以访问到首页，`http://m.example.com/center/regist.html`则访问到注册页，而`http://m.example.com/center/regist.html#agreement`访问到用户协议页

#### 目录结构

- dist: 如上，不跟随版本控制
- build: webpack构建相关配置
- config: 开发相关配置
    - webpack.user.conf.js: 新建的自定义配置文件，理论上对webpack的配置更改都在这里进行，然后对`webpack.dev.conf.js`和`webpack.dev.prod.js`进行merge覆盖
- node_modules: 插件及依赖，不跟随版本控制
- src: 开发目录
    - assets: 存放静态资源，含`base.js/base.css/plugins/images`
    - components: 一些可能公用的小组件
    - entry: webpack打包的入口文件，有多个`HtmlWebpackPlugin`的实例，每个实例都对应一个入口，每个入口打包出一个页面
    - router: 某些页面可能会用到`vue-router`实现前端路由，统一在此文件夹下定义，会被entry中的入口js引入使用
    - template: 存放`HtmlWebpackPlugin`打包基于的模板页，多个入口可以共用一个模板页。但实际开发中可能某些入口有私有的逻辑，需单独创建模板
    - page: 存放实际页面组件及组装页面
- package.json: 包信息及依赖

例：如果我们想最终生成`http://m.example.com/center/regist.html`且含有前端路由的话，需要涉及到的文件有：

```html
1. src/entry/regist.js，以创建入口文件，供`HtmlWebpackPlugin`使用
2. config/webpack.user.conf.js，新建入口，指定入口文件为`src/entry/regist.js`；新建`HtmlWebpackPlugin`实例，指定打包后生成的文件路径、文件名及js
3. src/router/regist.js，因为涉及到前端路由，需要配置路由信息
4. page/center/regist.vue、page/center/agreement.vue，进行页面自身逻辑样式的开发
```

#### webpack配置

默认的webpack配置大体是采用`build/webpack.base.js + build/webpack.dev.js/build/webpack.prod.js` merge后的结果，为了方便实现统一配置，在config写新建了`webpack.user.conf.js`，再分别和`build/webpack.dev.js/build/webpack.prod.js` merge，因此页面的配置，基本都在`webpack.user.conf.js`进行。

- 配置项
    - context: 设置在package.json所在的根目录
    - entry: 设置为`src/entry/`
    - ouput: 生产环境设置为`/src/dist/`，开发环境默认打包后放在内存中，不代表实际物理路径，output具体配置：
    ```javascript
    output: {
        path: path.resolve(__dirname, '../dist'),
        filename: 'static/js/[name].[chunkhash:16].js',
        chunkFilename: 'static/js/[id].[chunkhash:16].js',
        publicPath: '/pailifan/'
    }
    ```
    - plugins: 插件配置
        - HtmlWebpackPlugin: new多个实例，每个实例对应一个单页
        - CommonsChunkPlugin: 公共模块提取打包，默认指定将[vue.js -v2.5.2, vue-router.js -v3.0.1]打包，同时设置minChunks为Infinity以防止其他公用模块被打包进来
        ```javascript
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',         /*在entry中指定vendor对应的模块为[vue.js,vue-router.js]*/
            filename: 'static/js/vendor.[chunkhash:16].js',
            minChunks: Infinity
        })
        ```

#### 需求开发及部署流程

1. 拉取代码
2. 切换到package.json所在根目录，执行`npm i && npm run dev`
3. 新建页面（见目录结构部分的例）或者修改
4. 提交代码，忽略目录包括`src/dist`、`src/node_modules`
5. 内测/外测/灰度/生产，执行`npm i && npm run build`，生产环境不能直接操作dist目录（npm run build实际会先删除dist目录再生成，直接操作会导致发布时文件404），需先在发布机生成dist后覆盖到生产服务器对应的dist目录
6. 版本回退，回退代码，然后执行`npm i && npm run build`，同发布一致

#### 其他第三方插件和库

* [axios](https://github.com/axios/axios): ajax库，部分坑已经另一篇笔记中进行了解释及提出解决方案
* [vue-touch](https://github.com/vuejs/vue-touch/tree/next): 手势库
* [es6-promise](https://github.com/stefanpenner/es6-promise): 对Promise进行pollyfill 

> 附: [vue-cli + es6 + axios项目踩坑](../chapter7/section2.html)
