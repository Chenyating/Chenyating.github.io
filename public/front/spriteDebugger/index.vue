<template>
  <div class="sprite-debugger">
    <div class="sd-header">
      <div class="header-title">
        <span class="title-icon">🎨</span>
        <h3>CSS 精灵图在线调试</h3>
      </div>
      <p class="header-desc">上传精灵图，配置切图与动画参数，实时预览逐帧动画并生成 CSS 代码</p>
    </div>

    <div class="sd-body">
      <!-- 左侧：图片工作区 -->
      <div class="sd-canvas-panel">
        <!-- 上传区 -->
        <div
          v-if="!imageUrl"
          class="upload-zone"
          :class="{ 'is-dragover': isDragover }"
          @click="triggerFileInput"
          @dragover.prevent="isDragover = true"
          @dragleave.prevent="isDragover = false"
          @drop.prevent="handleDrop"
        >
          <span class="upload-icon">🖼️</span>
          <p class="upload-title">点击或拖拽上传精灵图</p>
          <p class="upload-hint">支持 PNG / JPG / GIF / WEBP / SVG</p>
          <div class="upload-url" @click.stop>
            <el-input
              v-model="urlInput"
              placeholder="或粘贴图片 URL 后回车"
              size="small"
              @keyup.enter="loadFromUrl"
            >
              <template #append>
                <el-button @click="loadFromUrl">加载</el-button>
              </template>
            </el-input>
          </div>
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            class="hidden-input"
            @change="handleFileChange"
          />
        </div>

        <!-- 画布区 -->
        <div v-else class="canvas-wrapper">
          <div class="canvas-toolbar">
            <div class="toolbar-left">
              <el-tag type="info" size="small">
                原图 {{ naturalWidth }} × {{ naturalHeight }}
              </el-tag>
              <el-tag size="small">缩放 {{ Math.round(zoom * 100) }}%</el-tag>
            </div>
            <div class="toolbar-right">
              <el-button size="small" @click="zoom = Math.max(0.05, +(zoom - 0.1).toFixed(2))">－</el-button>
              <el-button size="small" @click="fitToView">适应</el-button>
              <el-button size="small" @click="zoom = 1">1:1</el-button>
              <el-button size="small" @click="zoom = +(zoom + 0.1).toFixed(2)">＋</el-button>
              <el-button size="small" type="danger" plain @click="resetImage">更换图片</el-button>
            </div>
          </div>

          <div
            ref="stage"
            class="canvas-stage"
            @mousedown="startDrag"
          >
            <div class="canvas-viewport" :style="viewportStyle">
              <div class="canvas-inner" :style="canvasInnerStyle">
                <img
                  :src="imageUrl"
                  class="sprite-image"
                  draggable="false"
                  @load="handleImageLoad"
                />
                <!-- 当前帧选区框 -->
                <div class="selection-box" :style="selectionStyle">
                  <span class="sel-size">{{ frameWidth }} × {{ frameHeight }}</span>
                </div>
                <!-- 帧网格辅助线 -->
                <div
                  v-for="(cell, i) in frameGrid"
                  :key="i"
                  class="frame-ghost"
                  :class="{ current: i === currentFrame }"
                  :style="cell.style"
                >
                  <span class="frame-idx">{{ i + 1 }}</span>
                </div>
              </div>
            </div>
          </div>
          <p class="canvas-tip">💡 在图片上按住鼠标拖动可移动起始帧位置，虚线框标出各帧范围</p>
        </div>
      </div>

      <!-- 右侧：参数与预览 -->
      <div class="sd-control-panel">
        <!-- 动画预览 -->
        <div class="panel-card anim-card">
          <div class="card-title">
            <span class="dot"></span>动画预览
            <span class="frame-counter">{{ frameCount > 0 ? currentFrame + 1 : 0 }} / {{ frameCount }}</span>
          </div>
          <div class="anim-stage" :style="animStageStyle">
            <div v-if="imageUrl" class="anim-sprite" :style="animSpriteStyle"></div>
            <span v-else class="preview-empty">上传图片后预览</span>
          </div>
          <div class="anim-controls">
            <el-button-group>
              <el-button size="small" @click="togglePlay" :type="isPlaying ? 'warning' : 'primary'">
                {{ isPlaying ? '⏸ 暂停' : '▶ 播放' }}
              </el-button>
              <el-button size="small" @click="restart">⏮ 重播</el-button>
              <el-button size="small" @click="stepFrame(-1)">◀</el-button>
              <el-button size="small" @click="stepFrame(1)">▶</el-button>
            </el-button-group>
            <el-switch v-model="loopInfinite" active-text="循环" size="small" />
          </div>
        </div>

        <!-- 动画参数 -->
        <div class="panel-card">
          <div class="card-title">
            <span class="dot"></span>动画参数
            <el-button size="small" text type="primary" class="copy-btn" @click="autoFitFrames">
              自动匹配帧尺寸
            </el-button>
          </div>

          <div class="ctrl-row">
            <label>排列方向</label>
            <div class="ctrl-input">
              <el-radio-group v-model="animDirection" size="small">
                <el-radio-button value="horizontal">横向</el-radio-button>
                <el-radio-button value="vertical">纵向</el-radio-button>
                <el-radio-button value="grid">网格</el-radio-button>
              </el-radio-group>
            </div>
          </div>

          <div class="ctrl-row">
            <label>总帧数 (frames)</label>
            <div class="ctrl-input">
              <el-slider v-model="frameCount" :min="1" :max="60" size="small" />
              <el-input-number v-model="frameCount" :min="1" :controls="false" size="small" />
            </div>
          </div>

          <div v-if="animDirection === 'grid'" class="ctrl-row">
            <label>每行列数 (columns)</label>
            <div class="ctrl-input">
              <el-slider v-model="gridCols" :min="1" :max="frameCount" size="small" />
              <el-input-number v-model="gridCols" :min="1" :controls="false" size="small" />
            </div>
          </div>

          <div class="ctrl-row">
            <label>帧间距 (spacing) — 帧之间的留白，横向×纵向</label>
            <div class="ctrl-input">
              <el-input-number v-model="spacingX" :controls="false" size="small" />
              <span class="unit-x">×</span>
              <el-input-number v-model="spacingY" :controls="false" size="small" />
              <el-button size="small" text type="primary" @click="autoFitFrames">重新分帧</el-button>
            </div>
          </div>

          <div class="ctrl-row">
            <label>帧率 (FPS) — {{ fps }} 帧/秒 · {{ animDuration }}s / 循环</label>
            <div class="ctrl-input">
              <el-slider v-model="fps" :min="1" :max="60" size="small" />
              <el-input-number v-model="fps" :min="1" :max="60" :controls="false" size="small" />
            </div>
          </div>
        </div>

        <!-- 切图参数 -->
        <div class="panel-card">
          <div class="card-title">
            <span class="dot"></span>单帧切图参数
          </div>

          <div class="ctrl-row">
            <label>帧宽度 (width)</label>
            <div class="ctrl-input">
              <el-slider v-model="frameWidth" :min="1" :max="naturalWidth || 500" size="small" />
              <el-input-number v-model="frameWidth" :min="1" :controls="false" size="small" />
            </div>
          </div>

          <div class="ctrl-row">
            <label>帧高度 (height)</label>
            <div class="ctrl-input">
              <el-slider v-model="frameHeight" :min="1" :max="naturalHeight || 500" size="small" />
              <el-input-number v-model="frameHeight" :min="1" :controls="false" size="small" />
            </div>
          </div>

          <div class="ctrl-row">
            <label>起始横向偏移 (position-x)</label>
            <div class="ctrl-input">
              <el-slider v-model="posX" :min="-(naturalWidth || 500)" :max="0" size="small" />
              <el-input-number v-model="posX" :controls="false" size="small" />
            </div>
          </div>

          <div class="ctrl-row">
            <label>起始纵向偏移 (position-y)</label>
            <div class="ctrl-input">
              <el-slider v-model="posY" :min="-(naturalHeight || 500)" :max="0" size="small" />
              <el-input-number v-model="posY" :controls="false" size="small" />
            </div>
          </div>

          <div class="ctrl-row">
            <label>背景尺寸 (background-size)</label>
            <div class="ctrl-input">
              <el-radio-group v-model="bgSizeMode" size="small">
                <el-radio-button value="auto">原始</el-radio-button>
                <el-radio-button value="custom">自定义</el-radio-button>
              </el-radio-group>
            </div>
          </div>
          <div v-if="bgSizeMode === 'custom'" class="ctrl-row">
            <label>缩放后尺寸</label>
            <div class="ctrl-input">
              <el-input-number v-model="bgSizeW" :min="1" :controls="false" size="small" />
              <span class="unit-x">×</span>
              <el-input-number v-model="bgSizeH" :min="1" :controls="false" size="small" />
            </div>
          </div>
        </div>

        <!-- CSS 代码 -->
        <div class="panel-card">
          <div class="card-title">
            <span class="dot"></span>生成的 CSS
            <el-radio-group v-model="cssMode" size="small" class="css-switch">
              <el-radio-button value="anim">动画</el-radio-button>
              <el-radio-button value="static">静态帧</el-radio-button>
            </el-radio-group>
          </div>
          <pre class="css-output"><code>{{ cssCode }}</code></pre>
          <el-button size="small" type="primary" plain class="copy-full" @click="copyCss">
            <el-icon><DocumentCopy /></el-icon>复制 CSS
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { DocumentCopy } from '@element-plus/icons-vue'

