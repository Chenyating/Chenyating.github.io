<template>
  <div class="map-container">
    <!-- 左侧图层控制面板 -->
    <div class="layer-panel">
      <div class="panel-header">
        <h3>地图文件对比</h3>
      </div>

      <!-- 图层列表 -->
      <div class="layer-list">
        <el-upload
          class="layer-item"
          v-if="!map1Name"
          :auto-upload="false"
          :show-file-list="false"
          accept=".json"
          :on-change="(file) => handleFileChange(file, 1)"
        >
          <el-button type="primary" size="small">上传文件1</el-button>
        </el-upload>
        <div class="layer-item" v-else>
          <div class="layer-controls">
            <div class="layer-info">
              <el-icon
                class="eye-icon"
                :class="{ 'eye-hidden': !showLayer1 }"
                @click="handleLayerChange(1, !showLayer1)"
              >
                <View v-if="showLayer1" />
                <Hide v-else />
              </el-icon>
              <el-upload
                :auto-upload="false"
                :show-file-list="false"
                accept=".json"
                :on-change="(file) => handleFileChange(file, 1)"
              >
                {{ map1Name }} <el-icon><RefreshLeft /></el-icon>
              </el-upload>
            </div>
            <el-button
              size="small"
              :type="controlLayer === 1 ? 'primary' : 'default'"
              @click="controlLayer = 1"
            >
              控制
            </el-button>
          </div>
          <div class="control-section">
            <div class="control-item">
              <span>透明度:</span>
              <el-slider
                v-model="opacity1"
                :min="0"
                :max="1"
                :step="0.1"
                :show-tooltip="true"
                @change="updateMapOption1"
              />
            </div>
            <div class="control-item">
              <span>缩放:</span>
              <el-input-number
                v-model="zoom1"
                :min="1"
                :max="100"
                size="small"
                @change="updateMapOption1"
              />
            </div>
          </div>
        </div>
        <el-upload
          class="layer-item"
          v-if="!map2Name"
          :auto-upload="false"
          :show-file-list="false"
          accept=".json"
          :on-change="(file) => handleFileChange(file, 2)"
        >
          <el-button type="success" size="small">上传文件2</el-button>
        </el-upload>
        <div class="layer-item" v-else>
          <div class="layer-controls">
            <div class="layer-info">
              <el-icon
                class="eye-icon"
                :class="{ 'eye-hidden': !showLayer2 }"
                @click="handleLayerChange(2, !showLayer2)"
              >
                <View v-if="showLayer2" />
                <Hide v-else />
              </el-icon>
              <el-upload
                :auto-upload="false"
                :show-file-list="false"
                accept=".json"
                :on-change="(file) => handleFileChange(file, 2)"
              >
                {{ map2Name }} <el-icon><RefreshLeft /></el-icon>
              </el-upload>
            </div>
            <el-button
              size="small"
              :type="controlLayer === 2 ? 'success' : 'default'"
              @click="controlLayer = 2"
            >
              控制
            </el-button>
          </div>
          <div class="control-section">
            <div class="control-item">
              <span>透明度:</span>
              <el-slider
                v-model="opacity2"
                :min="0"
                :max="1"
                :step="0.1"
                :show-tooltip="true"
                @change="updateMapOption2"
              />
            </div>
            <div class="control-item">
              <span>缩放:</span>
              <el-input-number
                v-model="zoom2"
                :min="1"
                :max="100"
                size="small"
                @change="updateMapOption2"
              />
            </div>
          </div>
        </div>
      </div>
      <!-- 操作按钮 -->
      <div class="panel-actions" v-if="map1Name || map2Name">
        <el-button type="warning" size="small" @click="resetToDefault" block>
          清空所有地图
        </el-button>
      </div>
    </div>

    <!-- 右侧地图展示区域 -->
    <div class="map-view">
      <!-- 地图1 -->
      <v-chart
        v-if="map1Name && showLayer1"
        :option="option1"
        autoresize
        :style="{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 1,
          pointerEvents: controlLayer === 1 ? 'auto' : 'none',
        }"
      />

      <!-- 地图2 -->
      <v-chart
        v-if="map2Name && showLayer2"
        :option="option2"
        autoresize
        :style="{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 2,
          pointerEvents: controlLayer === 2 ? 'auto' : 'none',
        }"
      />
    </div>
  </div>
</template>

