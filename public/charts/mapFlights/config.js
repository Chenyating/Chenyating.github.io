import * as d3 from 'd3-geo'
import chinaGeo from '@/assets/geo/CHN.json'
import centers from '@/assets/data/centers.json'

function addFlights() {
  const flightCount = 50
  const data = []
  const start = []
  const end = []
  const n = centers.length
  for (let i = 0; i < flightCount; i++) {
    let fromIdx = Math.floor(Math.random() * n)
    let toIdx = Math.floor(Math.random() * n)
    while (toIdx === fromIdx) {
      toIdx = Math.floor(Math.random() * n)
    }
    const from = centers[fromIdx]
    const to = centers[toIdx]
    data.push([
      [from[0], from[1]],
      [to[0], to[1]],
    ])
    start.push([from[0], from[1], 10])
    end.push([to[0], to[1], 20])
  }
  return {
    data: data,
    start: start,
    end: end,
  }
} // 地图配置
export const config = {
  global: true,
  tooltip: {
    show: true,
  },
  geo3D: {
    map: '中国',
    zlevel: -10,
    boxWidth: 100,
    boxHeight: 5, // 4:没有bar. 30:有bar,bar最高度30，按比例分配高度
    regionHeight: 3,
    shading: 'realistic', // 启用 realistic shading
    itemStyle: {
      color: '#fff',
      opacity: 1,
      borderWidth: 2,
      borderColor: '#79bbff',
    },
    realisticMaterial: {
      detailTexture: '/mountain.png', // 使用正确的纹理路径
      roughness: 1, // 调整粗糙度，让效果更明显
      textureTiling: 1, // 正向平铺，不重复纹理
    },
    emphasis: {
      label: {
        show: true,
        color: '#ffffff', // 直接设置 label 颜色
        fontWeight: '1000',
        backgroundColor: '#000000',
      },
      borderColor: '#79bbff',
      borderWidth: 2,
      itemStyle: {
        color: '#fff',
      },
    },
    light: {
      main: {
        shadow: true,
        shadowQuality: 'ultra',
        intensity: 1,
        alpha: 40,
        beta: 300,
      },
    },
    viewControl: {
      projection: 'perspective',
      autoRotate: false,
      // damping: 0,
      rotateSensitivity: 1, // 旋转操作的灵敏度
      rotateMouseButton: 'left', // 旋转操作使用的鼠标按键
      zoomSensitivity: 1, // 缩放操作的灵敏度
      panSensitivity: 1, // 平移操作的灵敏度
      // panMouseButton: 'right', // 平移操作使用的鼠标按键

      distance: 100, // 默认视角距离主体的距离
      center: [0, 0, 0],
    },
  },
  series: [
    {
      type: 'lines3D',
      coordinateSystem: 'geo3D',
      effect: {
        show: true,
        period: 4, //特效动画的时间，单位为 s
        trailLength: 0.2, //特效尾迹的长度。0~1数值越大尾迹越长
        color: '#fde2e2',
        symbol: 'arrow', //箭头图标
        symbolSize: 20, //图标大小
        curveness: 3,
      },
      lineStyle: {
        normal: {
          color: '#fde2e2',
          width: 2,
        },
      },
      blendMode: 'lighter',
      data: addFlights().data,
    },
    // 补充起点坐标点
    {
      type: 'effectScatter3D',
      coordinateSystem: 'geo3D',
      symbolSize: 6,
      itemStyle: {
        color: '#ff5722',
      },
      data: addFlights().start,
      name: '起点',
    },
    // 补充终点坐标点
    {
      type: 'effectScatter3D',
      coordinateSystem: 'geo3D',
      symbolSize: 6,
      itemStyle: {
        color: '#2196f3',
      },
      data: addFlights().end,
      name: '终点',
    },
  ],
}
