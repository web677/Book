## Vue原理简析

本篇笔记先简析Vue大致流程，细节实现在后续再慢慢研究。

Vue的三个关键词：MVVM、渐进式、响应式

####MVVM

Model、View、ViewModel。其中Model和ViewModel互相映射，View和ViewModel互相绑定，其中ViewMode是核心，但这一块由Vue包揽了，大部分时间我们只关心Model就够了。

####渐进式

渐进式框架，我的理解通俗一点讲：

 * 你可以在任何阶段使用Vue。页面上的一个弹窗 => 某个单页面 => 复杂的页面应用 => 复杂的一套web解决方案
 * 你不必各个层都使用Vue，仅需要View层？可以，自己写好VM即可
 * 核心库相对简单，更多的路由/ajax/数据流管理，在需要的时候可以自己引用。但不引用时，也可以高效的运行。

####响应式

> [深入响应式原理](https://cn.vuejs.org/v2/guide/reactivity.html)

<img src="../vue-data.png">

Vue中从数据到视图，可以简化流程为：Data处理及更新Notify、观察者绑定及Update、VisualDOM&Render。

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
上面是最基本的一个Vue的demo，从这里开始简要分析一下Vue的整个处理流程。

* data：
 * data初始化：data会被挂载到Vue实例app上，也因此我们可以通过`app.message`访问到`message`的值
 * 监听data：这一步也发生在data初始化时，核心是通过`Object.defineProperty`，给data中每一项添加`getter`和`setter`方法，，data发生变化时，setter方法被调用，同时调用`notify()`方法发布通知

