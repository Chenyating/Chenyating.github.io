<template>
  <LayoutTool>
    <el-button @click="initMapName">创建css2d元素</el-button>
    <el-button @click="removeAllCss2dObjects">移除所有css2d元素</el-button>
    <div style="width: 100%; height: 100%; position: relative">
      <div ref="css2d" class="css2d"></div>
      <div ref="container" class="three-box"></div>
    </div>
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
}
/**
 * @description: 创建一个2d元素，返回css2dobject后，可用sences.add添加
 * @param {*} position 坐标位置
 * @param {*} id id序列号
 * @param {*} name 名称
 */
function initMapName() {
  const obj = scene.getObjectByName('map') // 获取场景中名为 'map' 的对象
  if (!obj) return
  const provinceList = obj.children[0].children

  // 创建一个父 CSS2DObject 容器
  const mapNameContainer = new CSS2DObject(document.createElement('div'))
  mapNameContainer.element.className = 'map-name-container'

  for (let i = 0; i < provinceList.length; i++) {
    const province = provinceList[i]
    const p = province.center

    if (p !== undefined) {
      // 创建每个省份名称的元素
      const boxEle = document.createElement('div')
      boxEle.className = 'map-name'
      boxEle.innerHTML = `
        <div class="map-name-txt">
          ${province.name}
        </div>
       `
      boxEle.innerText = province.name.replace(/省|市|自治区|特别行政区/g, '')
      // 创建 CSS2DObject，并将其作为 mapNameContainer 的子对象
      const css2dElement = new CSS2DObject(boxEle)
      css2dElement.name = province.name // 确保 name 赋值正确
      css2dElement.position.set(p[0] - 1, p[1], 0)
      css2dElement.layers.set(0)

      // 将省份的名称元素添加到父容器中
      mapNameContainer.add(css2dElement)
    }
  }

  // 将父容器添加到场景
  scene.add(mapNameContainer)
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