<script setup>
import { use, registerMap } from 'echarts/core'
import { MapChart } from 'echarts/charts'
import { TooltipComponent, VisualMapComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { ref, watch } from 'vue'
import VChart from 'vue-echarts'
import { ElMessage } from 'element-plus'
import { View, Hide, RefreshLeft } from '@element-plus/icons-vue'

use([MapChart, TooltipComponent, CanvasRenderer, VisualMapComponent])

// 响应式数据
const map1Name = ref('')
const map2Name = ref('')
const controlLayer = ref(1)
const showLayer1 = ref(false)
const showLayer2 = ref(false)

// 透明度和缩放控制
const opacity1 = ref(0.5)
const opacity2 = ref(0.5)
const zoom1 = ref(50)
const zoom2 = ref(50)

// 将百分比转换为缩放值
const getZoomValue = (percentage) => {
  return 0.1 + (percentage / 100) * 1.9
}

// 地图配置
const option1 = ref({
  tooltip: {
    show: true,
  },
  series: [],
})

const option2 = ref({
  tooltip: {
    show: true,
  },
  series: [],
})

// 处理文件上传
const handleFileChange = (file, fileIndex) => {
  if (!file.raw) {
    ElMessage.error('文件读取失败')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const jsonData = JSON.parse(e.target.result)

      // 验证JSON结构
      if (!jsonData.features || !Array.isArray(jsonData.features)) {
        ElMessage.error('无效的地图JSON文件')
        return
      }

      // 获取文件名（去掉扩展名）
      const fileName = file.name.replace(/\.json$/i, '')
      const mapName = `地图${fileIndex}_${fileName}`

      // 注册新地图
      registerMap(mapName, jsonData)

      // 更新状态
      if (fileIndex === 1) {
        map1Name.value = mapName
        showLayer1.value = true
        updateMapOption1()
      } else {
        map2Name.value = mapName
        showLayer2.value = true
        updateMapOption2()
      }

      ElMessage.success(`地图文件${fileIndex}上传成功！`)
    } catch (error) {
      ElMessage.error('JSON文件解析失败')
    }
  }

  reader.readAsText(file.raw)
}

// 更新地图1配置
const updateMapOption1 = () => {
  if (showLayer1.value && map1Name.value) {
    option1.value.series = [
              {
          type: 'map',
        map: map1Name.value,
        data: [],
        zoom: getZoomValue(zoom1.value),
        roam: true, // 始终保持可交互
        emphasis: {
          label: { show: true },
        },
        itemStyle: {
          borderColor: 'red',
          borderWidth: 1,
          areaColor: `rgba(68,92,177, ${opacity1.value})`,
        },
      },
    ]
  } else {
    option1.value.series = []
  }
}

// 更新地图2配置
const updateMapOption2 = () => {
  if (showLayer2.value && map2Name.value) {
    option2.value.series = [
              {
          type: 'map',
        map: map2Name.value,
        data: [],
        zoom: getZoomValue(zoom2.value),
        roam: true, // 始终保持可交互
        emphasis: {
          label: { show: true },
        },
        itemStyle: {
          borderColor: 'blue',
          borderWidth: 1,
          areaColor: `rgba(86,167,83, ${opacity2.value})`,
        },
      },
    ]
  } else {
    option2.value.series = []
  }
}



// 处理显示图层变化
const handleLayerChange = (fileIndex, val) => {
  if (fileIndex === 1) {
    showLayer1.value = val
    if (val) {
      updateMapOption1()
    } else {
      option1.value.series = []
    }
  } else {
    showLayer2.value = val
    if (val) {
      updateMapOption2()
    } else {
      option2.value.series = []
    }
  }
}

// 重置为默认地图
const resetToDefault = () => {
  map1Name.value = ''
  map2Name.value = ''
  showLayer1.value = false
  showLayer2.value = false
  controlLayer.value = 1

  // 重置透明度和缩放
  opacity1.value = 0.6
  opacity2.value = 0.6
  zoom1.value = 50
  zoom2.value = 50

  option1.value.series = []
  option2.value.series = []

  ElMessage.info('已清空所有地图')
}
</script>

<style scoped lang="scss">
.map-container {
  display: flex;
  gap: 20px;
  padding: 20px;
  background-color: #f5f7fa;
}

.layer-panel {
  flex: 0 0 300px; /* 左侧控制面板固定宽度 */
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}







.layer-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.layer-item {
  padding: 8px 10px;
  background-color: #f9fafc;
  border-radius: 6px;
  border: 1px solid #e9e9eb;
}

.layer-info {
  display: flex;
  align-items: center;
  gap: 8px;
}



.layer-controls {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}



.map-view {
  flex: 1; /* 右侧地图展示区域自适应 */
  position: relative; /* 为绝对定位的子元素提供定位上下文 */
  min-height: 500px;
}





.control-item {
  display: flex;
  align-items: center;
  span {
    font-size: 12px;
    color: #666;
    min-width: 50px;
  }


}

.eye-icon {
  cursor: pointer;
  font-size: 18px;
  color: #409eff;
  transition: all 0.3s ease;
  margin-right: 8px;

  &:hover {
    transform: scale(1.1);
    color: #67c23a;
  }

  &.eye-hidden {
    color: #909399;

    &:hover {
      color: #f56c6c;
    }
  }
}
</style>
