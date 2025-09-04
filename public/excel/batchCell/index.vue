<template>
  <uploadExcel title="批量处理单元格" @parsed-data-updated="handleParsedDataUpdated">
    <template #default>
      <div class="operation-panel">
        <el-card class="operation-card" :body-style="{ padding: '10px' }">
          <template #header>
            <span>行列操作</span>
          </template>
          <div class="operation-section">
            <el-row :gutter="12">
              <el-col :span="4">
                <el-select size="small" v-model="operation.target" placeholder="目标" style="width: 100%">
                  <el-option label="行" value="row" />
                  <el-option label="列" value="col" />
                </el-select>
              </el-col>
              <el-col :span="4">
                <el-select size="small" v-model="operation.type" placeholder="选择操作" style="width: 100%">
                  <el-option :label="operation.target === 'row' ? '新增行' : '新增列'" value="add" />
                  <el-option :label="operation.target === 'row' ? '删除行' : '删除列'" value="delete" />
                </el-select>
              </el-col>
              <el-col :span="4">
                <el-input-number 
                  size="small"
                  v-model="operation.position" 
                  :min="1" 
                  :step="1"
                  :placeholder="operation.target === 'row' ? '行位置' : '列位置'"
                  style="width: 100%"
                />
              </el-col>
              <el-col :span="4">
                <el-input-number 
                  size="small"
                  v-model="operation.count" 
                  :min="1" 
                  :max="100"
                  :step="1"
                  placeholder="数量"
                  style="width: 100%"
                />
              </el-col>
              <el-col :span="4">
                <el-input 
                  size="small"
                  v-model="exportRange.rowRange" 
                  placeholder="行范围 如: 1- 或 1,3,5-8"
                  style="width: 100%"
                />
              </el-col>
              <el-col :span="4">
                <el-input 
                  size="small"
                  v-model="exportRange.colRange" 
                  placeholder="列范围 如: A- 或 A,C,E-G"
                  style="width: 100%"
                />
              </el-col>
            </el-row>
            <el-button 
              size="small"
              type="primary" 
              @click="applyOperation" 
              :disabled="!operation.type || !operation.position || !operation.count"
              style="margin-top: 10px"
            >
              应用操作
            </el-button>
          </div>
        </el-card>

        <div class="action-buttons">
          <el-button size="small" type="primary" @click="processData">处理数据</el-button>
          <el-button size="small" type="success" @click="downloadZip">下载压缩包</el-button>
          <el-button size="small" @click="resetOperations">重置操作</el-button>
        </div>
      </div>
    </template>
  </uploadExcel>
  <preview :parsedData="previewData" v-model="showOriginalFile" />
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import * as XLSX from 'xlsx'
import JSZip from 'jszip'
import uploadExcel from '../component/uploadExcel.vue'
import Preview from '../component/preview.vue'

const dataList = ref([])
const processedData = ref([])
const previewData = ref([])
const showOriginalFile = ref(false)

// 操作配置
const rowOperation = reactive({
  type: '', // 'add' 或 'delete'
  position: 1,
  count: 1
})

const colOperation = reactive({
  type: '', // 'add' 或 'delete'
  position: 1,
  count: 1
})

const exportRange = reactive({
  rowRange: '1-',
  colRange: ''
})

// 统一行列操作配置
const operation = reactive({
  target: 'row', // 'row' | 'col'
  type: '',     // 'add' | 'delete'
  position: 1,
  count: 1,
})

const handleParsedDataUpdated = (data) => {
  dataList.value = data?.parsedData ?? []
}

