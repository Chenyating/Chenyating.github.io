(window.webpackJsonp=window.webpackJsonp||[]).push([[4],{574:function(t,e,i){},575:function(t,e,i){},577:function(t,e,i){"use strict";i(574)},578:function(t,e,i){"use strict";i(575)},580:function(t,e,i){"use strict";var n=i(583),l=i.n(n),s=(i(584),{data:function(){return{ifshow:!0}},mounted:function(){if(this.$site.themeConfig.gitalk){var t=this.$site.themeConfig.gitalk;t.id=location.pathname,new l.a(t).render("gitalk-container")}else this.ifshow=!1}}),c=(i(577),i(14)),a=Object(c.a)(s,(function(){var t=this.$createElement;return(this._self._c||t)("div",{attrs:{id:"gitalk-container"}})}),[],!1,null,"79748d16",null);e.a=a.exports},581:function(t,e,i){"use strict";var n={data:function(){return{preTitle:{},nextTitle:{},nowTitle:null,titleIndex:0}},watch:{titleIndex:function(t){this.init()}},methods:{init:function(){var t=this.$site.pages;if(this.preTitle={},this.nextTitle={},1!=t.length){for(var e=0;e<t.length;e++)if(this.nowTitle==t[e].title){this.titleIndex=e;break}0==this.titleIndex?(this.nextTitle=t[this.titleIndex+1],this.nextTitle.index=this.titleIndex+1,this.preTitle=null):this.titleIndex==t.length-1?(this.preTitle=t[this.titleIndex-1],this.preTitle.index=this.titleIndex-1,this.nextTitle=null):(this.nextTitle=t[this.titleIndex+1],this.preTitle=t[this.titleIndex-1],this.nextTitle.index=this.titleIndex+1,this.preTitle.index=this.titleIndex-1)}},goArticle:function(t){this.titleIndex=t.index,this.nowTitle=t.title,this.$router.push(t.path)}},mounted:function(){this.init()}},l=(i(578),i(14)),s=Object(l.a)(n,(function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"article"},[i("Content"),t._v(" "),i("a",{attrs:{href:"#nav"}},[t._v("返回顶部 ")]),t._v(" "),t.preTitle.title?i("div",{staticClass:"article-pre",on:{click:function(e){return t.goArticle(t.preTitle)}}},[t._v("\n    上一篇：《"+t._s(t.preTitle.title)+"》\n  ")]):t._e(),t._v(" "),t.nextTitle.title?i("div",{staticClass:"article-next",on:{click:function(e){return t.goArticle(t.nextTitle)}}},[t._v("\n    下一篇：《"+t._s(t.nextTitle.title)+"》\n  ")]):t._e()],1)}),[],!1,null,"1ddf0278",null);e.a=s.exports},585:function(t,e,i){},586:function(t,e,i){},602:function(t,e,i){"use strict";i(585)},603:function(t,e,i){"use strict";i(586)},623:function(t,e,i){"use strict";i.r(e);var n=i(580),l=(i(30),i(63),{data:function(){return{selectTitle:"",preTitle:{},nextTitle:{},nowTitle:null,titleIndex:0,h5catalog:!1}},watch:{titleIndex:function(t){this.init()}},computed:{},methods:{gohome:function(){this.$router.push("/")},showcatalog:function(){this.h5catalog=!this.h5catalog},clickTitle:function(){var t=this;window.onhashchange=function(e){t.selectTitle=decodeURIComponent(location.hash).replace("#","")}},styleOperation:function(){for(var t=document.getElementsByClassName("header-anchor"),e=0;e<t.length;e++)t[e].innerHTML=" "},init:function(){var t=this.$site.pages;if(this.preTitle={},this.nextTitle={},1!=t.length){for(var e=0;e<t.length;e++)if(this.nowTitle==t[e].title){this.titleIndex=e;break}0==this.titleIndex?(this.nextTitle=t[this.titleIndex+1],this.nextTitle.index=this.titleIndex+1):this.titleIndex==t.length-1?(this.preTitle=t[this.titleIndex-1],this.preTitle.index=this.titleIndex-1):(this.nextTitle=t[this.titleIndex+1],this.preTitle=t[this.titleIndex-1],this.nextTitle.index=this.titleIndex+1,this.preTitle.index=this.titleIndex-1)}},goArticle:function(t){this.titleIndex=t.index,this.nowTitle=t.title,this.$router.push(t.path)}},mounted:function(){this.clickTitle(),this.styleOperation(),this.nowTitle=this.$page.title,this.init()}}),s=(i(602),i(14)),c=Object(s.a)(l,(function(){var t=this,e=t.$createElement,i=t._self._c||e;return i("div",{staticClass:"page-catalog"},[i("div",{staticClass:"menu"},[i("div",{staticClass:"menu-item",on:{click:t.showcatalog}},[t._v("目录")]),t._v(" "),i("div",{staticClass:"menu-item",on:{click:t.gohome}},[t._v("首页")]),t._v(" "),i("div",{staticClass:"menu-item",on:{click:t.gohome}},[t._v("文章")])]),t._v(" "),i("div",{class:["catalog",{show:t.h5catalog}]},[t.preTitle.title?i("div",{staticClass:"title",on:{click:function(e){return t.goArticle(t.preTitle)}}},[t._v("\n      上一篇:《"+t._s(t.preTitle.title)+"》\n    ")]):t._e(),t._v(" "),i("h1",{staticClass:"curtitle"},[t._v(t._s(t.nowTitle))]),t._v(" "),t._l(t.$page.headers,(function(e,n){return i("a",{key:n,class:[2==e.level?"level2":"level3",{select:e.slug==t.selectTitle}],attrs:{href:"#"+e.slug,nofollow:""}},[t._v(t._s(e.title))])})),t._v(" "),t.nextTitle.title?i("div",{staticClass:"title",on:{click:function(e){return t.goArticle(t.nextTitle)}}},[t._v("\n      下一篇：《"+t._s(t.nextTitle.title)+"》\n    ")]):t._e()],2)])}),[],!1,null,"c4008702",null).exports,a={components:{tingContent:i(581).a,tingPagecatalog:c,tingGitalk:n.a}},o=(i(603),Object(s.a)(a,(function(){var t=this.$createElement,e=this._self._c||t;return e("div",{staticClass:"layout"},[e("ting-content"),this._v(" "),e("ting-pagecatalog"),this._v(" "),e("ting-gitalk")],1)}),[],!1,null,"2aecb051",null));e.default=o.exports}}]);