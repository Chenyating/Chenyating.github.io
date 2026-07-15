<template>
  <div class="json-excel-converter">
    <h2 class="page-title">JSON 转 Excel 在线预览</h2>
    <p class="page-subtitle">
      粘贴 JSON 数据，实时预览为 Excel 表格，可一键复制（直接粘贴到 Excel/WPS）或下载 .xlsx 文件
    </p>

    <!-- 输入区 -->
    <div class="input-card">
      <div class="input-header">
        <div class="header-title">
          <span class="title-icon">🧾</span>
          <h3>JSON 输入</h3>
        </div>
        <div class="header-actions">
          <el-button size="small" @click="fillSample">填充示例</el-button>
          <el-button size="small" @click="clearInput">清空</el-button>
        </div>
      </div>

      <div class="textarea-wrapper">
        <textarea
          v-model="jsonInput"
          class="json-input"
          spellcheck="false"
          placeholder='粘贴 JSON，例如：
[
  { "姓名": "张三", "年龄": 25, "城市": "北京" },
  { "姓名": "李四", "年龄": 30, "城市": "上海" }
]

支持：对象数组、二维数组、基本类型数组、单个对象'
        ></textarea>
        <div class="input-stats">
          <span class="stat-item">
            <span class="stat-label">字符:</span>
            <span class="stat-value">{{ jsonInput.length }}</span>
          </span>
        </div>
      </div>

      <div class="options-row">
        <div class="option-group">
          <el-checkbox v-model="includeHeader">包含表头</el-checkbox>
          <el-checkbox v-model="flattenNested">展开嵌套对象（点号路径）</el-checkbox>
        </div>
        <div class="action-group">
          <el-button type="primary" @click="generatePreview">生成预览</el-button>
          <el-button
            type="success"
            :disabled="!hasTable"
            @click="copyTable"
          >
            <el-icon><DocumentCopy /></el-icon>
            复制表格
          </el-button>
          <el-button
            type="warning"
            :disabled="!hasTable"
            @click="downloadExcel"
          >
            下载 Excel
          </el-button>
        </div>
      </div>

      <div v-if="parseError" class="error-tip">
        <span class="error-icon">⚠️</span>
        <span>JSON 解析失败：{{ parseError }}</span>
      </div>
    </div>

    <!-- 预览区 -->
    <div v-if="hasTable" class="preview-card">
      <div class="preview-header">
        <div class="header-title">
          <span class="title-icon">📊</span>
          <h3>表格预览</h3>
        </div>
        <div class="preview-meta">
          <el-tag type="success">{{ tableData.rows.length }} 行</el-tag>
          <el-tag>{{ tableData.headers.length }} 列</el-tag>
          <button
            v-if="hasActiveFilter"
            class="clear-filter-btn"
            @click="clearFilters"
          >
            ✕ 清除筛选
          </button>
        </div>
      </div>

      <div class="table-scroll">
        <table class="preview-table">
          <thead>
            <tr class="head-labels">
              <th class="row-index">#</th>
              <th
                v-for="(h, i) in tableData.headers"
                :key="i"
                :class="{ 'col-active': !!columnFilters[i] }"
              >
                <span class="th-label" :title="h">{{ h }}</span>
              </th>
            </tr>
            <tr class="head-filters">
              <th class="row-index">
                <span class="filter-glyph">⌕</span>
              </th>
              <th v-for="(h, i) in tableData.headers" :key="i">
                <input
                  v-model="columnFilters[i]"
                  class="col-filter"
                  :class="{ filled: !!columnFilters[i] }"
                  type="text"
                  spellcheck="false"
                  placeholder="筛选…"
                />
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, ri) in visibleRows" :key="ri">
              <td class="row-index">{{ row.__idx + 1 }}</td>
              <td
                v-for="(cell, ci) in row.cells"
                :key="ci"
                :title="cell"
                v-html="highlight(cell, columnFilters[ci])"
              ></td>
            </tr>
            <tr v-if="filteredRows.length === 0" class="empty-row">
              <td :colspan="tableData.headers.length + 1">
                <span class="empty-glyph">∅</span> 没有符合筛选条件的数据
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 底部状态栏 -->
      <div class="table-footer">
        <div class="footer-left">
          <span class="footer-count">{{ filteredRows.length }}</span>
          <span class="footer-unit">条</span>
          <span class="footer-sep">/</span>
          <span class="footer-total">共 {{ tableData.rows.length }} 条</span>
          <span v-if="hasActiveFilter" class="footer-badge">
            已筛选 {{ tableData.rows.length - filteredRows.length }} 条
          </span>
        </div>
        <div class="footer-right">
          <span v-if="filteredRows.length > previewLimit" class="footer-limit">
            仅显示前 {{ previewLimit }} 行 · 复制/下载为筛选后完整数据
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { DocumentCopy } from '@element-plus/icons-vue'
import * as XLSX from 'xlsx'

