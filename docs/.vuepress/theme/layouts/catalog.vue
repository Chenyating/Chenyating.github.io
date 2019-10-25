<template>
<div>
    <mynav/>
    <div class="catalog-box">
        <div class="catalog-item" @click="goArticle(item.path)" v-if="item" v-for="(item,index) in catalogList" :key="index">
            <!-- 标题 -->
           《 {{item.title}} 》
           <!-- 简介 -->
           {{item.frontmatter.excerpt}}
           <!-- 更新时间 -->
           {{item.lastUpdated}}
        </div>
    </div>
</div>
</template>
<script>
import mynav from "../components/mynav.vue";
export default {
    components: {
        mynav
    },
    name: 'catalog',
    data() {
        return {
            catalogList: [],
        }
    },
    methods:{
        goArticle(link){
            this.$router.push(link)
        }
    },
    mounted() {

        var pages = this.$site.pages;
        this.catalogList = pages.map((element) => {
            if (element.title != 'Home') {
                return element;
            }
            return null
        })
        console.log(this.$site)
    }
}
</script>
<style scoped>
.catalog-item {
    width: 200px;
    height: 200px;
    margin: 10px;
    background: green;
}

.catalog-box {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    padding-top: 5em;
    max-width: 800px;
    margin: 0 auto
}
</style>
