<template>
  <div>
    <h2 style="text-align: center;margin: 5px;">json字段替换</h2>
    <steps :stepList="stepList" desc="这个工具用于，将json中的key替换为字典中的value，以便于知道每个数值表达的中文意思"/>
    <div class="toolbar">
      <el-button-group>
        <el-button
          type="primary"
          @click="replaceField"
          :disabled="!keyValuePairs.length || !uploadJsonData.length"
        >
          替换json预览
        </el-button>
        <el-button
          type="success"
          @click="downloadProcessedJson"
          :disabled="!previewData.length"
          v-if="previewData.length > 0"
        >
          下载json
        </el-button>
      </el-button-group>
      <el-button-group>
        <el-button
          type="primary"
          @click="replaceFieldExcel"
          :disabled="!keyValuePairs.length || !uploadJsonData.length"
        >
          替换Excel预览
        </el-button>

        <el-button
          type="success"
          @click="downloadProcessedJsonExcel"
          :disabled="!previewData.length"
          v-if="previewData.length > 0"
        >
          下载Excel
        </el-button>
      </el-button-group>
    </div>
    <div style="display: flex; gap: 10px">
      <UploadField
        title="字典清单"
        :show-dict-upload="true"
        @field-event="handleFieldEvent"
      />
      <UploadJson
        title="json内容"
        @parsed-data-updated="handleParsedDataUpdated"
      ></UploadJson>
    </div>
  </div>
  <preview
    title="效果预览"
    :parsedData="previewData"
    v-model="showOriginalFile"
  />
</template>

<script setup>
import steps from '@/view/tools/component/steps.vue'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import * as XLSX from 'xlsx'
import UploadField from '../component/uploadField.vue'
import UploadJson from '../component/uploadJson.vue'
import Preview from '../component/preview.vue'

const stepList = ref([
  {
    title: '上传字典清单',
    desc: '上传包含键值对映射关系的字典文件',
  },
  {
    title: '上传JSON文件',
    desc: '上传需要替换键名的JSON文件',
  },
  {
    title: '执行键名替换',
    desc: '将JSON中的键名替换为字典中对应的值',
  },
])
const keyValuePairs = ref([])
const previewData = ref([])
const showOriginalFile = ref(false)

// 保存来自 UploadJson 的数据
const uploadJsonData = ref([])
const handleParsedDataUpdated = (payload) => {
  uploadJsonData.value = payload?.parsedData || []
  console.log('[UploadJson] parsedData:', uploadJsonData.value)
  ElMessage.success(`UploadJson: 共 ${uploadJsonData.value.length} 个文件`)
}

// （移除未用的字典配置/文本模式/值映射工具）

// 将对象/数组中的“键名”用字典替换（只替换键名，不替换值）
const replaceKeysWithDict = (input) => {
  const dictMap = new Map(
    keyValuePairs.value.map((p) => [String(p.key), String(p.value)])
  )

  const transformObject = (obj) => {
    const result = {}
    for (const [k, v] of Object.entries(obj)) {
      const newKey = dictMap.get(String(k)) ?? k
      result[newKey] = transform(v)
    }
    return result
  }

  const transformArray = (arr) => arr.map((item) => transform(item))

  const transform = (val) => {
    if (Array.isArray(val)) return transformArray(val)
    if (val && typeof val === 'object') return transformObject(val)
    return val
  }

  return transform(input)
}

// 处理字典清单更新：仅清空已生成键值对，避免旧映射残留
const handleDictListUpdated = () => {
  keyValuePairs.value = []
}

// 接收由 UploadField 生成的键值对
const handleKeyValuePairsGenerated = (pairs) => {
  try {
    keyValuePairs.value = Array.isArray(pairs) ? pairs : []
    if (keyValuePairs.value.length > 0) {
      ElMessage.success(`已生成 ${keyValuePairs.value.length} 个键值对`)
    } else {
      ElMessage.warning('未生成有效的键值对')
    }
  } catch (error) {
    console.error('处理键值对事件失败:', error)
  }
}

// 接收由 UploadField 完成替换后的数据并展示预览/允许下载
const handleFieldReplacementCompleted = (payload) => {
  try {
    // 兼容多种 payload 结构：数组或 { parsedData } 包装
    previewData.value = Array.isArray(payload)
      ? payload
      : payload?.parsedData ?? []
    if (previewData.value.length > 0) {
      ElMessage.success('字段替换完成，可预览与下载')
    } else {
      ElMessage.warning('未获得可预览的数据')
    }
  } catch (error) {
    console.error('处理替换完成事件失败:', error)
  }
}

