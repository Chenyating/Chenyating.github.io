(window.webpackJsonp=window.webpackJsonp||[]).push([[157],{772:function(s,n,a){"use strict";a.r(n);var e=a(14),t=Object(e.a)({},(function(){var s=this,n=s.$createElement,a=s._self._c||n;return a("ContentSlotsDistributor",{attrs:{"slot-key":s.$parent.slotKey}},[a("h1",{attrs:{id:"nignx二级域名配置"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#nignx二级域名配置"}},[s._v("#")]),s._v(" nignx二级域名配置")]),s._v(" "),a("h2",{attrs:{id:"域名解析"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#域名解析"}},[s._v("#")]),s._v(" 域名解析")]),s._v(" "),a("div",{staticClass:"language-yarn line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-text"}},[a("code",[s._v("记录类型:A\n主机记录:（）.yating.onlien\n解析线路：默认\n记录值：服务器ip\nTTL：10分钟\n\n")])]),s._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[s._v("1")]),a("br"),a("span",{staticClass:"line-number"},[s._v("2")]),a("br"),a("span",{staticClass:"line-number"},[s._v("3")]),a("br"),a("span",{staticClass:"line-number"},[s._v("4")]),a("br"),a("span",{staticClass:"line-number"},[s._v("5")]),a("br"),a("span",{staticClass:"line-number"},[s._v("6")]),a("br")])]),a("h2",{attrs:{id:"nginx配置"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#nginx配置"}},[s._v("#")]),s._v(" nginx配置")]),s._v(" "),a("p",[s._v("在server_name上面写配置好的二级域名")]),s._v(" "),a("div",{staticClass:"language-yarn line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-text"}},[a("code",[s._v(" server {\n        listen       80;\n        server_name  h5.yating.online;\n\n        #charset koi8-r;\n\n        #access_log  logs/host.access.log  main;\n\n        location / {\n            root   /root/html;\n            index  index.html index.htm;\n        \t\t}\n\t}\n}\n")])]),s._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[s._v("1")]),a("br"),a("span",{staticClass:"line-number"},[s._v("2")]),a("br"),a("span",{staticClass:"line-number"},[s._v("3")]),a("br"),a("span",{staticClass:"line-number"},[s._v("4")]),a("br"),a("span",{staticClass:"line-number"},[s._v("5")]),a("br"),a("span",{staticClass:"line-number"},[s._v("6")]),a("br"),a("span",{staticClass:"line-number"},[s._v("7")]),a("br"),a("span",{staticClass:"line-number"},[s._v("8")]),a("br"),a("span",{staticClass:"line-number"},[s._v("9")]),a("br"),a("span",{staticClass:"line-number"},[s._v("10")]),a("br"),a("span",{staticClass:"line-number"},[s._v("11")]),a("br"),a("span",{staticClass:"line-number"},[s._v("12")]),a("br"),a("span",{staticClass:"line-number"},[s._v("13")]),a("br"),a("span",{staticClass:"line-number"},[s._v("14")]),a("br")])]),a("h2",{attrs:{id:"配置更新"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#配置更新"}},[s._v("#")]),s._v(" 配置更新")]),s._v(" "),a("div",{staticClass:"language-yarn line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-text"}},[a("code",[s._v("/usr/local/webserver/nginx/sbin/nginx -t\n/usr/local/webserver/nginx/sbin/nginx -s reload\n")])]),s._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[s._v("1")]),a("br"),a("span",{staticClass:"line-number"},[s._v("2")]),a("br")])])])}),[],!1,null,null,null);n.default=t.exports}}]);