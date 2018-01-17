####关于数据类型的小题

* **问题**

```javascript
var a = 1;
var b = {value: 1};
var c = new Number(1);

function foo(v){
    v.value = "new Value";
}

foo(a);
foo(b);
foo(c);

console.log('a:',a)
console.log('b:',b)
console.log('c:',c)

a++
b++
c++

console.log('a++:', a)
console.log('b++:', b)
console.log('c++:', c)

foo(a);
foo(b);
foo(c);

console.log('foo(a):',a)
console.log('foo(b):',b)
console.log('foo(c):',c)
```
* **结果**

```javascript
a: 1
b: {value: "new Value"}
c: Number {1, value: "new Value"}
a++: 2
b++: NaN
c++: 2
foo(a): 2
foo(b): NaN
foo(c): 2
```

这个题是我自己在写[JavaScript基础之数据类型](../chapter1/section1.html)时自己想的，究根结底就一个问题：原始数据类型和引用数据类型在**运算**和**参数传递**时究竟如何传递的

* `foo`操作之前：a/b/c分别是原始数据类型/引用数据类型/引用数据类型
* `foo`操作之后：a为原始数据类型，不变；b为指针，`value`的值被重置为`new Value`；c为指针，被添加一个`value`的属性
* `++`操作之后：`a++`操作本质为 `a = a + 1`；所以a/b/c均为原始数据类型
* 再次`foo`操作之后：三个原始数据类型，所以都不变