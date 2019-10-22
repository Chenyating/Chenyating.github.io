<template>
<div class="nav-box">
    <div class="nav"></div>
</div>
</template>
<script>
export default {
    data() {
        return {

        }
    },
    mounted() {
        console.log(this.$site, "???")
    }
}
</script>
<style scoped>
.nav-box {
    height: 300px;
    z-index: 999;
    background: url('../public/img/bg.jpg');
    background-repeat: no-repeat;
    background-position-x: center;
}
.nav{
    margin: 0 auto;
    width: 100%;
    height: 100%;
    z-index: 0;
}
</style>