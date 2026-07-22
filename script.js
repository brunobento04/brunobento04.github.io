/* ============================================================================
   Bruno Bento . Portfolio
   O hero e CSS puro: a solda, a costura e os reveals nao dependem de JS.
   Este arquivo faz duas coisas:
     1. segura a abertura ate a tipografia estar pronta (invisivel);
     2. conduz o baralho NO DESKTOP (>= 769px) em modo SNAP por indice: um gesto
        de scroll = troca de card, com transicao firme (~420ms, so transform/
        opacity). Enquanto um card nao esta 100% na tela e ativo, o conteudo
        interno (e o iframe) fica travado (pointer-events: none) e a roda avanca
        o deck; so o card ativo e ja assentado libera a interacao interna.
        No celular (<= 768px) o deck vira coluna empilhada (o CSS cuida).
   ========================================================================== */

/* ── Tipografia ──────────────────────────────────────────────────────────────
   Com font-display:swap a fonte pode trocar no meio do reveal e reflowar. Entao
   a peca fica parada no primeiro quadro (classe type-pending, aplicada pelo
   script inline no <head>) ate a tipografia estar pronta. Rede de seguranca: o
   timeout de 700ms mora no <head>. Sem JS, a classe some e a animacao roda. */

(function () {
  'use strict';
  var root = document.documentElement;
  function release() { root.classList.remove('type-pending'); }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(release, release);
  } else {
    release();
  }
})();


/* ============================================================================
   Deck em modo SNAP (desktop >= 769px). Sem scroll-scrub: a roda/teclado/toque
   escolhem um indice ativo e o CSS anima a troca (transition transform/opacity,
   var --t-deck). Threshold baixo = pouco gesto ja troca. Interno travado ate o
   card estar ativo e assentado. Reduced-motion / sem JS: coluna simples (CSS).
   ========================================================================== */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var rolo = document.getElementById('rolo');
  var deck = document.getElementById('baralho');
  if (!rolo || !deck || reduce) return;
  var cartas = Array.prototype.slice.call(deck.querySelectorAll('.carta'));
  var N = cartas.length;
  if (N < 2) return;

  var DESKTOP = 769;
  var T_DECK = 420;            // casa com --t-deck no CSS
  var SETTLE = T_DECK + 130;   // quando o card ficou 100% visivel: libera interno
  var THRESHOLD = 24;          // px normalizados: pouco gesto ja troca
  var IDLE = 140;              // zera o acumulador entre gestos

  var enabled = false;
  var active = 0;
  var animating = false;
  var accum = 0;
  var idleTimer = 0;
  var settleTimer = 0;
  var dots = null;

  /* Mesmos pontos-de-parada do desktop aprovado, agora por indice inteiro.
     So transform + opacity (a profundidade da pilha vem da opacity, nao de
     filter, pra ficar dentro da regra de animar so transform/opacity). */
  function poseFor(i) {
    var d = i - active, ty, sc, rot, op;
    if (d <= 0) {                     // ativo (d=0) ou ja subiu (off-screen)
      var up = Math.min(1, -d);
      ty = -up * 116; sc = 1; rot = up * -3.2; op = 1;
    } else {                          // atras, na pilha
      var depth = d < 3 ? d : 3;
      ty = depth * 2.4; sc = 1 - depth * 0.05; rot = 0; op = 1 - depth * 0.12;
    }
    return {
      t: 'translateY(' + ty.toFixed(2) + '%) scale(' + sc.toFixed(3) + ') rotate(' + rot.toFixed(2) + 'deg)',
      o: op.toFixed(3),
      z: String(N - i)
    };
  }

  function render(instant) {
    for (var i = 0; i < N; i++) {
      var st = cartas[i].style;
      if (instant) st.transition = 'none';
      var p = poseFor(i);
      st.transform = p.t;
      st.opacity = p.o;
      st.zIndex = p.z;
      st.filter = '';
      st.pointerEvents = 'none';   // trava TUDO durante a troca (nada de iframe)
    }
    if (instant) {
      void deck.offsetWidth;       // reflow, depois devolve a transicao do CSS
      for (var j = 0; j < N; j++) cartas[j].style.transition = '';
    }
  }

  /* Card 100% na viewport e ativo: so ele libera scroll/interacao internos. */
  function settle() {
    for (var i = 0; i < N; i++) {
      cartas[i].style.pointerEvents = (i === active ? 'auto' : 'none');
    }
  }

  function go(idx) {
    idx = Math.max(0, Math.min(N - 1, idx));
    if (idx === active || animating) return;
    active = idx;
    animating = true;
    render(false);
    updateDots();
    clearTimeout(settleTimer);
    settleTimer = setTimeout(function () { animating = false; settle(); }, SETTLE);
  }

  function norm(e) {
    var d = e.deltaY;
    if (e.deltaMode === 1) d *= 16;        // linhas
    else if (e.deltaMode === 2) d *= 400;  // paginas
    return d;
  }

  /* A roda so chega aqui quando NAO esta sobre um iframe ativo/liberado (o
     iframe ativo captura o proprio scroll). Logo, aqui o deck sempre manda. */
  function onWheel(e) {
    if (!enabled) return;
    e.preventDefault();
    if (animating) return;
    accum += norm(e);
    clearTimeout(idleTimer);
    idleTimer = setTimeout(function () { accum = 0; }, IDLE);
    if (Math.abs(accum) >= THRESHOLD) {
      var dir = accum > 0 ? 1 : -1;
      accum = 0;
      go(active + dir);
    }
  }

  function onKey(e) {
    if (!enabled) return;
    var k = e.key;
    if (k === 'ArrowDown' || k === 'PageDown' || k === ' ' || k === 'Spacebar') { e.preventDefault(); go(active + 1); }
    else if (k === 'ArrowUp' || k === 'PageUp') { e.preventDefault(); go(active - 1); }
    else if (k === 'Home') { e.preventDefault(); go(0); }
    else if (k === 'End') { e.preventDefault(); go(N - 1); }
  }

  var touchY = null;
  function onTouchStart(e) { if (enabled) touchY = e.touches[0].clientY; }
  function onTouchMove(e) { if (enabled && touchY !== null) e.preventDefault(); }
  function onTouchEnd(e) {
    if (!enabled || touchY === null) return;
    var end = e.changedTouches[0] ? e.changedTouches[0].clientY : touchY;
    var dy = touchY - end;
    touchY = null;
    if (Math.abs(dy) > 40) go(active + (dy > 0 ? 1 : -1));
  }

  function buildDots() {
    if (dots) return;
    dots = document.createElement('nav');
    dots.className = 'deck-dots';
    dots.setAttribute('aria-label', 'Navegar entre os casos');
    for (var i = 0; i < N; i++) {
      (function (idx) {
        var b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', 'Ir para o card ' + (idx + 1));
        b.addEventListener('click', function () { go(idx); });
        dots.appendChild(b);
      })(i);
    }
    document.body.appendChild(dots);
  }
  function updateDots() {
    if (!dots) return;
    var bs = dots.children;
    for (var i = 0; i < bs.length; i++) {
      if (i === active) bs[i].setAttribute('aria-current', 'true');
      else bs[i].removeAttribute('aria-current');
    }
  }

  function clearCards() {
    for (var i = 0; i < N; i++) {
      var st = cartas[i].style;
      st.transform = ''; st.opacity = ''; st.filter = '';
      st.zIndex = ''; st.pointerEvents = ''; st.transition = '';
    }
  }

  function enable() {
    enabled = true;
    rolo.style.height = '100dvh';   // uma viewport: a pagina nao rola, o deck sim
    buildDots();
    dots.style.display = 'flex';
    render(true);
    updateDots();
    clearTimeout(settleTimer);
    settleTimer = setTimeout(settle, 60);
  }
  function disable() {
    enabled = false;
    rolo.style.height = '';         // devolve o controle pro CSS (coluna mobile)
    clearCards();
    if (dots) dots.style.display = 'none';
  }

  function apply() {
    var want = window.innerWidth >= DESKTOP;
    if (want === enabled) return;
    if (want) enable(); else disable();
  }

  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('keydown', onKey);
  window.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: false });
  window.addEventListener('touchend', onTouchEnd);
  window.addEventListener('resize', apply);
  apply();
})();


