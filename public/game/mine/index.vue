<template>
  <LayoutTool>
    <el-form style="width: 300px;">
      <el-form-item label="宽度">
        <el-input v-model="width" placeholder="宽度" />
      </el-form-item>
      <el-form-item label="炸弹数量">
        <el-input v-model="bombNum" placeholder="炸弹数量" />
      </el-form-item>
      <el-button type="primary" @click="beginMine">重新开始</el-button>
    </el-form>
    <div class="mine" id="app">
      <div class="tip">{{ text }}</div>
      <div v-if="ifbegin">
        <div class="y" v-for="n in height - 2" v-show="all.length" :key="n">
          <!-- x值 -->
          <div class="boom" v-for="m in width - 2" v-show="all[n - 1]" @click="click(n, m)" :key="m">
            <div class="boom-pre" :class="{
                  leftout: all[n][m][1] >= 0,
                  isboom: all[n][m][0] == 2,
                }"></div>
            <div class="boom-next" :class="{
                  leftin: all[n][m][1] >= 0,
                  isboom: all[n][m][0] == 2,
                }">
              {{ all[n][m][1] != 0 ? all[n][m][1] : "" }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </LayoutTool>
</template>

<script setup lang="ts">
import LayoutTool from '../../component/layoutTool.vue'
import { ref, reactive, onMounted, nextTick } from 'vue'

// 响应式数据
const width = ref(12)
const height = ref(12)
const all = ref<any[][]>([])
const bomb = ref(0)
const num = ref(0)
const bombNum = ref(10)
const ifboom = ref(false)
const text = ref("休息一下玩个扫雷吧～")
const ifbegin = ref(false)

// 点击空白
const click = (x: number, y: number) => {
  if (ifboom.value) {
    ifboom.value = false
    randomBegin(20)
    return
  }
  if (all.value[x][y][0] == 1) {
    showBomb()
    console.log("你踩到雷啦！")
    text.value = "踩到雷雷了哦，点击再来一次吧。"
    ifboom.value = true
    return
  } else {
    ifOk()
    andThen(x, y)
  }
}

const andThen = (x: number, y: number) => {
  ifOk()
  if (all.value[x][y][0] == 1 || all.value[x][y][1] > -1) {
    return
  }
  num.value = 0
  try {
    if (all.value[x - 1][y - 1][0] == 1) {
      num.value += 1
    }
    if (all.value[x - 1][y][0] == 1) {
      num.value += 1
    }
    if (all.value[x - 1][y + 1][0] == 1) {
      num.value += 1
    }
    if (all.value[x][y - 1][0] == 1) {
      num.value += 1
    }
    if (all.value[x][y][0] == 1) {
      return
    }
    if (all.value[x][y + 1][0] == 1) {
      num.value += 1
    }
    if (all.value[x + 1][y - 1][0] == 1) {
      num.value += 1
    }
    if (all.value[x + 1][y][0] == 1) {
      num.value += 1
    }
    if (all.value[x + 1][y + 1][0] == 1) {
      num.value += 1
    }
    
    // 更新数组
    all.value[x][y][1] = num.value
    
    if (num.value == 0) {
      andThen(x - 1, y - 1)
      andThen(x - 1, y)
      andThen(x - 1, y + 1)
      andThen(x, y - 1)
      andThen(x, y + 1)
      andThen(x + 1, y - 1)
      andThen(x + 1, y)
      andThen(x + 1, y + 1)
    } else {
      ifOk()
      return
    }
  } catch (error) {}
  ifOk()
}

// 开始随机游戏
const randomBegin = (bombNumber: number) => {
  text.value = "扫雷，准备好了吗？开始咯～"

  bombNum.value = bombNumber
  bomb.value = 0
  for (let i = 0; i < height.value; i++) {
    for (let j = 0; j < width.value; j++) {
      all.value[i][j][0] = 0
      all.value[i][j][1] = -1
    }
  }
  nextTick(() => {
    random()
  })
}

// 随便上色
const random = () => {
  let a, b
  a = Math.floor(Math.random() * (height.value - 2) + 1)
  b = Math.floor(Math.random() * (width.value - 2) + 1)
  if (bomb.value < bombNum.value) {
    // 如果这个数炸弹，那么重新随机
    if (all.value[a][b][0] == 1) {
      random()
    }
    // 否则给他设置为炸弹
    else {
      bomb.value = bomb.value + 1
      all.value[a][b][0] = 1
      random()
    }
  } else {
    return
  }
}

const ifOk = () => {
  if (ifboom.value) {
    ifboom.value = false
    randomBegin(20)
    return
  }
  let lastNum = 0
  for (let i = 1; i < height.value - 1; i++) {
    for (let j = 1; j < width.value - 1; j++) {
      if (all.value[i][j][1] == -1) {
        lastNum += 1
      }
    }
  }
  if (lastNum == bombNum.value) {
    showBomb()
    ifboom.value = true
    console.log("完全没有踩到地雷，你好棒棒哦")
    text.value = "完全没有踩到地雷，你好棒棒哦，还来吗？"
  }
}

const showBomb = () => {
  for (let i = 1; i < height.value - 1; i++) {
    for (let j = 1; j < width.value - 1; j++) {
      if (all.value[i][j][1] == -1 && all.value[i][j][0] == 1) {
        all.value[i][j][0] = 2
      }
    }
  }
}

const beginMine = () => {
  ifbegin.value = true
  height.value = width.value
  init()
  randomBegin(bombNum.value)
}

function init() {
  for (let i = 0; i < height.value; i++) {
    all.value[i] = []
    for (let j = 0; j < width.value; j++) {
      all.value[i][j] = [0, -1]
    }
  }
}
</script>

<style scoped lang="scss">
.tip {
  color: #2e5c77;
  font-size: 16px;
  font-weight: bold;
  border-radius: 1em;
  margin: 1em;
}

.mine {
  top: 2em;
}

.y {
  display: flex;
}

.isboom:before {
  background: pink !important;
  transition: all ease-in 0.3s;
}

.boom {
  height: 30px;
  width: 30px;
  position: relative;
  text-align: center;
  display: inline-block;
  box-sizing: border-box;
  color: #fff;
  font-weight: bold;

  &-pre {
    position: absolute;
    top: 0;
    left: 0;
    transform: rotateY(0deg);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
    width: 100%;
    height: 100%;

    &:before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #c3dae4;
      z-index: -1;
      border: 2px dashed #fff;
      box-sizing: border-box;
      border-radius: 1px;
      transition: all ease-in 0.3s;
    }
  }

  &-next {
    position: absolute;
    top: 0;
    left: 0;
    transform: rotateY(90deg);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1em;
    font-weight: bold;
    width: 100%;
    height: 100%;

    &:before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #c4deaa;
      z-index: -1;
      border: 2px dashed #fff;
      box-sizing: border-box;
      border-radius: 1px;
      transition: all ease-in 0.3s;
    }
  }

  .leftin {
    transition: all ease-in 0.3s 0.3s;
    transform-origin: center center;
    transform: rotateY(0deg) !important;
    z-index: 10;
  }

  .leftout {
    transition: all ease-in 0.3s;
    transform-origin: center center;
    transform: rotateY(90deg);
  }

  .rightout {
    transition: all ease-in 0.3s;
    transform: rotateY(-90deg);
    transform-origin: center center;
  }

  .rightin {
    z-index: 10;
    transform: rotateY(0deg);
    transition: all ease-in 0.3s 0.3s;
    transform-origin: center center;
  }
}

.begin {
  transform: scale(2);
}
</style>
