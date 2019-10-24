<template>
<div class="all-box">
    <mynav/>
    <mdContent/>
</div>
</template>
<script>
import mynav from "../components/mynav.vue";
import mdContent from "../components/mdContent.vue";
export default {
    components: {
        mynav,
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