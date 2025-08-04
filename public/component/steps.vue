<template>
  <el-steps :active="stepList.length" simple>
    <el-step v-for="(item, index) in stepList" :title="item.title" :key="index">
      <template #icon>
        <cube-icon
          :name="item.icon"
          size="1.5rem"
          type="png"
          color="lightblue"
        />
      </template>
    </el-step>
  </el-steps>
</template>
<script setup lang="ts">
const props: any = defineProps({
  stepList: {
    type: Object,
    required: true,
  },
})
</script>
<style scoped lang="scss">
.el-steps--simple{
  background-color: transparent;
}
</style>
