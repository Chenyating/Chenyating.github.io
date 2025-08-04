import earth from '/earth.jpg'
export const config = {
  globe: {
    baseTexture: earth,
    heightTexture: earth,
    displacementScale: 0.01,
    shading: 'realistic',
    displacementQuality :'high',
    realisticMaterial: {
      roughness: 0.9,
    },
    postEffect: {
      enable: true,
    },
    light: {
      main: {
        intensity: 2,
        shadow: true,
      },
      ambient: {
        intensity: 1
      },
    },
    viewControl: {
      targetCoord: [105, 35], // 目标坐标，指向中国
    },
  },
  series: []
}
