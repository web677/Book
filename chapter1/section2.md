## JavaScript基础之构造函数、原型、原型链那些

####普通对象和函数对象

JavaScript中一切都是对象，可以分为两种，普通对象和函数对象：

* 函数对象：通过 `new Function()` `var f = function()` `function f(){}`方式定义的，为函数对象

这里的`new Function()`中的[Function()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function)特指JS关键词，内置的Function对象，不包含其他内置或者自定义的构造函数。

```javascript
function f(){
	console.log(0)
}

var f1 = new f()
<!--这里的f1是函数对象f的实例，只是个普通对象而不是函数对象-->

var f2 = new Function("a," "b", console.log(a,b))
<!--这里的f2就是一个函数对象-->
```

* 普通对象：除了函数对象，其他的都是普通对象


####构造函数

区分构造函数的三个含义：

1. 构造函数：指的是一类函数，这种函数叫构造函数，理论上**函数对象**都可以作为构造函数，只要你用某个函数对象 `new` 出来一个函数实例，这个函数对象就是个构造函数，函数实例的constructor就是这个函数对象
2. constructor：指的是一个属性，对象（函数对象或者函数对象的实例）的一个属性，一个指针，指向自己的构造函数

```javascript
function f(){
	console.log(0)
}

var f1 = new f()
```
这个例子中，我们可以说，`f`是一个构造函数，也可以说`f`是`f1`的构造函数，也可以说`f1`的构造函数（属性）是`f`，也或者说`f1`的constructor是`f`。

`f`想作为一个构造函数（含义1），就必须先得是个**函数对象**；而一个对象的构造函数（含义2）属性，就没有要求，甚至可以是个数字字符串啥的。

####prototype

 - prototype就是一个属性，一个属性而已。只不过有点特殊，只有函数对象及函数对象的实例才配拥有。

 - 函数对象有默认的prototype属性，函数对象的实例没有默认prototype属性的。

 - 函数对象的prototype属性可以被其实例继承且被所有实例共享。


---

####一种更简单的理解方式

> [Javascript继承机制的设计思想](http://www.ruanyifeng.com/blog/2011/06/designing_ideas_of_inheritance_mechanism_in_javascript.html)

几句话搞定。

1. 类和实例。下例中，f是类（ES5中没有类的概念，但这里为方便理解，可以称之为类），f1是f的实例，f2是f的实例。

	```javascript
	function f(){
		this.age = 1;
	}
	f.prototype.name = "老李"

	var f1 = new f()
	var f2 = new f()
	```
2. 继承。实例继承类。
上例中，实例继承的是类的prototype。prototype是所有实例共享的。而`function f(){this.age = 1;}`里的`this`在实例中指的是实例本身。

3. 原型链。上例中，f1.name，会先从自身查找是否有，没有则查找**实例的类的prototype**（`f.constructor.prototype`），还没有则`f.constructor.prototype.constructor.prototype`。
4. **\_\_proto\_\_**。简单理解：`f.constructor.prototype = f.__proto__`。

```javascript
function f(){
	this.age = 1;
}

console.log(Function.constructor.prototype == Function.__proto__);    //true
console.log(f.constructor.prototype === f.__proto__);                 //true
```