// 应用行操作
const applyRowOperation = () => {
  if (!Array.isArray(dataList.value) || dataList.value.length === 0) {
    ElMessage.warning('请先上传并解析文件')
    return
  }

  try {
    const processed = dataList.value.map(fileGroup => {
      const newSheets = fileGroup.sheets.map(sheet => {
        const newData = [...sheet.data]
        
        if (rowOperation.type === 'add') {
          // 新增行
          const emptyRow = new Array(sheet.maxColumns).fill('')
          for (let i = 0; i < rowOperation.count; i++) {
            newData.splice(rowOperation.position - 1, 0, [...emptyRow])
          }
        } else if (rowOperation.type === 'delete') {
          // 删除行
          const startIndex = rowOperation.position - 1
          const endIndex = Math.min(startIndex + rowOperation.count, newData.length)
          newData.splice(startIndex, endIndex - startIndex)
        }
        
        return {
          ...sheet,
          data: newData
        }
      })
      
      return {
        ...fileGroup,
        sheets: newSheets
      }
    })
    
    dataList.value = processed
    ElMessage.success(`行操作完成：${rowOperation.type === 'add' ? '新增' : '删除'}了 ${rowOperation.count} 行`)
  } catch (error) {
    console.error('行操作失败:', error)
    ElMessage.error('行操作过程中出现错误')
  }
}

// 统一触发操作
const applyOperation = () => {
  if (operation.target === 'row') {
    rowOperation.type = operation.type
    rowOperation.position = operation.position
    rowOperation.count = operation.count
    applyRowOperation()
  } else {
    colOperation.type = operation.type
    colOperation.position = operation.position
    colOperation.count = operation.count
    applyColOperation()
  }
}

// 应用列操作
const applyColOperation = () => {
  if (!Array.isArray(dataList.value) || dataList.value.length === 0) {
    ElMessage.warning('请先上传并解析文件')
    return
  }

  try {
    const processed = dataList.value.map(fileGroup => {
      const newSheets = fileGroup.sheets.map(sheet => {
        const newData = sheet.data.map(row => [...row])
        
        if (colOperation.type === 'add') {
          // 新增列
          for (let i = 0; i < colOperation.count; i++) {
            newData.forEach(row => {
              row.splice(colOperation.position - 1, 0, '')
            })
          }
        } else if (colOperation.type === 'delete') {
          // 删除列
          const startIndex = colOperation.position - 1
          const endIndex = Math.min(startIndex + colOperation.count, newData[0]?.length || 0)
          newData.forEach(row => {
            row.splice(startIndex, endIndex - startIndex)
          })
        }
        
        return {
          ...sheet,
          data: newData,
          maxColumns: newData[0]?.length || 0
        }
      })
      
      return {
        ...fileGroup,
        sheets: newSheets
      }
    })
    
    dataList.value = processed
    ElMessage.success(`列操作完成：${colOperation.type === 'add' ? '新增' : '删除'}了 ${colOperation.count} 列`)
  } catch (error) {
    console.error('列操作失败:', error)
    ElMessage.error('列操作过程中出现错误')
  }
}

// 列标转索引（支持多字母），A->0, B->1, ..., Z->25, AA->26
const columnLabelToIndex = (label) => {
  if (!label) return 0
  let sum = 0
  const upper = String(label).toUpperCase().replace(/[^A-Z]/g, '')
  for (let i = 0; i < upper.length; i += 1) {
    sum = sum * 26 + (upper.charCodeAt(i) - 64)
  }
  return Math.max(0, sum - 1)
}

// 解析范围字符串，支持开区间（如 1- / A-）并允许多段
const parseRange = (rangeStr, isColumn = false, max = 0) => {
  if (!rangeStr || !rangeStr.trim()) return null
  
  const result = new Set()
  const parts = rangeStr.split(',').map(s => s.trim()).filter(Boolean)
  
  for (const part of parts) {
    if (part.includes('-')) {
      let [start, end] = part.split('-').map(s => s.trim())
      if (isColumn) {
        const startCol = start ? columnLabelToIndex(start) : 0
        const endCol = end ? columnLabelToIndex(end) : (max > 0 ? max - 1 : startCol)
        for (let i = startCol; i <= endCol; i += 1) {
          result.add(i)
        }
      } else {
        const startRow = start ? Math.max(0, parseInt(start) - 1) : 0
        const endRow = end ? Math.max(0, parseInt(end) - 1) : (max > 0 ? max - 1 : startRow)
        for (let i = startRow; i <= endRow; i += 1) {
          result.add(i)
        }
      }
    } else {
      if (isColumn) {
        result.add(columnLabelToIndex(part))
      } else {
        const v = Math.max(0, parseInt(part) - 1)
        result.add(v)
      }
    }
  }
  
  return Array.from(result).sort((a, b) => a - b)
}

