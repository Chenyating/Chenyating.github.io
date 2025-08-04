<template>
  <LayoutTool>
    <el-button type="primary" @click="getGraphData">绘制</el-button>
    <div class="map-box">
      <div ref="container" class="three-box"></div>
      <v-chart
        :option="option"
        autoresize
        style="width: 100%; height: 100%"
        :update-options="{
          replaceMerge: replaceMergeArr,
        }"
      />
    </div>
  </LayoutTool>
</template>

<script setup lang="ts">
// 3d控制器
import { GUI } from 'three/addons/libs/lil-gui.module.min.js'

import LayoutTool from '../../component/layoutTool.vue'
import { onMounted, onUnmounted, ref, watch } from 'vue'
// 图表相关
import { use } from 'echarts/core'
import { MapChart, GraphChart } from 'echarts/charts'
import {
  TooltipComponent,
  VisualMapComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components'
import { graphData2, graphDataLinks } from '../../../../utils/charts'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
use([
  MapChart,
  GraphChart,
  TooltipComponent,
  CanvasRenderer,
  VisualMapComponent,
  LegendComponent,
  GridComponent,
])
const option = ref<any>(config) // 配置赋值

// 地图相关
import { initMap, getPointPosition } from '../../../../utils/map3d'
import leftMap from '@/assets/geo/CHN/440000.json' // 地理信息
import rightMap from '@/assets/geo/CHN/350000.json' // 地理信息
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { config } from './config.js'
const replaceMergeArr = ref<string[]>([])
const container = ref<HTMLDivElement | null>(null) // 场景设置
const scene = new THREE.Scene() // camer设置
const camera = new THREE.PerspectiveCamera(75, 1, 1, 1000)
// const axesHelper = new THREE.AxesHelper(1000)// 创建一个坐标轴辅助工具，轴的长度为 50
// scene.add(axesHelper)// 将坐标轴辅助工具添加到场景中

camera.position.set(0, -30, 100)
camera.lookAt(0, 0, 0)

// 渲染器
const renderer = new THREE.WebGLRenderer()
renderer.shadowMap.enabled = true // 开启阴影
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1
renderer.outputEncoding = THREE.sRGBEncoding
renderer.setClearColor(0xffffff, 0) // 清除背景色，透明背景

// 控制器
const controller = new OrbitControls(camera, renderer.domElement)
controller.update()
// 3d控制器
let guiInstance: GUI | null = null
function initGui() {
  guiInstance = new GUI() //创建新gui控件

  // 相机位置控制
  const cameraControls = {
    positionX: camera.position.x,
    positionY: camera.position.y,
    positionZ: camera.position.z,
    fov: camera.fov,
    near: camera.near,
    far: camera.far,
  }

  // 创建相机位置控制器
  const cameraFolder = guiInstance.addFolder('相机位置')
  cameraFolder
    .add(cameraControls, 'positionX', -200, 200)
    .name('X坐标')
    .onChange(updateCameraPosition)
  cameraFolder
    .add(cameraControls, 'positionY', -200, 200)
    .name('Y坐标')
    .onChange(updateCameraPosition)
  cameraFolder
    .add(cameraControls, 'positionZ', -200, 200)
    .name('Z坐标')
    .onChange(updateCameraPosition)

  function updateCameraPosition() {
    camera.position.set(
      cameraControls.positionX,
      cameraControls.positionY,
      cameraControls.positionZ
    )
  }

  // 图表配置
  const chartConfig = {
    symbolSize: 30,
    lineWidth: 5,
    lineCurveness: 0.3,
    lineOpacity: 1,
    labelShow: true,
    labelFontSize: 12,
    labelColor: '#6F7079',
  }

  const chartFolder = guiInstance.addFolder('图表配置')
  chartFolder
    .add(chartConfig, 'symbolSize', 5, 100)
    .name('点大小')
    .onChange((value) => {
      if (option.value.series[0]) {
        option.value.series[0].symbolSize = value
      }
    })
  chartFolder
    .add(chartConfig, 'lineWidth', 1, 20)
    .name('线宽')
    .onChange((value) => {
      if (option.value.series[0] && option.value.series[0].lineStyle) {
        option.value.series[0].lineStyle.width = value
      }
    })
  chartFolder
    .add(chartConfig, 'lineCurveness', 0, 1)
    .name('线曲度')
    .onChange((value) => {
      if (option.value.series[0] && option.value.series[0].lineStyle) {
        option.value.series[0].lineStyle.curveness = value
      }
    })
  chartFolder
    .add(chartConfig, 'lineOpacity', 0, 1)
    .name('线透明度')
    .onChange((value) => {
      if (option.value.series[0] && option.value.series[0].lineStyle) {
        option.value.series[0].lineStyle.opacity = value
      }
    })
  chartFolder
    .add(chartConfig, 'labelShow')
    .name('显示标签')
    .onChange((value) => {
      if (option.value.series[0] && option.value.series[0].label) {
        option.value.series[0].label.show = value
      }
    })
  chartFolder
    .add(chartConfig, 'labelFontSize', 8, 24)
    .name('标签字体大小')
    .onChange((value) => {
      if (option.value.series[0] && option.value.series[0].label) {
        option.value.series[0].label.fontSize = value
      }
    })
  chartFolder
    .addColor(chartConfig, 'labelColor')
    .name('标签颜色')
    .onChange((value) => {
      if (option.value.series[0] && option.value.series[0].label) {
        option.value.series[0].label.color = value
      }
    })

  // 操作按钮
  const actionsFolder = guiInstance.addFolder('操作')
  actionsFolder
    .add(
      {
        resetCamera: () => {
          camera.position.set(0, 0, 70)
          camera.lookAt(0, 0, 0)
          controller.update()
        },
      },
      'resetCamera'
    )
    .name('重置相机')

  actionsFolder
    .add(
      {
        redrawMap: () => {
          drawDoubleMap()
        },
      },
      'redrawMap'
    )
    .name('重新绘制地图')

  actionsFolder
    .add(
      {
        updateChart: () => {
          getGraphData()
        },
      },
      'updateChart'
    )
    .name('更新图表')

  // 性能监控
  const performanceFolder = guiInstance.addFolder('性能监控')
  const stats = {
    fps: 0,
    triangles: 0,
    calls: 0,
  }

  performanceFolder.add(stats, 'fps').name('FPS').listen()
  performanceFolder.add(stats, 'triangles').name('三角形数量').listen()
  performanceFolder.add(stats, 'calls').name('渲染调用次数').listen()

  // 更新性能统计
  let lastTime = performance.now()
  const updateStats = () => {
    const currentTime = performance.now()
    stats.fps = Math.round(1000 / (currentTime - lastTime))
    lastTime = currentTime
    stats.triangles = renderer.info.render.triangles
    stats.calls = renderer.info.render.calls
  }

  // 在动画循环中更新统计
  const originalAnimate = animate
  const newAnimate = () => {
    updateStats()
    originalAnimate()
  }
  // 替换原来的 animate 函数
  Object.assign(animate, newAnimate)
}

let animationId: number
// 监听尺寸变化
function resizeRendererToDisplaySize() {
  const canvas = renderer.domElement
  const width = container.value?.clientWidth ?? window.innerWidth
  const height = container.value?.clientHeight ?? window.innerHeight
  const needResize = canvas.width !== width || canvas.height !== height

  if (needResize) {
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    getGraphData()
  }
}
function setLight() {
  let ambientLight = new THREE.AmbientLight(0xffffff, 0.2) // 环境光
  const light = new THREE.DirectionalLight(0xffffff, 1) // 平行光
  light.position.set(20, -50, 20)

  light.castShadow = true
  light.shadow.mapSize.width = 1024
  light.shadow.mapSize.height = 1024

  const pointLight = new THREE.PointLight(0xffffff, 1)
  pointLight.position.set(20, -50, 50)

  pointLight.castShadow = true
  pointLight.shadow.mapSize.width = 1024
  pointLight.shadow.mapSize.height = 1024

  const pointLight2 = new THREE.PointLight(0xffffff, 1)
  pointLight2.position.set(50, -50, 20)
  pointLight2.castShadow = true
  pointLight2.shadow.mapSize.width = 1024
  pointLight2.shadow.mapSize.height = 1024

  scene.add(ambientLight)
  scene.add(light)
  scene.add(pointLight)
  scene.add(pointLight2)
}
function animate() {
  // 3d渲染
  renderer.render(scene, camera)
  controller.update()
  animationId = requestAnimationFrame(animate)
}
onMounted(async () => {
  drawDoubleMap()
  container.value?.appendChild(renderer.domElement)
  controller.update()
  resizeRendererToDisplaySize()
  window.addEventListener('resize', resizeRendererToDisplaySize)
  setLight()
  animate()
  initGui()
})

onUnmounted(() => {
  cancelAnimationFrame(animationId)
  // 销毁GUI组件
  if (guiInstance) {
    guiInstance.destroy()
    guiInstance = null
  }
})

watch(container, () => {
  resizeRendererToDisplaySize()
})

var fromMap: any = null
var toMap: any = null
/**
 * 绘制3D地图
 * @param callback 绘制完成后的回调函数
 */
async function drawDoubleMap(callback: (() => void) | null = null) {
  // 清理场景中现有的地图对象（只移除Group类型）
  scene.children.slice().forEach((element) => {
    if (element.type === 'Group') {
      element.traverse((child: any) => {
        if (child.isMesh) {
          child.geometry.dispose()
          child.material.dispose()
        }
      })
      scene.remove(element)
    }
  })

  // 工具函数：生成地图对象并归零中心，返回Group
  function createMapGroup(
    mapData: any,
    name: string,
    targetCenter: [number, number, number]
  ) {
    const mapObj = initMap(mapData, name, { depth: -1 })
    // 缩放
    const bounds = new THREE.Box3().setFromObject(mapObj)
    const size = bounds.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y)
    const scale = 100 / maxDim
    mapObj.scale.set(scale, scale, scale)
    // 中心归零
    const centerOffset = new THREE.Box3()
      .setFromObject(mapObj)
      .getCenter(new THREE.Vector3())
      .negate()
    mapObj.position.add(centerOffset)
    // 放入Group并移动到目标中心
    const group = new THREE.Group()
    group.name = name + 'Container'
    group.add(mapObj)
    group.position.set(...targetCenter)
    return group
  }

  // 创建左右地图组
  fromMap = createMapGroup(leftMap, 'leftMap', [-50, 0, 0])
  toMap = createMapGroup(rightMap, 'rightMap', [50, 0, 0])

  // 添加到场景
  scene.add(fromMap)
  scene.add(toMap)
  // 回调
  if (callback) callback()
}

