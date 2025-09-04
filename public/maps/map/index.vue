<template>
  <LayoutTool>
    <div class="map-container">
      <div class="control-panel">
        <div class="control-section">
          <h4>Graphic 图片控制</h4>
          <el-switch
            v-model="showGraphicImage"
            active-text="显示 Graphic 图片"
            inactive-text="隐藏 Graphic 图片"
            @change="updateMapConfig"
          />
          
          <div v-if="showGraphicImage" class="graphic-settings">
            <div class="setting-item">
              <span class="setting-label">图片模式:</span>
              <el-radio-group v-model="graphicMode" @change="updateMapConfig" size="small">
                <el-radio label="cover">覆盖</el-radio>
                <el-radio label="contain">包含</el-radio>
                <el-radio label="stretch">拉伸</el-radio>
              </el-radio-group>
            </div>
            <div class="setting-item">
              <span class="setting-label">透明度:</span>
              <el-slider
                v-model="graphicOpacity"
                :min="0"
                :max="1"
                :step="0.1"
                @change="updateMapConfig"
                style="width: 150px;"
              />
            </div>
            <div class="setting-item">
              <el-switch
                v-model="enableCustomSizePosition"
                active-text="自定义尺寸和位置"
                inactive-text="按模式自动适配"
                @change="updateMapConfig"
              />
            </div>
            <div v-if="enableCustomSizePosition" class="setting-item">
              <div style="margin-bottom:8px;">
                <el-switch
                  v-model="maintainAspectRatio"
                  active-text="等比缩放"
                  inactive-text="自由缩放"
                  @change="updateMapConfig"
                />
              </div>
              <div v-if="maintainAspectRatio" style="margin: 6px 0 10px 0; display:flex; gap:12px; align-items:center; flex-wrap:wrap;">
                <el-switch
                  v-model="containerAspectScale"
                  active-text="按容器等比缩放"
                  inactive-text="按原图尺寸缩放"
                  @change="updateMapConfig"
                />
                <el-radio-group v-model="containerFitMode" @change="updateMapConfig" size="small" :disabled="!containerAspectScale">
                  <el-radio label="contain">按短边适配</el-radio>
                  <el-radio label="cover">按长边铺满</el-radio>
                </el-radio-group>
                <el-radio-group v-model="alignMode" @change="updateMapConfig" size="small" :disabled="!containerAspectScale">
                  <el-radio label="center">居中</el-radio>
                  <el-radio label="left">靠左</el-radio>
                </el-radio-group>
              </div>
              <div style="display:flex; gap:12px; flex-wrap:wrap; align-items:center;">
                <template v-if="maintainAspectRatio">
                  <div>
                    <span class="setting-label">缩放(%):</span>
                    <el-slider v-model="scalePercent" :min="10" :max="300" :step="5" @change="updateMapConfig" style="width:180px;" />
                  </div>
                </template>
                <template v-else>
                  <div>
                    <span class="setting-label">宽度(%):</span>
                    <el-slider v-model="graphicWidthPercent" :min="1" :max="100" @change="updateMapConfig" style="width:150px;" />
                  </div>
                  <div>
                    <span class="setting-label">高度(%):</span>
                    <el-slider v-model="graphicHeightPercent" :min="1" :max="100" @change="updateMapConfig" style="width:150px;" />
                  </div>
                </template>
                <div style="display:flex; align-items:center; gap:8px;">
                  <span class="setting-label">偏移单位:</span>
                  <el-radio-group v-model="offsetUnit" @change="updateMapConfig" size="small">
                    <el-radio label="percent">%</el-radio>
                    <el-radio label="pixel">px</el-radio>
                  </el-radio-group>
                </div>
                <div>
                  <span class="setting-label">左偏移(%):</span>
                  <template v-if="offsetUnit === 'percent'">
                    <el-slider v-model="graphicLeftPercent" :min="-100" :max="100" @change="updateMapConfig" style="width:150px;" />
                  </template>
                  <template v-else>
                    <el-input-number v-model="graphicLeftPx" :min="-5000" :max="5000" :step="10" size="small" @change="updateMapConfig" />
                  </template>
                </div>
                <div>
                  <span class="setting-label">上偏移(%):</span>
                  <template v-if="offsetUnit === 'percent'">
                    <el-slider v-model="graphicTopPercent" :min="-100" :max="100" @change="updateMapConfig" style="width:150px;" />
                  </template>
                  <template v-else>
                    <el-input-number v-model="graphicTopPx" :min="-5000" :max="5000" :step="10" size="small" @change="updateMapConfig" />
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="control-section">
          <h4>Graphic 图片上传</h4>
          <el-upload
            ref="graphicUploadRef"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleGraphicImageChange"
            accept=".jpg,.jpeg,.png,.gif,.webp,.svg"
            class="upload-demo"
          >
            <el-button type="success" size="small">
              <el-icon><Picture /></el-icon>
              上传 Graphic 图片
            </el-button>
          </el-upload>
          <div v-if="currentGraphicImage" class="current-graphic">
            当前 Graphic: {{ currentGraphicImage }}
            <el-button 
              type="text" 
              size="small" 
              @click="resetGraphicImage"
              style="margin-left: 10px; color: #f56c6c;"
            >
              重置
            </el-button>
          </div>
        </div>

        <div class="control-section">
          <h4>地图资源替换</h4>
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleFileChange"
            accept=".json,.geojson"
            class="upload-demo"
          >
            <el-button type="primary" size="small">
              <el-icon><Upload /></el-icon>
              上传GeoJSON文件
            </el-button>
          </el-upload>
          <div v-if="currentMapName" class="current-map">
            当前地图: {{ currentMapName }}
          </div>
        </div>
      </div>
      <div class="map-chart-container" ref="chartContainerRef">
        <v-chart
          ref="chartRef"
          :option="option"
          autoresize
          style="width: 100%; height: 100%"
        />
      </div>
    </div>
  </LayoutTool>
