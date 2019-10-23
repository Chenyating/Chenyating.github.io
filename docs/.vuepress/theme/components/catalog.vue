<template>
<div class="catalog-box">
    <!-- 锚点对应的标题要求：小写，连续空格以'-'代替，
        nofollow 是 HTML 页面中 a 标签的属性值。这个标签的意义是告诉搜索引擎"不要追踪此网页上的链接或不要追踪此特定链接"。
        -->
    <div class="catalog">
        {{title}}
        <a class="level1" :href="'#'+$page.title.replace(/\s+/g,'-').toLowerCase()">{{$page.title}}</a>
        <a :class="[item.level==2?'level2':'level3',{'select':item.title==selectTitle}]" v-for="(item,index) in $page.headers" :key="index" :href="'#'+item.title.replace(/\s+/g,'-').toLowerCase()" nofollow @click="clickTitle(item.title)">{{item.title}}</a>
        <a :class="[item.level==2?'level2':'level3',{'select':item.title==selectTitle}]" v-for="(item,index) in $page.headers" :key="index" :href="'#'+item.title.replace(/\s+/g,'-').toLowerCase()" nofollow @click="clickTitle(item.title)">{{item.title}}</a>
    </div>
</div>
</template>

<script>
export default {
    data() {
        return {
            selectTitle: '',
            show: true
        }
    },
    methods: {
        clickTitle(title) {
            this.selectTitle = title;
        },
        haha() {
             console.log("1")
            window.onhashchange = (e) => {
                this.selectTitle = decodeURIComponent(location.hash).replace('#', '');
                console.log(this.selectTitle)
            };
            console.log("2")
        }
    },
    computed: {
        title() {
            console.log("1")
            window.onhashchange = (e) => {
                this.selectTitle = decodeURIComponent(location.hash).replace('#', '');
                console.log(this.selectTitle)
            };
            console.log("2")
        }
    },
    mounted() {
        console.log("1")
        window.onhashchange = (e) => {
            this.selectTitle = decodeURIComponent(location.hash).replace('#', '');
            console.log(this.selectTitle)
        };
        console.log("2")
    }
}
</script>

<style scoped>
.select {
    color: #3EAF7C;
    font-weight: bold;
}

.level1 {
    color: #3EAF7C;
}

a {
    display: block;
    color: #2c3e50;
}

a:hover {
    color: #3EAF7C
}
</style>
