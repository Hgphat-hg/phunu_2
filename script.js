const CONFIG = {
  recipient:    "Bùi Ngọc Nhã Tú",     // <-- change to the person's name, e.g. "Mom" or "Linh"

  scene1Label:  "A little greeting",
  scene1Prefix: "Sending to",

  scene2Line1:  "On the occasion of Vietnamese Women's Day",
  scene2Date:   "October 20th",

  // Scene 3 message. Wrap words in *asterisks* to highlight them in cursive.
  finalMessage: "Wishing you to always stay *radiant*, *happy*, *successful*, and deeply *loved* every day!",

  loop:           false,  // false = stop and stay on the final scene; true = repeat forever
  holdTime:       3500,   // ms each scene stays fully visible (3000–4000 recommended)
  transitionTime: 1100,   // ms for fade/slide (keep equal to --scene-duration in CSS)

  // Particle effect
  particleDensity: 1,     // 1 = normal, 0.5 = fewer, 2 = more
  colors: ['#ff7fa8', '#ff5c8a', '#ffb3cc', '#ffa0bd', '#ffffff', '#ff9ebd']
};

const esc = s => s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

document.querySelectorAll('[data-text]').forEach(el => {
  el.textContent = CONFIG[el.dataset.text] ?? '';
});
document.getElementById('finalMessage').innerHTML =
  esc(CONFIG.finalMessage).replace(/\*(.+?)\*/g, '<em>$1</em>');

document.documentElement.style.setProperty('--scene-duration', CONFIG.transitionTime + 'ms');

const scenes = Array.from(document.querySelectorAll('.scene'));
const dots   = Array.from(document.querySelectorAll('#dots span'));
let current = -1;

function showScene(next) {
  const prev = scenes[current];
  if (prev) {
    prev.classList.remove('active');
    prev.classList.add('leaving');
    setTimeout(() => prev.classList.remove('leaving'), CONFIG.transitionTime + 50);
  }
  const el = scenes[next];

  el.classList.remove('leaving');
  void el.offsetWidth;
  el.classList.add('active');
  dots.forEach((d, i) => d.classList.toggle('on', i === next));
  current = next;
}

function loop() {
  const next = current + 1;
  if (next >= scenes.length) {

    if (!CONFIG.loop) return;
    showScene(0);
  } else {
    showScene(next);
  }
  setTimeout(loop, CONFIG.transitionTime + CONFIG.holdTime);
}

setTimeout(loop, 300);

const canvas = document.getElementById('fx');
const ctx = canvas.getContext('2d');
let W, H, DPR, particles = [];

function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width  = W * DPR;
  canvas.height = H * DPR;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  const target = Math.round(Math.min(70, Math.max(22, (W * H) / 20000)) * CONFIG.particleDensity);
  while (particles.length < target) particles.push(makeParticle(true));
  particles.length = Math.min(particles.length, target);
}

function makeParticle(randomY) {
  const type = Math.random() < 0.5 ? 'heart' : (Math.random() < 0.5 ? 'petal' : 'heart');
  return {
    type,
    x: Math.random() * W,
    y: randomY ? Math.random() * H : -30 - Math.random() * 80,
    size: 8 + Math.random() * 16,
    speed: 0.5 + Math.random() * 1.3,
    drift: (Math.random() - 0.5) * 0.6,
    sway: Math.random() * Math.PI * 2,
    swaySpeed: 0.008 + Math.random() * 0.02,
    swayAmp: 0.4 + Math.random() * 1.1,
    rot: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.04,
    alpha: 0.45 + Math.random() * 0.5,
    color: CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)]
  };
}

function drawHeart(s) {
  const t = s * 0.5;
  ctx.beginPath();
  ctx.moveTo(0, t * 0.6);
  ctx.bezierCurveTo(-t * 1.6, -t * 0.4, -t * 0.9, -t * 1.5, 0, -t * 0.6);
  ctx.bezierCurveTo(t * 0.9, -t * 1.5, t * 1.6, -t * 0.4, 0, t * 0.6);
  ctx.closePath();
  ctx.fill();
}

function drawPetal(s) {
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.6);
  ctx.bezierCurveTo(s * 0.7, -s * 0.5, s * 0.6, s * 0.4, 0, s * 0.6);
  ctx.bezierCurveTo(-s * 0.6, s * 0.4, -s * 0.7, -s * 0.5, 0, -s * 0.6);
  ctx.closePath();
  ctx.fill();
}

function tick() {
  ctx.clearRect(0, 0, W, H);
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    p.sway += p.swaySpeed;
    p.x += p.drift + Math.sin(p.sway) * p.swayAmp;
    p.y += p.speed;
    p.rot += p.rotSpeed;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.type === 'heart' ? Math.sin(p.sway) * 0.5 : p.rot);
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.shadowColor = 'rgba(255, 92, 138, .35)';
    ctx.shadowBlur = 6;
    if (p.type === 'heart') drawHeart(p.size); else drawPetal(p.size);
    ctx.restore();

    if (p.y > H + 40 || p.x < -60 || p.x > W + 60) particles[i] = makeParticle(false);
  }
  requestAnimationFrame(tick);
}

window.addEventListener('resize', resize);
resize();
tick();