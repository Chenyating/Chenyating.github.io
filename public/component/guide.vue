<template>
  <div class="guide-title">工具指南</div>
  <div class="guide-item" v-for="(item, index) in guideList" :key="index">
    <div class="guide-item-title" @click="goItemGuide(item)">
      {{ item.title }}
      <cube-icon
        v-show="item.link"
        name="cube-share-outline"
        size="1.2rem"
        color="var(--el-color-primary)"
      />
    </div>
    <div v-if="item.desc" class="guide-item-desc">{{ item.desc }}</div>
  </div>
</template>
<script setup lang="ts">
const props: any = defineProps({
  guideList: {
    type: Object,
    required: true,
  },
})
function goItemGuide(item) {
  if (item.link) {
    window.open(item.link)
  }
}
</script>
<style scoped lang="scss">
.guide {
  &-title {
    font-size: 28px;
    text-align: center;
    margin-top: 100px;
  }
  &-item {
    border-bottom: var(--tools-navbar-border-width) solid var(--tools-navbar-border-color) !important;
    padding: 17px 20px;
    &-title {
      font-size: 18px;
      font-weight: 500;
      position: relative;
      display: inline-flex;
      align-items: center;
      padding: 4px 0;
      font-family: Lato, sans-serif;
      text-decoration: none;
      text-transform: uppercase;
      transition: 0.5s;
      cursor: pointer;
      &::before {
        position: absolute;
        content: '';
        bottom: 0;
        right: 0;
        width: 10%;
        height: 2px;
        background: linear-gradient(45deg, transparent, #0065d9);
        transform: scaleX(0);
        transform-origin: right;
        transition: transform 0.5s;
      }
      &::after {
        position: absolute;
        content: '';
        bottom: 0;
        left: 0;
        width: 100%;
        height: 2px;
        background: linear-gradient(45deg, transparent, #0065d9);
        transform: scaleX(0);
        transform-origin: right;
        transition: transform 0.5s;
      }
      &:hover {
        color: #0065d9;
        &::after {
          transform: scaleX(1);
          transform-origin: left;
        }
      }
    }
    &-desc {
      font-size: 16px;
      margin: 16px auto;
    }
  }
}
</style>
