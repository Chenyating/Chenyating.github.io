<template>
  <uploadExcel title="Excel删除行/列工具" @parsed-data-updated="handleParsedDataUpdated">
    <template #default>
      <!-- 删除行/列操作 -->
      <div class="delete-controls">
        <el-row :gutter="16" class="mb-3">
          <el-col :span="12">
            <el-radio-group v-model="deleteType">
              <el-radio label="row">删除行</el-radio>
              <el-radio label="col">删除列</el-radio>
            </el-radio-group>
          </el-col>
        </el-row>
        
        <!-- 删除模式选择 -->
        <el-row :gutter="16" class="mb-3">
          <el-col :span="24">
            <el-radio-group v-model="deleteMode">
              <el-radio label="range">范围删除</el-radio>
              <el-radio label="multiple">指定删除</el-radio>
            </el-radio-group>
          </el-col>
        </el-row>
        
        <!-- 范围删除模式 -->
        <div v-if="deleteMode === 'range'" class="range-delete">
          <el-row :gutter="16" class="mb-3">
            <el-col :span="8">
              <el-input
                v-model.number="deleteStart"
                type="number"
                :placeholder="deleteType === 'row' ? '开始行号' : '开始列号'"
                min="1"
              />
            </el-col>
            <el-col :span="8">
              <el-input
                v-model.number="deleteEnd"
                type="number"
                :placeholder="deleteType === 'row' ? '结束行号' : '结束列号'"
                min="1"
              />
            </el-col>
            <el-col :span="8">
              <el-button type="primary" @click="deleteRowsOrCols">删除预览</el-button>
            </el-col>
          </el-row>
        </div>
        
        <!-- 指定删除模式 -->
        <div v-if="deleteMode === 'multiple'" class="multiple-delete">
          <el-row :gutter="16" class="mb-3">
            <el-col :span="16">
              <el-input
                v-model="multipleDeleteInput"
                type="textarea"
                :placeholder="deleteType === 'row' ? '请输入要删除的行号，用逗号分隔，如：1,3,5-8,10' : '请输入要删除的列号，用逗号分隔，如：1,3,5-8,10'"
                :rows="3"
              />
            </el-col>
            <el-col :span="8">
              <el-button type="primary" @click="deleteRowsOrCols">删除预览</el-button>
            </el-col>
          </el-row>
          <div class="mb-3">
            <el-text type="info" size="small">
              支持格式：单个数字(1)、范围(1-5)、混合(1,3,5-8,10)
            </el-text>
          </div>
        </div>
        
        <el-button type="success" @click="download">下载处理后的文件</el-button>
      </div>
    </template>
  </uploadExcel>
  <preview :parsedData="previewData" v-model="showOriginalFile" />
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import * as XLSX from 'xlsx'
import uploadExcel from '../component/uploadExcel.vue'
import Preview from '../component/preview.vue'

const dataList = ref([])
const workbook = ref(null)
const previewData = ref([])
const showOriginalFile = ref(false)

// 删除行/列相关变量
const deleteType = ref('row')
const deleteMode = ref('range') // 删除模式：range(范围删除) 或 multiple(指定删除)
const deleteStart = ref(1)
const deleteEnd = ref(1)
const multipleDeleteInput = ref('')
const handleParsedDataUpdated = (data) => {
  dataList.value = data?.parsedData ?? []
}

// 解析多行/列输入，支持单个数字、范围和混合格式
const parseMultipleInput = (input) => {
  if (!input || typeof input !== 'string') return []
  
  const numbers = new Set()
  const parts = input.split(',').map(part => part.trim()).filter(part => part)
  
  for (const part of parts) {
    if (part.includes('-')) {
      // 处理范围，如 "1-5"
      const [start, end] = part.split('-').map(n => parseInt(n.trim()))
      if (!isNaN(start) && !isNaN(end) && start <= end) {
        for (let i = start; i <= end; i++) {
          numbers.add(i)
        }
      }
    } else {
      // 处理单个数字
      const num = parseInt(part)
      if (!isNaN(num)) {
        numbers.add(num)
      }
    }
  }
  
  return Array.from(numbers).sort((a, b) => a - b)
}

