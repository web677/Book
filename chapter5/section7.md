# 【github项目】30-seconds-of-code

> [https://github.com/30-seconds/30-seconds-of-code](https://github.com/30-seconds/30-seconds-of-code)

原生JS提供的原型方法，在我们实际工作需要在常常感觉不够用，有些常用的场景不得不自己再去封装一些方法，`30-seconds-of-code`这个项目提供了大量优秀的JavaScript代码片段，提供原型方法之外的一些常用方法，思路清奇优秀。

## 【Adapter】适配器

### 参数截取：只保留前n位参数，忽略其他参数。

    ```javascript
    const ary = (fn, n) => (...args) => fn(...args.slice(0, n));
    ```
使用：

    ```javascript
    const firstTwoMax = ary(Math.max, 2);
    [[1, 2, 3, 4], [5, 6, 7, 8], [9]].map(x => firstTwoMax(...x)); // [2, 6, 9]
    ```

### 闭包call：对于指定的context传入指定参数调用指定的key方法。

    ```javascript
    const call = (key, ...args) => context => context[key](...args);
    ```

使用：
这个有点迷，还没搞清楚使用场景，实际call方法的直接调用方式如：

    ```javascript
    call(key, ...args)(ctx);
    ```
再直白点的调用可以这么写：

    ```javascript
    call('a', 1,2,3)({a: function(a,b,c){return a + b + c}}); // 6
    ```
示例场景：

    ```javascript
    Promise.resolve([1, 2, 3])
        .then(call('map', x => 2 * x))
        .then(console.log); // [ 2, 4, 6 ]
    ```

### 将数组传递给一个可变函数为参数

    ```javascript
    const collectInto = fn => (...args) => fn(args);
    //直接调用
    collectInto(console.log)(1, 2, 3)
    ```

ES5写法

```javascript
var collectInto = function(fn){
    return function(args){
        return fn(args)
    }
}

```
