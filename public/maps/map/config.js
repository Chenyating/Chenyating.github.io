export const config = {
  tooltip: {
    show: true,
    formatter: function(params) {
      if (params.data) {
        return `${params.name}<br/>销售额: ${params.data.value}<br/>收入: ${params.data.income}`
      }
      return params.name
    }
  },
  // graphic 配置将由 Vue 组件动态控制
  graphic: {
    elements: []
  },
  grid: {
    left: '0%',
    right: '0%',
    top: '0%',
    bottom: '0%',
    width: '100%',
    height: '100%',
  },
  series: [
    {
      name: '区域',
      type: 'map',
      map: '地图',
      data: [],
      zoom: 1.2,
      roam: true,
      top: '0%',
      label: {
        show: false,
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 12,
          color: 'red'
        }
      }
    },
  ],
}
