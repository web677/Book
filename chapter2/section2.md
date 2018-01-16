#### Vue之Data监听与更新

####[Object.defineProperty()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)

简单用法：

```javascript
<!--Object.defineProperty(obj, prop, descriptor)-->

var o = {
	a: 0
}

Object.defineProperty(o, 'b', {
	get: function () {
		console.log('get')
		return 'get'
	},
	set: function (value) {
		console.log(value)
	},
	configurable: true,
	enumerable: true
})
```
例中

* **`Object.defineProperty(o, 'b', {})`**表示给`o`添加一个叫`b`的属性
* **`get`**定义在读取`o.b`时执行的方法，`get`方法的执行结果为`o.b`的值
* **`set`**定义在给`o.b`设置值时执行的方法
* **`configurable`**表示`o.b`是否可变及可被删除
* **`enumerable`**表示`o`的`b`属性是否可以通过`for-in`遍历获取到

简单说，我们可以通过`Object.defineProperty`给一个对象添加一个属性，并且这个属性的值在被查询和被改变时都可以触发我们事先定义好的事件。

在Vue中，`Object.defineProperty`是对数据追踪核心也是依赖的这个方法。为对象添加属性的方法`defineReactive$$1`可以简写下：

```javascript
/*
*参数含义：
*obj: 需要添加属性的对象
*key: 要添加的属性名
*value: 要添加的属性名对应的值
*customSetter: 在非生产环境，一些自定义的错误警告
* shallow: 属性值是否添加到挂载到vm上
*/

```















```javascript
<!--html-->
<div id="J_app"></div>

<!-- script-->
var app = new Vue({
	el: '#J_app',
	data: {
		message: 'hello world'
	},
	mounted: function(){
		this.message = 'hello vue'
	}
})
```
上面是最基本的一个Vue的demo，这里对data的基础操作如下：

 * data初始化：data会被挂载到Vue实例app上，也因此我们可以通过`app.message`访问到`message`的值
 * 监听data：这一步也发生在data初始化时，核心是通过`Object.defineProperty`，给data中每一项添加`getter`和`setter`方法，，data发生变化时，setter方法被调用，同时调用`notify()`方法发布通知

