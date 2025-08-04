<template>
  <LayoutTool>
    <v-chart :option="option" autoresize />
  </LayoutTool>
</template>
<script setup>
import { use } from 'echarts/core'
import { ref } from 'vue'
import VChart from 'vue-echarts'
import { GlobeComponent } from 'echarts-gl/components'
import { VisualMapComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

use([VisualMapComponent, GlobeComponent, CanvasRenderer])

// 代码块——————————
import { config } from './config' // echart配置
import LayoutTool from '../../component/layoutTool.vue'
const option = ref(config) // 配置赋值
// 代码块——————————
</script>
