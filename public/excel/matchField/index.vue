<template>
  <div style="display: flex; gap: 10px">
    <uploadExcel
      single
      title="数据清单"
      @parsed-data-updated="handleDataListUpdated"
    >
      <template #default>
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
              <div
                v-if="dataSelectionMode === 'column'"
                style="margin-top: 10px"
              >
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
          <el-button type="primary" @click="replaceField">替换预览</el-button>
        </el-tooltip>
        <el-button
          v-if="previewData.length > 0"
          type="primary"
          @click="download"
          >替换下载</el-button
        >
      </template>
    </uploadExcel>
    <uploadExcel
      single
      title="字典清单"
      @parsed-data-updated="handleDictListUpdated"
    >
      <template #default>
        <el-tooltip placement="bottom" effect="light">
          <template #content>
            <div>
              <el-radio-group v-model="dictSelectionMode">
                <el-radio label="row">行选择</el-radio>
                <el-radio label="column">列选择</el-radio>
              </el-radio-group>
              <div v-if="dictSelectionMode === 'row'" style="margin-top: 10px">
                key行：
                <el-input
                  v-model.number="dictStartRow"
                  type="number"
                  placeholder="key行"
                  min="1"
                />
                value行：
                <el-input
                  v-model.number="dictEndRow"
                  type="number"
                  placeholder="value行"
                  min="1"
                />
              </div>
              <div
                v-if="dictSelectionMode === 'column'"
                style="margin-top: 10px"
              >
                key列：
                <el-input
                  v-model.number="dictStartColumn"
                  type="number"
                  placeholder="key列"
                  min="1"
                />
                value列：
                <el-input
                  v-model.number="dictEndColumn"
                  type="number"
                  placeholder="value列"
                  min="1"
                />
              </div>
            </div>
          </template>
          <el-button type="primary" @click="getKeyValue">生成键值对</el-button>
        </el-tooltip>
        <div v-if="keyValuePairs.length > 0">
          <el-table
            :data="keyValuePairs"
            border
            style="width: 100%; height: 200px"
          >
            <el-table-column prop="key" label="Key" width="200" />
            <el-table-column prop="value" label="Value" />
          </el-table>
        </div>
      </template>
    </uploadExcel>
  </div>
  <preview :parsedData="previewData" v-model="showOriginalFile" />
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import * as XLSX from 'xlsx'
import uploadExcel from '../component/uploadExcel.vue'
import Preview from '../component/preview.vue'

// 数据相关
const dataList = ref([])
const dictList = ref([])
const keyValuePairs = ref([])
const previewData = ref([])
const showOriginalFile = ref(false)

// 字典配置相关
const dataSelectionMode = ref('row') // 数据清单的替换模式：'row' or 'column'
const dictSelectionMode = ref('column') // 字典清单的生成模式：'row' or 'column'

// 数据清单替换位置
const dataStartRow = ref(1)
const dataStartColumn = ref(1)

// 字典清单生成位置
const dictStartRow = ref(1)
const dictEndRow = ref(2)
const dictStartColumn = ref(1)
const dictEndColumn = ref(2)

// 处理数据清单更新
const handleDataListUpdated = (data) => {
  dataList.value = data?.parsedData ?? []
  previewData.value = []
}

// 处理字典清单更新
const handleDictListUpdated = (data) => {
  dictList.value = data?.parsedData ?? []
  keyValuePairs.value = []
}

// 生成键值对
const getKeyValue = () => {
  if (dictList.value.length === 0) {
    ElMessage.warning('请先上传字典清单文件')
    return
  }

  try {
    // 获取第一个字典文件的数据
    const dictFile = dictList.value[0]
    if (!dictFile || !dictFile.sheets || dictFile.sheets.length === 0) {
      ElMessage.error('字典文件没有有效数据')
      return
    }

    // 获取第一个工作表的数据
    const sheetData = dictFile.sheets[0].data

    // 验证设置
    if (dictSelectionMode.value === 'row') {
      if (dictStartRow.value < 1 || dictEndRow.value < 1) {
        ElMessage.error('行数必须大于0')
        return
      }

      if (
        dictStartRow.value > sheetData.length ||
        dictEndRow.value > sheetData.length
      ) {
        ElMessage.error('行数超出文件范围')
        return
      }
    } else {
      // column selection
      if (dictStartColumn.value < 1 || dictEndColumn.value < 1) {
        ElMessage.error('列数必须大于0')
        return
      }

      if (
        dictStartColumn.value > sheetData[0].length ||
        dictEndColumn.value > sheetData[0].length
      ) {
        ElMessage.error('列数超出文件范围')
        return
      }
    }

    // 生成键值对
    const pairs = []
    let keyData, valueData

    if (dictSelectionMode.value === 'row') {
      // 行选择模式：获取指定行的数据
      keyData = sheetData[dictStartRow.value - 1] // 转换为0索引
      valueData = sheetData[dictEndRow.value - 1] // 转换为0索引

      // 获取最大列数
      const maxCols = Math.max(keyData.length, valueData.length)

      for (let i = 0; i < maxCols; i++) {
        const key = keyData[i] || ''
        const value = valueData[i] || ''

        // 只添加非空的键值对
        if (key !== '' && value !== '') {
          pairs.push({
            key: String(key),
            value: String(value),
          })
        }
      }
    } else {
      // 列选择模式：获取指定列的数据
      keyData = sheetData.map((row) => row[dictStartColumn.value - 1]) // 转换为0索引
      valueData = sheetData.map((row) => row[dictEndColumn.value - 1]) // 转换为0索引

      // 获取最大行数
      const maxRows = Math.max(keyData.length, valueData.length)

      for (let i = 0; i < maxRows; i++) {
        const key = keyData[i] || ''
        const value = valueData[i] || ''

        // 只添加非空的键值对
        if (key !== '' && value !== '') {
          pairs.push({
            key: String(key),
            value: String(value),
          })
        }
      }
    }

    keyValuePairs.value = pairs

    if (pairs.length > 0) {
      ElMessage.success(`成功生成 ${pairs.length} 个键值对`)
    } else {
      ElMessage.warning('未找到有效的键值对')
    }

    console.log('生成的键值对:', pairs)
  } catch (error) {
    console.error('生成键值对失败:', error)
    ElMessage.error('生成键值对时出现错误')
  }
}

// 字段替换匹配
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
</script>
