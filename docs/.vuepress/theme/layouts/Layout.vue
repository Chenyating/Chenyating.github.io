<template>
<div class="all-box">
    <mynav/>
    <div class="content-box">
        <mdContent/>
        <Catalog id="catalog" />
    </div>
</div>
</template>

<script>
import mynav from "../components/mynav.vue";
import Catalog from "../components/catalog.vue";
import mdContent from "../components/mdContent.vue";
export default {
    components: {
        mynav,
        Catalog,
        mdContent,
    },
    methods: {

    },

    mounted() {
        // 目录随滚动条定位
        // window.onscroll = ()=> {
        //     requestAnimationFrame(function() {
        //         var catalog = document.getElementById('catalog');
        //         var position = document.documentElement.scrollTop
        //         catalog.style.top = position + 'px';
        //     });
        // }
    }

};
</script>
<style lang='stylus' scoped>
</style>