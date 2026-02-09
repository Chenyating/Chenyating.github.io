<template>
  <div class="excel-json-converter">
    <!-- 输入模式切换 -->
    <div class="mode-switcher">
      <div
        class="mode-tab"
        :class="{ active: inputMode === 'file' }"
        @click="inputMode = 'file'"
      >
        <span class="mode-icon">📁</span>
        <span class="mode-label">文件上传</span>
      </div>
      <div
        class="mode-tab"
        :class="{ active: inputMode === 'text' }"
        @click="inputMode = 'text'"
      >
        <span class="mode-icon">✍️</span>
        <span class="mode-label">文本输入</span>
      </div>
      <div class="mode-indicator" :class="{ 'text-mode': inputMode === 'text' }"></div>
    </div>

    <!-- 文件上传模式 -->
    <div v-show="inputMode === 'file'" class="upload-section">
      <uploadExcel title="导出JSON文件" @parsed-data-updated="handleParsedDataUpdated">
        <template #default>
          <div class="action-buttons">
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
          </div>
        </template>
      </uploadExcel>
    </div>

    <!-- 文本输入模式 -->
    <div v-show="inputMode === 'text'" class="text-section">
      <div class="text-input-container">
        <div class="input-header">
          <div class="header-title">
            <span class="title-icon">🔤</span>
            <h3>多行文本输入</h3>
          </div>
          <div class="format-selector">
            <el-radio-group v-model="textFormat" size="small">
              <el-radio-button value="auto">智能检测</el-radio-button>
              <el-radio-button value="csv">CSV (逗号)</el-radio-button>
              <el-radio-button value="tsv">TSV (制表符)</el-radio-button>
              <el-radio-button value="space">空格</el-radio-button>
              <el-radio-button value="custom">自定义</el-radio-button>
            </el-radio-group>
            <el-input
              v-if="textFormat === 'custom'"
              v-model="customDelimiter"
              placeholder="分隔符"
              size="small"
              class="delimiter-input"
              maxlength="5"
            />
          </div>
        </div>

        <div class="textarea-wrapper">
          <textarea
            v-model="textInput"
            placeholder="粘贴或输入多行文本数据...

支持多种格式：
逗号分隔: 姓名,年龄,城市
制表符:   姓名    年龄    城市
空格分隔: 姓名 年龄 城市

