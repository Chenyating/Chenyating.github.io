<template>
  <div class="json-upload-container">
    <div>
      <h2>{{ title }}</h2>
      <div v-show="parsedData.length > 0">
        <slot />
      </div>
    </div>
    <!-- 文件上传区域 -->
    <el-upload
      v-loading="loading"
      element-loading-text="解析中..."
      drag
      :auto-upload="false"
      :show-file-list="false"
      :on-change="handleFileChange"
      :file-list="fileList"
      :disabled="loading"
      :multiple="!single"
      :accept="accept"
      class="upload-area"
    >
      <el-icon><upload-filled /></el-icon>
      <div>将JSON文件拖到此处，或<em>点击上传</em></div>
      <div>支持{{ single ? '单个' : '多个' }} JSON文件</div>
    </el-upload>

    <!-- 文件列表显示 -->
    <div v-if="fileList.length > 0" class="file-list">
      <h3>
        已选择的文件：
        <el-button @click="clearAllFiles" :disabled="fileList.length === 0">
          清空所有文件
        </el-button>
      </h3>
      <div class="file-item" v-for="(file, index) in fileList" :key="index">
        <span class="file-name">{{ file.name }}</span>
        <span class="file-size">{{ formatFileSize(file.size) }}</span>
        <el-tag
          class="file-status"
          size="small"
          :type="isFileParsed(file.name) ? 'success' : 'info'"
        >
          {{ isFileParsed(file.name) ? '已解析' : '未解析' }}
        </el-tag>
        <el-button size="small" type="danger" @click="removeFile(index)">
          删除
        </el-button>
      </div>
      <div class="action-buttons">
        <el-button
          type="primary"
          @click="parseAllFiles"
          :loading="loading"
          :disabled="fileList.length === 0"
        >
          解析所有文件
        </el-button>
      </div>
    </div>

    <!-- 解析数据展示 -->
    <div v-if="parsedData.length > 0" class="data-display">
      <h3>解析结果：</h3>
      <el-collapse v-model="activeNames" accordion>
        <el-collapse-item
          v-for="(fileData, fileIndex) in parsedData"
          :key="fileIndex"
          :name="fileIndex"
          :title="`文件: ${fileData.fileName}`"
        >
          <div class="file-data">
            <VueJsonPretty 
              :data="fileData.json" 
              :deep="2"
              :show-double-quotes="true"
              :show-length="true"
              :show-line="false"
              :select-on-click-node="true"
              :selectable="true"
              :highlight-selected-node="true"
              :highlight-mouseover-node="true"
              :show-icon="true"
              :collapsed-strings-length="50"
              :theme="'light'"
            />
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import VueJsonPretty from 'vue-json-pretty'
import 'vue-json-pretty/lib/styles.css'

const props = defineProps({
  title: {
    type: String,
    default: 'json文件',
  },
  accept: {
    type: String,
    default: '.json',
  },
  maxSizeMB: {
    type: Number,
    default: 10,
  },
  single: {
    type: Boolean,
    default: false,
  },
})

const loading = ref(false)
const fileList = ref([])
const parsedData = ref([])
const activeNames = ref([])

// 定义 emit 事件
const emit = defineEmits([
  'parsed-data-updated', // 解析数据更新时触发
])

// 方法
const handleFileChange = (uploadFile) => {
  if (props.single && fileList.value.length > 0) {
    ElMessage.warning('只能上传一个文件')
    return
  }

  if (!uploadFile) return

  // 类型校验
  const ext = uploadFile.name.toLowerCase().split('.').pop()
  const allowed = props.accept.split(',').map((s) => s.replace('.', '').trim())
  if (!allowed.includes(ext)) {
    ElMessage.error(`仅支持以下格式: ${props.accept}`)
    return
  }

  // 大小校验（MB）
  const sizeBytes = uploadFile.size || uploadFile.raw?.size || 0
  const maxBytes = props.maxSizeMB * 1024 * 1024
  if (sizeBytes > maxBytes) {
    ElMessage.error(`文件过大，需小于 ${props.maxSizeMB}MB`)
    return
  }

  // 去重：同名且大小一致视为重复，或 uid 已存在
  const duplicated = fileList.value.some(
    (f) =>
      (f.uid && f.uid === uploadFile.uid) ||
      (f.name === uploadFile.name && (f.size || f.raw?.size) === sizeBytes)
  )
  if (duplicated) {
    ElMessage.warning('文件已存在，请选择其他文件')
    return
  }

  fileList.value.push(uploadFile)
}

