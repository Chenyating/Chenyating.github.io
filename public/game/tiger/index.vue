<template>
  <LayoutTool>
    <el-button type="primary" @click="lottery">抽奖{{ num }}</el-button>
    每次点击抽奖，会随机生成一个奖品，并进行抽奖动画，抽奖动画结束后，会停止抽奖，并显示当前奖品。
    <el-divider/>
    <div id="lottery">
      <div class="list">
        <div
          v-for="(item, index) in list"
          :key="index"
          class="item"
          :class="item.class"
        >
         {{index}}{{ item.name }}
        </div>
      </div>
    </div>
  </LayoutTool>
</template>

<script setup lang="ts">
import LayoutTool from '../../component/layoutTool.vue'
import { ref } from 'vue'

const currentid = ref(0)
const timer1 = ref<number | null>(null)
const timer2 = ref<number | null>(null)
const id = ref(0)
const num = ref(0)
const list = ref([
  {
    class: 'item-current',
    name: '一等奖',
  },
  {
    class: 'item-current-next1',
    name: '二等奖',
  },
  {
    class: 'item-current-next2',
    name: '三等奖',
  },
  {
    class: '', 
    name: '四等奖',
  },
  {
    class: '',
    name: '五等奖',
  },
  {
    class: '',
    name: '谢谢惠顾',
  },
  {
    class: '',
    name:"贴纸一枚"
  },
  {
    class: '',
    name: '谢谢惠顾',

  },
  {
    class: 'item-current-before2',
    name: '谢谢惠顾',

  },
  {
    class: 'item-current-before1',
    name:"贴纸十枚"

  },
])

function toright() {
  return new Promise<void>((resolve) => {
    const arr = JSON.parse(JSON.stringify(list.value))
    const item = arr[arr.length - 1]
    for (let i = list.value.length - 1; i > 0; i--) {
      list.value[i].class = list.value[i - 1].class
      if (list.value[i].class === 'item-current') {
        currentid.value = i
      }
    }
    list.value[0].class = item.class
    if (list.value[0].class === 'item-current') {
      currentid.value = 0
    }
    resolve()
  })
}

function doAnimation() {
  return new Promise<void>((resolve) => {
    id.value = 0
    timer1.value = setInterval(() => {
      id.value++
      toright()
      if (id.value > 10) {
        if (timer1.value) {
          clearInterval(timer1.value)
        }
        resolve()
      }
    }, 200)
  })
}

function lottery() {
  // 确定的奖品索引
  num.value = Math.floor(Math.random() * list.value.length)
  doAnimation().then(() => {
    timer2.value = setInterval(() => {
      toright()
      if (currentid.value === num.value) {
        if (timer2.value) {
          clearInterval(timer2.value)
        }
      }
    }, 400)
  })
}
</script>

<style scoped lang="scss">
.list {
  /* width: 1.9rem; */
  text-align: center;
  transition: all ease-in 0.1s;
  position: relative;
  width: 100px;
  height: 100px;
  background: green;
  overflow: hidden;
  // 每项样式
  .item {
    width: 100%;
    height: 40px;
    margin: 30px 0;
    transition: all ease-in 0.1s;
    position: absolute;
    display: none;
    left: 0;
    right: 0;
    color: black;
    background: pink;
    line-height: 40px;

    // 当前样式前面弟2个
    &-current-before2 {
      display: block;
      transform: translate3d(0, 100px, 0);
    }

    // 当前样式前面弟1个
    &-current-before1 {
      display: block;
      transform: translate3d(0, 50px, 0);
    }

    // 当前样式
    &-current {
      display: block;
      z-index: 999;
      transform: translate3d(0, 0, 0);
    }

    // 当前样式后面第1个
    &-current-next1 {
      display: block;
      transform: translate3d(0, -50px, 0);
    }

    // 当前样式后面第2个
    &-current-next2 {
      display: block;
      transform: translate3d(0, -100px, 0);
    }
  }
}
</style>
