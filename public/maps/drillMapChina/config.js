export const config = {
  tooltip: {
    show: true,
    trigger: 'item',
  },
  visualMap: {
    show: true,
    orient: 'horizontal',
    inRange: {
      // 渐变颜色，从小到大
      color: ['#f0faff', '#6d8cb3'],
    },
  },
  series: [
    {
      name: '区域',
      type: 'map',
      map: '中国',
      data:[],
      selectedMode: false,
      zoom: 1.2,
      geoIndex: 1,
      // 区块提示样式
      tooltip: {
        show: true,
        backgroundColor: '#fff',
        borderColor: '#1890ff',
        textStyle: {
          color: '#6F7079',
          fontSize: 12,
        },
      },
      // 区块高亮
      emphasis: {
        disabled: false,
        label: {
          color: '#fff',
          fontSize: 12,
        },
        itemStyle: {
          areaColor: '#1890ff',
          shadowColor: '#fff',
          borderWidth: 1,
        },
      },
      // 区块样式
      itemStyle: {
        borderColor: '#d9d9d9',
        borderWidth: 1,
        areaColor: {
          type: 'radial',
          x: 0.5,
          y: 0.5,
          r: 0.8,
          colorStops: [
            {
              offset: 0,
              color: '#BBBBBB', // 0% 处的颜色
            },
            {
              offset: 1,
              color: '#BBBBBB', // 100% 处的颜色
            },
          ],
          globalCoord: false,
        },
        shadowColor: '#ffffff',
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        shadowBlur: 0,
      },
    },
  ],
}
