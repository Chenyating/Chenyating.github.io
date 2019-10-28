<template>
<div class="nav-box">
    <div class="search-box">
        <input class="search-key" v-model="searchKey"/>
        <div v-if="searchKey" class="result-list">
            <div class="result-item" v-for="(item,index) in searchTitles" @click="goPage(item.road)" :key="index">
                《{{item.title}}》:{{item.header}}
            </div>
        </div>
    </div>
    <div class="link-item" @click="goPage(item.link)" v-for="(item,index) in navLinkList" :key="index">
        {{item.text}}
    </div>
</div>
</template>
<script>
export default {
    data() {
        return {
            navLinkList: [],
            searchKey: null,
            allHeader: [],
            headerList: []
        }
    },
    computed: {
        searchTitles: function() {
            var list = this.headerList.filter(item => {
                var str = item.header.toLowerCase()
                if (str.indexOf(this.searchKey.toLowerCase()) != -1) {
                    return item
                }
            })
            return list;
        }
    },
    methods: {
        // 跳转页面
        goPage(link) {
            this.$router.push(link).catch(err => { })
            this.searchKey=null;
        },
        // 处理header到一个列表里
        resolveHeader(arr) {
            arr.forEach((element) => {
                if (element.headers) {
                    var headers = element.headers;
                    headers.forEach((head) => {
                        var href = head.slug;
                        var road = element.path + '#' + href;
                        this.headerList.push({
                            road: road,
                            header: head.title,
                            href: href,
                            title:element.title
                        })
                    })
                }
            })
        }
    },
    mounted() {
        this.resolveHeader(this.$site.pages);
        this.navLinkList = this.$site.themeConfig.nav;
    }
}
</script>
<style scoped>
.nav-box {
    width: 100%;
    position: fixed;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 99999;
    background: black;
    padding: 10px;
}

.link-item {
    background: black;
    color: #ffffff;
    padding: 1em;
}
</style>