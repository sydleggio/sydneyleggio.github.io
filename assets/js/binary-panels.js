// ══════════════════════════════════════════
//  PANEL A — eccentric inspiral
//  Depends on: drawBody (starfield.js)
// ══════════════════════════════════════════
const cA = document.getElementById('binaryA');
const ctxA = cA.getContext('2d');
const AW = cA.width, AH = cA.height, ACX = AW / 2, ACY = AH / 2;
let angA = 0, tA = 0, runA = true, lastRA = 0;
const ripA = [];

cA.addEventListener('click', () => { runA = !runA; });

function drawPanelA() {
  const q = parseFloat(document.getElementById('ratioA').value);
  const ecc = parseFloat(document.getElementById('eccA').value);
  const ct = (tA * 0.0004) % 1;
  const a = 100 + 38 * (1 - ct * 0.5);
  const e2 = 1 - ecc * ecc;
  const r = Math.max(a * e2 / (1 + ecc * Math.cos(angA)), 12);
  // Keplerian angular speed: dφ/dt ∝ 1/r²
  const om = 0.013 * (1 + ct * 0.45) * (a * a) / (r * r + 0.5);
  angA += Math.min(om, 0.12); tA++;

  const m1 = q, m2 = 1, tot = m1 + m2;
  const r1 = r * m2 / tot, r2 = r * m1 / tot;
  const x1 = ACX + r1 * Math.cos(angA), y1 = ACY + r1 * Math.sin(angA);
  const x2 = ACX - r2 * Math.cos(angA), y2 = ACY - r2 * Math.sin(angA);

  // Spawn ripples — more burst-like near periapsis
  const periBoost = ecc > 0.1 ? Math.max(0, (a - r) / (a * ecc + 1)) : 0;
  const spawnRate = Math.round(11 / (1 + periBoost * 2.5));
  if (tA - lastRA > spawnRate) { ripA.push({r: 0, a: 0.6 + periBoost * 0.35, burst: periBoost > 0.6}); lastRA = tA; }

  ctxA.clearRect(0, 0, AW, AH);
  const bg = ctxA.createRadialGradient(ACX, ACY, 0, ACX, ACY, 220);
  bg.addColorStop(0, 'rgba(10,20,55,0.55)'); bg.addColorStop(1, 'rgba(3,5,15,0)');
  ctxA.fillStyle = bg; ctxA.fillRect(0, 0, AW, AH);

  // Ripples with quadrupolar shape hint
  for (let i = ripA.length - 1; i >= 0; i--) {
    const rp = ripA[i];
    rp.r += rp.burst ? 2.4 : 1.8; rp.a -= rp.burst ? 0.007 : 0.009;
    if (rp.r > 290 || rp.a <= 0) { ripA.splice(i, 1); continue; }
    ctxA.save(); ctxA.translate(ACX, ACY);
    // Primary wave ellipse
    ctxA.beginPath();
    ctxA.ellipse(0, 0, rp.r, rp.r * 0.75, angA * 0.15, 0, Math.PI * 2);
    ctxA.strokeStyle = `rgba(91,164,245,${rp.a * 0.52})`; ctxA.lineWidth = rp.burst ? 1.8 : 1.3; ctxA.stroke();
    // Second harmonic (cross polarisation hint)
    ctxA.beginPath();
    ctxA.ellipse(0, 0, rp.r * 0.65, rp.r * 0.52, angA * 0.15 + Math.PI / 4, 0, Math.PI * 2);
    ctxA.strokeStyle = `rgba(125,232,160,${rp.a * 0.2})`; ctxA.lineWidth = 0.8; ctxA.stroke();
    ctxA.restore();
  }

  // Faint orbit ellipse
  ctxA.save(); ctxA.translate(ACX, ACY);
  ctxA.beginPath();
  ctxA.ellipse(a * ecc * 0.5, 0, a, a * Math.sqrt(Math.max(e2, 0.05)) * 0.88, 0, 0, Math.PI * 2);
  ctxA.strokeStyle = 'rgba(91,164,245,0.06)'; ctxA.lineWidth = 1; ctxA.stroke();
  ctxA.restore();

  drawBody(ctxA, x1, y1, 4 + 3 * Math.log(m1 + 1), 'rgba(200,225,255,0.95)', 'rgba(91,164,245,0.5)');
  drawBody(ctxA, x2, y2, 4 + 3 * Math.log(m2 + 1), 'rgba(255,210,160,0.95)', 'rgba(245,163,91,0.5)');

  document.getElementById('labelA').textContent =
    ecc > 0.35 ? `Eccentric · e = ${ecc.toFixed(2)} · burst emission`
    : ecc > 0.05 ? `Eccentric · e = ${ecc.toFixed(2)}`
    : 'Quasi-circular inspiral';
}

