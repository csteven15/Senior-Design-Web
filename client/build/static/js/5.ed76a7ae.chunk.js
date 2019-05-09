(window.webpackJsonp=window.webpackJsonp||[]).push([[5],{352:function(e,t,a){"use strict";var r=a(92),n=a.n(r),i=a(44),o=function(e){var t=e.getIn;return function(e,a){n()(e,"Form value must be specified");var r=a||function(e){return t(e,"form")};return function(a){for(var o=arguments.length,c=new Array(o>1?o-1:0),u=1;u<o;u++)c[u-1]=arguments[u];return n()(c.length,"No fields specified"),1===c.length?t(r(a),e+".values."+c[0]):c.reduce(function(n,o){var c=t(r(a),e+".values."+o);return void 0===c?n:i.a.setIn(n,o,c)},{})}}};t.a=o(i.a)},6095:function(e,t,a){"use strict";var r=a(90),n=a(0),i=a.n(n),o=a(19),c=a(26),u=a(69),s=a(196),p=a(59);t.a=Object(s.a)(u.e,Object(c.withStyles)(function(e){return{layout:Object(r.a)({width:"auto",marginLeft:"auto",marginRight:"auto"},e.breakpoints.up(600+2*e.spacing.unit*2),{width:"100%",marginLeft:"auto",marginRight:"auto"}),stepper:{padding:"".concat(3*e.spacing.unit,"px 0 ").concat(5*e.spacing.unit,"px")},icon:{color:"green"}}}),Object(p.b)(function(e){return{guestForm:e.auth.guestForm}}))(function(e){var t=e.classes,a=e.activeStep,r="#fafafa";return e.guestForm&&(r="#ffffff"),i.a.createElement("div",{className:t.layout},i.a.createElement(o.K,{activeStep:a,className:t.stepper,alternativeLabel:!0,style:{backgroundColor:r}},["Permit","Vehicle","Payment","Review"].map(function(e){return i.a.createElement(o.I,{key:e},i.a.createElement(o.J,null,e))})))})},6379:function(e,t,a){"use strict";a.r(t);var r=a(0),n=a.n(r),i=a(19),o=a(69),c=a(207),u=a(202),s=a(72),p=a(73),l=a(75),m=a(74),d=a(76),h=a(26),f=a(352),b=a(109),g=a(381),D=a(380),y=a(196),v=a(59),E=a(144),V=function(e){var t=e.showErrorsInline,a=e.input,r=a.onChange,i=a.value,o=e.meta,c=o.touched,s=o.error,p=e.maxDate,l=e.minDate,m=t||c;return n.a.createElement(u.a,{keyboard:!1,clearable:!0,disableOpenOnEnter:!0,error:!(!m||!s),helperText:m&&s,value:i,onChange:r,minDate:l,maxdate:p,disablePast:!0,format:"MM/dd/yyyy",mask:function(e){return e?[/\d/,/\d/,"/",/\d/,/\d/,"/",/\d/,/\d/,/\d/,/\d/]:[]}})},w=function(e){var t=e.input,a=e.label,r=e.meta,o=r.touched,c=r.error,u=e.children;return n.a.createElement(i.p,{error:o&&c,margin:"normal",required:!0,fullWidth:!0},n.a.createElement(i.z,{htmlFor:a},a),n.a.createElement(i.H,Object.assign({},t,{inputProps:{name:a.toLowerCase(),id:a}}),u),function(e){var t=e.touched,a=e.error;return t&&a?n.a.createElement(i.r,null,t&&a):null}({touched:o,error:c}))},P=Object(f.a)("PermitForm"),O=function(e){function t(){var e,a;Object(s.a)(this,t);for(var r=arguments.length,n=new Array(r),i=0;i<r;i++)n[i]=arguments[i];return(a=Object(l.a)(this,(e=Object(m.a)(t)).call.apply(e,[this].concat(n)))).state={price:null,permitType:null,startDate:null,endDate:null},a.generatePrice=function(e){if(a.props.permitValues.permit&&a.props.permitValues.startDate&&a.props.permitValues.endDate){var t=new Date(a.props.permitValues.startDate).getTime(),r=new Date(a.props.permitValues.endDate).getTime(),n=a.props.permitValues.permit;a.props.unauthenticated&&(n={permitType:"Visitor"});var i=new Date(t);i.setHours(0,0,0,0);var o=new Date(r);o.setHours(23,59,59,999),i<=o&&a.props.permitValues!==e.permitValues&&a.fetchData(n,i,o)}},a.fetchData=function(e,t,r){fetch("/api/utils/calculatePermitPrice/".concat(e.permitType,"/").concat(t.getTime(),"/").concat(r.getTime()),{method:"GET",headers:{"Content-Type":"application/json"},body:null}).then(function(e){return e.json()}).then(function(n){a.props.dispatch(Object(b.b)("PermitForm","purchasePrice",n.data)),a.setState({price:n.data,startDate:t.getTime(),endDate:r.getTime(),permitType:e})}).catch(function(e){return console.log(e)})},a}return Object(d.a)(t,e),Object(p.a)(t,[{key:"componentDidUpdate",value:function(e){return this.props.permitValues.permit===e.permitValues.permit&&this.props.permitValues.purhasePrice===e.permitValues.purhasePrice&&this.props.permitValues.startDate===e.permitValues.startDate&&this.props.permitValues.endDate===e.permitValues.endDate||this.generatePrice(e),!1}},{key:"render",value:function(){var e=this,t=this.props,a=t.classes,r=t.handleSubmit,o=t.allowedPermits,c=t.unauthenticated,u=this.props.permitValues.purchasePrice;return n.a.createElement("form",{onSubmit:r},n.a.createElement(i.t,{container:!0,spacing:24},n.a.createElement(i.t,{item:!0,sm:6,xs:12},n.a.createElement(g.a,{name:"permit",component:w,label:"Select a Type",required:!0},c?n.a.createElement(i.F,{value:"Visitor"},"Visitor"):o.map(function(e,t){return n.a.createElement(i.F,{key:t,value:e},e.permitType," ","A"===e.permitType?" for space ".concat(e.spaceNumber):null)}))),n.a.createElement(i.t,{item:!0,xs:12},n.a.createElement(i.s,{component:"legend"},"Select a Start Date"),n.a.createElement(g.a,{id:"startDate",name:"startDate",component:V,required:!0,minDate:new Date})),n.a.createElement(i.t,{item:!0,xs:12},n.a.createElement(i.s,{component:"legend"},"Select an Expiration Date"),n.a.createElement(g.a,{id:"endDate",name:"endDate",component:V,required:!0,minDate:this.props.permitValues.startDate})),n.a.createElement(i.t,{item:!0,xs:12},n.a.createElement(i.s,{component:"legend"},"Price"),n.a.createElement(g.a,{name:"purchasePrice",component:"input",type:"hidden"}),u?(u/100).toLocaleString("en-US",{style:"currency",currency:"USD"}):"Select a permit type to see price.")),n.a.createElement("br",null),n.a.createElement("div",{className:a.buttons},!0===c?n.a.createElement(i.c,{type:"button",variant:"contained",color:"secondary",onClick:function(){e.props.history.goBack(),e.props.finishGuest(),e.props.resetPermitForm(),e.props.resetVehicleForm()}},"Back"):n.a.createElement(i.c,{type:"button",variant:"contained",color:"secondary",onClick:function(){e.props.history.push("/"),e.props.finishGuest(),e.props.resetPermitForm(),e.props.resetVehicleForm()}},"Home"),n.a.createElement(i.c,{type:"submit",variant:"contained",color:"secondary"},"Next")))}}]),t}(n.a.Component),F=Object(y.a)(o.e,Object(D.a)({form:"PermitForm",initialValues:{startDate:new Date,endDate:new Date},destroyOnUnmount:!1,forceUnregisterOnUnmount:!0,validate:function(e){var t={};return["permit","endDate"].forEach(function(a){e[a]||(t[a]="Required")}),e.startDate&&e.endDate&&new Date(e.startDate)>new Date(e.endDate)&&(t.endDate="End Date can't be before Start Date"),t}}),Object(h.withStyles)(function(){return{button:{margin:12},imageInput:{cursor:"pointer",position:"absolute",top:0,bottom:0,right:0,left:0,width:"100%",opacity:0},FFS:{position:"absolute",lineHeight:"1.5",top:"38",transition:"none",zIndex:"1",transform:"none",transformOrigin:"none",pointerEvents:"none",userSelect:"none",fontSize:"16",color:"rgba(0, 0, 0, 0.8)"},buttons:{display:"flex",justifyContent:"space-between"}}}),Object(v.b)(function(e,t){return t.unauthenticated?{permitValues:P(e,"startDate","endDate","permit","purchasePrice")}:{allowedPermits:e.auth.user.allowedPermits,guestForm:e.auth.guestForm,permitValues:P(e,"permit","startDate","endDate","purchasePrice")}},function(e){return{finishGuest:function(){return e(Object(E.b)())},resetPermitForm:function(){return e(Object(b.c)("PermitForm"))},resetVehicleForm:function(){return e(Object(b.c)("VehiclesForm"))}}}))(O),j=a(6095);t.default=Object(o.e)(function(e){var t=e.unauthenticated;return n.a.createElement(n.a.Fragment,null,n.a.createElement(i.V,{variant:"h4",gutterBottom:!0,component:"h4"},"Please Fill out your Permit Information"),n.a.createElement(j.a,{activeStep:0}),n.a.createElement(u.b,{utils:c.a},n.a.createElement(F,{onSubmit:function(t){return function(e,t){t.unauthenticated?t.history.push("/unauthenticated/page-2"):t.history.push("/authenticated/page-2")}(0,e)},unauthenticated:t})))})}}]);
//# sourceMappingURL=5.ed76a7ae.chunk.js.map