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

####观察者模式

Vue实现观察者模式主要通过三个类：Observer类、Watcher类、Dep类

* Observer：通过`defineProperty`给数据添加`get`和`set`方法并在`get`中收集依赖，在`set`中通知更新
* Watcher：观察数据变化（接收`Observer `的`set`发出的通知），执行回调
* Dep：一个可观察对象，收集订阅、发送通知

举例：

```javascript
var app = new Vue({
	el: '#J_app',
	data: {
		message: 'hello world'
	},
	mounted: function(){
		console.log(this.message)
	}
})

app.message = 'hellp vue'

console.log(`'app.message:' ${app.message}`)
```
例中：我们给`data`添加了`message`属性，然后，在数据初始化过程中：`Observer`通过`defineProperty`给`message`设置`get/set`属性，并在`get`中调用`Dep`的`depend`方法，将`message`添加为可观察对象，之后在`Watcher`中，对`message`进行求值，调用其`get`方法，同时将`Watcher`实例添加到可观察对象`message`的观察者数组里；同时，在`set`时，通过`Dep`的`notify`发布`message`更新的事件，通知调用观察者数组中的`update`方法。


在Vue中，上面流程中`Observer`负责的部分是通过`defineReactive$$1`实现的，可以简写如下：

```javascript
/*
*参数含义：
*obj: 需要添加属性的对象
*key: 要添加的属性名
*value: 要添加的属性名对应的值
*customSetter: 在非生产环境，一些自定义的错误警告
*shallow: 属性值是否添加到代理到vm上
*/
function defineReactive(obj, key, value, customSetter, shallow) {
   
    var property = Object.getOwnPropertyDescriptor(obj, key);
    if (property && property.configurable === false) {
        return
    }

    var getter = property && property.get;
    var setter = property && property.set;

    Object.defineProperty(obj, key, {
        enumerable: true,
        configurable: true,
        get: function () {
            var value = getter ? getter.call(obj) : val;

            //收集依赖  交由Dep类负责

            return value
        },
        set: function () {
            var value = getter ? getter.call(obj) : val;

            if (newVal === value || (newVal !== newVal && value !== value)) {
                return
            }

            //开发环境属性检查并警告
            if ("development" !== 'production' && customSetter) {
                customSetter();
            }

            if (setter) {
                setter.call(obj, newVal);
            } else {
                val = newVal;
            }

            observe(newVal);

            //发布更新消息
            dep.notify();
        }
    })

}
```
这里的代码相对好理解，`get`方法里的**收集依赖**其实也是一个曲折的过程。在watcher中，每添加一个新的watcher实例时，都会对相应的对象进行求值，也就是会主动触发一次`defineReactive `的`get`方法，然后就在`get`方法里进行依赖收集。同时，数据有变更时，也会触发`defineReactive `的`set`方法，然后在`set`方法里发布数据更新的消息`dep.notify()`，然后`dep.notify `里会对调相应的watcher进行`update`。

`Dep`类负责依赖收集和观察者存储，来看下`Dep`类的代码：

```javascript
/**
 * 每个Dep的实例都是一个可观察对象，可以被多个观察者订阅
*/

var uid = 0;

var Dep = function Dep () {
  this.id = uid++;
  this.subs = [];
};

Dep.prototype.addSub = function addSub (sub) {
  this.subs.push(sub);
};

Dep.prototype.removeSub = function removeSub (sub) {
  remove(this.subs, sub);
};

Dep.prototype.depend = function depend () {
  if (Dep.target) {
    Dep.target.addDep(this);
  }
};

Dep.prototype.notify = function notify () {
  // stabilize the subscriber list first
  var subs = this.subs.slice();
  for (var i = 0, l = subs.length; i < l; i++) {
    subs[i].update();
  }
};

// the current target watcher being evaluated.
// this is globally unique because there could be only one
// watcher being evaluated at any time.
Dep.target = null;
var targetStack = [];

function pushTarget (_target) {
  if (Dep.target) { targetStack.push(Dep.target); }
  Dep.target = _target;
}

function popTarget () {
  Dep.target = targetStack.pop();
}
```
初始每个可观察对象`dep`都有一个id和观察者数组（subs），可以对当前id的可观察对象：添加观察者（`addSub`）、移除观察者（`removeSub`）、设置为可观察对象（`depend`）、通知变更到观察者们（`notify`），添加和移除观察者相对简单，往数组`push`和`splice`即可；设置为可观察对象调用的是`Dep.target.addDep(this)`，`Dep.target`其实是`Watcher`的实例，下节再看；通知变更到观察者们只是执行了是观察者们的`update`方法，`update`方法也会在下节一起看下。
