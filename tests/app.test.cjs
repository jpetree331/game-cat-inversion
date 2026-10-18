// A small DOM adapter exercises the real app/input/simulation seam. This is not browser QA.
const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
function app(){
  let document,rendered,raf,now=100;
  class Element{constructor(tag){this.tagName=tag;this.children=[];this.listeners={};this.hidden=false;this.attributes={};this.textContent=''}append(...c){this.children.push(...c)}replaceChildren(...c){this.children=c}setAttribute(k,v){this.attributes[k]=v}removeAttribute(k){delete this.attributes[k]}addEventListener(k,f){(this.listeners[k]||=[]).push(f)}focus(){document.activeElement=this}getContext(){return {}}setPointerCapture(){}get lastChild(){return this.children.at(-1)}insertBefore(a,b){this.children.splice(this.children.indexOf(b),0,a)}querySelectorAll(selector){return this.children.flatMap(c=>[...(selector==='button'&&c instanceof Button?[c]:[]),...c.querySelectorAll(selector)])}querySelector(s){return this.querySelectorAll(s)[0]}}
  class Button extends Element{constructor(){super('button')}}
  const elements={},listeners={},windowListeners={},saved={};
  const storage={getItem:k=>saved[k]||null,setItem:(k,v)=>saved[k]=v};
  document={activeElement:null,hidden:false,getElementById(id){return elements[id]||=(['game','overlay','room-title','room-number','seal-count','gravity','message','progress','hint-text'].includes(id)?new Element(id):new Button())},createElement:t=>t==='button'?new Button():new Element(t),addEventListener(k,f){(listeners[k]||=[]).push(f)}};
  const window={localStorage:storage,matchMedia:()=>({matches:true}),addEventListener(k,f){(windowListeners[k]||=[]).push(f)}};
  const context=vm.createContext({document,window,HTMLButtonElement:Button,CatEngine:require('../src/engine.js'),CatLevels:require('../src/levels.js'),CatProgress:require('../src/progress.js'),CatRender:(_ctx,s)=>rendered=s,requestAnimationFrame:f=>raf=f,console});
  vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/app.js'),'utf8'),context);
  const tick=(n=1)=>{for(let i=0;i<n;i++){now+=1000/120;raf(now)}};tick();
  const key=(code,down=true,repeat=false,target=elements.game)=>{for(const f of listeners[down?'keydown':'keyup']||[])f({code,repeat,target,preventDefault(){}})};
  return{elements,key,tick,get state(){return rendered},blur(){for(const f of windowListeners.blur)f()},click(id){elements[id].onclick()},choose(n){elements.rooms.onclick();const buttons=elements.overlay.querySelectorAll('button');buttons[n].onclick();tick()},storage};
}
test('app ignores held-space repeats, then permits a fresh press after landing',()=>{const a=app();a.key('Space');a.tick(40);assert.equal(a.state.cat.y,24);a.key('Space',true,true);a.tick(40);assert.equal(a.state.flips,1);a.key('Space',false);a.key('Space');a.tick(40);assert.equal(a.state.cat.y,224);assert.equal(a.state.flips,2)});
test('pause and focus loss clear held movement and freeze time',()=>{const a=app();a.key('KeyD');a.tick(60);a.blur();const x=a.state.cat.x,t=a.state.elapsed;a.tick(120);assert.equal(a.state.cat.x,x);assert.equal(a.state.elapsed,t);assert.equal(a.elements.overlay.hidden,false);a.key('Escape');a.tick(60);assert.equal(a.state.cat.x,x)});
test('restart resets UI, inversion, and held keys; buttons do not invoke Space flip',()=>{const a=app();a.key('Space');a.tick(30);a.key('KeyD');a.key('KeyR');a.tick(60);assert.equal(a.state.cat.x,48);assert.equal(a.state.cat.gravity,1);assert.equal(a.state.flips,0);a.key('Space',true,false,a.elements.sound);a.tick(30);assert.equal(a.state.flips,0)});
test('death retries automatically with fresh puzzle state',()=>{const a=app();a.choose(1);a.key('KeyD');a.tick(200);assert.equal(a.state.status,'playing');assert.equal(a.state.cat.x,48);assert.equal(a.state.seals.size,0);assert.match(a.elements.message.textContent,/1 retries/)});
test('pointer cancellation releases touch movement',()=>{const a=app(),left=a.elements.left;left.listeners.pointerdown[0]({pointerId:1,preventDefault(){}});a.tick(12);const x=a.state.cat.x;left.listeners.pointercancel[0]({pointerId:1});a.tick(24);assert.equal(a.state.cat.x,x)});
test('field HUD follows entry and exit, and keyboard plus touch refuse inversion inside',()=>{
  const a=app();a.choose(9);a.key('KeyD');a.tick(126);a.key('KeyD',false);
  assert.match(a.elements.gravity.textContent,/LOCKED/);assert.equal(a.elements.flip.attributes['aria-disabled'],'true');
  a.key('Space');a.key('Space',false);a.tick(2);a.click('flip');a.tick(2);assert.equal(a.state.flips,0);assert.equal(a.state.cat.gravity,1);
  a.key('KeyA');a.tick(36);a.key('KeyA',false);assert.equal(a.elements.flip.attributes['aria-disabled'],'false');
  a.key('Space');a.tick(30);assert.equal(a.state.cat.gravity,-1);
});
test('pressure ferry pauses in place and restart restores its remote dock',()=>{
  const a=app();a.choose(10);a.key('KeyD');a.tick(44);a.key('KeyD',false);a.tick(150);
  const x=a.state.movers[0].x;assert(x<310&&x>64);a.key('Escape');a.tick(240);assert.equal(a.state.movers[0].x,x);
  a.click('restart');a.tick(1);assert.equal(a.state.movers[0].x,310);assert.equal(a.state.buttons.size,0);assert.match(a.elements['room-number'].textContent,/11 \/ 12/);
});
test('all twelve solutions complete through app keyboard events and room selection',()=>{const a=app(),levels=require('../src/levels.js');for(let i=0;i<levels.length;i++){a.choose(i);for(const command of levels[i].route){if(a.state.status==='complete')break;if(typeof command==='object'){a.tick(Math.ceil(command.wait*120))}else if(command==='f'){a.key('Space');a.key('Space',false);a.tick(1);for(let n=0;n<240&&!a.state.cat.grounded&&a.state.status==='playing';n++)a.tick()}else{const code=command>a.state.cat.x?'KeyD':'KeyA';a.key(code);for(let n=0;n<1200&&Math.abs(a.state.cat.x-command)>1&&a.state.status==='playing';n++)a.tick();a.key(code,false);for(let n=0;n<240&&!a.state.cat.grounded&&a.state.status==='playing';n++)a.tick()}assert.notEqual(a.state.status,'dead')}assert.equal(a.state.status,'complete',`room ${i+1}`);assert.equal(a.elements.overlay.hidden,false)}assert.match(a.elements.progress.textContent,/12 \/ 12/);assert.match(a.elements.overlay.children[0].textContent,/Home/)});

