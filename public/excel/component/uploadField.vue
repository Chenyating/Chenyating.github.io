<template>
  <div class="excel-upload-container">
    <div>
      <h2>{{ title }}</h2>
    </div>

    <el-tabs v-model="activeMode" class="dict-upload-section">
      <el-tab-pane label="从Excel生成" name="excel" />
      <el-tab-pane label="字符串输入" name="text" />
    </el-tabs>

    <!-- 字典清单上传区域（Excel模式） -->
    <div class="dict-upload-section" v-if="activeMode === 'excel'">
      <el-upload
        v-loading="dictLoading"
        element-loading-text="解析中..."
        drag
        :auto-upload="false"
        :show-file-list="true"
        :on-change="handleDictFileChange"
        :file-list="dictFileList"
        :disabled="dictLoading"
        :accept="accept"
        :on-remove="clearDictFiles"
        :limit="1"
      >
        <el-icon><upload-filled /></el-icon>
        <div>将字典文件拖到此处，或<em>点击上传</em></div>
        <div>支持 .xlsx 和 .xls 格式文件</div>
      </el-upload>
      <!-- 键值对生成区域 -->
      <div
        v-if="dictParsedData && dictParsedData.length > 0"
        class="key-value-section"
      >
        <h4>键值对生成</h4>
        <div class="dict-config">
          <div
            class="config-inputs"
            v-if="dictParsedData && dictParsedData.length > 0"
          >
            <div class="input-group" v-if="dictParsedData[0]?.sheets?.length">
              <label>选择工作表：</label>
              <el-select
                v-model="dictSelectedSheetIndex"
                placeholder="选择sheet"
                style="width: 220px"
              >
                <el-option
                  v-for="(s, idx) in dictParsedData[0].sheets"
                  :key="s.name + idx"
                  :label="s.name"
                  :value="idx"
                />
              </el-select>
            </div>
          </div>
        </div>
        <div class="dict-config">
          <el-radio-group v-model="dictSelectionMode">
            <el-radio label="row">行选择</el-radio>
            <el-radio label="column">列选择</el-radio>
          </el-radio-group>

          <div v-if="dictSelectionMode === 'row'" class="config-inputs">
            <div class="input-group">
              <label>key行：</label>
              <el-input
                v-model.number="dictStartRow"
                type="number"
                placeholder="key行"
                min="1"
                style="width: 120px"
                @blur="validateDictRowInput"
              />
            </div>
            <div class="input-group">
              <label>value行：</label>
              <el-input
                v-model.number="dictEndRow"
                type="number"
                placeholder="value行"
                min="1"
                style="width: 120px"
                @blur="validateDictRowInput"
              />
            </div>
          </div>

          <div v-if="dictSelectionMode === 'column'" class="config-inputs">
            <div class="input-group">
              <label>key列：</label>
              <el-input
                v-model.number="dictStartColumn"
                type="number"
                placeholder="key列"
                min="1"
                style="width: 120px"
                @blur="validateDictColumnInput"
              />
            </div>
            <div class="input-group">
              <label>value列：</label>
              <el-input
                v-model.number="dictEndColumn"
                type="number"
                placeholder="value列"
                min="1"
                style="width: 120px"
                @blur="validateDictColumnInput"
              />
            </div>
          </div>
          <el-button-group>
            <el-button type="info" @click="openDictPreview"
              >预览sheet内容</el-button
            >
            <el-button type="primary" @click="generateKeyValuePairs">
              生成键值对
            </el-button>
          </el-button-group>
        </div>

        <!-- 键值对表格 -->
        <div
          v-if="keyValuePairs && keyValuePairs.length > 0"
          class="key-value-table"
        >
          <h5>生成的键值对 ({{ keyValuePairs.length }} 个):当前展示前10个</h5>
          <div class="kv-table-wrapper">
            <el-table
              :data="keyValuePairs.slice(0, 10)"
              border
              table-layout="auto"
              style="min-width: 680px; width: 100%"
              height="260"
              size="small"
            >
              <el-table-column prop="key" label="Key" width="300" />
              <el-table-column prop="value" label="Value" min-width="360" />
            </el-table>
          </div>
        </div>
      </div>

      <!-- 字段替换区域 -->
      <div
        v-if="
          keyValuePairs &&
          keyValuePairs.length > 0 &&
          parsedData &&
          parsedData.length > 0
        "
        class="field-replacement-section"
      >
        <h4>字段替换</h4>
        <div class="replacement-config">
          <el-radio-group v-model="dataSelectionMode">
            <el-radio label="row">替换行</el-radio>
            <el-radio label="column">替换列</el-radio>
          </el-radio-group>

          <div v-if="dataSelectionMode === 'row'" class="config-inputs">
            <div class="input-group">
              <label>替换行号：</label>
              <el-input
                v-model.number="dataStartRow"
                type="number"
                placeholder="要替换的行号"
                min="1"
                style="width: 150px"
                @blur="validateDataRowInput"
              />
            </div>
          </div>

          <div v-if="dataSelectionMode === 'column'" class="config-inputs">
            <div class="input-group">
              <label>替换列号：</label>
              <el-input
                v-model.number="dataStartColumn"
                type="number"
                placeholder="要替换的列号"
                min="1"
                style="width: 150px"
                @blur="validateDataColumnInput"
              />
            </div>
          </div>

          <el-button type="primary" @click="replaceFields">
            替换预览
          </el-button>
        </div>

        <!-- 替换结果 -->
        <div
          v-if="replacementPreview && replacementPreview.length > 0"
          class="replacement-result"
        >
          <h5>替换结果预览</h5>
          <el-button type="success" @click="downloadReplacedFile">
            下载替换后的文件
          </el-button>
        </div>
      </div>
    </div>

    <!-- 字符串输入模式 -->
    <div class="dict-upload-section" v-else>
      <div class="key-value-section">
        <h4>通过字符串输入键值对</h4>
        <div class="dict-config">
          <el-radio-group v-model="textFormat">
            <el-radio label="kv">每行 key=value 或 key, value</el-radio>
            <el-radio label="json">JSON 对象 {key:value}</el-radio>
          </el-radio-group>
          <el-input
            v-model="textInput"
            type="textarea"
            :rows="8"
            :placeholder="textPlaceholder"
          />
          <div class="action-buttons">
            <el-button type="primary" @click="parseTextToPairs"
              >解析为键值对</el-button
            >
          </div>
        </div>

        <div
          v-if="keyValuePairs && keyValuePairs.length > 0"
          class="key-value-table"
        >
          <h5>键值对 ({{ keyValuePairs.length }} 个):当前只展示前10个</h5>
          <div class="kv-table-wrapper">
            <el-table
              :data="keyValuePairs.slice(0, 10)"
              border
              table-layout="auto"
              style="min-width: 680px; width: 100%"
              height="260"
              size="small"
            >
              <el-table-column prop="key" label="Key" width="300" />
              <el-table-column prop="value" label="Value" min-width="360" />
            </el-table>
          </div>
        </div>
      </div>
    </div>
    <Preview
      title="解析结果"
      v-model="showOriginalFile"
      :parsedData="previewParsedData"
    />
  </div>
