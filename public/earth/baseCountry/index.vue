<template>
  <div id="main" style="width: 100%; height: 100%"></div>
</template>

<script setup>
import * as echarts from 'echarts'
import { registerMap } from 'echarts/core'
import mapInfo from '@/assets/geo/world.json'
import 'echarts-gl'
import { onMounted } from 'vue'
var globeChart = null
var mapChart = null
import centers from '@/assets/data/world.json'

function addthreeDot() {
  var data = []
  for (const center of centers) {
    data.push([center[0], center[1], Math.random() * 10])
  }
  return data
} // 地图配置
function addDot() {
  var data = []
  for (const center of centers) {
    data.push([center[0], center[1]])
  }
  return data
} // 地图配置
registerMap('world', mapInfo)

function setMapOption() {
  const canvas = document.createElement('canvas')
  mapChart = echarts.init(canvas, null, {
    width: 2048,
    height: 1024,
  })
  mapChart.setOption({
    backgroundColor: '#337ecc',
    geo: {
      map: 'world',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      boundingCoords: [
        [-180, 90],
        [180, -90],
      ],
      itemStyle: {
        borderWidth: 1,
        normal: {
          borderColor: 'rgba(255,255,255,0.7)',
          areaColor: '#67c23a',
        },
      },
    },
    xAxis: {},
    yAxis: {
      scale: true,
    },
    series: [],
  })
}

function setGlobeOption(param) {
  globeChart = echarts.init(document.getElementById('main'))

  globeChart.setOption({
    globe: {
      baseTexture: mapChart,
      light: {
        ambient: {
          intensity: 0.5,
        },
      },
      atmosphere: {
        show: true,
        color: '#fff',
        intensity: 0.1,
      },
      viewControl: {
        center: [0, 0, 0],
        targetCoord: [105, 35], // 目标坐标，指向中国
        beta: 50,
        autoRotate: true,
        autoRotateAfterStill: 3,
      },
    },
    series: [],
  })
}
onMounted(() => {
  setMapOption()
  setGlobeOption()
})
</script>

<style scoped>
html,
body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  color: #602bdd;
  background-color: rgba(0, 0, 0, 0.8);
}

#main {
  width: 100%;
  height: 100%;
  min-height: 600px;
}
</style>
