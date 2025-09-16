<template>
  <div class="excel-upload-container">
    <div>
      <h2>{{ title }}</h2>
      <div v-show="parsedData.length > 0"><slot /></div>
    </div>

    <!-- 模式切换：上传 / 编辑 -->
    <el-tabs v-model="activeMode" class="json-section">
      <el-tab-pane label="上传JSON" name="upload" />
      <el-tab-pane label="编辑JSON" name="edit" />
    </el-tabs>

    <!-- 文件上传区域（上传模式） -->
    <div v-if="activeMode === 'upload'">
      <!-- 文件上传区域 -->
      <el-upload
        v-loading="loading"
        element-loading-text="解析中..."
        drag
        :auto-upload="false"
        :show-file-list="false"
        :on-change="handleFileChange"
        :on-remove="handleFileRemove"
        :file-list="fileList"
        :disabled="loading"
        multiple
        :accept="accept"
        class="upload-area"
      >
        <el-icon><upload-filled /></el-icon>
        <div>将文件拖到此处，或<em>点击上传</em></div>
        <div>支持{{ single ? '单个' : '多个' }} .json 格式文件</div>
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
          <el-button size="small" @click="openEditorFor(index)">编辑</el-button>
          <el-button size="small" type="danger" @click="removeFile(index)">
            删除
          </el-button>
        </div>
        <div class="action-buttons">
          <el-button
            type="primary"
            v-show="!single"
            @click="parseAllFiles"
            :loading="loading"
            :disabled="fileList.length === 0"
          >
            解析所有文件
          </el-button>
        </div>
      </div>
    </div>

    <!-- 编辑 JSON 区域（编辑模式） -->
    <div v-else class="editor-panel">
      <div class="editor-toolbar">
        <el-select
          v-model="editorTargetIndex"
          placeholder="选择要编辑的文件"
          style="width: 320px"
          v-if="parsedData.length > 0"
        >
          <el-option
            v-for="(p, i) in parsedData"
            :key="p.fileUid || p.fileName || i"
            :label="p.fileName || `文件${i + 1}`"
            :value="i"
          />
        </el-select>
        <div v-else style="color: #909399; font-size: 14px;">
          新建JSON文件
        </div>
        <el-button
          v-if="showCreateButton"
          type="primary"
          @click="createNewJson"
          :disabled="isCreateButtonDisabled"
        >
          创建JSON
        </el-button>
      </div>
      <el-input
        v-model="editorText"
        type="textarea"
        :rows="18"
        :placeholder="parsedData.length > 0 ? '在此编辑 JSON 内容（实时校验）' : '在此输入 JSON 内容，支持实时校验'"
        class="json-editor"
      />
      <div
        v-if="editorError"
        style="color: #f56c6c; margin-top: 8px; font-size: 12px"
      >
        {{ editorError }}
      </div>
      <div
        v-else-if="parsedData.length > 0"
        style="color: #67c23a; margin-top: 8px; font-size: 12px"
      >
        JSON 格式有效，已自动保存到当前文件
      </div>
      <div
        v-else-if="editorText.trim() && !editorError"
        style="color: #67c23a; margin-top: 8px; font-size: 12px"
      >
        JSON 格式有效，点击"创建JSON"按钮保存
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'