</template>

<script setup>
import { ref, toRefs, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import * as XLSX from 'xlsx'
import Preview from './preview.vue'

const props = defineProps({
  title: {
    type: String,
    default: '上传字典信息',
  },
  accept: {
    type: String,
    default: '.xlsx,.xls,.csv',
  },
  maxSizeMB: {
    type: Number,
    default: 10,
  },
  single: {
    type: Boolean,
    default: true,
  },
  showDictUpload: {
    type: Boolean,
    default: false,
  },
})

// 统一的状态管理
const state = reactive({
  // 字典相关
  dictLoading: false,
  dictFileList: [],
  dictParsedData: [],
  keyValuePairs: [],
  replacementPreview: [],
  // 配置
  dictSelectionMode: 'column',
  dataSelectionMode: 'row',
  dictStartRow: 1,
  dictEndRow: 2,
  dictStartColumn: 1,
  dictEndColumn: 2,
  dataStartRow: 1,
  dataStartColumn: 1,
  // 保留必要的状态
  parsedData: [],
  showOriginalFile: false,
  activeMode: 'excel',
  textInput: '',
  textFormat: 'kv',
  syncing: false,
  // 新增：sheet选择与预览控制
  dictSelectedSheetIndex: 0,
  previewSource: 'data', // 'data' | 'dict'
})

// 解构状态以便使用
const {
  dictLoading,
  dictFileList,
  dictParsedData,
  keyValuePairs,
  replacementPreview,
  dictSelectionMode,
  dataSelectionMode,
  dictStartRow,
  dictEndRow,
  dictStartColumn,
  dictEndColumn,
  dataStartRow,
  dataStartColumn,
  parsedData,
  showOriginalFile,
  activeMode,
  textInput,
  textFormat,
  syncing,
  dictSelectedSheetIndex,
  previewSource,
} = toRefs(state)

const textPlaceholder = computed(() => {
  return textFormat.value === 'json'
    ? '{\n  "name": "姓名",\n  "sex": "性别"\n}'
    : 'kv 模式:\nname=姓名\nsex, 性别'
})

// 切换 JSON/kv 模式时，自动用当前键值对生成对应格式文本
watch(textFormat, () => {
  syncPairsToText()
})

// 切换到“字符串输入”Tab 时，自动以当前键值对刷新文本
watch(activeMode, (mode) => {
  if (mode === 'text') {
    syncPairsToText()
  }
})

// 定义 emit 事件
const emit = defineEmits([
  'field-event', // 统一事件
])

// 统一设置 pairs -> 可编辑行与文本
const syncPairsToText = () => {
  if (syncing.value) return
  syncing.value = true
  try {
    if (textFormat.value === 'json') {
      const obj = {}
      keyValuePairs.value.forEach((p) => {
        obj[String(p.key)] = String(p.value)
      })
      textInput.value = JSON.stringify(obj, null, 2)
    } else {
      textInput.value = keyValuePairs.value
        .map((p) => `${p.key}=${p.value}`)
        .join('\n')
    }
  } finally {
    syncing.value = false
  }
}

const setPairs = (pairs) => {
  keyValuePairs.value = pairs
  syncPairsToText()
  emit('field-event', { type: 'pairsGenerated', payload: keyValuePairs.value })
}

const parseTextToPairs = () => {
  try {
    let pairs = []
    if (!textInput.value || !textInput.value.trim()) {
      setPairs([])
      ElMessage.success('已清空键值对')
      return
    }
    if (textFormat.value === 'json') {
      const obj = JSON.parse(textInput.value)
      if (!obj || typeof obj !== 'object') throw new Error('JSON 必须是对象')
      pairs = Object.entries(obj).map(([k, v]) => ({
        key: String(k),
        value: String(v),
      }))
    } else {
      const lines = textInput.value.split(/\r?\n/)
      for (const raw of lines) {
        const line = raw.trim()
        if (!line) continue
        const eqIdx = line.indexOf('=')
        let key = ''
        let value = ''
        if (eqIdx > -1) {
          key = line.slice(0, eqIdx).trim()
          value = line.slice(eqIdx + 1).trim()
        } else {
          const parts = line.split(',')
          if (parts.length >= 2) {
            key = parts[0].trim()
            value = parts.slice(1).join(',').trim()
          } else {
            throw new Error(`无法解析行: ${line}`)
          }
        }
        if (key && value) pairs.push({ key, value })
      }
    }
    setPairs(pairs)
    ElMessage.success(`解析成功，得到 ${pairs.length} 对`)
  } catch (err) {
    console.error('解析文本失败:', err)
    ElMessage.error(`解析失败：${err.message || err}`)
  }
}

// 通用文件验证方法
const validateFile = (uploadFile) => {
  if (!uploadFile) return false

  // 类型校验
  const ext = uploadFile.name.toLowerCase().split('.').pop()
  const allowed = props.accept.split(',').map((s) => s.replace('.', '').trim())
  if (!allowed.includes(ext)) {
    ElMessage.error(`仅支持以下格式: ${props.accept}`)
    return false
  }

  // 大小校验（MB）
  const sizeBytes = uploadFile.size || uploadFile.raw?.size || 0
  const maxBytes = props.maxSizeMB * 1024 * 1024
  if (sizeBytes > maxBytes) {
    ElMessage.error(`文件过大，需小于 ${props.maxSizeMB}MB`)
    return false
  }

  return true
}

// 通用文件处理逻辑
const processFileUpload = (uploadFile, targetList, isDict = false) => {
  if (!validateFile(uploadFile)) return

  // 单文件模式：替换现有文件
  targetList.value = [uploadFile]
  if (isDict) {
    dictParsedData.value = []
    keyValuePairs.value = []
    replacementPreview.value = []
    // 自动解析字典文件
    parseDictFiles()
  } else {
    parsedData.value = []
  }
  ElMessage.success(`已替换文件为 ${uploadFile.name}`)
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 通用文件解析状态判断
const isFileParsed = (fileName, fileUid, parsedDataList) => {
  try {
    if (
      !parsedDataList ||
      !parsedDataList.value ||
      !Array.isArray(parsedDataList.value)
    ) {
      return false
    }
    return parsedDataList.value.some(
      (d) => (fileUid && d.fileUid === fileUid) || d.fileName === fileName
    )
  } catch (error) {
    console.warn('isFileParsed error:', error)
    return false
  }
}

// 解析excel文件
const readExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        // 添加日期解析选项
        const workbook = XLSX.read(data, {
          type: 'array',
          cellDates: true, // 自动解析日期
          cellNF: false, // 不解析数字格式
          cellText: false, // 不强制转换为文本
        })

        const sheets = workbook.SheetNames.map((sheetName) => {
          const worksheet = workbook.Sheets[sheetName]

          // 获取单元格格式信息，用于识别日期列
          const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1')
          const dateColumns = new Set()

          // 检查每列的第一个非空单元格，判断是否为日期格式
          for (let col = range.s.c; col <= range.e.c; col++) {
            const colLetter = XLSX.utils.encode_col(col)
            for (let row = range.s.r; row <= range.e.r; row++) {
              const cellAddress = colLetter + (row + 1)
              const cell = worksheet[cellAddress]
              if (cell && cell.t === 'd') {
                // 日期类型
                dateColumns.add(col)
                break
              }
            }
          }

          // 处理合并单元格
          const processMergedCells = (data) => {
            if (!data || data.length === 0) return data

            const processedData = []

            // 逐列处理合并单元格
            for (let col = 0; col < data[0].length; col++) {
              let lastValue = null

              for (let row = 0; row < data.length; row++) {
                if (!processedData[row]) {
                  processedData[row] = [...data[row]]
                }

                const cellValue = data[row][col]

                // 如果当前单元格为空，使用上一个非空值
                if (
                  cellValue === null ||
                  cellValue === undefined ||
                  cellValue === ''
                ) {
                  if (lastValue !== null) {
                    processedData[row][col] = lastValue
                  }
                } else {
                  lastValue = cellValue
                }
              }
            }

            return processedData
          }

          // 使用自定义的日期处理选项解析数据
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            raw: false, // 保持原始值，不强制转换
            dateNF: 'yyyy-mm-dd', // 日期格式
          })

          // 过滤空行
          const filteredData = jsonData.filter((row) =>
            row.some(
              (cell) => cell !== null && cell !== undefined && cell !== ''
            )
          )

          if (filteredData.length === 0) return null

          // 计算该工作表的最大列数，并将每行按最大列数填充，避免因尾部空单元格被截断导致列数偏少
          const maxColumns = filteredData.reduce(
            (max, row) => Math.max(max, row.length),
            0
          )

          const normalizedData = filteredData.map((row) => {
            const normalizedRow = new Array(maxColumns)
            for (let i = 0; i < maxColumns; i += 1) {
              let cellValue = row[i]

              // 处理日期单元格
              if (dateColumns.has(i) && cellValue) {
                // 如果是日期对象，转换为标准格式字符串
                if (cellValue instanceof Date) {
                  cellValue = formatDate(cellValue)
                } else if (typeof cellValue === 'number') {
                  // Excel日期是1900年1月1日以来的天数
                  const excelDate = cellValue
                  const date = convertExcelDateToJSDate(excelDate)
                  cellValue = formatDate(date)
                } else if (typeof cellValue === 'string') {
                  // 尝试解析日期字符串
                  const parsedDate = parseDateString(cellValue)
                  if (parsedDate) {
                    cellValue = formatDate(parsedDate)
                  }
                }
              }

              normalizedRow[i] =
                cellValue === undefined || cellValue === null ? '' : cellValue
            }
            return normalizedRow
          })

          // 处理合并单元格
          const finalData = processMergedCells(normalizedData)

          return {
            name: sheetName,
            data: finalData,
            maxColumns,
            dateColumns: Array.from(dateColumns),
          }
        }).filter(Boolean)

        if (sheets.length === 0) {
          reject(new Error('Excel文件中没有有效数据'))
          return
        }

        resolve(sheets)
      } catch (error) {
        reject(new Error(`读取Excel文件失败: ${error.message}`))
      }
    }

    reader.onerror = () => reject(new Error('文件读取失败'))
    try {
      // 支持传入 ElementPlus 的 uploadFile 或原生 File
      const rawFile = file?.raw instanceof Blob ? file.raw : file
      if (!(rawFile instanceof Blob)) {
        reject(new Error('无效的文件对象'))
        return
      }
      reader.readAsArrayBuffer(rawFile)
    } catch (err) {
      reject(new Error('无法读取文件'))
    }
  })
}

