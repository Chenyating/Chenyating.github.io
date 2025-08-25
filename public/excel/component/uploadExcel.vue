<template>
  <div class="excel-upload-container">
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
      :on-remove="handleFileRemove"
      :file-list="fileList"
      :disabled="loading"
      multiple
      :accept="accept"
      class="upload-area"
    >
      <el-icon><upload-filled /></el-icon>
      <div>将文件拖到此处，或<em>点击上传</em></div>
      <div>支持{{ single ? '单个' : '多个' }} .xlsx 和 .xls 格式文件</div>
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
        <el-tag class="file-status" size="small" :type="isFileParsed(file.name) ? 'success' : 'info'">
          {{ isFileParsed(file.name) ? '已解析' : '未解析' }}
        </el-tag>
        <el-button size="small" type="danger" @click="removeFile(index)">
          删除
        </el-button>
      </div>
      <div class="action-buttons">
        <el-button-group>
          <el-button
            type="primary"
            @click="parseAllFiles"
            :loading="loading"
            :disabled="fileList.length === 0"
          >
            解析所有文件
          </el-button>
          <el-button
            @click="btnShowOriginalFile"
            :loading="loading"
            v-show="parsedData.length > 0"
          >
            预览已解析的文件
          </el-button>
        </el-button-group>
      </div>
    </div>
    <Preview title="解析结果" v-model="showOriginalFile" :parsedData="parsedData" />
    
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import * as XLSX from 'xlsx'
import Preview from './preview.vue'

const props = defineProps({
  title: {
    type: String,
    default: 'Excel文件上传',
  },
  accept: {
    type: String,
    default: '.xlsx,.xls,.csv',
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
const showOriginalFile = ref(false)

// 定义 emit 事件
const emit = defineEmits([
  'parsed-data-updated', // 解析数据更新时触发
])

const btnShowOriginalFile = () => {
  showOriginalFile.value = true
}

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
    (f) => (f.uid && f.uid === uploadFile.uid) || (f.name === uploadFile.name && (f.size || f.raw?.size) === sizeBytes)
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
    // 同时从解析结果中移除（优先按 uid 匹配，其次按名称）
    const dataIndex = parsedData.value.findIndex(
      (d) => (file.uid && d.fileUid === file.uid) || d.fileName === file.name
    )
    if (dataIndex > -1) {
      parsedData.value.splice(dataIndex, 1)
    }
    ElMessage.success(`文件 ${file.name} 已移除`)
  }
}

const removeFile = (index) => {
  const file = fileList.value[index]
  fileList.value.splice(index, 1)
  // 同时从解析结果中移除（优先按 uid 匹配，其次按名称）
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
    // 并发解析，保持与 fileList 相同的顺序
    const settled = await Promise.allSettled(
      fileList.value.map((file) => readExcelFile(file.raw || file))
    )

    const results = []
    settled.forEach((res, idx) => {
      const file = fileList.value[idx]
      if (res.status === 'fulfilled') {
        results.push({
          fileName: file.name,
          fileUid: file.uid,
          sheets: res.value,
        })
      } else {
        ElMessage.error(`文件 ${file.name} 解析失败: ${res.reason?.message || res.reason}`)
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
const isFileParsed = (fileName, fileUid) => {
  return parsedData.value.some((d) => (fileUid && d.fileUid === fileUid) || d.fileName === fileName)
}

// 解析excel文件
const readExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        // 添加日期解析选项
        const workbook = XLSX.read(data, { 
          type: 'array',
          cellDates: true, // 自动解析日期
          cellNF: false,   // 不解析数字格式
          cellText: false  // 不强制转换为文本
        })
        
        const sheets = workbook.SheetNames.map((sheetName) => {
          const worksheet = workbook.Sheets[sheetName]
          
          // 获取单元格格式信息，用于识别日期列
          const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1')
          const dateColumns = new Set()
          
          // 检查每列的第一个非空单元格，判断是否为日期格式
          for (let col = range.s.c; col <= range.e.c; col++) {
            const colLetter = XLSX.utils.encode_col(col)
            for (let row = range.s.r; row <= range.e.r; row++) {
              const cellAddress = colLetter + (row + 1)
              const cell = worksheet[cellAddress]
              if (cell && cell.t === 'd') { // 日期类型
                dateColumns.add(col)
                break
              }
            }
          }
          
          // 使用自定义的日期处理选项解析数据
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
            header: 1,
            raw: false, // 保持原始值，不强制转换
            dateNF: 'yyyy-mm-dd' // 日期格式
          })
          
          // 过滤空行
          const filteredData = jsonData.filter((row) =>
            row.some(
              (cell) => cell !== null && cell !== undefined && cell !== ''
            )
          )

          if (filteredData.length === 0) return null

          // 计算该工作表的最大列数，并将每行按最大列数填充，避免因尾部空单元格被截断导致列数偏少
          const maxColumns = filteredData.reduce(
            (max, row) => Math.max(max, row.length),
            0
          )
          
          const normalizedData = filteredData.map((row) => {
            const normalizedRow = new Array(maxColumns)
            for (let i = 0; i < maxColumns; i += 1) {
              let cellValue = row[i]
              
              // 处理日期单元格
              if (dateColumns.has(i) && cellValue) {
                // 如果是日期对象，转换为标准格式字符串
                if (cellValue instanceof Date) {
                  cellValue = formatDate(cellValue)
                } else if (typeof cellValue === 'number') {
                  // Excel日期是1900年1月1日以来的天数
                  const excelDate = cellValue
                  const date = convertExcelDateToJSDate(excelDate)
                  cellValue = formatDate(date)
                } else if (typeof cellValue === 'string') {
                  // 尝试解析日期字符串
                  const parsedDate = parseDateString(cellValue)
                  if (parsedDate) {
                    cellValue = formatDate(parsedDate)
                  }
                }
              }
              
              normalizedRow[i] =
                cellValue === undefined || cellValue === null ? '' : cellValue
            }
            return normalizedRow
          })

          return {
            name: sheetName,
            data: normalizedData,
            maxColumns,
            dateColumns: Array.from(dateColumns)
          }
        }).filter(Boolean)

        if (sheets.length === 0) {
          reject(new Error('Excel文件中没有有效数据'))
          return
        }

        resolve(sheets)
      } catch (error) {
        reject(new Error(`读取Excel文件失败: ${error.message}`))
      }
    }

    reader.onerror = () => reject(new Error('文件读取失败'))
    try {
      // 支持传入 ElementPlus 的 uploadFile 或原生 File
      const rawFile = file?.raw instanceof Blob ? file.raw : file
      if (!(rawFile instanceof Blob)) {
        reject(new Error('无效的文件对象'))
        return
      }
      reader.readAsArrayBuffer(rawFile)
    } catch (err) {
      reject(new Error('无法读取文件'))
    }
  })
}

