<template>
  <el-button
    :class="showCode ? 'btn-code' : 'btn-code-close'"
    @click="loadFile"
    type="primary"
    size="large"
  >
    查看源码
  </el-button>
  <el-drawer
    size="40%"
    v-model="showCode"
    title="源码"
    :close-on-click-overlay="false"
    :close-on-click-modal="false"
    :modal="true"
    @close="() => (showCode = false)"
    @close-auto-focus="() => (showCode = false)"
  >
    <highlightjs language="vue" :code="fileContent || ''" />
    <template #footer>
      <el-button type="primary" @click="copyDownloadUrl(fileContent || '')"
        >复制</el-button
      >
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import 'highlight.js/lib/common'
import hljsVuePlugin from '@highlightjs/vue-plugin'
import { ElMessage } from 'element-plus'

const router = useRouter()
const highlightjs = hljsVuePlugin.component

const fileContent = ref<string | null>(null) // 存储文件内容
const showCode = ref<boolean>(false) // 控制是否显示代码

const loadFile = async () => {
  if (!showCode.value) {
    var path = `/public${router.currentRoute.value.fullPath}/index.vue`
    try {
      const response = await fetch(path)

      if (!response.ok) {
        throw new Error(`网络错误: ${response.status}`)
      }

      const content = await response.text()
      fileContent.value = content
      showCode.value = true
    } catch (error) {
      console.error('加载文件失败:', error)
    }
  } else {
    showCode.value = false
  }
}

const copyDownloadUrl = (str: string) => {
  navigator.clipboard
    .writeText(str)
    .then(() => {
      ElMessage({
        message: '复制成功',
        type: 'success',
      })
    })
    .catch((err) => {
      ElMessage({
        message: '复制失败',
        type: 'error',
      })
    })
}
</script>

<style lang="scss">
@use 'highlight.js/styles/atom-one-dark.css';
.btn-code {
  position: fixed;
  right: 40%;
  top: 100px;
  writing-mode: vertical-rl;
  height: auto;
  width: 0;
  transition: all var(--el-transition-duration);
  z-index: 3000;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  font-size: 16px;
  &-close {
    right: 0;
    position: fixed;
    top: 100px;
    writing-mode: vertical-rl;
    height: auto;
    font-size: 16px;
    width: 0;
    transition: all var(--el-transition-duration);
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
}

.code-container {
  background: #1e1e1e;
  color: #f8f8f2;
  padding: 20px;
  border-radius: 8px;
  overflow: auto;
  max-height: 80vh;
}

pre {
  margin: 0;
  line-height: 1.5;
}

code {
  font-family: 'Fira Code', monospace;
  font-size: 14px;
}
</style>
