<template>
  <LayoutTool>
    异形轮播，适用于手机端，可以左右切换
    <el-divider />
    <div
      id="carousel"
      class="carousel"
      @touchstart="touchstart"
      @touchend="touchend"
    >
      <div class="carousel-bd">
        <div
          v-for="(item, index) in list"
          :key="index"
          class="item"
          :class="item.class"
        >
          {{ item.class }}
        </div>
      </div>
    </div>
  </LayoutTool>
</template>

<script setup lang="ts">
import LayoutTool from '../../component/layoutTool.vue'
import { ref, onMounted, onUnmounted } from 'vue'

interface MousePoint {
  x1: number
  x2: number
}

interface ListItem {
  img?: string
  class?: string
}

const times = ref<NodeJS.Timeout | null>(null)
const mousept = ref<MousePoint>({
  x1: 0,
  x2: 0,
})
const list = ref<ListItem[]>([])
const infolist = ref<ListItem[]>([])

const toleft = (): Promise<void> => {
  return new Promise((resolve) => {
    const num = list.value.length
    const arr = JSON.parse(JSON.stringify(list.value))
    const item = arr[0]
    for (let i = 0; i < num - 1; i++) {
      list.value[i].class = list.value[i + 1].class
    }
    list.value[num - 1].class = item.class
    resolve()
  })
}

const toright = (): Promise<void> => {
  return new Promise((resolve) => {
    const arr = JSON.parse(JSON.stringify(list.value))
    const item = arr[arr.length - 1]
    for (let i = list.value.length - 1; i > 0; i--) {
      list.value[i].class = list.value[i - 1].class
    }
    list.value[0].class = item.class
    resolve()
  })
}

const touchstart = (e: TouchEvent) => {
  mousept.value.x1 = e.changedTouches[0].pageX
}

const touchend = (e: TouchEvent) => {
  mousept.value.x2 = e.changedTouches[0].pageX
  const distance = mousept.value.x2 - mousept.value.x1
  if (distance > 50) {
    if (times.value) clearInterval(times.value)
    toright().then(() => {
      times.value = setInterval(() => {
        toright()
      }, 1000)
    })
  }
  if (-distance > 50) {
    if (times.value) clearInterval(times.value)
    toleft().then(() => {
      times.value = setInterval(() => {
        toright()
      }, 1000)
    })
  }
}

const judgment = () => {
  infolist.value = [{ img: "22" }, { img: "333" }]
  const oldlist = JSON.parse(JSON.stringify(infolist.value))
  const listData = JSON.parse(JSON.stringify(infolist.value))
  
  if (infolist.value.length > 5) {
    listData[0].class = "item-current-1"
    listData[1].class = "item-current-2"
    listData[2].class = "item-current-3"
    listData[3].class = "item-current-4"
    listData[4].class = "item-current-5"
    for (let i = 5; i < infolist.value.length; i++) {
      listData[i].class = ""
    }
    list.value = listData
  } else {
    const times = Math.round(5 / infolist.value.length)
    let newlist: ListItem[] = []
    newlist = newlist.concat(listData)
    for (let j = 0; j < times - 1; j++) {
      newlist = newlist.concat(oldlist)
    }
    const listData2 = JSON.parse(JSON.stringify(newlist))
    listData2[0].class = "item-current-1"
    listData2[1].class = "item-current-2"
    listData2[2].class = "item-current-3"
    listData2[3].class = "item-current-4"
    listData2[4].class = "item-current-5"
    for (let i = 5; i < list.value.length; i++) {
      listData2[i].class = ""
    }
    list.value = listData2
  }
}

onMounted(() => {
  judgment()
  times.value = setInterval(() => {
    toleft()
  }, 1000)
})

onUnmounted(() => {
  if (times.value) {
    clearInterval(times.value)
  }
})
</script>

<style scoped lang="scss">
.carousel {
  width: 400px;
  position: relative;
  height: 300px;
  display: flex;
  justify-content: center;

  &-bd {
    // 注释去掉就是显示全部的的内容
    width: 100%;
    position: relative;
    overflow: hidden;
    height: 300px;
  }

  // 每项样式
  .item {
    transition: all 1s;
    width: 40%;
    height: 50px;
    position: absolute;
    display: none;
    left: 0;
    right: 0;
    background: red;
    margin: auto;
    color: #fff;
    font-size: 1em;

    // 当前样式前面弟2个
    &-current-1 {
      display: block;
      transform: scale(0.8) rotate(30deg) translate3d(200%, 0, 0);
    }

    // 当前样式前面弟1个
    &-current-2 {
      display: block;
      background: blue;
      transform: scale(0.9) rotate(15deg) translate3d(100%, 0, 0);
    }

    // 当前样式
    &-current-3 {
      display: block;
      z-index: 999;
      background: pink;
      transform: scale(1) rotate(0) translate3d(0, 0, 0);
    }

    // 当前样式后面第1个
    &-current-4 {
      background: green;
      display: block;
      transform: scale(0.9) rotate(-15deg) translate3d(-100%, 0, 0);
    }

    // 当前样式后面第2个
    &-current-5 {
      display: block;
      transform: scale(0.8) rotate(-30deg) translate3d(-200%, 0, 0);
    }
  }
}
</style>