const fileInput = ref(null)
const stage = ref(null)
const isDragover = ref(false)
const urlInput = ref('')

const imageUrl = ref('')
const naturalWidth = ref(0)
const naturalHeight = ref(0)
const zoom = ref(1)

// 单帧切图参数
const frameWidth = ref(100)
const frameHeight = ref(100)
const posX = ref(0)
const posY = ref(0)

// 背景尺寸
const bgSizeMode = ref('auto')
const bgSizeW = ref(0)
const bgSizeH = ref(0)

// 动画参数
const frameCount = ref(4)
const animDirection = ref('horizontal') // horizontal | vertical | grid
const gridCols = ref(4)
const fps = ref(12)
const loopInfinite = ref(true)

// 帧间距（处理精灵图非固定间距/带留白的情况）
const spacingX = ref(0)
const spacingY = ref(0)

// 播放状态
const isPlaying = ref(false)
const currentFrame = ref(0)
let timer = null

// CSS 输出模式
const cssMode = ref('anim')

const className = ref('.sprite')

/* ---------- 上传 ---------- */
const triggerFileInput = () => fileInput.value?.click()

const readFile = (file) => {
  if (!file || !file.type.startsWith('image/')) {
    ElMessage.warning('请选择图片文件')
    return
  }
  const reader = new FileReader()
  reader.onload = (e) => {
    imageUrl.value = e.target.result
  }
  reader.readAsDataURL(file)
}

