#四、Aligorithms and Flow Control 算法和流程控制

1、Loops 循环
----------

 - a、避免使用`for/in`循环
在JavaScript标准中，有四种类型循环。`for、for/in、while、do/while`，其中唯一一个性能比其他明显慢的是`for/in`。对于`for/in`循环的使用场景，更多的是针对不确定内部结构的对象的循环。`for/in`会枚举对象的命名属性，只有完全遍历对象的所有属性之后包括实例属性和从原型链继承的属性，循环才会返回。正因为`for/in`循环需要搜索实例或者原型的属性，所以`for/in`的性能要差很多，因此我们需要尽量避免使用`for/in`循环，对于那些已知属性列表的对象，更需要避免使用for/in。
 - b、Decreasing the work per iteration 减少迭代的工作量
一个标准的for循环组成：

```
(初始化体; 前侧条件/控制条件; 后执行体){
	循环体;
}
```
可能对于单次循环操作，我们所做的性能优化看起来没什么用，但是对于多次循环，这些性能优化加起来是很明显的。

```
for (var i = 0; i < items.length; i++){
	eventHandler(items[i]);
}
```
对于上面这样一个经典的for循环，它的单次操作中，需要做这些工作：

```
①在控制条件中读一次属性（items.length）
②在控制条件中进行一次比较（i < items.length）
③比较操作，判断条件控制体的结果是否为true（i < items.length == true）
④一次自加操作（i++）
⑤一次数组查找（items[i]）
⑥一次函数调用（eventHandler(items[i]);）
```
大家都知道的一个优化就是在第一步，每一次的循环中都会查询一次`items.length`，这个操作会首先查找`items`，然后计算长度，一方面，查找`items`时的性能开销是浪费的，另一方面，访问一个局部变量或者是字面量，显然更快。因此在这里，我们可以通过一个变量缓存`items.length`，对于较长的数组，可以节约25%的总循环时间（ie中可达到50%）。
另一种提升循环体性能的方法是改变循环的顺序，这常用于数组元素的处理顺序和任务无关的情况，从最后一个元素开始，直到处理完第一个元素。

```
for(var i = items.length; i--){
	eventHandler(items[i]);
}
```
在一个for循环中，可以省略初始化体和后执行体，这里省略了后执行体，也就是当`i --` 之后， `i！= flase`，则执行`eventHandler(items[i])`;这里的`i`是`i--`之后的值。这里优化地方是将我们前面说的2、3优化了成一步，`i`是否是`true`；如果是则执行`i--`，也就是`i = i - 1`;
进行这两方面的优化后，循环体的性能会得到显著提升。

 - c、Decreasing the number of iterations 减少迭代次数
除了在设计循环之前周密考虑，使用最优的循环模式，减少迭代次数，另一个减少迭代次数的有名的方法是**达夫设备**（`Duff's Device`），达夫设备最早出现于C中，他的设计理念，是将整个循环每`8`个一份分成`o`份并取余数`p`，第一次循环执行`n`次循环体，然后执行m次循环，每次循环中执行8次循环体中的操作，这样原本是`m * 8 + n` 次循环就变成了`m + 1`次循环。这对于那些循环体耗时很短的循环来讲，降低了在判断条件上浪费的时间，从而提升性能。移植到javascript中的一个典型的达夫设备的例子：

```
var m = [1,2,3,...];		//为一个很长很长的数组。
var o = Math.floor(m.length/8);
var p = m.length % 8 ;
var i = 0;
do{
switch(p){
	case 0 : console.log(m[i++]);
	case 7 : console.log(m[i++]);
	case 6 : console.log(m[i++]);
	case 5 : console.log(m[i++]);
	case 4 : console.log(m[i++]);
	case 3 : console.log(m[i++]);
	case 2 : console.log(m[i++]);
	case 1 : console.log(m[i++]);
}
p = 0;
}while(--o);
```
书上的达夫设备的代码如上，但是在我看来这段代码是有问题的，除非m也就是初始循环次数是8的整倍数，否则循环会少执行一轮，也就是8次。不过没有找到这本书的勘误，自行完善了一下这里的代码：