// （移除未用的验证逻辑）
// 替换 JSON 中的 key 值
const replaceField = () => {
  try {
    // 验证数据完整性
    if (!keyValuePairs.value || keyValuePairs.value.length === 0) {
      ElMessage.error('请先上传字典清单并生成键值对')
      return
    }

    if (!uploadJsonData.value || uploadJsonData.value.length === 0) {
      ElMessage.error('请先上传 JSON 文件')
      return
    }

    // 处理每个 JSON 文件
    const processedData = uploadJsonData.value.map((fileData) => {
      try {
        // 使用现有的 replaceKeysWithDict 方法替换 key 值
        const transformedContent = replaceKeysWithDict(fileData.content)

        return {
          ...fileData,
          content: transformedContent,
          originalContent: fileData.content, // 保存原始内容用于对比
        }
      } catch (error) {
        console.error(`处理文件 ${fileData.fileName} 时出错:`, error)
        ElMessage.error(`处理文件 ${fileData.fileName} 失败: ${error.message}`)
        return fileData
      }
    })

    // 更新预览数据
    previewData.value = processedData
    showOriginalFile.value = true

    ElMessage.success(
      `字段替换完成！共处理 ${processedData.length} 个文件，可预览与下载`
    )
  } catch (error) {
    console.error('替换字段时出错:', error)
    ElMessage.error(`替换字段失败: ${error.message}`)
  }
}

// （移除替换统计与键提取工具，避免冗余）

// 替换 JSON 中的 key 值并生成 Excel 预览（仅展示替换后的表格）
const replaceFieldExcel = () => {
  try {
    // 验证数据完整性
    if (!keyValuePairs.value || keyValuePairs.value.length === 0) {
      ElMessage.error('请先上传字典清单并生成键值对')
      return
    }

    if (!uploadJsonData.value || uploadJsonData.value.length === 0) {
      ElMessage.error('请先上传 JSON 文件')
      return
    }

    // 处理每个 JSON 文件
    const processedData = uploadJsonData.value.map((fileData) => {
      try {
        // 使用现有的 replaceKeysWithDict 方法替换 key 值
        const transformedContent = replaceKeysWithDict(fileData.content)

        return {
          ...fileData,
          content: transformedContent,
          originalContent: fileData.content, // 保存原始内容用于对比
        }
      } catch (error) {
        console.error(`处理文件 ${fileData.fileName} 时出错:`, error)
        ElMessage.error(`处理文件 ${fileData.fileName} 失败: ${error.message}`)
        return fileData
      }
    })

    // 将处理后的数据转换为 Preview 组件可识别的 sheets 结构（仅替换后数据）
    const sheetsPreview = processedData.map((fileData, idx) => {
      const sheet = buildProcessedSheet(fileData)
      return {
        fileName: fileData.fileName || `文件_${idx + 1}`,
        sheets: [sheet],
      }
    })

    // 更新预览数据为 Excel 表格模式
    previewData.value = sheetsPreview
    showOriginalFile.value = true

    ElMessage.success(
      `字段替换完成！共处理 ${processedData.length} 个文件，已转换为 Excel 预览`
    )
  } catch (error) {
    console.error('替换字段并生成Excel预览时出错:', error)
    ElMessage.error(`替换字段失败: ${error.message}`)
  }
}

// 构建仅含“替换后”数据的 sheet（缩进列：每层右移一列；无表头）
const buildProcessedSheet = (fileData) => {
  const rows = flattenJsonIndentedRows(fileData.content)
  // 计算最大列数
  const maxColumns = rows.reduce((m, r) => Math.max(m, r.length), 0)
  // 将所有行填充到相同列数，避免在预览/导出中错位
  const normalized = rows.map((r) => {
    const row = new Array(maxColumns).fill('')
    for (let i = 0; i < r.length; i++) {
      row[i] = r[i]
    }
    // 将值移动到最后一列（仅当该行同时包含键与值，即至少两个非空单元格）
    const nonEmptyIdx = []
    for (let i = 0; i < row.length; i++) {
      if (row[i] !== '' && row[i] !== undefined && row[i] !== null)
        nonEmptyIdx.push(i)
    }
    if (nonEmptyIdx.length >= 2) {
      const valueIdx = nonEmptyIdx[nonEmptyIdx.length - 1]
      const value = row[valueIdx]
      const lastCol = maxColumns - 1
      if (valueIdx !== lastCol) {
        row[valueIdx] = ''
        row[lastCol] = value
      }
    }
    return row
  })
  return {
    name: '替换后',
    data: normalized,
    maxColumns,
  }
}

