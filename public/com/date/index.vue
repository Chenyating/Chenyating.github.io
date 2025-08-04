<template>
  <LayoutTool>
    <el-button type="primary" @click="single = !single"
      >{{ single ? '单' : '双' }}日历</el-button
    >
    <!--组件内容 -->
    <div
      id="calendar"
      class="calendar"
      :class="[single ? 'calendar--single' : 'calendar--double']"
    >
      <div class="calendar-hd">
        <!-- 年份 S-->
        <div class="select-year" v-show="ifshow.year">
          <div class="icon-pre">
            <span @click="subYear" class="icon-pre-d"></span>
          </div>
          <div class="icon-tit">
            <span>{{ headTime.year }}</span>
            <span>-</span>
            <span>{{ headTime.year + 11 }}</span>
          </div>
          <div class="icon-next">
            <span @click="addYear" class="icon-next-d"></span>
          </div>
        </div>
        <!-- 年份 E-->
        <!-- 月份 S-->
        <div class="select-month" v-show="ifshow.month">
          <div class="icon-pre">
            <span @click="preYear" class="icon-pre-d"></span>
          </div>
          <div class="icon-tit">
            <span>{{ headTime.year }}</span>
          </div>
          <div class="icon-next">
            <span @click="nextYear" class="icon-next-d"></span>
          </div>
        </div>
        <!-- 月份 E-->
        <!-- 日期 S-->
        <div class="select-day" v-show="ifshow.day">
          <div class="select-day-left">
            <div class="icon-pre">
              <span @click="preYear" class="icon-pre-d"></span>
              <span @click="preMonth" class="icon-pre-s"></span>
            </div>
            <div class="icon-tit">
              <span @click="showYear(nowTime.year)">{{ nowTime.year }}年</span>
              <span @click="showMonth(nowTime.month)"
                >{{ nowTime.month }}月</span
              >
            </div>
            <div :class="{ hidden: !single }" class="'icon-next'">
              <span @click="nextMonth" class="icon-next-s"></span>
              <span @click="nextYear" class="icon-next-d"></span>
            </div>
          </div>
          <div class="select-day-right" v-if="!single">
            <div class="icon-pre hidden">
              <span @click="preYear" class="icon-pre-d"></span>
              <span @click="preMonth" class="icon-pre-s"></span>
            </div>
            <div class="icon-tit">
              <span @click="showYear(nextTime.year)"
                >{{ nextTime.year }}年</span
              >
              <span @click="showMonth(nextTime.month)"
                >{{ nextTime.month }}月</span
              >
            </div>
            <div class="icon-next">
              <span @click="nextMonth" class="icon-next-s"></span>
              <span @click="nextYear" class="icon-next-d"></span>
            </div>
          </div>
        </div>
        <!-- 日期 E-->
      </div>
      <div class="calendar-bd">
        <!-- 年份 S-->
        <div class="calendar-year" v-show="ifshow.year">
          <span
            @click="selectYear(headTime.year + index)"
            :class="{ cur: selectTime.year === headTime.year + index }"
            v-for="(id, index) in 12"
            :key="index + '年'"
            >{{ headTime.year + index }}</span
          >
        </div>
        <!-- 年份 E-->
        <!-- 月份 S-->
        <div class="calendar-month" v-show="ifshow.month">
          <span
            @click="selectMonth(month)"
            :class="{ cur: selectTime.month === month }"
            v-for="month in 12"
            :key="month + '月'"
            >{{ month }}月</span
          >
        </div>
        <!-- 月份 E-->
        <!-- 日期 S-->
        <div class="calendar-day" v-show="ifshow.day">
          <!-- 日期左 S-->
          <div class="calendar-day-left">
            <span v-for="week in weekTit" :key="week">{{ week }}</span>
            <span
              :class="{ disabled: '' }"
              class="day-pre"
              v-for="day in preTime.showDays"
              :key="'pre' + day"
              >{{ preTime.days - preTime.showDays + day }}</span
            >
            <span
              @click="selectDay(nowTime.year, nowTime.month, day)"
              @mouseenter="mouseDay(nowTime.year, nowTime.month, day)"
              :class="curClass(nowTime.year, nowTime.month, day)"
              class="day-now"
              v-for="day in nowTime.days"
              :key="'now' + day"
              >{{ day }}</span
            >
            <span
              class="day-next"
              v-for="day in nextTime.showDays"
              :key="'next' + day"
              >{{ day }}</span
            >
          </div>
          <!-- 日期左 E-->
          <!-- 日期右 S-->
          <div class="calendar-day-right" v-if="!single">
            <span v-for="week in weekTit" :key="week">{{ week }}</span>
            <span
              :class="{ disabled: '' }"
              class="day-pre"
              v-for="day in nowTime.showDays"
              :key="'pre1' + day"
              >{{ nowTime.days - nowTime.showDays + day }}</span
            >
            <span
              @click="selectDay(nextTime.year, nextTime.month, day)"
              @mouseenter="mouseDay(nextTime.year, nextTime.month, day)"
              :class="curClass(nextTime.year, nextTime.month, day)"
              class="day-now"
              v-for="day in nextTime.days"
              :key="'now' + day"
              >{{ day }}</span
            >
            <span
              class="day-next"
              v-for="day in next2Time.showDays"
              :key="'next1' + day"
              >{{ day }}</span
            >
          </div>
          <!--日期右 E-->
          <!-- 日期 E-->
        </div>
      </div>
    </div>
    <el-divider />
    <div>
      开始时间：{{ startTime.year }}-{{ startTime.month }}-{{ startTime.day }}
    </div>
    <div>
      结束时间：{{ endTime.year }}-{{ endTime.month }}-{{ endTime.day }}
    </div>
  </LayoutTool>