const handleFileChange = (e) => {
  readFile(e.target.files?.[0])
  e.target.value = ''
}

const handleDrop = (e) => {
  isDragover.value = false
  readFile(e.dataTransfer.files?.[0])
}

const loadFromUrl = () => {
  const url = urlInput.value.trim()
  if (!url) {
    ElMessage.warning('请输入图片 URL')
    return
  }
  imageUrl.value = url
}

const handleImageLoad = (e) => {
  const img = e.target
  naturalWidth.value = img.naturalWidth
  naturalHeight.value = img.naturalHeight
  bgSizeW.value = img.naturalWidth
  bgSizeH.value = img.naturalHeight
  autoFitFrames()
  fitToView()
  ElMessage.success('图片加载成功')
}

// 缩放至完整可见，避免长图产生超长滚动条
const fitToView = async () => {
  await nextTick()
  const el = stage.value
  if (!el || !naturalWidth.value) return
  const availW = el.clientWidth - 32
  const availH = el.clientHeight - 32
  const z = Math.min(availW / naturalWidth.value, availH / naturalHeight.value, 1)
  zoom.value = +Math.max(0.05, z).toFixed(3)
}

const resetImage = () => {
  stop()
  imageUrl.value = ''
  urlInput.value = ''
  naturalWidth.value = 0
  naturalHeight.value = 0
  posX.value = 0
  posY.value = 0
  zoom.value = 1
  currentFrame.value = 0
}