// ══════════════════════════════════════════
//  PANEL B — stochastic population / sky view
//  Depends on: rng, drawBody (starfield.js)
// ══════════════════════════════════════════
const cB = document.getElementById('binaryB');
const ctxB = cB.getContext('2d');
const BW = cB.width, BH = cB.height;
let gTimeB = 0, autoTimer = 0;

const COLORS = [
  ['rgba(200,225,255,0.95)', 'rgba(91,164,245,0.5)'],
  ['rgba(255,210,160,0.95)', 'rgba(245,163,91,0.5)'],
  ['rgba(190,255,210,0.95)', 'rgba(125,232,160,0.5)'],
  ['rgba(255,200,240,0.95)', 'rgba(240,130,200,0.5)'],
  ['rgba(240,230,180,0.95)', 'rgba(220,200,100,0.5)'],
];

function makeSource(x, y) {
  const ci = Math.floor(Math.random() * COLORS.length);
  return {
    x, y,
    angle: Math.random() * Math.PI * 2,
    omega: rng(0.008, 0.022),
    orbitR: rng(24, 50),
    q: rng(1.2, 5),
    tilt: Math.random() * Math.PI,
    col: COLORS[ci],
    ripples: [], lastRipple: 0,
  };
}

const sources = [];
function addSource(x, y) { sources.push(makeSource(x, y)); updateLabel(); }
function updateLabel() { document.getElementById('labelB').textContent = `N = ${sources.length} source${sources.length !== 1 ? 's' : ''}`; }

// Seed with 3
[[BW * 0.25, BH * 0.35], [BW * 0.65, BH * 0.25], [BW * 0.55, BH * 0.68]].forEach(([x, y]) => addSource(x, y));

// Background "quasar" positions (fixed)
const bgStars = Array.from({length: 55}, () => ({x: Math.random() * BW, y: Math.random() * BH, r: rng(0.5, 1.4)}));

cB.addEventListener('click', (e) => {
  const rect = cB.getBoundingClientRect();
  addSource((e.clientX - rect.left) * (BW / rect.width), (e.clientY - rect.top) * (BH / rect.height));
});

