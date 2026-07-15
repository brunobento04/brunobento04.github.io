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
