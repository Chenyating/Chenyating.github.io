<template>
<div class="nav-box">
    <img class="nav" src="../public/img/text.png" />
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
    text-align: right;
}

.nav {
    width: 70%;
    background-size: 100%;
}
</style>