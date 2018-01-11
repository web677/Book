早前阅读[高性能JavaScript][1]一书所做笔记。

#一、Loading and Execution 加载和运行
=============================

从加载和运行角度优化，源于`JavaScript`运行会阻塞UI更新，`JavaScript`脚本的下载、解析、运行过程中，页面的下载和解析过程都会停下来等待，因为脚本可能在运行过程中修改页面内容。

 

`Script Positioning` 脚本位置
-----------------------

将`<script>`标签放在尽可能接近`<body>`标签底部的位置，尽量减少对页面下载的影响。
 

 `Grouping Scripts` 成组脚本
-----------------------

旨在减少http请求，将`JavaScript`脚本文件合并打包，可以通过打包工具实现（当然可以手动合并）或者实时工具，比如Yahoo! 的 `combo handler`，任何网站通过一个“联合句柄”URL指出包含YUI文件包中的哪些文件，服务器收到URL请求时，将文件合并在一起后返回给客户端。
 

`Nonblocking Scripts` 非阻塞脚本
-------------------------

页面加载完成之后，再加载`JavaScript`源码，也就是`window`的`load`事件发出后开始下载代码。
     

 - `Deferred Scripts` 延期脚本

    `HTML4`为`<script>`标签定义的扩展属性：`defer`。如果你为`<script>`指定`defer`属性，表明此脚本不打算修改DOM，代码可以稍后执行。`IE4+/FF3.5+`支持。具有`defer`属性的脚本，可以放在页面的任何位置，可以和页面的其他资源一期并行下载，但会在DOM加载完成，`onload`事件句柄被调用之前执行。
 - `Dynamic Script Elements` 动态脚本元素
创建一个`script`元素，指定`src`属性，然后在页面加载完成之后添加到页面的任何地方。一个简单的通用demo：

```
function loadScript(url, callback) {
    var script = document.createElement("script") script.type = "text/javascript";
    if (script.readyState) { //IE
        script.onreadystatechange = function() {
            if (script.readyState == "loaded" || script.readyState == "complete") {
                script.onreadystatechange = null;
                callback();
            }
        };
    } else { //Others     
        script.onload = function() {
            callback();
        };
    }
    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
}
```
 - `XMLHttpRequest Script Injection XHR` 脚本注入
使用`XMLHttpRequest`对象，将脚本注入到页面，和动态脚本元素有类似之处，先创建`XHR`对象，然后通过`get`方法下载`JavaScript`文件，接着用动态`<script>`元素将`JavaScript`代码注入页面。

```
var xhr = new XMLHttpRequest();
xhr.open("get","file.js",true);
xhr.onreadystatechange = function () {
	if (xhr.readyState === 4) {
		if(xhr.status >= 200 && xhr.status < 300 || xhr.status == 304){
			var script = document.createElement ("script");
			script.text = xhr.responseText; 
			document.body.appendChild(script); 
		}
	}
}
xhr.send(null);
```
由于`JavaScript`的同源策略，脚本文件必须和页面放置在同一个域内，不能通过CDN下载，因此不常见于大型网页。
`Recommended Nonblocking Pattern` 推荐的非阻塞模式
----------------------------------------
先加载一个加载器，然后加载`JavaScript`。
比如上文中提到的`loadScript`方法就可以封装为一个初级的加载器，然后通过`loadScript`方法来加载其他脚本。只不过这个微型加载器要保证依赖关系会比较丑：

```
loadScript("./file1.js", function () {
	loadScript("./file2.js", function () {
		loadScript("./file3.js", function () {
			//do something
		})
	})
})
```
再比如`YUI3`，比如`lazyload.js`，比如`lab.js`。

二、Data Acess 数据访问
=================
数据存储在哪里，关系到代码运行期间数据被检索到的速度。`JavaScript`中有四种基本的数据存储位置：`Literal` `values`(直接量)、`Variables`(变量)、`Array items`(数组项)、`Object members`(对象成员)。对于直接量和局部变量的访问性能差异微不足道，性能消耗代价高一些的是全局变量、数组项、对象成员。

`Managing Scope` 管理作用
-------------------
先了解一下作用域的原理
每一个`JavaScript`函数都是一个对象，也可以叫函数实例，函数对象和其他对象一样，拥有编程可以访问的属性和不能被程序访问，仅供`JavaScript`引擎使用的内部属性，一种有一个叫`[[Scope]]`的属性。`[[Scope]]`中包含函数作用域中对象的集合（作用域链），它表示当前函数环境中可访问的数据，以链式的形式存在。当一个函数被创建后，作用域链中被放入可访问的对象。例如：

