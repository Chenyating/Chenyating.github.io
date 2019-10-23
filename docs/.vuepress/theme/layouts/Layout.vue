<template>
<div>
    <!-- <mynav/> -->
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
    methods:{

    },
    
    mounted() {

    }

};
</script>
<style scoped>
.bg-box {
    height: 100%;
}

.content-bg {
    margin: 0 auto;
    background: url('../public/img/bg.jpg');
    height: 200px;
    background-size: 100%;
    background-repeat: no-repeat;
    background-position: top;
    /* background-position-x: center; */
}
</style>