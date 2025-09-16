<template>
  <h2 style="text-align: center; margin: 10px">Excel指定字段替换</h2>
  <steps
    :stepList="stepList"
    desc="这个工具用于，将Excel中的某行或某列的字段或sheet名替换为字典中的value，以便于知道每个数值表达的中文意思"
  />
  <div class="toolbar">
    <el-button-group>
      <el-tooltip placement="bottom" effect="light">
        <template #content>
          <div>
            <el-radio-group v-model="dataSelectionMode">
              <el-radio label="row">替换行</el-radio>
              <el-radio label="column">替换列</el-radio>
            </el-radio-group>
            <div v-if="dataSelectionMode === 'row'" style="margin-top: 10px">
              替换行号：
              <el-input
                v-model.number="dataStartRow"
                type="number"
                placeholder="要替换的行号"
                min="1"
              />
            </div>
            <div v-if="dataSelectionMode === 'column'" style="margin-top: 10px">
              替换列号：
              <el-input
                v-model.number="dataStartColumn"
                type="number"
                placeholder="要替换的列号"
                min="1"
              />
            </div>
          </div>
        </template>
        <el-button type="primary" @click="replaceField"
          >替换单元格预览</el-button
        >
      </el-tooltip>
      <el-button v-if="previewData.length > 0" type="primary" @click="download"
        >替换单元格下载</el-button
      >
    </el-button-group>
    <el-button-group>
      <el-button type="primary" @click="replaceSheetName"
        >替换sheet名预览</el-button
      >
      <el-button
        v-if="previewData.length > 0"
        type="primary"
        @click="downloadSheetName"
        >替换sheet名下载</el-button
      >
    </el-button-group>
  </div>
  <div style="display: flex; gap: 10px">
    <uploadField
      title="字典清单"
      :show-dict-upload="true"
      @field-event="handleFieldEvent"
    />
    <uploadExcel
      single
      title="数据清单"
      :show-dict-upload="false"
      @parsed-data-updated="handleDataListUpdated"
    >
    </uploadExcel>
  </div>
  <preview :parsedData="previewData" v-model="showOriginalFile" />
</template>

<script setup>
import steps from '@/view/tools/component/steps.vue'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import * as XLSX from 'xlsx'
import uploadField from '../component/uploadField.vue'
import uploadExcel from '../component/uploadExcel.vue'
import Preview from '../component/preview.vue'
const stepList = ref([
  {
    title: '上传字典清单',
    desc: '选择指定的sheet生成键对值',
  },
  {
    title: '上传数据清单',
    desc: '可选择替换sheet名或sheet内指定行或列的字段',
  },
  {
    title: '预览替换结果',
    desc: '阅览后可下载Excel文件',
  },
])
stepList
// 数据相关
const dataList = ref([])
const dictList = ref([])
const keyValuePairs = ref([])
const previewData = ref([])
const showOriginalFile = ref(false)

// 字典配置相关
const dataSelectionMode = ref('row') // 数据清单的替换模式：'row' or 'column'

// 数据清单替换位置
const dataStartRow = ref(1)
const dataStartColumn = ref(1)

// 处理数据清单更新
const handleDataListUpdated = (data) => {
  dataList.value = data?.parsedData ?? []
  previewData.value = []
}

// 处理字典清单更新
const handleDictListUpdated = (data) => {
  dictList.value = data?.parsedData ?? []
}

// 处理键值对生成
const handleKeyValuePairsGenerated = (pairs) => {
  keyValuePairs.value = pairs
}

// 处理字段替换完成
const handleFieldReplacementCompleted = (result) => {
  previewData.value = [result.replacedData]
  showOriginalFile.value = true
  ElMessage.success(`字段替换完成，共替换了 ${result.replacedCount} 个单元格`)
}

// 处理统一事件
const handleFieldEvent = (e) => {
  const { type, payload } = e || {}
  switch (type) {
    case 'dictParsed':
      handleDictListUpdated(payload)
      break
    case 'pairsGenerated':
      handleKeyValuePairsGenerated(payload)
      break
    case 'replacementCompleted':
      handleFieldReplacementCompleted(payload)
      break
    default:
      break
  }
}

