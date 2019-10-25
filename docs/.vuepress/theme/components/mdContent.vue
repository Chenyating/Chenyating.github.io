<template>
<div class="content-box">
    <Content class="content" />
    <!-- <div class="catalog ">
        <a class="level1" :href="'#'+$page.title.replace(/\s+/g,'-').toLowerCase()">{{$page.title}}</a>
        <a :class="[item.level==2?'level2':'level3',{'select':item.slug==selectTitle}]" v-for="(item,index) in $page.headers" :key="index" :href="'#'+item.slug" nofollow>{{item.title}}</a>
    </div> -->
    <div id="gitalk-container"></div>
</div>
</template>

<script>
export default {
    data() {
        return {
            positionList: [],
            selectTitle: '',
        }
    },
    methods: {
        // 点击a以后获得改变的hash路由
        clickTitle() {
            window.onhashchange = (e) => {
                this.selectTitle = decodeURIComponent(location.hash).replace('#', '');
            };
        },
        // 路由随鼠标滚动而改变，对应标题列表改变样式
        scrollTitle() {
            var list = document.getElementsByClassName('header-anchor');
            this.positionList = this.positionList.concat(list)
            window.onscroll = () => {
                var position = document.documentElement.scrollTop;
                var small = 100;
                var titleId;
                for (var i = 0; i < this.positionList[0].length; i++) {
                    var now = this.positionList[0][i].offsetTop;
                    if (Math.abs(now - position) < small) {
                        titleId = i;
                        small = Math.abs(now - position)
                    }
                }
                if (titleId >= 0) {
                    this.selectTitle = decodeURIComponent(this.positionList[0][titleId].hash).replace('#', '');
                    window.history.replaceState({}, " ", this.positionList[0][titleId]);
                }
            }
        }
    },
    mounted() {
        this.clickTitle();
        this.scrollTitle();
        var gitalk = new Gitalk({
            clientID: '5b8613cfe15e02db85b7',
            clientSecret: 'd4129094c33b8da73e873470fb89aea53dfaf396',
            repo: 'Chenyating.github.io',
            owner: 'Chenyating',
            admin: ['Chenyating'],
            id: location.pathname, // Ensure uniqueness and length less than 50
            // distractionFreeMode: false // Facebook-like distraction free mode
        })

        gitalk.render('gitalk-container')
    }
}
</script>

<style scoped>
::-webkit-scrollbar {
    width: 1px;
    background-color: #eaecef;
}

::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background-color: #5a76cd;
}

.select {
    color: #3EAF7C;
    font-weight: bold;
}

.level1 {
    color: #3EAF7C;
}

a {
    display: block;
    color: #2c3e50;
}

a:hover {
    color: #3EAF7C
}
</style>
