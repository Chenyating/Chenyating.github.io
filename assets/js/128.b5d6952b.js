(window.webpackJsonp=window.webpackJsonp||[]).push([[128],{606:function(s,t,a){"use strict";a.r(t);var r=a(2),e=Object(r.a)({},(function(){var s=this,t=s._self._c;return t("ContentSlotsDistributor",{attrs:{"slot-key":s.$parent.slotKey}},[t("h1",{attrs:{id:"生产环境构建"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#生产环境构建"}},[s._v("#")]),s._v(" 生产环境构建")]),s._v(" "),t("div",{staticClass:"language-js line-numbers-mode"},[t("pre",{pre:!0,attrs:{class:"language-js"}},[t("code",[s._v("npm install "),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("--")]),s._v("save"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("-")]),s._v("dev webpack"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("-")]),s._v("merge\n"),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("// 同时新建和删除文件")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("-")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("|")]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("-")]),s._v(" webpack"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("config"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("js\n"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("+")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("|")]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("-")]),s._v(" webpack"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("common"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("js\n"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("+")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("|")]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("-")]),s._v(" webpack"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("dev"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("js\n"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("+")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("|")]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("-")]),s._v(" webpack"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("prod"),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),s._v("js\n"),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("// package.json也修改一下script")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("-")]),s._v("     "),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"start"')]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v(":")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"webpack-dev-server --open"')]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("+")]),s._v("     "),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"start"')]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v(":")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"webpack-dev-server --open --config webpack.dev.js"')]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(",")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("-")]),s._v("     "),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"build"')]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v(":")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"webpack"')]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("+")]),s._v("     "),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"build"')]),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v(":")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"webpack --config webpack.prod.js"')]),s._v("\n")])]),s._v(" "),t("div",{staticClass:"line-numbers-wrapper"},[t("span",{staticClass:"line-number"},[s._v("1")]),t("br"),t("span",{staticClass:"line-number"},[s._v("2")]),t("br"),t("span",{staticClass:"line-number"},[s._v("3")]),t("br"),t("span",{staticClass:"line-number"},[s._v("4")]),t("br"),t("span",{staticClass:"line-number"},[s._v("5")]),t("br"),t("span",{staticClass:"line-number"},[s._v("6")]),t("br"),t("span",{staticClass:"line-number"},[s._v("7")]),t("br"),t("span",{staticClass:"line-number"},[s._v("8")]),t("br"),t("span",{staticClass:"line-number"},[s._v("9")]),t("br"),t("span",{staticClass:"line-number"},[s._v("10")]),t("br"),t("span",{staticClass:"line-number"},[s._v("11")]),t("br")])]),t("ul",[t("li",[s._v("webpack.common.js:我们设置了 entry 和 output 配置，并且在其中引入这两个环境公用的全部插件。")]),s._v(" "),t("li",[s._v("webpack.common.js :，我们设置了 entry 和 output 配置，并且在其中引入这两个环境公用的全部插件。在 webpack.dev.js 中，我们为此环境添加了推荐的 devtool（强大的 source map）和简单的 devServer 配置\n-webpack.prod.js :我们引入了之前在 tree shaking 指南中介绍过的 UglifyJSPlugin。")])])])}),[],!1,null,null,null);t.default=e.exports}}]);