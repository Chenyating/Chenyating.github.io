module.exports = {
    title: 'YATING',//网站名称
    description: 'my web',//网站描述
    //head标签
    head: [
        ['link', { rel: 'icon', href: '/img/logo.ico' }],//注意"/"就是public资源目录。标签的logo
    ],
    themeConfig: {
        author:'tinger',
        //导航栏
        nav: [
            { text: '主页', link: '/' },
            { text: '目录',link:'/android/'},
            { text: '关于', link: '/about/' },
            { text: 'Github', link: 'https://www.github.com/codeteenager' },
        ]
    }
}