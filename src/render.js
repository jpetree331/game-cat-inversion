(function(root){
  'use strict';
  const palettes=[['#122e33','#224c4a','#82b39b','#b9d6ad'],['#172d38','#284e56','#83b5ad','#c2debc'],['#242e43','#394c62','#8ab3b6','#ceddc0'],['#203a37','#335b4b','#9bbb8b','#d3dda5']];
  function render(ctx,s,time,particles,trail,reduced){
    const p=palettes[Math.floor((s.levelNumber||0)/2)%palettes.length];
    const rect=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),w,h)};
    const text=(label,x,y,color,size=6)=>{ctx.fillStyle=color;ctx.font=`${size}px monospace`;ctx.textAlign='center';ctx.fillText(label,x,y)};
    ctx.setTransform(2,0,0,2,0,0);ctx.imageSmoothingEnabled=false;
    rect(0,0,480,270,p[0]);
    // Recessed masonry remains darker than all collision surfaces.
    for(let y=26;y<240;y+=24)for(let x=24;x<456;x+=40){rect(x+((y%48)?0:20),y,38,22,'#ffffff03');rect(x+2,y+21,35,1,'#00000013')}
    // Pipes and mounting clips.
    rect(41,45,3,151,p[1]);rect(41,44,109,3,p[1]);rect(148,44,3,45,p[1]);rect(332,182,3,44,p[1]);rect(332,182,89,3,p[1]);
    for(let y=65;y<190;y+=35)rect(39,y,7,3,'#39625c');
    // Tall moonlit window, split by thick mullions.
    rect(177,65,126,106,'#0d222d');rect(181,69,118,98,p[1]);rect(185,73,110,90,'#14313c');
    for(let k=0;k<18;k++){const x=190+(k*37)%98,y=80+(k*19)%73;rect(x,y,1,1,k%3?'#567780':'#9bbcaf')}
    rect(239,88,18,18,'#c5d7af');rect(248,85,13,16,'#14313c');rect(185,117,110,4,p[1]);rect(238,73,4,90,p[1]);rect(176,168,128,4,'#426c63');
    // Wall signage and lamps.
    rect(67,107,63,34,'#294f48');rect(70,110,57,28,'#173731');text('MOONHOUSE',98,121,'#9ebaa0',7);text('OBSERVATORY',98,132,'#668f7e',5);
    for(const x of [70,405]){rect(x,24,1,27,'#527a67');rect(x-7,51,15,3,'#658d73');rect(x-5,54,11,5,'#d8c480');rect(x-3,59,7,1,'#eddfa0');ctx.fillStyle='#eedd8510';ctx.beginPath();ctx.moveTo(x-5,60);ctx.lineTo(x-20,103);ctx.lineTo(x+20,103);ctx.lineTo(x+5,60);ctx.fill()}
    // Small potted plants and quiet machinery.
    for(const x of [32,392]){if(s.level.pits.some(pit=>x+12>pit.x&&x<pit.x+pit.w))continue;rect(x,228,12,12,'#537868');rect(x-1,226,14,3,'#71967e');rect(x+5,212,2,15,'#689a7c');rect(x+1,214,5,4,'#85b68c');rect(x+7,218,5,4,'#527c69')}
    if(!s.level.pits.some(pit=>377>pit.x&&348<pit.x+pit.w)){rect(348,198,29,42,'#294c46');rect(352,203,21,13,'#142f30');rect(356,207,4,4,'#87b795');rect(364,207,5,2,'#9abb8a');rect(351,221,23,2,'#42675a');rect(351,226,23,2,'#42675a');rect(351,231,23,2,'#42675a')}
    // Subtle fireflies; reduced motion uses a still field.
    for(let k=0;k<14;k++){const t=reduced?0:time;const x=35+(k*47)%405+Math.sin(t*.25+k)*3,y=58+(k*29)%150+Math.cos(t*.4+k)*3;rect(x,y,1,1,k%3?'#779d8044':'#c2ce8655')}
    // Violet volumes affect inversion only. Their exact bounds stay visible.
    for(const f of s.level.fields){
      rect(f.x,f.y,f.w,f.h,'#bc9ce72a');
      for(let y=f.y;y<f.y+f.h;y+=8){rect(f.x,y,1,Math.min(4,f.y+f.h-y),'#c6a4ec');rect(f.x+f.w-1,y,1,Math.min(4,f.y+f.h-y),'#c6a4ec')}
      for(let x=f.x;x<f.x+f.w;x+=8){rect(x,f.y,Math.min(4,f.x+f.w-x),1,'#c6a4ec');rect(x,f.y+f.h-1,Math.min(4,f.x+f.w-x),1,'#c6a4ec')}
      for(let x=f.x+12;x<f.x+f.w-5;x+=26)for(let y=f.y+18;y<f.y+f.h-8;y+=30){rect(x,y,5,1,'#d4baf13b');rect(x+2,y-2,1,5,'#d4baf13b')}
      const labelY=f.y+f.h/2;rect(f.x+f.w/2-29,labelY-7,58,12,'#342d4bc9');text('NO FLIP',f.x+f.w/2,labelY+1,'#e0c8f4',7);
    }
    function tile(r){rect(r.x,r.y,r.w,r.h,p[2]);rect(r.x,r.y,r.w,2,p[3]);rect(r.x,r.y+r.h-3,r.w,3,'#4c7968');for(let x=r.x;x<r.x+r.w;x+=24){rect(x,r.y,1,r.h,'#4a7a6866');rect(x+3,r.y+5,Math.min(17,r.x+r.w-x-3),1,'#c5d6ad44');if(r.h>=20){rect(x+4,r.y+14,7,2,'#466e5e44');rect(x+18,r.y+8,2,2,'#e1e2b955')}}}
    tile({x:0,y:0,w:480,h:24});CatEngine.floorSolids(s.level).forEach(tile);tile({x:0,y:24,w:24,h:216});tile({x:456,y:24,w:24,h:216});s.level.platforms.forEach(tile);
    for(const pit of s.level.pits){
      rect(pit.x,240,pit.w,30,'#070f1c');rect(pit.x,240,2,30,'#76505e');rect(pit.x+pit.w-2,240,2,30,'#76505e');
      for(let x=pit.x+9;x<pit.x+pit.w-5;x+=18){rect(x,248,2,2,'#bd7f9566');rect(x+2,250,2,2,'#bd7f9566');rect(x+4,248,2,2,'#bd7f9566')}
      text('PIT',pit.x+pit.w/2,264,'#b48298',6);
    }
    for(const m of s.movers){
      const minX=Math.min(m.x,m.toX),maxX=Math.max(s.level.movingPlatforms.find(p=>p.id===m.id).x,m.toX)+m.w;
      for(let x=minX;x<maxX;x+=9)rect(x,m.y+5,4,1,'#e6b47750');
      rect(m.x,m.y,m.w,m.h,'#b97e52');rect(m.x,m.y,m.w,2,'#f2d18c');rect(m.x,m.y+m.h-2,m.w,2,'#f2d18c');
      for(let x=m.x+5;x<m.x+m.w-4;x+=12){rect(x,m.y+4,6,4,'#674b3c');rect(x+2,m.y+5,2,2,'#e8bf80')}
      text('FERRY',m.x+m.w/2,m.y-5,'#f1c987',6);
    }
    for(const b of s.level.buttons){
      const held=s.buttons.has(b.id);rect(b.x-2,b.y+5,b.w+4,3,'#694d3c');rect(b.x,b.y+(held?4:1),b.w,held?2:5,held?'#f8df9e':'#e9ad6e');
      text(held?'CALLING':'STAND HERE',b.x+b.w/2,b.y-7,'#f1c987',6);
    }
    // Creepers sit on the frame, leaving the playable geometry readable.
    for(const x of [5,461])for(let k=0;k<6;k++){rect(x+6,25+k*7,2,9,'#365f50');rect(x+(k%2?2:8),28+k*7,6,4,k%2?'#538869':'#709e73')}
    for(const g of s.level.gates){const color=g.switchId==='blue'?'#8fcdd9':'#ead18d',open=s.switches.has(g.switchId);rect(g.x-2,g.y,14,4,color);rect(g.x-2,g.y+g.h-4,14,4,color);if(!open){rect(g.x,g.y+4,g.w,g.h-8,'#355653');for(let y=g.y+5;y<g.y+g.h-5;y+=10)rect(g.x+2,y,g.w-4,5,color)}else{rect(g.x+4,g.y+4,2,g.h-8,'#a6c9a61a')}}
    for(const b of s.level.switches){const on=s.switches.has(b.id),color=b.id==='blue'?'#8fcdd9':'#ead18d';rect(b.x,b.y,b.w,b.h,'#38534c');rect(b.x+2,b.y+2,b.w-4,b.h-4,on?'#a9e2b0':color);if(on)text('✓',b.x+b.w/2,b.y+b.h+8,'#bce5b7',7)}
    for(const h of s.level.hazards){const top=h.y<60;rect(h.x,h.y,h.w,h.h,'#623e5355');for(let x=h.x;x<h.x+h.w;x+=7){ctx.fillStyle='#e2a5af';ctx.beginPath();ctx.moveTo(x,top?h.y:h.y+h.h);ctx.lineTo(Math.min(x+3,h.x+h.w),top?h.y+h.h:h.y);ctx.lineTo(Math.min(x+6,h.x+h.w),top?h.y:h.y+h.h);ctx.fill();rect(x+2,top?h.y+1:h.y+h.h-3,2,2,'#f9d6bb')}}
    const ex=s.level.exit,unlocked=s.seals.size===s.level.seals.length;
    rect(ex.x-3,ex.y-2,ex.w+6,ex.h+2,'#547d6c');rect(ex.x,ex.y,ex.w,ex.h,unlocked?'#b9d6a0':'#284940');rect(ex.x+4,ex.y+3,ex.w-8,ex.h-3,unlocked?'#477768':'#142f30');rect(ex.x+8,ex.y+7,ex.w-16,ex.h-7,unlocked?'#80a991':'#1d3b36');rect(ex.x+17,ex.y+16,2,2,'#ddce89');text(unlocked?'HOME':'☾',ex.x+ex.w/2,ex.y<100?ex.y+ex.h+10:ex.y-8,unlocked?'#d6e5ae':'#8eaa87',6);
    for(const m of s.level.seals){if(s.seals.has(m.id))continue;const bob=reduced?0:Math.sin(time*2+m.x)*1.4,x=m.x+7,y=m.y+7+bob;rect(x-7,y-7,14,14,'#efd68f10');rect(x-4,y-5,8,10,'#f5da8e');rect(x-5,y-3,10,6,'#f5da8e');rect(x+1,y-5,5,7,p[0]);rect(x+3,y-6,3,10,p[0]);rect(x-3,y-3,1,5,'#fff0b5')}
    if(!reduced){for(const t of trail){ctx.globalAlpha=t.life*.3;rect(t.x,t.y,14,16,'#a9e3ce')}ctx.globalAlpha=1;}
    const c=s.cat;
    if(s.status!=='dead'){
      ctx.save();ctx.translate(Math.round(c.x+7),Math.round(c.y+8));ctx.scale(c.facing,c.gravity);const walk=c.grounded&&!reduced?Math.sin(time*17)*(s.walking?1:0):0;
      const ink='#0b1220',edge='#415468';
      rect(-8,-5,16,11,edge);rect(-7,-6,14,12,ink);rect(-7,-9,4,7,ink);rect(3,-9,4,7,ink);rect(-6,-7,2,2,'#806776');rect(4,-7,2,2,'#806776');rect(-5,5,4,3+Math.round(walk),ink);rect(2,5,4,3-Math.round(walk),ink);
      rect(-11,0,5,3,ink);rect(-13,-4,3,6,ink);rect(-12,-6,3,3,ink);
      const blink=!reduced&&Math.floor(time*2)%13===12;rect(-4,-3,3,blink?1:3,'#e8d986');rect(3,-3,3,blink?1:3,'#e8d986');rect(-3,-3,1,2,'#394143');rect(4,-3,1,2,'#394143');rect(0,1,2,1,'#c592a1');rect(2,5,2,1,'#596172');ctx.restore();
    }
    for(const q of particles){ctx.globalAlpha=Math.max(0,q.life);rect(q.x,q.y,2,2,q.color)}ctx.globalAlpha=1;
    if((s.levelNumber||0)===0&&s.elapsed<9){text('A / D TO WANDER',108,194,'#a1b8a1',7);text('SPACE TO CHANGE YOUR MIND',240,201,'#cbd29e',7)}
    // Edge vignette stays off the central play surface.
    rect(24,24,432,2,'#00000033');for(const floor of CatEngine.floorSolids(s.level))rect(floor.x,238,floor.w,2,'#00000033');
  }
  root.CatRender=render;
})(globalThis);
