(window.webpackJsonp=window.webpackJsonp||[]).push([[5,7],{447:function(e,t,a){},451:function(e,t,a){"use strict";a(447)},466:function(e,t,a){},471:function(e,t,a){"use strict";a.r(t);var o={props:{code:{type:String},dark:{type:Boolean,default:!1}},data:()=>({ifshowCode:!1}),methods:{showCode(){this.ifshowCode=!this.ifshowCode}},computed:{yesDark(){return[{dark:this.dark}]}}},s=(a(451),a(2)),n=Object(s.a)(o,(function(){var e=this,t=e._self._c;return t("div",{staticClass:"demo-box"},[t("div",{staticClass:"example-box",class:e.yesDark},[e._t("default")],2),e._v(" "),t("div",{directives:[{name:"show",rawName:"v-show",value:e.ifshowCode,expression:"ifshowCode"}]},[t("pre",{directives:[{name:"highlightjs",rawName:"v-highlightjs"}]},[t("code",{staticClass:"html"},[e._v(e._s(e.code))])])]),e._v(" "),t("div",{staticClass:"btn",on:{click:e.showCode}},[e._v("\n        "+e._s(e.ifshowCode?"隐藏代码":"显示代码")+"\n    ")])])}),[],!1,null,"4d6b2bf8",null);t.default=n.exports},483:function(e,t,a){"use strict";a(466)},494:function(e,t,a){"use strict";a.r(t);var o=a(471),s={props:{code:{type:String}},components:{fDemo:o.default},data:()=>({iconList:[{name:"left"},{name:"right"},{name:"up"},{name:"down"},{name:"add"},{name:"false"},{name:"true"},{name:"collected"},{name:"collect"},{name:"liked"},{name:"like"},{name:"close"},{name:"people"},{name:"home"},{name:"alipay"},{name:"loading"},{name:"wechat"},{name:"qq"},{name:"appled"},{name:"apple"},{name:"fish"}]}),computed:{style(){let e={};return this.color&&(e={background:this.color}),e}}},n=(a(483),a(2)),i=Object(n.a)(s,(function(){var e=this,t=e._self._c;return t("f-demo",{attrs:{code:e.code}},[t("div",{staticClass:"icon-box"},e._l(e.iconList,(function(a,o){return t("div",{key:o,staticClass:"icon-detail"},[t("if-icon",{attrs:{type:a.name,color:a.color,size:a.size}}),e._v(" "),t("div",[e._v(e._s(a.name))])],1)})),0)])}),[],!1,null,null,null);t.default=i.exports}}]);