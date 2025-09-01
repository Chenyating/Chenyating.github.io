<template>
  <div class="compare-field-container">
    <h1>字段对比工具</h1>
    <div class="input-section">
      <div class="input-group">
        <label
          >左侧字段（每行一个）：
          <span class="summary-value">{{ leftFieldList.length }}</span>
        </label>
        <el-input
          v-model="leftFields"
          type="textarea"
          clearable
          placeholder="请输入字段，每行一个，例如：&#10;name&#10;age&#10;email&#10;phone&#10;address"
          rows="6"
        ></el-input>
      </div>
      <div class="input-group">
        <label
          >右侧字段（每行一个）：
          <span class="summary-value">{{ rightFieldList.length }}</span>
        </label>
        <el-input
          v-model="rightFields"
          type="textarea"
          clearable
          placeholder="请输入字段，每行一个，例如：&#10;name&#10;age&#10;phone&#10;address&#10;company"
          rows="6"
        ></el-input>
      </div>
    </div>
    <div class="compare-btn">
      <el-button type="primary" @click="compareFields" :loading="comparing">
        开始对比
      </el-button>
      <el-button
        v-if="hasResults"
        @click="clearResults"
        style="margin-left: 10px"
      >
        重新开始
      </el-button>
      <el-button
        v-else
        @click="loadExampleData"
        type="info"
        style="margin-left: 10px"
      >
        加载示例
      </el-button>
    </div>
    <div class="result-section" v-if="hasResults">
      <h2>对比结果:</h2>

      <!-- 只保留详细对比结果 -->
      <div class="detailed-comparison-container">
        <div class="comparison-summary">
          <div class="summary-stats">
            <div class="stat-item">
              <span class="stat-label">完全相似：</span>
              <span class="stat-value success">{{ exactMatch.length }}</span>
              <el-icon @click="copyDownloadUrl(exactMatch)"><CopyDocument /></el-icon>
            </div>
            <div class="stat-item">
              <span class="stat-label">部分相似：</span>
              <span class="stat-value warning">{{ partialMatch.length }}</span>
              <el-icon @click="copyDownloadUrl(partialMatch)"><CopyDocument /></el-icon>
            </div>
            <div class="stat-item">
              <span class="stat-label">左侧无匹配：</span>
              <span class="stat-value danger">{{ noMatchLeft.length }}</span>
              <el-icon @click="copyDownloadUrl(noMatchLeft)"><CopyDocument /></el-icon>
            </div>
            <div class="stat-item">
              <span class="stat-label">右侧无匹配：</span>
              <span class="stat-value danger">{{ noMatchRight.length }}</span>
              <el-icon @click="copyDownloadUrl(noMatchRight)"><CopyDocument /></el-icon>
            </div>
          </div>
        </div>

        <div class="comparison-table-container">
          <h3>详细对比结果</h3>
          <el-table
            :data="detailedComparisonData"
            border
            stripe
            class="comparison-table"
          >
            <el-table-column prop="leftField" label="左侧字段" width="200" />
            <el-table-column prop="rightField" label="右侧字段" width="200" />
            <el-table-column prop="matchType" label="匹配类型" width="120">
              <template #default="scope">
                <el-tag
                  :type="getMatchTypeColor(scope.row.matchType)"
                  size="small"
                >
                  {{ scope.row.matchType }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="similarity" label="相似度" width="100">
              <template #default="scope">
                <span v-if="scope.row.similarity > 0"
                  >{{ scope.row.similarity }}%</span
                >
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column prop="reason" label="匹配原因" />
          </el-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  ElButton,
  ElIcon,
  ElTag,
  ElMessage,
  ElTable,
  ElTableColumn,
} from 'element-plus'
import { CopyDocument } from '@element-plus/icons-vue'
import { copyDownloadUrl } from '@/utils/base'

// 响应式数据
const leftFields = ref('')
const rightFields = ref('')
const comparing = ref(false)
const hasResults = ref(false)

// 计算属性：解析字段列表
const leftFieldList = computed(() => {
  return leftFields.value
    .split('\n')
    .map((field) => field.trim())
    .filter((field) => field.length > 0)
})

