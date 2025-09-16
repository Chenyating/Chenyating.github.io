<template>
  <div class="steps">
    <span>{{ desc }}</span>
    <el-steps :active="-1" align-center>
      <el-step
        v-for="(item, index) in stepList"
        :title="item.title"
        :key="index"
        :description="item.desc"
      >
      </el-step>
    </el-steps>
  </div>
</template>
<script setup lang="ts">
const props: any = defineProps({
  stepList: {
    type: Object,
    required: true,
  },
  desc: {
    type: String,
    default: '',
  },
})
</script>
<style scoped lang="scss">
.steps {
  text-align: center;
}
.el-steps--simple {
  background-color: transparent;
}
</style>
