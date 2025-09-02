<template>
  <LayoutTool>
    <div class="world-map-container">
      <div class="control-panel">
        <div class="size-control">
          <label>图表尺寸: {{ chartSize }}px</label>
          <el-slider
            v-model="chartSize"
            :min="200"
            :max="800"
            :step="10"
            @change="updateChartSize"
            style="width: 200px;"
          />
        </div>
      </div>
      <v-chart :option="option" autoresize class="world-map" :style="chartStyle" />
    </div>
  </LayoutTool>
</template>
<script setup>
import { use, registerMap } from 'echarts/core'
import { MapChart, EffectScatterChart } from 'echarts/charts'
import {
  TooltipComponent,
  VisualMapComponent,
  LegendComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { ref, computed } from 'vue'
import VChart from 'vue-echarts'
import { Map3DChart, Scatter3DChart, Bar3DChart } from 'echarts-gl/charts'
use([
  MapChart,
  TooltipComponent,
  CanvasRenderer,
  VisualMapComponent,
  EffectScatterChart,
  LegendComponent,
  Map3DChart,
  Scatter3DChart,
  Bar3DChart,
])

// 代码块——————————
import mapInfo from '@/assets/geo/world.json' // 地理信息
import { config } from './config' // echart配置
import LayoutTool from '../../component/layoutTool.vue'
import { setChinaMapCenter } from '../../../../utils/map'
registerMap('中国', setChinaMapCenter(mapInfo)) // 注册地图
const option = ref(config) // 配置赋值

// 图表尺寸控制
const chartSize = ref(300)

// 计算图表样式
const chartStyle = computed(() => ({
  width: `${chartSize.value}px`,
  height: `${chartSize.value}px`
}))

// 更新图表尺寸的方法
const updateChartSize = (value) => {
  chartSize.value = value
}
// 代码块——————————
</script>

<style scoped>
.world-map-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 1px solid #000;
  padding: 20px;
}

.control-panel {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.size-control {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.size-control label {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.world-map {
  transition: all 0.3s ease;
}
</style>
