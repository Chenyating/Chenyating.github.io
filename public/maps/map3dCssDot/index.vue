<template>
  <LayoutTool>
    <el-button @click="addthreeDot">创建2D点</el-button>
    <el-button @click="removeAllCss2dObjects">移除所有的点</el-button>
    <div style="width: 100%; height: 100%; position: relative">
      <div ref="css2d" class="css2d"></div>
      <div ref="container" class="three-box"></div>
    </div>
  </LayoutTool>
</template>

<script setup lang="ts">
import LayoutTool from '../../component/layoutTool.vue'
// 地图相关
import { initMap, lngLatToMector } from '../../../../utils/map3d'
import mapInfo from '../../../../assets/geo/CHN.json' // 地理信息
import mapDots from '../../../../assets/data/centers.json'
import * as THREE from 'three'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import {
  CSS2DRenderer,
  CSS2DObject,
} from 'three/examples/jsm/renderers/CSS2DRenderer.js'
const container = ref<HTMLDivElement | null>(null)
// 场景设置
const scene = new THREE.Scene()
// camer设置
const camera = new THREE.PerspectiveCamera(75, 1, 1, 1000)
camera.position.set(0, 0, 60)
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

// css2d
const cssRenderer = new CSS2DRenderer()
const css2d = ref<HTMLDivElement | null>(null)
function initCss2d() {
  const width = css2d.value?.clientWidth || window.innerWidth
  const height = css2d.value?.clientHeight || window.innerHeight
  cssRenderer.setSize(width, height)
  css2d.value?.appendChild(cssRenderer.domElement)
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
    cssRenderer.setSize(width, height)
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
  cssRenderer.render(scene, camera)
  renderer.render(scene, camera)
  controller.update()
  animationId = requestAnimationFrame(animate)
}
onMounted(async () => {
  await scene.add(
    initMap(mapInfo, 'map', {
      areaColor: '#6d8cb3',
      lineColor: '#ffffff',
    })
  )

  container.value?.appendChild(renderer.domElement)
  await initCss2d()
  controller.update()
  resizeRendererToDisplaySize()
  window.addEventListener('resize', resizeRendererToDisplaySize)
  setLight()
  animate()
})

onUnmounted(() => {
  cancelAnimationFrame(animationId)
})

watch(container, () => {
  resizeRendererToDisplaySize()
})
function removeAllCss2dObjects() {
  // 确保 scene 是有效的
  if (!scene || !scene.children) {
    console.error('scene is not properly initialized')
    return
  }

  const objectsToRemove: any[] = [] // 用来存储待移除的 CSS2DObject

  // 遍历场景中的所有对象
  scene.traverse((object) => {
    // 判断是否为 CSS2DObject
    if (object.isCSS2DObject) {
      objectsToRemove.push(object) // 将待移除的对象添加到数组
    }
  })

  // 批量移除所有对象
  objectsToRemove.forEach((object) => {
    scene.remove(object)
    if (object.element) {
      object.element.remove() // 清理 DOM 元素
    }
  })
} // 清除所有 InstancedMesh 实例的函数
let mapDotContainer: any = null
function initCssDot(data: any[]) {
  if (!Array.isArray(data)) return

  // 1. 移除上一次的 dot 容器
  if (mapDotContainer) {
    scene.remove(mapDotContainer)
    mapDotContainer = null
  }

  // 2. 创建新的 dot 容器
  mapDotContainer = new CSS2DObject(document.createElement('div'))
  mapDotContainer.element.className = 'map-dot'

  data.forEach((item) => {
    const { type, coordinates } = item
    const div = document.createElement('div')
    switch (type) {
      case 'noral':
        div.className = 'dot-success'
        break
      case 'fault':
        div.className = 'dot-error'
        break
      case 'offlinePower':
        div.className = 'dot-warming'
        break
      default:
        div.className = 'dot-other'
        break
    }
    const [x, y, z] = lngLatToMector(coordinates)
    const css2dObject = new CSS2DObject(div)
    css2dObject.position.set(x, y, z)
    mapDotContainer.add(css2dObject)
  })
  scene.add(mapDotContainer)
}

function addthreeDot() {
  // 创建随机的点
  var data = []
  var type = ['noral', 'fault', 'offlinePower']
  for (let i = 0; i < mapDots.length; i++) {
    data.push({
      type: type[Math.floor(Math.random() * 3)],
      coordinates: [mapDots[i][0], mapDots[i][1]],
    })
  }
  initCssDot(data)
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
  .dot-success {
    width: 4px;
    height: 4px;
    background: #55ff82;
    position: relative;
    border-radius: 100%;
    z-index: 1;
  }
  .dot-error {
    width: 4px;
    height: 4px;
    background: #ff6479;
    position: relative;
    border-radius: 100%;
    z-index: 1;
  }
  .dot-warming {
    width: 4px;
    height: 4px;
    background: #ffce41;
    position: relative;
    border-radius: 100%;
    z-index: 1;
  }
  .dot-other {
    width: 4px;
    height: 4px;
    background: #aaddff;
    position: relative;
    border-radius: 100%;
    z-index: 1;
  }
}
</style>