// 格式化日期为统一格式
const formatDate = (date) => {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return ''
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

// 将Excel日期数字转换为JavaScript Date对象
const convertExcelDateToJSDate = (excelDate) => {
  // Excel日期从1900年1月1日开始计算
  // 注意：Excel错误地将1900年当作闰年，所以1900年3月1日之前的日期需要调整
  const excelEpoch = new Date(1900, 0, 1)
  const millisecondsPerDay = 24 * 60 * 60 * 1000

  // 调整1900年闰年错误
  let adjustedDays = excelDate
  if (excelDate > 59) {
    adjustedDays = excelDate - 1
  }

  const date = new Date(
    excelEpoch.getTime() + adjustedDays * millisecondsPerDay
  )
  return date
}

// 解析各种日期字符串格式
const parseDateString = (dateString) => {
  if (!dateString || typeof dateString !== 'string') {
    return null
  }

  // 尝试多种日期格式
  const dateFormats = [
    /^\d{4}-\d{1,2}-\d{1,2}$/, // YYYY-MM-DD
    /^\d{1,2}\/\d{1,2}\/\d{4}$/, // MM/DD/YYYY
    /^\d{1,2}-\d{1,2}-\d{4}$/, // MM-DD-YYYY
    /^\d{4}\/\d{1,2}\/\d{1,2}$/, // YYYY/MM/DD
    /^\d{1,2}\.\d{1,2}\.\d{4}$/, // MM.DD.YYYY
    /^\d{4}\.\d{1,2}\.\d{1,2}$/, // YYYY.MM.DD
  ]

  for (const format of dateFormats) {
    if (format.test(dateString)) {
      try {
        const date = new Date(dateString)
        if (!isNaN(date.getTime())) {
          return date
        }
      } catch (e) {
        // 继续尝试下一个格式
      }
    }
  }

  return null
}

// ========== 字典清单相关方法 ==========

// 处理字典文件变化
const handleDictFileChange = (uploadFile) => {
  processFileUpload(uploadFile, dictFileList, true)
}

// 清空字典文件
const clearDictFiles = () => {
  dictFileList.value = []
  dictParsedData.value = []
  keyValuePairs.value = []
  replacementPreview.value = []
  ElMessage.success('已清空字典文件')
}

// 解析字典文件
const parseDictFiles = async () => {
  if (dictFileList.value.length === 0) {
    ElMessage.warning('请先选择字典文件')
    return
  }

  dictLoading.value = true
  dictParsedData.value = []

  try {
    const file = dictFileList.value[0]
    const sheets = await readExcelFile(file.raw || file)

    const result = {
      fileName: file.name,
      fileUid: file.uid,
      sheets: sheets,
    }

    dictParsedData.value = [result]
    // 默认选择第一个工作表
    dictSelectedSheetIndex.value = 0
    ElMessage.success(`字典文件 ${file.name} 解析完成`)
    emit('field-event', {
      type: 'dictParsed',
      payload: {
        parsedData: [result],
        totalFiles: 1,
      },
    })
  } catch (error) {
    console.error('字典文件解析失败:', error)
    ElMessage.error(`字典文件解析失败: ${error.message}`)
  } finally {
    dictLoading.value = false
  }
}

// 生成键值对
const generateKeyValuePairs = () => {
  if (dictParsedData.value.length === 0) {
    ElMessage.warning('请先上传并解析字典清单文件')
    return
  }

  try {
    // 获取第一个字典文件的数据
    const dictFile = dictParsedData.value[0]
    if (!dictFile || !dictFile.sheets || dictFile.sheets.length === 0) {
      ElMessage.error('字典文件没有有效数据')
      return
    }

    // 使用所选工作表的数据
    const sheetIndex = Math.min(
      Math.max(0, Number(dictSelectedSheetIndex.value || 0)),
      dictFile.sheets.length - 1
    )
    const sheetData = dictFile.sheets[sheetIndex].data
    if (!sheetData || sheetData.length === 0) {
      ElMessage.error('字典文件工作表没有数据')
      return
    }

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
        ElMessage.error(`行数超出文件范围，文件共有${sheetData.length}行`)
        return
      }

      // 检查指定行是否有数据
      const keyRow = sheetData[dictStartRow.value - 1]
      const valueRow = sheetData[dictEndRow.value - 1]

      if (!keyRow || !valueRow) {
        ElMessage.error('指定的行没有数据')
        return
      }
    } else {
      // column selection
      if (dictStartColumn.value < 1 || dictEndColumn.value < 1) {
        ElMessage.error('列数必须大于0')
        return
      }

      const maxCols = sheetData[0] ? sheetData[0].length : 0
      if (dictStartColumn.value > maxCols || dictEndColumn.value > maxCols) {
        ElMessage.error(`列数超出文件范围，文件共有${maxCols}列`)
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
      syncPairsToText()
      emit('field-event', {
        type: 'pairsGenerated',
        payload: keyValuePairs.value,
      })
    } else {
      ElMessage.warning('未找到有效的键值对，请检查字典文件内容和配置')
    }

    // 生成的键值对: pairs
  } catch (error) {
    console.error('生成键值对失败:', error)
    ElMessage.error('生成键值对时出现错误')
  }
}

