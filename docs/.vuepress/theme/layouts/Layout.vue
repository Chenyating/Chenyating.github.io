<template>
<div class="big-box">
        <Catalog/>
        <mdContent/>
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

    }

};
</script>
<style lang='stylus' scoped>
</style>