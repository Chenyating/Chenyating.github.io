<template>
  <LayoutTool>
    书本翻页效果，点击书面，可以翻页
    <el-divider />
    <div id="book" class="book">
      <div
        v-for="(item, index) in list"
        :class="[item.class, { leftin: index == 0 }]"
        class="page"
        :key="index"
        :style="
          index % 2 == 1
            ? 'z-index:' + (list.length - index)
            : 'z-index:' + index
        "
        @click="clickpage(index)"
      >
        第{{ index + 1 }}页
      </div>
    </div>
  </LayoutTool>
</template>

<script setup lang="ts">
import LayoutTool from '../../component/layoutTool.vue'
import { ref } from 'vue'
const list = ref([
  {
    name: 'page1',
    class: '',
  },
  {
    name: 'page2',
    class: '',
  },
  {
    name: 'page3',
    class: '',
  },
  {
    name: 'page4',
    class: '',
  },
  {
    name: 'page5',
    class: '',
  },
  {
    name: 'page6',
    class: '',
  },
  {
    name: 'page6',
    class: '',
  },
])
function clickpage(id) {
  if (id > 0 && id != list.value.length - 1) {
    if (id % 2 == 0) {
      list.value[id].class = 'leftout'
      list.value[id - 1].class = 'rightin'
    } else {
      list.value[id + 1].class = 'leftin'
      list.value[id].class = 'rightout'
    }
  }
  if (id == list.value.length - 1) {
    list.value[id].class = 'leftout'
    list.value[id - 1].class = 'rightin'
  }
}
</script>

<style scoped lang="scss">
.book {
  width: 200px;
  height: 200px;
  position: relative;
  z-index: 2;
  display: flex;
}
.page {
  position: absolute;
  width: 50%;
  height: 100%;
  border: solid 1px red;
  background: pink;
  &:nth-child(odd) {
    position: absolute;
    width: 50%;
    height: 100%;
    left: 0;
    transform-origin: right;
    transform: rotateY(90deg);
    background: yellow;
  }
  &:nth-child(even) {
    position: absolute;
    width: 50%;
    height: 100%;
    right: 0;
    transform-origin: left;
  }
}
.leftin {
  transition: all ease-in 0.3s 0.3s;
  transform-origin: right center;
  transform: rotateY(0deg) !important;
}
.leftout {
  transition: all ease-in 0.3s;
  transform-origin: right center;
  transform: rotateY(90deg);
}
.rightout {
  transition: all ease-in 0.3s;
  transform: rotateY(-90deg);
  transform-origin: left center;
}
.rightin {
  transform: rotateY(0deg);
  transition: all ease-in 0.3s 0.3s;
  transform-origin: left center;
}
</style>
