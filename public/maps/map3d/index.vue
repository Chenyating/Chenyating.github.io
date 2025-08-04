<template>
  <LayoutTool>
    <el-button @click="ramdomAreaColor">随机省份颜色</el-button>
    <div ref="container" class="three-box"></div>
  </LayoutTool>
</template>

<script setup lang="ts">
import LayoutTool from '../../component/layoutTool.vue'
// 地图相关
import { initMap } from '../../../../utils/map3d'
import mapInfo from '../../../../assets/geo/CHN.json' // 地理信息
import * as THREE from 'three'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

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
  await scene.add(
    initMap(mapInfo, 'map', {
      areaColor: '#6d8cb3',
      lineColor: '#ffffff',
    })
  )
  container.value?.appendChild(renderer.domElement)
  controller.update()
  resizeRendererToDisplaySize()
  window.addEventListener('resize', resizeRendererToDisplaySize)
  setLight()
  animate()
  ramdomAreaColor()
})

onUnmounted(() => {
  cancelAnimationFrame(animationId)
})
// 随机区块颜色
function ramdomAreaColor() {
  const obj = scene.getObjectByName('map')
  const provinceList = obj.children[0].children

  const colors = ['#80caf1', '#6d8cb3', '#4ea7e7']

  provinceList.forEach((province: any) => {
    if (province instanceof THREE.Object3D) {
      const randomColor = parseInt(
        colors[Math.floor(Math.random() * colors.length)].replace('#', ''),
        16
      )
      province.traverse((child: any) => {
        if (child.isMesh && child.material && !child.isLine2) {
          child.material.color.setHex(randomColor)
        }
      })
    }
  })
}
</script>

<style lang="scss">
.three-box {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