function drawPanelB() {
  const autoRate = parseInt(document.getElementById('autoAdd').value);
  autoTimer++;
  if (autoRate > 0 && autoTimer % Math.round(200 / autoRate) === 0 && sources.length < 22)
    addSource(rng(50, BW - 50), rng(40, BH - 40));

  gTimeB++;
  ctxB.clearRect(0, 0, BW, BH);

  // Subtle RA/Dec grid
  ctxB.strokeStyle = 'rgba(91,164,245,0.04)'; ctxB.lineWidth = 1;
  for (let gx = 0; gx <= BW; gx += 60) { ctxB.beginPath(); ctxB.moveTo(gx, 0); ctxB.lineTo(gx, BH); ctxB.stroke(); }
  for (let gy = 0; gy <= BH; gy += 60) { ctxB.beginPath(); ctxB.moveTo(0, gy); ctxB.lineTo(BW, gy); ctxB.stroke(); }

  // Background sources with astrometric deflection arrows
  for (const bg of bgStars) {
    let dx = 0, dy = 0;
    for (const src of sources) {
      const dist = Math.hypot(bg.x - src.x, bg.y - src.y);
      if (dist < 8) continue;
      // Simplified GW-induced angular deflection: δθ ~ h * (angle)
      const phase = src.angle * 2 + gTimeB * 0.008;
      const amp = 3.5 / Math.sqrt(dist * 0.03 + 1);
      const h = amp * Math.sin(phase);
      // Quadrupolar pattern (TT gauge simplified)
      const phi = Math.atan2(bg.y - src.y, bg.x - src.x);
      dx += h * Math.cos(2 * phi);
      dy += h * Math.sin(2 * phi);
    }
    const mag = Math.hypot(dx, dy);
    const clampedMag = Math.min(mag, 6);
    const alpha = 0.3 + Math.min(clampedMag * 0.1, 0.5);
    // Draw source dot (nudged by deflection)
    ctxB.beginPath();
    ctxB.arc(bg.x + dx * 0.3, bg.y + dy * 0.3, bg.r, 0, Math.PI * 2);
    ctxB.fillStyle = `rgba(200,220,255,${alpha})`; ctxB.fill();
    // Draw deflection arrow — always visible when sources present
    if (mag > 0.2 && sources.length > 0) {
      const nx = dx / Math.max(mag, 0.01), ny = dy / Math.max(mag, 0.01);
      const arrowLen = Math.min(mag * 2.5, 12);
      const ex = bg.x + nx * arrowLen, ey = bg.y + ny * arrowLen;
      const arrowAlpha = Math.min(0.2 + clampedMag * 0.12, 0.75);
      ctxB.beginPath();
      ctxB.moveTo(bg.x, bg.y);
      ctxB.lineTo(ex, ey);
      ctxB.strokeStyle = `rgba(125,232,160,${arrowAlpha})`;
      ctxB.lineWidth = 1; ctxB.stroke();
      // Arrowhead
      const headLen = 3, angle = Math.atan2(ey - bg.y, ex - bg.x);
      ctxB.beginPath();
      ctxB.moveTo(ex, ey);
      ctxB.lineTo(ex - headLen * Math.cos(angle - 0.5), ey - headLen * Math.sin(angle - 0.5));
      ctxB.moveTo(ex, ey);
      ctxB.lineTo(ex - headLen * Math.cos(angle + 0.5), ey - headLen * Math.sin(angle + 0.5));
      ctxB.strokeStyle = `rgba(125,232,160,${arrowAlpha})`;
      ctxB.lineWidth = 0.8; ctxB.stroke();
    }
  }

  // Advance and draw each source
  for (const src of sources) {
    src.angle += src.omega;
    if (gTimeB - src.lastRipple > 15) {
      src.ripples.push({r: 0, a: 0.52});
      src.lastRipple = gTimeB;
    }
    // Ripples
    for (let i = src.ripples.length - 1; i >= 0; i--) {
      const rp = src.ripples[i]; rp.r += 1.1; rp.a -= 0.007;
      if (rp.r > 200 || rp.a <= 0) { src.ripples.splice(i, 1); continue; }
      ctxB.save(); ctxB.translate(src.x, src.y);
      ctxB.beginPath();
      ctxB.ellipse(0, 0, rp.r, rp.r * 0.76, src.tilt, 0, Math.PI * 2);
      ctxB.strokeStyle = `rgba(91,164,245,${rp.a * 0.42})`; ctxB.lineWidth = 1; ctxB.stroke();
      ctxB.restore();
    }
    // Bodies
    const m1 = src.q, m2 = 1, tot = m1 + m2;
    const r1 = src.orbitR * m2 / tot, r2 = src.orbitR * m1 / tot;
    const bx1 = src.x + r1 * Math.cos(src.angle), by1 = src.y + r1 * Math.sin(src.angle);
    const bx2 = src.x - r2 * Math.cos(src.angle), by2 = src.y - r2 * Math.sin(src.angle);
    const rad1 = 2.5 + 1.4 * Math.log(m1 + 1);
    const rad2 = 2.5 + 1.4 * Math.log(m2 + 1);
    drawBody(ctxB, bx1, by1, rad1, src.col[0], src.col[1]);
    drawBody(ctxB, bx2, by2, rad2, 'rgba(255,210,160,0.9)', 'rgba(245,163,91,0.45)');
  }

  if (sources.length === 0) {
    ctxB.fillStyle = 'rgba(90,106,136,0.55)';
    ctxB.font = '600 11px Space Mono, monospace';
    ctxB.textAlign = 'center'; ctxB.textBaseline = 'middle';
    ctxB.fillText('CLICK TO ADD A SOURCE', BW / 2, BH / 2);
  }
}

// ══════════════════════════════════════════
//  MAIN LOOP (index.html only)
// ══════════════════════════════════════════
function loop() {
  drawSF();
  if (hRun) drawHero();
  if (runA) drawPanelA();
  drawPanelB();
  requestAnimationFrame(loop);
}
loop();
