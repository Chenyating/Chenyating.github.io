<template>
<div class="content-box">
    <div class="flex-row-between">
    <Catalog/>
    <div class=" content">
        <mdContent/>
    </div>
    </div>
</div>
</template>

<script>
import Catalog from '../components/catalog.vue'
import mdContent from '../components/mdContent.vue'
export default {
    components: {
        Catalog,mdContent
    }
}
</script>

<style>
.flex-row-between{
    height: 100%;
}
.content-box{
    height: 100%;
}

.content {
    width: 100%;
    height: 100%;
    overflow: scroll;
    overflow-x: hidden;
}
</style>
