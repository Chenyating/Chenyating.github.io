<template>
<div class="flex">
        <Catalog class="catalog" :titleList="titleList" />
        <Content class="theme-default-content content" />
</div>
</template>

<script>
import Catalog from '../components/catalog.vue'
export default {
    components: {
        Catalog
    },
    data() {
        return {
            titleList: null
        }
    },
    created() {
        this.titleList = this.$page.headers;
        console.log(this.$site)
        console.log(this.$page)
    }
}
</script>

<style>
.catalog {
    width: 500px;
    height: 100%;
}

.content {
}
</style>