选择「智能检测」自动识别分隔符"
            class="text-input"
            @input="handleTextInput"
          ></textarea>
          <div class="input-stats">
            <span class="stat-item">
              <span class="stat-label">行数:</span>
              <span class="stat-value">{{ textLineCount }}</span>
            </span>
            <span class="stat-item">
              <span class="stat-label">字符:</span>
              <span class="stat-value">{{ textCharCount }}</span>
            </span>
          </div>
        </div>

        <div class="text-options">
          <div class="option-group">
            <el-checkbox v-model="textHasHeader">首行为表头</el-checkbox>
            <el-checkbox v-model="textIncludeEmpty">包含空值</el-checkbox>
            <el-checkbox v-model="textTrimSpaces">去除空格</el-checkbox>
            <div v-if="detectedDelimiter && textFormat === 'auto'" class="detected-badge">
              <span class="badge-icon">🎯</span>
              <span class="badge-text">{{ detectedDelimiter }}</span>
            </div>
          </div>
          <div class="action-group">
            <el-button @click="clearTextInput" size="small">清空</el-button>
            <el-button type="primary" @click="parseTextData" size="small">
              解析数据
            </el-button>
          </div>
        </div>
      </div>

      <!-- 解析预览 -->
      <div v-if="parsedTextData" class="parsed-preview">
        <div class="preview-header">
          <h4>解析结果预览</h4>
          <el-tag type="success">{{ parsedTextData.length }} 条记录</el-tag>
        </div>
        <div class="preview-table">
          <table>
            <thead v-if="parsedTextData.length > 0 && typeof parsedTextData[0] === 'object'">
              <tr>
                <th v-for="(value, key) in parsedTextData[0]" :key="key">{{ key }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in parsedTextData.slice(0, 10)" :key="index">
                <td v-if="typeof row === 'object'" v-for="(value, key) in row" :key="key">
                  {{ value }}
                </td>
                <td v-else v-for="(cell, cellIndex) in row" :key="cellIndex">
                  {{ cell }}
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="parsedTextData.length > 10" class="more-rows">
            还有 {{ parsedTextData.length - 10 }} 行数据...
          </div>
        </div>
        <div class="preview-actions">
          <el-button @click="handlePreview">预览JSON</el-button>
          <el-button type="primary" @click="downloadJson">下载JSON</el-button>
        </div>
      </div>
    </div>

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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { DocumentCopy } from '@element-plus/icons-vue'
import uploadExcel from '../component/uploadExcel.vue'

// 输入模式
const inputMode = ref('file')

// 文件模式数据
const dataList = ref([])
const showJsonPreview = ref(false)
const jsonData = ref(null)

// 配置选项
const formatJson = ref(true) // 是否格式化JSON
const includeEmpty = ref(false) // 是否包含空值
const useHeader = ref(true) // 是否使用表头作为键

// 文本模式数据
const textInput = ref('')
const textFormat = ref('auto')
const customDelimiter = ref('|')
const textHasHeader = ref(true)
const textIncludeEmpty = ref(false)
const textTrimSpaces = ref(true)
const parsedTextData = ref(null)
const detectedDelimiter = ref('')

// 文本统计
const textLineCount = computed(() => {
  if (!textInput.value) return 0
  return textInput.value.split('\n').filter(line => line.trim()).length
})

const textCharCount = computed(() => textInput.value.length)

const handleParsedDataUpdated = (data) => {
  dataList.value = data?.parsedData ?? []
}

const handleTextInput = () => {
  // 清除之前的解析结果
  parsedTextData.value = null
}

const clearTextInput = () => {
  textInput.value = ''
  parsedTextData.value = null
}

// 智能检测分隔符
const detectDelimiter = (text) => {
  const lines = text.split('\n').filter(line => line.trim()).slice(0, 5) // 取前5行分析

  if (lines.length === 0) return ','

  // 候选分隔符及其权重
  const delimiters = [
    { char: ',', name: 'CSV (逗号)', weight: 0 },
    { char: '\t', name: 'TSV (制表符)', weight: 0 },
    { char: '|', name: '竖线', weight: 0 },
    { char: ';', name: '分号', weight: 0 },
    { char: ' ', name: '空格', weight: 0 }
  ]

  // 分析每个分隔符
  delimiters.forEach(delim => {
    const counts = lines.map(line => {
      // 对于空格，使用特殊处理：连续空格视为一个分隔符
      if (delim.char === ' ') {
        // 统计由多个空格分隔的段数
        const segments = line.split(/\s+/).filter(s => s.trim())
        return segments.length - 1
      }
      return (line.match(new RegExp('\\' + delim.char, 'g')) || []).length
    })

    // 如果所有行的分隔符数量相同且大于0，说明这可能是正确的分隔符
    const allSame = counts.every(c => c === counts[0])
    const hasDelimiters = counts[0] > 0

    if (allSame && hasDelimiters) {
      delim.weight = counts[0] * 10 // 相同性权重
    }

    // 额外加分：出现次数越多越好
    delim.weight += counts.reduce((a, b) => a + b, 0)
  })

  // 选择权重最高的分隔符
  delimiters.sort((a, b) => b.weight - a.weight)

  const detected = delimiters[0]
  detectedDelimiter.value = detected.name

  return detected.char
}

// 解析空格分隔的数据（智能处理多个空格）
const parseSpaceDelimitedLine = (line) => {
  // 将连续空格替换为单个分隔标记，然后分割
  return line.trim().split(/\s+/).filter(cell => cell)
}

const parseTextData = () => {
  if (!textInput.value.trim()) {
    ElMessage.warning('请输入文本数据')
    return
  }

  try {
    const lines = textInput.value.split('\n').filter(line => line.trim())

    if (lines.length === 0) {
      ElMessage.warning('没有有效的数据行')
      return
    }

    // 确定分隔符
    let delimiter
    let isSpaceDelimited = false

    if (textFormat.value === 'auto') {
      delimiter = detectDelimiter(textInput.value)
      isSpaceDelimited = (delimiter === ' ')
      ElMessage.success(`检测到分隔符: ${detectedDelimiter.value}`)
    } else if (textFormat.value === 'csv') {
      delimiter = ','
    } else if (textFormat.value === 'tsv') {
      delimiter = '\t'
    } else if (textFormat.value === 'space') {
      delimiter = ' '
      isSpaceDelimited = true
    } else {
      delimiter = customDelimiter.value || ','
    }

    // 解析每一行
    const rows = lines.map(line => {
      let cells

      if (isSpaceDelimited) {
        // 空格分隔特殊处理：多个连续空格视为一个分隔符
        cells = parseSpaceDelimitedLine(line)
      } else {
        cells = line.split(delimiter)
      }

      // 处理单元格内容
      cells = cells.map(cell => {
        let value = cell
        if (textTrimSpaces.value) {
          value = value.trim()
        }
        // 移除首尾引号
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1)
        }
        return value
      })

      return cells
    })

    if (rows.length === 0) {
      ElMessage.warning('解析失败，请检查数据格式')
      return
    }

    let result

    if (textHasHeader.value && rows.length > 1) {
      // 使用第一行作为表头
      const headers = rows[0]
      result = []

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i]
        const rowObj = {}
        let hasValue = false

        headers.forEach((header, index) => {
          const value = row[index] || ''
          const isEmpty = !value

          if (!isEmpty) {
            hasValue = true
          }

          if (textIncludeEmpty.value || !isEmpty) {
            const key = header || `Column${index + 1}`
            rowObj[key] = value
          }
        })

        // 只添加包含有效数据的行
        if (hasValue || textIncludeEmpty.value) {
          result.push(rowObj)
        }
      }
    } else {
      // 不使用表头，直接转换为数组
      result = rows.map(row => {
        if (!textIncludeEmpty.value) {
          // 过滤空单元格
          const filtered = row.filter(cell => cell !== '')
          if (filtered.length === 0) return null
          return filtered
        }
        return row
      }).filter(row => row !== null)
    }

    parsedTextData.value = result

    const successMsg = textFormat.value === 'auto'
      ? `成功解析 ${result.length} 条记录 (${detectedDelimiter.value})`
      : `成功解析 ${result.length} 条记录`

    ElMessage.success(successMsg)
  } catch (error) {
    ElMessage.error(`解析失败: ${error.message}`)
  }
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
  // 文本模式
  if (inputMode.value === 'text') {
    if (!parsedTextData.value || parsedTextData.value.length === 0) {
      ElMessage.warning('请先解析文本数据')
      return null
    }
    return parsedTextData.value
  }

  // 文件模式
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
    let fileName = 'text-data.json'
    if (inputMode.value === 'file' && dataList.value.length === 1) {
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
.excel-json-converter {
  min-height: 100%;
  padding: 24px;
  background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%);
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
}

