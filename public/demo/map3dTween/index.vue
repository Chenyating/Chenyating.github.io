<template>
  <LayoutTool>
    <el-button-group>
      <el-button type="primary" @click="startTween">开始动画</el-button>
      <el-button @click="removeAllTween">停止补间动画</el-button>
    </el-button-group>
    &nbsp;
    <el-button-group>
      <el-button type="primary" @click="initMapName">创建地图名称</el-button>
      <el-button @click="removeAllCss2dObjects">移除所有地图名称</el-button>
    </el-button-group>
    &nbsp;
    <el-button-group>
      <el-button type="primary" @click="addthreeDot">创建点元素</el-button>
      <el-button @click="clearInstancedMeshes">清除点元素</el-button>
    </el-button-group>
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
import TWEEN, { Tween } from '@tweenjs/tween.js'
let tweenArr: Tween<{ z: number }>[] = [] // 存储 Tween 动画的数组
import {
  CSS2DRenderer,
  CSS2DObject,
} from 'three/examples/jsm/renderers/CSS2DRenderer.js'
const container = ref<HTMLDivElement | null>(null)
// 场景设置
const scene = new THREE.Scene()
// camer设置
const camera = new THREE.PerspectiveCamera(75, 1, 1, 1000)
camera.position.set(0, -55, 50)
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
  TWEEN.update() // 更新 tween 动画
  animationId = requestAnimationFrame(animate)
}
onMounted(async () => {
  await scene.add(
    initMap(mapInfo, 'map', {
      areaColor: '#0359B4',
      lineColor: '#57FAFF',
    })
  )
  ramdomAreaColor()
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
// 随机区块颜色
function ramdomAreaColor() {
  const obj = scene.getObjectByName('map')
  const provinceList = obj.children[0].children

  const colors = ['#0359B4', '#1582FF', '#092666', '#409eff']

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
        if (child.isLine2) {
          child.material.color.setHex(parseInt('#ffffff'.replace('#', ''), 16)) // 红色
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
        if (child.isLine2) {
          child.material.color.setHex(parseInt('#57FAFF'.replace('#', ''), 16)) // 红色
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
      let css2dElement = initborder(p, province)
      tweenArr.push(
        addTween(
          province,
          i,
          () => {
            scene.add(css2dElement)
            console.log('start')
          },
          () => {
            scene.remove(css2dElement) // 清除后，就没有过度动画了
            console.log('end')
          }
        )
      ) // 添加 Tween 动画到数组中
    }
  }

  tweenArr[0].start() // 开始第一个动画
}
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
      boxEle.innerText = province.name.replace(/省|市|自治区|特别行政区/g, '')
      // 创建 CSS2DObject，并将其作为 mapNameContainer 的子对象
      const css2dElement = new CSS2DObject(boxEle)
      css2dElement.name = province.name // 确保 name 赋值正确
      css2dElement.position.set(p[0], p[1], 0)
      css2dElement.layers.set(0)

      // 将省份的名称元素添加到父容器中
      mapNameContainer.add(css2dElement)
    }
  }

  // 将父容器添加到场景
  scene.add(mapNameContainer)
}
/**
 * @description: 创建一个2d元素，返回css2dobject后，可用sences.add添加
 * @param {*} position 坐标位置
 * @param {*} info 元素信息
 */
function initborder(position: any, info: any | undefined) {
  const displayName = info?.name || '默认名称' // 确保展示名称不会为 undefined

  const boxEle = document.createElement('div')

  boxEle.innerHTML = `
  <div class="map-dot"  id="xn-border-${displayName}">  
    <div class="xn-border">
      <div class="province-name">${displayName}</div>
      <div class="txt">电站：<span>123座</span></div>
      <div class="txt">装机容器：<span>3434 MW</span></div>
      <div class="txt">今日发电量：<span>453454  KWh</span></div>
      <div class="txt">累计发电量：<span>3452  GWh</span></div>
      <div class="txt-group">
        <span class="txt-success">正常 5343 座</span>
        <span class="txt-error">故障 3523 座</span>
      </div>
      <div class="txt-group">
        <span class="txt-warming">离线 343 座</span>
        <span class="txt-info">其他 07869座</span>
      </div>
    </div>
  </div>`

  const css2dElement = new CSS2DObject(boxEle)
  css2dElement.name = displayName // 确保 name 赋值正确
  css2dElement.position.set(position[0], position[1], 5)
  return css2dElement
}
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
  data.forEach((item,index) => {
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
  // 地图名称
  .map-name {
    color: #fff;
    font-size: 12px;
    font-style: italic;
    font-weight: 700;
    text-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    position: relative;
    z-index: 1;
  }
  // 边框
  .map-dot {
    width: 10px;
    height: 10px;
    position: relative;
    opacity: 1;
    transition: opacity 1s ease;
    z-index: 9999; //层级拉到最高
    &.show {
      opacity: 1;
    }
    &.hide {
      opacity: 0;
    }
    @keyframes showborder {
      0% {
        transform: translateY(-30px);
        opacity: 0;
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .xn-border {
      border: 1px solid #44c0d5;
      background-color: rgba(2, 7, 42, 0.723);
      box-sizing: border-box;
      border-radius: 10px;
      width: 260px;
      height: 250px;
      padding: 28px 30px;
      position: absolute;
      right: 0;
      bottom: 0;
      animation: showborder 1s ease-in-out forwards;
      transition: all 1s ease;
      z-index: 9999;
      &::before {
        content: '';
        position: absolute;
        width: 95%;
        height: 95%;
        right: 0;
        bottom: 0;
        top: 0;
        left: 0;
        margin: auto;
        border: 1px dotted #44c0d5;
        border-radius: 10px;
      }
      .province-name {
        color: #57faff;
        font-size: 16px;
        font-weight: 700;
        text-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
      }
      .txt {
        color: #aaddff;
        font-size: 14px;
        margin: 7px 0;
        span {
          color: #fff;
        }
        &-success {
          color: #55ff82;
        }
        &-error {
          color: #ff6479;
        }
        &-warming {
          color: #ffce41;
        }
        &-info {
          color: #aaddff;
        }
        &-group {
          display: flex;
          justify-content: space-between;
        }
      }
    }
  }
}
</style>
