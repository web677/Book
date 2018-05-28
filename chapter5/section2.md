# 高性能JavaScript阅读简记（二）

## DOM Scripting DOM编程

我们都知道对DOM操作的代价昂贵，这往往成为网页应用中的性能瓶颈。在解决这个问题之前，我们需要先知道什么是DOM，为什么他会很慢。

### `DOM in the Browser World` 浏览器中的DOM

DOM是一个独立于语言的，使用`XML`和`HTML`文档操作的应用程序接口（`API`）。浏览器中多与HTML文档打交道，`DOM APIs`也多用于访问文档中的数据。而在浏览器的实现中，往往要求DOM和JavaScript相互独立。例如在IE中，JavaScript的实现位于库文件`jscript.dll`中，而DOM的实现位于另一个库`mshtml.dll`中（内部代号`Trident`），这也是为什么IE内核是`Trident`，IE前缀为`-ms-`，当然，我们说的浏览器内核其实英文名叫 `Rendering Engine/Layout Engine`，准确翻译应该是渲染引擎/排版引擎/模板引擎（其实是一个东西）；另外一个就是JavaScript引擎，ie6-8采用的是`JScript`引擎，ie9采用的是`Chakra`。而这是相分离的；Chrome中`Webkit`的渲染引擎和V8的`JavaScript`引擎，Firefox中`Spider-Monkey`的`JavaScript`引擎和`Gecko`的渲染引擎，都是相互分离的。

#### `Inherently Slow` 天生就慢

因为上文所说的，`浏览器渲染引擎`和`JavaScript引擎`是相互独立的，那么两者之间以功能接口相互连接就会带来性能损耗。曾有人把`DOM`和`ECMAScript（JavaScript）`比喻成两个岛屿，之间以一座收费桥连接，每次`ECMAScript`需要访问`DOM`时，都需要过桥，交一次“过桥费”，操作DOM的次数越多，费用就越高，这里的费用我们可以看作性能消耗。因此请尽力减少操作DOM的次数。

- **`DOM Access and Modification DOM`访问和修改**

    访问DOM的代价昂贵，修改DOM的代价可能更贵，因为修改会导致浏览器重新计算页面的几何变化，更更更贵的是采用循环访问或者修改元素，特别是在HTML集合中进行循环。简单举例：

    ```javascript
    function innerHTMLLoop(){
        for ( var count = 0; count < 100000; count++){
            document.getElementById("p").innerHTML += "-";
        }
    }
    ```

    这时候，**每执行一次`for`循环，就对DOM进行了一次读操作和写操作（访问和修改）**；此时我们可以采用另外一种方式：

    ```javascript
    function innerHTMLLoop(){
        var content = "";
        for ( var count = 0; count < 100000; count++){
            content += "-";
        }
        document.getElementById("p").innerHTML += content;
    }
    ```

    我们使用了一个局部变量存储更新后的内容，在循环结束时一次性写入，这时候只执行了一次读操作和写操作，性能提升显著。因此，尽量少的操作DOM，如果可以在JavaScript范围内完成的话。

- **`innerHTML Versus DOM methods`  innerHTML与DOM方法**

    在老版本浏览器中，innerHTML更快但差别不大，更新的浏览器中，不相上下，最新的浏览器中，DOM方法更快，但依然差别不大。

- **`Cloning Nodes` 节点克隆**

    这样的方法和DOM方法操作速度不相上下。

## HTML Collections HTML集合

`HTMLCollection`是用于存放DOM节点引用的类数组对象。得到的方法有：`document.getElementByName/document.getElementByClassName/document.getElementByTagName/document.querySelectAll/document.images/document.links/document.forms`等；也有类似于`document.forms[0].elements`（页面第一个表单的所有字段）等。
上面这些方法返回`HTMLCollection`对象，是一种类似数组的列表，没有数组的方法，但是有lenth属性。在DOM标准中定义为：“虚拟存在，意味着当底层文档更新时，他们将自动更新”。HTML集合实际上会去查询文档，更新信息时，每次都要重复执行这种查询操作，这正是低效率的来源。