</template>
<script setup>
import { use, registerMap } from 'echarts/core'
import { MapChart } from 'echarts/charts'
import { TooltipComponent, VisualMapComponent,GraphicComponent,GridComponent} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import VChart from 'vue-echarts'
import { ElMessage } from 'element-plus'
import { Upload, Picture } from '@element-plus/icons-vue'
use([MapChart, TooltipComponent, CanvasRenderer, VisualMapComponent,GraphicComponent,GridComponent])

// 代码块——————————
import mapInfo from '@/assets/geo/CHN.json' // 地理信息
import { config } from './config' // echart配置
import LayoutTool from '../../component/layoutTool.vue'

// 地图相关状态
const currentMapName = ref('中国地图')
const uploadRef = ref()
const graphicUploadRef = ref()
const chartRef = ref()
const chartContainerRef = ref()
const containerWidth = ref(0)
const containerHeight = ref(0)

// 控制 Graphic 图片显示的开关
const showGraphicImage = ref(true)

// Graphic 图片相关状态
const currentGraphicImage = ref('')
const graphicImageUrl = ref('') // 初始为空，等待用户上传或设置默认图片

// Graphic 图片模式
const graphicMode = ref('cover') // cover, contain, stretch

// Graphic 图片透明度
const graphicOpacity = ref(0.8)
// 自定义尺寸与位置（按容器百分比）
const enableCustomSizePosition = ref(false)
const graphicWidthPercent = ref(100)
const graphicHeightPercent = ref(100)
const graphicLeftPercent = ref(0)
const graphicTopPercent = ref(0)
// 等比缩放
const maintainAspectRatio = ref(true)
const scalePercent = ref(100)
const originalImageWidth = ref(0)
const originalImageHeight = ref(0)
// 按容器等比缩放
const containerAspectScale = ref(true)
// contain: 按短边适配；cover: 按长边铺满
const containerFitMode = ref('contain')
// 对齐方式：center/left（top 依旧由偏移控制）
const alignMode = ref('center')
// 偏移单位与像素值
const offsetUnit = ref('percent') // percent | pixel
const graphicLeftPx = ref(0)
const graphicTopPx = ref(0)

