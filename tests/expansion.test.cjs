const {test}=require('node:test');
const assert=require('node:assert/strict');
const E=require('../src/engine.js');
const base=()=>({spawn:{x:48,y:224},exit:{x:420,y:214,w:24,h:26},seals:[{id:'a',x:420,y:26,w:14,h:14}],platforms:[],hazards:[]});
const run=(s,seconds,move=0,rate=120)=>{for(let n=0;n<Math.round(seconds*rate);n++)E.step(s,{move},1/rate)};
const ferry=()=>({...base(),buttons:[{id:'call',x:80,y:232,w:24,h:8}],movingPlatforms:[{id:'ferry',buttonId:'call',x:300,y:140,w:64,h:12,toX:64,toY:140,speed:50}]});

test('pits remove floor collision and cause one death after falling out',()=>{
  const l={...base(),pits:[{x:100,w:100}]},s=E.create(l);
  run(s,1.1,1);assert(s.cat.y>224);assert(!s.cat.grounded);assert(!E.flip(s));
  run(s,1);assert.equal(s.status,'dead');assert.equal(s.events.filter(e=>e==='death').length,1);
  assert.deepEqual(E.floorSolids(l).map(r=>[r.x,r.w]),[[0,100],[200,280]]);
});
test('pit lip supports the cat until its entire body leaves solid ground',()=>{
  const s=E.create({...base(),pits:[{x:100,w:100}]});s.cat.x=95;run(s,.1);assert.equal(s.cat.y,224);
  s.cat.x=101;run(s,.1);assert(s.cat.y>224);
});
test('fields block inversion on contact, without changing gravity or flip count',()=>{
  const s=E.create({...base(),fields:[{x:100,y:24,w:100,h:216}]});s.cat.x=87;
  assert(E.inField(s));assert(!E.flip(s));assert.equal(s.cat.gravity,1);assert.equal(s.flips,0);
  s.cat.x=200;assert(!E.inField(s));assert(E.flip(s));
});
test('entering a field in flight does not cancel an existing inversion',()=>{
  const s=E.create({...base(),fields:[{x:24,y:90,w:100,h:50}]});assert(E.flip(s));run(s,.3);
  assert.equal(s.cat.y,24);assert.equal(s.cat.gravity,-1);assert.equal(s.status,'playing');
});
test('pressure button summons the ferry only while occupied, then returns it',()=>{
  const s=E.create(ferry());run(s,1);assert.equal(s.movers[0].x,300);
  s.cat.x=85;run(s,5);assert.equal(s.movers[0].x,64);assert(s.buttons.has('call'));
  s.cat.x=48;run(s,5);assert.equal(s.movers[0].x,300);assert.equal(s.buttons.size,0);
});
test('floor button to inverted ferry carries cat safely over a pit',()=>{
  const l={...ferry(),pits:[{x:150,w:200}]},s=E.create(l);s.cat.x=85;run(s,5);assert(E.flip(s));run(s,5.5);
  assert.equal(s.status,'playing');assert.equal(s.cat.gravity,-1);assert.equal(s.cat.y,152);
  assert(s.cat.x>300);assert(s.cat.grounded);assert.equal(s.movers[0].x,300);
});
for(const gravity of [1,-1])test(`moving platforms carry riders with gravity ${gravity}`,()=>{
  const s=E.create(ferry());s.movers[0].x=100;s.cat.x=110;s.cat.gravity=gravity;s.cat.y=gravity===1?124:152;
  run(s,1);assert(Math.abs(s.cat.x-160)<.01);assert.equal(s.cat.y,gravity===1?124:152);assert(s.cat.grounded);
});
test('vertical platform carries riders without losing contact',()=>{
  const l=ferry();l.movingPlatforms[0]={...l.movingPlatforms[0],x:200,y:80,toX:200,toY:180};
  const s=E.create(l);s.movers[0].y=180;s.cat.x=210;s.cat.y=164;run(s,1);
  assert(Math.abs(s.cat.y-114)<.01);assert(s.cat.grounded);
});
test('platform side push is solid and crushing against a wall kills cleanly',()=>{
  const l=ferry();l.platforms=[{x:200,y:200,w:10,h:40}];l.movingPlatforms[0].y=224;l.movingPlatforms[0].toY=224;const s=E.create(l);
  s.movers[0].x=100;s.cat.x=170;s.cat.y=224;
  run(s,1);assert.equal(s.status,'dead');assert.equal(s.events.filter(e=>e==='death').length,1);
});
test('restart creates fresh movers/buttons and does not mutate room data',()=>{
  const l=ferry(),s=E.create(l);s.cat.x=85;run(s,2);const fresh=E.create(l);
  assert.equal(l.movingPlatforms[0].x,300);assert.equal(fresh.movers[0].x,300);assert.equal(fresh.buttons.size,0);
});
test('ferry motion is consistent at 30, 60, and 120 Hz and freezes when dead',()=>{
  for(const rate of [30,60,120]){const s=E.create(ferry());s.cat.x=85;run(s,2,0,rate);assert(Math.abs(s.movers[0].x-200)<.001);s.status='dead';run(s,1);assert(Math.abs(s.movers[0].x-200)<.001)}
});
test('ferry room ceiling bypass is blocked and dropping into its pit is fatal',()=>{
  const s=E.create(require('../src/levels.js')[10]);E.flip(s);run(s,.3);run(s,4,1);
  assert.equal(s.cat.x,166);assert.equal(s.seals.size,0);assert(E.flip(s));run(s,.5);assert.equal(s.status,'dead');
});
test('expansion geometry has valid pressure references and unobstructed platform tracks',()=>{
  for(const l of require('../src/levels.js')){
    for(const pit of l.pits)assert(pit.x>=24&&pit.w>0&&pit.x+pit.w<=456);
    for(const f of l.fields)assert(f.x>=24&&f.y>=24&&f.w>0&&f.h>0&&f.x+f.w<=456&&f.y+f.h<=240);
    for(const p of l.movingPlatforms){
      assert(l.buttons.some(b=>b.id===p.buttonId));assert(p.speed>0);
      for(let n=0;n<=100;n++){const r={...p,x:p.x+(p.toX-p.x)*n/100,y:p.y+(p.toY-p.y)*n/100};assert(r.x>=24&&r.x+r.w<=456&&r.y>=24&&r.y+r.h<=240);assert(!l.platforms.some(w=>E.overlap(r,w)))}
    }
  }
});
