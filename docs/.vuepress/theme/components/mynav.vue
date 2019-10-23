<template>
<div class="nav-box">
    <div class="link-item" @click="goPage(item.link)" v-for="(item,index) in navLinkList" :key="index">
        {{item.text}}
    </div>
</div>
</template>
<script>
export default {
    data() {
        return {
            navLinkList: []
        }
    },
    methods:{
goPage(link){
    this.$router.push(link)
}
    },
    mounted() {
        this.navLinkList = this.$site.themeConfig.nav;
    }
}
</script>
<style scoped>
.nav-box{
    width: 100%;
    position: fixed;
    display: flex;
    justify-content: center;
    z-index: 99999;
    background: black;
}
.link-item{
    background: black;
    color: #ffffff;
    padding: 1em;
}
</style>