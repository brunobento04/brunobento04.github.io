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
   A janela dos casos. Clicar num caso abre a demo aqui, num quadro com barra de
   titulo enxuta (nome . setor), rodando dentro de um <iframe> (navegavel de
   verdade). O src so entra ao abrir e sai ao fechar: a demo nao roda em segundo
   plano nem guarda o scroll de uma visita pra outra.
   E um overlay fixo comum, pra renderizar igual em qualquer lugar. O JS cuida
   de Esc, clique no fundo e foco.
   Progressive enhancement: sem JS, o link do caso abre a demo na pagina
   inteira, como sempre. Nada aqui e dependencia. */

(function () {
  'use strict';

  var modal = document.getElementById('browser');
  if (!modal) return;

  var frame   = document.getElementById('browser-page');
  var nameEl  = document.getElementById('browser-name');
  var setorEl = document.getElementById('browser-setor');
  var closeB  = document.getElementById('browser-close');
  var opener  = null;

  // O iframe cobre o "carregando" so quando ha src de verdade. Ao fechar,
  // limpamos o src e o load de about:blank nao pode marcar como carregado.
  frame.addEventListener('load', function () {
    if (frame.getAttribute('src')) modal.classList.add('is-loaded');
  });

  function open(href, name, setor, title) {
    opener = document.activeElement;
    if (name)  nameEl.textContent = name;
    if (setor) setorEl.textContent = setor;
    if (title) frame.title = 'Demonstração: ' + title;
    modal.classList.remove('is-loaded');
    frame.src = href;
    document.documentElement.classList.add('browser-open');
    modal.hidden = false;
    if (closeB && closeB.focus) closeB.focus();
    document.addEventListener('keydown', onKey);
  }

  function close() {
    modal.hidden = true;
    document.documentElement.classList.remove('browser-open');
    frame.removeAttribute('src');
    modal.classList.remove('is-loaded');
    document.removeEventListener('keydown', onKey);
    if (opener && opener.focus) opener.focus();
    opener = null;
  }

  function onKey(e) {
    if (e.key === 'Escape' || e.keyCode === 27) { e.preventDefault(); close(); }
  }

  // clique no fundo (qualquer elemento marcado data-close) fecha
  var closers = modal.querySelectorAll('[data-close]');
  for (var c = 0; c < closers.length; c++) closers[c].addEventListener('click', close);
  if (closeB) closeB.addEventListener('click', close);

  // liga os casos. O href do link continua sendo o fallback sem JS.
  var links = document.querySelectorAll('[data-demo]');
  for (var i = 0; i < links.length; i++) {
    links[i].addEventListener('click', function (e) {
      // deixa passar ctrl/cmd/shift/clique-do-meio: quem quer aba nova, abre
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      open(this.getAttribute('data-demo'), this.getAttribute('data-demo-name'), this.getAttribute('data-demo-setor'), this.getAttribute('data-demo-title'));
    });
  }
})();