.mode-switcher {
  position: relative;
  display: inline-flex;
  background: #fff;
  border-radius: 16px;
  padding: 6px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 32px;

  .mode-tab {
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    cursor: pointer;
    border-radius: 12px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 2;

    .mode-icon {
      font-size: 20px;
      transition: transform 0.3s ease;
    }

    .mode-label {
      font-weight: 600;
      font-size: 15px;
      color: #64748b;
      transition: color 0.3s ease;
    }

    &:hover {
      .mode-icon {
        transform: scale(1.15);
      }
    }

    &.active {
      .mode-label {
        color: #0f172a;
      }
    }
  }

  .mode-indicator {
    position: absolute;
    left: 6px;
    top: 6px;
    width: calc(50% - 6px);
    height: calc(100% - 12px);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    z-index: 1;

    &.text-mode {
      transform: translateX(calc(100% + 6px));
    }
  }
}

.upload-section {
  animation: fadeIn 0.5s ease;
}

.text-section {
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.text-input-container {
  background: #fff;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;

  .input-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 20px;
    border-bottom: 2px solid #f1f5f9;

    .header-title {
      display: flex;
      align-items: center;
      gap: 12px;

      .title-icon {
        font-size: 28px;
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
      }

      h3 {
        margin: 0;
        font-size: 24px;
        font-weight: 700;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
    }

    .format-selector {
      display: flex;
      gap: 12px;
      align-items: center;

      .delimiter-input {
        width: 100px;
      }
    }
  }

  .textarea-wrapper {
    position: relative;
    margin-bottom: 20px;

    .text-input {
      width: 100%;
      min-height: 280px;
      padding: 20px;
      border: 2px solid #e2e8f0;
      border-radius: 16px;
      font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
      font-size: 14px;
      line-height: 1.8;
      color: #1e293b;
      resize: vertical;
      transition: all 0.3s ease;
      background: linear-gradient(to bottom, #ffffff 0%, #f8fafc 100%);

      &:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
      }

      &::placeholder {
        color: #94a3b8;
      }
    }

    .input-stats {
      position: absolute;
      bottom: 12px;
      right: 16px;
      display: flex;
      gap: 16px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(8px);
      padding: 6px 14px;
      border-radius: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

      .stat-item {
        display: flex;
        gap: 6px;
        font-size: 13px;

        .stat-label {
          color: #64748b;
          font-weight: 500;
        }

        .stat-value {
          color: #0f172a;
          font-weight: 700;
        }
      }
    }
  }

  .text-options {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .option-group {
      display: flex;
      gap: 20px;
      align-items: center;

      .detected-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 14px;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        border-radius: 20px;
        box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
        animation: slideIn 0.4s ease;

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .badge-icon {
          font-size: 14px;
        }

        .badge-text {
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }
      }
    }

    .action-group {
      display: flex;
      gap: 12px;
    }
  }
}

.parsed-preview {
  background: #fff;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
  animation: slideUp 0.4s ease;

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    h4 {
      margin: 0;
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
    }
  }

  .preview-table {
    overflow-x: auto;
    border-radius: 12px;
    border: 2px solid #e2e8f0;
    margin-bottom: 20px;

    table {
      width: 100%;
      border-collapse: collapse;

      thead {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

        th {
          padding: 14px 16px;
          text-align: left;
          font-weight: 600;
          font-size: 13px;
          color: #fff;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 2px solid rgba(255, 255, 255, 0.2);
        }
      }

      tbody {
        tr {
          transition: background-color 0.2s ease;

          &:nth-child(even) {
            background-color: #f8fafc;
          }

          &:hover {
            background-color: #f1f5f9;
          }

          td {
            padding: 12px 16px;
            color: #334155;
            font-size: 14px;
            border-bottom: 1px solid #e2e8f0;
          }
        }
      }
    }

    .more-rows {
      padding: 16px;
      text-align: center;
      color: #64748b;
      font-style: italic;
      background: #f8fafc;
    }
  }

  .preview-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}

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
