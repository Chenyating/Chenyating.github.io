<template>
  <uploadExcel title="合并文件" @parsed-data-updated="handleParsedDataUpdated">
    <template #default>
      <el-button type="primary" @click="rowToCol">文件预览</el-button>
      <el-button type="primary" @click="download">下载文件</el-button>
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
  const mergedPreview = {
    fileName: '合并-行转列',
    sheets: [],
  }

  // 收集所有工作表信息用于总览表
  const sheetInfoList = []

  dataList.value.forEach((fileGroup) => {
    const fileBaseName = String(fileGroup.fileName || 'Excel').replace(
      /\.(xlsx|xls)$/i,
      ''
    )
    const sheets = Array.isArray(fileGroup.sheets) ? fileGroup.sheets : []
    sheets.forEach((sheet) => {
      const original = Array.isArray(sheet?.data) ? sheet.data : []
      const transposed = transposeAoA(original)
      const ws = XLSX.utils.aoa_to_sheet(transposed)
      const rawSheetName = String(sheet?.name ?? 'Sheet')
      const isGenericSheet = /sheet/i.test(rawSheetName)
      const candidate = isGenericSheet ? fileBaseName : rawSheetName
      const safeName = createUniqueSheetName(
        sanitizeSheetName(candidate),
        usedSheetNames
      )

      // 保存工作表信息
      sheetInfoList.push({
        name: safeName,
        originalFileName: fileGroup.fileName,
      })

      const maxColumns = transposed.reduce(
        (max, row) => Math.max(max, Array.isArray(row) ? row.length : 0),
        0
      )
      mergedPreview.sheets.push({
        name: safeName,
        data: transposed,
        maxColumns,
      })
      XLSX.utils.book_append_sheet(workbook.value, ws, safeName)
    })
  })

  // 创建总览工作表
  if (sheetInfoList.length > 0) {
    // 创建总览数据
    const overviewData = [
      ['序号', '点击即可跳转对应的表'],
      ...sheetInfoList.map((sheet, index) => [index + 1, `#${sheet.name}!A1`]),
    ]

    // 创建总览工作表
    const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData)

    // 为跳转链接添加超链接
    sheetInfoList.forEach((sheet, index) => {
      const cellRef = `B${index + 2}` // 跳转链接在B列，从第2行开始（第1行是表头）
      overviewSheet[cellRef] = {
        v: ` ${sheet.name}`, // 显示文本
        l: { Target: `#'${sheet.name}'!A1`, Tooltip: ` ${sheet.name}` },
        s: {
          font: {
            color: { rgb: '0000FF' }, // 蓝色字体
            underline: true, // 下划线
            sz: 11, // 字体大小
          },
          alignment: { horizontal: 'center', vertical: 'center' },
        },
      }
    })

    // 将总览表插入到最前面
    XLSX.utils.book_append_sheet(workbook.value, overviewSheet, '总览')

    // 调整工作表顺序，使"总览"成为第一个工作表
    workbook.value.SheetNames = ['总览', ...sheetInfoList.map((s) => s.name)]

    // 添加总览到预览数据的开头
    const overviewPreviewData = {
      name: '总览',
      data: overviewData,
      maxColumns: 2,
    }

    mergedPreview.sheets.unshift(overviewPreviewData)
  }

  previewData.value = [mergedPreview]
  showOriginalFile.value = true
}

const download = () => {
  if (
    !workbook.value ||
    !Array.isArray(workbook.value.SheetNames) ||
    workbook.value.SheetNames.length === 0
  ) {
    ElMessage.warning('请先生成预览后再下载')
    return
  }
  XLSX.writeFile(workbook.value, '合并文件.xlsx')
}
</script>