// 字段替换匹配
const replaceFields = () => {
  if (parsedData.value.length === 0) {
    ElMessage.warning('请先上传数据清单文件')
    return
  }

  if (keyValuePairs.value.length === 0) {
    ElMessage.warning('请先生成键值对')
    return
  }

  try {
    const dataFile = parsedData.value[0]
    if (!dataFile?.sheets?.[0]?.data) {
      ElMessage.error('数据文件没有有效数据')
      return
    }

    const sheetData = dataFile.sheets[0].data
    const maxRows = sheetData.length
    const maxCols = sheetData[0] ? sheetData[0].length : 0

    // 验证替换位置是否在有效范围内
    if (dataSelectionMode.value === 'row') {
      if (dataStartRow.value < 1 || dataStartRow.value > maxRows) {
        ElMessage.error(`替换行号必须在1到${maxRows}之间`)
        return
      }
    } else {
      if (dataStartColumn.value < 1 || dataStartColumn.value > maxCols) {
        ElMessage.error(`替换列号必须在1到${maxCols}之间`)
        return
      }
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
              // 替换日志: cellStr -> match.value at (rowIndex+1, colIndex+1)
              return match.value
            }
          }

          return cell
        })
      })

      return { ...sheet, data: processedData }
    })

    // 更新预览数据
    replacementPreview.value = [{ ...dataFile, sheets: processedSheets }]

    // 统计替换数量
    const replacedCount = countReplacedCells(
      originalData,
      replacementPreview.value[0]
    )

    if (replacedCount > 0) {
      ElMessage.success(
        `字段替换完成，共替换了 ${replacedCount} 个单元格，请查看预览结果`
      )
    } else {
      ElMessage.warning('没有找到匹配的字段进行替换，请检查键值对配置')
    }

    emit('field-event', {
      type: 'replacementCompleted',
      payload: {
        originalData,
        replacedData: replacementPreview.value[0],
        replacedCount,
      },
    })
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