// 将 JSON 扁平为“缩进列”形式：
// - 对象/数组：仅输出一个行，key 放在其层级列，值留空，子项换行并右移一列
// - 基本类型：key 放在层级列，值放在下一个列
// - 数组子项的 key 使用索引（不加 data.、不拼接路径）
const flattenJsonIndentedRows = (input) => {
  const rows = []

  const pushKeyOnly = (level, key) => {
    const row = new Array(level + 1).fill('')
    row[level] = key
    rows.push(row)
  }

  const pushKeyValue = (level, key, value) => {
    const row = new Array(level + 2).fill('')
    row[level] = key
    row[level + 1] = value
    rows.push(row)
  }

  const stringify = (v) => {
    if (v === null) return 'null'
    if (v === undefined) return 'undefined'
    if (typeof v === 'string') return v
    if (typeof v === 'number' || typeof v === 'boolean') return String(v)
    return JSON.stringify(v)
  }

  // 仅遍历对象的子项（不输出对象容器行）
  const walkObjectChildren = (obj, level) => {
    const keys = Object.keys(obj)
    if (keys.length === 0) return
    keys.forEach((k) => {
      const child = obj[k]
      if (child && typeof child === 'object') {
        // 子对象/数组：先输出容器（键），再深入一层
        if (Array.isArray(child)) {
          // 数组：输出“键”容器行，然后按数组规则下钻
          pushKeyOnly(level, k)
          handleArray(child, level + 1)
        } else {
          // 对象：输出“键”容器行，然后输出其子项（不再额外输出对象容器）
          pushKeyOnly(level, k)
          walkObjectChildren(child, level + 1)
        }
      } else {
        // 基础类型：键放本列，值放下一列
        pushKeyValue(level, k, stringify(child))
      }
    })
  }

  const handleArray = (arr, level) => {
    if (arr.length === 0) {
      // 空数组：不展示索引
      return
    }
    if (arr.length === 1 && arr[0] && typeof arr[0] === 'object') {
      // 单个元素且为对象：顶部插入一行空白（仅缩进，不放键值），再展开对象子项
      rows.push(new Array(level).fill(''))
      const item = arr[0]
      if (Array.isArray(item)) {
        // 若内部仍为数组，继续按数组规则
        handleArray(item, level)
      } else {
        // 对象：直接输出其子项（不展示索引）
        walkObjectChildren(item, level)
      }
      // 单元素组结束后追加空白行分隔
      rows.push(new Array(level).fill(''))
      return
    }
    // 多元素数组：不展示索引，对每个元素：
    arr.forEach((item, idx) => {
      if (item && typeof item === 'object') {
        if (Array.isArray(item)) {
          handleArray(item, level) // 嵌套数组，继续处理
        } else {
          // 对象：直接输出其子项
          walkObjectChildren(item, level)
        }
      } else {
        // 基础类型：键留空，仅在下一列放值
        pushKeyValue(level, '', stringify(item))
      }
      // 每个元素组结束后追加空白行分隔
      rows.push(new Array(level).fill(''))
    })
  }

  const walk = (val, level, keyLabel) => {
    if (Array.isArray(val)) {
      // 若有键名，先输出数组“键”容器行
      if (keyLabel !== undefined && keyLabel !== null && keyLabel !== '') {
        pushKeyOnly(level, keyLabel)
        handleArray(val, level + 1)
      } else {
        // 根为数组：直接展开（不输出索引和容器）
        handleArray(val, level)
      }
      return
    }

    if (val && typeof val === 'object') {
      // 对象：如果有键名，先输出“键”容器行，再输出子项
      if (keyLabel !== undefined && keyLabel !== null && keyLabel !== '') {
        pushKeyOnly(level, keyLabel)
        walkObjectChildren(val, level + 1)
      } else {
        // 根对象：直接输出子项
        walkObjectChildren(val, level)
      }
      return
    }

    // 基本类型（根为基础类型时）
    pushKeyValue(level, keyLabel ?? '(root)', stringify(val))
  }

  // 根处理：不输出“(root)”容器行，直接展开
  if (Array.isArray(input)) {
    input.forEach((item, idx) => {
      if (item && typeof item === 'object') {
        walk(item, 0, `[${idx}]`)
      } else {
        pushKeyValue(0, `[${idx}]`, stringify(item))
      }
    })
  } else if (input && typeof input === 'object') {
    Object.keys(input).forEach((k) => {
      const child = input[k]
      if (child && typeof child === 'object') {
        walk(child, 0, k)
      } else {
        pushKeyValue(0, k, stringify(child))
      }
    })
  } else {
    // 根即基础类型
    pushKeyValue(0, '(root)', stringify(input))
  }

  return rows
}