```
function add (a,b) {
	var result = a + b;
	return result;
}
```
此时作用域链中被推入一个可变的全局对象（随便取个名叫“房间A”），代表了所有全局范围中的变量，包含`window、document、navigator`等的访问接口。
在函数运行期间，函数内部会建立一个内部对象，称为运行期上下文。这个对象定义了函数运行时的环境，每次函数运行，这个上下文都是独一的，多次调用函数就会多次创建运行期上下文对象，函数执行完毕，这个上下文对象会被销毁。这个上下文环境也有自己的作用域链，用来解析标识符（理解为寻找变量），当一个运行期上下文被创建时，它的作用域链被初始化，函数本身的`[[Scope]]`属性中的对象，按照原来的顺序被复制到运行期上下文的作用域链中。此时运行期上下文会创建一个新的对象，名叫“`激活对象`（取名叫“房间B”）”，“房间B”中存储了所有的局部变量、命名参数、参数集合和this的接口。然后“房间B”被推入到作用域链的前端。在刚刚所说的可变全局对象（“房间A”）的前面。
		函数过程中，每遇到一个变量，标识符识别过程都要决定从哪里获得或者存储数据。它会搜索运行期上下文的作用域链，查找同名的标识符，搜索工作从作用域链的前端开始查找，也就是刚才的“房间B”那里查找，如果找到了，就是用对应的变量值，如果没找到就进入“房间A”进行查找，如果找到，就用对应的值，没有找到就认为这个标识符是未定义的("undefined")；
在之前的`add`函数运行过程中，`result/a/b`三个变量的查找实际上都进行了上述的搜索过程，因此产生性能问题。当一个标识符所处位置越深，读写速度就越慢，所以函数中局部变量的访问速度是最快的，全局变量通常很慢，因为全局变量总是处于作用域链最后一个位置，前面的房间都找过了，没找到，才会过来他这里找。因此，就有了优化性能的办法：

 - 用局部变量存储本地范围之外的变量值（如果这个变量值被多次使用）

比如：
```
function foo() {
	var a = document.getElementById("a"),
		b = document.getElementsByTagName("div");
}
```
这时候`document`被查找了两次，而且每次都要先找“房间B”，再找“房间A”才能找到，这时候就可以用一个局部变量暂存`document`：
```
function foo() {
	var doc = document,
		a   = doc.getElementById("a"),
		b   = doc.getElementsByTagName("div");
}
```
 - 减少使用动态作用域（Dynamic Scopes）

**`with()`**
`with`可以临时改变函数的作用域链，在某些特殊场景下，可以加快一些变量的访问。比如一个函数内多次使用`document`：
```
function foo() {
	var a = document.getElementById("a"),
		b = document.getElementsByTagName("div");
	console.log(a.className);
}
```
可以改写为：
```
function foo() {
	with(document){
		var a = getElementById("a"),
			b = getElementsByTagName("div");
		console.log(a.className);
	}
}	
```
在这里，`document`对象以及`document`对象所有的属性，都被插入到作用域的最前端，页面在寻找"getElementById"方法是会首先从`document`对象属性中寻找，而不需要从`foo()`的作用域中查找，然后再到全局作用域中进行查找，降低了二次查找的消耗。但是在`document`对象的属性被推入作用域链的最前端的同时，其他局部变量都被推入作用域链第二的位置。上例中，在查找a的时候，会先从`document`对象属性中查找，没有才会从`foo()`的作用域中进行查找。这样带来的性能消耗往往得不偿失。因此`with`必须慎用，只有在极个别的场景中才划算。
**`try-cahch`**
当`try`中程序块发生错误而转入`catch`块中时，程序会自动将异常对象推入作用域链的最前端。同样会改变作用域链，带来性能问题。因此在不得不用`try-catch`语句的时候，可以采用下面的操作方式：
```
try{
	//do something
}catch(e){
	handleError(e);
}
```
在`catch`块中运行错误处理函数，将错误对象作为参数传给错误处理函数，`catch`块中作用域链的改变就没什么影响了。
**`others`**
还有一些其他的情况，比如：

```
function foo(f){
	(f);
	function returnWindow(){
		return window;
	}
	var s = returnWindow();
}
```
正常情况下，上述函数`window`就是`window`，但是如果我们执行：

```
foo("var window = 'I am not window';");
```
这时候的`window`就不再是那个`window`了。性能上的问题不说，只是变量作用域变得不可控了，带来其他的问题。同时，在一些现代浏览器中，比如`Safari`的`Nitro`引擎中，会铜鼓分析代码来确定哪些变量应该在任意时刻被访问，绕过传统作用域链查找，用标识符索引的方式快速查找，以此来加快标识符识别过程。但是遇到动态作用域的时候，引擎需要切回慢速的基于哈希表的标识符识别方法，这里的浏览器引擎做的努力就没办法了。

 - `closures` 慎用闭包
