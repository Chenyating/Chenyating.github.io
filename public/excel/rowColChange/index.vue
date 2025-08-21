<template>
  <uploadExcel title="行转列" @parsed-data-updated="handleParsedDataUpdated">
    <template #default>
      <el-tooltip placement="bottom" effect="light">
        <template #content>
          <div>
            <el-checkbox v-model="convertAll">转换所有数据</el-checkbox>
            <el-input
              v-model.number="startRow"
              type="number"
              placeholder="开始行"
              :disabled="convertAll"
              min="1"
            />
            <el-input
              v-model.number="endRow"
              type="number"
              placeholder="结束行"
              :disabled="convertAll"
              min="1"
            />
          </div>
        </template>
        <el-button type="primary" @click="rowToCol">行转列转换预览</el-button>
      </el-tooltip>
      <el-button type="primary" @click="download">行转列转换下载</el-button>
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
const convertAll = ref(true)
const startRow = ref(1)
const endRow = ref()
const showOriginalFile = ref(false)
const handleParsedDataUpdated = (data) => {
  dataList.value = data?.parsedData ?? []
}
const rowToCol = () => {
  if (!Array.isArray(dataList.value) || dataList.value.length === 0) {
    ElMessage.warning('请先上传并解析文件')
    return
  }

  const transposeAoA = (aoa) => {
    if (!Array.isArray(aoa) || aoa.length === 0) return []
    const rowCount = aoa.length
    const colCount = aoa[0]?.length || 0
    const result = Array.from({ length: colCount }, () => Array(rowCount))
    for (let r = 0; r < rowCount; r += 1) {
      const row = aoa[r] || []
      for (let c = 0; c < colCount; c += 1) {
        result[c][r] = row[c]
      }
    }
    return result
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

  // 校验行范围（如果不是全量转换）
  let sr = 1
  let er = Number.MAX_SAFE_INTEGER
  if (!convertAll.value) {
    sr = Number(startRow.value)
    er = Number(endRow.value)
    if (!Number.isInteger(sr) || !Number.isInteger(er) || sr < 1 || er < 1) {
      ElMessage.error('请输入有效的开始行和结束行（正整数）')
      return
    }
    if (sr > er) {
      ElMessage.error('开始行不能大于结束行')
      return
    }
  }

  dataList.value.forEach((fileGroup) => {
    const fileBaseName = String(fileGroup.fileName || 'Excel').replace(
      /\.(xlsx|xls)$/i,
      ''
    )
    const sheets = Array.isArray(fileGroup.sheets) ? fileGroup.sheets : []
    const filePreview = {
      fileName: `${fileBaseName}-行转列`,
      sheets: [],
    }
    sheets.forEach((sheet) => {
      const original = Array.isArray(sheet?.data) ? sheet.data : []
      let sliced = original
      if (!convertAll.value) {
        const maxRows = original.length
        if (maxRows === 0) {
          sliced = []
        } else {
          const startIdx = Math.max(0, Math.min(maxRows - 1, sr - 1))
          const endIdx = Math.max(startIdx, Math.min(maxRows - 1, er - 1))
          sliced = original.slice(startIdx, endIdx + 1)
        }
      }

      const transposed = transposeAoA(sliced)
      const ws = XLSX.utils.aoa_to_sheet(transposed)
      const candidate = multipleFiles
        ? `${fileBaseName}_${sheet?.name ?? 'Sheet'}`
        : `${sheet?.name ?? 'Sheet'}`
      const safeName = createUniqueSheetName(
        sanitizeSheetName(candidate),
        usedSheetNames
      )
      const maxColumns = transposed.reduce(
        (max, row) => Math.max(max, Array.isArray(row) ? row.length : 0),
        0
      )
      filePreview.sheets.push({
        name: safeName,
        data: transposed,
        maxColumns,
      })
      XLSX.utils.book_append_sheet(workbook.value, ws, safeName)
    })
    nextPreviewData.push(filePreview)
  })

  previewData.value = nextPreviewData
  try {
    showOriginalFile.value = true
  } catch (err) {
    console.error(err)
    ElMessage.error('导出 Excel 失败')
  }
}

const download = () => {
  XLSX.writeFile(workbook.value, '转换文件.xlsx')
}
</script>
