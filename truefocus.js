(function(){
  // Lightweight TrueFocus in vanilla JS using Web Animations API
  // Reads configuration from data-attributes on #trueFocus
  const el = document.getElementById('trueFocus');
  if (!el) return;

  const sentence = el.getAttribute('data-sentence') || 'True Focus';
  const borderColor = el.getAttribute('data-border-color') || 'green';
  const glowColor = el.getAttribute('data-glow-color') || 'rgba(0,255,0,0.6)';
  const blurAmount = parseFloat(el.getAttribute('data-blur-amount') || '5');
  const duration = parseFloat(el.getAttribute('data-duration') || '0.5');
  const pause = parseFloat(el.getAttribute('data-pause') || '1');
  const words = sentence.split(/\s+/).filter(Boolean);

  // Build words
  const wordRefs = [];
  words.forEach((w, i) => {
    const span = document.createElement('span');
    span.className = 'focus-word';
    span.textContent = w;
    el.appendChild(span);
    wordRefs.push(span);
  });

  // Build frame
  const frame = document.createElement('div');
  frame.className = 'focus-frame';
  frame.style.setProperty('--border-color', borderColor);
  frame.style.setProperty('--glow-color', glowColor);
  ['top-left','top-right','bottom-left','bottom-right'].forEach(cls => {
    const c = document.createElement('span');
    c.className = 'corner ' + cls;
    frame.appendChild(c);
  });
  el.appendChild(frame);

  let idx = 0;
  let rafId = null;
  let running = true;

  function setActive(i){
    wordRefs.forEach((s, k) => {
      const isActive = k === i;
      s.style.filter = isActive ? 'blur(0px)' : `blur(${blurAmount}px)`;
      s.classList.toggle('active', isActive);
    });
    positionFrame(i);
  }

  function positionFrame(i){
    const target = wordRefs[i];
    if (!target) return;
    const parentRect = el.getBoundingClientRect();
    const r = target.getBoundingClientRect();
    const x = r.left - parentRect.left;
    const y = r.top - parentRect.top;
    const w = r.width;
    const h = r.height;

    // Animate with Web Animations API
    frame.animate([
      { transform: `translate(${frame._x||0}px, ${frame._y||0}px)` , width: `${frame._w||0}px`, height: `${frame._h||0}px`, opacity: frame._x==null?0:1 },
      { transform: `translate(${x}px, ${y}px)`, width: `${w}px`, height: `${h}px`, opacity: 1 }
    ], { duration: duration * 1000, fill: 'forwards', easing: 'ease' });

    frame._x = x; frame._y = y; frame._w = w; frame._h = h;
  }

  function cycle(){
    if (!running) return;
    setActive(idx);
    idx = (idx + 1) % words.length;
    setTimeout(() => { requestAnimationFrame(cycle); }, pause * 1000 + duration * 1000);
  }

  function onResize(){
    // Recompute frame position on resize
    const activeIndex = (idx - 1 + words.length) % words.length;
    positionFrame(activeIndex);
  }

  // Hover interaction: focus a word while mouse is over
  wordRefs.forEach((w, i) => {
    w.addEventListener('mouseenter', () => {
      running = false;
      setActive(i);
    });
    w.addEventListener('mouseleave', () => {
      running = true;
      // resume from next index
      idx = (i + 1) % words.length;
      requestAnimationFrame(cycle);
    });
  });

  // Initial state
  setActive(0);
  requestAnimationFrame(cycle);
  window.addEventListener('resize', onResize);
})();