慎用闭包有两个方面的原因。一是闭包必然存在函数嵌套，闭包内访问外部变量都会经过最少两次的查找。更重要的问题在于，闭包需要访问外部变量，因此导致函数运行期的激活对象被保存，无法销毁。引用始终存在于闭包的`[[Scope]]`属性中，不仅消耗更多的内存开销，在IE中还会导致内存泄露。

`Object Members` 对象成员
-------------------
`JavaScript`中一切皆对象，对象的命名成员可以包含任意数据类型，当然就可以包含函数。这里所说的对象成员，指的就是函数对象，函数对象的访问速度，比直接亮和局部变量要慢，某些浏览器的实现中，甚至比数组还要慢。找到优化办法之前，需要先了解原因。

 - `Prototypes` 原型
`JavaScript`中的对象是基于原型的，原型是对象的基础，定义并实现了一个新对象所必须具有的成员。原型对象为所有给定类型的对象实例共享，所有的实例共享原型对象的成员。一个对象通过一个内部属性绑定到自己的原型，在`FF/Safari/Chrome`中，这一对象被称为`_proto_`，任何时候创建一个内置类型的实例，这些实例将自动拥有一个`Object`作为他们的原型。
因此一个对象拥有成员可以分为两类：实例成员（own成员）和原型成员。实例成员直接存在于实例自身，而原型成员则从对象成员继承。例：

```
var cat = {
	name:"xiaohua",
	age:1
}
```
在这里，`cat`的实例成员就是`name`和`age`，原型成员就是`cat._proto_`中的成员属性，而`cat._proto_`属性是`Object.prototype`，在这里就是`Object`，如下调用时：

```
console.log(cat.name);
```
在调用`cat.name`属性时，现在`cat`实例成员中查找，如果调用`cat.toString()`方法时，同样先在`cat`的实例成员中查找，找不到的时候再到其原型成员中查找，和处理变量的过程类似，同样也就导致了性能问题。

 - `Prototype Chains` 原型链
对象的原型决定了一个实例的类型，默认情况下，所有对象都是`Object`的实例，并继承了所有基本方法，当我们使用构造器创建实例时，就创建了另外一种类型的原型。
```
function Animal(name,age){
	this.name = name,
	this.age = age
}
Animal.prototype.sayHello = function(){
	console.log("Hello,I am a " + this.name);
}
var cat = new Animal("cat",1);
var dog = new Animal("dog",1);
```
`cat`是`Animal`的实例，`cat._proto_`是`Animal.prototype`，`Animal.prototype._proto_`是`Object`；`dog`和`cat`共享一个原型链，但各自拥有自己的实例成员`name`和`age`。如果我们调用了`cat.toString()`方法时，搜索路径如下：

```
cat---cat._proto_(Animal.prototype)---cat._proto_.constructor(Animal)---cat._proto_.Constructor._proto_(Object);
```
原型链每深入一个层级，就会带来更大的性能消耗，速度也就会更慢。而对于实例成员的搜索开销本身就大于访问直接量或者是局部变量，因此这种性能消耗还是很值得去优化的。

 - `Nested Members` 嵌套成员
例如：`window.local.href` ；每遇到一个 `.` ；`JavaScript`引擎就会在该对象成员上执行一次解析过程。比如如果`href`并不是`local`的实例属性，解析引擎就会去`local`的原型链去进行搜索，由此带来严重的性能消耗。
 - `Caching Object Member Values` 缓存对象成员的值
上述的性能问题都是和对象成员有关，因此要尽量避免对对象成员的搜索，比如：

```
function foo(ele,className1,className2) {
	return ele.className == className1 || ele.className == className2;
}
```
在这里，我们访问了两次`ele`的`className`属性，但是这两次访问时，`ele`的`className`属性值是一样的，因此可以在这里用一个变量暂存`ele.className`的值，避免两次访问导致的两次搜索过程。处理嵌套属性更需要用这种办法来处理。

**针对数据访问导致的相关性能问题，主要的解决办法就是对数据进行暂存，比如将全局变量暂存为局部变量，减少作用域链的深入搜索；将实例的属性暂存，减少对原型链的多次深入搜索；另一个就是减少使用动态作用域和闭包。**

 [1]: https://www.amazon.cn/gp/product/B013SGB2AO/ref=ox_sc_act_title_1?ie=UTF8&psc=1&smid=A1AJ19PSB66TGU