</template>

<script setup lang="ts">
import LayoutTool from '../../component/layoutTool.vue'
import {
  ref,
  reactive,
  computed,
  onMounted,
  defineProps,
  defineEmits,
} from 'vue'

// Props
const props = defineProps({
  year: {
    type: Number,
    default: new Date().getFullYear(),
  },
  month: {
    type: Number,
    default: new Date().getMonth() + 1,
  },
  single: {
    type: Boolean,
    default: false,
  },
})

const single = ref(false)

// Emits
const emit = defineEmits(['getATime', 'getDTime'])

// Reactive data
const weekTit = ref(['日', '一', '二', '三', '四', '五', '六'])

// 标题选择的年月
const selectTime = reactive({
  year: props.year,
  month: props.month,
})

// 标题时间
const headTime = reactive({
  year: props.year,
  month: props.month,
})

// 上月
const preTime = reactive({})

// 当前月
const nowTime = reactive({})

// 下月
const nextTime = reactive({})

// 下下月
const next2Time = reactive({})

// 选择起始时间
const startTime = reactive({
  year: null as number | null,
  month: null as number | null,
  day: null as number | null,
  selected: false,
})

const endTime = reactive({
  year: null as number | null,
  month: null as number | null,
  day: null as number | null,
  selected: false,
})

// 经过时间
const mouseTime = reactive({
  year: null as number | null,
  month: null as number | null,
  day: null as number | null,
})

// 是否展示年月日的标题和身体
const ifshow = reactive({
  year: false,
  month: false,
  day: true,
})

// Computed
// 上色方法：这个方法判断比较好：直接比较时间大小
const curClass = computed(() => {
  return function (year: number, month: number, day: number) {
    if (startTime.day) {
      const time = {
        year: year,
        month: month,
        day: day,
      }
      return [
        {
          ['cur']: compare(time, startTime) == 0 || compare(time, endTime) == 0,
          ['hover1']: endTime.day
            ? compare(time, startTime) == 1 && compare(time, endTime) == 2
            : mouseTime.day
            ? compare(time, startTime) == 1 && compare(time, mouseTime) == 2
            : false,
        },
      ]
    }
  }
})

