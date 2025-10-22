(function(){
  // Lightweight ReactBits-style animated dots/lines background
  const sections = [
    { id: 'fx-header-bg', palette: ['#0052a3', '#0a6cd1', '#66b2ff'], density: 0.14, connect: 90 },
    { id: 'fx-hero-bg', palette: ['#0a6cd1', '#28a745', '#66d19e'], density: 0.12, connect: 110 }
  ];

  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return; // respect reduced motion

  function rand(min, max){ return Math.random() * (max - min) + min; }
  function lerp(a, b, t){ return a + (b - a) * t; }

  function makeScene(container, palette, density, connectDist){
    if (!container) return;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    container.appendChild(canvas);

    let DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    let W = 0, H = 0, points = [], mouse = { x: -9999, y: -9999 };

    function resize(){
      const rect = container.getBoundingClientRect();
      W = Math.max(10, rect.width);
      H = Math.max(10, rect.height);
      canvas.width = Math.floor(W * DPR);
      canvas.height = Math.floor(H * DPR);
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      initPoints();
    }

    function initPoints(){
      const area = W * H;
      const count = Math.floor(area / (12000 / Math.max(0.08, density))); // scale count by area
      points = new Array(count).fill(0).map(() => {
        const speed = rand(0.15, 0.45);
        return {
          x: rand(0, W), y: rand(0, H),
          vx: rand(-speed, speed), vy: rand(-speed, speed),
          r: rand(1.2, 2.4),
          color: palette[Math.floor(rand(0, palette.length))]
        };
      });
    }

    function step(){
      ctx.clearRect(0, 0, W, H);

      // slight background gradient wash
      const g = ctx.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, 'rgba(0,102,204,0.06)'); // #0066cc
      g.addColorStop(1, 'rgba(40,167,69,0.04)'); // #28a745
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      // update and draw particles
      for (let p of points){
        p.x += p.vx; p.y += p.vy;
        // wrap around edges
        if (p.x < -10) p.x = W + 10; else if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10; else if (p.y > H + 10) p.y = -10;

        // gentle mouse attraction
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const d2 = dx*dx + dy*dy;
        if (d2 < 16000) { // within 126px
          const d = Math.sqrt(Math.max(1, d2));
          p.x += dx / d * 0.35;
          p.y += dy / d * 0.35;
        }

        ctx.beginPath();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.75;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // draw connections
      const maxDist = connectDist;
      for (let i = 0; i < points.length; i++){
        const p1 = points[i];
        for (let j = i + 1; j < points.length; j++){
          const p2 = points[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const d2 = dx*dx + dy*dy;
          if (d2 < maxDist*maxDist){
            const t = 1 - Math.sqrt(d2)/maxDist;
            ctx.strokeStyle = '#0a6cd1';
            ctx.globalAlpha = lerp(0, 0.35, t);
            ctx.lineWidth = lerp(0, 1.2, t);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;

      requestAnimationFrame(step);
    }

    function onMove(e){
      const rect = canvas.getBoundingClientRect();
      mouse.x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      mouse.y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    }
    function onLeave(){ mouse.x = -9999; mouse.y = -9999; }

    window.addEventListener('resize', resize);
    canvas.addEventListener('mousemove', onMove, { passive: true });
    canvas.addEventListener('touchmove', onMove, { passive: true });
    canvas.addEventListener('mouseleave', onLeave, { passive: true });
    canvas.addEventListener('touchend', onLeave, { passive: true });

    resize();
    requestAnimationFrame(step);

    // return cleanup if needed later
    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('touchmove', onMove);
      canvas.removeEventListener('mouseleave', onLeave);
      canvas.removeEventListener('touchend', onLeave);
      container.removeChild(canvas);
    };
  }

  window.addEventListener('DOMContentLoaded', function(){
    sections.forEach(s => {
      const el = document.getElementById(s.id);
      makeScene(el, s.palette, s.density, s.connect);
    });
  });
})();