// 根据帧数自动推算帧宽高（扣除帧间距）
const autoFitFrames = () => {
  if (!naturalWidth.value) return
  if (animDirection.value === 'horizontal') {
    const n = frameCount.value
    frameWidth.value = Math.round((naturalWidth.value - (n - 1) * spacingX.value) / n)
    frameHeight.value = naturalHeight.value
  } else if (animDirection.value === 'vertical') {
    const n = frameCount.value
    frameWidth.value = naturalWidth.value
    frameHeight.value = Math.round((naturalHeight.value - (n - 1) * spacingY.value) / n)
  } else {
    const cols = Math.max(1, gridCols.value)
    const rows = Math.ceil(frameCount.value / cols)
    frameWidth.value = Math.round((naturalWidth.value - (cols - 1) * spacingX.value) / cols)
    frameHeight.value = Math.round((naturalHeight.value - (rows - 1) * spacingY.value) / rows)
  }
  posX.value = 0
  posY.value = 0
}

/* ---------- 帧位置计算 ---------- */
// 计算第 n 帧的背景偏移（步进 = 帧尺寸 + 帧间距）
const framePos = (n) => {
  const strideX = frameWidth.value + spacingX.value
  const strideY = frameHeight.value + spacingY.value
  if (animDirection.value === 'horizontal') {
    return { x: posX.value - n * strideX, y: posY.value }
  }
  if (animDirection.value === 'vertical') {
    return { x: posX.value, y: posY.value - n * strideY }
  }
  const cols = Math.max(1, gridCols.value)
  const cx = n % cols
  const cy = Math.floor(n / cols)
  return { x: posX.value - cx * strideX, y: posY.value - cy * strideY }
}

/* ---------- 画布样式 ---------- */
// 视口占位盒：尺寸 = 缩放后的真实footprint，滚动条据此计算
const viewportStyle = computed(() => ({
  width: `${naturalWidth.value * zoom.value}px`,
  height: `${naturalHeight.value * zoom.value}px`,
}))

const canvasInnerStyle = computed(() => ({
  transform: `scale(${zoom.value})`,
  transformOrigin: 'top left',
  width: `${naturalWidth.value}px`,
  height: `${naturalHeight.value}px`,
}))

// 当前帧在原图上的高亮框
const selectionStyle = computed(() => {
  const p = framePos(currentFrame.value)
  return {
    width: `${frameWidth.value}px`,
    height: `${frameHeight.value}px`,
    left: `${-p.x}px`,
    top: `${-p.y}px`,
  }
})

// 各帧的辅助网格
const frameGrid = computed(() => {
  const cells = []
  for (let i = 0; i < frameCount.value; i++) {
    const p = framePos(i)
    cells.push({
      style: {
        width: `${frameWidth.value}px`,
        height: `${frameHeight.value}px`,
        left: `${-p.x}px`,
        top: `${-p.y}px`,
      },
    })
  }
  return cells
})

/* ---------- 背景尺寸 ---------- */
const effectiveBgSize = computed(() => {
  if (bgSizeMode.value === 'custom') {
    return `${bgSizeW.value}px ${bgSizeH.value}px`
  }
  return 'auto'
})

