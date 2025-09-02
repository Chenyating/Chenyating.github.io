<template>
  <div class="compress-file-container">
    <div class="header">
      <h2>JSON文件压缩工具</h2>
      <p>上传JSON文件，自动压缩并移除多余的空格和换行符</p>
    </div>

    <div class="upload-section">
      <el-upload
        class="upload-demo"
        drag
        :auto-upload="false"
        :on-change="handleFileChange"
        :show-file-list="false"
        accept=".json"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          将JSON文件拖到此处，或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            只能上传JSON文件，且不超过10MB
          </div>
        </template>
      </el-upload>
    </div>

    <div v-if="originalContent" class="content-section">
      <div class="file-info">
        <h3>文件信息</h3>
        <p>文件名: {{ fileName }}</p>
        <p>原始大小: {{ formatFileSize(originalSize) }}</p>
        <p>压缩后大小: {{ formatFileSize(compressedSize) }}</p>
        <p>压缩率: {{ compressionRatio }}%</p>
      </div>

      <div class="preview-section">
        <div class="preview-tabs">
          <el-tabs v-model="activeTab" type="border-card">
            <el-tab-pane label="原始内容" name="original">
              <div class="code-preview">
                <pre><code>{{ originalContent }}</code></pre>
              </div>
            </el-tab-pane>
            <el-tab-pane label="压缩后内容" name="compressed">
              <div class="code-preview">
                <pre><code>{{ compressedContent }}</code></pre>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>

      <div class="action-section">
        <el-button type="primary" @click="downloadCompressedFile" :disabled="!compressedContent">
          <el-icon><download /></el-icon>
          下载压缩文件
        </el-button>
        <el-button @click="copyToClipboard" :disabled="!compressedContent">
          <el-icon><copy-document /></el-icon>
          复制到剪贴板
        </el-button>
        <el-button @click="resetFile">
          <el-icon><refresh /></el-icon>
          重新选择文件
        </el-button>
      </div>
    </div>

    <div v-if="errorMessage" class="error-message">
      <el-alert :title="errorMessage" type="error" show-icon />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled, Download, CopyDocument, Refresh } from '@element-plus/icons-vue'

// 响应式数据
const originalContent = ref('')
const compressedContent = ref('')
const fileName = ref('')
const originalSize = ref(0)
const activeTab = ref('original')
const errorMessage = ref('')

// 计算属性
const compressedSize = computed(() => {
  if (!compressedContent.value) return 0
  return new Blob([compressedContent.value]).size
})

const compressionRatio = computed(() => {
  if (originalSize.value === 0) return 0
  const ratio = ((originalSize.value - compressedSize.value) / originalSize.value) * 100
  return ratio.toFixed(2)
})

// 文件大小格式化
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 处理文件变化
const handleFileChange = (file) => {
  errorMessage.value = ''
  
  if (!file.raw) {
    errorMessage.value = '请选择有效的文件'
    return
  }

  // 检查文件大小（10MB限制）
  if (file.size > 10 * 1024 * 1024) {
    errorMessage.value = '文件大小不能超过10MB'
    return
  }

  // 检查文件类型
  if (!file.name.toLowerCase().endsWith('.json')) {
    errorMessage.value = '请选择JSON文件'
    return
  }

  fileName.value = file.name
  originalSize.value = file.size

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const content = e.target.result
      originalContent.value = content
      
      // 验证JSON格式
      JSON.parse(content)
      
      // 压缩JSON
      compressJson(content)
    } catch (error) {
      errorMessage.value = '文件格式错误，请确保是有效的JSON文件'
      resetFile()
    }
  }
  reader.readAsText(file.raw)
}

// 压缩JSON
const compressJson = (jsonString) => {
  try {
    // 解析JSON以确保格式正确
    const parsed = JSON.parse(jsonString)
    // 重新序列化，移除所有空格和换行
    compressedContent.value = JSON.stringify(parsed)
  } catch (error) {
    errorMessage.value = 'JSON压缩失败：' + error.message
  }
}

// 下载压缩文件
const downloadCompressedFile = () => {
  if (!compressedContent.value) {
    ElMessage.warning('没有可下载的内容')
    return
  }

  const blob = new Blob([compressedContent.value], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  
  // 生成压缩后的文件名
  const nameParts = fileName.value.split('.')
  const baseName = nameParts.slice(0, -1).join('.')
  const extension = nameParts[nameParts.length - 1]
  link.download = `${baseName}_compressed.${extension}`
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  
  ElMessage.success('文件下载成功')
}

// 复制到剪贴板
const copyToClipboard = async () => {
  if (!compressedContent.value) {
    ElMessage.warning('没有可复制的内容')
    return
  }

  try {
    await navigator.clipboard.writeText(compressedContent.value)
    ElMessage.success('已复制到剪贴板')
  } catch (error) {
    // 降级方案
    const textArea = document.createElement('textarea')
    textArea.value = compressedContent.value
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    ElMessage.success('已复制到剪贴板')
  }
}

// 重置文件
const resetFile = () => {
  originalContent.value = ''
  compressedContent.value = ''
  fileName.value = ''
  originalSize.value = 0
  activeTab.value = 'original'
  errorMessage.value = ''
}
</script>

<style scoped>
.compress-file-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.header h2 {
  color: #303133;
  margin-bottom: 10px;
  font-size: 28px;
  font-weight: 600;
}

.header p {
  color: #606266;
  font-size: 16px;
  margin: 0;
}

.upload-section {
  margin-bottom: 30px;
}

.upload-demo {
  width: 100%;
}

.el-upload__tip {
  color: #909399;
  font-size: 14px;
  margin-top: 10px;
}

.content-section {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}

.file-info {
  background: #f5f7fa;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 20px;
}

.file-info h3 {
  margin: 0 0 10px 0;
  color: #303133;
  font-size: 18px;
}

.file-info p {
  margin: 5px 0;
  color: #606266;
  font-size: 14px;
}

.preview-section {
  margin-bottom: 20px;
}

.code-preview {
  background: #f8f9fa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 15px;
  max-height: 400px;
  overflow-y: auto;
}

.code-preview pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
  color: #333;
}

.action-section {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}

.action-section .el-button {
  min-width: 120px;
}

.error-message {
  margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .compress-file-container {
    padding: 15px;
  }
  
  .header h2 {
    font-size: 24px;
  }
  
  .action-section {
    flex-direction: column;
    align-items: center;
  }
  
  .action-section .el-button {
    width: 100%;
    max-width: 300px;
  }
}

/* 滚动条样式 */
.code-preview::-webkit-scrollbar {
  width: 6px;
}

.code-preview::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.code-preview::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.code-preview::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
