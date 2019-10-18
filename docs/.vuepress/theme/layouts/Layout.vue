<template>
    <div>
       主题正在使用诶
        <Content/>
    </div>
</template>

<script>
    export default {
        name: "layout",
        mounted(){
            console.log("这是首页吧？",this.$site,this.$page)
        }
    }
</script>

<style scoped>

</style>