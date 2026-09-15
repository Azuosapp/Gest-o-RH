/* ==========================================================================
   Zuzu — assistente de dicas do Grupo Azuos (Gestão de Pessoas)
   Widget autônomo: cria o próprio container no <body>, não depende de nada
   no HTML e não altera o app. Zero dependências, zero rede.

   API pública (opcional — o widget funciona sozinho):
     window.Zuzu.dizer({ texto, pose, titulo })  mostra uma dica avulsa
                                                 pose: ideia | lupa | alerta |
                                                 joinha | lendo | trofeu |
                                                 acenando | laptop | pensativo |
                                                 festejando | apontando | coracao
     window.Zuzu.proxima()     avança para a próxima dica da tela atual
     window.Zuzu.abrir()       reabre o balão (cancela o silêncio)
     window.Zuzu.fechar()      fecha e silencia por algumas horas
     window.Zuzu.minimizar()   recolhe para o Zuzu pequeno no canto
     window.Zuzu.abaAtual()    id da tela que o widget está enxergando
                               (null quando a tela aberta não tem dicas)

   Estado no localStorage, prefixo `azuos:rh:zuzu:`.
   ========================================================================== */

(function () {
  "use strict";

  var PREFIXO = "azuos:rh:zuzu:";
  var CHAVE_VISTAS = PREFIXO + "vistas";
  var CHAVE_SILENCIO = PREFIXO + "silencioAte";
  var CHAVE_MINIMIZADO = PREFIXO + "minimizado";
  var CHAVE_VOLTA = PREFIXO + "volta";

  var ATRASO_ENTRADA = 3000;      // aparece 3s depois do carregamento
  var HORAS_SILENCIO = 6;         // "Fechar" silencia por 6 horas
  var PASTA_POSES = "assets/zuzu/";

  /* ---------------------------------------------------------------------- */
  /* Conteúdo das dicas                                                      */
  /* ---------------------------------------------------------------------- */

  var DICAS = {
    dashboard: [
      { id: "ini-busca", pose: "lupa",
        texto: "A busca do topo procura em nome, telefone, vaga e responsável ao mesmo tempo. Os números do painel se ajustam enquanto você digita." },
      { id: "ini-filtros", pose: "apontando",
        texto: "Os cartões, o funil e a lista de origens obedecem aos mesmos filtros. Escolha uma vaga e veja só o processo dela." },
      { id: "ini-pendencias", pose: "alerta",
        texto: "Cada linha de Pendências da operação é um botão. Clique e o sistema abre a tela que resolve aquele número." },
      { id: "ini-rotinas", pose: "ideia",
        texto: "Em Rotinas de RH, Organizar documentos abre o cadastro do colaborador já rolando até a biblioteca de arquivos." },
      { id: "ini-funil", pose: "pensativo",
        texto: "O funil segue a ordem real do processo: triagem, 1ª fase, 2ª fase e contratação. A etapa mais cheia mostra onde os candidatos estão parando." },
      { id: "ini-origens", pose: "lendo",
        texto: "A lista de origens traz só os canais que já trouxeram alguém, do maior para o menor. Consulte antes de decidir onde anunciar a próxima vaga." }
    ],

    candidatos: [
      { id: "cur-busca", pose: "lupa",
        texto: "A busca aceita nome, telefone ou vaga. Se você só lembra do número que ligou, digite o telefone mesmo." },
      { id: "cur-filtros", pose: "apontando",
        texto: "Status, vaga e origem filtram juntos. Combine os três para chegar em quem veio da Catho para Analista de DP e ainda está aguardando." },
      { id: "cur-contador", pose: "pensativo",
        texto: "O contador ao lado do título mostra quantos candidatos sobraram do total depois dos filtros. Bom jeito de perceber que filtrou demais." },
      { id: "cur-editar", pose: "lendo",
        texto: "Editar abre a ficha completa do candidato. Experiência, pretensão salarial e observações ficam ali, fora da tabela." },
      { id: "cur-contato", pose: "alerta",
        texto: "Ao salvar um candidato, o último contato passa a ser a data de hoje. Use essa coluna para achar quem ficou esquecido." },
      { id: "cur-indicadores", pose: "ideia",
        texto: "O botão Ver indicadores leva ao Início, onde o mesmo funil aparece em gráfico." }
    ],

    colaboradores: [
      { id: "col-abrir", pose: "apontando",
        texto: "Clique em qualquer linha da lista para abrir o cadastro completo daquele colaborador." },
      { id: "col-busca", pose: "lupa",
        texto: "A busca varre nome, CPF, cargo, departamento e e-mail. Digite um pedaço e a lista se ajusta na hora." },
      { id: "col-novo", pose: "joinha",
        texto: "Novo colaborador abre uma ficha em branco com o cursor já no nome. Nada é criado antes de você salvar." },
      { id: "col-contador", pose: "lendo",
        texto: "O contador do painel mostra quantos colaboradores sobraram dos filtros e quantos existem no total." },
      { id: "col-departamento", pose: "pensativo",
        texto: "O filtro de departamentos lista só os departamentos que já têm alguém cadastrado." },
      { id: "col-status", pose: "alerta",
        texto: "A coluna Status vem da ficha de cada pessoa: ativo, férias, afastado ou desligado. Mudou a situação, atualize no cadastro." }
    ],

    dossie: [
      { id: "dos-salvar", pose: "alerta",
        texto: "Termine sempre em Salvar cadastro. É ele que confere os campos obrigatórios e avisa se ficou algum vazio." },
      { id: "dos-cep", pose: "ideia",
        texto: "Digite o CEP completo e o sistema busca logradouro, bairro, cidade e estado sozinho." },
      { id: "dos-documentos", pose: "lendo",
        texto: "A biblioteca de documentos fica no fim desta tela, com upload, versões e histórico por colaborador." },
      { id: "dos-treinamento", pose: "trofeu",
        texto: "Cada treinamento guarda nome, carga horária e data. Na hora de comprovar capacitação, a lista já está pronta." },
      { id: "dos-atestado", pose: "coracao",
        texto: "No atestado dá para registrar CID, quantidade de dias, o médico e marcar quando foi parcial." },
      { id: "dos-historico", pose: "pensativo",
        texto: "O histórico funcional guarda admissão, promoção e alteração de cargo com data e descrição. É o lugar de explicar por que o salário mudou." }
    ],

    ferias: [
      { id: "fer-programar", pose: "apontando",
        texto: "Programar férias abre o formulário do período. A pessoa precisa estar cadastrada para aparecer na lista de colaboradores." },
      { id: "fer-alertas", pose: "alerta",
        texto: "Os alertas reúnem quem tem período concessivo vencendo em até 60 dias, incluindo os que já passaram do prazo." },
      { id: "fer-mes", pose: "pensativo",
        texto: "O filtro de mês muda só o calendário. Os alertas e a lista de períodos continuam mostrando tudo." },
      { id: "fer-filtros", pose: "lupa",
        texto: "A busca por colaborador e o filtro de status valem para os três blocos: alertas, calendário e lista de períodos." },
      { id: "fer-periodos", pose: "lendo",
        texto: "A lista de baixo mostra aquisitivo, limite concessivo e as datas das férias na mesma linha. É a conferência rápida de cada período." },
      { id: "fer-remover", pose: "ideia",
        texto: "Remover apaga o período na hora, sem pedir confirmação. Confira o nome antes de clicar." }
    ],

    "cadastro-configuracoes": [
      { id: "cfg-cards", pose: "apontando",
        texto: "Cada card abre uma lista: departamentos, cargos ou superiores diretos. Use Voltar para escolher outra." },
      { id: "cfg-sugestoes", pose: "ideia",
        texto: "O que está nessas listas vira sugestão nos campos Departamento, Cargo e Superior direto do cadastro do colaborador." },
      { id: "cfg-renomear", pose: "alerta",
        texto: "Renomear um item não muda as fichas já salvas. Quem estava com o nome antigo continua com ele." },
      { id: "cfg-remover", pose: "pensativo",
        texto: "Remover tira só a sugestão da lista. O colaborador que já usava aquele cargo mantém o cargo na ficha." },
      { id: "cfg-duplicado", pose: "lupa",
        texto: "Nome repetido não entra. Se você renomear um item para algo que já existe na lista, a alteração é ignorada." }
    ],

    relatorios: [
      { id: "rel-filtros", pose: "lupa",
        texto: "A exportação leva o que está filtrado em Gestão de currículos. Filtre por vaga ou status lá e volte aqui para exportar só aquele recorte." },
      { id: "rel-csv", pose: "laptop",
        texto: "O arquivo sai em CSV separado por ponto e vírgula, que o Excel e o Google Planilhas abrem direto." },
      { id: "rel-colunas", pose: "lendo",
        texto: "Vão sete colunas: nome, telefone, vaga, origem, responsável, status e último contato." },
      { id: "rel-vazio", pose: "alerta",
        texto: "Se o filtro não deixar nenhum candidato, o sistema avisa em vez de baixar um arquivo vazio." }
    ],

    configuracoes: [
      { id: "sis-local", pose: "pensativo",
        texto: "Tudo fica salvo no navegador deste computador. Em outra máquina ou outro navegador, a base aparece vazia." },
      { id: "sis-limite", pose: "alerta",
        texto: "Cada arquivo enviado pode ter até 2 MB, e o navegador guarda cerca de 5 MB no total. Passando disso, o sistema avisa e não grava pela metade." },
      { id: "sis-restaurar", pose: "lupa",
        texto: "Restaurar demonstração apaga candidatos, colaboradores, documentos e férias deste navegador. Ele pede confirmação antes, e não dá para desfazer." },
      { id: "sis-backup", pose: "ideia",
        texto: "Antes de restaurar, exporte os candidatos em Relatórios. É o jeito de guardar uma cópia fora do navegador." }
    ]
  };

  // Telas que fazem parte de um contexto maior: herdam as dicas do pai.
  var ATALHOS = {
    "novo-departamento": "cadastro-configuracoes",
    "novo-cargo": "cadastro-configuracoes",
    "novo-superior": "cadastro-configuracoes",
    documentos: "dossie"
  };

  var NOMES_ABA = {
    dashboard: "Início",
    candidatos: "Gestão de currículos",
    colaboradores: "Colaboradores",
    dossie: "Cadastro de colaboradores",
    ferias: "Gestão de férias",
    "cadastro-configuracoes": "Cadastro",
    relatorios: "Relatórios",
    configuracoes: "Dados do sistema"
  };

  /* ---------------------------------------------------------------------- */
  /* Armazenamento tolerante a falha                                         */
  /* ---------------------------------------------------------------------- */

  function ler(chave) {
    try { return window.localStorage.getItem(chave); } catch (e) { return null; }
  }

  function gravar(chave, valor) {
    try { window.localStorage.setItem(chave, valor); } catch (e) { /* modo privado */ }
  }

  function remover(chave) {
    try { window.localStorage.removeItem(chave); } catch (e) { /* ignora */ }
  }

  function lerVistas() {
    var bruto = ler(CHAVE_VISTAS);
    if (!bruto) return [];
    try {
      var lista = JSON.parse(bruto);
      return Array.isArray(lista) ? lista.filter(function (item) { return typeof item === "string"; }) : [];
    } catch (e) {
      return [];
    }
  }

  function marcarVista(id) {
    if (vistas.indexOf(id) !== -1) return;
    vistas.push(id);
    if (vistas.length > 200) vistas = vistas.slice(-200);
    gravar(CHAVE_VISTAS, JSON.stringify(vistas));
  }

  function silenciado() {
    var ate = Number(ler(CHAVE_SILENCIO));
    return !!ate && Date.now() < ate;
  }

  /* ---------------------------------------------------------------------- */
  /* Estado                                                                  */
  /* ---------------------------------------------------------------------- */

  var POSES = ["acenando", "alerta", "apontando", "coracao", "festejando", "ideia",
               "joinha", "laptop", "lendo", "lupa", "pensativo", "trofeu"];

  var vistas = lerVistas();
  var abaAtual = null;            // null = tela sem dicas, o widget some
  var dicaAtual = null;
  var avulsa = false;             // texto vindo de window.Zuzu.dizer()
  var aberto = false;
  var pronto = false;             // só depois do atraso de entrada
  var minimizado = ler(CHAVE_MINIMIZADO) === "1";
  var base = calcularBase();
  var el = {};

  function calcularBase() {
    var script = document.currentScript;
    var src = script && script.src;
    if (!src) return PASTA_POSES;
    return src.slice(0, src.lastIndexOf("/") + 1) + PASTA_POSES;
  }

  function caminhoPose(pose) {
    return base + "zuzu-" + pose + ".png";
  }

  /* ---------------------------------------------------------------------- */
  /* Montagem da interface (sem innerHTML)                                   */
  /* ---------------------------------------------------------------------- */

  function criar(tag, classe, texto) {
    var no = document.createElement(tag);
    if (classe) no.className = classe;
    if (texto != null) no.textContent = texto;
    return no;
  }

  function montar() {
    var raiz = criar("section", "zuzu-root");
    raiz.id = "zuzu-root";
    raiz.setAttribute("aria-label", "Dicas do Zuzu");

    var card = criar("div", "zuzu-card");
    card.setAttribute("role", "status");
    card.setAttribute("aria-live", "polite");
    card.hidden = true;

    var head = criar("div", "zuzu-head");
    head.appendChild(criar("span", "zuzu-dot"));
    head.appendChild(criar("span", "zuzu-title", "Dica do Zuzu"));

    var btnMin = criar("button", "zuzu-icon-btn", "–");
    btnMin.type = "button";
    btnMin.setAttribute("aria-label", "Minimizar as dicas do Zuzu");
    btnMin.title = "Minimizar";

    var btnFechar = criar("button", "zuzu-icon-btn", "×");
    btnFechar.type = "button";
    btnFechar.setAttribute("aria-label", "Fechar as dicas do Zuzu por algumas horas");
    btnFechar.title = "Fechar";

    head.appendChild(btnMin);
    head.appendChild(btnFechar);

    var body = criar("div", "zuzu-body");
    var avatar = criar("div", "zuzu-avatar");
    var img = document.createElement("img");
    img.alt = "";
    img.setAttribute("aria-hidden", "true");
    img.decoding = "async";
    img.src = caminhoPose("acenando");
    avatar.appendChild(img);

    var texto = criar("p", "zuzu-text", "");
    body.appendChild(avatar);
    body.appendChild(texto);

    var foot = criar("div", "zuzu-foot");
    var contador = criar("span", "zuzu-count", "");
    var btnFecharTexto = criar("button", "zuzu-btn is-ghost", "Fechar");
    btnFecharTexto.type = "button";
    btnFecharTexto.setAttribute("aria-label", "Fechar as dicas do Zuzu por algumas horas");
    var btnProxima = criar("button", "zuzu-btn is-primary", "Próxima dica");
    btnProxima.type = "button";
    btnProxima.setAttribute("aria-label", "Mostrar a próxima dica do Zuzu");

    foot.appendChild(contador);
    foot.appendChild(btnFecharTexto);
    foot.appendChild(btnProxima);

    card.appendChild(head);
    card.appendChild(body);
    card.appendChild(foot);

    var bolha = criar("button", "zuzu-bubble");
    bolha.type = "button";
    bolha.hidden = true;
    bolha.setAttribute("aria-label", "Abrir as dicas do Zuzu");
    bolha.title = "Dicas do Zuzu";
    var imgBolha = document.createElement("img");
    imgBolha.alt = "";
    imgBolha.setAttribute("aria-hidden", "true");
    imgBolha.src = caminhoPose("acenando");
    bolha.appendChild(imgBolha);
    bolha.appendChild(criar("span", "zuzu-badge"));

    raiz.appendChild(card);
    raiz.appendChild(bolha);
    raiz.hidden = true;
    document.body.appendChild(raiz);

    el = {
      raiz: raiz, card: card, img: img, texto: texto, contador: contador,
      bolha: bolha, btnProxima: btnProxima
    };

    btnMin.addEventListener("click", minimizar);
    btnFechar.addEventListener("click", fechar);
    btnFecharTexto.addEventListener("click", fechar);
    btnProxima.addEventListener("click", function () { proxima(true); });
    bolha.addEventListener("click", function () { abrir(true); });

    document.addEventListener("keydown", function (evento) {
      if (evento.key !== "Escape" || !aberto) return;
      if (document.querySelector("dialog[open]")) return; // deixa o modal fechar primeiro
      fechar();
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Seleção das dicas                                                       */
  /* ---------------------------------------------------------------------- */

  function listaDaAba(aba) {
    return (aba && DICAS[aba]) || [];
  }

  function indiceDe(lista, id) {
    for (var i = 0; i < lista.length; i++) if (lista[i].id === id) return i;
    return -1;
  }

  // Prefere dicas ainda não vistas; esgotadas, roda a lista em sequência
  // começando de um ponto que muda a cada volta.
  function escolherDica(aba, avancar) {
    var lista = listaDaAba(aba);
    if (!lista.length) return null;

    var atual = dicaAtual && indiceDe(lista, dicaAtual.id) !== -1 ? dicaAtual.id : null;
    var inicio = atual ? indiceDe(lista, atual) : -1;

    for (var passo = 1; passo <= lista.length; passo++) {
      var candidata = lista[(inicio + passo + lista.length) % lista.length];
      if (candidata.id !== atual && vistas.indexOf(candidata.id) === -1) return candidata;
    }

    // Todas já vistas: continua rodando, sem repetir a que está na tela.
    if (!avancar && !atual) {
      var volta = Number(ler(CHAVE_VOLTA)) || 0;
      gravar(CHAVE_VOLTA, String((volta + 1) % 1000));
      return lista[volta % lista.length];
    }

    if (lista.length === 1) return lista[0];
    return lista[(inicio + 1 + lista.length) % lista.length];
  }

  function mostrarDica(dica) {
    if (!dica) return;
    dicaAtual = dica;
    avulsa = false;
    el.img.src = caminhoPose(dica.pose);
    el.texto.textContent = dica.texto;

    var lista = listaDaAba(abaAtual);
    var posicao = indiceDe(lista, dica.id);
    el.contador.textContent = posicao === -1
      ? (NOMES_ABA[abaAtual] || "")
      : (NOMES_ABA[abaAtual] || "") + " · " + (posicao + 1) + " de " + lista.length;

    if (dica.id) marcarVista(dica.id);
  }

  /* ---------------------------------------------------------------------- */
  /* Exibição                                                                */
  /* ---------------------------------------------------------------------- */

  function esconder() {
    aberto = false;
    el.raiz.classList.remove("is-open");
    el.card.hidden = true;
    el.bolha.hidden = true;
    el.raiz.hidden = true;
  }

  // Ponto único de decisão: silêncio, tela sem dicas e estado minimizado.
  function renderizar() {
    if (!pronto) return;
    if (silenciado()) { esconder(); return; }
    if (!abaAtual && !avulsa) { esconder(); return; }  // tela sem dica: some

    el.raiz.hidden = false;

    if (minimizado) {
      el.card.hidden = true;
      el.bolha.hidden = false;
      el.raiz.classList.remove("is-open");
      aberto = false;
      return;
    }

    el.bolha.hidden = true;
    el.card.hidden = false;
    if (!avulsa && !dicaAtual) mostrarDica(escolherDica(abaAtual, false));
    aberto = true;
    // força o reflow para a transição de entrada acontecer
    void el.card.offsetWidth;
    el.raiz.classList.add("is-open");
  }

  /* ---------------------------------------------------------------------- */
  /* Ações                                                                   */
  /* ---------------------------------------------------------------------- */

  function abrir(forcado) {
    if (forcado) {
      remover(CHAVE_SILENCIO);
      minimizado = false;
      gravar(CHAVE_MINIMIZADO, "0");
    }
    pronto = true;
    renderizar();
    if (forcado && aberto) el.btnProxima.focus();
  }

  function proxima(vindoDoBotao) {
    if (!abaAtual) return;
    var dica = escolherDica(abaAtual, true);
    if (!dica) return;
    mostrarDica(dica);
    if (vindoDoBotao) el.btnProxima.focus();
  }

  function minimizar() {
    minimizado = true;
    gravar(CHAVE_MINIMIZADO, "1");
    renderizar();
    if (!el.bolha.hidden) el.bolha.focus();
  }

  function fechar() {
    gravar(CHAVE_SILENCIO, String(Date.now() + HORAS_SILENCIO * 60 * 60 * 1000));
    esconder();
  }

  function dizer(opcoes) {
    var dados = opcoes || {};
    var texto = typeof dados.texto === "string" ? dados.texto.trim() : "";
    if (!texto) return;
    remover(CHAVE_SILENCIO);
    minimizado = false;
    gravar(CHAVE_MINIMIZADO, "0");
    pronto = true;
    dicaAtual = null;
    avulsa = true;
    renderizar();
    el.img.src = caminhoPose(POSES.indexOf(dados.pose) === -1 ? "ideia" : dados.pose);
    el.texto.textContent = texto;
    el.contador.textContent = typeof dados.titulo === "string" ? dados.titulo : "";
  }

  /* ---------------------------------------------------------------------- */
  /* Detecção da tela visível                                                */
  /* ---------------------------------------------------------------------- */

  // O app esconde os painéis com a classe `hidden`; o menu agora tem grupos
  // recolhíveis, então o painel visível é a fonte mais confiável.
  function painelVisivel() {
    var paineis = document.querySelectorAll(".tab-panel");
    for (var i = 0; i < paineis.length; i++) {
      if (!paineis[i].classList.contains("hidden")) return paineis[i].id;
    }
    return "";
  }

  function detectarAba() {
    var id = painelVisivel();
    if (!id) {
      var ativo = document.querySelector(".nav-item[data-tab].active");
      id = ativo ? ativo.getAttribute("data-tab") : (location.hash || "").replace("#", "");
    }
    if (ATALHOS[id]) id = ATALHOS[id];
    return DICAS[id] ? id : null;   // telas sem dica não herdam contexto alheio
  }

  function sincronizarAba() {
    var aba = detectarAba();
    if (aba === abaAtual) return;
    abaAtual = aba;
    dicaAtual = null;
    avulsa = false;
    renderizar();
  }

  function observarAbas() {
    var paineis = document.querySelectorAll(".tab-panel");
    if (paineis.length && window.MutationObserver) {
      var observador = new MutationObserver(function () { sincronizarAba(); });
      for (var i = 0; i < paineis.length; i++) {
        observador.observe(paineis[i], { attributes: true, attributeFilter: ["class"] });
      }
    }
    document.addEventListener("click", function (evento) {
      var alvo = evento.target && evento.target.closest
        ? evento.target.closest("[data-tab], [data-home-tab], [data-settings-page], [data-settings-back], [data-open-employee]")
        : null;
      if (alvo) window.setTimeout(sincronizarAba, 0);
    });
    window.addEventListener("hashchange", function () { window.setTimeout(sincronizarAba, 0); });
  }

  /* ---------------------------------------------------------------------- */
  /* Inicialização                                                           */
  /* ---------------------------------------------------------------------- */

  function iniciar() {
    if (document.getElementById("zuzu-root")) return;
    montar();
    abaAtual = detectarAba();
    observarAbas();

    window.setTimeout(function () {
      pronto = true;
      sincronizarAba();
      renderizar();
    }, ATRASO_ENTRADA);
  }

  window.Zuzu = {
    dizer: dizer,
    proxima: function () { proxima(false); },
    abrir: function () { abrir(true); },
    fechar: fechar,
    minimizar: minimizar,
    abaAtual: function () { return abaAtual; }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();
