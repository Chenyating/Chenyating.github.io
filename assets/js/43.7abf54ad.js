(window.webpackJsonp=window.webpackJsonp||[]).push([[43],{658:function(t,v,_){"use strict";_.r(v);var p=_(14),l=Object(p.a)({},(function(){var t=this,v=t.$createElement,_=t._self._c||v;return _("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[_("h1",{attrs:{id:"http"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#http"}},[t._v("#")]),t._v(" http")]),t._v(" "),_("table",[_("thead",[_("tr",[_("th",[t._v("请求方法")]),t._v(" "),_("th",[t._v("-")])])]),t._v(" "),_("tbody",[_("tr",[_("td",[t._v("HEAD")]),t._v(" "),_("td",[t._v("不需要返回内容")])]),t._v(" "),_("tr",[_("td",[t._v("TRACE")]),t._v(" "),_("td",[t._v("查看代理是否修改请求")])]),t._v(" "),_("tr",[_("td",[t._v("OPTIONS")]),t._v(" "),_("td",[t._v("返回服务器可用请求的方法")])]),t._v(" "),_("tr",[_("td",[t._v("GET")]),t._v(" "),_("td",[t._v("放在url后面，明文")])]),t._v(" "),_("tr",[_("td",[t._v("POST")]),t._v(" "),_("td",[t._v("密文")])]),t._v(" "),_("tr",[_("td",[t._v("DELETE")]),t._v(" "),_("td",[t._v("删除")])]),t._v(" "),_("tr",[_("td",[t._v("PUT")]),t._v(" "),_("td",[t._v("和post差不，指定资源的位置")])])])]),t._v(" "),_("blockquote",[_("p",[t._v("http是超文本传输协议的缩写，是用于服务器传输超文本到本地浏览器的传送协议，是一个基于tcp/ip通信协议来传递数据；")])]),t._v(" "),_("ul",[_("li",[t._v("无连接：服务器处理完客户的请求，并收到客户的应答后，即断开连接。")]),t._v(" "),_("li",[t._v("无状态：是指服务器不知道客户端是什么状态。")])]),t._v(" "),_("h2",{attrs:{id:"tcp和udp的区别"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#tcp和udp的区别"}},[t._v("#")]),t._v(" tcp和udp的区别")]),t._v(" "),_("h3",{attrs:{id:"tcp"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#tcp"}},[t._v("#")]),t._v(" tcp")]),t._v(" "),_("ul",[_("li",[t._v("面向连接")]),t._v(" "),_("li",[t._v("提供可靠服务，通过tcp连接传送的数据，无差错，不丢失，不重复。")]),t._v(" "),_("li",[t._v("tcp面向字节流")]),t._v(" "),_("li",[t._v("tcp只能1对1")]),t._v(" "),_("li",[t._v("tcp首部较大为20字节；而udp只有个字节")]),t._v(" "),_("li",[t._v("tcp面向可靠性传输；")])]),t._v(" "),_("h3",{attrs:{id:"udp"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#udp"}},[t._v("#")]),t._v(" udp")]),t._v(" "),_("ul",[_("li",[t._v("面向无连接，即发送数据前不需要先建立连接")]),t._v(" "),_("li",[t._v("udp尽最大努力交付，即不保证可靠交付，")]),t._v(" "),_("li",[t._v("udp面向报文")]),t._v(" "),_("li",[t._v("udp支持1对1，1对多")]),t._v(" "),_("li",[t._v("udp首部字节只有8字节；")]),t._v(" "),_("li",[t._v("udp不可靠")])]),t._v(" "),_("h2",{attrs:{id:"http请求信息和响应信息的格式"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#http请求信息和响应信息的格式"}},[t._v("#")]),t._v(" HTTP请求信息和响应信息的格式")]),t._v(" "),_("p",[t._v("请求：")]),t._v(" "),_("ol",[_("li",[t._v("请求行:请求方法；路径；所有协议版本")]),t._v(" "),_("li",[t._v("请求头：key：value")]),t._v(" "),_("li",[t._v("换行")]),t._v(" "),_("li",[t._v("请求主体信息：(post比get多了主体信息/可选)发送内容")])]),t._v(" "),_("p",[t._v("响应：")]),t._v(" "),_("ol",[_("li",[t._v("响应行：协议版本，状态码，状态文字")]),t._v(" "),_("li",[t._v("响应头信息：key：value")]),t._v(" "),_("li",[t._v("空行")]),t._v(" "),_("li",[t._v("主体信息")])]),t._v(" "),_("p",[t._v("防盗链：\n加Referer")]),t._v(" "),_("h2",{attrs:{id:"http1"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#http1"}},[t._v("#")]),t._v(" http1")]),t._v(" "),_("p",[t._v("Http1.0\nhttp1.0有两个很大的缺点：")]),t._v(" "),_("ul",[_("li",[t._v("连接无法复用 （TCP通道立即关闭）")]),t._v(" "),_("li",[t._v("队首请求阻塞 （http、tcp）")])]),t._v(" "),_("p",[t._v("http1.1已经被广泛使用。在http1.0的基础上，新增了以下功能：")]),t._v(" "),_("ul",[_("li",[t._v("TCP通道长连接（持久连接），在响应后不关闭TCP通道")]),t._v(" "),_("li",[t._v("新增了首部字段 Host，客户端指明访问的主机（域名 || [ip + 端口号]），使得服务端可以在同一域名下的不同主机之间实现多个虚拟Web站点。")]),t._v(" "),_("li",[t._v("新增了首部字段 Connection，实现持久连接，默认开启 Keep-Alive，关闭连接复用需要显示的设置成 Close")]),t._v(" "),_("li",[t._v("新增了http流水线机制（http pipelining），允许幂等的请求（GET，HEAD）同时发送，在响应方面仍然是以同步方式的顺序返回")])]),t._v(" "),_("p",[t._v("http1.1的新增特性解决了http1.0的两个大难题，实现了TCP通道连接复用，并支持多个请求同时发送，互不影响。")]),t._v(" "),_("p",[t._v("http2.0\nhttp1.0和http1.1仍然有很多的问题，http2.0目标便是解决http1.1版本中的两个问题：")]),t._v(" "),_("p",[t._v("延迟性 （改动http应用层，而TCP传输层已经被广泛应用，改动代价太大）\n安全性\n为了实现低延迟和高吞吐量，http2增加了了二进制分帧层和首部压缩技术。")])])}),[],!1,null,null,null);v.default=l.exports}}]);