// 格式化日期为统一格式
const formatDate = (date) => {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return ''
  }
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

// 将Excel日期数字转换为JavaScript Date对象
const convertExcelDateToJSDate = (excelDate) => {
  // Excel日期从1900年1月1日开始计算
  // 注意：Excel错误地将1900年当作闰年，所以1900年3月1日之前的日期需要调整
  const excelEpoch = new Date(1900, 0, 1)
  const millisecondsPerDay = 24 * 60 * 60 * 1000
  
  // 调整1900年闰年错误
  let adjustedDays = excelDate
  if (excelDate > 59) {
    adjustedDays = excelDate - 1
  }
  
  const date = new Date(excelEpoch.getTime() + adjustedDays * millisecondsPerDay)
  return date
}

// 解析各种日期字符串格式
const parseDateString = (dateString) => {
  if (!dateString || typeof dateString !== 'string') {
    return null
  }
  
  // 尝试多种日期格式
  const dateFormats = [
    /^\d{4}-\d{1,2}-\d{1,2}$/,           // YYYY-MM-DD
    /^\d{1,2}\/\d{1,2}\/\d{4}$/,         // MM/DD/YYYY
    /^\d{1,2}-\d{1,2}-\d{4}$/,           // MM-DD-YYYY
    /^\d{4}\/\d{1,2}\/\d{1,2}$/,         // YYYY/MM/DD
    /^\d{1,2}\.\d{1,2}\.\d{4}$/,         // MM.DD.YYYY
    /^\d{4}\.\d{1,2}\.\d{1,2}$/          // YYYY.MM.DD
  ]
  
  for (const format of dateFormats) {
    if (format.test(dateString)) {
      try {
        const date = new Date(dateString)
        if (!isNaN(date.getTime())) {
          return date
        }
      } catch (e) {
        // 继续尝试下一个格式
      }
    }
  }
  
  return null
}

</script>

<style scoped>
.excel-upload-container {
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
  margin: 20px 0;
  padding: 15px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background-color: white;
}

.file-data h4 {
  color: #409eff;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #409eff;
}

.sheet-data {
  margin: 15px 0;
  padding: 15px;
  background-color: #fafafa;
  border-radius: 4px;
}

.sheet-data h5 {
  color: #606266;
  margin-bottom: 10px;
}

.sheet-info {
  margin: 10px 0;
  display: flex;
  gap: 20px;
  color: #666;
}

.data-table {
  margin: 15px 0;
}

.data-note {
  margin-top: 10px;
  color: #909399;
  font-size: 12px;
  text-align: center;
}

.error-alert {
  margin-top: 20px;
}
</style>
