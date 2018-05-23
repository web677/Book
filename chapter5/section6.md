# CSS揭秘

## 浏览器是否支持某属性

- [Modernizr](http://modernizr.com/)

- @supports

```css
@supports (text-shadow: 0 0 10px red){
    h3{
        text-shadow: 0 0 10px red;
    }
}
```

- 检查在任意元素的`element.style`对象上是否存在该属性

```javascript
function testProperty(property) {
    var root = document.documentElement;

    if(property in root.style){
        root.classList.add(property.tolowerCase())
        return true
    }

    root.classList.add('no-' + property.tolowerCase())
    return false
}
```

- 检查属性的某个值是否被支持：思路是新建一个元素，给元素添加当前属性，设置为当前值，再检测当前元素上是否存在该属性，如果支持该值，元素依然存在该属性，则认为支持当前值

```javascript
function testValue(id, value, property) {
    var root = document.documentElement
    var dummy = document.createElement('p')
    dummy.style[property] = value

    if(dummy.style[property]){
        root.classList.add(id)
        return true
    }

    root.classList.add('no-' + id)
    return false
}
```