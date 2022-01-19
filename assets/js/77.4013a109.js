(window.webpackJsonp=window.webpackJsonp||[]).push([[77],{693:function(t,s,a){"use strict";a.r(s);var n=a(14),e=Object(n.a)({},(function(){var t=this,s=t.$createElement,a=t._self._c||s;return a("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[a("h1",{attrs:{id:"跨域的方法"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#跨域的方法"}},[t._v("#")]),t._v(" 跨域的方法")]),t._v(" "),a("h2",{attrs:{id:"备注"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#备注"}},[t._v("#")]),t._v(" 备注")]),t._v(" "),a("ol",[a("li",[t._v("端口和协议的不同，只能通过后台来解决")]),t._v(" "),a("li",[t._v("localhost和127.0.0.1虽然都指向本机，但也属于跨域")])]),t._v(" "),a("h2",{attrs:{id:"跨域"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#跨域"}},[t._v("#")]),t._v(" 跨域")]),t._v(" "),a("p",[t._v("当"),a("code",[t._v("协议")]),t._v("、"),a("code",[t._v("子域名")]),t._v("、"),a("code",[t._v("主域名")]),t._v("、"),a("code",[t._v("端口号")]),t._v("中任意一个不相同时，都算作不同域。")]),t._v(" "),a("p",[t._v("不同域之间相互请求资源，就算作"),a("code",[t._v("跨域")])]),t._v(" "),a("ul",[a("li",[a("p",[t._v("跨域并不是请求发不出去，"),a("code",[t._v("请求能发出去")]),t._v("，服务端能收到请求并"),a("code",[t._v("正常返回结果")]),t._v("，只是结果"),a("code",[t._v("被浏览器拦截")]),t._v("了。")])]),t._v(" "),a("li",[a("p",[t._v("之所以会跨域，是因为受到了同源策略的限制，同源策略要求源相同才能正常进行通信，即"),a("code",[t._v("协议")]),t._v("、"),a("code",[t._v("域名")]),t._v("、"),a("code",[t._v("端口号")]),t._v("都完全一致。")])])]),t._v(" "),a("p",[t._v("同源策略限制内容有："),a("code",[t._v("Cookie")]),t._v("、"),a("code",[t._v("LocalStorage")]),t._v("、"),a("code",[t._v("IndexedDB")]),t._v(" 等存储性内容"),a("code",[t._v("DOM 节点``AJAX 请求不能发送")])]),t._v(" "),a("p",[t._v("但是有三个标签是允许跨域加载资源：")]),t._v(" "),a("ol",[a("li",[a("code",[t._v("<img src=XXX>")])]),t._v(" "),a("li",[a("code",[t._v("<link href=XXX>")])]),t._v(" "),a("li",[a("code",[t._v("<script src=XXX>")])])]),t._v(" "),a("h2",{attrs:{id:"处理跨域的方法"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#处理跨域的方法"}},[t._v("#")]),t._v(" 处理跨域的方法")]),t._v(" "),a("h3",{attrs:{id:"_1、webpack-proxy"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_1、webpack-proxy"}},[t._v("#")]),t._v(" 1、webpack proxy")]),t._v(" "),a("h3",{attrs:{id:"_2、nginx-反向代理"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_2、nginx-反向代理"}},[t._v("#")]),t._v(" 2、nginx 反向代理")]),t._v(" "),a("h3",{attrs:{id:"_3、jsonp"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_3、jsonp"}},[t._v("#")]),t._v(" 3、Jsonp")]),t._v(" "),a("p",[t._v("代码示例：")]),t._v(" "),a("p",[t._v("后端:")]),t._v(" "),a("div",{staticClass:"language-js line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-js"}},[a("code",[t._v("router"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("get")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("'/hehe'")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("function")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token parameter"}},[t._v("req"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" res"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" next")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("var")]),t._v(" obj "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),a("span",{pre:!0,attrs:{class:"token string-property property"}},[t._v("'0'")]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("'a'")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),a("span",{pre:!0,attrs:{class:"token string-property property"}},[t._v("'1'")]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("'b'")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),a("span",{pre:!0,attrs:{class:"token string-property property"}},[t._v("'2'")]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("'c'")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    res"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("send")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("'callbackFunction('")]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("+")]),a("span",{pre:!0,attrs:{class:"token constant"}},[t._v("JSON")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("stringify")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("obj"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("+")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("')'")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("//需要将对象转为字符串；")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n")])]),t._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[t._v("1")]),a("br"),a("span",{staticClass:"line-number"},[t._v("2")]),a("br"),a("span",{staticClass:"line-number"},[t._v("3")]),a("br"),a("span",{staticClass:"line-number"},[t._v("4")]),a("br")])]),a("p",[t._v("前端使用jquery的ajax的jsonp:")]),t._v(" "),a("div",{staticClass:"language-js line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-js"}},[a("code",[t._v("$"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("ajax")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n        "),a("span",{pre:!0,attrs:{class:"token literal-property property"}},[t._v("url")]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("'http://localhost:3000/index/hehe'")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("//跨域请求的地址，也可用相对路径js/data.js")]),t._v("\n        "),a("span",{pre:!0,attrs:{class:"token literal-property property"}},[t._v("type")]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("'get'")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n        "),a("span",{pre:!0,attrs:{class:"token literal-property property"}},[t._v("dataType")]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("'jsonp'")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("//使用jsonp跨域请求")]),t._v("\n        "),a("span",{pre:!0,attrs:{class:"token literal-property property"}},[t._v("jsonpCallback")]),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("'callbackFunction'")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("done")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("function")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token parameter"}},[t._v("data")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n        console"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("log")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("data"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v('// 控制台打印结果{0: "a", 1: "b", 2: "c"}')]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("fail")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("function")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n        console"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("log")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v('"error"')]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n")])]),t._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[t._v("1")]),a("br"),a("span",{staticClass:"line-number"},[t._v("2")]),a("br"),a("span",{staticClass:"line-number"},[t._v("3")]),a("br"),a("span",{staticClass:"line-number"},[t._v("4")]),a("br"),a("span",{staticClass:"line-number"},[t._v("5")]),a("br"),a("span",{staticClass:"line-number"},[t._v("6")]),a("br"),a("span",{staticClass:"line-number"},[t._v("7")]),a("br"),a("span",{staticClass:"line-number"},[t._v("8")]),a("br"),a("span",{staticClass:"line-number"},[t._v("9")]),a("br"),a("span",{staticClass:"line-number"},[t._v("10")]),a("br"),a("span",{staticClass:"line-number"},[t._v("11")]),a("br"),a("span",{staticClass:"line-number"},[t._v("12")]),a("br")])]),a("ol",[a("li",[t._v("利用"),a("code",[t._v("<script>")]),t._v(" 元素的这个开放策略，网页可以得到从其他来源动态产生的 JSON 数据。JSONP请求一定需要对方的服务器做支持才可以。")]),t._v(" "),a("li",[t._v("JSONP由两部分组成："),a("code",[t._v("回调函数")]),t._v("和"),a("code",[t._v("数据")]),t._v("。回调函数是当响应到来时应该在页面中调用的函数，而数据就是传入回调函数中的JSON数据。")])]),t._v(" "),a("h4",{attrs:{id:"jsonp和ajax对比"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#jsonp和ajax对比"}},[t._v("#")]),t._v(" JSONP和AJAX对比")]),t._v(" "),a("p",[t._v("JSONP和AJAX相同，都是客户端向服务器端发送请求，从服务器端获取数据的方式。但"),a("code",[t._v("AJAX属于同源策略")]),t._v("，"),a("code",[t._v("JSONP属于非同源策略（跨域请求）")])]),t._v(" "),a("h4",{attrs:{id:"jsonp优缺点"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#jsonp优缺点"}},[t._v("#")]),t._v(" JSONP优缺点")]),t._v(" "),a("ul",[a("li",[t._v("优点：兼容性好，在很古老的浏览器中也可以用，简单易用，支持浏览器与服务器双向通信。 可用于解决主流浏览器的跨域数据访问的问题")]),t._v(" "),a("li",[t._v("缺点："),a("code",[t._v("只支持GET请求")]),t._v("，且"),a("code",[t._v("只支持跨域HTTP请求这种情况（不支持HTTPS）")])])]),t._v(" "),a("h4",{attrs:{id:"json、jsonp的区别"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#json、jsonp的区别"}},[t._v("#")]),t._v(" JSON、JSONP的区别：")]),t._v(" "),a("ol",[a("li",[t._v("JSON返回的是一串数据、JSONP返回的是"),a("em",[t._v("脚本代码")]),t._v("(包含一个函数调用)")]),t._v(" "),a("li",[t._v("JSONP 只支持get请求、不支持post请求")])]),t._v(" "),a("p",[t._v("(类似往页面添加一个script标签，通过src属性去触发对指定地址的请求,故只能是Get请求)")]),t._v(" "),a("h4",{attrs:{id:"jsonp改成post请求的方法"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#jsonp改成post请求的方法"}},[t._v("#")]),t._v(" jsonp改成post请求的方法")]),t._v(" "),a("ul",[a("li",[a("p",[t._v("客户端更改\n添加：crossDomain:true;\n修改：dataType：'json'")])]),t._v(" "),a("li",[a("p",[t._v("服务端添加\nheader('Access-Control-Allow-Origin:'*');\nheader('Access-Control-Allow-Methodes:''POST');\nheader('Access-Control-Max-Age:'1000')")])])]),t._v(" "),a("h3",{attrs:{id:"_4、cors"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_4、cors"}},[t._v("#")]),t._v(" 4、CORS")]),t._v(" "),a("blockquote",[a("p",[t._v("整个CORS通信过程，都是浏览器自动完成，不需要用户参与。CORS通信的关键是服务器。只要服务器实现了CORS接口，就可以跨源通信。")])]),t._v(" "),a("h4",{attrs:{id:"核心思想"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#核心思想"}},[t._v("#")]),t._v(" 核心思想")]),t._v(" "),a("p",[t._v("在服务器端通过检查请求头部的origin，从而决定请求应该成功还是失败。")]),t._v(" "),a("p",[t._v("具体的方法是在服务端设置Response Header响应头中的"),a("code",[t._v("Access-Control-Allow-Origin")]),t._v("为对应的域名，实现了CORS（跨域资源共享），这里出于在安全性方面的考虑就是尽量不要用 *")]),t._v(" "),a("h4",{attrs:{id:"cors优缺点"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#cors优缺点"}},[t._v("#")]),t._v(" CORS优缺点")]),t._v(" "),a("ul",[a("li",[t._v("CORS要求浏览器(>IE10)和服务器的同时支持，是"),a("code",[t._v("跨域的根本解决方法")]),t._v("，由浏览器自动完成。")]),t._v(" "),a("li",[t._v("优点在于功能更加强大支持各种HTTP Method，"),a("code",[t._v("缺点是兼容性不如JSONP")]),t._v("。")])]),t._v(" "),a("h3",{attrs:{id:"_5、通过document-domain来跨子域"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_5、通过document-domain来跨子域"}},[t._v("#")]),t._v(" 5、通过document.domain来跨子域")]),t._v(" "),a("p",[t._v("我们只要把"),a("code",[t._v("http://www.example.com/a.html")]),t._v("和 "),a("code",[t._v("http://example.com/b.html")]),t._v("这两个页面的"),a("code",[t._v("document.domain")]),t._v("都设成"),a("em",[t._v("相同的域名")]),t._v("就可以了。")]),t._v(" "),a("blockquote",[a("p",[t._v("但要注意的是，document.domain的设置是有限制的，我们只能把"),a("em",[t._v("document.domain设置成自身或更高一级的父域，且主域必须相同。")])])]),t._v(" "),a("p",[t._v("修改document.domain的方法只适用于不同子域的框架间的交互。")]),t._v(" "),a("h3",{attrs:{id:"_6、使用window-name-iframe来进行跨域"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_6、使用window-name-iframe来进行跨域"}},[t._v("#")]),t._v(" 6、使用window.name+iframe来进行跨域")]),t._v(" "),a("p",[t._v("a页面的值传给b页面；")]),t._v(" "),a("p",[t._v("给a页面设置window.name的值；")]),t._v(" "),a("div",{staticClass:"language-js line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-js"}},[a("code",[t._v("    window"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("name "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("'hello world'")]),t._v("\n")])]),t._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[t._v("1")]),a("br")])]),a("p",[t._v("b页面写一个ifram:")]),t._v(" "),a("div",{staticClass:"language-html line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-html"}},[a("code",[a("span",{pre:!0,attrs:{class:"token tag"}},[a("span",{pre:!0,attrs:{class:"token tag"}},[a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("div")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token tag"}},[a("span",{pre:!0,attrs:{class:"token tag"}},[a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("<")]),t._v("iframe")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token attr-name"}},[t._v("src")]),a("span",{pre:!0,attrs:{class:"token attr-value"}},[a("span",{pre:!0,attrs:{class:"token punctuation attr-equals"}},[t._v("=")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')]),t._v("http://localhost:8080/config/catalog.html"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v('"')])]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),a("span",{pre:!0,attrs:{class:"token tag"}},[a("span",{pre:!0,attrs:{class:"token tag"}},[a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("iframe")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token tag"}},[a("span",{pre:!0,attrs:{class:"token tag"}},[a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("</")]),t._v("div")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(">")])]),t._v("\n")])]),t._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[t._v("1")]),a("br"),a("span",{staticClass:"line-number"},[t._v("2")]),a("br"),a("span",{staticClass:"line-number"},[t._v("3")]),a("br")])]),a("div",{staticClass:"language-js line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-js"}},[a("code",[a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("var")]),t._v(" ifr "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" document"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("querySelector")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("'iframe'")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n    ifr"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function-variable function"}},[t._v("onload")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("function")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n        console"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("log")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("'跨域获取数据'")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" ifr"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("contentWindow"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("name"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("//b页面就得到了a页面的数据，为：hello world")]),t._v("\n        ifr"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("contentWindow"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("close")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 每当改变location的时候，就会重新来一次onload，所以我们希望获取到数据之后，就直接close()")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])]),t._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[t._v("1")]),a("br"),a("span",{staticClass:"line-number"},[t._v("2")]),a("br"),a("span",{staticClass:"line-number"},[t._v("3")]),a("br"),a("span",{staticClass:"line-number"},[t._v("4")]),a("br"),a("span",{staticClass:"line-number"},[t._v("5")]),a("br"),a("span",{staticClass:"line-number"},[t._v("6")]),a("br")])]),a("p",[t._v("window对象有个name属性，该属性有个特征：即在一个窗口(window)的生命周期内,窗口载入的所有的页面都是共享一个window.name的，每个页面对window.name都有读写的权限，window.name是持久存在一个窗口载入过的所有页面中的，并不会因新页面的载入而进行重置")]),t._v(" "),a("p",[a("code",[t._v("window.name的值只能是字符串的形式，这个字符串的大小最大只能允许2M左右")])]),t._v(" "),a("h3",{attrs:{id:"_7、postmessage"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_7、postmessage"}},[t._v("#")]),t._v(" 7、postMessage")]),t._v(" "),a("p",[t._v("两个页面之间的相互通信；")]),t._v(" "),a("p",[t._v("A页面上有一个ifram标签B页面：")]),t._v(" "),a("ol",[a("li",[t._v("根据id名获得ifram的contentWindow。")])]),t._v(" "),a("div",{staticClass:"language-js line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-js"}},[a("code",[a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 使用$('myIFrame').contentWindow来拿到iframe中页面的window对象，")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("var")]),t._v(" iframe "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" document"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("getElementById")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("'myIFrame'")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("contentWindow"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n")])]),t._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[t._v("1")]),a("br"),a("span",{staticClass:"line-number"},[t._v("2")]),a("br")])]),a("p",[t._v("2.使用postMessage方法传值。message：信息；domain：地址")]),t._v(" "),a("div",{staticClass:"language-js line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-js"}},[a("code",[t._v("iframe"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("postMessage")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("message"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" domain"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n")])]),t._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[t._v("1")]),a("br")])]),a("p",[t._v("B页面监听message事件；")]),t._v(" "),a("div",{staticClass:"language-js line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-js"}},[a("code",[t._v("window"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("addEventListener")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("'message'")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("function")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token parameter"}},[t._v("event")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("//监听message事件发生")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 可以将监听发送目标的信息来源;")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("if")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("event"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("origin "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("!==")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("'http://localhost:8080'")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("return")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n        console"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("log")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("'B我收到了:  '")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("+")]),t._v(" event"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("data"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" event"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 也可以返回给A发送消息；格式一样：targetWindow .postMessage（message，targetOrigin，[ transfer ]）;")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// event.source.postMessage('B收到消息了：', event.origin);")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token boolean"}},[t._v("false")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n")])]),t._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[t._v("1")]),a("br"),a("span",{staticClass:"line-number"},[t._v("2")]),a("br"),a("span",{staticClass:"line-number"},[t._v("3")]),a("br"),a("span",{staticClass:"line-number"},[t._v("4")]),a("br"),a("span",{staticClass:"line-number"},[t._v("5")]),a("br"),a("span",{staticClass:"line-number"},[t._v("6")]),a("br"),a("span",{staticClass:"line-number"},[t._v("7")]),a("br")])]),a("p",[a("code",[t._v("window.postMessage(message,targetOrigin)")]),t._v(" 方法是html5新引进的特性，可以使用它来向其它的window对象发送消息，无论这个window对象是属于同源或不同源\n"),a("code",[t._v("postMessage(data,origin)方法接受两个参数")])]),t._v(" "),a("ol",[a("li",[a("p",[a("code",[t._v("data:要传递的数据，")]),t._v("html5规范中提到该参数可以是JavaScript的任意基本类型或可复制的对象，然而并不是所有浏览器都做到了这点儿，部分浏览器只能处理字符串参数，所以我们在传递参数的时候需要使用JSON.stringify()方法对对象参数序列化，在低版本IE中引用json2.js可以实现类似效果。")])]),t._v(" "),a("li",[a("p",[t._v('origin：字符串参数，指明目标窗口的源，协议+主机+端口号[+URL]，URL会被忽略，所以可以不写，这个参数是为了安全考虑，postMessage()方法只会将message传递给指定窗口，当然如果愿意也可以建参数设置为"*"，这样可以传递给任意窗口，如果要指定和当前窗口同源的话设置为"/"。')])])]),t._v(" "),a("h3",{attrs:{id:"_8、websocket"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#_8、websocket"}},[t._v("#")]),t._v(" 8、webSocket")]),t._v(" "),a("p",[a("code",[t._v("Websocket是HTML5的一个持久化的协议")]),t._v("，它实现了浏览器与服务器的全双工通信，同时也是跨域的一种解决方案。WebSocket和HTTP都是应用层协议，都基于 TCP 协议。但是 WebSocket 是一种双向通信协议，在建立连接之后，WebSocket 的 server 与 client 都能主动向对方发送或接收数据。同时，"),a("code",[t._v("WebSocket 在建立连接时需要借助 HTTP 协议，连接建立好了之后 client 与 server 之间的双向通信就与 HTTP 无关了")]),t._v("。")]),t._v(" "),a("ul",[a("li",[t._v("0：正在连接")]),t._v(" "),a("li",[t._v("1：连接成功")]),t._v(" "),a("li",[t._v("2：正在关闭连接")]),t._v(" "),a("li",[t._v("3：已经关闭连接")])])])}),[],!1,null,null,null);s.default=e.exports}}]);