// 处理数据
const processData = () => {
  if (!Array.isArray(dataList.value) || dataList.value.length === 0) {
    ElMessage.warning('请先上传并解析文件')
    return
  }

  try {
    const processed = dataList.value.map(fileGroup => {
      const newSheets = fileGroup.sheets.map(sheet => {
        let newData = [...sheet.data]
        
        // 应用导出范围过滤
        const rowRange = parseRange(exportRange.rowRange, false, sheet.data.length)
        const colRange = parseRange(
          exportRange.colRange,
          true,
          sheet.maxColumns || (sheet.data[0] ? sheet.data[0].length : 0)
        )
        
        if (rowRange) {
          newData = rowRange.map(rowIndex => newData[rowIndex]).filter(row => row)
        }
        
        if (colRange) {
          newData = newData.map(row => 
            colRange.map(colIndex => row[colIndex]).filter(cell => cell !== undefined)
          )
        }
        
        return {
          ...sheet,
          data: newData,
          maxColumns: newData[0]?.length || 0
        }
      })
      
      return {
        ...fileGroup,
        sheets: newSheets
      }
    })
    
    processedData.value = processed
    previewData.value = processed
    showOriginalFile.value = true
    
    ElMessage.success('数据处理完成')
  } catch (error) {
    console.error('数据处理失败:', error)
    ElMessage.error('数据处理过程中出现错误')
  }
}

// 重置操作
const resetOperations = () => {
  rowOperation.type = ''
  rowOperation.position = 1
  rowOperation.count = 1
  
  colOperation.type = ''
  colOperation.position = 1
  colOperation.count = 1
  
  exportRange.rowRange = '1-'
  exportRange.colRange = ''
  
  ElMessage.success('操作已重置')
}

const downloadZip = async () => {
  const dataToExport = processedData.value.length > 0 ? processedData.value : dataList.value
  
  if (!Array.isArray(dataToExport) || dataToExport.length === 0) {
    ElMessage.warning('请先上传并解析文件')
    return
  }

  try {
    const zip = new JSZip()
    
    // 为每个文件创建Excel文件
    dataToExport.forEach((fileGroup) => {
      const workbook = XLSX.utils.book_new()
      
      fileGroup.sheets.forEach((sheet, sheetIndex) => {
        const worksheet = XLSX.utils.aoa_to_sheet(sheet.data)
        const sheetName = sheet.name || `Sheet${sheetIndex + 1}`
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
      })
      
      // 将Excel文件添加到zip中
      const excelBuffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' })
      zip.file(`${fileGroup.fileName}`, excelBuffer)
    })

    // 生成并下载zip文件
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(zipBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = '批量处理结果.zip'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    ElMessage.success('压缩包下载完成')
  } catch (error) {
    console.error('下载失败:', error)
    ElMessage.error('下载过程中出现错误')
  }
}
</script>

<style scoped>
.operation-panel {
  margin: 20px 0;
}

.operation-card {
  margin-bottom: 20px;
}

.operation-section {
  margin-bottom: 20px;
}

.operation-section h4 {
  margin-bottom: 15px;
  color: #409eff;
  font-size: 16px;
}

.export-section h4 {
  margin-bottom: 15px;
  color: #409eff;
  font-size: 16px;
}

.range-input {
  margin-bottom: 10px;
}

.range-input label {
  display: block;
  margin-bottom: 5px;
  color: #606266;
  font-size: 14px;
}

.range-help {
  margin-top: 10px;
  color: #909399;
  font-size: 12px;
  line-height: 1.5;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}
</style>
