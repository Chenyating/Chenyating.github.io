<template>
  <LayoutTool>
    <v-chart :option="option" autoresize style="width: 100%; height: 100%" />
  </LayoutTool>
</template>
<script setup>
import { use, registerMap } from 'echarts/core'
import { MapChart } from 'echarts/charts'
import { TooltipComponent, VisualMapComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { ref } from 'vue'
import VChart from 'vue-echarts'
use([MapChart, TooltipComponent, CanvasRenderer, VisualMapComponent])

// 代码块——————————
import mapInfo from '@/assets/geo/CHN.json' // 地理信息
import { config } from './config' // echart配置
import LayoutTool from '../../component/layoutTool.vue'
registerMap('中国', mapInfo) // 注册地图
const option = ref(config) // 配置赋值
// 代码块——————————
</script>
