## vue-cli + es6 + axios项目踩坑

> 最近新做了一个项目，因为完全是另起炉灶，可以抛开历史问题，重新尝试新的思路与解决方案。也兢兢业业的踩坑俩月，把项目初版跑上线了。这一版主要是保证功能流程没问题，下一版会对开发流程、性能、错误监控等问题进行优化。截至目前记录的一些问题先抽空整理下。

如题，项目采用`vue-cli + es6 + axios`这三个作为基础跑起来的，依然是移动端，考虑兼容性 `安卓4.1 & ios7.1`，刚开始引入了jq，后续发现完全没必要，就引入了axios的ajax库，然后其他采用原生`JavaScript`及`ES6`进行开发，也没遇到什么大的问题。

####Axios

> github地址：[https://github.com/axios/axios](https://github.com/axios/axios)

在此之前一直用的JQ的`$.ajax`，引入axios后还是有一些不一样的坑要慢慢习惯。

* 请求参数

    axios中，`get`请求换个`post`请求携带参数的方式不一样，具体如下：

    ```javascript
        axios.get(url, {
                params: {
                    id: 123456
                }
            }).then(res => {})
        axios.post(url, {
                id: 123456
            }).then(res => {})
    ```
    解决方案是基于axios简单封了一个`fetch.js`，以简化、统一调用

* 返回值

    在jq的回调函数中，我们后端返回的数据直接放在参数中，我们可以直接取res来用，在axios中，回调函数的参数，包含了更多的信息：
    * `status:` 请求状态码
    * `statusText:` 请求状态描述
    * `headers:` 响应头相关信息
    * `config:` 请求的相关配置
    * `request:` 当次请求相关信息
    * `data:` 后端返回的数据
    也就是说，在axios的回调函数中，res.data和`$.ajax`回调函数的res是一致的，而大部分时间，我们只需要知道`res.data`而忽略更多信息，这一点在`fetch.js`中也有优化

* 两次请求

    两次请求出现在跨域的前提下，jq中解决跨域问题是通过`jsonp`的方式，而在浏览器的标准中，[预检请求](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Methods/OPTIONS)是更优雅的解决方案。简单说，就是在发生[跨越的非简单请求](http://www.ruanyifeng.com/blog/2016/04/cors.html)时，浏览器会先发送预检请求，同服务端确认是否允许接下来的正式请求，如果被允许，则再发送正式请求。

    因此我们可能发现我们只发送了一次post请求，但却抓到两次请求，别担心，这不是bug，是个feature。

* 跨域请求不带cookie

    跨域请求默认不发送Cookie和HTTP认证信息。如果要把Cookie发到服务器，一方面要服务器同意，指定Access-Control-Allow-Credentials字段：`Access-Control-Allow-Credentials: true`，另一方面，开发者在发起ajax请求时设置withCredentials为true，这一点也在`fetch.js`中做了处理。

    在这里，当我们的服务器设置`Access-Control-Allow-Credentials: true`时，会产生新的问题，在浏览器标准中，当服务器中设置`Access-Control-Allow-Credentials`为true时，`Access-Control-Allow-Origin`不能设置为`*`，而`Access-Control-Allow-Origin: *`是我们常用的解决跨域问题的设置。

    此问题的解决方案有两种，第一种方案是简单的设置一个白名单；另一种方案，如果之前设置`Access-Control-Allow-Origin: *`，此时可以在服务器配置文件进行设置：先获取发起跨域请求的源域，然后设置`Access-Control-Allow-Origin`的值为获取到的源域。当然这个设置可能在后端某些配置文件里，也可能直接在服务器配置文件设置。但思路大概相似。
    
> 上面这些问题参考[HTTP访问控制（CORS）](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Access_control_CORS)大抵都能找到合理解释。

####兼容性

* Promise

Promise兼容性一般，`vue-cli`脚手架中默认没有对Promise进行pollyfill，在目前的项目中，引用了[`es6-promise`](https://github.com/stefanpenner/es6-promise)进行兼容处理，大致也就是在不兼容的情况下自定义实现一个Promise

* Array.prototype.findIndex

这个属性在开发过程中多次用到，个人觉得很好用，但兼容性也堪忧，就在base.js中添加了pollyfill，pollyfill中还用到了`Object.defineProperty`，所以如果vue无法兼容的，这个pollyfill也无法兼容啦

* Input[type=date]

原生的日期选择组件用起来不管是在安卓上体验都很棒，但是安卓4.3及以下不识别，此处通过ua判断了系统版本，安卓4.3以下采用底部弹窗的方式让用户输入日期，牺牲一部分用户的体验。

* 开发及部署

这个相关的问题另起一篇吧，此次项目采用的是前端路由加多个单页应用，后端只提供接口及静态文件服务器，具体开发流程和部署：[vue-cli + es6 + axios项目开发及部署](chapter7/section2.html)。
