import { resetMapColor } from '@/utils/map'

var infoData = [
  {
    fromRegionalInfo: {
      adcode: 440100,
      name: '广州',
      position: [113.264385, 23.12911],
    },
    toRegionalInfo: {
      adcode: 350100,
      name: '福州',
      position: [119.296482, 26.074508],
    },
    income: 100,
  },
  {
    fromRegionalInfo: {
      adcode: 440100,
      name: '广州',
      position: [113.264385, 23.12911],
    },
    toRegionalInfo: {
      adcode: 350200,
      name: '厦门',
      position: [118.11022, 24.490474],
    },
    income: 100,
  },
  {
    fromRegionalInfo: {
      adcode: 440400,
      name: '珠海',
      position: [113.576206, 22.270718],
    },
    toRegionalInfo: {
      adcode: 350400,
      name: '三明',
      position: [117.642536, 26.269892],
    },
    income: 100,
  },
  {
    fromRegionalInfo: {
      adcode: 440700,
      name: '韶关',
      position: [113.594461, 24.804072],
    },
    toRegionalInfo: {
      adcode: 350500,
      name: '泉州',
      position: [118.58941, 24.901652],
    },
    income: 100,
  },
  {
    fromRegionalInfo: {
      adcode: 440800,
      name: '惠州',
      position: [114.41398, 23.11354],
    },
    toRegionalInfo: {
      adcode: 350600,
      name: '漳州',
      position: [117.66115, 24.510897],
    },
    income: 100,
  },
  {
    fromRegionalInfo: {
      adcode: 441200,
      name: '肇庆',
      position: [112.472529, 23.046701],
    },
    toRegionalInfo: {
      adcode: 350700,
      name: '南平',
      position: [118.181883, 27.333268],
    },
    income: 100,
  },
  {
    fromRegionalInfo: {
      adcode: 441900,
      name: '江门',
      position: [113.081611, 22.589747],
    },
    toRegionalInfo: {
      adcode: 350800,
      name: '龙岩',
      position: [117.027885, 25.096153],
    },
    income: 100,
  },
  {
    fromRegionalInfo: {
      adcode: 440600,
      name: '佛山',
      position: [113.12144, 23.02148],
    },
    toRegionalInfo: {
      adcode: 350900,
      name: '宁德',
      position: [119.527084, 26.655571],
    },
    income: 100,
  },
  {
    fromRegionalInfo: {
      adcode: 440500,
      name: '汕头',
      position: [116.7102, 23.3716],
    },
    toRegionalInfo: {
      adcode: 351000,
      name: '莆田',
      position: [119.00743, 25.43197],
    },
    income: 100,
  },
  {
    fromRegionalInfo: {
      adcode: 441800,
      name: '清远',
      position: [113.001826, 23.688185],
    },
    toRegionalInfo: {
      adcode: 351100,
      name: '沙县',
      position: [117.803333, 26.723055],
    },
    income: 100,
  },
  {
    fromRegionalInfo: {
      adcode: 445100,
      name: '潮州',
      position: [116.622888, 23.66194],
    },
    toRegionalInfo: {
      adcode: 351200,
      name: '永安',
      position: [117.371075, 25.9014],
    },
    income: 100,
  },
]
// 数据，指标：值，维度：区域
// 地图配置
export const config = {
  grid: {
    left: '0%',
    right: '0%',
    top: '0%',
    bottom: '0%',
    width: '100%',
    height: '100%',
  },
  tooltip: {},
  xAxis: {
    type: 'value',
    position: 'top', // 将x轴放置在顶部
    max: 500,
    // show: false,
  },
  yAxis: {
    type: 'value',
    position: 'left', // 将y轴放置在左侧
    max: 300,
    inverse: true, // 使 y 轴的值从上到下递增
    // show: false,
  },
  series: [
    {
      large: true,
      largeThreshold: 500,
      progressive: 200,
      progressiveThreshold: 500,
      sampling: 'average',
      type: 'graph',
      layout: 'none',
      coordinateSystem: 'cartesian2d',
      label: {
        show: true,
        position: 'bottom',
        color: '#6F7079',
        fontSize: 12,
      },
      symbol: 'pin',
      edgeSymbol: ['circle', 'arrow'],
      symbolSize: 30,
      edgeSymbolSize: [4, 10],
      data: [], //要去重！否则会报错
      itemStyle: {
        color: '#F4E925',
      },
      links: [], //要去重！否则会报错
      lineStyle: {
        color: '#1890FF',
        curveness: 0.3,
        width: 5,
        opacity: 1,
      },
      emphasis: {
        focus: 'adjacency',
        lineStyle: {
          width: 10,
        },
      },
      selectedMode: true,
      select: {
        lineStyle: {
          color: 'red',
        },
      },
      autoCurveness: true,
      tooltip: {
        formatter: (params) => {
          return params.dataType == 'node' ? params.name : '线段内容'
        },
      },
    },
  ],
}
