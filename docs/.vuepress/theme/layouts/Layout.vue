<template>
<div class="bg-box">
    <mynav/>
    <div class="flex-row-between">
        <!-- <Catalog/> -->
    <Content class="theme-default-content Content" />
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
    }
};
</script>
<style scoped>
.bg-box{
    margin: 0 auto;
    background: url('../public/img/bg.jpg');
    width: 1260px;
    height: 100%;
    min-width: 1024px;
    background-size: 100%;
    background-repeat: no-repeat;
    background-position: top;
}
</style>