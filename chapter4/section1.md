## 前端代码组织与部署


前端代码组织和部署主要涉及到了：Vue2 + Vue-Router + Axios + ElementUI + WebPack。
	
	Vue： 负责页面组件（components）的实现，包括DOM、Style和事件的处理；
	Vue-Router： 因为纯前端页面开发时，采用的是同一入口的单页面应用，Vue-router负责页面之间路由；
	Axios： 是一个Vue版本的Ajax库；
	ElementUI： 引入是因为一些表格、弹层、loading等可以很方便的直接import然后使用；
	WebPack： 代码构建、打包，更多功能如代码检查、单元测试没有用到。
	
* 代码组织结构

	* build: 主要存放构建相关配置文件，没有复杂需求，所以主要改动了其中的`webpack.base.conf.js`和`webpack.dev.conf.js`及`webpack.prod.conf.js`，主要配置构建时生成的文件名、路径、模块、模板等
	* config: 主要存放代码依赖的相关配置，比如环境、模块路径、模块名等
	* src: 主要代码
		* components: 小组件，比如一个标准的form，比如公用的header，比如前端格式验证的js
		* entry: 开发环境是单页应用，所以是单一入口，生产环境是多个单页应用，所以有多个入口，都在entry下配置
		* page: 页面代码，引入组件组成页面，页面本身逻辑，引入样式等
		* routes: 开发环境只有一个dev-router.js，生产环境多个路由，每个单页对应一个路由，通过服务端路由分发到前面的entry通过前端router到page
		* App.vue: 入口文件
	* static: 静态文件
		* css
		* images
	* package.json: 管理项目基本信息
	
事实上，上述文件都不会在生产环境实际使用。常规情况下，会有一个dist目录，存放构建后的代码，因为在这里我是前后端一起写，所以直接打包构建后放在server下，也就是服务端目录下。实际在生产环境使用的是打包后的js文件，每个单页应用实际是一个html模板+js文件，通过url访问页面时，server端直接读取html然后返回给前台。

* 数据传递

因为就是练手页面，数据很简单，采用的是Event Bus的方式进行同一单页应用，不同页面间的数据传递和通信

贴几个文件的代码
	
* 入口文件App.vue

```vue
<!-- template -->
<template>
    <router-view
        class="view"
        keep-alive
        transition
        transition-mode="out-in"
    >
    </router-view>
</template>

<!-- script -->
<script>
export default {
    components: {}
}
</script>

<!-- style -->
<style>
    @import "../static/css/base.css"
</style>

```

* 开发环境主路由routes/dev-router.js

```javascript
import Vue from 'vue'
import Router from 'vue-router'
import index from '../page/index.vue'
import finder from '../page/finder.vue'
import login from '../page/login.vue'
import regist from '../page/regist.vue'
import center from '../page/center.vue'

Vue.use(Router)

export default [
    {
        path: '/',
        component: index
    },{
        path: '/index',
        component: index
    }, {
        path: '/finder',
        component: finder
    },
    {
        path: '/center/',
        component: center
    },{
        path: '/center/index',
        component: center
    },{
        path: '/center/login',
        component: login,
    },{
        path: '/center/regist',
        component: regist,
    }
  ]
```

* 登录注册公用表单components/Center-form.vue

```vue
<template>
    <form class="base-form login-form" action="javascript:;" autocomplete="off">
        <h3 class="base-title">{{formData.title}}</h3>
        <input class="base-input" type="text" placeholder="请输入用户名" maxlength="20" v-model="username">
        <input class="base-input" type="password" placeholder="请输入密码" maxlength="20" v-model="password">
        <input v-if="type !== 'login'" class="base-input" type="password" placeholder="请再次输入密码" maxlength="20" v-model="repassword">
        <div class="link-box flex">
            <router-link v-if="type === 'login'" class="base-link flex-1" to="/center/regist">忘记密码</router-link>
            <router-link class="base-link flex-1" :to="formData.backLink">{{formData.backName}}</router-link>
        </div>
        <button class="base-btn" @click="submit">{{formData.btnName}}</button>
    </form>
</template>

<script>
    import Vue from 'vue'
    import { Message } from 'element-ui'
    import { InputValidation } from './InputValidate.js'

    export default {
        data () {
            return {
                username: "",
                password: "",
                repassword: "",
                postData: {}
            }
        },
        props: {
            type: {
                type: String,
                required: true,
                default: "login"
            }
        },
        computed: {
            formData(){
                return this.type == "login" 
                ? {
                    title: "Login",
                    backName: "注册",
                    backLink: "/center/regist",
                    btnName: "登录"
                } : {
                    title: "Regist",
                    backName: "登录",
                    backLink: "/center/login",
                    btnName: "注册"
                }
            }
        },
        methods: {
            submit (){

                if(!this.username){
                    Message.error("请输入用户名！")
                    return
                }

                if(!InputValidation.isName(this.username)){
                    Message.error("用户名请输入汉字或英文字母！")
                    return
                }

                if(!this.password){
                    Message.error("请输入密码！")
                    return
                }

                if(!InputValidation.isPwd(this.password)){
                    Message.error("密码请输入6-12位数字英文字母或下划线！")
                    return
                }

                if(this.type != "login" && this.password != this.repassword){
                    Message.error("两次密码不一致！")
                    return
                }

                this.postData = {
                    username: this.username,
                    password: this.password
                }

                if(this.type == "regist"){
                    this.postData.repassword = this.repassword
                }

                this.$parent.Bus.$emit('submit', this.postData)
            }
        }
    }
</script>

<style>
    @import "../../static/css/base.css"
</style>
<style scoped>

    body{
        background: url(../../static/images/login-bg.png) center center no-repeat;
        background-size: 800px;
    }

    .link-box{
        width: 80%;
        margin: -10px auto 10px;
    }

    .link-box .base-link:last-child{text-align: right;}


</style>
```

* 注册页面page/regist.vue

```vue
<template>
    <div>
        <common-header
            tab="user"
        />
        <center-form 
            type="regist"
        />
    </div>

</template>

<script>
import Vue from "Vue"
import { Message } from 'element-ui'
import Header from "../components/Common-header.vue"
import Form from "../components/Center-form.vue"
import axios from "axios"

const registUrl = "//" + window.location.host + "/center/ajaxregist";
// const registUrl = "http://ac-onsg2j7w.clouddn.com/8fe6ec917ee31aee0843.json"

    export default {
        data () {
            return {
                Bus: new Vue()
            }
        },
        components: {
            "common-header": Header,
            "center-form" : Form
        },

        computed: {
            
        },
        methods: {
            
        },
        created () {
            document.title = "注册"
            this.Bus.$on("submit", function(params){
               axios.get(registUrl,{params: params})
                    .then(response => {
                        const res = response.data
                        if(res.status == 1){
                            Message.success("注册成功")
                            setTimeout(() => {
                                window.location.href = res.data.go
                            }, 1500);
                        }else{
                            Message.error(res.info)
                        }
                    })
            })
        }
    }
</script>

<style>
    @import "../../static/css/login.css"
</style>
```


