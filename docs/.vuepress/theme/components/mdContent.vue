<template>
<div>
    <div class="title-info">
        <h1>《 {{$page.title}} 》</h1>
        <div>{{author}}-{{$page.lastUpdated}}</div>
    </div>
    <Content class="theme-default-content" />
</div>
</template>

<script>
export default {
    data(){
        return{
            author:''
        }
    },
    methods: {

    },
    created() {
        this.author=this.$site.themeConfig.author
    }
}
</script>

<style scoped>
.title-info{
    text-align: center;
}
</style>
