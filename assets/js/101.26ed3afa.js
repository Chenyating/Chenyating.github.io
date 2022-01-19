(window.webpackJsonp=window.webpackJsonp||[]).push([[101],{716:function(t,e,r){"use strict";r.r(e);var a=r(14),s=Object(a.a)({},(function(){var t=this,e=t.$createElement,r=t._self._c||e;return r("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[r("h1",{attrs:{id:"数据侦听"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#数据侦听"}},[t._v("#")]),t._v(" 数据侦听")]),t._v(" "),r("ol",[r("li",[t._v("数据驱动视图就是数据变化引起视图变化。")])]),t._v(" "),r("p",[t._v("监听数据变化使用方法：Object.defineProperty();")]),t._v(" "),r("h2",{attrs:{id:"object变化侦听"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#object变化侦听"}},[t._v("#")]),t._v(" Object变化侦听")]),t._v(" "),r("ol",[r("li",[t._v("Observer观察者雷通过递归方式把对象的所有属性都转化为可观测对象；")]),t._v(" "),r("li",[t._v("使用Object.key()去递归对象和key；")]),t._v(" "),r("li",[t._v("用Object.defineProperty去侦听数据变化。get()调用时触发，set()修改时触发；")])]),t._v(" "),r("h2",{attrs:{id:"依赖收集"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#依赖收集"}},[t._v("#")]),t._v(" 依赖收集")]),t._v(" "),r("p",[t._v("给每个数据都建立一个依赖数组，谁用到了这个数据，就把谁加入到依赖数组中。当这个数据发生变化时，就通知依赖数组里的元素。")]),t._v(" "),r("p",[t._v("在getter中收集依赖。\n在setter中通知依赖更新")]),t._v(" "),r("p",[t._v("用一个数组去管理不方便，扩展成依赖管理器Dep。\nDep里有一个subs数组存放依赖。")]),t._v(" "),r("h2",{attrs:{id:"wather类"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#wather类"}},[t._v("#")]),t._v(" Wather类")]),t._v(" "),r("p",[t._v("谁用了数据，谁就是依赖。就给它创建一个watcher实例。")]),t._v(" "),r("p",[t._v("当数据变化时，不直接通知依赖更新，通知依赖对应的watch实例。由watcher实例去通知真正的依赖。")]),t._v(" "),r("h2",{attrs:{id:"变化侦听总结"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#变化侦听总结"}},[t._v("#")]),t._v(" 变化侦听总结：")]),t._v(" "),r("ol",[r("li",[t._v("Data通过observer转换成了getter/setter的形式来追踪变化。")]),t._v(" "),r("li",[t._v("当外界通过Watcher读取数据时，会触发getter从而将Watcher添加到依赖中。")]),t._v(" "),r("li",[t._v("当数据发生了变化时，会触发setter，从而向Dep中的依赖（即Watcher）发送通知。")]),t._v(" "),r("li",[t._v("Watcher接收到通知后，会向外界发送通知，变化通知到外界后可能会触发视图更新，也有可能触发用户的某个回调函数等。")])])])}),[],!1,null,null,null);e.default=s.exports}}]);