// （移除旧的表格化方法）

// 下载处理后的 JSON 文件
const downloadProcessedJson = () => {
  if (!previewData.value || previewData.value.length === 0) {
    ElMessage.warning('没有可下载的数据')
    return
  }

  previewData.value.forEach((fileData, index) => {
    try {
      const jsonString = JSON.stringify(fileData.content, null, 2)
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = `processed_${
        fileData.fileName || `file_${index + 1}.json`
      }`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error(`下载文件 ${fileData.fileName} 失败:`, error)
      ElMessage.error(`下载文件 ${fileData.fileName} 失败`)
    }
  })

  ElMessage.success('所有文件下载完成')
}

// 下载处理后的 JSON 数据为 Excel 文件（基于预览的 sheets 结构）
const downloadProcessedJsonExcel = () => {
  if (!previewData.value || previewData.value.length === 0) {
    ElMessage.warning('没有可下载的数据')
    return
  }

  try {
    // 创建工作簿
    const workbook = XLSX.utils.book_new()
    // 记录已使用的工作表名称，避免重名
    const usedSheetNames = new Set()
    const getUniqueSheetName = (baseName) => {
      const BASE_LIMIT = 31
      const sanitizedBase = String(baseName || 'Sheet').substring(0, BASE_LIMIT)
      if (!usedSheetNames.has(sanitizedBase) && !workbook.SheetNames.includes(sanitizedBase)) {
        usedSheetNames.add(sanitizedBase)
        return sanitizedBase
      }
      let counter = 2
      while (true) {
        const suffix = `_${counter}`
        const allowedBaseLen = BASE_LIMIT - suffix.length
        const candidate = `${sanitizedBase.substring(0, Math.max(0, allowedBaseLen))}${suffix}`
        if (!usedSheetNames.has(candidate) && !workbook.SheetNames.includes(candidate)) {
          usedSheetNames.add(candidate)
          return candidate
        }
        counter += 1
      }
    }

    previewData.value.forEach((fileData, index) => {
      try {
        const fileName = fileData.fileName || `文件_${index + 1}`
        const sheets = Array.isArray(fileData.sheets) ? fileData.sheets : []

        if (sheets.length === 0) {
          // 兜底：如果没有 sheets，则基于 content 构建一个
          const fallbackSheet = buildProcessedSheet({
            content: fileData.content,
          })
          const ws = XLSX.utils.aoa_to_sheet(fallbackSheet.data)
          ws['!cols'] = [
            { wch: 40 }, // 键名
            { wch: 60 }, // 值
          ]
          const uniqueName = getUniqueSheetName((fallbackSheet.name || '替换后'))
          XLSX.utils.book_append_sheet(workbook, ws, uniqueName)
        } else {
          sheets.forEach((sheet, si) => {
            const ws = XLSX.utils.aoa_to_sheet(sheet.data || [])
            // 优化列宽：根据 sheet.maxColumns 生成列宽，前两列更宽
            const maxCols = sheet.maxColumns || sheet.data?.[0]?.length || 2
            ws['!cols'] = new Array(maxCols).fill(null).map((_, ci) => {
              if (ci === 0) return { wch: 30 }
              if (ci === 1) return { wch: 60 }
              return { wch: 20 }
            })
            const desiredName = `${sheet.name || 'Sheet'}_${si + 1}`
            const uniqueName = getUniqueSheetName(desiredName)
            XLSX.utils.book_append_sheet(workbook, ws, uniqueName)
          })
        }
      } catch (error) {
        console.error(`处理文件 ${fileData.fileName} 时出错:`, error)
        // 创建错误信息工作表
        const errorWorksheet = XLSX.utils.aoa_to_sheet([
          ['错误信息', error.message],
          ['文件名', fileData.fileName || `文件_${index + 1}`],
        ])
        XLSX.utils.book_append_sheet(
          workbook,
          errorWorksheet,
          `错误_${index + 1}`
        )
      }
    })

    // 生成文件名
    const fileName = `json_字段替换结果_${new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/:/g, '-')}.xlsx`

    // 下载文件
    XLSX.writeFile(workbook, fileName)

    ElMessage.success(`Excel文件下载完成: ${fileName}`)
  } catch (error) {
    console.error('下载Excel文件时出错:', error)
    ElMessage.error(`下载Excel文件失败: ${error.message}`)
  }
}

// 统一处理 UploadField 的事件
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

.dict-config {
  min-width: 200px;
}

.config-inputs {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.input-group label {
  min-width: 60px;
  font-size: 12px;
}
</style>