const jsonInput = ref('')
const parseError = ref('')
const includeHeader = ref(true)
const flattenNested = ref(false)
const previewLimit = 200

// 表格数据结构：{ headers: string[], rows: string[][] }
const tableData = ref({ headers: [], rows: [] })

// 每列筛选关键字（下标对应 headers）
const columnFilters = ref([])

const hasTable = computed(
  () => tableData.value.headers.length > 0 || tableData.value.rows.length > 0
)

const hasActiveFilter = computed(() =>
  columnFilters.value.some((f) => f && f.trim() !== '')
)

// 按各列关键字过滤（大小写不敏感，包含匹配），保留原始行号
const filteredRows = computed(() => {
  const filters = columnFilters.value
  const active = hasActiveFilter.value
  const result = []
  tableData.value.rows.forEach((cells, idx) => {
    if (active) {
      const pass = filters.every((f, ci) => {
        const kw = (f || '').trim().toLowerCase()
        if (!kw) return true
        return String(cells[ci] ?? '').toLowerCase().includes(kw)
      })
      if (!pass) return
    }
    result.push({ __idx: idx, cells })
  })
  return result
})

const visibleRows = computed(() => filteredRows.value.slice(0, previewLimit))

// 高亮命中的关键字（转义 HTML 后再包裹 <mark>）
const escapeHtml = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

const highlight = (cell, keyword) => {
  const text = escapeHtml(cell)
  const kw = (keyword || '').trim()
  if (!kw) return text
  const escKw = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return text.replace(
    new RegExp(escKw, 'gi'),
    (m) => `<mark class="hl">${m}</mark>`
  )
}

const clearFilters = () => {
  columnFilters.value = columnFilters.value.map(() => '')
}

// 单元格格式化：对象/数组转 JSON 字符串，空值转空串
const formatCell = (value) => {
  if (value === null || value === undefined) return ''
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value)
    } catch (e) {
      return String(value)
    }
  }
  return String(value)
}

// 展开嵌套对象为点号路径（数组保持原样，交由 formatCell 处理）
const flattenObject = (obj, prefix = '', res = {}) => {
  Object.entries(obj).forEach(([k, v]) => {
    const key = prefix ? `${prefix}.${k}` : k
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      flattenObject(v, key, res)
    } else {
      res[key] = v
    }
  })
  return res
}

// 收集对象数组的表头（并集，保持首次出现顺序）
const collectHeaders = (objects) => {
  const seen = new Set()
  const headers = []
  objects.forEach((obj) => {
    Object.keys(obj).forEach((k) => {
      if (!seen.has(k)) {
        seen.add(k)
        headers.push(k)
      }
    })
  })
  return headers
}

// 将解析后的 JSON 构建为二维表格
const buildTable = (parsed) => {
  // 数组
  if (Array.isArray(parsed)) {
    if (parsed.length === 0) return { headers: [], rows: [] }

    const allObjects = parsed.every(
      (it) => it && typeof it === 'object' && !Array.isArray(it)
    )
    if (allObjects) {
      const source = flattenNested.value
        ? parsed.map((o) => flattenObject(o))
        : parsed
      const headers = collectHeaders(source)
      const rows = source.map((o) => headers.map((h) => formatCell(o[h])))
      return { headers, rows }
    }

    const allArrays = parsed.every((it) => Array.isArray(it))
    if (allArrays) {
      const maxLen = parsed.reduce((m, a) => Math.max(m, a.length), 0)
      const headers = Array.from({ length: maxLen }, (_, i) => `列${i + 1}`)
      const rows = parsed.map((a) => headers.map((_, i) => formatCell(a[i])))
      return { headers, rows }
    }

    // 基本类型（或混合）数组 → 单列
    return { headers: ['值'], rows: parsed.map((v) => [formatCell(v)]) }
  }

  // 单个对象 → 键/值两列
  if (parsed && typeof parsed === 'object') {
    const source = flattenNested.value ? flattenObject(parsed) : parsed
    const rows = Object.entries(source).map(([k, v]) => [k, formatCell(v)])
    return { headers: ['键', '值'], rows }
  }

  // 根为基本类型
  return { headers: ['值'], rows: [[formatCell(parsed)]] }
}

const generatePreview = () => {
  parseError.value = ''
  const text = jsonInput.value.trim()
  if (!text) {
    ElMessage.warning('请输入 JSON 数据')
    return
  }

  let parsed
  try {
    parsed = JSON.parse(text)
  } catch (e) {
    parseError.value = e.message
    tableData.value = { headers: [], rows: [] }
    return
  }

  const table = buildTable(parsed)
  if (table.headers.length === 0 && table.rows.length === 0) {
    ElMessage.warning('未解析到可展示的数据')
    tableData.value = { headers: [], rows: [] }
    return
  }

  tableData.value = table
  columnFilters.value = table.headers.map(() => '')
  ElMessage.success(`已生成 ${table.rows.length} 行 × ${table.headers.length} 列表格`)
}