// 通用输入验证方法
const validateInput = (value, min, max, fieldName, dataSource) => {
  if (!dataSource || dataSource.value.length === 0) return

  const data = dataSource.value[0]?.sheets?.[0]?.data
  if (!data) return

  const maxValue = fieldName.includes('行')
    ? data.length
    : data[0]
    ? data[0].length
    : 0

  if (value < min || value > maxValue) {
    ElMessage.warning(`${fieldName}应在${min}到${maxValue}之间`)
    return Math.max(min, Math.min(value, maxValue))
  }
  return value
}

// 输入验证方法
const validateDictRowInput = () => {
  dictStartRow.value =
    validateInput(dictStartRow.value, 1, Infinity, 'key行号', dictParsedData) ||
    dictStartRow.value
  dictEndRow.value =
    validateInput(dictEndRow.value, 1, Infinity, 'value行号', dictParsedData) ||
    dictEndRow.value
}

const validateDictColumnInput = () => {
  dictStartColumn.value =
    validateInput(
      dictStartColumn.value,
      1,
      Infinity,
      'key列号',
      dictParsedData
    ) || dictStartColumn.value
  dictEndColumn.value =
    validateInput(
      dictEndColumn.value,
      1,
      Infinity,
      'value列号',
      dictParsedData
    ) || dictEndColumn.value
}

