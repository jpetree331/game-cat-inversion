(function (root) {
  'use strict';
  const W = 480, H = 270, SPEED = 100, FLIP_SPEED = 1300;
  const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  function create(level) {
    return { level, cat: { x: level.spawn.x, y: level.spawn.y, w: 14, h: 16, gravity: 1, grounded: true, vy: 0, facing: 1 }, status: 'playing', seals: new Set(), switches: new Set(), buttons: new Set(), movers: (level.movingPlatforms || []).map(p => ({...p})), flips: 0, elapsed: 0, events: [] };
  }
  function floorSolids(level) {
    const pieces = [];
    let edge = 0;
    for (const pit of [...(level.pits || [])].sort((a,b) => a.x-b.x)) {
      if (pit.x > edge) pieces.push({x:edge,y:240,w:pit.x-edge,h:30});
      edge = Math.max(edge, pit.x + pit.w);
    }
    if (edge < W) pieces.push({x:edge,y:240,w:W-edge,h:30});
    return pieces;
  }
  const inField = s => (s.level.fields || []).some(field => overlap(s.cat, field));
  function solids(s) {
    return [ { x: 0, y: 0, w: W, h: 24 }, ...floorSolids(s.level), { x: 0, y: 0, w: 24, h: H }, { x: 456, y: 0, w: 24, h: H }, ...(s.level.platforms || []), ...s.movers, ...(s.level.gates || []).filter(g => !s.switches.has(g.switchId)) ];
  }
  function flip(s) {
    if (s.status === 'playing' && inField(s)) { s.events.push('blocked'); return false; }
    if (s.status !== 'playing' || !s.cat.grounded) return false;
    s.cat.gravity *= -1;
    s.cat.vy = FLIP_SPEED * s.cat.gravity;
    s.cat.grounded = false;
    s.flips++;
    s.events.push('flip');
    return true;
  }
  function die(s) { if (s.status === 'playing') { s.status = 'dead'; s.events.push('death'); } }
  function movePlatforms(s, dt) {
    const c = s.cat;
    const pressed = new Set((s.level.buttons || []).filter(b => c.grounded && overlap(c,b)).map(b => b.id));
    for (const id of pressed) if (!s.buttons.has(id)) s.events.push('button');
    for (const id of s.buttons) if (!pressed.has(id)) s.events.push('button-release');
    s.buttons = pressed;
    for (const p of s.movers) {
      const old = {...p};
      const definition = s.level.movingPlatforms.find(d => d.id === p.id);
      const target = pressed.has(p.buttonId) ? {x:p.toX,y:p.toY} : definition;
      const distance = Math.hypot(target.x-p.x, target.y-p.y);
      if (!distance) continue;
      const fraction = Math.min(1, p.speed * dt / distance);
      const dx = (target.x-p.x)*fraction, dy = (target.y-p.y)*fraction;
      const riding = c.grounded && c.x+c.w > p.x && c.x < p.x+p.w &&
        Math.abs(c.gravity === 1 ? c.y+c.h-p.y : c.y-p.y-p.h) < .01;
      p.x += dx; p.y += dy;
      if (fraction === 1) s.events.push('dock');
      const contacted = riding || overlap(c,p);
      if (riding) { c.x += dx; c.y += dy; }
      else if (contacted) {
        // Moving solids push from the face they first contacted, on either axis.
        if (c.x+c.w <= old.x+.01) c.x = p.x-c.w;
        else if (c.x >= old.x+old.w-.01) c.x = p.x+p.w;
        else if (c.y+c.h <= old.y+.01) { c.y = p.y-c.h; c.vy = 0; c.grounded = c.gravity === 1; }
        else if (c.y >= old.y+old.h-.01) { c.y = p.y+p.h; c.vy = 0; c.grounded = c.gravity === -1; }
      }
      if (contacted && solids(s).some(w => w !== p && overlap(c,w))) { die(s); return; }
    }
  }
  function interact(s) {
    const c = s.cat;
    if (c.y >= H || (s.level.hazards || []).some(h => overlap(c, h))) { die(s); return; }
    for (const item of s.level.seals || []) if (!s.seals.has(item.id) && overlap(c, item)) { s.seals.add(item.id); s.events.push('seal'); }
    for (const button of s.level.switches || []) if (!s.switches.has(button.id) && overlap(c, button)) { s.switches.add(button.id); s.events.push('switch'); }
    if (s.seals.size === (s.level.seals || []).length && overlap(c, s.level.exit)) { s.status = 'complete'; s.events.push('complete'); }
  }
  function step(s, input, dt) {
    if (s.status !== 'playing' || !Number.isFinite(dt) || dt <= 0) return;
    dt = Math.min(dt, 0.1);
    const count = Math.ceil(dt / (1 / 240)), delta = dt / count;
    for (let i = 0; i < count && s.status === 'playing'; i++) {
      s.elapsed += delta;
      movePlatforms(s, delta);
      if (s.status !== 'playing') break;
      const c = s.cat, walls = solids(s);
      const direction = Math.sign(input.move || 0);
      // Inversion is a committed vertical move; horizontal control resumes on landing.
      const dx = Math.abs(c.vy) > 700 ? 0 : direction * SPEED * delta;
      if (direction) c.facing = direction;
      c.x += dx;
      for (const wall of walls) if (overlap(c, wall)) { if (dx > 0) c.x = wall.x - c.w; else if (dx < 0) c.x = wall.x + wall.w; }
      c.vy = c.grounded ? c.gravity * 1 : c.vy + c.gravity * 1000 * delta;
      const dy = c.vy * delta;
      c.y += dy; c.grounded = false;
      for (const wall of walls) if (overlap(c, wall)) {
        if (dy > 0) c.y = wall.y - c.h;
        else if (dy < 0) c.y = wall.y + wall.h;
        c.vy = 0; c.grounded = true;
      }
      interact(s);
    }
  }
  const api = { W, H, create, step, flip, overlap, solids, floorSolids, inField };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.CatEngine = api;
})(globalThis);