// Methods
//转换成毫秒进行比较
const compare = (date1: any, date2: any) => {
  const oDate1 = new Date(`${date1.year}-${date1.month}-${date1.day}`)
  const oDate2 = new Date(`${date2.year}-${date2.month}-${date2.day}`)
  const time1 = oDate1.getTime()
  const time2 = oDate2.getTime()
  if (time1 > time2) {
    return 1
  } else {
    if (time1 == time2) {
      return 0
    }
    return 2
  }
}

//获取当前月份的总天数
const getMonthDays = (year: number, month: number) => {
  const date = new Date(year, month, 0)
  const days = date.getDate()
  return days
}

// 初始化时间
const initTime = () => {
  const nowTime = new Date()
  const nowDay = nowTime.getDate()
  getNowTime(props.year, props.month)
  startTime.year = props.year
  startTime.month = props.month
}

// 每页日历时间
const getNowTime = (year: number, month: number) => {
  // 当前月
  const nowYear = year
  const nowMonth = month
  const nowDays = getMonthDays(nowYear, nowMonth)
  const firstDay = new Date(`${nowYear}=${nowMonth}-1`).getDay()
  Object.assign(nowTime, {
    year: nowYear,
    month: nowMonth,
    days: nowDays,
    firstDay: firstDay,
    showDays: null,
  })

  // 上个月
  const preYear = month == 1 ? year - 1 : year
  const preMonth = month == 1 ? 12 : month - 1
  const preDays = getMonthDays(preYear, preMonth)
  Object.assign(preTime, {
    year: preYear,
    month: preMonth,
    days: preDays,
    showDays: nowTime.firstDay,
  })

  // 下个月
  const nextYear = month == 12 ? year + 1 : year
  const nextMonth = month == 12 ? 1 : month + 1
  const nextDays = getMonthDays(nextYear, nextMonth)
  const nextfirstDay = new Date(`${nextYear}=${nextMonth}-1`).getDay()
  Object.assign(nextTime, {
    year: nextYear,
    month: nextMonth,
    firstDay: nextfirstDay,
    days: nextDays,
    showDays: 42 - nowTime.days - preTime.showDays,
  })
  nowTime.showDays = nextTime.firstDay

  // 下下个月
  const next2Year = nextMonth == 12 ? nextYear + 1 : nextYear
  const next2Month = nextMonth == 12 ? 1 : nextMonth + 1
  const next2Days = getMonthDays(next2Year, next2Month)
  Object.assign(next2Time, {
    year: next2Year,
    month: next2Month,
    days: next2Days,
    showDays: 42 - nowTime.showDays - nextTime.days,
  })

  Object.assign(headTime, {
    year: year,
    month: month,
  })
}

// 日期按钮操作
const preYear = () => {
  const preYear = nowTime.year - 1
  getNowTime(preYear, nowTime.month)
}

const nextYear = () => {
  const nextYear = nowTime.year + 1
  getNowTime(nextYear, nowTime.month)
}

const preMonth = () => {
  const preYear = nowTime.month == 1 ? nowTime.year - 1 : nowTime.year
  const preMonth = nowTime.month == 1 ? 12 : nowTime.month - 1
  getNowTime(preYear, preMonth)
}

const nextMonth = () => {
  const nextYear = nowTime.month == 12 ? nowTime.year + 1 : nowTime.year
  const nextMonth = nowTime.month == 12 ? 1 : nowTime.month + 1
  getNowTime(nextYear, nextMonth)
}

const subYear = () => {
  headTime.year -= 11
}

const addYear = () => {
  headTime.year += 11
}

// 选择时间
const selectYear = (year: number) => {
  selectTime.year = year
  headTime.year = year
  getNowTime(headTime.year, headTime.month)
  Object.assign(ifshow, {
    year: false,
    month: false,
    day: true,
  })
}

const selectMonth = (month: number) => {
  selectTime.month = month
  headTime.month = month
  getNowTime(headTime.year, headTime.month)
  Object.assign(ifshow, {
    year: false,
    month: false,
    day: true,
  })
}

