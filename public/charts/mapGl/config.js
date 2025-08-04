import centers from '@/assets/data/centers.json'

function addthreeDot() {
  var data = []
  for (const center of centers) {
    data.push([center[0], center[1], Math.random() * 10])
  }
  return data
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
      borderWidth: 1,
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
  visualMap: {
    show: true,
    min: 0,
    max: 10,
    inRange: {
      color: ['#67c23a', '#fde2e2', '#95d475', '#79bbff'],
    },
  },
  series: [
    {
      data: addthreeDot(),
      // data: [],
      type: 'bar3D',
      coordinateSystem: 'geo3D',
      barSize: 0.4,
      silent: true,
      tooltip: {
        show: true,
        trigger: 'item',
        position: 'top',
        enterable: false,
      },
    },
  ],
}