const rightFieldList = computed(() => {
  return rightFields.value
    .split('\n')
    .map((field) => field.trim())
    .filter((field) => field.length > 0)
})

// 对比结果
const exactMatch = ref([])
const partialMatch = ref([])
const noMatchLeft = ref([])
const noMatchRight = ref([])

// 详细对比数据
const detailedComparisonData = computed(() => {
  const data = []

  // 完全相似
  exactMatch.value.forEach((field) => {
    data.push({
      leftField: field,
      rightField: field,
      matchType: '完全相似',
      similarity: 100,
      reason: '字段名完全相同',
    })
  })

  // 部分相似
  partialMatch.value.forEach((item) => {
    data.push({
      leftField: item.left,
      rightField: item.right,
      matchType: '部分相似',
      similarity: item.score,
      reason: item.reason,
    })
  })

  // 完全不相似 - 使用noMatchLeft和noMatchRight，这些已经是最终的无匹配字段
  noMatchLeft.value.forEach((field) => {
    data.push({
      leftField: field,
      rightField: '',
      matchType: '左侧无匹配',
      similarity: 0,
      reason: '',
    })
  })

  noMatchRight.value.forEach((field) => {
    data.push({
      leftField: '',
      rightField: field,
      matchType: '右侧无匹配',
      similarity: 0,
      reason: '',
    })
  })

  return data
})

// 相似度计算
const similarityPercentage = computed(() => {
  if (leftFieldList.value.length === 0 || rightFieldList.value.length === 0) {
    return 0
  }

  const totalFields = Math.max(
    leftFieldList.value.length,
    rightFieldList.value.length
  )
  const similarFields = exactMatch.value.length + partialMatch.value.length

  return Math.round((similarFields / totalFields) * 100)
})

// 字段对比逻辑
const compareFields = () => {
  console.log('compareFields 被调用')
  console.log('左侧字段列表长度:', leftFieldList.value.length)
  console.log('右侧字段列表长度:', rightFieldList.value.length)

  if (leftFieldList.value.length === 0 || rightFieldList.value.length === 0) {
    ElMessage.warning('请先输入要对比的字段')
    return
  }

  comparing.value = true
  console.log('开始对比，设置loading状态')

  // 模拟异步处理
  setTimeout(() => {
    console.log('执行performComparison')
    performComparison()
    comparing.value = false
    hasResults.value = true
    console.log('对比完成，设置hasResults为true')
  }, 500)
}

// 执行对比
const performComparison = () => {
  const left = leftFieldList.value
  const right = rightFieldList.value

  console.log('开始执行对比...')
  console.log('左侧字段:', left)
  console.log('右侧字段:', right)

  // 重置结果
  exactMatch.value = []
  partialMatch.value = []
  noMatchLeft.value = []
  noMatchRight.value = []

  // 第一步：完全相似匹配（字段名完全相同）
  const exact = left.filter((field) => right.includes(field))
  exactMatch.value = exact
  console.log('完全相似字段:', exact)

  // 记录已经匹配过的字段，避免重复对比
  const matchedLeft = new Set(exact)
  const matchedRight = new Set(exact)

  // 第二步：部分相似匹配（字段名相似但不完全相同）
  const partial = []
  const remainingLeft = left.filter((field) => !matchedLeft.has(field))
  const remainingRight = right.filter((field) => !matchedRight.has(field))

  console.log('剩余左侧字段:', remainingLeft)
  console.log('剩余右侧字段:', remainingRight)

  // 对剩余字段进行相似度计算，优先匹配相似度高的
  const similarityPairs = []

  remainingLeft.forEach((leftField) => {
    remainingRight.forEach((rightField) => {
      const similarity = calculateSimilarity(leftField, rightField)
      if (similarity.isSimilar) {
        similarityPairs.push({
          left: leftField,
          right: rightField,
          score: similarity.score,
          reason: similarity.reason,
        })
      }
    })
  })

  // 按相似度降序排序，优先匹配相似度高的字段
  similarityPairs.sort((a, b) => b.score - a.score)

  // 贪心算法：优先匹配相似度高的字段对
  similarityPairs.forEach((pair) => {
    if (!matchedLeft.has(pair.left) && !matchedRight.has(pair.right)) {
      partial.push(pair)
      matchedLeft.add(pair.left)
      matchedRight.add(pair.right)
    }
  })

  partialMatch.value = partial
  console.log('部分相似字段:', partial)

  // 第三步：确定无匹配字段
  noMatchLeft.value = left.filter((field) => !matchedLeft.has(field))
  noMatchRight.value = right.filter((field) => !matchedRight.has(field))

  console.log('左侧无匹配字段:', noMatchLeft.value)
  console.log('右侧无匹配字段:', noMatchRight.value)
  console.log('对比完成!')

  // 验证结果的一致性
  const totalLeft =
    exactMatch.value.length +
    partialMatch.value.length +
    noMatchLeft.value.length
  const totalRight =
    exactMatch.value.length +
    partialMatch.value.length +
    noMatchRight.value.length

  console.log(`验证结果: 左侧总字段 ${totalLeft} = 输入 ${left.length}`)
  console.log(`验证结果: 右侧总字段 ${totalRight} = 输入 ${right.length}`)
}