const selectDay = (year: number, month: number, day: number) => {
  if (props.single) {
    Object.assign(startTime, {
      year: year,
      month: month,
      day: day,
      selected: true,
    })
    emit('getATime', startTime)
    console.log('单选时间为', startTime.year, startTime.month, startTime.day)
    return
  }
  // 经过区域初始化
  if (startTime.selected && endTime.selected) {
    Object.assign(startTime, {
      year: year,
      month: month,
      day: day,
      selected: true,
    })
    Object.assign(endTime, {
      year: null,
      month: null,
      day: null,
      selected: false,
    })
    // 经过区域初始化
    Object.assign(mouseTime, {
      year: year,
      month: month,
      day: day,
    })
  } else {
    if (!startTime.selected) {
      Object.assign(startTime, {
        year: year,
        month: month,
        day: day,
        selected: true,
      })
      endTime.selected = false
    } else {
      // 第二个日期要大于第一个日期
      const time = {
        year: year,
        month: month,
        day: day,
      }
      if (compare(time, startTime) == 1) {
        Object.assign(endTime, {
          year: year,
          month: month,
          day: day,
          selected: true,
        })
        emit('getDTime', startTime, endTime)
        console.log('终选的日期是：', endTime.year, endTime.month, endTime.day)
        console.log(
          '所选日期为：',
          `${startTime.year}-${startTime.month}-${startTime.day}——${endTime.year}-${endTime.month}-${endTime.day}`
        )
      } else {
        Object.assign(startTime, {
          year: year,
          month: month,
          day: day,
          selected: true,
        })
        endTime.selected = false
        // 经过区域初始化
        Object.assign(mouseTime, {
          year: year,
          month: month,
          day: day,
        })
        console.log(
          '重新首选的日期是：',
          startTime.year,
          startTime.month,
          startTime.day
        )
      }
    }
  }
}

// 展示选项
const showYear = (year: number) => {
  headTime.year = year
  Object.assign(ifshow, {
    year: true,
    month: false,
    day: false,
  })
}

const showMonth = (month: number) => {
  headTime.month = month
  Object.assign(ifshow, {
    year: false,
    month: true,
    day: false,
  })
}

// 经过日期
const mouseDay = (year: number, month: number, day: number) => {
  if (props.single) {
    return
  }
  if (startTime.selected && !endTime.selected) {
    const time = {
      year: year,
      month: month,
      day: day,
    }
    if (compare(time, startTime) == 1) {
      Object.assign(mouseTime, {
        year: year,
        month: month,
        day: day,
      })
    } else {
      Object.assign(mouseTime, {})
    }
  }
}

// Lifecycle
onMounted(() => {
  initTime()
})
</script>

