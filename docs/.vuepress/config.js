module.exports = {
    title: '标题名称',//网站名称
    description: '网站描述',//网站描述
    //head标签
    head: [
        ['link', { rel: 'icon', href: '/img/logo.ico' }],//注意"/"就是public资源目录。标签的logo
    ],
    themeConfig: {
        //导航栏
        nav: [
            { text: '主页', link: '/' },
            { text: '论文结果',
                items: [
                    { text: 'Android', link: '/android/' },
                    { text: 'ios', link: '/' },
                    { text: 'Web', link: '/' }
                ]
            },
            { text: '关于', link: '/about/' },
            { text: 'Github', link: 'https://www.github.com/codeteenager' },
        ],
        //侧边栏
        sidebar: {
            ///android链接下的侧边栏,这里写一个方法，遍历文件所有目录
            '/android/': [
                //文件目录
                "",
                "hello",
            ]
        },
        sidebarDepth: 2,//侧边栏显示到多少级的标题
        lastUpdated: 'Last Updated',
    }
}