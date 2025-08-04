<template>
  <LayoutTool>
    <el-button @click="addMarkers">添加标记</el-button>
    <el-button @click="addFlightLine" type="primary">添加飞线</el-button>
    <el-button @click="addName">添加名称</el-button>
    <el-button @click="drawMap" type="success">绘制立体地图</el-button>
    <div style="width: 100%; height: 100%; position: relative">
      <div ref="css2d" class="css2d"></div>
      <div ref="container" class="three-box"></div>
    </div>
  </LayoutTool>
</template>

<script setup lang="ts">
import LayoutTool from '../../component/layoutTool.vue'
// 地图相关
import {
  createEarth,
  addMarker,
  createBatchFlyingLines,
  latLngToVector3,
  updateLabelVisibility,
  initMap,
} from '../../../../utils/globe'
import * as THREE from 'three'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import centers from '../../../../assets/data/world.json'
import mapInfo from '../../../../assets/data/china.json'
import {
  CSS2DRenderer,
  CSS2DObject,
} from 'three/examples/jsm/renderers/CSS2DRenderer.js'

const container = ref<HTMLDivElement | null>(null)
// 场景设置
const scene = new THREE.Scene()
// camer设置
const camera = new THREE.PerspectiveCamera(75, 1, 1, 1000)
camera.position.set(0, 0, 170)
camera.lookAt(0, 0, 0)

// 渲染器
const renderer = new THREE.WebGLRenderer({
  antialias: true, // 开启抗锯齿
  alpha: true, // 支持透明背景
  preserveDrawingBuffer: false,
  powerPreference: 'high-performance',
})
renderer.shadowMap.enabled = true // 开启阴影
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1
renderer.outputEncoding = THREE.sRGBEncoding
renderer.setClearColor(0xffffff, 0) // 清除背景色，透明背景
renderer.sortObjects = true // 启用对象排序

// 控制器
const controller = new OrbitControls(camera, renderer.domElement)
controller.update()

let animationId: number
let earth: THREE.Group
let lastTime = 0
// css2d
const cssRenderer = new CSS2DRenderer()
const css2d = ref<HTMLDivElement | null>(null)
function initCss2d() {
  const width = css2d.value?.clientWidth || window.innerWidth
  const height = css2d.value?.clientHeight || window.innerHeight
  cssRenderer.setSize(width, height)
  css2d.value?.appendChild(cssRenderer.domElement)
}
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
    cssRenderer.setSize(width, height)
  }
}

// 设置光照
function setLight() {
  // 只使用环境光，提供均匀的照明
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
  scene.add(ambientLight)
}

function animate() {
  cssRenderer.render(scene, camera)
  renderer.render(scene, camera)
  controller.update()
  animationId = requestAnimationFrame(animate)
  updateLabelVisibility(mapNameContainer, camera)
}

onMounted(async () => {
  initCss2d()
  earth = createEarth()
  scene.add(earth)
  container.value?.appendChild(renderer.domElement)
  controller.update()
  resizeRendererToDisplaySize()
  window.addEventListener('resize', resizeRendererToDisplaySize)
  setLight()
  animate()
})

onUnmounted(() => {
  cancelAnimationFrame(animationId)
})

function addMarkers() {
  const marker = addMarker(centers)
  scene.add(marker)
}

function addFlightLine() {
  var data = []
  var n = Math.floor(centers.length / 2)
  for (let i = 0; i < n-1; i += 2) {
    data.push([centers[i], centers[i + 1]])
  }
  const flyingLine = createBatchFlyingLines(data)
  scene.add(flyingLine)
}

const mapNameContainer = new CSS2DObject(document.createElement('div'))
function addName() {
  // 创建一个父 CSS2DObject 容器
  mapNameContainer.element.className = 'map-name-container'

  for (let i = 0; i < centers.length; i++) {
    const p = centers[i]
    // 将经纬度转换为3D坐标
    const position = latLngToVector3(p[1], p[0], 100)

    // 创建每个省份名称的元素
    const boxEle = document.createElement('div')
    boxEle.className = 'map-name'
    boxEle.innerHTML = `
      <div class="map-name-txt">
        发射点
      </div>
     `
    // 创建 CSS2DObject，并将其作为 mapNameContainer 的子对象
    const css2dElement = new CSS2DObject(boxEle)
    css2dElement.position.copy(position) // 使用转换后的3D坐标
    css2dElement.layers.set(0)

    // 将省份的名称元素添加到父容器中
    mapNameContainer.add(css2dElement)
  }
  // 将父容器添加到场景
  scene.add(mapNameContainer)
}
function drawMap() {
  const map = initMap(mapInfo, 'china')
  scene.add(map)
}
</script>

<style lang="scss">
.three-box {
  position: relative;
  width: 100%;
  height: 100%;
}
.css2d {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