// 初始化默认地图和默认 Graphic 图片
onMounted(() => {
  registerMap('中国地图', mapInfo)
  console.log('地图已注册:', '中国地图')
  
  // 设置一个默认的 Graphic 图片
  // 使用一个渐变背景作为默认背景
  graphicImageUrl.value = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZGRmZmZmO3N0b3Atb3BhY2l0eToxIiAvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM0MDllZmY7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyYWRpZW50KSIvPgo8L3N2Zz4='
  console.log('默认 Graphic 图片路径:', graphicImageUrl.value)

  const updateContainerSize = () => {
    if (!chartContainerRef.value) return
    const rect = chartContainerRef.value.getBoundingClientRect()
    containerWidth.value = Math.floor(rect.width)
    containerHeight.value = Math.floor(rect.height)
    // 触发一次配置更新
    updateMapConfig()
  }

  // 初始测量
  nextTick(updateContainerSize)
  // 监听窗口尺寸变化
  window.addEventListener('resize', updateContainerSize)

  // 保存清理函数
  cleanupFns.push(() => window.removeEventListener('resize', updateContainerSize))
})

const cleanupFns = []

onBeforeUnmount(() => {
  cleanupFns.forEach(fn => {
    try { fn() } catch {}
  })
})

// 处理 Graphic 图片上传
const handleGraphicImageChange = (file) => {
  // 验证文件类型
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
  if (!allowedTypes.includes(file.raw.type)) {
    ElMessage.error('请上传有效的图片文件（JPG、PNG、GIF、WebP、SVG格式）')
    return
  }

  // 验证文件大小（限制为10MB）
  const maxSize = 10 * 1024 * 1024
  if (file.raw.size > maxSize) {
    ElMessage.error('图片文件大小不能超过10MB')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      // 创建图片URL
      const imageUrl = e.target.result
      graphicImageUrl.value = imageUrl
      currentGraphicImage.value = file.name
      // 读取原始宽高
      const img = new Image()
      img.onload = () => {
        originalImageWidth.value = img.naturalWidth || img.width
        originalImageHeight.value = img.naturalHeight || img.height
        updateMapConfig()
      }
      img.src = imageUrl
      
      // 更新地图配置
      updateMapConfig()
      
      ElMessage.success(`Graphic 图片上传成功: ${file.name}`)
      
      // 清空输入
      graphicUploadRef.value.clearFiles()
      
    } catch (error) {
      ElMessage.error('Graphic 图片处理失败')
      console.error('Graphic 图片处理错误:', error)
    }
  }
  
  reader.readAsDataURL(file.raw)
}

// 处理文件上传
const handleFileChange = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const geoJsonData = JSON.parse(e.target.result)

      // 验证GeoJSON格式
      if (!geoJsonData.type || geoJsonData.type !== 'FeatureCollection') {
        ElMessage.error('请上传有效的GeoJSON文件（FeatureCollection格式）')
        return
      }

      // 生成新的地图名称
      const newMapName = `自定义地图_${Date.now()}`

      // 注册新地图
      registerMap(newMapName, geoJsonData)
      currentMapName.value = newMapName

      // 更新配置中的地图名称
      updateMapConfig()

      ElMessage.success(`地图加载成功: ${newMapName}`)

      // 清空输入
      uploadRef.value.clearFiles()
    } catch (error) {
      ElMessage.error('文件解析失败，请检查文件格式')
      console.error('GeoJSON解析错误:', error)
    }
  }

  reader.readAsText(file.raw)
}

