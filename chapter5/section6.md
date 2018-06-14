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
- 饼图
  - `transform`：方法的思路比较复杂，假定我们需要一个绿色(green)背景，比率用黑色(black)遮盖，同时我们有一个元素div.pie
    - 第一步，设置.pie背景为绿色到黑色的渐变，两种颜色各占半圆，接着，设置`.pie::before`为一个刚好覆盖黑色区域的半圆
        ```css
        .pie{
            width: 100px;
            height: 100px;
            border-radius: 50%;
            background: linear-gradient(to right, green 50%, black 0);
        }
        .pie::before{
            content: "";
            display: block;
            margin-left: 50%;
            height: 100%;
            border-radius: 0 100% 100% 0 / 50%;
            background: green;
        }
        ```
    - 第二步，设置`.pie::before`沿左边中心旋转，漏出黑色背景，当`.pie::before`旋转180deg时，刚好可以表示50%
    - 第三步，由于超出50%后，继续旋转`.pie::before`并不能增加漏出的黑色部分，反而会遮盖，此时需要换个思路，大于50%的饼图，`.pie::before`的背景色可以设置为黑色
    - 第四步，利用动画暂停和延时，我们可以通过两个动画，
      - 其中一个让`.pie::before`不停的旋转到【0.5turn(180deg)】，另一个动画从上一个动画50%的时候，背景颜色变为黑色
      - 利用动画延时负值，使动画暂停在某一阶段，从而达到对应比例
    [效果](http://play.csssecrets.io/pie-static)
  - svg：svg方案相对简单，利用svg的stroke，设置`stroke-dasharray`属性实现。
    - 画一个背景圆形a
    - 设置stroke，`stroke-width`为圆形半径的两倍，`stroke-dasharray`设置两个值，分别为(周长 * 比率，周长)
    - a下面再绘制一个半径为a两倍的园（stroke的表现，总是一半在元素外面，一半在元素里面）
    - 将图形旋转-90deg（stroke是从3点钟位置开始的）
    我们还可以把这个思路用js实现，让圆形a的周长刚好是100，这样设置`stroke-dasharray`比较方便，通过计算可得半径为16时，差不多周长刚好为100，因此js实现代码：
    ```javascript
    $$('.pie').forEach(function(pie){
        var p = parseFloat(pie.textContent);
        var NS = 'https://www.w3.org/2000/svg';
        var svg = document.createElementNS(NS, 'svg');
        var cricle = document.createElementNS(NS, 'circle');
        var title = document.createElementNS(NS, 'title');
        circle.setAttribute('r', 16);
        circle.setAttribute('cx', 16);
        circle.setAttribute('cy', 16);
        cricle.setAttribute('stroke-dasharray', p + ' 100');
        svg.setAttribute('viewBox', '0 0 32 32');
        title.textContent = pie.textContent;
        pie.textContent = '';
        svg.appendChild(title);
        svg.appendChild(circle);
        pie.appendChild(svg);
    })
    ```
  - 角向渐变方案
    ```css
    .pie{
        width: 100px;
        height: 100px;
        border-radius: 50%;
        background: conic-gradient(black 40%, green 0);
    }
    ```

## 视觉效果

- 单侧投影：`box-shadow`有6个值分别是`水平偏移、垂直偏移、模糊半径、阴影尺寸、颜色、内部外部`，其中`阴影尺寸`这一项，实际效果是使阴影尺寸为元素`本身宽/高 + 阴影尺寸`，因此`阴影尺寸`可以设置为负值，这时候阴影的宽度（高度）会比元素本身的宽度（高度）小，这时候通过偏移就可以控制实现单侧投影
- 双侧投影：`box-shadow`可以设置多个投影，用逗号隔开，因此实现双侧投影思路就是设置多个单侧投影
- 不规则投影：`drop-shadow`，某些情况下，比如虚线边框，元素加伪类生成的气泡等，使用`box-shadow`无法达到想要的效果，`drop-shadow`参数和`box-shadow`差不多，但是少了`阴影尺寸、内部外部`两项，其他含义一致。需要注意的是，`drop-shadow`会对`text-shadow`打上重复阴影
- 染色效果
  - filter: 滤镜方案
  - 混合模式: `mix-blend-mode`和`background-blend-mode`
- 毛玻璃效果
  - filter: 给需要毛玻璃效果的区域的伪类元素添加一个和背景图一样的背景，然后利用filter进行模糊处理，处理细节时，需要将背景的模糊半径放大，以确保毛玻璃边缘不会衰减，然后将超出部分裁剪掉
    [效果](http://play.csssecrets.io/frosted-glass)
  - 关于`background-attachment: fixed`，会将背景图充满屏幕，与当前元素宽高无关
- 折角
  - 两层背景渐变，生成两个三角
    ```css
        .test{
            background: linear-gradient(to left bottom, transparent 50%, rgba(0,0,0,0.4) 0) no-repeat 100% 0 / 2em 2em,
                        linear-gradient(-135deg, transparent 1.414em, #58a 0);
            }
    ```
  - 借助伪元素和背景渐变，分别生成一个三角，并对伪元素生成的三角，计算尺寸、旋转角度，添加阴影等：[效果](http://play.csssecrets.io/folded-corner-realistic)。将其中计算尺寸、旋转角度部分，用预处理器的mixin来处理，会更方便维护：[效果](http://play.csssecrets.io/folded-corner-mixin)

## 字体排印

- 连字符断行（两端对齐）：`hyphens: auto;`
- 插入换行：可以采用换行符`0x000A`，css中可以采用`\000A`或者简写为`\A`，配合使用`white-space: pre;`
- 字体背景斑马条纹：可以采用`linear-gradient`实现斑马`background`，然后设置`background-origin: content-box;`，其中`background-size`y轴方向设置为行高（小数为单位）的两倍，以em为单位，这样可以实现斑马条纹随字号自适应
