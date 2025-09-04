<template>
  <uploadExcel title="分解文件" @parsed-data-updated="handleParsedDataUpdated">
    <template #default>
      <el-button type="primary" @click="decomposeSheets">分解预览</el-button>
      <el-button type="primary" @click="downloadZip">下载压缩包</el-button>
    </template>
  </uploadExcel>
  <preview :parsedData="previewData" v-model="showOriginalFile" />
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import * as XLSX from 'xlsx'
import JSZip from 'jszip'
import uploadExcel from '../component/uploadExcel.vue'
import Preview from '../component/preview.vue'

const dataList = ref([])
const decomposedData = ref([])
const previewData = ref([])
const showOriginalFile = ref(false)

const handleParsedDataUpdated = (data) => {
  dataList.value = data?.parsedData ?? []
}

const decomposeSheets = () => {
  if (!Array.isArray(dataList.value) || dataList.value.length === 0) {
    ElMessage.warning('请先上传并解析文件')
    return
  }

  const sanitizeFileName = (name) => {
    const invalid = /[:\\\/?*\[\]]/g
    const base = String(name ?? 'Sheet').replace(invalid, '_')
    return base.slice(0, 31)
  }

  const createUniqueFileName = (baseName, used) => {
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

  const usedFileNames = new Set()
  const decomposedPreview = {
    fileName: '分解结果',
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
      if (original.length === 0) return

      const ws = XLSX.utils.aoa_to_sheet(original)
      const rawSheetName = String(sheet?.name ?? 'Sheet')
      const isGenericSheet = /sheet/i.test(rawSheetName)
      const candidate = isGenericSheet ? fileBaseName : rawSheetName
      const safeName = createUniqueFileName(
        sanitizeFileName(candidate),
        usedFileNames
      )

      // 保存工作表信息
      sheetInfoList.push({
        name: safeName,
        originalFileName: fileGroup.fileName,
        originalSheetName: rawSheetName,
        data: original,
        maxColumns: original.reduce(
          (max, row) => Math.max(max, Array.isArray(row) ? row.length : 0),
          0
        )
      })

      decomposedPreview.sheets.push({
        name: safeName,
        data: original,
        maxColumns: original.reduce(
          (max, row) => Math.max(max, Array.isArray(row) ? row.length : 0),
          0
        ),
      })
    })
  })

  // 创建总览工作表
  if (sheetInfoList.length > 0) {
    // 创建总览数据
    const overviewData = [
      ['序号', '文件名', '原始工作表名', '来源文件', '行数', '列数'],
      ...sheetInfoList.map((sheet, index) => [
        index + 1, 
        `${sheet.name}.xlsx`, 
        sheet.originalSheetName,
        sheet.originalFileName,
        sheet.data.length,
        sheet.maxColumns
      ]),
    ]

    // 添加总览到预览数据的开头
    const overviewPreviewData = {
      name: '总览',
      data: overviewData,
      maxColumns: 6,
    }

    decomposedPreview.sheets.unshift(overviewPreviewData)
  }

  decomposedData.value = sheetInfoList
  previewData.value = [decomposedPreview]
  showOriginalFile.value = true
  
  ElMessage.success(`分解完成，共生成 ${sheetInfoList.length} 个独立文件`)
}

const downloadZip = async () => {
  if (!Array.isArray(decomposedData.value) || decomposedData.value.length === 0) {
    ElMessage.warning('请先生成分解预览后再下载')
    return
  }

  try {
    const zip = new JSZip()
    
    // 为每个sheet创建独立的Excel文件
    decomposedData.value.forEach((sheetInfo) => {
      const workbook = XLSX.utils.book_new()
      const worksheet = XLSX.utils.aoa_to_sheet(sheetInfo.data)
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
      
      // 将Excel文件添加到zip中
      const excelBuffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' })
      zip.file(`${sheetInfo.name}.xlsx`, excelBuffer)
    })

    // 创建总览文件
    if (decomposedData.value.length > 0) {
      const overviewWorkbook = XLSX.utils.book_new()
      const overviewData = [
        ['序号', '文件名', '原始工作表名', '来源文件', '行数', '列数'],
        ...decomposedData.value.map((sheet, index) => [
          index + 1, 
          `${sheet.name}.xlsx`, 
          sheet.originalSheetName,
          sheet.originalFileName,
          sheet.data.length,
          sheet.maxColumns
        ]),
      ]
      const overviewWorksheet = XLSX.utils.aoa_to_sheet(overviewData)
      XLSX.utils.book_append_sheet(overviewWorkbook, overviewWorksheet, '总览')
      
      const overviewBuffer = XLSX.write(overviewWorkbook, { type: 'array', bookType: 'xlsx' })
      zip.file('总览.xlsx', overviewBuffer)
    }

    // 生成并下载zip文件
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(zipBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = '分解文件.zip'
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