const validateDataRowInput = () => {
  dataStartRow.value =
    validateInput(dataStartRow.value, 1, Infinity, '替换行号', parsedData) ||
    dataStartRow.value
}

const validateDataColumnInput = () => {
  dataStartColumn.value =
    validateInput(dataStartColumn.value, 1, Infinity, '替换列号', parsedData) ||
    dataStartColumn.value
}

// 下载替换后的文件
const downloadReplacedFile = () => {
  if (parsedData.value.length === 0) {
    ElMessage.warning('请先上传数据清单文件')
    return
  }

  if (keyValuePairs.value.length === 0) {
    ElMessage.warning('请先生成键值对')
    return
  }

  try {
    const dataFile = parsedData.value[0]
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

// ========== 预览相关 ==========
const previewParsedData = computed(() => {
  return previewSource.value === 'dict'
    ? dictParsedData.value
    : parsedData.value
})

const openDictPreview = () => {
  if (!dictParsedData.value || dictParsedData.value.length === 0) {
    ElMessage.warning('暂无可预览的字典内容')
    return
  }
  previewSource.value = 'dict'
  showOriginalFile.value = true
}
</script>

<style scoped>
.excel-upload-container {
  padding: 20px;
  width: 100%;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  margin: 5px 0;
  background-color: white;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

.file-name {
  flex: 1;
  font-weight: 500;
}

.file-size {
  color: #909399;
  margin: 0 15px;
}

.file-status {
  margin-right: 10px;
}

.action-buttons {
  margin-top: 15px;
  display: flex;
  gap: 10px;
}

/* 字典清单相关样式 */
.dict-upload-section h3 {
  color: #409eff;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #409eff;
}

/* 通用section样式 */
.key-value-section,
.field-replacement-section {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  background-color: white;
}

.key-value-section h4,
.field-replacement-section h4 {
  color: #606266;
  margin-bottom: 15px;
}

/* 通用配置样式 */
.dict-config,
.replacement-config {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}

.config-inputs {
  display: flex;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.input-group label {
  font-weight: 500;
  color: #606266;
  white-space: nowrap;
}

/* 表格和结果样式 */
.key-value-table {
  margin-top: 15px;
}

.key-value-table h5 {
  color: #409eff;
  margin-bottom: 10px;
}

.replacement-result {
  margin-top: 15px;
  padding: 15px;
  border: 1px solid #67c23a;
  border-radius: 6px;
  background-color: #f0f9ff;
}

.replacement-result h5 {
  color: #67c23a;
  margin-bottom: 10px;
}

/* 让键值表在小屏也能横向滚动完整展示 */
.kv-table-wrapper {
  overflow-x: auto;
}
</style>
