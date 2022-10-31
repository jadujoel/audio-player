"use strict";(()=>{var Yt=(u,n,o)=>{if(!n.has(u))throw TypeError("Cannot "+o)};var c=(u,n,o)=>(Yt(u,n,"read from private field"),o?o.call(u):n.get(u)),j=(u,n,o)=>{if(n.has(u))throw TypeError("Cannot add the same private member more than once");n instanceof WeakSet?n.add(u):n.set(u,o)};define("ecas-utils",[],()=>(()=>{"use strict";var u={d:(t,e)=>{for(var r in e)u.o(e,r)&&!u.o(t,r)&&Object.defineProperty(t,r,{enumerable:!0,get:e[r]})},o:(t,e)=>Object.prototype.hasOwnProperty.call(t,e),r:t=>{typeof Symbol<"u"&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})}},n={};u.r(n),u.d(n,{Assert:()=>d,AssertExists:()=>I,AssertIsDefined:()=>T,AssertIsFunction:()=>D,AssertIsNotNull:()=>N,AssertIsNumber:()=>ut,AssertIsObject:()=>P,AssertIsString:()=>M,AssertObjectNotEmpty:()=>st,AssertionError:()=>o,Exists:()=>yt,IsDefined:()=>lt,IsFunction:()=>ft,IsNotNull:()=>mt,IsObject:()=>dt,IsString:()=>ct,StrictMap:()=>Zt,StrictMapError:()=>tt,add:()=>J,arrayAdd:()=>q,arrayAddMutate:()=>jt,arrayDifference:()=>Ft,arrayPowerMutate:()=>Et,arraySum:()=>St,asDeepWriteable:()=>kt,asWriteable:()=>$t,assert:()=>at,clamp:()=>R,clampZeroToOne:()=>Vt,cloneDeep:()=>S,create:()=>v,decibelFromLinear:()=>Ht,decibelsToLinear:()=>Z,endTime:()=>rt,endTimer:()=>Gt,entries:()=>F,enumKeys:()=>Kt,enumValues:()=>Wt,exists:()=>bt,firstElement:()=>Dt,getFirstValueInNDimensionalArray:()=>W,hasOwnProperty:()=>m,ignoreUnused:()=>Lt,includes:()=>It,inxrange:()=>Mt,isArray:()=>x,isArrayBuffer:()=>pt,isArrayEmpty:()=>C,isArrayNonEmpty:()=>wt,isDefined:()=>A,isFalse:()=>At,isFirefox:()=>Bt,isFunction:()=>U,isIOS:()=>Ct,isKeyof:()=>vt,isNonEmptyArray:()=>Ot,isNotNull:()=>z,isNull:()=>w,isNumber:()=>b,isNumeric:()=>Tt,isObject:()=>B,isObjectEmpty:()=>k,isSafari:()=>zt,isString:()=>O,isStringNumber:()=>V,isTrue:()=>gt,isUndefined:()=>$,keys:()=>s,lastElement:()=>Pt,linearFromDecibel:()=>_t,linearToDecibels:()=>G,max:()=>H,min:()=>Ut,noop:()=>qt,randomShuffle:()=>Y,randomizeValues:()=>Rt,range:()=>L,subtract:()=>Q,timeConstant:()=>Jt,tryAsync:()=>Qt,trySync:()=>Xt,unique:()=>Nt,wait:()=>et,xrange:()=>_,zip:()=>xt,zipn:()=>K});class o extends Error{constructor(e){super(e),this.name="AssertionError"}}let s=Object.keys,v=Object.create,F=Object.entries;function m(t,e){return Object.prototype.hasOwnProperty.call(t,e)}function d(t,e){if(!t)throw O(e)?new o(e):A(e?.Err)?new Error(e?.msg):new o(e?.msg)}function M(t,e){d(O(t),{msg:e||`[${typeof t}] is not a string`})}function ut(t,e){d(b(t),{msg:e||`thing ${t} of type ${typeof t} is not of type number.`})}function P(t,e){d(B(t),{msg:e||`thing: ${t} of type ${typeof t} is not of type object.`})}function D(t,e){d(U(t),{msg:e||`[${typeof t}] is not a string`})}function T(t,e){d(A(t),{msg:e||`thing: ${t} is undefined`})}function N(t,e){d(!w(t),{msg:e||`thing: ${t} is null`})}function I(t,e){T(t,e),N(t,e)}function st(t,e){d(!k(t),{msg:e||`thing: ${t} is empty.`})}function at(t,e){if(!t)throw console.error({msg:e||"condition unsatified"})}function ct(t,e){return M(t,e),t}function ft(t,e){return D(t,e),t}function lt(t,e){return T(t,e),t}function mt(t,e){return N(t,e),t}function dt(t,e){return P(t,e),t}function yt(t,e){return I(t,e),t}let ht=typeof ArrayBuffer=="function";function pt(t){return ht&&(t instanceof ArrayBuffer||Object.prototype.toString.call(t)==="[object ArrayBuffer]")}function A(t){return!$(t)}function $(t){return t===void 0}function k(t){return s(t).length===0}function z(t){return!w(t)}function bt(t){return A(t)&&z(t)}function w(t){return t===null}function B(t){return typeof t=="object"&&!w(t)}function x(t){return Array.isArray(t)}function gt(t){return t===!0}function At(t){return t===!1}function C(t){return t.length>0}function wt(t){return!C(t)}function Ot(t){return Array.isArray(t)&&t.length>0}function b(t){return typeof t=="number"&&!isNaN(t)}function U(t){return typeof t=="function"}function O(t){return typeof t=="string"}function vt(t,e){return s(e).includes(t)}function Tt(t){return!!b(t)||!!O(t)&&V(t)}function V(t){return!isNaN(parseFloat(t))}function Nt(t){return[...new Set(t)]}function xt(t,e){return d(t.length===e.length,"zip arrays of unequal length"),t.map((r,i)=>[r,e[i]])}function*K(...t){let e=t.map(r=>r[Symbol.iterator]());for(;;){let r=e.map(i=>i.next());if(r.some(({done:i})=>i))break;yield r.map(({value:i})=>i)}}function W(t){return x(t)?W(t[0]):t[0]}function St(t){let e=0;for(let r of t)e+=r;return e}function jt(t,e){for(let r=0;r<t.length;r++)t[r]+=e;return t}function Et(t,e=2){for(let r=0;r<t.length;r++)t[r]=Math.pow(t[r],e);return t}function q(t,e){return t.map(r=>r+e)}function Ft(t,e){let r=new Array(t.length);for(let i=0;i<t.length;i++)r[i]=e[i]-t[i];return r}function L(t){return[...Array(t).keys()]}function _(t,e){return q(L(t-e),t)}function Mt(t,e){return K(_(t,e))}function Pt(t){return t[t.length-1]}function Dt(t){return t[0]}function It(t,e){return Array.prototype.includes.call(t,e)}function $t(t){return t}function kt(t){return t}function zt(){return window.navigator.userAgent.indexOf("Safari")>-1&&window.navigator.userAgent.indexOf("Chrome")<0}function Bt(){return window.navigator.userAgent.indexOf("Firefox")!==-1}function Ct(){return/iPad|iPhone|iPod/.test(navigator.userAgent)&&!m(window,"MSStream")}function H(t,e){return Math.max(t,e)}function Ut(t,e){return Math.min(t,e)}function R(t,e,r){return Math.min(Math.max(t,e),r)}function Vt(t){return R(t,0,1)}function S(t){return Array.isArray(t)?t.map(e=>S(e)):t instanceof Date?new Date(t.getTime()):t&&typeof t=="object"?Object.getOwnPropertyNames(t).reduce((e,r)=>(Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r)),e[r]=S(t[r]),e),Object.create(Object.getPrototypeOf(t))):t}let Kt=t=>Object.keys(t).filter(e=>Number.isNaN(+e)),Wt=t=>Object.values(t),qt=()=>{};function Lt(...t){return t}function _t(t){return Z(t)}function Ht(t){return G(t)}function Z(t){return Math.pow(10,.05*t)}function G(t){return t?20*Math.log10(t):-1e3}function J(...t){let e=Number(0);for(let r of t){let i=Number(r);Number.isFinite(i)&&(e+=i)}return e}function Q(t,e){let r=0,i=Number(t),y=Number(e);return Number.isFinite(i)&&(r=i),Number.isFinite(y)&&(r-=y),r}function Rt(t){if(b(t))return t;let e=!0,r=/^-?\d*\.?\d+,-?\d*\.?\d+$/,i=/^-?\d*\.?\d+$/,y,nt;if(b(t)||!Array.isArray(t))return y=t,Number(y);if(t.length>0){if(nt=t.map(h=>{if(i.test(h))return h;if(x(h))return X(parseFloat(h[0]),parseFloat(h[1]));if(r.test(h)){let it=h.split(",");return X(parseFloat(it[0]),parseFloat(it[1]))}return e=!1,console.warn("Invalid random value format: "+t),null}),e)return y=Y(nt)[0],parseFloat(y)}else console.warn("Invalid random value: empty array");throw new Error("Randomize values should not reach this line")}function X(t,e){return(Math.random()*(e-t)+t).toFixed(3)}function Y(t){let e=t.map(r=>[Math.random(),r]);return e.sort(),e.map(r=>r[1])}var a;function f(t,e,r,i){if(r==="a"&&!i)throw new TypeError("Private accessor was defined without a getter");if(typeof e=="function"?t!==e||!i:!e.has(t))throw new TypeError("Cannot read private member from an object whose class did not declare it");return r==="m"?i:r==="a"?i.call(t):i?i.value:e.get(t)}class tt extends Error{constructor(e){super(e),this.name="StrictMapError"}}class Zt{constructor(){a.set(this,new Map),this.clear=()=>f(this,a,"f").clear,this.delete=e=>f(this,a,"f").delete(e),this.entries=()=>f(this,a,"f").entries(),this.has=e=>f(this,a,"f").has(e),this.keys=()=>f(this,a,"f").keys(),this.size=()=>f(this,a,"f").size,this.values=()=>f(this,a,"f").values()}get(e){if(!f(this,a,"f").has(e))throw new tt(`Key: '${e}' does not exist.`);return f(this,a,"f").get(e)}set(e,r){return f(this,a,"f").set(e,r),this}get[(a=new WeakMap,Symbol.toStringTag)](){return"StrictMap"}get[Symbol.iterator](){return f(this,a,"f").entries()}forEach(e,r){return f(this,a,"f").forEach(e,r)}}function et(t=0){return new Promise(e=>{setTimeout(()=>e(),1e3*t)})}function rt(t,e,r=0){return J(H(Q(e,t),0),r)}function Gt(t,e,r=0){return et(rt(t,e,r))}function Jt(t){return t/3}function Qt(t){return async(...e)=>{try{return[null,await t(...e)]}catch(r){return[r,null]}}}function Xt(t){return(...e)=>{try{return[null,t(...e)]}catch(r){return[r,null]}}}return n})());var E=class extends Error{constructor(o){super(o);this.name="AutomatorError"}},l,p,ot=class{constructor(n){j(this,l,new(void 0));j(this,p,new(void 0));this.AutomatableParameters=n}automate({paramId:n,valueCurve:o,when:s,duration:v}){let m=c(this,l).get(n);m==null||m.cancelAndHoldAtTime((void 0)(s-.5,0)),m==null||m.setValueCurveAtTime(o,s,v)}add(n,o,s){if(c(this,l).has(n))throw new E(`AudioParam with id ${n} has already been added.`);c(this,l).set(n,o),c(this,p).set(n,s||o.value)}set(n,o,s){c(this,l).set(n,o),c(this,p).set(n,s||o.value)}cancel({paramId:n,when:o}){let s=c(this,l).get(n);s==null||s.cancelScheduledValues(o)}get(n){return c(this,l).get(n)}current(n){return c(this,l).get(n).value}getDefault(n){return c(this,p).get(n)}setDefault(n,o){c(this,p).set(n,o)}dispose(){c(this,l).clear()}};l=new WeakMap,p=new WeakMap;})();
//# sourceMappingURL=bundle.js.map
