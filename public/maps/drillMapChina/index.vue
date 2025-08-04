<template>
  <LayoutTool>
    <el-breadcrumb>
      <el-breadcrumb-item
        v-for="(item, index) in levelHistory"
        :key="index"
        @click="changeMap(item, index)"
        >{{ item.name }}</el-breadcrumb-item
      >
    </el-breadcrumb>
    <v-chart
      :option="option"
      autoresize
      style="width: 100%; height: 100%"
      :update-options="{
        replaceMerge: replaceMergeArr,
      }"
      @click="chartPEvents"
    />
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
import LayoutTool from '../../component/layoutTool.vue'
import { getGeojson, resetMapColor } from '../../../../utils/map'
import mapInfo from '@/assets/geo/CHN.json' // 地理信息
import { config } from './config' // echart配置

registerMap('中国', mapInfo) // 注册地图
const option = ref(config) // 配置赋值
const replaceMergeArr = ref([])
option.value.series[0].data = mockData(mapInfo)
option.value.series[0].map = '中国'
let levelHistory = ref([
  { adcode: 'CHN', name: '中国', geo: mapInfo, type: 'country' },
])
// 点击区域
const chartPEvents = (e) => {
  if (e.seriesType == 'map' && e.data) {
    const echartInfo = e.data
    getGeojson(`CHN/${echartInfo.regionalInfo.adcode}`).then((res) => {
      // 获取到地理信息后，注册地图
      registerMap(echartInfo.regionalInfo.name, res)
      // 更新option数据
      option.value.series[0].data = mockData(res)
      option.value.series[0].map = echartInfo.regionalInfo.name
      replaceMergeArr.value = ['series']
      // 追加到面包屑历史
      levelHistory.value.push({
        adcode: echartInfo.regionalInfo.adcode,
        name: echartInfo.regionalInfo.name,
        geo: res,
        type: 'province',
      })
    })
  } else {
    window['$message'].info('当前暂无数据')
  }
}
// 面包屑点击切换层级
const changeMap = (item, index) => {
  // 只保留到当前点击的层级
  levelHistory.value = levelHistory.value.slice(0, index + 1)
  option.value.series[0].data = mockData(item.geo)
  option.value.series[0].map = item.name
  replaceMergeArr.value = ['series']
}
function mockData(res) {
  const infoData = res.features.map((f) => {
    const props = f.properties
    return {
      regionalInfo: {
        adcode: props.iso_a3 || props.adcode || props.name || '', //国家缩写/省份/城市
        name: props.name || '',
        position: props.center || props.centroid || [0, 0],
      },
      income: Math.floor(Math.random() * 1000),
      sale: Math.floor(Math.random() * 1000),
    }
  })
  var data = resetMapColor(infoData, 'sale', 'regionalInfo')
  return data
}
// 代码块——————————
</script>
