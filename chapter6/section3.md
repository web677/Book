# 关于数组基本方法细节的一道题

## 以下代码片段的输出结果是什么？

```javascript
var a = 'I am a web developer!'
var b = a.split('').reverse().join('')

console.log(b)
```

## 结果

```text
!repoleved bew a ma I
```

## 分析与思考

这题其实很简单，自己之前做过还是被坑到了。主要就一个点，`split('')`和`split(' ')`的区别，前者会将字符串中的字符全部拆开组成数组，后者以空格为分隔把字符串拆开，也就是每个单词是数组的一项。