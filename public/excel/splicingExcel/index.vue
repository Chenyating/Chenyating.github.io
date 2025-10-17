<template>
  <!-- 插入位置配置面板 -->
  <div
    class="config-panel"
    v-show="splicingData.length > 0 && originalData.length > 0"
  >
    <h3>插入位置配置</h3>
    <div class="config-row">
      <span class="config-label">插入方式：</span>
      <el-radio-group v-model="insertMode">
        <el-radio label="before">插入到拼接文件前面</el-radio>
        <el-radio label="after">插入到拼接文件后面</el-radio>
        <el-radio label="position">指定位置插入</el-radio>
      </el-radio-group>
    </div>

    <!-- 指定位置插入的配置 -->
    <div v-show="insertMode === 'position'" class="position-config">
      <div class="config-row">
        <span class="field-label">起始行：</span>
        <el-input-number
          v-model="startRow"
          :min="1"
          :max="10000"
          class="num"
          placeholder="行号"
        />
        <span class="unit-label">行</span>
      </div>
      <div class="config-row">
        <span class="field-label">起始列：</span>
        <el-input-number
          v-model="startCol"
          :min="1"
          :max="1000"
          class="num"
          placeholder="列号"
        />
        <span class="unit-label">列</span>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <el-button type="primary" @click="rowToCol" :disabled="!canProcess">
        生成预览
      </el-button>
      <el-button @click="download" :disabled="!workbook"> 下载文件 </el-button>
    </div>
  </div>
  <uploadExcel
    title="拼接文件"
    :single="true"
    @parsed-data-updated="handleSplicingDataUpdated"
  >
  </uploadExcel>
  <uploadExcel
    title="原始文件"
    @parsed-data-updated="handleOriginalDataUpdated"
  >
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

// 分离拼接文件和原始文件的数据
const splicingData = ref([]) // 拼接文件数据
const originalData = ref([]) // 原始文件数据
const workbook = ref(null)
const previewData = ref([])
const showOriginalFile = ref(false)

// 插入位置配置
const insertMode = ref('after') // 'before', 'after', 'position'
const startRow = ref(1) // 指定位置插入的起始行
const startCol = ref(1) // 指定位置插入的起始列

// 是否注入返回图形
const includeShape = ref(true)
// 是否进行行转列操作（默认关闭）
const enableTranspose = ref(false)
// 形状位置与尺寸（像素）
const shapeX = ref(100)
const shapeY = ref(20)
const shapeW = ref(100)
const shapeH = ref(40)
const pxToEmu = (px) => Math.max(0, Math.round(Number(px || 0) * 9525))

// 处理拼接文件数据更新
const handleSplicingDataUpdated = (data) => {
  splicingData.value = data?.parsedData ?? []
}

// 处理原始文件数据更新
const handleOriginalDataUpdated = (data) => {
  originalData.value = data?.parsedData ?? []
}

