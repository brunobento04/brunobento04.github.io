/* ============================================================================
   Bruno Bento . Portfolio
   O hero e CSS puro: a solda, a costura e os reveals nao dependem de JS.
   Este arquivo faz duas coisas, e as duas sao invisiveis quando funcionam.

     1. Segura a abertura ate a tipografia estar pronta.
     2. Troca o segmento do especime na secao Casos.

   Nenhuma das duas e requisito para a pagina existir: sem JS, o hero abre e
   o caso aparece inteiro, no segmento inicial. Nada aqui esconde conteudo.
   ========================================================================== */

/* ── 1. Tipografia ───────────────────────────────────────────────────────────
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


/* ── 2. O especime: troca de segmento ────────────────────────────────────────
   No sistema real, o vocabulario de cada oficio nao esta no codigo: esta numa
   coluna JSONB do segmento. Trocar de oficio e ler outra linha, e a tela nao
   sabe da diferenca.

   Aqui a mecanica e a mesma, de proposito: um objeto de dados troca os rotulos.
   Nenhum pedaco de estrutura muda quando o segmento muda, porque no sistema
   real tambem nao muda. Se este bloco falhar, a tela fica em Medicina, que e o
   estado que ja veio no HTML: completa, legivel, so parada.

   Nomes: todos ficticios. */

(function () {
  'use strict';

  var SEGMENTOS = {
    medicina: {
      pacientes: 'Pacientes',
      json: '{ "paciente": "Paciente", "profissional": "Médico(a)" }',
      nomes: [
        'Marina Sotto', 'Elias Prado', 'Renata Cabral',
        'Tomás Vieira', 'Iara Nunes', 'Otávio Rissi',
        'Bianca Sarmento', 'Caio Lustosa', 'Dora Aiub', 'Nelson Fraga',
        'Vera Mancuso', 'Rui Delfino', 'Lia Bastos',
        'Ícaro Quintela', 'Sônia Vaz'
      ]
    },
    veterinaria: {
      pacientes: 'Animais',
      json: '{ "paciente": "Animal", "profissional": "Médico(a) Veterinário(a)" }',
      nomes: [
        'Thor', 'Amora', 'Pitanga',
        'Zeca', 'Nina', 'Fumaça',
        'Bilu', 'Jade', 'Tostão', 'Mel',
        'Frida', 'Chico', 'Aurora',
        'Pipoca', 'Zoé'
      ]
    },
    academia: {
      pacientes: 'Alunos',
      json: '{ "paciente": "Aluno", "profissional": "Personal" }',
      nomes: [
        'Diego Amaral', 'Kelly Ferro', 'Wesley Dantas',
        'Sabrina Roque', 'Ivan Peçanha', 'Lorena Tavares',
        'Adriano Muniz', 'Paula Cerqueira', 'Rafa Bittar', 'Nádia Portela',
        'Gustavo Ipê', 'Cris Valadão', 'Théo Marinho',
        'Duda Rangel', 'Márcio Sales'
      ]
    }
  };

  var figura = document.querySelector('.spec');
  if (!figura) return;

  var botoes = figura.querySelectorAll('.spec__seg');
  var termos = figura.querySelectorAll('[data-term="pacientes"]');
  var json   = figura.querySelector('[data-json]');
  var nomes  = figura.querySelectorAll('[data-nome]');
  if (!botoes.length) return;

  var i;

  function aplicar(chave) {
    var seg = SEGMENTOS[chave];
    if (!seg) return;

    for (i = 0; i < termos.length; i++) termos[i].textContent = seg.pacientes;
    if (json) json.textContent = seg.json;

    // A ordem dos nomes segue a ordem dos eventos no DOM: cada agendamento
    // guarda o mesmo indice nos tres segmentos.
    for (i = 0; i < nomes.length; i++) {
      nomes[i].textContent = seg.nomes[i] || '';
    }

    for (i = 0; i < botoes.length; i++) {
      var ligado = botoes[i].getAttribute('data-seg') === chave;
      botoes[i].classList.toggle('is-active', ligado);
      botoes[i].setAttribute('aria-pressed', ligado ? 'true' : 'false');
    }

    // O texto ja trocou. A animacao so mostra onde olhar, e por isso comeca
    // depois: o clique nunca espera por ela. O reflow forcado reinicia a
    // animacao quando o mesmo botao ou o vizinho e clicado em seguida.
    figura.classList.remove('is-swapped');
    void figura.offsetWidth;
    figura.classList.add('is-swapped');
  }

  for (i = 0; i < botoes.length; i++) {
    botoes[i].addEventListener('click', function () {
      aplicar(this.getAttribute('data-seg'));
    });
  }
})();
