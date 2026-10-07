import fs from "node:fs";
const html = fs.readFileSync(new URL("./index.html", import.meta.url), "utf8");
const m = html.match(/<script>([\s\S]*)<\/script>/);
const script = m[1];
let CALLS={fill:0,fillText:0,stroke:0,clearRect:0};
const ctx = new Proxy({}, { get: (t,p)=> (p in CALLS? (()=>{CALLS[p]++;}) : (p in t? t[p] : ()=>{})) , set:(t,p,v)=>{t[p]=v;return true;} });
class El{constructor(id=""){this.id=id;this.style={};this._c=[];this._h="";this.textContent="";this.disabled=false;this.classList={_s:new Set(),add(c){this._s.add(c)},remove(c){this._s.delete(c)},toggle(c,f){f===undefined?(this._s.has(c)?this._s.delete(c):this._s.add(c)):(f?this._s.add(c):this._s.delete(c))},contains(c){return this._s.has(c)}};this.clientWidth=400;this.clientHeight=400;this.parentElement=null;}set innerHTML(v){this._h=v;this._c=[];}get innerHTML(){return this._h;}get children(){return this._c;}appendChild(c){this._c.push(c);return c;}addEventListener(){}querySelector(){return new El();}getBoundingClientRect(){return{left:0,top:0,width:400,height:400};}getContext(){return ctx;}}
const store={};const doc={getElementById(id){return store[id]||(store[id]=new El(id));},createElement(){return new El();},addEventListener(){},visibilityState:"visible"};doc.getElementById("board").parentElement=new El();
const winL={};global.window={addEventListener(t,f){(winL[t]=winL[t]||[]).push(f);},devicePixelRatio:1,innerWidth:400,innerHeight:800};
global.document=doc;global.navigator={language:"en"};global.localStorage={_d:{},getItem(k){return this._d[k]??null;},setItem(k,v){this._d[k]=v;},removeItem(k){delete this._d[k];}};
let fr=0;global.requestAnimationFrame=(cb)=>{if(fr++<2)queueMicrotask(()=>cb(0));return fr;};global.cancelAnimationFrame=()=>{};global.setInterval=()=>0;global.confirm=()=>false;
let errs=[];const oe=console.error;console.error=(...a)=>errs.push(a.join(" "));
try{ new Function(script)(); }catch(e){ errs.push("script threw: "+(e.stack||e)); }
for(const fn of (winL["load"]||[])){try{fn();}catch(e){errs.push("init threw: "+(e.stack||e));}}
await new Promise(r=>setTimeout(r,30)); console.error=oe;
const o=doc.getElementById("orders").children.length,g=doc.getElementById("gardenGrid").children.length,u=doc.getElementById("upgradesList").children.length;
console.log(`orders=${o} plots=${g} upgrades=${u}`);
if(errs.length){console.log("ERRORS:\n"+errs.join("\n"));process.exit(1);}
if(o!==4||g!==12||u!==5){console.log("FAIL");process.exit(1);}
console.log("draw calls:", JSON.stringify(CALLS));
if(CALLS.fill < 36){console.log("FAIL: board did not draw its 36 cells");process.exit(1);}
console.log("SMOKE OK — single-file build boots AND draws the 6x6 board with no runtime errors");
process.exit(0);