- `Expensive collections` 昂贵的集合

    先看个例子：

    ```javascript
    var oDiv = document.getElementByTagName("div");
    for (var i = 0; i < oDiv.length; i++){
        document.body.appendChild(document.createElement("div"))
    }
    ```
    好吧，这是个死循环，永远不会结束，但是这个过程中，每访问一次`oDiv.length`，就会重新计算一遍其长度，当然，前提是对所有的div重新进行一次遍历，因此，在这里，我们最好使用一个变量暂存`oDIv.length`：

    ```javascript
    var oDivLen = document.getElementByTagName("div").length;
    for (var i = 0; i < oDivLen; i++){
        document.body.appendChild(document.createElement("div"))
    }
    ```
    从性能角度来讲，这样做会快很多。同时，因为对HTML集合的访问比对数组访问要更耗费性能，因此在某些不得不多次访问HTML集合的情况下，可以先将集合存储为一个数组，然后对数组进行访问：

    ```javascript
    function toArray(htmlList){
        for (var i = 0, htmlArray = [], len = htmlList.length; i < len; i++){
            htmlArray[i] = htmlList[i];
        }
        return htmlArray;
    }
    ```
    当然，这也需要额外的开销，需要自己进行权衡是否有必要这样做。

- `Local variables when accessing collection elements` 访问集合元素时使用局部变量

    对于任何类型的DOM访问，如果对同一个DOM属性或者方法访问多次，最好使用一个局部变量对此DOM成员进行缓存。特别是在HTML集合中访问元素时，如果多次对集合中的某一元素访问，同样需要将这个元素先进行缓存。

## Walking the DOM DOM漫谈

`DOM API`提供了多种访问文档结构特定部分的方法，去选择最有效的API。

- `Crawling the DOM` 抓取DOM

    如果你可以通过：`document.getElementByID();`获得某元素就不要去用`document.getElementById().parentNode;`这么麻烦去获取。如果你可已通过`nextSibling`去获取一个元素就不要通过`childNodes`去获取，因为后者是一个`nodeList`集合。

- `Element nodes` 元素节点

    DOM包含三个节点（也可以说是四个）：元素节点、属性节点、文本节点（以及注释节点）；通常情况下，我们获取到和使用的是元素节点，但是我们通过`childNodes、firstChild、nextSibling`等方法获取到的是所有节点的属性，js中有一些其他的API可以用来只返回元素节点或者元素节点的某些属性，我们可以用这些API取代那些返回整个全部节点或者节点属性的API，例如：

    ```javascript
    <s>childNodes</s>						children
    <s>childNodes.length</s>				childElementCount
    <s>firstChild</s>						firstElementChild
    <s>lastChild</s>						lastElementChild
    <s>nextSibling</s>						nextElementSibling
    <s>previousSibling</s>					previousElementSibling
    ```

    在所有的浏览器中，后者比前者要快，只不过IE中后面部分方法并不支持，比如IE6/7/8，只支持children方法。

- `The Selectors API` 选择器API

    传统的选择器在性能方面问题不大，只不过应用场景相对单一，当我们用习惯了CSS选择器之后，我们会觉得DOM给我们提供的选择器让我们抓狂。在`querySelector/querySelectorAll`之前，如果我们想要查找到元素下符合条件的另一元素时，不得不使用类似下面的方法：`document.getElementById("id1").getElementById("id2");`,但如果你想获取一个类名为`class1`或类名为`class2`的div的时候，不得不这么处理：

    ```javascript
    function getDivClass1(className1,className2){
        var results = [];
        var divs = document.getElementByTagName("div");

        for (var i = 0,len = divs.length; i < len; i++){
            _className = divs[i].className;
            if(_className === className1 || _className === className2){
                results.push(divs[i]);
            }
        }
        return results;
    }
    ```

    不仅仅是因为冗长的代码，多次对DOM进行遍历带来的性能问题也不可小窥；不过在有了`querySelector/querySelectorAll`之后，这一切变得简单，减少对DOM的遍历也带来了性能的提升。上面两个例子可以重写如下：

    ```javascript
    document.querySelector("#id1 #id2");
    document.querySelectorAll("div.className1,div.className2");
    ```
    因此，如果可以，尽量使用`querySelector/querySelectorAll`吧。

