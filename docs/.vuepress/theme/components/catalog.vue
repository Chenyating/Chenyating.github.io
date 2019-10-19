<template>
<div>
        <!-- 锚点对应的标题要求：小写，连续空格以'-'代替，
        nofollow 是 HTML 页面中 a 标签的属性值。这个标签的意义是告诉搜索引擎"不要追踪此网页上的链接或不要追踪此特定链接"。
        -->
        <a  v-for="(item,index) in titleList" :key="index" :href="'#'+item.title.replace(/\s+/g,'-').toLowerCase()" nofollow class="">{{item.title}}</a>
</div>
</template>

<script>
export default {
    props: {
        titleList: {
            type: Array,
            value: 'hello'
        }
    },
    methods: {
    },
    mounted() {
        console.log(this.titleList, "}}}")
    }
}
</script>
