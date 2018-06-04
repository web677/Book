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

## 形状

- `border-radius`：首先需要知道，`border-radius`是可以传入8个值，如：
    ```css
    div{
        border-radius: 10px 20px 30px 40px / 40px 30px 20px 10px;
    }
    ```
    `/`前后的4个值分别代表【水平半径】和【垂直半径】的【左上、右上、右下、左下】四个角的圆弧半径，一旦有`/`分隔，前面的遵循常规缩写，若无`/`分隔，则表明垂直半径和对应位置的水平半径一致
- 半椭圆
    ```css
    div{
        border-radius: 50% / 100% 100% 0 0;
    }
    ```
    如果元素的宽度刚好是高度的2倍，则呈现出来的元素为半圆
- 1/4椭圆
    ```css
    div{
        border-radius: 100% 0 0 0;
    }
    ```
- 平行四边形
  - 思路很简单，元素的伪类元素添加`skew`属性
- 菱形图片
  - 常规思路，图片父级旋转，图片本身再旋转回来
  - `clip-path`创建一个只有元素的部分区域可以显示的剪切区域
- 切角效果
  - 渐变，原理很简单，从要切的角开始一个渐变，初始色值是透明色
    ```css
    background-image: linear-gradient(45deg, transparent 10%, green 10%);
    ```
    - 多个切角
        ```css
        div{
            background: linear-gradient(-45deg, transparent 15px, green 0) right,
                    linear-gradient(45deg, transparent 15px, green 0) left;
            background-size: 50% 100%;
            background-repeat: no-repeat;
        }
        ```
    - 弧形切角
        ```css
        div{
            background: radial-gradient(circle at bottom left, transparent 15px, green 0) bottom left;
            background-size: 100% 100%;
            background-repeat: no-repeat;
        }
        <!-- 多个切角 -->
        div{
            background: radial-gradient(circle at bottom left, transparent 15px, green 0) bottom left,
                    radial-gradient(circle at bottom right, transparent 15px, green 0) bottom right;
            background-size: 50% 100%;
            background-repeat: no-repeat;
        }
        ```
- 梯形
  - 利用3D变形属性实现，让元素的`:before`y轴先放大130%，在x轴向后旋转5deg，但实现的梯形不可控，对于宽度不固定的元素很难做到适配
