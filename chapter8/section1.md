# 路由和导航

## 路由管理

路由管理主要是为了实现页面切换。Flutter中，页面称为路由`Router`，由导航器`Navigator`控制，导航器维护一个路由栈，路由入栈(push)则打开新页面，路由出栈(pop)则关闭页面。Flutter中的页面切换就是`导航器`指挥`路由`入栈出栈的过程，即：`Navigator`来`push/pop`页面`Route`的过程。写写常用场景的demo。

## 页面跳转

- 核心方法：`Navigator.push()`、`Navigator.pop()`
- 功能：A调转到B，B返回A

```dart
//页面 A
body: Center(
    child: Column(children: <Widget>[
        Text('页面A内容'),
        FlatButton(
        child: Text('前往B页面'),
        onPressed: () {
            Navigator.push(context, MaterialPageRoute(builder: (context) {
            return new MyAppB();
            }));
        },
        )
    ]),
)

//页面 B
body: Center(
    child: Column(
    children: <Widget>[
        Text('页面B内容'),
        FlatButton(
        child: Text('返回上个页面'),
        onPressed: () {
            Navigator.pop(context);
        },
        )
    ],
    ),
)
```

## 使用命名路由(Named Route)实现页面跳转

- 核心方法：`Navigator.push()`、`Navigator.pop()`
- 功能：A调转到B，B返回A
- 提前定义好命名Map(routes)

```dart
//MaterialApp中
initialRoute: '/',
routes: {
    '/': (context) => MyAppA(),
    'b': (context) => MyAppB()
},

//页面A中
body: Center(
    child: Column(
        children: <Widget>[
        Text('页面A内容'),
        FlatButton(
            child: Text('前往B页面'),
            onPressed: (){
            Navigator.pushNamed(context, 'b');
            },
        )
        ],

    ),
),
```

## 路由传参c

- 给传递到页面`A`的参数

  - 定义A页面时，允许接收参数

    ```dart
    class MyPageA extends StatelessWidget {
        MyPageA({Key key, @required this.text}) : super(key: key);
        final String text;

        @override
        Widget build(BuildContext context) {
            // TODO: implement build
            return Scaffold(
            appBar: AppBar(title: Text('页面A')),
            body: Center(
                child: Column(
                children: <Widget>[
                    Text('页面A参数: $text'),
                ],
                ),
            ),
            );
        }
    }
    ```

  - new 页面A的实例时传入参数

    ```dart
    class MyApp extends StatelessWidget {
        @override
        Widget build(BuildContext context) {
            // TODO: implement build
            return new MaterialApp(
            title: '测试APP',
            theme: new ThemeData(
                primarySwatch: Colors.blue,
            ),
            home: new MyPageA(text: '我是页面A的参数'),
            );
        }
    }
    ```

- 从页面`B`返回页面`A`是传递参数

  - 在页面`A`跳转到`B`时，使用`await`等待`Navigator.push`返回值，即为页面B返回的返回值

  ```dart
  class MyPageA extends StatelessWidget {
    MyPageA({Key key, @required this.text}) : super(key: key);
    final String text;

    @override
    Widget build(BuildContext context) {
        // TODO: implement build
        return Scaffold(
        appBar: AppBar(title: Text('页面A')),
        body: Center(
            child: Column(
            children: <Widget>[
                Text('页面参数A: $text'),
                FlatButton(
                child: Text('前往B页面'),
                onPressed: () async {
                    var paramsFromPageB = await Navigator.push(context,
                        MaterialPageRoute(builder: (context) {
                        return new MyPageB();
                        })
                    );
                    print('从B页面返回了，带回了参数：$paramsFromPageB');
                },
                )
            ],
            ),
        ),
        );
    }
  }
  ```

  - 页面`B`在返回时,`Navigator.pop`方法中添加传递回来的参数
  
  ```dart
  class MyPageB extends StatelessWidget {

    @override
    Widget build(BuildContext context) {
        // TODO: implement build
        return Scaffold(
        appBar: AppBar(title: Text('页面B')),
        body: Center(
            child: Column(
            children: <Widget>[
                Text('这是页面B'),
                FlatButton(
                child: Text('返回页面A'),
                onPressed: () {
                    return Navigator.pop(context, 'A页面你好');
                },
                )
            ],
            ),
        ),
        );
    }
  }
    ```

- 命名路由传参

  匿名路由传参是在`new MyPageA('参数')`时传入参数，而命名路由直接通过`Navigator.pushNamed`将路由name入栈，调用时无`new`实例的动作，无法传参。可以通过`Navigator.of(context).pushNamed('A', arguments: '参数')`的方式传参；在A页面通过`ModalRoute.of(context).settings.arguments`接收参数。

  - 在目标页面接收并处理

  ```dart
  //MyApp:
  initialRoute: 'a',
  routes: {
    'a': (context) => new MyPageA(),
    'b': (context) => new MyPageB(),
  }
  //MyPageA
  body: Center(
    child: Column(
        children: <Widget>[
        Text('页面A'),
        FlatButton(
            child: Text('前往B页面'),
            onPressed: () async {
            var paramsFromPageB = await Navigator.of(context).pushNamed(
                'b', arguments: '给B的参数');
            print('从B页面返回了，带回了参数：$paramsFromPageB');
            }
        )
        ],
    ),
  )
  //MyPageB
  var args = ModalRoute.of(context).settings.arguments;
  //···
  body: Center(
    child: Column(
        children: <Widget>[
        Text('这是页面A传递过来的参数: $args'),
        FlatButton(
            child: Text('返回页面A'),
            onPressed: () {
            return Navigator.pop(context, 'A页面你好');
            },
        )
        ],
    ),
  ),
  ```

  - 在路由表中处理

  ```dart
  //MyApp:
  initialRoute: 'a',
  routes: {
    'a': (context) => new MyPageA(),
    'b': (context) => new MyPageB(text: ModalRoute.of(context).settings.arguments),
  }
  //MyPageA 同上
  //MyPageB 无需处理
  ```