// 判断字段是否相似并计算相似度
const calculateSimilarity = (field1, field2) => {
  if (!field1 || !field2) return { isSimilar: false, score: 0, reason: '' }

  const f1 = field1.toLowerCase()
  const f2 = field2.toLowerCase()

  // 完全包含关系 (相似度: 0.8-0.9)
  if (f1.includes(f2) || f2.includes(f1)) {
    const longer = Math.max(f1.length, f2.length)
    const shorter = Math.min(f1.length, f2.length)
    const score = 0.8 + (shorter / longer) * 0.1
    return {
      isSimilar: true,
      score: Math.round(score * 100),
      reason: '包含关系',
    }
  }

  // 前缀匹配 (相似度: 0.7-0.8)
  if (f1.startsWith(f2) || f2.startsWith(f1)) {
    const longer = Math.max(f1.length, f2.length)
    const shorter = Math.min(f1.length, f2.length)
    const score = 0.7 + (shorter / longer) * 0.1
    return {
      isSimilar: true,
      score: Math.round(score * 100),
      reason: '前缀匹配',
    }
  }

  // 后缀匹配 (相似度: 0.6-0.7)
  if (f1.endsWith(f2) || f2.endsWith(f1)) {
    const longer = Math.max(f1.length, f2.length)
    const shorter = Math.min(f1.length, f2.length)
    const score = 0.6 + (shorter / longer) * 0.1
    return {
      isSimilar: true,
      score: Math.round(score * 100),
      reason: '后缀匹配',
    }
  }

  // 下划线/驼峰转换匹配 (相似度: 0.7-0.8)
  const normalized1 = f1
    .replace(/[_-]/g, '')
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .toLowerCase()
  const normalized2 = f2
    .replace(/[_-]/g, '')
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .toLowerCase()

  if (normalized1 === normalized2) {
    return {
      isSimilar: true,
      score: 75,
      reason: '命名规范转换',
    }
  }

  // 编辑距离相似度 (相似度: 0.5-0.7)
  const editDistance = levenshteinDistance(f1, f2)
  const maxLength = Math.max(f1.length, f2.length)
  const editScore = 1 - editDistance / maxLength

  if (editScore >= 0.5) {
    return {
      isSimilar: true,
      score: Math.round(editScore * 100),
      reason: '编辑距离相似',
    }
  }

  // 公共子序列相似度 (相似度: 0.4-0.6)
  const commonSubsequence = longestCommonSubsequence(f1, f2)
  const subsequenceScore = (commonSubsequence * 2) / (f1.length + f2.length)

  if (subsequenceScore >= 0.4) {
    return {
      isSimilar: true,
      score: Math.round(subsequenceScore * 100),
      reason: '公共子序列',
    }
  }

  return { isSimilar: false, score: 0, reason: '' }
}

// 判断字段是否相似（兼容旧版本）
const isSimilar = (field1, field2) => {
  return calculateSimilarity(field1, field2).isSimilar
}

// 计算编辑距离
const levenshteinDistance = (str1, str2) => {
  const matrix = []

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }

  return matrix[str2.length][str1.length]
}

