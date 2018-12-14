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

令 `n = array.length`；第一遍，我们认为第1个（或第n个）元素为【已排序】，取第二个元素为被参照元素temp，若第一个元素大于temp，将第一个元素值赋给第二个，将temp的值赋给第一个，第二遍，取第三个元素插入在【已排序】元素中适当的位置。直到最后一个元素插入到合适的位置。这里的插入动作是：取第i个元素暂存为temp，然后判断i-1的元素是否大于temp，是则将i-1位向后移动一位到i，再判断i-2元素是否大于temp，大于则向右移动一位到i-1，以此类推；直至i-n不大于temp，则将temp放在i-n+1的位置。

<img src="../assets/images/6-5-2.gif" width="600" alt="选择排序">

```javascript
    function insertionSort(ary){
        var l = ary.length,
            i, j, temp;

        for (i = 1; i < l; i++) {
            j = i - 1;
            temp = ary[i];
            while(j >= 0 && ary[j] > temp){
                ary[j + 1] = ary[j];
                j--;
            }
            ary[j + 1] = temp;
        }
        return ary;
    }
```

- 时间复杂度：
  - 最佳情况：`T(n) = O(n)`
  - 最差情况：`T(n) = O(n²)`
  - 平均情况：`T(n) = O(n²)`

## 希尔排序


