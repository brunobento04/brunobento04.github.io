/* ============================================================================
   Bruno Bento . Portfolio
   O hero e CSS puro: a solda, a costura e os reveals nao dependem de JS.
   Este arquivo faz uma coisa, e ela e invisivel quando funciona:
   segura a abertura ate a tipografia estar pronta.
   ========================================================================== */

/* ── Tipografia ──────────────────────────────────────────────────────────────
   O problema: com font-display:swap, a fonte pode trocar no meio do reveal.
   O texto reflowa enquanto esta em opacity/translate e a abertura parece
   quebrada. Entao a peca fica parada no primeiro quadro (classe type-pending,
   aplicada pelo script inline no <head>) ate a tipografia estar pronta.

   Rede de seguranca: o timeout de 700ms mora no <head>, dentro do mesmo script
   que aplica a classe. Se este arquivo nao carregar, a pagina abre do mesmo
   jeito. Sem JS, a classe nunca existe e a animacao roda direto. */

(function () {
  'use strict';

  var root = document.documentElement;

  function release() {
    root.classList.remove('type-pending');
  }

  if (document.fonts && document.fonts.ready) {
    // Solta nos dois casos: fonte carregada ou falhou. O que nao pode e
    // ficar preso esperando.
    document.fonts.ready.then(release, release);
  } else {
    release();
  }
})();


/* ============================================================================
   Baralho conduzido pelo scroll. Rolar pra baixo puxa o card da frente pra cima
   e revela o proximo; pra cima, desfaz. O baralho fica preso (sticky) e o scroll
   escreve so transform/opacity (rAF, leve). Movimento reduzido / sem JS: os
   cards ficam numa coluna simples (o CSS cuida). */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var rolo = document.getElementById('rolo');
  var deck = document.getElementById('baralho');
  if (!rolo || !deck || reduce) return;
  var cartas = Array.prototype.slice.call(deck.querySelectorAll('.carta'));
  var N = cartas.length;
  if (N < 2) return;

  rolo.style.height = (N * 100) + 'vh';

  function frame() {
    var scrollable = rolo.offsetHeight - window.innerHeight;
    var top = rolo.getBoundingClientRect().top;
    var passed = Math.min(Math.max(-top, 0), scrollable);
    var prog = scrollable > 0 ? passed / scrollable : 0;
    var s = prog * (N - 1);
    for (var i = 0; i < N; i++) {
      var d = i - s, ty, sc, rot, br;
      if (d <= 0) {                    // a frente ou ja subiu
        var up = Math.min(1, -d);
        ty = -up * 116; sc = 1; rot = up * -3.2; br = 1;
      } else {                         // atras, na pilha
        var depth = d < 3 ? d : 3;
        ty = depth * 2.4; sc = 1 - depth * 0.05; rot = 0; br = 1 - depth * 0.06;
      }
      var st = cartas[i].style;
      st.transform = 'translateY(' + ty.toFixed(2) + '%) scale(' + sc.toFixed(3) + ') rotate(' + rot.toFixed(2) + 'deg)';
      st.filter = 'brightness(' + br.toFixed(3) + ')';
      st.zIndex = String(N - i);
    }
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { frame(); ticking = false; });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  frame();
})();
