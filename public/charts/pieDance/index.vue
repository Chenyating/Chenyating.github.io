<template>
  <LayoutTool>
    <el-button @click="startPieDance">开始动画</el-button>
    <v-chart :option="option" autoresize style="width: 100%; height: 100%" />
  </LayoutTool>
</template>

<script setup>
import { use } from 'echarts/core'
import { ref } from 'vue'
import VChart from 'vue-echarts'
import { TooltipComponent, LegendComponent } from 'echarts/components'
use([TooltipComponent, LegendComponent])
import 'echarts-gl'
import LayoutTool from '../../component/layoutTool.vue'
import { getPie3DOption, getParametricEquation } from './config.js'
import { onUnmounted } from 'vue'

const option = ref(getPie3DOption())

let currentIndex = 0
let animationTimer = null
function updatePieHeight(option, index) {
  option.series.forEach((s, i) => {
    const h = i === index ? 1 : s.pieData.percent
    const { startRatio, endRatio } = s.pieData
    const k = 1 - 0.8
    s.parametricEquation = getParametricEquation(startRatio, endRatio, k, h)
  })
}

function pieDance() {
  if (animationTimer) {
    clearInterval(animationTimer)
    animationTimer = null
  }
  currentIndex = 0
  updatePieHeight(option.value, currentIndex) // 立即高亮第一个
  animationTimer = setInterval(() => {
    console.log(currentIndex)
    currentIndex = (currentIndex + 1) % option.value.series.length
    updatePieHeight(option.value, currentIndex)
  }, 800)
}

function startPieDance() {
  pieDance()
}

onUnmounted(() => {
  clearInterval(animationTimer)
})
</script>
