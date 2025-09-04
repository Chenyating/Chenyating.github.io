<template>
  <uploadExcel title="分解文件" @parsed-data-updated="handleParsedDataUpdated">
    <template #default>
      <div class="decompose-controls">
        <div class="column-selector">
          <el-form :model="decomposeConfig" label-width="120px">
            <el-form-item label="分解依据列：">
              <el-select
                v-model="decomposeConfig.targetColumn"
                placeholder="请选择要分解的列"
                :disabled="!hasData"
                style="width: 200px"
              >
                <el-option
                  v-for="col in availableColumns"
                  :key="col.index"
                  :label="`第${col.index + 1}列 (${col.name})`"
                  :value="col.index"
                />
              </el-select>
              <el-text v-if="!hasData" type="info" style="margin-left: 10px">
                请先上传并解析文件
              </el-text>
            </el-form-item>
          </el-form>
        </div>
        <div class="action-buttons">
          <el-button
            type="primary"
            @click="decomposeSheets"
            :disabled="!canDecompose"
          >
            分解预览
          </el-button>
          <el-tooltip placement="bottom" effect="light">
            <template #content>
              <div>
                <el-checkbox v-model="ifMergeColumn">是否合并列</el-checkbox>
              </div>
            </template>
            <el-button
              type="primary"
              @click="downloadExcel"
              :disabled="!hasDecomposedData"
            >
              下载excel文件（多个sheet）
            </el-button>
          </el-tooltip>

          <el-button
            type="primary"
            @click="downloadZip"
            :disabled="!hasDecomposedData"
          >
            下载压缩包
          </el-button>
        </div>
      </div>
    </template>
  </uploadExcel>
  <preview :parsedData="previewData" v-model="showOriginalFile" />
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import * as XLSX from 'xlsx'
import JSZip from 'jszip'
import uploadExcel from '../component/uploadExcel.vue'
import Preview from '../component/preview.vue'

const dataList = ref([])
const decomposedData = ref([])
const previewData = ref([])
const showOriginalFile = ref(false)

// 分解配置
const decomposeConfig = ref({
  targetColumn: null, // 目标列索引
})

const ifMergeColumn = ref(true) // 是否合并列，默认为true

const handleParsedDataUpdated = (data) => {
  dataList.value = data?.parsedData ?? []
}

// 计算属性
const hasData = computed(() => {
  return Array.isArray(dataList.value) && dataList.value.length > 0
})

const hasDecomposedData = computed(() => {
  return Array.isArray(decomposedData.value) && decomposedData.value.length > 0
})

const canDecompose = computed(() => {
  return hasData.value && decomposeConfig.value.targetColumn !== null
})

// 获取可用的列选项
const availableColumns = computed(() => {
  if (!hasData.value) return []

  const columns = new Set()

  dataList.value.forEach((fileGroup) => {
    const sheets = Array.isArray(fileGroup.sheets) ? fileGroup.sheets : []
    sheets.forEach((sheet) => {
      const data = Array.isArray(sheet?.data) ? sheet.data : []
      if (data.length > 0) {
        const maxCols = data.reduce(
          (max, row) => Math.max(max, Array.isArray(row) ? row.length : 0),
          0
        )
        for (let i = 0; i < maxCols; i++) {
          const headerValue = data[0]?.[i] || `列${i + 1}`
          columns.add({
            index: i,
            name: String(headerValue).slice(0, 20), // 限制显示长度
          })
        }
      }
    })
  })

  return Array.from(columns).sort((a, b) => a.index - b.index)
})

const decomposeSheets = () => {
  if (!canDecompose.value) {
    ElMessage.warning('请先上传文件并选择分解依据列')
    return
  }

  const targetColumn = decomposeConfig.value.targetColumn
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

      // 按目标列的值分组数据
      const groupedData = new Map()

      original.forEach((row, rowIndex) => {
        const groupKey = row[targetColumn] || '空值'
        if (!groupedData.has(groupKey)) {
          groupedData.set(groupKey, [])
        }
        groupedData.get(groupKey).push(row)
      })

      // 为每个分组创建独立的工作表
      groupedData.forEach((groupRows, groupKey) => {
        const ws = XLSX.utils.aoa_to_sheet(groupRows)
        const safeGroupKey = sanitizeFileName(String(groupKey))
        const candidate = `${fileBaseName}_${safeGroupKey}`
        const safeName = createUniqueFileName(candidate, usedFileNames)

        // 保存工作表信息
        sheetInfoList.push({
          name: safeName,
          originalFileName: fileGroup.fileName,
          originalSheetName: sheet.name,
          groupKey: groupKey,
          data: groupRows,
          maxColumns: groupRows.reduce(
            (max, row) => Math.max(max, Array.isArray(row) ? row.length : 0),
            0
          ),
        })

        decomposedPreview.sheets.push({
          name: safeName,
          data: groupRows,
          maxColumns: groupRows.reduce(
            (max, row) => Math.max(max, Array.isArray(row) ? row.length : 0),
            0
          ),
        })
      })
    })
  })

  // 创建总览工作表
  if (sheetInfoList.length > 0) {
    // 创建总览数据
    const overviewData = [
      ['序号', '文件名', '原始工作表名', '来源文件', '分组值', '行数', '列数'],
      ...sheetInfoList.map((sheet, index) => [
        index + 1,
        `${sheet.name}.xlsx`,
        sheet.originalSheetName,
        sheet.originalFileName,
        sheet.groupKey,
        sheet.data.length,
        sheet.maxColumns,
      ]),
    ]

    // 添加总览到预览数据的开头
    const overviewPreviewData = {
      name: '总览',
      data: overviewData,
      maxColumns: 7,
    }

    decomposedPreview.sheets.unshift(overviewPreviewData)
  }

  decomposedData.value = sheetInfoList
  previewData.value = [decomposedPreview]
  showOriginalFile.value = true

  ElMessage.success(`分解完成，共生成 ${sheetInfoList.length} 个独立文件`)
}