<style scoped lang="scss">
$width-icon: 15px;
$width-block: 30px;
$font-default: 14px;
$font-hover: #f56c6c;
$calendar-bg: #fff;
$calendar-text: #000;
$calendar-border: #f56c6c;
$calendar-hover: #fab6b6;
$calendar-cur: #f56c6c;
$calendar-disabled: #b3b3b3;
.calendar {
  margin: 10px;
  background-color: $calendar-bg;
  color: black;
  font-family: Microsoft YaHei;

  .hidden {
    visibility: hidden;
  }

  &--single {
    width: $width-block * 7 !important;
  }

  &--double {
    width: $width-block * 14 !important;
  }

  &-hd {
    font-size: $font-default;
    line-height: $font-default;

    .select {
      &-year {
        display: flex;
        justify-content: space-between;
        align-items: center;
        white-space: nowrap;
      }

      &-month {
        display: flex;
        justify-content: space-between;
        align-items: center;
        white-space: nowrap;
      }

      &-day {
        &-left,
        &-right {
          width: $width-block * 7;
          display: flex;
          justify-content: space-between;
          align-items: center;
          white-space: nowrap;
        }

        display: flex;
        justify-content: space-between;
        align-items: center;
        white-space: nowrap;
      }
    }

    .icon {
      &-tit {
        span {
          cursor: pointer;
          font-size: $font-default;
          font-weight: bold;

          &:hover {
            color: $font-hover;
          }
        }
      }
      &-pre {
        &-d {
          width: $width-icon;
          height: $width-icon;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          position: relative;
          &::before {
            content: '';
            position: absolute;
            border: 1px solid $calendar-border;
            width: 50%;
            height: 50%;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            margin: auto;
            border-left: none;
            border-top: none;
            transform: rotate(135deg);
          }
          &::after {
            content: '';
            position: absolute;
            border: 1px solid $calendar-border;
            width: 50%;
            height: 50%;
            top: 0;
            bottom: 0;
            left: 50%;
            right: 0;
            margin: auto;
            border-left: none;
            border-top: none;
            transform: rotate(135deg);
          }
        }

        &-s {
          width: $width-icon;
          height: $width-icon;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          position: relative;
          &::before {
            content: '';
            position: absolute;
            border: 1px solid $calendar-border;
            width: 50%;
            height: 50%;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            margin: auto;
            border-left: none;
            border-top: none;
            transform: rotate(135deg);
          }
        }
      }
      &-next {
        &-d {
          width: $width-icon;
          height: $width-icon;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          position: relative;
          &::before {
            content: '';
            position: absolute;
            border: 1px solid $calendar-border;
            width: 50%;
            height: 50%;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            margin: auto;
            border-left: none;
            border-top: none;
            transform: rotate(-45deg);
          }
          &::after {
            content: '';
            position: absolute;
            border: 1px solid $calendar-border;
            width: 50%;
            height: 50%;
            top: 0;
            bottom: 0;
            left: 50%;
            right: 0;
            margin: auto;
            border-left: none;
            border-top: none;
            transform: rotate(-45deg);
          }
        }

        &-s {
          width: $width-icon;
          height: $width-icon;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          position: relative;
          &::before {
            content: '';
            position: absolute;
            border: 1px solid $calendar-border;
            width: 50%;
            height: 50%;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            margin: auto;
            border-left: none;
            border-top: none;
            transform: rotate(-45deg);
          }
        }
      }
    }
  }

  &-bd {
    font-size: $font-default;
    .calendar {
      &-day {
        box-sizing: content-box;
        justify-content: space-between;
        width: 100%;
        display: flex;

        &-left,
        &-right {
          display: inline-block;
          width: $width-block * 7;
          display: grid;
          grid-template-columns: repeat(7, 1fr);
        }

        &-right {
          border-left: 1px solid $calendar-border;
          position: relative;
        }

        span {
          width: $width-block;
          height: $width-block;
          line-height: $width-block;
          display: inline-block;
          text-align: center;
          cursor: default;
        }

        .disabled {
          background-color: $calendar-disabled;
          pointer-events: none;
        }

        .day {
          &-pre,
          &-next {
            color: $calendar-disabled;
          }

          &-now {
            cursor: pointer;

            &:hover {
              background-color: $calendar-hover;
              color: #ffffff;
            }

            // 选中状态
            &.cur {
              background-color: $calendar-cur;
              color: #ffffff;

              &:hover {
                background-color: $calendar-cur;
                color: #ffffff;
              }
            }

            // 选第二个时间hover态
            &.hover1 {
              background-color: $calendar-hover;
              color: #ffffff;
            }

            // 两个时间之间选中hover态
            &.hover2 {
              background-color: $calendar-hover;
              color: #ffffff;
            }
          }
        }
      }

      &-month,
      &-year {
        height: $width-block * 7;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-around;
        align-items: center;

        span {
          width: $width-block * 3;
          height: $width-block;
          line-height: $width-block;
          display: inline-block;
          text-align: center;
          cursor: pointer;

          &:hover {
            background-color: $calendar-hover;
            color: #ffffff;
          }

          &.cur {
            background-color: $calendar-cur;
            color: #ffffff;

            &:hover {
              background-color: $calendar-cur;
              color: #ffffff;
            }
          }
        }
      }
    }
  }
}
</style>
