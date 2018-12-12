# 经典排序算法之JavaScript实现

## 冒泡排序

令 `n = array.length`；共n次排序；每次排序比较相邻的两个的大小，并确保大的在右边。第一遍排序后，可以确保最大的在第【`n`】位，第二遍排序可以确保**剩下的`n-1`个元素中最大（整体中的第二大）的**在第【`n - 1`】位；n次排序后，第n大的在`n - n`位，也就是最小的排到了最左边。

<img src="../assets/images/6-5-0.gif" width="600" alt="冒泡排序">

```javascript
    function bubbleSort(ary) {
        var i = ary.length,
            j, temp;

        do {
            for (j = 0; j < i; j++) {
                if (ary[j] > ary[j + 1]) {
                    temp = ary[j];
                    ary[j] = ary[j + 1];
                    ary[j + 1] = temp;
                }
            }
        } while (i--);

        return ary;
    }
```

- 时间复杂度：
  - 最佳情况：`T(n) = O(n)`
  - 最差情况：`T(n) = O(n²)`
  - 平均情况：`T(n) = O(n²)`

## 选择排序

令 `n = array.length`；共n次排序；每次排序记录**除已排序元素外**最大（最小）的元素，并在放在最右（最左）。时间复杂度固定为`T(n) = O(n²)`。

<img src="../assets/images/6-5-1.gif" width="600" alt="选择排序">

```javascript
    function selectionSort(ary){
        var i = ary.length,
            j, k, temp;

        while (i--) {
            k = 0;
            for(j = 0; j <= i; j++){
                if(ary[j] > ary[k]){
                    k = j;
                }
            }
            temp = ary[i];
            ary[i] = ary[k];
            ary[k] = temp;
        }

        return ary;
    }
```

- 时间复杂度：
  - 最佳情况：`T(n) = O(n²)`
  - 最差情况：`T(n) = O(n²)`
  - 平均情况：`T(n) = O(n²)`

## 插入排序



