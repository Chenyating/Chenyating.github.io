(window.webpackJsonp=window.webpackJsonp||[]).push([[115],{595:function(v,_,t){"use strict";t.r(_);var a=t(2),e=Object(a.a)({},(function(){var v=this,_=v._self._c;return _("ContentSlotsDistributor",{attrs:{"slot-key":v.$parent.slotKey}},[_("h1",{attrs:{id:"生命周期"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#生命周期"}},[v._v("#")]),v._v(" 生命周期")]),v._v(" "),_("p",[v._v("##　vue的生命周期：")]),v._v(" "),_("h3",{attrs:{id:"初始化阶段"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#初始化阶段"}},[v._v("#")]),v._v(" 初始化阶段")]),v._v(" "),_("ul",[_("li",[v._v("1、"),_("code",[v._v("new vue()")]),v._v(":创建一个vue实例，就会进入组件的创建过程；")]),v._v(" "),_("li",[v._v("2、"),_("code",[v._v("init")]),v._v(":初始化组件的事件和生命周期函数；")]),v._v(" "),_("li",[v._v("3、"),_("code",[v._v("beforeCreat()")]),v._v("是组件创建的第一个生命周期；data和methods都没有被触发；")]),v._v(" "),_("li",[v._v("4、"),_("code",[v._v("created()")]),v._v(":第二个生命周期函数，组件的data和methods已经初始化完毕；主要发起ajax请求；")])]),v._v(" "),_("h3",{attrs:{id:"编译阶段"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#编译阶段"}},[v._v("#")]),v._v(" 编译阶段")]),v._v(" "),_("h3",{attrs:{id:"挂载阶段"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#挂载阶段"}},[v._v("#")]),v._v(" 挂载阶段")]),v._v(" "),_("ul",[_("li",[v._v("5、把data的数据拿到，并解析执行模板结构中的指令，当所有指令被解析完毕，那么模板页面就被渲染到内存中了；当模板编译完成，我们的模板页面还没有挂载到页面上，只存内存中，用户看不到；")]),v._v(" "),_("li",[v._v("6、"),_("code",[v._v("beforMount()")]),v._v("：模板在内存中编译完成，会立即执行实例和创建阶段的生命周期函数，内存的模板结构还没有真正渲染到页面；模板上看不到真实数据；用户看到的只是一个页面而已；")]),v._v(" "),_("li",[v._v("7、把内存中渲染好的模板结构，替换到页面上；")]),v._v(" "),_("li",[v._v("8、"),_("code",[v._v("mounted()")]),v._v("：是组件渲染的最后一个生命周期函数；页面已经渲染好了，用户可以看到真实的页面数据；这个生命周期函数执行完，组件就离开了创建阶段，进入到运行的阶段；"),_("em",[v._v("注意组件需要在mounted里初始化")])]),v._v(" "),_("li",[v._v("9、运行状态；组件运行的生命周期：")]),v._v(" "),_("li",[v._v("10、组件运行中的生命周期函数，会根据data数据的变化，有选择性的触发0次或n次")])]),v._v(" "),_("h3",{attrs:{id:"已挂载阶段-当data被修改时触发"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#已挂载阶段-当data被修改时触发"}},[v._v("#")]),v._v(" 已挂载阶段，当data被修改时触发；")]),v._v(" "),_("ul",[_("li",[v._v("11、"),_("code",[v._v("beforeUpdate()")]),v._v(":运行生命周期函数的时候，数据肯定是新的，但是也没上呈现的是旧的；")]),v._v(" "),_("li",[v._v("12、正在根据新的data数据，重新渲染内存中的模板结构，并把渲染好模板结构，替换到页面上；")]),v._v(" "),_("li",[v._v("13、"),_("code",[v._v("updated()")]),v._v(":页面完成了更新，此时data数据是最新的，同时页面上的数据，也是最新的；")])]),v._v(" "),_("h3",{attrs:{id:"销毁阶段"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#销毁阶段"}},[v._v("#")]),v._v(" 销毁阶段")]),v._v(" "),_("ul",[_("li",[v._v("14、"),_("code",[v._v("beforeDestroy()")]),v._v(":当执行beforeDestroy的时候，组件即将被销毁，但是黑没有真正开始销毁，组件还是正常可用；data，methodes等数据方法依然可用；")]),v._v(" "),_("li",[v._v("15、销毁中")]),v._v(" "),_("li",[v._v("16、destroyed()：组件已经完成销毁；")])]),v._v(" "),_("h2",{attrs:{id:"rea命周期"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#rea命周期"}},[v._v("#")]),v._v(" rea命周期")]),v._v(" "),_("p",[v._v("react主要分为3个阶段；")]),v._v(" "),_("ul",[_("li",[v._v("1、组件创建阶段：只执行一次；")]),v._v(" "),_("li",[v._v("2、组件运行阶段：按需，根据props属性或state状态改变，有选择行的执行0到多次；")]),v._v(" "),_("li",[v._v("3、组件销毁阶段：只执行1次；")])]),v._v(" "),_("ol",[_("li",[v._v("constructor():构造方法，生成实例对象；")]),v._v(" "),_("li",[v._v("componentWillMount()：将组件要渲染挂载在页面上；发送请求ajax，")]),v._v(" "),_("li",[v._v("render()：将组件渲染在页面上；")]),v._v(" "),_("li",[v._v("componentDidMount():挂载完毕；发送ajax请求；")]),v._v(" "),_("li",[v._v("1-4只执行一次；")])]),v._v(" "),_("p",[v._v("更新：会调用多次；\n6. componentWillUpdate()：组件将要更新\n7. componentDidUpdate()：组件更新完毕\n8. componentWillUnmount():组件要卸载；通常做一些收尾工作，关掉定时器；")]),v._v(" "),_("h2",{attrs:{id:"比较react和vue"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#比较react和vue"}},[v._v("#")]),v._v(" 比较react和vue")]),v._v(" "),_("h3",{attrs:{id:"相同"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#相同"}},[v._v("#")]),v._v(" 相同")]),v._v(" "),_("ul",[_("li",[v._v("都是组件化开发和虚拟dom")]),v._v(" "),_("li",[v._v("都支持props进行父子组件数据通信")]),v._v(" "),_("li",[v._v("支持数据驱动视图，不直接操作真实的dom，更新状态数据界面就自动更新")]),v._v(" "),_("li",[v._v("都支持服务器端渲染")]),v._v(" "),_("li",[v._v("都支持native的方案，react的react Native，vue的weex")])]),v._v(" "),_("h3",{attrs:{id:"不同点"}},[_("a",{staticClass:"header-anchor",attrs:{href:"#不同点"}},[v._v("#")]),v._v(" 不同点")]),v._v(" "),_("ul",[_("li",[v._v("1、数据绑定：")]),v._v(" "),_("li",[_("ul",[_("li",[v._v("vue：实现双向绑定")])])]),v._v(" "),_("li",[_("ul",[_("li",[v._v("react单向")])])]),v._v(" "),_("li",[v._v("2、组件写法不同：")]),v._v(" "),_("li",[_("ul",[_("li",[v._v("react：使用jsx,把html和css全部写在js里；")])])]),v._v(" "),_("li",[_("ul",[_("li",[v._v("vue做法是单文件格式，html，js，css都在一个文件里")])])]),v._v(" "),_("li",[v._v("3、修改数据方式")]),v._v(" "),_("li",[_("ul",[_("li",[v._v("react：this.setState({key:value})")])])]),v._v(" "),_("li",[_("ul",[_("li",[v._v("vue:this.key=value,数据由date管理")])])]),v._v(" "),_("li",[v._v("4、虚拟dom不一样")]),v._v(" "),_("li",[_("ul",[_("li",[v._v("react：状态改变，重新渲染，可以使用shouldComponentUpdate()来控制")])])]),v._v(" "),_("li",[_("ul",[_("li",[v._v("vue会追踪依赖关系，不需要重新渲染整个组件树")])])]),v._v(" "),_("li",[v._v("5、模式")]),v._v(" "),_("li",[_("ul",[_("li",[v._v("react：严格针对mvc的view层")])])]),v._v(" "),_("li",[_("ul",[_("li",[v._v("vue：mvvc模式")])])])])])}),[],!1,null,null,null);_.default=e.exports}}]);