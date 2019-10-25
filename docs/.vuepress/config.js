module.exports = {
    title: 'YATING',//网站名称
    description: 'my web',//网站描述
    //head标签
    head: [
        ['link', { rel: 'stylesheet', href: '/img/logo.ico' }],//注意"/"就是public资源目录。标签的logo
        ['link', { rel: 'icon', href: 'https://cdn.jsdelivr.net/npm/gitalk@1/dist/gitalk.css' }],//注意"/"就是public资源目录。标签的logo
        ['script', { src: 'https://cdn.jsdelivr.net/npm/gitalk@1/dist/gitalk.min.js' }],//注意"/"就是public资源目录。标签的logo
    ],
    themeConfig: {
        author:'tinger',
        //导航栏
        nav: [
            { text: '主页', link: '/' },
            { text: '目录',link:'/config/catalog'},
            { text: '关于', link: '/about' },
            { text: 'Github', link: 'https://www.github.com/codeteenager' },
        ],
        lastUpdated: 'Last Updated',
        smoothScroll: true
    }
}