## `Repaints and Reflows` 重绘和重排（也称回流）

这涉及到一个比较古老的议题，浏览器在拿到服务器响应时都干了什么。我查阅了相当一部分资料（网上很多地方说法是不准确的，包括一些问答、博客），去了解整个流程，这里简单的描述一下过程。更多细节可参考[《浏览器的工作原理：新式网络浏览器幕后揭秘》][1]，原版地址（[http://taligarsiel.com/Projects/howbrowserswork1.htm][2]）。
上文提到过，浏览器的实现一般包括`渲染引擎`和`JavaScript引擎`；二者是相互独立的。
我们先从渲染引擎的角度来看一下在拿到服务器的文档后的处理流程：

- **`Parsing HTML to construct the DOM tree` 解析HTML以构建DOM tree**

    解析HTML文档，将各个标记逐个转化为DOM tree 上的DOM节点；当然并不是一一对应；类似于head这样的标记是在DOM tree上是没有对应的节点的。在这个过程中，同时被解析的还包括外部CSS文件以及样式元素中的样式数据，这些数据信息被准备好进行下一步工作。

- **`Render tree construction` 构建render tree**

    在`DOM tree`构建过程中，CSS文件同时被解析，`DOM tree`上每一个节点的对应的颜色尺寸等信息被保存在另一个被称作`rules tree`的对象中（具体实现方式`webkit`和`gecho`是不一样的，可参考上文提到过的[《浏览器的工作原理》][3]）。`DOM tree`和`rules tree`两者一一对应，均构建完成之后，`render tree`也就构建完成了。

- **`Layout of the render tree` 布局render tree**

    依据`render tree`中的节点信息和对应的rules中的尺寸信息（包括display属性等），为每一个节点分配一个应该出现在屏幕上的确切坐标。
- **`Painting the render tree` 绘制render tree**

    就是将已布局好的节点，加上对应的颜色等信息，绘制在页面上。

    当然，浏览器并不会等到全部的HTML文档信息都拿到之后才进行解析，也不会等到全部解析完毕之后才会进行构建`render tree`和`设置布局`。渲染引擎可能在接收到一部分文档后就开始解析，在解析了一部分文档后就开始进行构建`render tree`和`layout render tree`。

### **JavaScript引擎的工作：**

正常的流程中，渲染引擎在遇到`<script>`标记时，会停止解析，由`JavaScript`引擎立即执行脚本，如果是外部则立即进行下载并执行，这期间渲染引擎是不工作的。如果脚本被标注为`defer`时，脚本立即进行下载，但暂不执行，而且这期间也不会阻塞渲染引擎的渲染，脚本会在文档解析完毕之后执行；如果脚本被标注为`async`时，脚本立即进行下载，下载完成后会立即执行，只不过这个过程和渲染时两个线程进行的，二者是异步执行，同样不会影响页面渲染。`defer`和`async`二者的区别是：虽然都是立即下载（这两个都只作用于外部脚本），但是前者是在文档解析完毕后执行，后者是下载完成后立即执行，因此前者可以保证脚本按照顺序执行，而后者谁先下载完谁先执行会导致依赖关系混乱。

注：关于`async`和`defer`，在查阅资料后的说法见上文。但在我自己编写DEMO测试的过程中，发现在Chrome中偶尔会全部阻塞，偶尔都不阻塞，最多的是脚本以上的文档不阻塞，以下的文档被阻塞；IE/FireFox中完全不鸟这俩属性，直接等到脚本执行完毕才出现页面。

说回重绘和重排，

先说重排，当`render tree`中的一部分因为元素的尺寸、布局、显示隐藏等改变而需要重新构建render tree时，此时就叫重排，也就是重新构建`render tree`；会引起重排的场景包括：添加或者删除可见的DOM元素、元素位置改变、元素尺寸改变（边距、填充、边框、宽高等）、内容改变（因此引起尺寸改变）、页面渲染初始化（首次加载页面）、浏览器窗口尺寸改变；还有很重要的一点就是在尝试获取页面元素的尺寸时也会强制引发重排（因为重排的过程会重新计算元素的尺寸，所以为保证获得最新的尺寸信息，会先强制进行重排），例如：`offsetTop/offsetLeft/offsetWidth/offsetHeight/scrollTop/scrollLeft/scrollWidth/scrollHeight/clientTop/clientLeft/clientWidth/clientHeight/width/height/getComputedStyle()/currentStyle()`。
重绘一般发生在元素的外观变化时，首先重排一定会引起重绘，当元素的`颜色/背景色/透明度/visibility属性`等发生变化也会引起重绘。

- `Queuing and Flushing Render Tree Changes` 查询并刷新render tree改变

    前文我们知道了构建`render tree`过程中，会先对CSS以及样式元素中的样式数据进行解析计算，在引发重排时，会对样式数据重新计算，性能问题就出现在大量计算的过程中，在大多数的浏览器中，会通过队列化修改和批量显示优化重排的过程，但是我们刚所提到的尝试获取页面尺寸信息会强制引发重排，类似下面代码：

    ```javascript
    var computedValue,
        tmp = '',
        bodystyle = document.body.style;

    if (document.body.currentStyle) {
        computedValue = document.body.currentStyle;
    }else{
        computedValue = document.defaultView.getComputedStyle(document.body, '');
    }
    bodystyle.color = 'red';
    tmp = computedValue.backgroundColor;
    bodystyle.color = 'white';
    tmp = computedValue.backgroundImage;
    bodystyle.color = 'green';
    tmp = computedValue.backgroundAttachment;
    ```

    上面示例中，`body`的字体颜色被改变了三次，每次改变后都对`body`的样式信息进行了查询，虽然查询的信息和字体颜色无关，但是浏览器会因此刷新渲染队列并进行重排，所以共进行了三次重排，也理所当然的进行了三次重绘，这里可以改进一下：

    ```javascript
    var computedValue,
        tmp = '',
        bodystyle = document.body.style;

    if (document.body.currentStyle) {
        computedValue = document.body.currentStyle;
    }else{
        computedValue = document.defaultView.getComputedStyle(document.body, '');
    }
    bodystyle.color = 'red';
    bodystyle.color = 'white';
    bodystyle.color = 'green';
    tmp = computedValue.backgroundColor;
    tmp = computedValue.backgroundImage;
    tmp = computedValue.backgroundAttachment;
    ```

    在下面的例子中，实际上引起了一次重排和两次重绘，首先`bodystyle.color`的三次变化被批量化一次处理，只进行了一次重绘，接着对`computedValue`的访问批量处理，进行了一次重排，接着此次重排又引起一次重绘。速度要比优化之前的更快。因此，尽量不要在布局信息发生变化时对元素尺寸进行查询。

- `Minimizing Repaints and Reflows` 最小化重绘和重排

    上面的例子其实就是减小重绘重排的一种方法，尽量将对DOM和风格改变的操作放在一起，在一次批量修改中完成。

  1. **style changes 改变风格**

        先举例：

        ```javascript
        var oDiv =  document.getElementById('div');
        oDiv.style.borderLeft = "1px";
        oDiv.style.padding = "10px";
        oDiv.style.width = "100px";
        ```

        这里对`oDiv`进行了三次改变，每次改变都涉及到元素的几何属性，虽然大多数浏览器进行了优化，只进行一次重排，但部分老式浏览器中，效率很低，而且如果在此时进行了布局信息查询，会导致三次重排的进行，我们可以换一种风格实现：

        ```javascript
        var oDiv =  document.getElementById('div');
        oDiv.style.cssText = "border-left: 1px;padding: 10px;width: 100px;";
        ```

        优化后的代码，只进行一次重排，但是会覆盖原有的样式信息（这里的覆盖会清空原来所有的行内样式信息），因此也可以这么写：

        ```javascript
        oDiv.style.cssText += ";border-left: 1px;padding: 10px;width: 100px;";
        ```

        当然，我们也可以通过对类名的修改，类名事先在CSS中定义了对应的样式信息，来达到修改样式的需求，比如：

        ```javascript
        var oDiv =  document.getElementById('div');
            oDiv.className += "current";
        ```

  2. **Batching DOM changes 批量修改DOM**

        原文翻译是批量修改DOM，我的理解是批量DOM修改，这种方法是将会被多次修改的DOM元素，先从文档流摘除，然后批量修改，然后带回文档，这样仅仅在摘除和带回时发生两次重排，中间的多次修改，并不会带来重排。将元素从文档摘除有很多方法，比如将元素隐藏（`dispaly:none;`）、DOM之外新建一个文档片段修改后添加到原节点位置。

  3. **Caching Layout Information 缓冲布局信息**

        比如我们通过`setTimeout`实现一个动画：元素每10毫秒向右下方移动`1px`;从`100X100`移动到`500X500`：

        ```javascript
        myElement.style.left = 1 + myElement.offsetLeft + 'px'; 
        myElement.style.top = 1 + myElement.offsetTop + 'px'; 
        if (myElement.offsetLeft >= 500){
            stopAnimation();
        }
        ```

        代码中，我们每次查询`myElement.offsetLeft/myElement.offsetTop`值的时候，都引起了一次页面重排，一次循环中，至少进行了三次重排，性能糟糕的不要不要的，我们可以通过优化，将`myElement.offsetLeft/myElement.offsetTop`的值缓存起来：

        ```javascript
        var current = myElement.offsetLeft;
        ```

        循环内：

        ```javascript
        current++;
        myElement.style.left = current + 'px';
        myElement.style.top = current + 'px';
        if (current >= 500) { 
                stopAnimation();
            }
        ```

        将`myElement.offsetLeft`缓存起来，初始查询一次，之后不再进行查询，只引用变量`current`；而且在浏览器的优化后，每次循环只进行了一次重排，性能提升不是一点。

  4. **Take Elements Out of the Flow for Animations 将元素提出动画流**

        显示/隐藏部分页面、折叠/展开动画是很常见的动画交互模式。很多时候展开/折叠动画，会将页面一部分扩大，将下面的部分向下推开，这样，会带来不仅仅是展开部分的重排，包括下面的部分全部重排，而重排的性能消耗，和影响的渲染树程度有关，因此我们可以减少对页面影响部分来实现减小重排带来的性能消耗。
     - (1) 使用绝对坐标定位页面动画部分，使其脱离于页面文档布局流之外，这样它的改变对其他文档的位置尺寸等信息无影响，不会引起其他部分重排
     - (2) 展开动作只在动画元素上进行，其下面的元素不随着动画元素展开推移，只是被遮盖，这样也不会引起大范围的渲染树重新计算
     - (3) 在动画结束后，再将下面的元素一次性移动，而不是动画过程中慢慢移动。

  5. **IE and :hover IE和:hover**

IE7+全面支持`:hover`，但是大量元素使用`:hover`会带来严重的性能问题。比如一个大型的表格，使用`tr:hover`来使鼠标光标所在行高亮时，会使cpu的使用率提升80%-90%。因此应当尽量避免大量元素使用`:hover`属性。

## Event Delegaton 事件托管

当页面上存在大量元素，而且每个元素都有一个或者多个事件句柄与之绑定的时候，可能会影响性能，因为挂接每个句柄都是有代价的，更多的页面标记和JavaScript代码，运行期需要访问和修改更多的DOM节点。更重要的是事件挂载发生在onload事件中，而这个时间段是有很多事要处理的，无形中影响到其他事件的处理。但是你给页面上一百个元素每人绑定了一个点击事件，但是可能只有十个可能会被真正点击调用，做了90%的无用功。
我们可以通过`事件托管`来处理这类需求，原理是事件冒泡，也就是在包裹元素上挂接一个句柄，用于处理其子元素发生的所有事件。比如在点击时，判断当前标签的类名，不同类名执行对应的操作，这样既不用给每一个元素绑定事件句柄，也实现了每个元素的点击事件处理。Jquery中的on可以给动态添加的元素绑定事件也是利用了事件托管的办法。

  [1]: http://www.html5rocks.com/zh/tutorials/internals/howbrowserswork/
  [2]: http://taligarsiel.com/Projects/howbrowserswork1.htm
  [3]: http://www.html5rocks.com/zh/tutorials/internals/howbrowserswork/