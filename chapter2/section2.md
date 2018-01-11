#### Vue之Data监听与更新

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

