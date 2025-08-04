// 饼图3D配置项生成函数
// 传入饼图数据和内径比例，返回ECharts 3D饼图的option配置
export function getPie3DOption(
  // 饼图数据，包含名称、数值和样式
  pieData = [
    { name: 'A', value: 9000, color: '#91daff' },
    { name: 'B', value: 5623, color: '#5af3b8' },
    { name: 'C', value: 1116, color: '#4d74ff' },
    { name: 'D', value: 800, color: '#ffaaff' },
    { name: 'E', value: 8000, color: '#ffff' },
  ],
  // 内径比例，控制3D饼图的空心大小，取值范围0~1，越大空心越大
  internalDiameterRatio = 0.8
) {
  // 浮点数格式化函数，保留n位小数
  // @param num 需要格式化的数字
  // @param n 保留的小数位数
  // @return 返回格式化后的字符串
  function fomatFloat(num, n) {
    let f = parseFloat(num)
    if (isNaN(f)) return '0.00'
    f = Math.round(num * Math.pow(10, n)) / Math.pow(10, n)
    let s = f.toString()
    let rs = s.indexOf('.')
    if (rs < 0) {
      rs = s.length
      s += '.'
    }
    while (s.length <= rs + n) s += '0'
    return s
  }
  // 获取3D饼图的参数方程，用于生成3D表面
  // @param startRatio 扇区起始比例（0~1）
  // @param endRatio 扇区结束比例（0~1）
  // @param k 内外径比例，决定空心大小
  // @param h 扇区高度（可用作厚度或百分比）
  // @return 返回参数方程对象，供ECharts 3D surface使用
  function getParametricEquation(
    startRatio, // 扇区起始比例
    endRatio, // 扇区结束比例
    k, // 内外径比例
    h // 扇区高度
  ) {
    let startRadian = startRatio * Math.PI * 2 // 起始弧度
    let endRadian = endRatio * Math.PI * 2 // 结束弧度
    return {
      // u, v 为参数方程变量
      u: { min: -Math.PI, max: Math.PI * 3, step: Math.PI / 32 },
      v: { min: 0, max: Math.PI * 2, step: Math.PI / 20 },
      // x坐标方程，决定饼图在x轴的形状
      x: function (u, v) {
        if (u < startRadian)
          return Math.cos(startRadian) * (1 + Math.cos(v) * k)
        if (u > endRadian) return Math.cos(endRadian) * (1 + Math.cos(v) * k)
        return Math.cos(u) * (1 + Math.cos(v) * k)
      },
      // y坐标方程，决定饼图在y轴的形状
      y: function (u, v) {
        if (u < startRadian)
          return Math.sin(startRadian) * (1 + Math.cos(v) * k)
        if (u > endRadian) return Math.sin(endRadian) * (1 + Math.cos(v) * k)
        return Math.sin(u) * (1 + Math.cos(v) * k)
      },
      // z坐标方程，决定厚度和上下表面
      z: function (u, v) {
        if (u < -Math.PI * 0.5) return Math.sin(u)
        if (u > Math.PI * 2.5) return Math.sin(u) * h
        return Math.sin(v) > 0 ? 1 * h : -1
      },
    }
  }

  // ----------- 优化部分开始 -----------
  // 1. pieData参数校验，若不是数组或为空则直接返回
  if (!Array.isArray(pieData) || pieData.length === 0) {
    return
  }
  // 2. 计算内外径比例k，k越大空心越大
  let k = 1 - internalDiameterRatio
  // 3. 按数值从大到小排序，保证大值在下层
  pieData = pieData.slice().sort((a, b) => b.value - a.value)
  // 4. 计算总数值，用于百分比和比例计算
  let sumValue = pieData.reduce((sum, cur) => sum + (cur.value || 0), 0)
  // 5. 构建series和legend
  let series = [] // 存放每个扇区的series配置
  let legendData = [] // 存放图例数据
  let startValue = 0 // 当前扇区起始值
  for (let i = 0; i < pieData.length; i++) {
    let item = pieData[i]
    let endValue = startValue + item.value // 当前扇区结束值
    let startRatio = startValue / sumValue // 当前扇区起始比例
    let endRatio = endValue / sumValue // 当前扇区结束比例
    startValue = endValue // 更新下一个扇区的起始值
    // 百分比保留两位小数
    let percent = sumValue ? fomatFloat(item.value / sumValue, 2) : '0.00'
    legendData.push({ name: item.name, value: percent }) // 图例显示百分比
    // console.log(percent, '===') // 调试用
    // 构建series项，包含3D surface参数方程
    let seriesItem = {
      name: item.name || `series${i}`,
      type: 'surface', // 3D surface类型
      parametric: true, // 启用参数方程
      wireframe: { show: false }, // 不显示网格线
      pieData: {
        ...item,
        startRatio,
        endRatio,
      },
      itemStyle: {
        color: item.color, // 扇区颜色
      },
      parametricEquation: getParametricEquation(
        startRatio,
        endRatio,
        k,
        percent // 这里用百分比作为厚度
      ),
    }
    series.push(seriesItem)
  }
  // 6. 动态计算boxHeight（目前返回1，保留扩展）
  // @param series series数组
  // @param height 期望高度
  // @return 返回3D盒子的高度
  function getHeight3D(series, height) {
    if (!series.length) return 1
    let maxValue = Math.max(...series.map((s) => s.pieData.value || 1))
    // return (height * 25) / maxValue // 可根据最大值动态调整高度
    return 1
  }
  let boxHeight = getHeight3D(series, 1)
  // ----------- 优化部分结束 -----------

  // 返回ECharts 3D饼图的option配置
  return {
    backgroundColor: '#00318b', // 背景色
    legend: {
      data: legendData, // 图例数据
      left: 'center', // 图例居中
      top: 'bottom', // 图例底部
      textStyle: { color: '#fff' }, // 图例文字颜色
      show: true, // 显示图例
    },
    tooltip: {
      show: true, // 显示提示框
      backgroundColor: 'rgba(0,0,0,0.7)', // 提示框背景色
      textStyle: { color: '#fff' }, // 提示框文字颜色
      formatter: function (params) {
        // 自定义提示内容
        if (
          params.componentType === 'series' &&
          params.componentSubType === 'surface'
        ) {
          // console.log(params)
          return `
            <div style='min-width:120px;'>
            哈哈哈哈</div>
          `
        }
        return ''
      },
    },
    labelLine: { show: true, lineStyle: { color: '#7BC0CB' } }, // 标签引导线
    xAxis3D: { min: -1, max: 1 }, // 3D x轴范围
    yAxis3D: { min: -1, max: 1 }, // 3D y轴范围
    zAxis3D: { min: -1, max: 1 }, // 3D z轴范围
    grid3D: {
      show: false, // 不显示3D网格
      boxWidth: 100, // 3D盒子宽度
      boxHeight: 20, // 3D盒子高度
      viewControl: {
        alpha: 20, // 视角仰角
        distance: 130, // 视角距离
        rotateSensitivity: 0, // 禁止旋转
        zoomSensitivity: 0, // 禁止缩放
        panSensitivity: 0, // 禁止平移
        autoRotate: false, // 不自动旋转
      },
    },
    series: series, // 3D饼图series数组
  }
}