```
var m = [1,2,3,...];
var o = Math.floor(m.length/8);
var p = m.length % 8 ;
p === 0 ? '' : o++;
var i = 0;
do{
switch(p){
	case 0 : console.log(m[i++]);
	case 7 : console.log(m[i++]);
	case 6 : console.log(m[i++]);
	case 5 : console.log(m[i++]);
	case 4 : console.log(m[i++]);
	case 3 : console.log(m[i++]);
	case 2 : console.log(m[i++]);
	case 1 : console.log(m[i++]);
}
p = 0;
}while(--o);
```
理解上面的代码需要首先明确一点，不管是在C中还是JavaScript中，如果`switch`语句中没有`break`，则会在匹配到第一个`case`并执行后执行下一个`case`中的操作，不管下一个`case`是否匹配，直到遇到`break`或者结束的大括号，当然，`return`也可以。
上面`switch`版本的达夫设备的改进版是去掉了`switch`而变得更快，书中的代码是个死循环（难道因为我看的是pdf版本的有误，原书是对的吗），就不贴出来祸害人了，我这梳理后重写的代码如下：

```
var m = [1,2,3,...];
var p = m.length % 8 ;
while(p){
	console.log(m[--p]);
}
var i = m.length;
var o = Math.floor(m.length/8);
while(o--){
	console.log(m[--i]);
	console.log(m[--i]);
	console.log(m[--i]);
	console.log(m[--i]);
	console.log(m[--i]);
	console.log(m[--i]);
	console.log(m[--i]);
	console.log(m[--i]);
}
```
这个版本中的达夫设备将主循环和余数处理的部分分开，并将原数组进行倒序处理。代码很易懂就不多说。
在实测中，达夫设备的性能并不比传统的for循环快多少，甚至普遍会慢那么一点点（FireFox不管处理什么样的循环，都比Chrome慢三倍，这个必须吐槽一下），这是因为在现代浏览器中，随着设备性能的提升，浏览器的实现对循环的算法优化的越来越好，在浏览器内部处理循环时也会采用自己独特的算法提升循环的性能，编程时达夫设备带来的性能提升已经慢慢的变得不足为道；加上达夫设备这种写法，对于代码可读性很不友好，因此现在已经慢慢越来越少会有人采用这样的方式来做性能优化。但是达夫设备最初这种诡异的写法和思路，还是惊艳了很多人的，值得我们思考。

2、Function-Based Iteration 基于函数的迭代
----------------------------------
在多数现代浏览器的实现中，`forEach`可作为一个原生的方法去使用，此方法相当于遍历数组的所有成员，并在每个成员上执行一个函数，每个成员上执行的函数作为`forEach()`的参数传进去。这种情况下，每一个数组成员都被挂载了一个函数，在执行迭代时调用，这种基于函数的迭代比基于循环的迭代要慢很多，在实测中，会慢20%左右。复杂的函数处理的时候，性能上的问题会更突出。

3、Conditionals 条件表达式
--------------------

 - a、if-else Versus switch if-else与switch比较
大家约定俗称的一点是，在条件数量较少时倾向于使用`if-else`，在条件数量较大时使用`switch`，不管从代码可读性考虑，还是从性能方面考虑，这种做法都是正确的。尽管在实际上，较少条件数量时，使用`switch`多数情况下也比`if-else`快，但也只是快的微不足道，因此这种约定俗称的使用方式是没有问题的。
 - b、Optimzing if-else 优化if-else
`if-else`决定了JavaScript运行流的走向，让JavaScript运行流尽快找到运行条件并运行显然会提高函数的执行效率，因此在有多个条件数量时，让最可能出现的条件排在前面。例如，**用js设置中奖概率，一等奖概率10%，二等奖概率20%；三等奖概率30%；不中奖概率40%；**更多人的习惯写法是：

