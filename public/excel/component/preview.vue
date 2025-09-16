<template>
  <el-drawer size="50%" :title="title" v-model="drawerVisible">
    <!-- 解析结果显示 -->
    <el-collapse 
      accordion 
      v-model="activeCollapseItem"
    >
      <el-collapse-item
        v-for="(fileData, fileIndex) in parsedData"
        :key="fileIndex"
        :title="fileData.fileName"
        :name="fileIndex"
      >
        <!-- Excel 预览模式 -->
        <template v-if="fileData.sheets && Array.isArray(fileData.sheets)">
          <el-tabs v-model="activeTabMap[fileIndex]">
            <el-tab-pane
              v-for="(sheet, sheetIndex) in fileData.sheets"
              :key="sheetIndex"
              :label="sheet.name"
              :name="String(sheetIndex)"
            >
              <div class="sheet-info">
                <span class="info-item">行数：{{ sheet.data.length }}</span>
                <span class="info-item">列数：{{
                  sheet.maxColumns || (sheet.data[0] ? sheet.data[0].length : 0)
                }}</span>
              </div>
              <el-table
                :data="sheet.data.slice(0, 50)"
                border
                class="data-table"
                max-height="300"
              >
                <el-table-column
                  v-for="colIndex in sheet.maxColumns ||
                  (sheet.data[0] ? sheet.data[0].length : 0)"
                  :key="colIndex - 1"
                  :prop="(colIndex - 1).toString()"
                  :label="`列${colIndex}`"
                  min-width="120"
                >
                  <template #default="scope">
                    {{ scope.row[colIndex - 1] ?? '' }}
                  </template>
                </el-table-column>
              </el-table>
              <div v-if="sheet.data.length > 50" class="data-note">
                注：仅显示前10行数据，共{{ sheet.data.length }}行
              </div>
            </el-tab-pane>
          </el-tabs>
        </template>

        <!-- JSON 预览模式 -->
        <template v-else>
          <el-input
            type="textarea"
            :rows="16"
            :model-value="formatJson(fileData.content)"
            readonly
            class="json-textarea"
          />
        </template>
      </el-collapse-item>
    </el-collapse>
  </el-drawer>
</template>

<script setup>
import { computed, reactive, watch, ref } from 'vue'

const props = defineProps({
  parsedData: {
    type: Array,
    default: () => [],
  },
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '解析结果',
  },
})

const emit = defineEmits(['update:modelValue'])

const drawerVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const activeTabMap = reactive({})
const activeCollapseItem = ref(null)

// 当只有一个文件时，默认展开第一个文件
const setDefaultActiveCollapse = () => {
  if (props.parsedData.length === 1) {
    activeCollapseItem.value = 0
  } else {
    activeCollapseItem.value = null
  }
}

const rebuildActiveTabsFromParsedData = () => {
  const next = {}
  props.parsedData.forEach((_, idx) => {
    next[idx] = '0'
  })
  // 覆盖式更新，确保响应式
  Object.keys(activeTabMap).forEach((k) => delete activeTabMap[k])
  Object.keys(next).forEach((k) => (activeTabMap[k] = next[k]))
  
  // 设置默认展开状态
  setDefaultActiveCollapse()
}

watch(
  () => props.parsedData,
  () => rebuildActiveTabsFromParsedData(),
  { immediate: true, deep: true }
)

const formatJson = (obj) => {
  try {
    return JSON.stringify(obj, null, 2)
  } catch (e) {
    return String(obj)
  }
}
</script>

<style scoped>
.sheet-info {
  margin-bottom: 16px;
  display: flex;
  gap: 20px;
}

.info-item {
  color: #606266;
  font-size: 14px;
}

.data-table {
  margin-bottom: 16px;
}

.data-note {
  color: #909399;
  font-size: 12px;
  text-align: center;
  padding: 8px 0;
}

.json-textarea :deep(textarea) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 12px;
}
</style>