const downloadExcel = async () => {
  if (!hasDecomposedData.value) {
    ElMessage.warning('请先生成分解预览后再下载')
    return
  }

  try {
    // 创建一个新的工作簿
    const workbook = XLSX.utils.book_new()
    
    // 添加总览工作表
    if (decomposedData.value.length > 0) {
      const overviewData = [
        [
          '序号',
          '工作表名',
          '原始工作表名',
          '来源文件',
          '分组值',
          '行数',
          '列数',
        ],
        ...decomposedData.value.map((sheet, index) => [
          index + 1,
          sheet.name,
          sheet.originalSheetName,
          sheet.originalFileName,
          sheet.groupKey,
          sheet.data.length,
          sheet.maxColumns,
        ]),
      ]
      const overviewWorksheet = XLSX.utils.aoa_to_sheet(overviewData)
      XLSX.utils.book_append_sheet(workbook, overviewWorksheet, '总览')
    }
    
    // 为每个分解后的数据添加工作表
    decomposedData.value.forEach((sheetInfo, index) => {
      let worksheet
      
      if (ifMergeColumn.value) {
        // 如果需要合并单元格，处理相同内容的合并
        worksheet = createWorksheetWithMergedCells(sheetInfo.data)
      } else {
        // 不合并单元格，直接创建工作表
        worksheet = XLSX.utils.aoa_to_sheet(sheetInfo.data)
      }
      
      // 使用序号+名称作为工作表名，避免特殊字符问题
      const sheetName = `Sheet${index + 1}_${sheetInfo.name.slice(0, 20)}`
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
    })

    // 生成Excel文件并下载
    const excelBuffer = XLSX.write(workbook, {
      type: 'array',
      bookType: 'xlsx',
    })
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = '分解结果.xlsx'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    ElMessage.success('Excel文件下载完成')
  } catch (error) {
    console.error('下载失败:', error)
    ElMessage.error('下载过程中出现错误')
  }
}

// 创建带有合并单元格的工作表
const createWorksheetWithMergedCells = (data) => {
  if (!data || data.length === 0) {
    return XLSX.utils.aoa_to_sheet([])
  }

  // 先创建基础工作表
  const worksheet = XLSX.utils.aoa_to_sheet(data)
  
  // 添加合并单元格信息
  const merges = []
  
  // 逐列检查相同内容
  for (let col = 0; col < data[0].length; col++) {
    let startRow = 0
    let currentValue = data[0][col]
    
    for (let row = 1; row < data.length; row++) {
      const cellValue = data[row][col]
      
      // 如果值发生变化，合并之前的单元格
      if (cellValue !== currentValue) {
        if (row - 1 > startRow) {
          // 有多个相同值的单元格需要合并
          merges.push({
            s: { r: startRow, c: col }, // 开始位置
            e: { r: row - 1, c: col }  // 结束位置
          })
        }
        startRow = row
        currentValue = cellValue
      }
    }
    
    // 处理最后一组相同值的单元格
    if (data.length - 1 > startRow) {
      merges.push({
        s: { r: startRow, c: col },
        e: { r: data.length - 1, c: col }
      })
    }
  }
  
  // 设置合并单元格
  worksheet['!merges'] = merges
  
  return worksheet
}

const downloadZip = async () => {
  if (!hasDecomposedData.value) {
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
      const excelBuffer = XLSX.write(workbook, {
        type: 'array',
        bookType: 'xlsx',
      })
      zip.file(`${sheetInfo.name}.xlsx`, excelBuffer)
    })

    // 创建总览文件
    if (decomposedData.value.length > 0) {
      const overviewWorkbook = XLSX.utils.book_new()
      const overviewData = [
        [
          '序号',
          '文件名',
          '原始工作表名',
          '来源文件',
          '分组值',
          '行数',
          '列数',
        ],
        ...decomposedData.value.map((sheet, index) => [
          index + 1,
          `${sheet.name}.xlsx`,
          sheet.originalSheetName,
          sheet.originalFileName,
          sheet.groupKey,
          sheet.data.length,
          sheet.maxColumns,
        ]),
      ]
      const overviewWorksheet = XLSX.utils.aoa_to_sheet(overviewData)
      XLSX.utils.book_append_sheet(overviewWorkbook, overviewWorksheet, '总览')

      const overviewBuffer = XLSX.write(overviewWorkbook, {
        type: 'array',
        bookType: 'xlsx',
      })
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

<style scoped>
.decompose-controls {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin: 20px 0;
  padding: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background-color: #fafafa;
}

.column-selector {
  display: flex;
  align-items: center;
  gap: 10px;
}

.action-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
}
</style>
