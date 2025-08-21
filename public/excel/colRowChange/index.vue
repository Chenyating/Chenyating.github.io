<template>
  <uploadExcel title="列转行" @parsed-data-updated="handleParsedDataUpdated">
    <template #default>
      <el-tooltip placement="bottom" effect="light">
        <template #content>
          <div>
            <el-checkbox v-model="convertAll">转换所有数据</el-checkbox>
            <el-input
              v-model.number="startRow"
              type="number"
              placeholder="开始列"
              :disabled="convertAll"
              min="1"
            />
            <el-input
              v-model.number="endRow"
              type="number"
              placeholder="结束列"
              :disabled="convertAll"
              min="1"
            />
          </div>
        </template>
        <el-button type="primary" @click="colToRow">列转行转换预览</el-button>
      </el-tooltip>
      <el-button type="primary" @click="download">列转行转换下载</el-button>
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
const colToRow = () => {
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

  // 校验列范围（如果不是全量转换）
  let sc = 1
  let ec = Number.MAX_SAFE_INTEGER
  if (!convertAll.value) {
    sc = Number(startRow.value)
    ec = Number(endRow.value)
    if (!Number.isInteger(sc) || !Number.isInteger(ec) || sc < 1 || ec < 1) {
      ElMessage.error('请输入有效的开始列和结束列（正整数）')
      return
    }
    if (sc > ec) {
      ElMessage.error('开始列不能大于结束列')
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
      fileName: `${fileBaseName}-列转行`,
      sheets: [],
    }
    sheets.forEach((sheet) => {
      const original = Array.isArray(sheet?.data) ? sheet.data : []
      let slicedByColumns = original
      if (!convertAll.value) {
        const maxRows = original.length
        if (maxRows === 0) {
          slicedByColumns = []
        } else {
          const startColIdx = Math.max(0, sc - 1)
          const endColIdx = ec - 1
          slicedByColumns = original.map((row) => {
            const safeRow = Array.isArray(row) ? row : []
            const finalEnd = Math.max(startColIdx, Math.min(safeRow.length - 1, endColIdx))
            return safeRow.slice(startColIdx, finalEnd + 1)
          })
        }
      }

      const transposed = transposeAoA(slicedByColumns)
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
