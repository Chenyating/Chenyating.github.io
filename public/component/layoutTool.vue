<template>
  <GetCode/>
  <div class="layout-tool">
    <div class="layout-tool-hd">
      {{ toolInfo.title }}
    </div>
    <div class="layout-tool-bd">
      <slot></slot>
    </div>
    <div class="layout-tool-ft">
      <slot name="ft"> </slot>
    </div>
  </div>
  <waveAnimation animationAfter :showLogo="false"/>
</template>
<script setup lang="ts">
import GetCode from './getCode.vue'
import waveAnimation from '../../../components/waveAnimation.vue'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

const props: any = defineProps({
  toolInfo: {
    type: Object,
    required: false,
  },
})

const toolInfo = computed(() => {
  return router.currentRoute.value.meta
})

</script>
<style lang="scss">
.layout-tool {
  width: 100%;
  height: 100%;
  &-hd {
    text-align: center;
    margin: 20px;
    font-size: 24px;
    font-weight: bold;
  }
  &-bd{
    height: 100%;
  }
  &-info {
    cursor: default;
    margin-left: 20px;
  }
  &-title {
    font-size: 32px;
    font-weight: bold;
  }
  &-desc {
    font-size: 16px;
    font-weight: 400;
    max-width: 1024px;
  }
  &-ft {
    margin-top: 30px;
  }
}
.tool-container {
  width: 100%;
  border-radius: 8px;
  border: 2px dashed #0266d9;
  background-color: rgba(2, 102, 217, 0.04);
  min-height: 300px;
  padding: 10px 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20px auto;
  &-btn {
    font-size: 18px;
    width: 280px;
    height: 60px;
    font-weight: bold;
    border-radius: 100px;
  }
  &-tip {
    margin-top: 20px;
    color: #0266d9;
    font-size: 13px;
    font-weight: bold;
    text-align: center;
  }
  &-copy {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    &-btn {
      margin-top: 20px;
    }
  }
  &-ft {
    text-align: right;
  }
}
.file-info {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 100px;
  margin-top: 20px;
}

@keyframes typing {
  from {
    width: 0;
    opacity: 0;
  }
}

.text {
  width: 13em;
  overflow: hidden;
  white-space: nowrap;
  /*   border-right: 0.1em solid; */
  transition: all 0.3s ease;
  animation: typing 1s ease backwards;
  animation-delay: 1s;
}
</style>