const props = defineProps({
  title: {
    type: String,
    default: 'JSON文件上传',
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

const emit = defineEmits(['parsed-data-updated'])

const loading = ref(false)
const fileList = ref([])
const parsedData = ref([])
const activeMode = ref('upload')
const editorTargetIndex = ref(0)
const editorText = ref('')
const editorError = ref('')
const isCreating = ref(false)

// 计算属性
const showCreateButton = computed(() => {
  return activeMode.value === 'edit' && parsedData.value.length === 0
})

const isCreateButtonDisabled = computed(() => {
  // 如果没有内容，禁用按钮
  if (!editorText.value || editorText.value.trim() === '') {
    return true
  }
  // 如果有错误，禁用按钮
  if (editorError.value && editorError.value.trim() !== '') {
    return true
  }
  // 否则启用按钮
  return false
})

// 方法
const handleFileChange = (uploadFile) => {
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

  if (props.single) {
    // 单文件模式：如果已有文件则替换为新文件
    fileList.value = [uploadFile]
    parsedData.value = []
    // 单文件模式不提示成功，直接解析
    parseAllFiles()
    return
  }

  // 多文件模式下的去重逻辑：同名且大小一致视为重复，或 uid 已存在
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

const handleFileRemove = (file) => {
  const index = fileList.value.findIndex((f) => f.name === file.name)
  if (index > -1) {
    fileList.value.splice(index, 1)
    const dataIndex = parsedData.value.findIndex(
      (d) => (file.uid && d.fileUid === file.uid) || d.fileName === file.name
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
}

const removeFile = (index) => {
  const file = fileList.value[index]
  fileList.value.splice(index, 1)
  const dataIndex = parsedData.value.findIndex(
    (d) => (file.uid && d.fileUid === file.uid) || d.fileName === file.name
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
  emit('parsed-data-updated', { parsedData: [], totalFiles: 0 })
}

const parseAllFiles = async () => {
  if (fileList.value.length === 0) {
    ElMessage.warning('请先选择文件')
    return
  }

  loading.value = true
  parsedData.value = []

  try {
    const settled = await Promise.allSettled(
      fileList.value.map((file) => readJsonFile(file.raw || file))
    )

    const results = []
    settled.forEach((res, idx) => {
      const file = fileList.value[idx]
      if (res.status === 'fulfilled') {
        results.push({
          fileName: file.name,
          fileUid: file.uid,
          content: res.value,
        })
      } else {
        ElMessage.error(
          `文件 ${file.name} 解析失败: ${res.reason?.message || res.reason}`
        )
      }
    })

    parsedData.value = results
    if (results.length > 0) {
      if (!props.single || results.length > 1) {
        ElMessage.success(`所有文件解析完成，共解析 ${results.length} 个文件`)
      }
      emit('parsed-data-updated', {
        parsedData: results,
        totalFiles: results.length,
      })
      // 初始化编辑器文本
      editorTargetIndex.value = 0
      editorText.value = JSON.stringify(results[0].content, null, 2)
      editorError.value = ''
    }
  } catch (error) {
    console.error('批量解析失败:', error)
    ElMessage.error('批量解析过程中出现错误')
  } finally {
    loading.value = false
  }
}

// 读取并解析 JSON 文件
const readJsonFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        let text = e.target.result
        if (typeof text === 'string' && text.charCodeAt(0) === 0xfeff) {
          text = text.slice(1)
        }
        const obj = JSON.parse(text)
        resolve(obj)
      } catch (error) {
        reject(new Error(`读取JSON文件失败: ${error.message}`))
      }
    }

    reader.onerror = () => reject(new Error('文件读取失败'))
    try {
      const rawFile = file?.raw instanceof Blob ? file.raw : file
      if (!(rawFile instanceof Blob)) {
        reject(new Error('无效的文件对象'))
        return
      }
      reader.readAsText(rawFile)
    } catch (err) {
      reject(new Error('无法读取文件'))
    }
  })
}

// ---------------- JSON 编辑区逻辑（实时校验与保存） ----------------
const syncEditorFromParsed = () => {
  if (!parsedData.value.length) {
    // 如果没有数据，清空编辑器
    editorText.value = ''
    editorError.value = ''
    return
  }
  const idx = Math.max(
    0,
    Math.min(editorTargetIndex.value || 0, parsedData.value.length - 1)
  )
  editorTargetIndex.value = idx
  try {
    editorText.value = JSON.stringify(parsedData.value[idx].content, null, 2)
    editorError.value = ''
  } catch (e) {
    editorText.value = ''
    editorError.value = '无法加载当前文件内容'
  }
}

watch(parsedData, () => syncEditorFromParsed(), { deep: true })
watch(editorTargetIndex, () => syncEditorFromParsed())

// 监听编辑模式切换
watch(activeMode, (newMode) => {
  if (newMode === 'edit' && parsedData.value.length === 0) {
    editorText.value = ''
    editorError.value = ''
  }
})

watch(
  editorText,
  (val) => {
    if (val == null || val.trim() === '') {
      editorError.value = ''
      return
    }
    
    try {
      const obj = JSON.parse(val)
      editorError.value = ''
      
      // 如果有已解析的数据，更新对应文件
      if (parsedData.value.length > 0 && !isCreating.value) {
        const idx = Math.max(
          0,
          Math.min(editorTargetIndex.value || 0, parsedData.value.length - 1)
        )
        parsedData.value[idx] = { ...parsedData.value[idx], content: obj }
        emit('parsed-data-updated', {
          parsedData: parsedData.value,
          totalFiles: parsedData.value.length,
        })
      }
      // 如果没有数据，只进行格式校验，不保存
    } catch (e) {
      editorError.value = `JSON 语法错误：${e.message}`
    }
  },
  { flush: 'post' }
)

const openEditorFor = (index) => {
  activeMode.value = 'edit'
  editorTargetIndex.value = index
  syncEditorFromParsed()
}

// 创建新的JSON数据
const createNewJson = () => {
  if (editorError.value) {
    ElMessage.error('请先修复JSON格式错误')
    return
  }
  
  if (!editorText.value || !editorText.value.trim()) {
    return
  }
  
  try {
    const obj = JSON.parse(editorText.value)
    const newData = {
      fileName: '新建JSON',
      fileUid: `new-${Date.now()}`,
      content: obj,
    }
    
    isCreating.value = true
    parsedData.value = [newData]
    editorTargetIndex.value = 0
    
    emit('parsed-data-updated', {
      parsedData: parsedData.value,
      totalFiles: parsedData.value.length,
    })
    
    isCreating.value = false
  } catch (error) {
    ElMessage.error(`JSON格式错误: ${error.message}`)
  }
}
</script>

<style scoped>
.excel-upload-container {
  padding: 20px;
  width: 100%;
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

.action-buttons {
  margin-top: 15px;
  display: flex;
  gap: 10px;
}

/* 编辑器样式 */
.editor-panel {
  margin-top: 10px;
}

.editor-toolbar {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.json-editor :deep(textarea) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    'Liberation Mono', 'Courier New', monospace;
  font-size: 12px;
}
</style>
