import { resetMapColor } from '@/utils/map'

var infoData = [
  {
    regionalInfo: {
      adcode: 110000,
      name: '河南省',
      position: [91.718289, 27.279837],
    },
    income: 375,
    sale: 903,
  },
  {
    regionalInfo: {
      adcode: 110000,
      name: '上海',
      position: [110.605944, 49.826165],
    },
    income: 775,
    sale: 76,
  },
  {
    regionalInfo: {
      adcode: 110000,
      name: '黑龙江省',
      position: [88.836346, 33.848883],
    },
    income: 578,
    sale: 756,
  },
  {
    regionalInfo: {
      adcode: 110000,
      name: '广西壮族自治区',
      position: [87.398764, 41.716218],
    },
    income: 926,
    sale: 754,
  },
  {
    regionalInfo: {
      adcode: 110000,
      name: '湖南省',
      position: [91.149733, 37.058153],
    },
    income: 937,
    sale: 68,
  },
  {
    regionalInfo: {
      adcode: 110000,
      name: '河南省',
      position: [117.152424, 42.824506],
    },
    income: 722,
    sale: 268,
  },
  {
    regionalInfo: {
      adcode: 110000,
      name: '湖北省',
      position: [108.760833, 46.424441],
    },
    income: 767,
    sale: 963,
  },
  {
    regionalInfo: {
      adcode: 110000,
      name: '黑龙江省',
      position: [91.567958, 45.174416],
    },
    income: 619,
    sale: 705,
  },
  {
    regionalInfo: {
      adcode: 110000,
      name: '福建省',
      position: [81.576007, 50.310248],
    },
    income: 414,
    sale: 510,
  },
  {
    regionalInfo: {
      adcode: 110000,
      name: '云南省',
      position: [89.154294, 36.471146],
    },
    income: 17,
    sale: 747,
  },
]
// 数据，指标：值，维度：区域
var data = resetMapColor(infoData, 'sale', 'regionalInfo')

// 地图配置
export const config = {
  tooltip: {
    show: true,
  },
  visualMap: {
    min: 5,
    max: 100,
    realtime: true,
    calculable: true,
    inRange: {
      color: ['#dbac00', '#db6e00', '#cf0000'],
    },
  },
  series: [
    {
      name: '区域',
      type: 'map',
      map: 'svg',
      data: data,
      zoom: 1.2,
      label: {
        show: true,
        color: '#000',
      },
    },
  ],
}
