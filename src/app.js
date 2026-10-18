(() => {
  'use strict';
  const E=CatEngine,levels=CatLevels,$=id=>document.getElementById(id),canvas=$('game'),ctx=canvas.getContext('2d'),overlay=$('overlay');
  let storage;try{storage=window.localStorage}catch{storage=null}
  const progress=CatProgress.read(storage,levels.length),keys=new Set(),touch=new Map();
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let index=0,state,paused=false,menu='',last=0,accumulator=0,clock=0,deathTimer=0,deaths=0,particles=[],trail=[],audio,fieldActive=false;
  function save(){CatProgress.write(storage,progress)}
  function focusGame(){canvas.focus({preventScroll:true})}
  function clearInput(){keys.clear();touch.clear();accumulator=0}
  function tone(event){
    if(!progress.sound)return;
    try{
      audio ||= new (window.AudioContext||window.webkitAudioContext)();
      if(audio.state==='suspended')audio.resume().catch(()=>{});
      const notes={flip:[330,660],seal:[660,990],switch:[220,440],button:[220,330],blocked:[110,95],death:[180,80],complete:[523,659,784]};
      (notes[event]||[]).forEach((hz,i)=>{const o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime+i*.085;o.type='triangle';o.frequency.setValueAtTime(hz,t);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.045,t+.01);g.gain.exponentialRampToValueAtTime(.001,t+.16);o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+.18)});
    }catch{progress.sound=false;updateSound()}
  }
  function updateSound(){$('sound').textContent=progress.sound?'Sound on':'Sound off';$('sound').setAttribute('aria-pressed',String(progress.sound))}
  function load(n,resetDeaths=true){index=n;state=E.create(levels[index]);state.levelNumber=index;if(resetDeaths)deaths=0;deathTimer=0;particles=[];trail=[];closeOverlay();$('hint-text').hidden=true;$('hint').setAttribute('aria-expanded','false');$('hint-text').textContent=state.level.hint;$('room-number').textContent=`ROOM ${String(index+1).padStart(2,'0')} / ${levels.length}`;$('room-title').textContent=state.level.name;updateHud();focusGame()}
  function closeOverlay(){paused=false;menu='';overlay.hidden=true;overlay.removeAttribute('role');overlay.removeAttribute('aria-modal');overlay.replaceChildren();$('pause').textContent='Pause';clearInput()}
  function show(title,body,actions,kind){clearInput();paused=true;menu=kind;overlay.hidden=false;overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label',title);overlay.replaceChildren();const h=document.createElement('h2');h.textContent=title;overlay.append(h);if(body){const p=document.createElement('p');p.textContent=body;overlay.append(p)}const controls=document.createElement('div');controls.className='actions';actions.forEach(([label,action,primary])=>{const b=document.createElement('button');b.textContent=label;if(primary)b.className='primary';b.onclick=action;controls.append(b)});overlay.append(controls);$('pause').textContent='Resume';overlay.querySelector('button')?.focus({preventScroll:true})}
  function resume(){if(menu==='complete')return;closeOverlay();focusGame()}
  function pause(){if(state.status==='complete')return;if(paused){resume();return}show('A little catnap','The moon will wait for you.',[['Keep exploring',resume,true],['Restart room',()=>load(index)]],'pause')}
  function rooms(){show('The Moonhouse','Choose a room. Every door is yours to explore.',[['Back to room',()=>{if(state.status==='complete')complete();else resume()}]],'rooms');const grid=document.createElement('div');grid.className='room-grid';levels.forEach((l,n)=>{const b=document.createElement('button');b.textContent=`${String(n+1).padStart(2,'0')}${progress.completed.includes(n)?' ✓':''}`;b.setAttribute('aria-label',`Room ${n+1}: ${l.name}${progress.completed.includes(n)?', completed':''}`);if(progress.completed.includes(n))b.className='done';b.onclick=()=>load(n);grid.append(b)});overlay.insertBefore(grid,overlay.lastChild);grid.querySelector('button').focus()}
  function complete(){const final=index===levels.length-1;show(final?'Home, whichever way is up.':'A little closer to home.',final?`You found the last doorway. ${progress.completed.length} of ${levels.length} rooms explored.`:`Room ${index+1} complete · ${state.flips} flips · ${deaths} retries`,final?[['Explore the rooms',rooms,true],['Play again',()=>load(0)]]:[['Next room',()=>load(index+1),true],['Try this room again',()=>load(index)]],'complete')}
  function flip(){if(!paused)E.flip(state)}
  function updateHud(){
    fieldActive=E.inField(state);
    $('seal-count').textContent=`☾ ${state.seals.size} / ${state.level.seals.length}`;
    $('gravity').textContent=fieldActive?'⊘ FLIP LOCKED':state.cat.gravity===1?'↓ FLOOR SIDE':'↑ CEILING SIDE';
    const docked=state.movers.some(p=>state.buttons.has(p.buttonId)&&Math.hypot(p.x-p.toX,p.y-p.toY)<.01);
    $('message').textContent=state.status==='dead'?'A small tumble. Try again.':fieldActive?'Leave the violet field to flip.':state.buttons.size?(docked?'Ferry ready. SPACE to board.':'Hold the plate to call the ferry.'):state.seals.size===state.level.seals.length?'The doorway is open.':index===0?'A / D to walk · SPACE to flip':`${state.flips} flips · ${deaths} retries`;
    $('progress').textContent=`THE MOONHOUSE · ${progress.completed.length} / ${levels.length} ROOMS EXPLORED`;
    $('flip').setAttribute('aria-disabled',String(fieldActive));
  }
  function burst(event){if(reduced)return;const count=event==='complete'?32:12,color=event==='death'?'#dfa4ae':event==='flip'?'#9fdac9':'#efd68e';for(let i=0;i<count;i++){const a=Math.random()*Math.PI*2;particles.push({x:state.cat.x+7,y:state.cat.y+8,vx:Math.cos(a)*35,vy:Math.sin(a)*35,life:1,color})}}
  function events(){for(const event of state.events.splice(0)){tone(event);burst(event);if(event==='death'){deaths++;deathTimer=.6;clearInput()}if(event==='complete'){if(!progress.completed.includes(index)){progress.completed.push(index);save()}complete()}updateHud()}}
  document.addEventListener('keydown',e=>{
    if(e.code==='Tab'&&paused){const buttons=[...overlay.querySelectorAll('button')];if(!buttons.length)return;const first=buttons[0],end=buttons.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();end.focus()}else if(!e.shiftKey&&document.activeElement===end){e.preventDefault();first.focus()}return}
    if(e.code==='Escape'&&!e.repeat){e.preventDefault();if(menu==='rooms'){if(state.status==='complete')complete();else resume()}else pause();return}
    if(e.target instanceof HTMLButtonElement)return;
    if(['Space','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();
    if(paused)return;
    if(e.code==='Space'&&!e.repeat&&!keys.has('Space'))flip();
    if(e.code==='KeyR'&&!e.repeat){load(index);return}
    keys.add(e.code);
  });
  document.addEventListener('keyup',e=>keys.delete(e.code));
  window.addEventListener('blur',()=>{clearInput();if(!paused&&state.status==='playing')pause()});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){clearInput();if(!paused&&state.status==='playing')pause()}});
  canvas.addEventListener('pointerdown',focusGame);
  $('restart').onclick=()=>load(index);$('pause').onclick=pause;$('rooms').onclick=rooms;
  $('sound').onclick=()=>{progress.sound=!progress.sound;save();updateSound();if(progress.sound)tone('seal');focusGame()};
  $('hint').setAttribute('aria-controls','hint-text');$('hint').onclick=()=>{$('hint-text').hidden=!$('hint-text').hidden;$('hint').setAttribute('aria-expanded',String(!$('hint-text').hidden));focusGame()};
  for(const [id,move]of [['left',-1],['right',1]]){const b=$(id);b.addEventListener('pointerdown',e=>{e.preventDefault();if(paused)return;b.setPointerCapture(e.pointerId);touch.set(e.pointerId,move);focusGame()});for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,e=>touch.delete(e.pointerId))}
  $('flip').onclick=()=>{flip();focusGame()};
  function frame(now){const dt=last?Math.min((now-last)/1000,.05):0;last=now;if(!paused){clock+=dt;if(state.status==='dead'){deathTimer-=dt;if(deathTimer<=0)load(index,false)}else{accumulator+=dt;while(accumulator>=1/120&&!paused){const keyboard=Number(keys.has('ArrowRight')||keys.has('KeyD'))-Number(keys.has('ArrowLeft')||keys.has('KeyA'));const move=Math.sign(keyboard+[...touch.values()].reduce((a,b)=>a+b,0));state.walking=move!==0;E.step(state,{move},1/120);accumulator-=1/120;events();if(state.status==='dead'){accumulator=0;break}}}if(!reduced&&Math.abs(state.cat.vy)>700)trail.push({x:state.cat.x,y:state.cat.y,life:1});for(const t of trail)t.life-=dt*6;trail=trail.filter(t=>t.life>0);for(const p of particles){p.life-=dt*2;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=20*dt}particles=particles.filter(p=>p.life>0)}if(fieldActive!==E.inField(state))updateHud();CatRender(ctx,state,clock,particles,trail,reduced);requestAnimationFrame(frame)}
  updateSound();load(0);requestAnimationFrame(frame);
})();

