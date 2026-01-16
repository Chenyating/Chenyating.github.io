<template>
  <uploadExcel title="导出JSON文件" @parsed-data-updated="handleParsedDataUpdated">
    <template #default>
      <el-button type="primary" @click="handlePreview">预览JSON数据</el-button>
      <el-tooltip placement="bottom" effect="light">
        <template #content>
          <div class="config-panel">
            <div class="config-row">
              <span class="config-label">格式化JSON</span>
              <el-switch v-model="formatJson" size="small" />
            </div>
            <div class="config-row">
              <span class="config-label">包含空值</span>
              <el-switch v-model="includeEmpty" size="small" />
            </div>
            <div class="config-row">
              <span class="config-label">使用表头作为键</span>
              <el-switch v-model="useHeader" size="small" />
            </div>
          </div>
        </template>
        <el-button type="primary" @click="downloadJson">下载JSON文件</el-button>
      </el-tooltip>
    </template>
  </uploadExcel>

  <!-- JSON预览对话框 -->
  <el-dialog
    v-model="showJsonPreview"
    title="JSON数据预览"
    width="80%"
    :close-on-click-modal="false"
  >
    <div class="json-preview-container">
      <div class="toolbar">
        <el-button size="small" @click="copyJsonToClipboard">
          <el-icon><DocumentCopy /></el-icon>
          复制JSON
        </el-button>
        <el-tag>{{ jsonDataSize }}</el-tag>
      </div>
      <div class="json-content">
        <pre><code class="language-json">{{ jsonPreviewText }}</code></pre>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { DocumentCopy } from '@element-plus/icons-vue'
import uploadExcel from '../component/uploadExcel.vue'

const dataList = ref([])
const showJsonPreview = ref(false)
const jsonData = ref(null)

// 配置选项
const formatJson = ref(true) // 是否格式化JSON
const includeEmpty = ref(false) // 是否包含空值
const useHeader = ref(true) // 是否使用表头作为键

const handleParsedDataUpdated = (data) => {
  dataList.value = data?.parsedData ?? []
}

// JSON预览文本
const jsonPreviewText = computed(() => {
  if (!jsonData.value) return ''
  return formatJson.value
    ? JSON.stringify(jsonData.value, null, 2)
    : JSON.stringify(jsonData.value)
})

// JSON数据大小
const jsonDataSize = computed(() => {
  if (!jsonPreviewText.value) return '0 KB'
  const bytes = new Blob([jsonPreviewText.value]).size
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
})

const handlePreview = () => {
  const data = convertToJson()
  if (!data) {
    return
  }
  jsonData.value = data
  showJsonPreview.value = true
}

const copyJsonToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(jsonPreviewText.value)
    ElMessage.success('JSON已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败，请手动复制')
  }
}

const convertToJson = () => {
  if (!Array.isArray(dataList.value) || dataList.value.length === 0) {
    ElMessage.warning('请先上传并解析文件')
    return null
  }

  const result = {}

  dataList.value.forEach((fileGroup) => {
    const fileName = String(fileGroup.fileName || 'Excel').replace(
      /\.(xlsx|xls|csv)$/i,
      ''
    )
    const sheets = Array.isArray(fileGroup.sheets) ? fileGroup.sheets : []

    if (sheets.length === 0) return

    const fileData = {}

    sheets.forEach((sheet) => {
      const sheetName = String(sheet?.name ?? 'Sheet')
      const rawData = Array.isArray(sheet?.data) ? sheet.data : []

      if (rawData.length === 0) {
        fileData[sheetName] = []
        return
      }

      let processedData

      if (useHeader.value && rawData.length > 1) {
        // 使用第一行作为表头
        const headers = rawData[0]
        processedData = []

        for (let i = 1; i < rawData.length; i++) {
          const row = rawData[i]
          const rowObj = {}
          let hasValue = false

          headers.forEach((header, index) => {
            const value = row[index]
            const isEmpty = value === null || value === undefined || value === ''

            if (!isEmpty) {
              hasValue = true
            }

            if (includeEmpty.value || !isEmpty) {
              const key = header || `Column${index + 1}`
              rowObj[key] = isEmpty ? '' : value
            }
          })

          // 只添加包含有效数据的行
          if (hasValue || includeEmpty.value) {
            processedData.push(rowObj)
          }
        }
      } else {
        // 不使用表头，直接转换为数组
        processedData = rawData.map((row) => {
          if (!includeEmpty.value) {
            // 过滤空行
            const hasValue = row.some(
              (cell) => cell !== null && cell !== undefined && cell !== ''
            )
            if (!hasValue) return null
          }

          if (!includeEmpty.value) {
            // 过滤空单元格
            return row.filter(
              (cell) => cell !== null && cell !== undefined && cell !== ''
            )
          }

          return row
        }).filter((row) => row !== null)
      }

      fileData[sheetName] = processedData
    })

    // 如果文件只有一个sheet，直接使用sheet数据
    if (sheets.length === 1) {
      result[fileName] = fileData[sheets[0].name]
    } else {
      result[fileName] = fileData
    }
  })

  // 如果只有一个文件，直接返回文件数据
  if (dataList.value.length === 1) {
    const firstFile = Object.keys(result)[0]
    return result[firstFile]
  }

  return result
}

const downloadJson = () => {
  const data = convertToJson()

  if (!data) {
    ElMessage.warning('没有数据可以导出')
    return
  }

  jsonData.value = data

  try {
    // 转换为JSON字符串
    const jsonString = formatJson.value
      ? JSON.stringify(data, null, 2)
      : JSON.stringify(data)

    // 创建Blob
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' })

    // 创建下载链接
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url

    // 生成文件名
    let fileName = 'excel-data.json'
    if (dataList.value.length === 1) {
      const baseName = String(dataList.value[0].fileName || 'excel').replace(
        /\.(xlsx|xls|csv)$/i,
        ''
      )
      fileName = `${baseName}.json`
    }

    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    ElMessage.success('JSON文件下载成功')
  } catch (error) {
    ElMessage.error(`导出失败: ${error.message}`)
  }
}
</script>

<style lang="scss" scoped>
.config-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 6px 8px;
}

.config-row {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.config-label {
  font-size: 12px;
  color: #666;
}

.json-preview-container {
  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e4e7ed;
  }

  .json-content {
    max-height: 600px;
    overflow: auto;
    background-color: #f5f7fa;
    border-radius: 4px;
    border: 1px solid #e4e7ed;

    pre {
      margin: 0;
      padding: 16px;
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 13px;
      line-height: 1.6;
      color: #2c3e50;

      code {
        display: block;
        white-space: pre-wrap;
        word-break: break-word;
      }
    }
  }
}
</style>
