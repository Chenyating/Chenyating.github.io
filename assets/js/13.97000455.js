(window.webpackJsonp=window.webpackJsonp||[]).push([[13],{529:function(e,t,a){"use strict";a.r(t);var r={data:function(){return{formValidate:{name:"",mail:"",city:"",gender:"",interest:[],time:"",desc:""},ruleValidate:{name:[{required:!0,message:"名字不能为空！",trigger:"blur"}],mail:[{required:!0,message:"Mailbox cannot be empty",trigger:"blur"},{type:"email",message:"Incorrect email format",trigger:"blur"}],city:[{required:!0,message:"Please select the city",trigger:"change"}],gender:[{required:!0,message:"Please select gender",trigger:"change"}],interest:[{required:!0,type:"array",min:1,message:"Choose at least one hobby",trigger:"change"},{type:"array",max:2,message:"Choose two hobbies at best",trigger:"change"}],time:[{required:!0,type:"string",message:"Please select time",trigger:"change"}],desc:[{required:!0,message:"Please enter a personal introduction",trigger:"blur"},{type:"string",min:20,message:"Introduce no less than 20 words",trigger:"blur"}]}}},methods:{handleSubmit:function(e){this.$refs[e].validate((function(e){e?console.log("yes"):console.log("false")}))},handleReset:function(e){var t=this;this.$nextTick((function(){t.formValidate={name:"",mail:"",city:"",gender:"",interest:[],time:"",desc:""}}))}}},i=a(5),l=Object(i.a)(r,(function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("if-form",{ref:"formValidate",attrs:{model:e.formValidate,rules:e.ruleValidate,"label-width":80}},[a("if-form-item",{attrs:{label:"Name",prop:"name"}},[a("if-input",{attrs:{placeholder:"Enter your name"},model:{value:e.formValidate.name,callback:function(t){e.$set(e.formValidate,"name",t)},expression:"formValidate.name"}})],1),e._v(" "),a("if-form-item",{attrs:{label:"E-mail",prop:"mail"}},[a("if-input",{attrs:{placeholder:"Enter your e-mail"},model:{value:e.formValidate.mail,callback:function(t){e.$set(e.formValidate,"mail",t)},expression:"formValidate.mail"}})],1),e._v(" "),a("if-form-item",{attrs:{label:"City",prop:"city"}},[a("if-select",{attrs:{placeholder:"Select your city"},model:{value:e.formValidate.city,callback:function(t){e.$set(e.formValidate,"city",t)},expression:"formValidate.city"}},[a("if-option",{attrs:{value:"beijing"}},[e._v("New York")]),e._v(" "),a("if-option",{attrs:{value:"shanghai"}},[e._v("London")]),e._v(" "),a("if-option",{attrs:{value:"shenzhen"}},[e._v("Sydney")])],1)],1),e._v(" "),a("if-form-item",{attrs:{label:"Gender",prop:"gender"}},[a("if-radio-group",{model:{value:e.formValidate.gender,callback:function(t){e.$set(e.formValidate,"gender",t)},expression:"formValidate.gender"}},[a("if-radio",{attrs:{label:"male"}},[e._v("Male")]),e._v(" "),a("if-radio",{attrs:{label:"female"}},[e._v("Female")])],1)],1),e._v(" "),a("if-form-item",{attrs:{label:"Hobby",prop:"interest"}},[a("if-checkbox-group",{model:{value:e.formValidate.interest,callback:function(t){e.$set(e.formValidate,"interest",t)},expression:"formValidate.interest"}},[a("if-checkbox",{attrs:{label:"Eat"}}),e._v(" "),a("if-checkbox",{attrs:{label:"Sleep"}}),e._v(" "),a("if-checkbox",{attrs:{label:"Run"}}),e._v(" "),a("if-checkbox",{attrs:{label:"Movie"}})],1)],1),e._v(" "),a("if-form-item",{attrs:{label:"Desc",prop:"desc"}},[a("if-input",{attrs:{type:"textarea",autosize:{minRows:2,maxRows:5},placeholder:"Enter something..."},model:{value:e.formValidate.desc,callback:function(t){e.$set(e.formValidate,"desc",t)},expression:"formValidate.desc"}})],1),e._v(" "),a("if-form-item",[a("if-button",{attrs:{type:"primary"},on:{click:function(t){return e.handleSubmit("formValidate")}}},[e._v("Submit")]),e._v(" "),a("if-button",{staticStyle:{"margin-left":"8px"},on:{click:function(t){return e.handleReset("formValidate")}}},[e._v("Reset")])],1),e._v("\r\n    "+e._s(e.formValidate)+"\r\n")],1)}),[],!1,null,null,null);t.default=l.exports}}]);