const removeFile = (index) => {
  const file = fileList.value[index]
  fileList.value.splice(index, 1)
  // 同时从解析结果中移除
  const dataIndex = parsedData.value.findIndex(
    (d) => d.fileName === file.name
  )
  if (dataIndex > -1) {
    parsedData.value.splice(dataIndex, 1)
  }
  ElMessage.success(`文件 ${file.name} 已移除`)
  emit('parsed-data-updated', {
    parsedData: parsedData.value,
    totalFiles: parsedData.value.length,
  })
}

const clearAllFiles = () => {
  fileList.value = []
  parsedData.value = []
  ElMessage.success('已清空所有文件')
  emit('parsed-data-updated', {
    parsedData: [],
    totalFiles: 0,
  })
}

const parseAllFiles = async () => {
  if (fileList.value.length === 0) {
    ElMessage.warning('请先选择文件')
    return
  }

  loading.value = true
  parsedData.value = []

  try {
    // 并发解析JSON文件
    const settled = await Promise.allSettled(
      fileList.value.map((file) => parseJsonFile(file.raw || file))
    )

    const results = []
    settled.forEach((res, idx) => {
      const file = fileList.value[idx]
      if (res.status === 'fulfilled') {
        results.push({
          fileName: file.name,
          json: res.value.json,
        })
      } else {
        ElMessage.error(
          `文件 ${file.name} 解析失败: ${res.reason?.message || res.reason}`
        )
      }
    })

    parsedData.value = results
    if (results.length > 0) {
      ElMessage.success(`所有文件解析完成，共解析 ${results.length} 个文件`)
      emit('parsed-data-updated', {
        parsedData: results,
        totalFiles: results.length,
      })
    }
  } catch (error) {
    console.error('批量解析失败:', error)
    ElMessage.error('批量解析过程中出现错误')
  } finally {
    loading.value = false
  }
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 判断某文件是否已解析
const isFileParsed = (fileName) => {
  return parsedData.value.some((d) => d.fileName === fileName)
}

// 解析JSON文件
const parseJsonFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result)
        resolve({ json: jsonData })
      } catch (error) {
        reject(new Error(`JSON解析失败: ${error.message}`))
      }
    }

    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsText(file)
  })
}
</script>

<style scoped>
.json-upload-container {
  padding: 20px;
  width: 100%;
}

.upload-area {
  margin: 20px 0;
}

.file-list {
  margin: 20px 0;
  padding: 15px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background-color: #fafafa;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  margin: 5px 0;
  background-color: white;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

.file-name {
  flex: 1;
  font-weight: 500;
}

.file-size {
  color: #909399;
  margin: 0 15px;
}

.file-status {
  margin-right: 10px;
}

.action-buttons {
  margin-top: 15px;
  display: flex;
  gap: 10px;
}

.data-display {
  margin-top: 30px;
}

.file-data {
  padding: 15px;
  background-color: white;
}

/* VueJsonPretty 组件样式优化 */
.file-data :deep(.vjs-tree) {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
}

.file-data :deep(.vjs-tree .vjs-tree__content) {
  max-height: 500px;
  overflow-y: auto;
}

.file-data :deep(.vjs-tree .vjs-tree__brackets) {
  color: #666;
}

.file-data :deep(.vjs-tree .vjs-tree__key) {
  color: #881391;
  font-weight: 500;
}

.file-data :deep(.vjs-tree .vjs-tree__value) {
  color: #1a1aa6;
}

.file-data :deep(.vjs-tree .vjs-tree__string) {
  color: #c41a16;
}

.file-data :deep(.vjs-tree .vjs-tree__number) {
  color: #1c00cf;
}

.file-data :deep(.vjs-tree .vjs-tree__boolean) {
  color: #1c00cf;
  font-weight: bold;
}

.file-data :deep(.vjs-tree .vjs-tree__null) {
  color: #808080;
  font-style: italic;
}
</style>
