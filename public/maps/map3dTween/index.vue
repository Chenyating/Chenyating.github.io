<template>
  <LayoutTool>
    <el-button @click="startTween">开始动画</el-button>
    <el-button @click="removeAllTween">停止补间动画</el-button>
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
import TWEEN, { Tween } from '@tweenjs/tween.js'
let tweenArr: Tween<{ z: number }>[] = [] // 存储 Tween 动画的数组

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
  TWEEN.update() // 更新 tween 动画
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
})

onUnmounted(() => {
  cancelAnimationFrame(animationId)
})

watch(container, () => {
  resizeRendererToDisplaySize()
})

/**
 * @description: 创建多个补间动画，并随机执行
 * @obj 模型
 * @return {*}
 */
function addTween(
  obj: THREE.Object3D<THREE.Event> | undefined,
  i: number,
  update: Function,
  complete: Function
) {
  const startPosition = { z: 0 } // 动画起始位置
  const targetPosition = { z: 4 } // 动画目标位置
  function getRandomIndex(currentIndex: number, maxLength: number) {
    let randomIndex = Math.floor(Math.random() * maxLength)
    while (randomIndex === currentIndex) {
      randomIndex = Math.floor(Math.random() * maxLength)
    }
    return randomIndex // 返回满足条件的随机索引
  }

  const tween = new TWEEN.Tween(startPosition) // 创建 Tween 动画对象
    .to(targetPosition, 1000) // 设置动画的目标值和持续时间
    .yoyo(true) // 反向播放动画
    .repeat(1) // 重复播放 1 次
    .easing(TWEEN.Easing.Quadratic.InOut) // 缓动函数
    .onStart(() => {
      // 动画开始时设置为红色
      obj?.traverse((child: any) => {
        if (child.isMesh && child.material && !child.isLine2) {
          child.material.color.setHex(parseInt('#ee767b'.replace('#', ''), 16)) // 红色
        }
      })
      update() // 正确调用
    })
    .onUpdate(() => {
      obj?.position.set(0, 0, startPosition.z) // 更新对象的位置
    })
    .onComplete(() => {
      obj?.position.set(0, 0, 0) // 动画完成后将对象位置重置
      // 动画结束时设置为绿色
      obj?.traverse((child: any) => {
        if (child.isMesh && child.material && !child.isLine2) {
          child.material.color.setHex(parseInt('#6d8cb3'.replace('#', ''), 16)) // 红色
        }
      })
      complete() // 5 秒延迟后移除
      let j = getRandomIndex(i, tweenArr.length)
      tweenArr[j].start() // 继续动画
    })

  return tween
}
function removeAllTween() {
  // 使用一个标记来控制是否可以清理所有动画
  let animationInProgress = false

  // 先检查 tweenArr 数组中的每个动画
  tweenArr.forEach((tween) => {
    // 如果动画正在执行，标记动画正在进行
    if (tween.isPlaying()) {
      animationInProgress = true
      // 为每个动画添加一个 onComplete 回调
      tween.onComplete(() => {
        // 动画完成后，删除这个动画
        tweenArr = tweenArr.filter((t) => t !== tween)
        if (tweenArr.length === 0 && !animationInProgress) {
          // 如果所有动画都已完成，清理所有动画
          TWEEN.removeAll()
        }
      })
    } else {
      // 如果动画没有执行，直接移除
      tweenArr = tweenArr.filter((t) => t !== tween)
    }
  })

  // 如果没有动画正在执行，可以直接清理
  if (!animationInProgress) {
    TWEEN.removeAll()
  }
}
function startTween() {
  removeAllTween()
  const obj = scene.getObjectByName('map')
  const provinceList = obj.children[0].children
  for (let i = 0; i < provinceList.length; i++) {
    const province = provinceList[i]
    const p = province.center
    if (p !== undefined) {
      tweenArr.push(
        addTween(
          province,
          i,
          () => {
            console.log('start')
          },
          () => {
            console.log('end')
          }
        )
      ) // 添加 Tween 动画到数组中
    }
  }

  tweenArr[0].start() // 开始第一个动画
}
</script>

<style lang="scss">
.three-box {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