// 根据开关状态动态生成配置
const option = computed(() => {
  const baseConfig = { ...config }

  // 更新地图名称
  baseConfig.series[0].map = currentMapName.value

  // 使用 graphic 控制背景图片显示
  if (showGraphicImage.value && graphicImageUrl.value) {
    // 根据模式设置不同的图片尺寸和位置
    const graphicStyle = {
      image: graphicImageUrl.value,
      opacity: graphicOpacity.value
    }
    
    if (enableCustomSizePosition.value) {
      if (maintainAspectRatio.value && originalImageWidth.value > 0 && originalImageHeight.value > 0) {
        if (containerAspectScale.value) {
          // 按容器等比缩放：根据容器与原图比例，按短边(contain)/长边(cover)适配
          const containerRatio = containerWidth.value / Math.max(1, containerHeight.value)
          const imageRatio = originalImageWidth.value / originalImageHeight.value
          let targetWidth, targetHeight
          if (containerFitMode.value === 'contain') {
            // 短边适配：结果完整显示，可能留白
            const scale = containerRatio > imageRatio
              ? containerHeight.value / originalImageHeight.value
              : containerWidth.value / originalImageWidth.value
            targetWidth = Math.floor(originalImageWidth.value * scale)
            targetHeight = Math.floor(originalImageHeight.value * scale)
          } else {
            // 长边铺满：结果充满容器，可能裁剪
            const scale = containerRatio > imageRatio
              ? containerWidth.value / originalImageWidth.value
              : containerHeight.value / originalImageHeight.value
            targetWidth = Math.floor(originalImageWidth.value * scale)
            targetHeight = Math.floor(originalImageHeight.value * scale)
          }
          graphicStyle.width = Math.max(1, targetWidth)
          graphicStyle.height = Math.max(1, targetHeight)
        } else {
          // 以原始尺寸为基准按 scalePercent 等比缩放
          const scale = Math.max(0.01, scalePercent.value / 100)
          graphicStyle.width = Math.max(1, Math.floor(originalImageWidth.value * scale))
          graphicStyle.height = Math.max(1, Math.floor(originalImageHeight.value * scale))
        }
      } else {
        // 自由缩放：使用百分比计算像素尺寸
        graphicStyle.width = Math.max(1, Math.floor(containerWidth.value * (graphicWidthPercent.value / 100)))
        graphicStyle.height = Math.max(1, Math.floor(containerHeight.value * (graphicHeightPercent.value / 100)))
      }
    } else {
      switch (graphicMode.value) {
        case 'cover':
          graphicStyle.width = containerWidth.value
          graphicStyle.height = containerHeight.value
          break
        case 'contain':
          graphicStyle.width = Math.floor(containerWidth.value * 0.8)
          graphicStyle.height = Math.floor(containerHeight.value * 0.8)
          break
        case 'stretch':
          graphicStyle.width = containerWidth.value
          graphicStyle.height = containerHeight.value
          break
      }
    }
    
    // 显示 Graphic 图片
    // 计算 left/top
    let leftValue
    if (enableCustomSizePosition.value) {
      if (containerAspectScale.value && maintainAspectRatio.value && alignMode.value === 'center') {
        // 居中：用字符串 'center'，交由 ECharts 居中
        leftValue = 'center'
      } else if (containerAspectScale.value && maintainAspectRatio.value && alignMode.value === 'left') {
        leftValue = 0
      } else {
        leftValue = offsetUnit.value === 'percent'
          ? Math.floor(containerWidth.value * (graphicLeftPercent.value / 100))
          : graphicLeftPx.value
      }
    } else {
      leftValue = (graphicMode.value === 'contain' ? 'center' : 0)
    }
    const topValue = enableCustomSizePosition.value
      ? (offsetUnit.value === 'percent'
          ? Math.floor(containerHeight.value * (graphicTopPercent.value / 100))
          : graphicTopPx.value)
      : (graphicMode.value === 'contain' ? 'center' : 0)

    baseConfig.graphic = {
      // 使用 zlevel 将图层放在最底层，避免与地图交互冲突
      // 同时保留 z 以保证元素内部顺序
      elements: [{
        type: 'image',
        z: -1,
        zlevel: -1,
        style: graphicStyle,
        left: leftValue,
        top: topValue
      }]
    }
    
    // 设置地图区域为半透明，让背景图片显示
    baseConfig.series[0].itemStyle = {
      normal: {
        areaColor: 'rgba(255, 255, 255, 0.0)',
        borderColor: '#333',
        borderWidth: 1
      },
    }
    baseConfig.series[0].emphasis = {
      itemStyle: {
        areaColor: 'rgba(255, 255, 255, 0.3)', // 高亮时稍微不透明
        borderColor: '#000',
        borderWidth: 2
      },
    }
  } else {
    // 隐藏 Graphic 图片
    baseConfig.graphic = {
      elements: []
    }
    
    // 使用纯色背景
    baseConfig.series[0].itemStyle = {
      normal: {
        areaColor: '#f0faff',
        borderColor: '#666',
        borderWidth: 1
      },
    }
    baseConfig.series[0].emphasis = {
      itemStyle: {
        areaColor: '#6d8cb3',
        borderColor: '#333',
        borderWidth: 2
      },
    }
  }

  console.log('地图配置已更新:', {
    mapName: currentMapName.value,
    showGraphic: showGraphicImage.value,
    graphicImage: graphicImageUrl.value,
    graphicMode: graphicMode.value,
    graphicOpacity: graphicOpacity.value,
    dataLength: baseConfig.series[0].data?.length || 0,
    graphicElements: baseConfig.graphic?.elements?.length || 0,
    graphicElementStyle: baseConfig.graphic?.elements?.[0]?.style || null,
  })

  return baseConfig
})