/* ============================================================================
   Efeito de card no CELULAR (<= 768px): revela cada card ao entrar na viewport.
   No desktop quem manda e o deck (scrub) acima; aqui e so o modo coluna mobile.
   Sem IntersectionObserver ou com reduced-motion: cards ficam visiveis (sem
   classe .mrev, o CSS nem esconde). Seguro por construcao.
   ========================================================================== */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;
  var deck = document.getElementById('baralho');
  if (!deck) return;
  var cartas = Array.prototype.slice.call(deck.querySelectorAll('.carta'));
  if (!cartas.length) return;
  var MOBILE = 768, io = null;
  function ok(){ return ('IntersectionObserver' in window) && !reduce; }
  function reveal(el){ el.classList.add('in-view'); }
  function on(){
    if (!ok()) { cartas.forEach(reveal); return; }
    root.classList.add('mrev');
    if (!io) {
      io = new IntersectionObserver(function (ents){
        ents.forEach(function (e){ if (e.isIntersecting) { reveal(e.target); io.unobserve(e.target); } });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    }
    cartas.forEach(function (c){ if (!c.classList.contains('in-view')) io.observe(c); });
  }
  function off(){
    root.classList.remove('mrev');
    if (io) cartas.forEach(function (c){ io.unobserve(c); });
    cartas.forEach(function (c){ c.classList.remove('in-view'); });
  }
  function apply(){ if (window.innerWidth <= MOBILE) on(); else off(); }
  window.addEventListener('resize', apply);
  apply();
})();