/* ---------- 动画预览样式 ---------- */
const animStageStyle = computed(() => ({
  width: `${Math.min(frameWidth.value, 280)}px`,
  height: `${Math.min(frameHeight.value, 280)}px`,
}))

const animSpriteStyle = computed(() => {
  const p = framePos(currentFrame.value)
  return {
    width: `${frameWidth.value}px`,
    height: `${frameHeight.value}px`,
    backgroundImage: `url(${imageUrl.value})`,
    backgroundPosition: `${p.x}px ${p.y}px`,
    backgroundSize: effectiveBgSize.value,
    backgroundRepeat: 'no-repeat',
    imageRendering: 'auto',
  }
})

/* ---------- 播放控制（JS 逐帧驱动） ---------- */
const animDuration = computed(() => (frameCount.value / fps.value).toFixed(2))

const tick = () => {
  const next = currentFrame.value + 1
  if (next >= frameCount.value) {
    if (loopInfinite.value) {
      currentFrame.value = 0
    } else {
      currentFrame.value = frameCount.value - 1
      stop()
    }
  } else {
    currentFrame.value = next
  }
}

const play = () => {
  if (!imageUrl.value || isPlaying.value) return
  isPlaying.value = true
  timer = setInterval(tick, 1000 / fps.value)
}

const stop = () => {
  isPlaying.value = false
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

const togglePlay = () => (isPlaying.value ? stop() : play())

const restart = () => {
  currentFrame.value = 0
  stop()
  play()
}

const stepFrame = (dir) => {
  stop()
  currentFrame.value = (currentFrame.value + dir + frameCount.value) % frameCount.value
}

// fps 改变时重启计时器保持播放
watch(fps, () => {
  if (isPlaying.value) {
    stop()
    play()
  }
})

// 帧数变化时约束当前帧
watch(frameCount, (n) => {
  if (currentFrame.value >= n) currentFrame.value = 0
  if (gridCols.value > n) gridCols.value = n
})

watch(bgSizeMode, (mode) => {
  if (mode === 'custom' && !bgSizeW.value) {
    bgSizeW.value = naturalWidth.value
    bgSizeH.value = naturalHeight.value
  }
})

onUnmounted(stop)

/* ---------- 生成 CSS ---------- */
const displayUrl = computed(() =>
  imageUrl.value.startsWith('data:') ? '精灵图路径.png' : imageUrl.value
)

const staticCss = computed(() => {
  const p = framePos(currentFrame.value)
  return [
    `${className.value} {`,
    `  width: ${frameWidth.value}px;`,
    `  height: ${frameHeight.value}px;`,
    `  background-image: url("${displayUrl.value}");`,
    `  background-position: ${p.x}px ${p.y}px;`,
    `  background-size: ${effectiveBgSize.value};`,
    `  background-repeat: no-repeat;`,
    `}`,
  ].join('\n')
})

const animCss = computed(() => {
  const n = frameCount.value
  const loop = loopInfinite.value ? 'infinite' : '1'
  const rule = [
    `${className.value} {`,
    `  width: ${frameWidth.value}px;`,
    `  height: ${frameHeight.value}px;`,
    `  background-image: url("${displayUrl.value}");`,
    `  background-repeat: no-repeat;`,
    `  background-size: ${effectiveBgSize.value};`,
  ]

  let keyframes
  if (animDirection.value === 'horizontal') {
    const start = framePos(0)
    const strideX = frameWidth.value + spacingX.value
    rule.push(`  background-position: ${start.x}px ${start.y}px;`)
    rule.push(`  animation: sprite-play ${animDuration.value}s steps(${n}) ${loop};`)
    keyframes =
      `@keyframes sprite-play {\n` +
      `  from { background-position: ${start.x}px ${start.y}px; }\n` +
      `  to   { background-position: ${posX.value - strideX * n}px ${start.y}px; }\n` +
      `}`
  } else if (animDirection.value === 'vertical') {
    const start = framePos(0)
    const strideY = frameHeight.value + spacingY.value
    rule.push(`  background-position: ${start.x}px ${start.y}px;`)
    rule.push(`  animation: sprite-play ${animDuration.value}s steps(${n}) ${loop};`)
    keyframes =
      `@keyframes sprite-play {\n` +
      `  from { background-position: ${start.x}px ${start.y}px; }\n` +
      `  to   { background-position: ${start.x}px ${posY.value - strideY * n}px; }\n` +
      `}`
  } else {
    // 网格：显式逐帧关键帧 + steps(1) 保持每帧
    rule.push(`  animation: sprite-play ${animDuration.value}s steps(1, end) ${loop};`)
    const lines = ['@keyframes sprite-play {']
    for (let i = 0; i < n; i++) {
      const p = framePos(i)
      const pct = ((i / n) * 100).toFixed(2).replace(/\.?0+$/, '')
      lines.push(`  ${pct}% { background-position: ${p.x}px ${p.y}px; }`)
    }
    const last = framePos(n - 1)
    lines.push(`  100% { background-position: ${last.x}px ${last.y}px; }`)
    lines.push('}')
    keyframes = lines.join('\n')
  }

  rule.push('}')
  return `${rule.join('\n')}\n\n${keyframes}`
})

const cssCode = computed(() => (cssMode.value === 'static' ? staticCss.value : animCss.value))

const copyCss = async () => {
  try {
    await navigator.clipboard.writeText(cssCode.value)
    ElMessage.success('CSS 已复制到剪贴板')
  } catch (err) {
    ElMessage.error('复制失败，请手动复制')
  }
}

/* ---------- 拖拽移动起始帧 ---------- */
let dragging = false
let startMouseX = 0
let startMouseY = 0
let startPosX = 0
let startPosY = 0

const startDrag = (e) => {
  if (!imageUrl.value) return
  dragging = true
  startMouseX = e.clientX
  startMouseY = e.clientY
  startPosX = posX.value
  startPosY = posY.value
  window.addEventListener('mousemove', onDrag)
  window.addEventListener('mouseup', stopDrag)
}

const onDrag = (e) => {
  if (!dragging) return
  const dx = (e.clientX - startMouseX) / zoom.value
  const dy = (e.clientY - startMouseY) / zoom.value
  posX.value = Math.round(Math.min(0, Math.max(-(naturalWidth.value - frameWidth.value), startPosX + dx)))
  posY.value = Math.round(Math.min(0, Math.max(-(naturalHeight.value - frameHeight.value), startPosY + dy)))
}

const stopDrag = () => {
  dragging = false
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup', stopDrag)
}
</script>

<style lang="scss" scoped>
.sprite-debugger {
  min-height: 100%;
  padding: 24px;
  background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%);
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
}

