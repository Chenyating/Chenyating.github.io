import centers from '@/assets/data/centers.json'

const processLng = (lng) => {
  if (lng > -30) {
    lng = lng - 180
  } else {
    lng = lng + 180
  }
  return lng
}
// 生成气泡数据
function generateBubbleData() {
  var data = []
  for (const center of centers) {
    data.push({
      name: `城市${Math.floor(Math.random() * 1000)}`,
      value: [processLng(center[0]), center[1], Math.random() * 100 + 20], // [经度, 纬度, 数值]
      itemStyle: {
        color: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.8)`
      }
    })
  }
  return data
}

// 地图配置
export const config = {
  global: true,
  tooltip: {
    show: true,
    trigger: 'item',
    formatter: function(params) {
      if (params.seriesType === 'effectScatter') {
        return `${params.data.name}<br/>数值: ${params.data.value[2]}`
      }
      return params.name
    }
  },
  geo3D: {
    map: '中国',
    zlevel: -10,
    regionHeight: 0,
    shading: 'realistic', // 启用 realistic shading
    itemStyle: {
      opacity: 1,
      borderWidth: 0,
      borderColor: '#79bbff',
    },
    realisticMaterial: {
      detailTexture: '/mountain.png', // 使用正确的纹理路径
      roughness: 1, // 调整粗糙度，让效果更明显
      textureTiling: 1, // 正向平铺，不重复纹理
    },
    emphasis: {
      label: {
        show: false, // 禁用高亮时的标签显示
      },
      borderWidth: 0, // 禁用高亮时的边框宽度
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
      rotateSensitivity: 0, // 禁用旋转操作
      rotateMouseButton: 'left', // 旋转操作使用的鼠标按键
      zoomSensitivity: 0, // 禁用缩放操作
      panSensitivity: 0, // 禁用平移操作
      // panMouseButton: 'right', // 平移操作使用的鼠标按键

      distance: 135, // 默认视角距离主体的距离
      center: [0, 0, 0],
      alpha: 90, // 垂直角度，90度表示平视
      beta: 0,   // 水平角度，0度表示正前方
    },
    enableTouch:false,
    touchZoomRotate:false,
  },
  geo:{
    map: '中国',
    zlevel: 1,
    boxHeight: 5, // 4:没有bar. 30:有bar,bar最高度30，按比例分配高度
    regionHeight: 0,
    silent: true, // 禁用鼠标交互
    itemStyle: {
      color: 'transparent',
      borderColor: 'red',
      borderWidth: 1,
    },
    emphasis: {
      label: {
        show: false, // 禁用高亮时的标签显示
      },
      borderWidth: 0, // 禁用高亮时的边框宽度
      itemStyle: {
        color: 'transparent', // 禁用高亮时的颜色变化
      },
    },
  },
  series: [
    // 添加2D平面气泡效果
    {
      name: '气泡',
      type: 'effectScatter',
      coordinateSystem: 'geo3d',
      data: generateBubbleData(),
      symbolSize: function(val) {
        return Math.sqrt(val[2]) / 3; // 根据数值大小调整气泡大小
      },
      showEffectOn: 'render',
      rippleEffect: {
        brushType: 'stroke'
      },
      hoverAnimation: true,
      label: {
        show: false
      },
      emphasis: {
        scale: true
      },
      zlevel: 10
    }
  ],
}