// 生成完整二维矩阵（含表头，用于复制/下载）——基于当前筛选结果
const buildMatrix = () => {
  const { headers } = tableData.value
  const matrix = []
  if (includeHeader.value && headers.length) matrix.push([...headers])
  filteredRows.value.forEach((r) => matrix.push(r.cells))
  return matrix
}

// 二维矩阵转 TSV（可直接粘贴进 Excel）
const toTSV = (matrix) =>
  matrix
    .map((row) =>
      row
        .map((cell) => {
          const s = cell == null ? '' : String(cell)
          // 含制表符/换行/引号的单元格需用双引号包裹并转义
          if (/[\t\n"]/.test(s)) return `"${s.replace(/"/g, '""')}"`
          return s
        })
        .join('\t')
    )
    .join('\n')

const copyTable = async () => {
  if (!hasTable.value) return
  if (filteredRows.value.length === 0) {
    ElMessage.warning('当前筛选结果为空，无可复制数据')
    return
  }
  const tsv = toTSV(buildMatrix())
  const suffix = hasActiveFilter.value
    ? `（筛选后 ${filteredRows.value.length} 条）`
    : ''
  try {
    await navigator.clipboard.writeText(tsv)
    ElMessage.success(`已复制${suffix}，可直接粘贴到 Excel / WPS`)
  } catch (e) {
    // 兼容非安全上下文或权限受限的降级方案
    try {
      const ta = document.createElement('textarea')
      ta.value = tsv
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      ElMessage.success(`已复制${suffix}，可直接粘贴到 Excel / WPS`)
    } catch (err) {
      ElMessage.error('复制失败，请手动选择表格内容复制')
    }
  }
}

const downloadExcel = () => {
  if (!hasTable.value) return
  if (filteredRows.value.length === 0) {
    ElMessage.warning('当前筛选结果为空，无可下载数据')
    return
  }
  try {
    const matrix = buildMatrix()
    const ws = XLSX.utils.aoa_to_sheet(matrix)
    // 依据每列内容估算列宽
    const colCount = matrix.reduce((m, r) => Math.max(m, r.length), 0)
    ws['!cols'] = Array.from({ length: colCount }, (_, ci) => {
      let max = 8
      matrix.forEach((row) => {
        const len = row[ci] == null ? 0 : String(row[ci]).length
        if (len > max) max = len
      })
      return { wch: Math.min(max + 2, 60) }
    })
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
    const fileName = `json-to-excel_${new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/[:T]/g, '-')}.xlsx`
    XLSX.writeFile(wb, fileName)
    ElMessage.success(`Excel 下载完成：${fileName}`)
  } catch (e) {
    ElMessage.error(`下载失败：${e.message}`)
  }
}

const fillSample = () => {
  jsonInput.value = JSON.stringify(
    [
      { 姓名: '张三', 年龄: 25, 城市: '北京', 部门: '研发' },
      { 姓名: '李四', 年龄: 30, 城市: '上海', 部门: '产品' },
      { 姓名: '王五', 年龄: 28, 城市: '广州', 部门: '设计' }
    ],
    null,
    2
  )
  parseError.value = ''
}

const clearInput = () => {
  jsonInput.value = ''
  parseError.value = ''
  tableData.value = { headers: [], rows: [] }
  columnFilters.value = []
}
</script>

<style lang="scss" scoped>
.json-excel-converter {
  min-height: 100%;
  padding: 24px;
  background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%);
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
}

.page-title {
  margin: 0 0 6px;
  text-align: center;
  font-size: 26px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  margin: 0 0 24px;
  text-align: center;
  color: #64748b;
  font-size: 14px;
}

.input-card,
.preview-card {
  max-width: 1100px;
  margin: 0 auto 24px;
  background: #fff;
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
}

.input-header,
.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f1f5f9;

  .header-title {
    display: flex;
    align-items: center;
    gap: 10px;

    .title-icon {
      font-size: 24px;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
    }

    h3 {
      margin: 0;
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
    }
  }

  .header-actions {
    display: flex;
    gap: 8px;
  }
}

.textarea-wrapper {
  position: relative;
  margin-bottom: 18px;

  .json-input {
    width: 100%;
    min-height: 240px;
    padding: 18px;
    border: 2px solid #e2e8f0;
    border-radius: 14px;
    font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
    font-size: 14px;
    line-height: 1.7;
    color: #1e293b;
    resize: vertical;
    transition: all 0.3s ease;
    background: linear-gradient(to bottom, #ffffff 0%, #f8fafc 100%);

    &:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
    }

    &::placeholder {
      color: #94a3b8;
    }
  }

  .input-stats {
    position: absolute;
    bottom: 12px;
    right: 16px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(8px);
    padding: 5px 12px;
    border-radius: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

    .stat-item {
      display: flex;
      gap: 6px;
      font-size: 13px;

      .stat-label {
        color: #64748b;
      }

      .stat-value {
        color: #0f172a;
        font-weight: 700;
      }
    }
  }
}

.options-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;

  .option-group {
    display: flex;
    gap: 20px;
    align-items: center;
  }

  .action-group {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }
}

.error-tip {
  margin-top: 16px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 10px;
  color: #dc2626;
  font-size: 13px;

  .error-icon {
    font-size: 16px;
  }
}

.preview-meta {
  display: flex;
  align-items: center;
  gap: 10px;

  .clear-filter-btn {
    border: none;
    cursor: pointer;
    padding: 4px 12px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
    color: #b91c1c;
    background: #fee2e2;
    transition: all 0.2s ease;

    &:hover {
      background: #fecaca;
      transform: translateY(-1px);
    }
  }
}

.table-scroll {
  overflow: auto;
  max-height: 560px;
  border: 2px solid #e2e8f0;
  border-radius: 12px 12px 0 0;
  border-bottom: none;
}

.preview-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  user-select: text;

  thead {
    position: sticky;
    top: 0;
    z-index: 2;

    .head-labels th {
      padding: 11px 14px 8px;
      text-align: left;
      font-weight: 600;
      color: #fff;
      white-space: nowrap;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      transition: background 0.2s ease;

      &.col-active {
        background: linear-gradient(135deg, #4f46e5 0%, #6d28d9 100%);
        box-shadow: inset 0 -3px 0 #fbbf24;
      }

      .th-label {
        display: inline-block;
        max-width: 260px;
        overflow: hidden;
        text-overflow: ellipsis;
        vertical-align: bottom;
      }
    }

    .head-filters th {
      padding: 0 8px 9px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-bottom: 2px solid rgba(255, 255, 255, 0.25);

      .filter-glyph {
        display: block;
        text-align: center;
        color: rgba(255, 255, 255, 0.7);
        font-size: 15px;
      }
    }

    .col-filter {
      width: 100%;
      min-width: 72px;
      box-sizing: border-box;
      padding: 5px 9px;
      border: 1px solid rgba(255, 255, 255, 0.35);
      border-radius: 7px;
      background: rgba(255, 255, 255, 0.16);
      color: #fff;
      font-size: 12px;
      font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
      transition: all 0.2s ease;

      &::placeholder {
        color: rgba(255, 255, 255, 0.6);
      }

      &:focus {
        outline: none;
        background: #fff;
        color: #1e293b;
        border-color: #fbbf24;
        box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.35);
      }

      &.filled {
        background: #fff;
        color: #1e293b;
        border-color: #fbbf24;
      }
    }
  }

  tbody {
    tr {
      transition: background-color 0.2s ease;

      &:nth-child(even) {
        background-color: #f8fafc;
      }

      &:hover {
        background-color: #eef2ff;
      }

      td {
        padding: 10px 14px;
        color: #334155;
        border-bottom: 1px solid #e2e8f0;
        max-width: 320px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .empty-row td {
      padding: 34px 14px;
      text-align: center;
      color: #94a3b8;
      font-size: 14px;
      background: #fff;

      .empty-glyph {
        font-size: 18px;
        margin-right: 6px;
        color: #cbd5e1;
      }
    }

    :deep(mark.hl) {
      background: #fde68a;
      color: #92400e;
      padding: 0 1px;
      border-radius: 3px;
    }
  }

  .row-index {
    color: #94a3b8;
    text-align: center;
    width: 48px;
    background: #f1f5f9;
  }

  thead .row-index {
    color: #fff;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
}

.table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding: 12px 18px;
  border: 2px solid #e2e8f0;
  border-radius: 0 0 12px 12px;
  background: #0f172a;
  color: #e2e8f0;

  .footer-left {
    display: flex;
    align-items: baseline;
    gap: 8px;

    .footer-count {
      font-size: 22px;
      font-weight: 800;
      line-height: 1;
      font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
      color: #fbbf24;
    }

    .footer-unit {
      font-size: 13px;
      color: #94a3b8;
    }

    .footer-sep {
      color: #475569;
      margin: 0 2px;
    }

    .footer-total {
      font-size: 13px;
      color: #cbd5e1;
    }

    .footer-badge {
      margin-left: 6px;
      padding: 3px 10px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 600;
      color: #fde68a;
      background: rgba(251, 191, 36, 0.14);
      border: 1px solid rgba(251, 191, 36, 0.3);
    }
  }

  .footer-right .footer-limit {
    font-size: 12px;
    color: #64748b;
  }
}
</style>