// 重置 Graphic 图片
const resetGraphicImage = () => {
  // 使用一个更美观的渐变背景
  graphicImageUrl.value = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZGRmZmZmO3N0b3Atb3BhY2l0eToxIiAvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM0MDllZmY7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyYWRpZW50KSIvPgo8L3N2Zz4='
  currentGraphicImage.value = ''
  updateMapConfig()
  ElMessage.success('Graphic 图片已重置为默认渐变背景')
}

// 更新地图配置的方法
const updateMapConfig = () => {
  // 由于使用了computed，配置会自动更新
  console.log('Graphic 图片显示状态:', showGraphicImage.value ? '开启' : '关闭')
  console.log('当前地图:', currentMapName.value)
  console.log('当前 Graphic 图片:', graphicImageUrl.value)
  console.log('当前 Graphic 模式:', graphicMode.value)
  console.log('当前 Graphic 透明度:', graphicOpacity.value)
}
// 代码块——————————
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: row;
  gap: 20px;
  padding: 20px;
  background-color: #f5f7fa;
}

.map-chart-container {
  flex: 1;
  width: 100%;
  height: calc(100% - 20px);
  min-height: 500px;
  position: relative;
}

.control-panel {
  flex: 0 0 300px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-height: 80vh;
  overflow-y: auto;
}

.control-section {
  margin-bottom: 20px;
}

.control-section:last-child {
  margin-bottom: 0;
}

.control-section h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #333;
  font-weight: 600;
}

.current-map,
.current-graphic {
  margin-top: 10px;
  padding: 8px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 12px;
  color: #606266;
  word-break: break-all;
}

.current-graphic {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.upload-demo {
  display: block;
}

.graphic-settings {
  margin-top: 15px;
}

.setting-item {
  margin-bottom: 10px;
}

.setting-label {
  font-size: 13px;
  color: #555;
  margin-right: 10px;
}

/* 滚动条样式 */
.control-panel::-webkit-scrollbar {
  width: 6px;
}

.control-panel::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.control-panel::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.control-panel::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