// 计算是否可以处理
const canProcess = computed(() => {
  return splicingData.value.length > 0 && originalData.value.length > 0
})
const rowToCol = () => {
  if (!canProcess.value) {
    ElMessage.warning('请先上传拼接文件和原始文件')
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

  // 合并数据的函数
  const mergeSheetData = (
    splicingSheet,
    originalSheet,
    mode,
    startR = 1,
    startC = 1
  ) => {
    const splicingData = Array.isArray(splicingSheet?.data)
      ? splicingSheet.data
      : []
    const originalData = Array.isArray(originalSheet?.data)
      ? originalSheet.data
      : []

    if (mode === 'before') {
      // 原始文件在前面
      return [...originalData, ...splicingData]
    } else if (mode === 'after') {
      // 原始文件在后面
      return [...splicingData, ...originalData]
    } else if (mode === 'position') {
      // 指定位置插入
      return insertDataAtPosition(
        splicingData,
        originalData,
        startR - 1,
        startC - 1
      )
    }
    return splicingData
  }

  // 在指定位置插入数据的函数
  const insertDataAtPosition = (baseData, insertData, startRow, startCol) => {
    if (!insertData || insertData.length === 0) return baseData
    if (!baseData || baseData.length === 0) return insertData

    const result = [...baseData]
    const insertRows = insertData.length
    const insertCols = Math.max(...insertData.map((row) => row.length || 0))

    // 确保结果数组有足够的行
    const maxRow = Math.max(result.length - 1, startRow + insertRows - 1)
    while (result.length <= maxRow) {
      result.push([])
    }

    // 插入数据
    insertData.forEach((row, rowIndex) => {
      const targetRowIndex = startRow + rowIndex
      if (!result[targetRowIndex]) {
        result[targetRowIndex] = []
      }

      // 确保目标行有足够的列
      const maxCol = Math.max(
        result[targetRowIndex].length - 1,
        startCol + (row.length || 0) - 1
      )
      while (result[targetRowIndex].length <= maxCol) {
        result[targetRowIndex].push('')
      }

      // 插入行数据
      if (Array.isArray(row)) {
        row.forEach((cell, colIndex) => {
          result[targetRowIndex][startCol + colIndex] = cell
        })
      }
    })

    return result
  }

  workbook.value = XLSX.utils.book_new()
  const usedSheetNames = new Set()
  const mergedPreview = {
    fileName: enableTranspose.value ? '拼接-行转列' : '拼接文件',
    sheets: [],
  }

  // 收集所有工作表信息用于总览表
  const sheetInfoList = []
  const missingSheets = [] // 记录没有对应原始文件的工作表

  // 收集所有拼接文件的工作表名称
  const splicingSheetNames = new Set()
  splicingData.value.forEach((fileGroup) => {
    const sheets = Array.isArray(fileGroup.sheets) ? fileGroup.sheets : []
    sheets.forEach((sheet) => {
      splicingSheetNames.add(sheet.name)
    })
  })

  // 处理原始文件 - 每个原始文件的工作表作为独立的sheet显示拼接结果
  originalData.value.forEach((originalFile) => {
    const originalFileBaseName = String(originalFile.fileName || 'Excel').replace(
      /\.(xlsx|xls)$/i,
      ''
    )
    const originalSheets = Array.isArray(originalFile.sheets) ? originalFile.sheets : []

    originalSheets.forEach((originalSheet) => {
      // 查找对应的拼接文件工作表
      let correspondingSplicingSheet = null
      splicingData.value.forEach((splicingFile) => {
        const splicingSheets = Array.isArray(splicingFile.sheets) ? splicingFile.sheets : []
        const found = splicingSheets.find((s) => s.name === originalSheet.name)
        if (found) {
          correspondingSplicingSheet = found
        }
      })

      // 生成sheet名称
      const rawSheetName = String(originalSheet?.name ?? 'Sheet')
      const isGenericSheet = /sheet/i.test(rawSheetName)
      const candidate = isGenericSheet ? originalFileBaseName : rawSheetName
      const safeName = createUniqueSheetName(
        sanitizeSheetName(candidate),
        usedSheetNames
      )

      // 合并数据
      let mergedData = Array.isArray(originalSheet?.data) ? originalSheet.data : []
      if (correspondingSplicingSheet) {
        // 有对应的拼接工作表，进行合并
        mergedData = mergeSheetData(
          correspondingSplicingSheet,
          originalSheet,
          insertMode.value,
          startRow.value,
          startCol.value
        )
      } else {
        // 没有对应的拼接工作表，只使用原始数据
        console.warn(
          `未找到工作表 "${originalSheet.name}" 对应的拼接文件数据，将只使用原始文件数据`
        )
      }

      const processedData = enableTranspose.value
        ? transposeAoA(mergedData)
        : mergedData
      const ws = XLSX.utils.aoa_to_sheet(processedData)

      // 保存工作表信息
      sheetInfoList.push({
        name: safeName,
        originalFileName: originalFile.fileName,
      })

      const maxColumns = processedData.reduce(
        (max, row) => Math.max(max, Array.isArray(row) ? row.length : 0),
        0
      )
      mergedPreview.sheets.push({
        name: safeName,
        data: processedData,
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

  // 统计处理结果
  const totalSheets = sheetInfoList.length
  const totalOriginalSheets = originalData.value.reduce((total, file) => {
    return total + (Array.isArray(file.sheets) ? file.sheets.length : 0)
  }, 0)

  // 给用户详细的处理结果提示
  let message = `文件拼接完成！共生成 ${totalSheets} 个工作表`
  if (totalOriginalSheets > 0) {
    message += `，基于 ${totalOriginalSheets} 个原始工作表`
  }
  
  ElMessage.success(message)
}

const download = async () => {
  if (
    !workbook.value ||
    !Array.isArray(workbook.value.SheetNames) ||
    workbook.value.SheetNames.length === 0
  ) {
    ElMessage.warning('请先生成预览后再下载')
    return
  }

  // 导出为 ArrayBuffer，便于注入 DrawingML 形状
  const wbArray = XLSX.write(workbook.value, {
    bookType: 'xlsx',
    type: 'array',
  })
  const zip = await JSZip.loadAsync(wbArray)

  const getText = async (path) => {
    const file = zip.file(path)
    return file ? await file.async('string') : ''
  }
  const setText = (path, content) => {
    zip.file(path, content)
  }

  const ensurePathDir = (path) => {
    const parts = path.split('/')
    for (let i = 1; i < parts.length; i += 1) {
      const dir = parts.slice(0, i).join('/')
      if (dir && !zip.folder(dir)) zip.folder(dir)
    }
  }

  // 解析 workbook 与 rels，建立 sheetName -> sheetPath 的映射
  const workbookXmlPath = 'xl/workbook.xml'
  const wbXml = await getText(workbookXmlPath)
  const wbRelsPath = 'xl/_rels/workbook.xml.rels'
  const wbRelsXml = await getText(wbRelsPath)
  if (!wbXml || !wbRelsXml) {
    // 回退普通下载
    XLSX.writeFile(workbook.value, '合并文件.xlsx')
    return
  }

  const relIdToTarget = new Map()
  ;(wbRelsXml.match(/<Relationship[^>]+>/g) || []).forEach((rel) => {
    const id = (rel.match(/Id="([^"]+)"/) || [])[1]
    const target = (rel.match(/Target="([^"]+)"/) || [])[1]
    if (id && target) relIdToTarget.set(id, `xl/${target.replace(/^\/*/, '')}`)
  })

  const sheetNameToPath = new Map()
  ;(wbXml.match(/<sheet [^>]+\/>/g) || []).forEach((sheetTag) => {
    const name = (sheetTag.match(/name="([^"]+)"/) || [])[1]
    const rId = (sheetTag.match(/r:id="([^"]+)"/) || [])[1]
    const target = relIdToTarget.get(rId)
    if (name && target) sheetNameToPath.set(name, target)
  })

  const contentTypesPath = '[Content_Types].xml'
  let contentTypesXml = await getText(contentTypesPath)

  const drawingOverrideTpl = (idx) =>
    `<Override PartName="/xl/drawings/drawing${idx}.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/>`

  const addContentTypeIfMissing = (idx) => {
    if (!contentTypesXml.includes(`/xl/drawings/drawing${idx}.xml`)) {
      contentTypesXml = contentTypesXml.replace(
        /<\/Types>/,
        `${drawingOverrideTpl(idx)}</Types>`
      )
      setText(contentTypesPath, contentTypesXml)
    }
  }

  // 计算已有的 drawing 序号，生成下一个可用编号
  let nextDrawingIndex = 1
  ;(
    zip.folder('xl/drawings')?.filter((p) => /drawing\d+\.xml$/.test(p.name)) ||
    []
  ).forEach((f) => {
    const m = f.name.match(/drawing(\d+)\.xml$/)
    if (m) nextDrawingIndex = Math.max(nextDrawingIndex, parseInt(m[1], 10) + 1)
  })

  // 构建矩形 DrawingML（绝对锚点，悬浮于表格之上），并附加内部超链接到“总览”!A1
  const buildDrawingXml = (
    shapeId,
    hyperlinkRelId
  ) => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <xdr:absoluteAnchor>
    <xdr:pos x="${pxToEmu(shapeX.value)}" y="${pxToEmu(shapeY.value)}"/>
    <xdr:ext cx="${pxToEmu(shapeW.value)}" cy="${pxToEmu(shapeH.value)}"/>
    <xdr:sp>
      <xdr:nvSpPr>
        <xdr:cNvPr id="${shapeId}" name="BackToOverview"><a:hlinkClick r:id="${hyperlinkRelId}"/></xdr:cNvPr>
        <xdr:cNvSpPr/>
      </xdr:nvSpPr>
      <xdr:spPr>
        <a:prstGeom prst="roundRect"><a:avLst/></a:prstGeom>
        <a:solidFill><a:srgbClr val="1890FF"/></a:solidFill>
        <a:ln><a:noFill/></a:ln>
      </xdr:spPr>
      <xdr:txBody>
        <a:bodyPr/>
        <a:lstStyle/>
        <a:p>
          <a:r>
            <a:rPr b="1" sz="1200" dirty="0"><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill></a:rPr>
            <a:t>返回总览</a:t>
          </a:r>
          <a:endParaRPr/>
        </a:p>
      </xdr:txBody>
      <xdr:style/>
      <xdr:clientData/>
    </xdr:sp>
    <xdr:clientData/>
  </xdr:absoluteAnchor>
</xdr:wsDr>`

  const buildDrawingRelsXml = (
    hyperlinkTarget
  ) => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="${hyperlinkTarget}" TargetMode="Internal"/>
</Relationships>`

  const injectDrawingToSheet = async (sheetName) => {
    if (sheetName === '总览') return // 总览本身不需要返回按钮
    const sheetPath = sheetNameToPath.get(sheetName)
    if (!sheetPath) return

    const sheetXml = await getText(sheetPath)
    if (!sheetXml) return

    // 为该 sheet 创建 drawing 与 rels
    const drawingIdx = nextDrawingIndex++
    const drawingPath = `xl/drawings/drawing${drawingIdx}.xml`
    const drawingRelsPath = `xl/drawings/_rels/drawing${drawingIdx}.xml.rels`
    ensurePathDir(drawingPath)
    ensurePathDir(drawingRelsPath)

    // 在 drawing 中引用的超链接关系 id 固定用 rId1
    const hyperlinkTarget = `#'总览'!A1`
    const drawingRels = buildDrawingRelsXml(hyperlinkTarget)
    setText(drawingRelsPath, drawingRels)
    const drawingXml = buildDrawingXml(1000 + drawingIdx, 'rId1')
    setText(drawingPath, drawingXml)
    addContentTypeIfMissing(drawingIdx)

    // 更新 sheet 的 rels，增加到 drawing 的关系
    const sheetRelsPath = sheetPath
      .replace(/worksheets\//, 'worksheets/_rels/')
      .replace(/\.xml$/, '.xml.rels')
    let sheetRelsXml = await getText(sheetRelsPath)
    if (!sheetRelsXml) {
      sheetRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>`
    }
    // 生成该 sheet 内部到 drawing 的关系 id（避免冲突，找最大 rIdN + 1）
    const existingIds = (sheetRelsXml.match(/Id="rId(\d+)"/g) || []).map((s) =>
      parseInt(s.match(/rId(\d+)/)[1], 10)
    )
    const nextRelIdNum =
      existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1
    const drawingRelTag = `<Relationship Id="rId${nextRelIdNum}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing${drawingIdx}.xml"/>`
    if (sheetRelsXml.includes('</Relationships>')) {
      sheetRelsXml = sheetRelsXml.replace(
        '</Relationships>',
        `${drawingRelTag}</Relationships>`
      )
    } else {
      sheetRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${drawingRelTag}</Relationships>`
    }
    setText(sheetRelsPath, sheetRelsXml)

    // 在 sheet xml 中挂载 <drawing r:id="..."/>
    let updatedSheetXml = sheetXml
    const drawingTag = `<drawing xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:id="rId${nextRelIdNum}"/>`
    if (updatedSheetXml.includes('</worksheet>')) {
      // 尽量放在结尾（如有 <pageMargins/>，放在其后）
      updatedSheetXml = updatedSheetXml.replace(
        '</worksheet>',
        `${drawingTag}</worksheet>`
      )
    }
    setText(sheetPath, updatedSheetXml)
  }

  // 依次为所有 sheet（排除“总览”）注入矩形（仅当 includeShape 为 true）
  if (includeShape.value) {
    for (const name of workbook.value.SheetNames) {
      if (sheetNameToPath.has(name)) {
        // eslint-disable-next-line no-await-in-loop
        await injectDrawingToSheet(name)
      }
    }
  }

  // 生成最终文件并下载
  const outBlob = await zip.generateAsync({ type: 'blob' })
  const a = document.createElement('a')
  const url = URL.createObjectURL(outBlob)
  a.href = url
  a.download = enableTranspose.value ? '合并文件-行转列.xlsx' : '合并文件.xlsx'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
</script>

<style lang="scss" scoped>
.config-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  margin: 20px 0;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background-color: #fafafa;

  h3 {
    margin: 0 0 16px 0;
    color: #409eff;
    font-size: 16px;
    font-weight: 600;
  }
}

.config-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.position-config {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background-color: white;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  margin-top: 8px;
}

.shape-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
  &-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.config-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
  min-width: 80px;
}

.field-label {
  font-size: 14px;
  color: #606266;
  margin-right: 8px;
  min-width: 60px;
}

.unit-label {
  font-size: 12px;
  color: #909399;
  margin-left: 4px;
}

.num :deep(.el-input__wrapper) {
  padding: 0 8px;
}

.num {
  width: 100px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 8px;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;
}

:deep(.el-radio-group) {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

:deep(.el-radio) {
  margin-right: 0;
  margin-bottom: 4px;
}
</style>