```
var result = Math.random() * 10;
if(result <= 1){
	//一等奖
}else if(result > 1 && result <= 3){
	//二等奖
}else if(result > 3 && result <= 6){
	//三等奖
}else{
	//不中奖
}
```
实际上，最可能出现的是不中奖，但是每次在判断为不中奖之前需要先进行前三次判断，此时可以做的优化就是将上述的写法反过来：

```
var result = Math.random() * 10;
if(result <= 4){
	//不中奖
}else if(result > 4 && result <= 7){
	//三等奖
}else if(result > 7 && result <= 9){
	//二等奖
}else{
	//一等奖
}
```
当然，较真性能的话，这里用`switch`更好，不过我们考虑的是优化`if-else`的性能。
另外一种减少条件判断的长度的办法是将并列的`if-else`判断，组织成嵌套的`if-else`减少平均的条件判断长度，例如下面的例子：

```
var result = Math.floor(Math.random() * 10);
if(result === 0){
	return 0;
}else if(result === 1){
	return 1;
}else if(result === 2){
	return 2;
}else if(result === 3){
	return 3;
}else if(result === 4){
	return 4;
}else if(result === 5){
	return 5;
}else if(result === 6){
	return 6;
}else if(result === 7){
	return 7;
}else if(result === 8){
	return 8;
}else if(result === 9){
	return 9;
}
```
这时候计算条件体的最大数目是9，我们可以通过嵌套判断的办法减少计算判断体的数目：

```
if(result < 6){
	if(result < 3){
		if(result === 0){
			return 0;
		}else if(result === 1){
			return 1;
		}else{
			return 2;
		}
	}else{
		if(result === 3){
			return 3;
		}else if(result === 4){
			return 4;
		}else{
			return 5;
		}
	}
}else{
	if(result < 8){
		if(result === 6){
			return 6;
		}else{
			return 7;
		}
	}else{
		if(result === 8){
			return 8;
		}else{
			return 9;
		}
	}
}
```
看起来代码是多了，但是最大的条件判断数变成了4，一定程度上提升了性能。当然，这种情况下，一般会使用`swtich`处理的。

 - c、Lookup Tables 查表法
当有大量的离散值需要测试时，使用`if-else`或者`switch`不论在可读性上和性能上都不应该去选择，比如下面的情况：

```
var array = [0,1,2,3,4,5,6,7...];
switch(result){
	case 0: return array[0];
	case 1: return array[1];
	case 2: return array[2];
	case 3: return array[3];
	case 4: return array[4];
	case 5: return array[5];
	case 6: return array[6];
	...
}
```
当数组有数十个上百个数据时，`switch`语句会是一段很庞大的代码。这时候可以使用查表法：

```
var array = [0,1,2,3,4,5,6,7...];
return array[result];
```
查表法一般适用于数据量稍大的场合，在实际编程中，还是经常会用到这种方法的。

 - d、Recursion 递归
某些场合，比如说阶乘函数，递归调用无疑是最优的实现方式：

```
function calc(n){
	if(n === 0){
		return 1;
	}else{
		return n * calc(n-1);
	}
}
```

 - e、Memoization 制表
制表的原理是通过缓存已经运行的计算结果，避免后续的重复计算从而提升性能。也常用于递归运算中，例如上面的阶乘函数的调用：

```
var a = calc(10);
var b = calc(9);
var c = calc(8);
```
在`calc(10)`被调用时，就已经计算过了`calc(9)`和`calc(8)`的值，这里`calc(9)`就重复计算了两次，而`calc(8)`重复计算了三次，我们可以通过缓存计算结果的办法去优化：

```
function m(n){
	if(!m.c){
		m.c = {
			"0": 1,
			"1": 1
		};
	}
	if(!m.c.hasOwnProperty(n)){
		m.c[n] = n * m(n-1);
	}
	return m.c[n];
}
var e = m(10);
var f = m(9);
var g = m(8);
```
优化后的函数中，`m(9)`和`m(8)`并没有再去计算，从而避免了重复计算。
