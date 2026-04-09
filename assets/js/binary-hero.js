// ══════════════════════════════════════════
//  HERO CANVAS — decorative rotating binary
//  Depends on: drawBody (starfield.js)
// ══════════════════════════════════════════
const hC = document.getElementById('binaryCanvas');
const hctx = hC.getContext('2d');
const HCX = hC.width / 2, HCY = hC.height / 2;
let hAngle = 0, hTime = 0, hRun = true;
const hRipples = [];

hC.addEventListener('click', () => { hRun = !hRun; });

function drawHero() {
  const q = parseFloat(document.getElementById('heroMass').value);
  const spd = parseFloat(document.getElementById('heroSpeed').value);
  const ct = (hTime * 0.0005) % 1;
  const R = 95 + 35 * (1 - ct * 0.5);
  const w = 0.016 * spd * (1 + ct * 0.5);
  hAngle += w; hTime++;

  const m1 = q, m2 = 1, tot = m1 + m2;
  const r1 = R * m2 / tot, r2 = R * m1 / tot;
  const x1 = HCX + r1 * Math.cos(hAngle), y1 = HCY + r1 * Math.sin(hAngle);
  const x2 = HCX - r2 * Math.cos(hAngle), y2 = HCY - r2 * Math.sin(hAngle);

  if (hTime % Math.round(13 / spd) === 0) hRipples.push({r: 0, a: 0.65});

  hctx.clearRect(0, 0, hC.width, hC.height);
  const bg = hctx.createRadialGradient(HCX, HCY, 0, HCX, HCY, 200);
  bg.addColorStop(0, 'rgba(12,25,70,0.35)'); bg.addColorStop(1, 'rgba(3,5,15,0)');
  hctx.fillStyle = bg; hctx.fillRect(0, 0, hC.width, hC.height);

  for (let i = hRipples.length - 1; i >= 0; i--) {
    const rp = hRipples[i]; rp.r += 1.5 * spd; rp.a -= 0.007;
    if (rp.r > 230 || rp.a <= 0) { hRipples.splice(i, 1); continue; }
    hctx.save(); hctx.translate(HCX, HCY);
    hctx.beginPath();
    hctx.ellipse(0, 0, rp.r, rp.r * 0.8, hAngle * 0.2, 0, Math.PI * 2);
    hctx.strokeStyle = `rgba(91,164,245,${rp.a * 0.5})`; hctx.lineWidth = 1.4; hctx.stroke();
    hctx.beginPath();
    hctx.ellipse(0, 0, rp.r * 0.55, rp.r * 0.44, hAngle * 0.2, 0, Math.PI * 2);
    hctx.strokeStyle = `rgba(125,232,160,${rp.a * 0.18})`; hctx.lineWidth = 0.8; hctx.stroke();
    hctx.restore();
  }

  hctx.beginPath(); hctx.ellipse(HCX, HCY, R, R * 0.87, 0, 0, Math.PI * 2);
  hctx.strokeStyle = 'rgba(91,164,245,0.05)'; hctx.lineWidth = 1; hctx.stroke();

  drawBody(hctx, x1, y1, 5 + 3 * Math.log(m1 + 1), 'rgba(200,225,255,0.95)', 'rgba(91,164,245,0.5)');
  drawBody(hctx, x2, y2, 5 + 3 * Math.log(m2 + 1), 'rgba(255,210,160,0.95)', 'rgba(245,163,91,0.5)');
}
