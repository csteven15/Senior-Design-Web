(window.webpackJsonp=window.webpackJsonp||[]).push([[16],{6091:function(e,t,a){"use strict";function n(e,t){if(null==e)return{};var a,n,r=function(e,t){if(null==e)return{};var a,n,r={},o=Object.keys(e);for(n=0;n<o.length;n++)a=o[n],t.indexOf(a)>=0||(r[a]=e[a]);return r}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)a=o[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(r[a]=e[a])}return r}a.d(t,"a",function(){return n})},6110:function(e,t,a){"use strict";var n=a(72),r=a(73),o=a(75),l=a(74),c=a(76),i=a(6091),u=a(0),s=a.n(u),m=a(19),p=a(381),d=a(380),f=a(196),h=a(69),b=a(59),E=function(e){var t=e.input,a=e.label,n=e.meta,r=n.touched,o=n.error,l=e.children;return s.a.createElement(m.p,{error:r&&o,margin:"normal",required:!0,fullWidth:!0},s.a.createElement(m.z,{htmlFor:a},a),s.a.createElement(m.H,Object.assign({},t,{inputProps:{name:a.toLowerCase(),id:a}}),l),function(e){var t=e.touched,a=e.error;return t&&a?s.a.createElement(m.r,null,t&&a):null}({touched:r,error:o}))},g=function(e){var t=e.label,a=e.input,n=e.disabled,r=e.autoComplete,o=e.meta,l=o.touched,c=o.invalid,u=o.error,p=Object(i.a)(e,["label","input","disabled","autoComplete","meta"]);return s.a.createElement(m.T,Object.assign({disabled:n,label:t,placeholder:t,autoComplete:r,error:l&&c,helperText:l&&"true"===u},a,p))},v=function(e){function t(){var e,a;Object(n.a)(this,t);for(var r=arguments.length,c=new Array(r),i=0;i<r;i++)c[i]=arguments[i];return(a=Object(o.a)(this,(e=Object(l.a)(t)).call.apply(e,[this].concat(c)))).fetchPermitsData=function(){var e=a.props.location.state.carData,t={tag:e.licensePlate.tag,state:e.licensePlate.state,make:e.make,model:e.model,year:e.year,color:e.color};a.props.initialize(t)},a}return Object(c.a)(t,e),Object(r.a)(t,[{key:"componentDidMount",value:function(){this.props.edit&&this.fetchPermitsData()}},{key:"render",value:function(){var e=this,t=this.props.handleSubmit,a=this.props.globalFormValues.statesList,n=this.props.globalFormValues.vehicleMakesList,r=this.props.globalFormValues.vehicleColorsList;return s.a.createElement(s.a.Fragment,null,s.a.createElement("form",{onSubmit:t},s.a.createElement(m.t,{container:!0,spacing:24},s.a.createElement(m.t,{item:!0,xs:12,sm:6},s.a.createElement(m.p,{margin:"normal",required:!0,fullWidth:!0},s.a.createElement(p.a,{name:"tag",component:g,label:"Tag",autoFocus:!0,autoComplete:"tag"}))),s.a.createElement(m.t,{item:!0,sm:6,xs:12},s.a.createElement(p.a,{name:"state",component:E,label:"State",required:!0},a.map(function(e,t){return s.a.createElement(m.F,{key:t,value:e},e)}))),s.a.createElement(m.t,{item:!0,sm:6,xs:12},s.a.createElement(p.a,{name:"make",component:E,label:"Make",required:!0},n.map(function(e,t){return s.a.createElement(m.F,{key:t,value:e},e)}))),s.a.createElement(m.t,{item:!0,xs:12,sm:6},s.a.createElement(m.p,{margin:"normal",required:!0,fullWidth:!0},s.a.createElement(p.a,{name:"model",component:g,label:"Model",autoFocus:!0,autoComplete:"model"}))),s.a.createElement(m.t,{item:!0,sm:6,xs:12},s.a.createElement(p.a,{name:"color",component:E,label:"Color",required:!0},r.map(function(e,t){return s.a.createElement(m.F,{key:t,value:e},e)}))),s.a.createElement(m.t,{item:!0,xs:12,sm:6},s.a.createElement(m.p,{margin:"normal",required:!0,fullWidth:!0},s.a.createElement(p.a,{name:"year",component:g,label:"Year",autoFocus:!0,autoComplete:"licenseYear"})))),s.a.createElement("br",null),s.a.createElement("div",{style:{display:"flex",justifyContent:"space-between"}},s.a.createElement(m.c,{type:"button",variant:"contained",onClick:function(){return e.props.history.goBack()}},"Back"),this.props.unauthenticated?s.a.createElement(m.c,{type:"submit",variant:"contained",color:"primary"},"Next"):s.a.createElement(m.c,{type:"submit",variant:"contained",color:"primary"},this.props.edit?"Update":"Create"))))}}]),t}(s.a.Component);t.a=Object(f.a)(h.e,Object(d.a)({form:"VehiclesForm",validate:function(e){var t={};return["make","model","year","color","tag","state"].forEach(function(a){e[a]||(t[a]="Required")}),t}}),Object(b.b)(function(e){return{globalFormValues:e.ui.formValues}}))(v)},6383:function(e,t,a){"use strict";a.r(t);var n=a(0),r=a.n(n),o=a(19),l=a(26),c=a(196),i=a(59),u=a(144),s=a(66),m=a(6110),p=a(65),d=a.n(p),f=void 0;t.default=Object(c.a)(Object(l.withStyles)(function(e){return{content:{flexGrow:1,padding:1*e.spacing.unit,height:"100vh",overflow:"auto"}}}),Object(i.b)(function(e){return{username:e.auth.user.username}},function(e){return{fetchHelp:function(t,a,n,r){return e(Object(u.a)(t,a,n,r))},dispatch:e}}))(function(e){var t=e.classes;return r.a.createElement("div",{className:t.content},r.a.createElement(o.V,{variant:"h4",gutterBottom:!0,component:"h4"},"Edit Vehicle Information"),r.a.createElement(m.a,{edit:!0,onSubmit:function(t){return function(e,t){var a="/api/users/specific/".concat(t.username,"/updateCar"),n=JSON.stringify({id:t.location.state.carData._id,make:e.make,model:e.model,year:e.year,color:e.color,tag:e.tag,state:e.state});t.fetchHelp().then(function(e){d.a.post(a,n,{headers:e.headers}).then(function(e){400!==e.status?(t.dispatch(Object(s.a)({message:"Successfully updated vehicle"})),t.history.goBack()):f.props.dispatch(Object(s.a)({message:"Failed to update vehicle",options:{variant:"warning"}}))})}).catch(function(e){console.log(e)})}(t,e)}}))})}}]);
//# sourceMappingURL=16.c3af3a3e.chunk.js.map