// 删除行/列的核心逻辑
const deleteRowsOrCols = () => {
  if (!Array.isArray(dataList.value) || dataList.value.length === 0) {
    ElMessage.warning('请先上传并解析文件')
    return
  }

  let deleteTargets = []

  if (deleteMode.value === 'range') {
    // 范围删除模式
    if (!Number.isInteger(deleteStart.value) || !Number.isInteger(deleteEnd.value) || 
        deleteStart.value < 1 || deleteEnd.value < 1) {
      ElMessage.error('请输入有效的开始和结束位置（正整数）')
      return
    }

    if (deleteStart.value > deleteEnd.value) {
      ElMessage.error('开始位置不能大于结束位置')
      return
    }

    // 生成范围数组
    for (let i = deleteStart.value; i <= deleteEnd.value; i++) {
      deleteTargets.push(i)
    }
  } else {
    // 指定删除模式
    if (!multipleDeleteInput.value.trim()) {
      ElMessage.error('请输入要删除的行号或列号')
      return
    }

    deleteTargets = parseMultipleInput(multipleDeleteInput.value)
    if (deleteTargets.length === 0) {
      ElMessage.error('请输入有效的行号或列号')
      return
    }
  }

  const sanitizeSheetName = (name) => {
    const invalid = /[:\\\/?*\[\]]/g
    const base = String(name ?? 'Sheet').replace(invalid, '_')
    return base.slice(0, 31)
  }

  const createUniqueSheetName = (baseName, used) => {
    let name = baseName
    let idx = 1
    while (used.has(name)) {
      const suffix = `_${idx}`
      name = baseName.slice(0, 31 - suffix.length) + suffix
      idx += 1
    }
    used.add(name)
    return name
  }

  workbook.value = XLSX.utils.book_new()
  const usedSheetNames = new Set()
  const multipleFiles = dataList.value.length > 1
  const nextPreviewData = []

  dataList.value.forEach((fileGroup) => {
    const fileBaseName = String(fileGroup.fileName || 'Excel').replace(
      /\.(xlsx|xls)$/i,
      ''
    )
    const sheets = Array.isArray(fileGroup.sheets) ? fileGroup.sheets : []
    const filePreview = {
      fileName: `${fileBaseName}-删除${deleteType.value === 'row' ? '行' : '列'}`,
      sheets: [],
    }

    sheets.forEach((sheet) => {
      const original = Array.isArray(sheet?.data) ? sheet.data : []
      let processedData = []

      if (deleteType.value === 'row') {
        // 删除行：保留不在删除目标中的行
        processedData = original.filter((_, index) => {
          const rowNumber = index + 1 // 行号从1开始
          return !deleteTargets.includes(rowNumber)
        })
      } else {
        // 删除列：对每一行删除指定列
        processedData = original.map((row) => {
          const safeRow = Array.isArray(row) ? row : []
          return safeRow.filter((_, index) => {
            const colNumber = index + 1 // 列号从1开始
            return !deleteTargets.includes(colNumber)
          })
        })
      }

      const ws = XLSX.utils.aoa_to_sheet(processedData)
      const candidate = multipleFiles
        ? `${fileBaseName}_${sheet?.name ?? 'Sheet'}`
        : `${sheet?.name ?? 'Sheet'}`
      const safeName = createUniqueSheetName(
        sanitizeSheetName(candidate),
        usedSheetNames
      )
      const maxColumns = processedData.reduce(
        (max, row) => Math.max(max, Array.isArray(row) ? row.length : 0),
        0
      )
      filePreview.sheets.push({
        name: safeName,
        data: processedData,
        maxColumns,
      })
      XLSX.utils.book_append_sheet(workbook.value, ws, safeName)
    })
    nextPreviewData.push(filePreview)
  })

  previewData.value = nextPreviewData
  try {
    showOriginalFile.value = true
    const targetText = deleteMode.value === 'range' 
      ? `${deleteStart.value}-${deleteEnd.value}`
      : deleteTargets.join(',')
    ElMessage.success(`删除${deleteType.value === 'row' ? '行' : '列'}：${targetText}，请查看预览`)
  } catch (err) {
    console.error(err)
    ElMessage.error('处理 Excel 失败')
  }
}

const download = () => {
  if (!workbook.value) {
    ElMessage.warning('请先进行数据处理操作')
    return
  }
  
  let fileName = ''
  if (deleteMode.value === 'range') {
    fileName = `删除${deleteType.value === 'row' ? '行' : '列'}_${deleteStart.value}-${deleteEnd.value}.xlsx`
  } else {
    const targets = parseMultipleInput(multipleDeleteInput.value)
    fileName = `删除${deleteType.value === 'row' ? '行' : '列'}_${targets.join('_')}.xlsx`
  }
  
  XLSX.writeFile(workbook.value, fileName)
  ElMessage.success('文件下载成功')
}
</script>