// 计算最长公共子序列长度
const longestCommonSubsequence = (str1, str2) => {
  const m = str1.length
  const n = str2.length
  const dp = Array(m + 1)
    .fill()
    .map(() => Array(n + 1).fill(0))

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  return dp[m][n]
}

// 清空结果
const clearResults = () => {
  leftFields.value = ''
  rightFields.value = ''
  hasResults.value = false
  exactMatch.value = []
  partialMatch.value = []
  noMatchLeft.value = []
  noMatchRight.value = []
}

// 加载示例数据
const loadExampleData = () => {
  leftFields.value = `name
age
email
phone
address
company
department
salary
hire_date
employee_id`

  rightFields.value = `name
age
email
phone_number
address
company_name
department
salary_amount
hire_date
staff_id`
}

// 根据匹配类型获取颜色
const getMatchTypeColor = (type) => {
  switch (type) {
    case '完全相似':
      return 'success'
    case '部分相似':
      return 'warning'
    case '左侧无匹配':
      return 'danger'
    case '右侧无匹配':
      return 'danger'
    default:
      return ''
  }
}
</script>

<style scoped>
.compare-field-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  color: #303133;
  margin-bottom: 20px;
}
.input-section {
  display: flex;
  gap: 20px;
  align-items: center;
}

.input-group {
  flex: 1;
}

.input-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #606266;
}

.input-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  resize: vertical;
  transition: border-color 0.3s;
}

.input-group textarea:focus {
  outline: none;
  border-color: #409eff;
}

.compare-btn {
  margin-top: 20px;
  display: flex;
}

.result-section {
  margin-top: 30px;
}

.result-section h2 {
  text-align: center;
  color: #303133;
  margin-bottom: 20px;
}

.detailed-comparison-container {
  background-color: #fafafa;
  border-radius: 8px;
  padding: 20px;
}

.comparison-summary {
  margin-bottom: 20px;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: white;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.stat-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.stat-label {
  color: #606266;
  font-weight: 500;
  font-size: 14px;
}

.stat-value {
  font-weight: 600;
  font-size: 18px;
}

.stat-value.success {
  color: #67c23a;
}

.stat-value.warning {
  color: #e6a23c;
}

.stat-value.danger {
  color: #f56c6c;
}

.comparison-table-container {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.comparison-table-container h3 {
  margin: 0 0 20px 0;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
}

.comparison-table {
  width: 100%;
}

.comparison-table .el-table {
  border-radius: 8px;
  overflow: hidden;
}

.comparison-table .el-table th {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 600;
}

.comparison-table .el-table td {
  padding: 12px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .input-section {
    flex-direction: column;
    align-items: center;
  }

  .compare-btn {
    padding-top: 20px;
    justify-content: center;
    min-width: auto;
  }

  .detailed-comparison-container {
    padding: 15px;
  }

  .summary-stats {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .stat-item {
    padding: 10px;
  }

  .comparison-table-container {
    padding: 15px;
  }

  .comparison-table {
    overflow-x: auto;
  }
}

/* 添加一些额外的样式优化 */
.field-tag {
  margin: 4px;
  font-size: 14px;
}

.partial-item {
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  padding: 16px;
  background-color: #fafafa;
  margin-bottom: 12px;
}

.partial-item:last-child {
  margin-bottom: 0;
}

.no-match-section {
  margin-bottom: 24px;
}

.no-match-section h4 {
  margin: 0 0 12px 0;
  color: #606266;
  font-size: 14px;
  font-weight: 600;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
}

.empty-result {
  text-align: center;
  padding: 40px 20px;
  color: #909399;
}

.detailed-comparison {
  padding: 0;
  background-color: transparent;
}

.comparison-table {
  width: 100%;
}

.comparison-table .el-table {
  border-radius: 8px;
  overflow: hidden;
}

.comparison-table .el-table th {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 600;
}

.comparison-table .el-table td {
  padding: 12px 0;
}

.overview-content {
  padding: 20px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: white;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.summary-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.summary-label {
  color: #606266;
  font-weight: 500;
  font-size: 14px;
}

.summary-value {
  font-weight: 600;
  font-size: 18px;
}

.summary-value.success {
  color: #67c23a;
}

.summary-value.warning {
  color: #e6a23c;
}

.summary-value.danger {
  color: #f56c6c;
}
</style>
