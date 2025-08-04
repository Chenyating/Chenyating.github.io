<template>
  <LayoutTool>
    <el-button @click="initObjModel">加载obj模型</el-button>
    <el-button @click="initGlbModel">加载glb模型</el-button>
    <div ref="container" class="three-box"></div>
  </LayoutTool>
</template>

<script setup lang="ts">
import LayoutTool from '../../component/layoutTool.vue'
// 地图相关
import * as THREE from 'three'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js'

const container = ref<HTMLDivElement | null>(null)
// 场景设置
const scene = new THREE.Scene()
// camer设置
const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
camera.position.set(0, 0, 10)
camera.lookAt(0, 0, 0)

// 显示坐标
const axesHelper = new THREE.AxesHelper(5)
scene.add(axesHelper)

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
  let ambientLight = new THREE.AmbientLight(0xffffff, 1) // 环境光
  scene.add(ambientLight)
}
function animate() {
  // 3d渲染
  renderer.render(scene, camera)
  controller.update()
  animationId = requestAnimationFrame(animate)
}
function initObjModel() {
  const oldObj = scene.getObjectByName('objModel')
  if (oldObj) scene.remove(oldObj)

  const loader = new OBJLoader()
  loader.load(
    '/house.obj',
    (group) => {
      group.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshPhysicalMaterial({ color: 0x2194ce })
          child.castShadow = true
          child.receiveShadow = true
        }
      })
      group.name = 'objModel'
      group.position.set(0, 0, 0)
      group.scale.set(0.1, 0.1, 0.1)
      scene.add(group)
      console.log('OBJ模型加载完成', group)
    },
    undefined,
    (error) => {
      console.error('OBJ模型加载失败:', error)
    }
  )
}
function initGlbModel() {
  // 移除场景中已存在的模型（如果有）
  const oldModel = scene.getObjectByName('carModel')
  if (oldModel) {
    scene.remove(oldModel)
  }
  const loader = new GLTFLoader()
  const dracoLoader = new DRACOLoader()
  dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/') // 设置draco解码器路径（如未用draco可省略）
  loader.setDRACOLoader(dracoLoader)
  // 加载模型
  loader.load(
    '/earth.glb',
    (gltf) => {
      const model = gltf.scene
      model.name = 'carModel'
      // 可选：缩放/旋转/位置调整
      model.position.set(0, 0, 0)
      model.scale.set(1, 1, 1)
      scene.add(model)
    },
    undefined,
    (error) => {
      console.error('模型加载失败:', error)
    }
  )
}

onMounted(async () => {
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
</script>

<style lang="scss">
.three-box {
  width: 100%;
  height: 500px; /* 先写死高度试试 */
}
</style>