.sd-header {
  margin-bottom: 24px;

  .header-title {
    display: flex;
    align-items: center;
    gap: 12px;

    .title-icon {
      font-size: 28px;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
    }

    h3 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  }

  .header-desc {
    margin: 8px 0 0;
    color: #64748b;
    font-size: 14px;
  }
}

.sd-body {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 24px;
  align-items: start;
}

/* 上传区 */
.upload-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 420px;
  background: #fff;
  border: 2px dashed #cbd5e1;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);

  &:hover,
  &.is-dragover {
    border-color: #667eea;
    background: linear-gradient(135deg, #f5f7ff 0%, #faf5ff 100%);
  }

  .upload-icon {
    font-size: 56px;
    margin-bottom: 16px;
  }

  .upload-title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #1e293b;
  }

  .upload-hint {
    margin: 8px 0 20px;
    font-size: 13px;
    color: #94a3b8;
  }

  .upload-url {
    width: 320px;
  }
}

.hidden-input {
  display: none;
}

/* 画布 */
.canvas-wrapper {
  background: #fff;
  border-radius: 20px;
  padding: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
}

.canvas-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

  .toolbar-left {
    display: flex;
    gap: 8px;
  }

  .toolbar-right {
    display: flex;
    gap: 8px;
  }
}

.canvas-stage {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
  height: 480px;
  padding: 16px;
  border-radius: 12px;
  background-color: #f8fafc;
  background-image:
    linear-gradient(45deg, #e2e8f0 25%, transparent 25%),
    linear-gradient(-45deg, #e2e8f0 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #e2e8f0 75%),
    linear-gradient(-45deg, transparent 75%, #e2e8f0 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
}

/* 缩放后的占位盒，居中且可滚动 */
.canvas-viewport {
  position: relative;
  flex: none;
  margin: auto;
}

.canvas-inner {
  position: relative;
}

.sprite-image {
  display: block;
  user-select: none;
  pointer-events: none;
}

.selection-box {
  position: absolute;
  border: 2px solid #667eea;
  box-shadow: 0 0 0 9999px rgba(15, 23, 42, 0.4);
  pointer-events: none;
  z-index: 3;

  .sel-size {
    position: absolute;
    top: -22px;
    left: 0;
    padding: 1px 6px;
    font-size: 11px;
    color: #fff;
    background: #667eea;
    border-radius: 4px;
    white-space: nowrap;
  }
}

.frame-ghost {
  position: absolute;
  border: 1px dashed rgba(102, 126, 234, 0.5);
  pointer-events: none;
  z-index: 2;

  .frame-idx {
    position: absolute;
    top: 2px;
    left: 3px;
    font-size: 10px;
    line-height: 1;
    color: #667eea;
    background: rgba(255, 255, 255, 0.75);
    padding: 1px 3px;
    border-radius: 3px;
  }

  &.current {
    border-color: #f59e0b;
    border-style: solid;

    .frame-idx {
      color: #b45309;
    }
  }
}

.canvas-tip {
  margin: 12px 0 0;
  font-size: 12px;
  color: #94a3b8;
  text-align: center;
}

/* 右侧面板 */
.sd-control-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.panel-card {
  background: #fff;
  border-radius: 16px;
  padding: 18px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
}

.anim-card {
  background: linear-gradient(160deg, #ffffff 0%, #f5f7ff 100%);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 16px;

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .copy-btn,
  .css-switch {
    margin-left: auto;
  }

  .frame-counter {
    margin-left: auto;
    font-size: 13px;
    font-weight: 700;
    color: #667eea;
    font-variant-numeric: tabular-nums;
  }
}

/* 动画预览 */
.anim-stage {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 80px;
  min-height: 80px;
  margin: 0 auto 16px;
  border-radius: 10px;
  background-color: #f8fafc;
  background-image:
    linear-gradient(45deg, #e2e8f0 25%, transparent 25%),
    linear-gradient(-45deg, #e2e8f0 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #e2e8f0 75%),
    linear-gradient(-45deg, transparent 75%, #e2e8f0 75%);
  background-size: 16px 16px;
  background-position: 0 0, 0 8px, 8px -8px, -8px 0px;
  overflow: hidden;

  .preview-empty {
    font-size: 12px;
    color: #94a3b8;
  }
}

.anim-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

/* 参数控制 */
.ctrl-row {
  margin-bottom: 14px;

  label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: #475569;
    margin-bottom: 6px;
  }

  .ctrl-input {
    display: flex;
    align-items: center;
    gap: 12px;

    :deep(.el-slider) {
      flex: 1;
    }

    :deep(.el-input-number) {
      width: 90px;
    }

    .unit-x {
      color: #94a3b8;
    }
  }
}

/* CSS 输出 */
.css-output {
  margin: 0 0 12px;
  padding: 14px;
  background: #0f172a;
  border-radius: 10px;
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  font-size: 12.5px;
  line-height: 1.7;
  color: #e2e8f0;
  overflow-x: auto;
  max-height: 320px;

  code {
    white-space: pre;
  }
}

.copy-full {
  width: 100%;
}

@media (max-width: 1024px) {
  .sd-body {
    grid-template-columns: 1fr;
  }
}
</style>