// 字段替换匹配（保留原有逻辑作为备用）
const replaceField = () => {
  if (dataList.value.length === 0) {
    ElMessage.warning('请先上传数据清单文件')
    return
  }

  if (keyValuePairs.value.length === 0) {
    ElMessage.warning('请先生成键值对')
    return
  }

  try {
    const dataFile = dataList.value[0]
    if (!dataFile?.sheets?.[0]?.data) {
      ElMessage.error('数据文件没有有效数据')
      return
    }

    const originalData = JSON.parse(JSON.stringify(dataFile))

    // 处理每个工作表
    const processedSheets = dataFile.sheets.map((sheet) => {
      const processedData = sheet.data.map((row, rowIndex) => {
        return row.map((cell, colIndex) => {
          if (cell == null || cell === '') return cell

          const cellStr = String(cell)

          // 判断是否需要替换
          const shouldReplace =
            dataSelectionMode.value === 'row'
              ? rowIndex + 1 === dataStartRow.value
              : colIndex + 1 === dataStartColumn.value

          if (shouldReplace) {
            const match = keyValuePairs.value.find(
              (pair) => pair.key === cellStr
            )
            if (match) {
              console.log(
                `替换: ${cellStr} -> ${match.value} (位置: 行${
                  rowIndex + 1
                }, 列${colIndex + 1})`
              )
              return match.value
            }
          }

          return cell
        })
      })

      return { ...sheet, data: processedData }
    })

    // 更新预览数据
    previewData.value = [{ ...dataFile, sheets: processedSheets }]
    showOriginalFile.value = true

    // 统计替换数量
    const replacedCount = countReplacedCells(originalData, previewData.value[0])
    ElMessage.success(
      `字段替换完成，共替换了 ${replacedCount} 个单元格，请查看预览结果`
    )
  } catch (error) {
    console.error('字段替换失败:', error)
    ElMessage.error('字段替换时出现错误')
  }
}

// 统计替换的单元格数量
const countReplacedCells = (originalData, replacedData) => {
  if (!originalData?.sheets?.[0]?.data || !replacedData?.sheets?.[0]?.data) {
    return 0
  }

  let count = 0
  const originalSheet = originalData.sheets[0]
  const replacedSheet = replacedData.sheets[0]

  originalSheet.data.forEach((originalRow, rowIndex) => {
    const replacedRow = replacedSheet.data[rowIndex]
    if (!replacedRow) return

    originalRow.forEach((originalCell, colIndex) => {
      if (originalCell !== replacedRow[colIndex]) {
        count++
      }
    })
  })

  return count
}

// 下载替换后的文件
const download = () => {
  if (dataList.value.length === 0) {
    ElMessage.warning('请先上传数据清单文件')
    return
  }

  if (keyValuePairs.value.length === 0) {
    ElMessage.warning('请先生成键值对')
    return
  }

  try {
    const dataFile = dataList.value[0]
    if (!dataFile?.sheets?.[0]?.data) {
      ElMessage.error('数据文件没有有效数据')
      return
    }

    const workbook = XLSX.utils.book_new()

    // 处理每个工作表
    dataFile.sheets.forEach((sheet) => {
      const processedData = sheet.data.map((row, rowIndex) => {
        return row.map((cell, colIndex) => {
          if (cell == null || cell === '') return cell

          const cellStr = String(cell)

          // 判断是否需要替换
          const shouldReplace =
            dataSelectionMode.value === 'row'
              ? rowIndex + 1 === dataStartRow.value
              : colIndex + 1 === dataStartColumn.value

          if (shouldReplace) {
            const match = keyValuePairs.value.find(
              (pair) => pair.key === cellStr
            )
            if (match) return match.value
          }

          return cell
        })
      })

      const worksheet = XLSX.utils.aoa_to_sheet(processedData)
      XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name)
    })

    const fileName = `替换后的_${dataFile.fileName}`
    XLSX.writeFile(workbook, fileName)
    ElMessage.success('文件下载成功')
  } catch (error) {
    console.error('下载失败:', error)
    ElMessage.error('下载文件时出现错误')
  }
}

