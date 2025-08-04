<template>
  <LayoutTool>
    <v-chart ref="chartRef" :option="option" autoresize style="width: 100%; height: 100%" />
  </LayoutTool>
</template>

<script setup>
import { use } from 'echarts/core'
import { ref } from 'vue'
import VChart from 'vue-echarts'
import {
  TooltipComponent,
  LegendComponent,
} from 'echarts/components'
use([TooltipComponent, LegendComponent])
import 'echarts-gl'
import LayoutTool from '../../component/layoutTool.vue'
import { getPie3DOption } from './config.js'

const option = ref(getPie3DOption())
</script>
