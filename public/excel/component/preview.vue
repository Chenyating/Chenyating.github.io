<template>
  <el-drawer size="50%" :title="title" v-model="drawerVisible">
    <!-- 解析结果显示 -->
    <el-collapse accordion>
      <el-collapse-item
        v-for="(fileData, fileIndex) in parsedData"
        :key="fileIndex"
        :title="fileData.fileName"
        :name="fileIndex"
      >
        <el-tabs v-model="activeTabMap[fileIndex]">
          <el-tab-pane
            v-for="(sheet, sheetIndex) in fileData.sheets"
            :key="sheetIndex"
            :label="sheet.name"
            :name="String(sheetIndex)"
          >
            <span>行数：{{ sheet.data.length }}</span>
            <span
              >列数：{{
                sheet.maxColumns || (sheet.data[0] ? sheet.data[0].length : 0)
              }}</span
            >
            <el-table
              :data="sheet.data.slice(0, 10)"
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
            <div v-if="sheet.data.length > 10" class="data-note">
              注：仅显示前10行数据，共{{ sheet.data.length }}行
            </div></el-tab-pane
          >
        </el-tabs>
      </el-collapse-item>
    </el-collapse>
  </el-drawer>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'

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

const rebuildActiveTabsFromParsedData = () => {
  const next = {}
  props.parsedData.forEach((_, idx) => {
    next[idx] = '0'
  })
  // 覆盖式更新，确保响应式
  Object.keys(activeTabMap).forEach((k) => delete activeTabMap[k])
  Object.keys(next).forEach((k) => (activeTabMap[k] = next[k]))
}

watch(
  () => props.parsedData,
  () => rebuildActiveTabsFromParsedData(),
  { immediate: true, deep: true }
)
</script>