// 将 3D 点转换为屏幕坐标
function getGraphData() {
  // 示例数据，包含起点和终点的地理信息及收入
  var data: any = [
    {
      fromRegionalInfo: {
        adcode: 440100,
        name: '广州',
        position: [113.264385, 23.12911],
      },
      toRegionalInfo: {
        adcode: 350100,
        name: '福州',
        position: [119.296482, 26.074508],
      },
      income: 100,
    },
    {
      fromRegionalInfo: {
        adcode: 440100,
        name: '广州',
        position: [113.264385, 23.12911],
      },
      toRegionalInfo: {
        adcode: 350200,
        name: '厦门',
        position: [118.11022, 24.490474],
      },
      income: 100,
    },
    {
      fromRegionalInfo: {
        adcode: 440400,
        name: '珠海',
        position: [113.576206, 22.270718],
      },
      toRegionalInfo: {
        adcode: 350400,
        name: '三明',
        position: [117.642536, 26.269892],
      },
      income: 100,
    },
    {
      fromRegionalInfo: {
        adcode: 440700,
        name: '韶关',
        position: [113.594461, 24.804072],
      },
      toRegionalInfo: {
        adcode: 350500,
        name: '泉州',
        position: [118.58941, 24.901652],
      },
      income: 100,
    },
    {
      fromRegionalInfo: {
        adcode: 440800,
        name: '惠州',
        position: [114.41398, 23.11354],
      },
      toRegionalInfo: {
        adcode: 350600,
        name: '漳州',
        position: [117.66115, 24.510897],
      },
      income: 100,
    },
    {
      fromRegionalInfo: {
        adcode: 441200,
        name: '肇庆',
        position: [112.472529, 23.046701],
      },
      toRegionalInfo: {
        adcode: 350700,
        name: '南平',
        position: [118.181883, 27.333268],
      },
      income: 100,
    },
    {
      fromRegionalInfo: {
        adcode: 441900,
        name: '江门',
        position: [113.081611, 22.589747],
      },
      toRegionalInfo: {
        adcode: 350800,
        name: '龙岩',
        position: [117.027885, 25.096153],
      },
      income: 100,
    },
    {
      fromRegionalInfo: {
        adcode: 440600,
        name: '佛山',
        position: [113.12144, 23.02148],
      },
      toRegionalInfo: {
        adcode: 350900,
        name: '宁德',
        position: [119.527084, 26.655571],
      },
      income: 100,
    },
    {
      fromRegionalInfo: {
        adcode: 440500,
        name: '汕头',
        position: [116.7102, 23.3716],
      },
      toRegionalInfo: {
        adcode: 351000,
        name: '莆田',
        position: [119.00743, 25.43197],
      },
      income: 100,
    },
    {
      fromRegionalInfo: {
        adcode: 441800,
        name: '清远',
        position: [113.001826, 23.688185],
      },
      toRegionalInfo: {
        adcode: 351100,
        name: '沙县',
        position: [117.803333, 26.723055],
      },
      income: 100,
    },
    {
      fromRegionalInfo: {
        adcode: 445100,
        name: '潮州',
        position: [116.622888, 23.66194],
      },
      toRegionalInfo: {
        adcode: 351200,
        name: '永安',
        position: [117.371075, 25.9014],
      },
      income: 100,
    },
  ]
  // 如果没有数据则直接返回
  if (!data) return // 获得three坐标对应的canvs坐标

  // 将 three.js 世界坐标转换为 ECharts canvas 坐标
  function getxy(vector: any) {
    // 500, 300 分别为 ECharts 画布宽高（需与 option.xAxis.max/yAxis.max 保持一致）
    return [((vector.x + 1) * 500) / 2, ((-vector.y + 1) * 300) / 2]
  }

  // 通过 graphData2 获取所有起点和终点（去重）
  const { fromPointList, toPointList } = graphData2(
    data,
    'fromRegionalInfo',
    'toRegionalInfo'
  ) //起止点去重

  // 计算每个起点在 three.js 世界中的位置，并转换为 ECharts canvas 坐标
  for (let i = 0; i < fromPointList.length; i++) {
    var item = fromPointList[i]
    // getPointPosition 获取 three.js 世界坐标，project(camera) 转换为标准化设备坐标
    item.value = getxy(getPointPosition(fromMap, item.value).project(camera))
  }
  // 计算每个终点在 three.js 世界中的位置，并转换为 ECharts canvas 坐标
  for (let j = 0; j < toPointList.length; j++) {
    var item = toPointList[j]
    item.value = getxy(getPointPosition(toMap, item.value).project(camera))
  }
  // 合并所有点，赋值给 option 的 series[0].data，实现点的渲染
  option.value.series[0].data = [...fromPointList, ...toPointList] //绘制点
  // 生成连线数据，赋值给 option 的 series[0].links，实现线的渲染
  option.value.series[0].links = graphDataLinks(
    data,
    'fromRegionalInfo',
    'toRegionalInfo'
  ) //绘制线
  // 通知 ECharts 只更新 series 部分
  replaceMergeArr.value = ['series']
}
</script>

<style lang="scss">
.map-box {
  position: relative;
  width: 100%;
  height: 100%;
  .three-box {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    border: 1px solid red;
  }
}
</style>
