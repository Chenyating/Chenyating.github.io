<template>
    <div>
        shiyong
        <search/>
        <Content class="theme-default-content" />
    </div>
</template>
<script>
import search from '../components/AlgoliaSearchBox'
export default {
    components:{search},
    mounted(){
        console.log(this.$site)
        console.log(this.$page)
    }
}
</script>
