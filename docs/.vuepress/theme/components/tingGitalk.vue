<template>
<div id="gitalk-container">
</div>
</template>
<script>
import Gitalk from 'gitalk';
import 'gitalk/dist/gitalk.css';
export default {
    mounted() {
        var gitalk = new Gitalk({
            clientID: '5b8613cfe15e02db85b7',
            clientSecret: 'd4129094c33b8da73e873470fb89aea53dfaf396',
            repo: 'Chenyating.github.io',
            owner: 'Chenyating',
            admin: ['Chenyating'],
            id: location.pathname, // Ensure uniqueness and length less than 50
            distractionFreeMode: false // Facebook-like distraction free mode
        })

        gitalk.render('gitalk-container')
    }
}
</script>