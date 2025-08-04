<template>
  <LayoutTool>
    <el-button @click="addthreeDot">创建3D点</el-button>
    <el-button @click="clearInstancedMeshes">移除所有的点</el-button>
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
}) // 清除所有 InstancedMesh 实例的函数
function clearInstancedMeshes() {
  // 遍历场景中的所有子对象
  scene.children.slice().forEach((child) => {
    // 使用 slice() 创建副本以避免遍历时修改数组
    // 检查对象是否是 InstancedMesh
    if (child instanceof THREE.InstancedMesh) {
      // 移除该实例
      scene.remove(child)

      // 销毁材质和几何体以释放内存
      if (child.material) {
        child.material.dispose()
      }
      if (child.geometry) {
        child.geometry.dispose()
      }
    }
  })

  // 强制更新场景
  scene.traverse(() => {})
  renderer.render(scene, camera)
}

// 1. 创建点的 Canvas 纹理（支持不同状态）
async function initThreeDot(data) {
  if (!Array.isArray(data)) return

  // 清除已有的 InstancedMesh 实例
  await clearInstancedMeshes()

  // 创建球体几何体（所有球体使用相同的几何体）
  const sphereGeometry = new THREE.SphereGeometry(0.3, 32, 32) // 半径0.2，细分数为32

  // 计算实例数量
  const instanceCount = data.reduce(
    (acc, item) => acc + item.coordinates.length,
    0
  )

  // 创建 InstancedMesh
  const material = new THREE.MeshBasicMaterial({
    vertexColors: true, // 启用顶点颜色
  })

  const instancedMesh = new THREE.InstancedMesh(
    sphereGeometry,
    material,
    instanceCount
  )

  // 创建颜色属性
  const color = new THREE.InstancedBufferAttribute(
    new Float32Array(instanceCount * 3),
    3
  )
  instancedMesh.geometry.setAttribute('color', color)
  // 遍历数据
  data.forEach((item, index) => {
    const { type, coordinates } = item
    // 使用lngLatToMector将经纬度转为three.js坐标
    const [x, y, z] = lngLatToMector(coordinates)
    const matrix = new THREE.Matrix4()
    matrix.setPosition(x, y, 0) // z轴可自定义
    // 根据类型设置颜色
    let instanceColor
    switch (type) {
      case 'noral':
        instanceColor = new THREE.Color(0x55ff82) // 绿色
        break
      case 'fault':
        instanceColor = new THREE.Color(0xff6479) // 红色
        break
      case 'offlinePower':
        instanceColor = new THREE.Color(0xffce41) // 黄色
        break
      default:
        instanceColor = new THREE.Color(0xaaddff) // 默认灰色
        break
    }
    // 设置实例的颜色
    color.setXYZ(index, instanceColor.r, instanceColor.g, instanceColor.b)
    // 设置实例的变换矩阵
    instancedMesh.setMatrixAt(index, matrix)
  })

  // 将 InstancedMesh 添加到场景
  scene.add(instancedMesh)
}

function addthreeDot() {
  var data = []
  var type = ['noral', 'fault', 'offlinePower']
  for (let i = 0; i < mapDots.length; i++) {
    data.push({
      type: type[Math.floor(Math.random() * 3)],
      coordinates: [mapDots[i][0], mapDots[i][1]],
    })
  }
  initThreeDot(data)
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
