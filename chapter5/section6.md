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

## 背景与边框

- 半透明边框：如果期望半透明的边框下面透出的不是元素本身的`background-color/background-image`，可以对元素使用`background-clip: padding-box;`
- 多重边框
  - `box-shadow`: 5个参数，分别为x方向偏移量、y方向偏移量、模糊值、扩张半径、投影颜色，前三个值设置0，第四个值设置为正，即可得到一个实线边框
    ```css
    div{
        width: 100px;
        height: 100px;
        border: 10px solid green;
        box-shadow: 0 0 0 10px inset red, 0 0 0 20px inset yellow;
    }
    ```
    我们还可以使用逗号分隔，创建出更多层边框，也可以使用inset，让`box-shadow`往内延伸

  - `outline`: `outline`的优势在于我们可以创建出和`border`一样效果的虚线描边，缺点在`outline`只能设置一层描边，加上`border`最多形成两层边框，并且在目前大多数浏览器，`outline`并不会贴合`border-radius`的圆角，这是一个已经在规范中修正的bug，具体实现有待浏览器支持
- 背景偏移

  要求：背景图在右下角距离边框分别10px的位置。

  如果我们期望背景图偏移，我们通常使用`background-position`，这里提供几种更多的思路
  - `background-position`: 这是最常规的思路，有一点需要注意的是，`background-position`的参数可以设置为`right 10px`表示居右，距离边框10px的位置，这是一个css3的属性，可能不被支持，常规使用方式最好添加回退方案
    ```css
    background: green url(bg.png) no-repeat right bottom;
    background-position: right 10px bottom 10px;
    ```
  同时，我们可以指定`background-origin`来指定背景图偏移的参考，和`box-sizing`一样，可以指定的值有`border-box/padding-box/content-box`
  - `calc()`: 这是一个强大的方法，考虑到兼容性的话，这个方法也许还不合适
    ```css
    background: green url(bg.png) no-repeat;
    background-position: calc(100% - 10px) calc(100% - 10px);
    ```