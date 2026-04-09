// ══════════════════════════════════════════
//  HELPERS (global)
// ══════════════════════════════════════════
const rng = (a, b) => a + Math.random() * (b - a);

// ══════════════════════════════════════════
//  STARFIELD
// ══════════════════════════════════════════
const sf = document.getElementById('starfield');
const sctx = sf.getContext('2d');
let stars = [];

function resizeSF() {
  sf.width = window.innerWidth; sf.height = window.innerHeight;
  stars = Array.from({length: 260}, () => ({
    x: Math.random() * sf.width, y: Math.random() * sf.height,
    r: Math.random() * 1.1 + 0.1, a: Math.random(), da: (Math.random() - 0.5) * 0.003
  }));
}

function drawSF() {
  sctx.clearRect(0, 0, sf.width, sf.height);
  for (const s of stars) {
    s.a = Math.max(0.05, Math.min(1, s.a + s.da));
    if (s.a <= 0.05 || s.a >= 1) s.da *= -1;
    sctx.beginPath(); sctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    sctx.fillStyle = `rgba(200,220,255,${s.a})`; sctx.fill();
  }
}

resizeSF();
window.addEventListener('resize', resizeSF);

// ══════════════════════════════════════════
//  SHARED: draw a glowing body
// ══════════════════════════════════════════
function drawBody(ctx, x, y, radius, innerColor, midColor) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, radius * 4);
  g.addColorStop(0, innerColor); g.addColorStop(0.28, midColor); g.addColorStop(1, 'rgba(3,5,15,0)');
  ctx.beginPath(); ctx.arc(x, y, radius * 4, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
  ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fillStyle = innerColor; ctx.fill();
}