// 预览：按字典替换 sheet 名
const replaceSheetName = () => {
  if (dataList.value.length === 0) {
    ElMessage.warning('请先上传数据清单文件')
    return
  }

  if (keyValuePairs.value.length === 0) {
    ElMessage.warning('请先生成键值对')
    return
  }

  try {
    const dataFile = dataList.value[0]
    if (!dataFile?.sheets?.length) {
      ElMessage.error('数据文件没有有效的工作表')
      return
    }

    // 生成名称映射并统计重命名数量
    const findMappedName = (oldName) => {
      const target = keyValuePairs.value.find(
        (pair) => pair.key === String(oldName)
      )
      return target ? String(target.value) : oldName
    }

    // 处理重复名：确保预览中 sheet 名唯一
    const usedNames = new Set()
    const makeUnique = (baseName) => {
      let name = baseName || 'Sheet'
      let idx = 1
      while (usedNames.has(name)) {
        name = `${baseName || 'Sheet'}(${idx++})`
      }
      usedNames.add(name)
      return name
    }

    let renameCount = 0
    const processedSheets = dataFile.sheets.map((sheet) => {
      const oldName = sheet?.name ?? ''
      const mapped = findMappedName(oldName)
      if (mapped !== oldName) renameCount++
      const uniqueName = makeUnique(mapped)
      return { ...sheet, name: uniqueName }
    })

    previewData.value = [{ ...dataFile, sheets: processedSheets }]
    showOriginalFile.value = true

    if (renameCount === 0) {
      ElMessage.warning('没有匹配到可替换的 sheet 名')
    } else {
      ElMessage.success(
        `sheet 名替换预览完成，共重命名 ${renameCount} 个工作表`
      )
    }
  } catch (error) {
    console.error('sheet 名替换预览失败:', error)
    ElMessage.error('sheet 名替换预览时出现错误')
  }
}

// 下载：按字典替换 sheet 名并导出
const downloadSheetName = () => {
  if (dataList.value.length === 0) {
    ElMessage.warning('请先上传数据清单文件')
    return
  }

  if (keyValuePairs.value.length === 0) {
    ElMessage.warning('请先生成键值对')
    return
  }

  try {
    const dataFile = dataList.value[0]
    if (!dataFile?.sheets?.length) {
      ElMessage.error('数据文件没有有效的工作表')
      return
    }

    const workbook = XLSX.utils.book_new()

    const findMappedName = (oldName) => {
      const target = keyValuePairs.value.find(
        (pair) => pair.key === String(oldName)
      )
      return target ? String(target.value) : oldName
    }

    // Excel 工作表名需唯一，构建去重逻辑
    const usedNames = new Set()
    const makeUnique = (baseName) => {
      let name = baseName || 'Sheet'
      let idx = 1
      while (usedNames.has(name)) {
        name = `${baseName || 'Sheet'}(${idx++})`
      }
      usedNames.add(name)
      return name
    }

    let renameCount = 0
    dataFile.sheets.forEach((sheet) => {
      const oldName = sheet?.name ?? ''
      const mapped = findMappedName(oldName)
      if (mapped !== oldName) renameCount++
      const uniqueName = makeUnique(mapped)

      const worksheet = XLSX.utils.aoa_to_sheet(sheet.data || [])
      XLSX.utils.book_append_sheet(workbook, worksheet, uniqueName)
    })

    const fileName = `sheet名替换_${dataFile.fileName}`
    XLSX.writeFile(workbook, fileName)
    if (renameCount === 0) {
      ElMessage.success('已下载（未检测到需重命名的工作表）')
    } else {
      ElMessage.success(`文件下载成功，重命名 ${renameCount} 个工作表`)
    }
  } catch (error) {
    console.error('sheet 名替换下载失败:', error)
    ElMessage.error('下载文件时出现错误')
  }
}
</script>
<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
  justify-content: flex-end;
  margin: 20px;
}
</style>
