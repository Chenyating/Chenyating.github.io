<template>
<div class="catalog">
    <!-- 锚点对应的标题要求：小写，连续空格以'-'代替，
        nofollow 是 HTML 页面中 a 标签的属性值。这个标签的意义是告诉搜索引擎"不要追踪此网页上的链接或不要追踪此特定链接"。
        -->
    <a class="level1" :href="'#'+$page.title.replace(/\s+/g,'-').toLowerCase()">{{$page.title}}</a>
    <a :class="item.level==2?'level2':'level3'" v-for="(item,index) in $page.headers" :key="index" :href="'#'+item.title.replace(/\s+/g,'-').toLowerCase()" nofollow class="">{{item.title}}</a>
</div>
</template>

<script>
export default {
    methods: {},
    mounted() {
        console.log(this.$page, "}}}")
    }
}
</script>

<style scoped>
a {
    display: block;
    color: #2c3e50;
}

a:hover {
    color: blue
}

/* 鼠标悬浮在上的链接 蓝色 */
a:active {
    color: red
}

/* 鼠标点中激活链接 蓝色 */
</style>
