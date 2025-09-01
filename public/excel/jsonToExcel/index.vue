<template>
  <uploadJson
    title="json数组转化excel"
    @parsed-data-updated="handleParsedDataUpdated"
  >
    <template #default>
      <div class="json-to-excel-controls">
        <el-tooltip placement="bottom" effect="light">
          <el-button
            type="primary"
            @click="jsonToExcel"
            :disabled="!dataList.length"
          >
            转化为excel预览
          </el-button>
        </el-tooltip>
        <el-button type="primary" @click="download">下载文件</el-button>
      </div>
    </template>
  </uploadJson>

  <!-- 预览区域 -->
   <Preview :parsedData="previewData" v-model="activePreviewNames" title="转换预览" />
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import * as XLSX from 'xlsx'
import uploadJson from '../component/uploadJson.vue'
import Preview from '../component/preview.vue'

const dataList = ref([])
const workbook = ref(null)
const previewData = ref([])
const activePreviewNames = ref(false)

const handleParsedDataUpdated = (data) => {
  dataList.value = data?.parsedData ?? []
}

// 预览由 Preview 组件直接渲染

// 工具
const isPlainObject = (v) => v && typeof v === 'object' && !Array.isArray(v)
const fillByMode = (v, mode) =>
  v === null || v === undefined || v === '' ? (mode === 'fill' ? '无' : v) : v

// 纯数组导出：单行表头（字段并集），无合并
const buildSimpleArrayTable = (jsonArray) => {
  const mode = 'fill'
  if (!Array.isArray(jsonArray)) throw new Error('数据应为数组类型')
  const rows = jsonArray
  const headersSet = new Set()
  rows.forEach((item) => {
    if (isPlainObject(item)) Object.keys(item).forEach((k) => headersSet.add(k))
  })
  const headers = Array.from(headersSet)
  const data = rows.map((item) =>
    headers.map((h) =>
      Array.isArray(item?.[h])
        ? fillByMode((item?.[h] || []).join(','), mode)
        : fillByMode(item?.[h], mode)
    )
  )
  return { headers, data }
}

// 创建普通工作表（无合并）
const createWorksheet = (headers, data) => {
  const aoa = [headers, ...data]
  const ws = XLSX.utils.aoa_to_sheet(aoa)
  const maxCols = headers.length
  ws['!cols'] = Array(maxCols).fill({ width: 18 })
  return ws
}

const jsonToExcel = () => {
  if (!Array.isArray(dataList.value) || dataList.value.length === 0) {
    ElMessage.warning('请先上传并解析JSON文件')
    return
  }

  workbook.value = XLSX.utils.book_new()
  const combinedSheets = []
  const usedSheetNames = new Set()

  const getUniqueSheetName = (base) => {
    const baseTrim = String(base || 'Sheet').slice(0, 31)
    if (!usedSheetNames.has(baseTrim)) {
      usedSheetNames.add(baseTrim)
      return baseTrim
    }
    let i = 1
    // 追加序号，确保总长不超过 31
    while (true) {
      const suffix = `_${i}`
      const candidate = `${baseTrim.slice(0, 31 - suffix.length)}${suffix}`
      if (!usedSheetNames.has(candidate)) {
        usedSheetNames.add(candidate)
        return candidate
      }
      i += 1
    }
  }

  // 仅处理纯数组：每个文件生成一个工作表（单行表头）
  dataList.value.forEach((fileGroup) => {
    const fileBaseName = String(fileGroup.fileName || 'JSON').replace(
      /\.json$/i,
      ''
    )
    try {
      const { headers, data } = buildSimpleArrayTable(fileGroup.json)
      const ws = createWorksheet(headers, data)
      const sheetName = getUniqueSheetName(fileBaseName)
      XLSX.utils.book_append_sheet(workbook.value, ws, sheetName)
      const dataWithHeader = [headers, ...data]
      combinedSheets.push({
        name: sheetName,
        headers: headers || [],
        data: dataWithHeader,
        maxColumns: headers.length,
      })
    } catch (e) {
      console.error(e)
      ElMessage.error(`文件 ${fileBaseName} 处理失败：${e.message || e}`)
    }
  })

  if (combinedSheets.length > 0)
    previewData.value = [
      {
        fileName: '转换结果',
        sheets: combinedSheets,
      },
    ]
  else ElMessage.warning('没有生成任何工作表，请检查JSON数据格式')
  activePreviewNames.value = true
}

const download = () => {
  if (!workbook.value) {
    ElMessage.warning('请先生成Excel文件')
    return
  }
  try {
    const fileName = `JSON转换结果_${new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/:/g, '-')}.xlsx`
    XLSX.writeFile(workbook.value, fileName)
    ElMessage.success('文件下载成功')
  } catch (error) {
    console.error('下载失败:', error)
    ElMessage.error('文件下载失败')
  }
}
</script>

<style scoped>
.json-to-excel-controls {
  margin: 20px 0;
  padding: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background-color: #fafafa;
}
 
 
</style>
