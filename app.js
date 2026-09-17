const statuses = [
  "Aguardando",
  "Aprovado - Triagem",
  "Reprovado - Triagem",
  "Aprovado 1° Fase",
  "Reprovado 1° Fase",
  "Aprovado 2° Fase",
  "Reprovado 2° Fase",
  "Contratado"
];

const sources = [
  "Catho",
  "Grupo do WhatsApp",
  "Indeed",
  "Linkedin",
  "Não Informado",
  "PIT",
  "Rede Sociais",
  "Trabalha Brasil",
  "Trafego Pago"
];

const initialCandidates = [
  { id: 1, name: "Marcella F. Stival", phone: "62 99945-1025", job: "Analista de DP", experience: "Acima de 5 anos", salary: "R$ 3.800,00", source: "Catho", owner: "Letícia", status: "Reprovado 2° Fase", lastContact: "26/06/2026", notes: "Não compareceu" },
  { id: 2, name: "Rossana Jorge Moreira", phone: "(62) 98271-8459", job: "Assistente de DP", experience: "Sem experiência", salary: "-", source: "Trafego Pago", owner: "Letícia", status: "Reprovado - Triagem", lastContact: "26/06/2026", notes: "Reprovado" },
  { id: 3, name: "Yasmim Assis", phone: "62991760995", job: "Analista Paralegal", experience: "Sem experiência", salary: "-", source: "Trafego Pago", owner: "Raissa", status: "Reprovado - Triagem", lastContact: "-", notes: "Reprovado" },
  { id: 4, name: "Cejany de Aquino Ribeiro", phone: "62 8126-8712", job: "Analista Paralegal", experience: "Sem experiência", salary: "-", source: "Trafego Pago", owner: "Letícia", status: "Reprovado - Triagem", lastContact: "-", notes: "Reprovado" },
  { id: 5, name: "Eduardo Lobo Moreira dos Santos", phone: "(62) 9 9430-7354", job: "Analista de DP", experience: "3 anos a 5 anos", salary: "-", source: "Trafego Pago", owner: "Letícia", status: "Reprovado - Triagem", lastContact: "-", notes: "Sem perfil" },
  { id: 6, name: "Denilda P. de Melo Silva", phone: "62 9939-2351", job: "Analista de DP", experience: "Acima de 5 anos", salary: "R$ 5.000,00", source: "Grupo do WhatsApp", owner: "Letícia", status: "Reprovado 1° Fase", lastContact: "26/06/2026", notes: "Salário" },
  { id: 7, name: "Adriana Sousa Bezerra", phone: "61 9916-0605", job: "Assistente Paralegal", experience: "1 ano a 3 anos", salary: "-", source: "Trafego Pago", owner: "Raissa", status: "Aguardando", lastContact: "-", notes: "" },
  { id: 8, name: "Dandara Silva Fraga", phone: "62 8271-2416", job: "Analista Paralegal", experience: "3 anos a 5 anos", salary: "R$ 3.000,00", source: "Catho", owner: "Letícia", status: "Reprovado 1° Fase", lastContact: "30/06/2026", notes: "Não compareceu" }
];

// =============================================================================
// ARMAZENAMENTO NO NAVEGADOR
// Ler: dado corrompido ou localStorage bloqueado nao pode derrubar a tela, entao
// cai nos dados de demonstracao (sempre copia, nunca a constante original).
// Gravar: o limite e de ~5 MB e documentos viram base64 aqui dentro. Quando a
// gravacao falha, avisamos e quem chamou desfaz a alteracao em memoria.
// =============================================================================
let appInitializing = true; // na abertura da pagina, falha de gravacao so vai pro console
const corruptedStorageKeys = new Set(); // nao sobrescrever na abertura o que nao conseguimos ler
const MAX_DOCUMENT_SIZE = 2 * 1024 * 1024;

function cloneData(value) {
  return JSON.parse(JSON.stringify(value));
}

function readStorage(key, fallback, isValid = () => true) {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (parsed !== null && isValid(parsed)) return parsed;
      corruptedStorageKeys.add(key);
      console.error(`Dados salvos em "${key}" estão num formato inesperado. Usando os dados de demonstração.`);
    }
  } catch (error) {
    corruptedStorageKeys.add(key);
    console.error(`Não foi possível ler "${key}" do armazenamento do navegador. Usando os dados de demonstração.`, error);
  }
  return cloneData(fallback);
}

function storageErrorMessage(error) {
  const quota = error && (error.name === "QuotaExceededError" || error.name === "NS_ERROR_DOM_QUOTA_REACHED" || error.code === 22 || error.code === 1014);
  return quota
    ? "Não foi possível salvar: o espaço de armazenamento do navegador está cheio.\n\nA última alteração NÃO foi salva. Remova documentos grandes ou antigos e tente novamente."
    : "Não foi possível salvar os dados neste navegador (o armazenamento pode estar bloqueado ou indisponível).\n\nA última alteração NÃO foi salva.";
}

function writeStorage(key, value, { silent = false } = {}) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Falha ao gravar "${key}" no armazenamento do navegador:`, error);
    if (!silent && !appInitializing) alert(storageErrorMessage(error));
    return false;
  }
}

// Ids unicos mesmo quando dois registros nascem no mesmo milissegundo.
let lastGeneratedId = 0;
function generateId(items = []) {
  const maxExisting = items.reduce((max, item) => Math.max(max, Number(item?.id) || 0), 0);
  lastGeneratedId = Math.max(Date.now(), lastGeneratedId + 1, maxExisting + 1);
  return lastGeneratedId;
}

// Corrige ids invalidos (0, vazio, texto) ou repetidos. Devolve true se mudou algo.
function ensureUniqueIds(items) {
  const seen = new Set();
  let changed = false;
  items.forEach((item) => {
    const id = Number(item.id);
    if (!Number.isFinite(id) || id <= 0 || seen.has(id)) {
      item.id = generateId(items);
      changed = true;
    } else if (item.id !== id) {
      item.id = id;
      changed = true;
    }
    seen.add(item.id);
  });
  return changed;
}

const isPlainObject = (value) => Boolean(value) && typeof value === "object" && !Array.isArray(value);

let candidates = readStorage("candidates", initialCandidates, Array.isArray).filter(isPlainObject);
const initialEmployees = [{
  id: 1, name: "Exemplo de colaborador", cpf: "", birth: "", email: "", phone: "", marital: "", birthplace: "", education: "",
  role: "Analista de Departamento Pessoal", department: "Recursos Humanos", manager: "Gestor responsável", level: "Pleno",
  admission: "", contract: "CLT", salary: "R$ 0,00", benefits: "", status: "Ativo",
  documents: [], documentLibrary: [], vacationPeriods: [], movements: [], trainings: [], feedbacks: [], medical: []
}];
let employees = readStorage("employees", initialEmployees, Array.isArray)
  .filter((employee) => isPlainObject(employee) && employee.name !== "Novo colaborador");
const initialSettingsLists = {
  departments: ["Recursos Humanos"],
  roles: ["Analista de Departamento Pessoal"],
  managers: ["Gestor responsável"],
  movementTypes: ["Advertência", "Alteração Salarial", "Ocorrências", "Promoção"]
};
let settingsLists = readStorage("settingsLists", initialSettingsLists, isPlainObject);
Object.keys(initialSettingsLists).forEach((key) => {
  settingsLists[key] = Array.isArray(settingsLists[key])
    ? settingsLists[key].filter((item) => typeof item === "string")
    : [...initialSettingsLists[key]];
});
ensureUniqueIds(candidates);
// Versoes antigas gravavam colaborador novo com id 0; o segundo sobrescrevia o primeiro.
ensureUniqueIds(employees);
employees.forEach((employee) => {
  if (!employee.level && employee.unit) employee.level = employee.unit;
  if (!Array.isArray(employee.documentLibrary)) employee.documentLibrary = [];
  if (!Array.isArray(employee.vacationPeriods)) employee.vacationPeriods = [];
  employee.documentLibrary = employee.documentLibrary.filter(isPlainObject);
  employee.vacationPeriods = employee.vacationPeriods.filter(isPlainObject);
  ensureUniqueIds(employee.documentLibrary);
  ensureUniqueIds(employee.vacationPeriods);
});
if (!corruptedStorageKeys.has("employees")) writeStorage("employees", employees, { silent: true });
const $ = (selector) => document.querySelector(selector);
let addressLookupRequest = 0;

// Mascote Zuzu. As poses vivem em brand/mascote/ e vieram do repo trilha-azuos.
// Ele so aparece em boas-vindas, telas vazias e comemoracoes - nunca no meio do
// trabalho, conforme o guia do mascote.
function zuzuMarkup(pose, size = "sm", anim = "") {
  const animClass = anim ? ` zuzu-anim-${anim}` : "";
  return `<img class="zuzu zuzu-${size}${animClass}" src="brand/mascote/zuzu-${pose}.png" alt="" loading="lazy">`;
}

// pose null = so o texto. Em telas com varias listas vazias ao mesmo tempo
// (ex.: ferias), so a lista principal ganha o mascote - um Zuzu por tela.
function emptyState(message, pose = "confuso") {
  const mascote = pose ? zuzuMarkup(pose) : "";
  return `<div class="record-empty">${mascote}<span>${message}</span></div>`;
}

function flagMarkup(code) {
  const slug = code.toLowerCase();
  return `<img class="phone-flag-image" src="https://flagcdn.com/w40/${slug}.png" srcset="https://flagcdn.com/w80/${slug}.png 2x" alt="" loading="lazy" data-flag-code="${code}">`;
}

function setPhoneCountry(inputId, countryCode) {
  const picker = document.querySelector(`[data-phone-country="${inputId}"]`);
  if (!picker) return;
  // O codigo vem do cadastro salvo: escapado, um valor estranho nao quebra o seletor.
  const option = picker.querySelector(`[data-country-code="${CSS.escape(String(countryCode || ""))}"]`) || picker.querySelector('[data-country-code="BR"]');
  picker.dataset.selectedCountry = option.dataset.countryCode;
  picker.querySelector(".phone-flag").innerHTML = flagMarkup(option.dataset.countryCode);
  picker.querySelector(".phone-country-code").textContent = option.dataset.dialCode;
  picker.querySelector(".phone-country-button").setAttribute("aria-label", `País selecionado: ${option.dataset.countryCode} ${option.dataset.dialCode}`);
  picker.querySelectorAll(".phone-country-option").forEach((item) => item.classList.toggle("selected", item === option));
}

function selectedPhoneCountry(inputId) {
  return document.querySelector(`[data-phone-country="${inputId}"]`)?.dataset.selectedCountry || "BR";
}

// =============================================================================
// COMBO DE CADASTRO (departamento, cargo, superior direto)
// Datalist nativa so aparecia depois de digitar, entao o usuario nunca via o
// que ja estava cadastrado em Configuracoes > Cadastro. Aqui a lista inteira
// abre ao focar o campo e vai filtrando conforme se digita.
// =============================================================================
function comboItems(key) {
  return settingsLists[key] || [];
}

function renderComboMenu(combo, query = "") {
  const menu = combo.querySelector(".combo-menu");
  const normalized = query.trim().toLocaleLowerCase("pt-BR");
  const atual = combo.querySelector("input").value.trim().toLocaleLowerCase("pt-BR");
  const items = comboItems(combo.dataset.combo).filter((item) => item.toLocaleLowerCase("pt-BR").includes(normalized));
  menu.innerHTML = items.length
    ? items.map((item) => `<button type="button" class="combo-option${item.toLocaleLowerCase("pt-BR") === atual ? " selected" : ""}" role="option" aria-selected="${item.toLocaleLowerCase("pt-BR") === atual}">${escapeHtml(item)}</button>`).join("")
    : `<span class="combo-empty">${comboItems(combo.dataset.combo).length ? "Nenhum resultado para esta busca." : "Nada cadastrado ainda. Use Configura\u00e7\u00f5es \u203a Cadastro."}</span>`;
}

function openCombo(combo, query = "") {
  document.querySelectorAll(".combo.open").forEach((outro) => { if (outro !== combo) closeCombo(outro); });
  renderComboMenu(combo, query);
  combo.classList.add("open");
  combo.querySelector("input").setAttribute("aria-expanded", "true");
  posicionarComboMenu(combo);
}

// O <dialog> tem overflow auto por padrao no navegador, entao a lista era
// cortada na borda dele. Escolhemos o lado com mais espaco dentro da caixa que
// limita (o dialogo, ou a tela quando o combo esta solto na pagina) e limitamos
// a altura ao que couber ali.
function posicionarComboMenu(combo) {
  const menu = combo.querySelector(".combo-menu");
  const caixa = combo.closest("dialog");
  const limites = caixa ? caixa.getBoundingClientRect() : { top: 0, bottom: window.innerHeight };
  const campo = combo.getBoundingClientRect();
  const abaixo = limites.bottom - campo.bottom - 10;
  const acima = campo.top - limites.top - 10;
  const paraCima = abaixo < menu.scrollHeight && acima > abaixo;
  combo.classList.toggle("drop-up", paraCima);
  menu.style.maxHeight = `${Math.max(120, Math.min(232, paraCima ? acima : abaixo))}px`;
}

function closeCombo(combo) {
  combo.classList.remove("open");
  combo.querySelector("input").setAttribute("aria-expanded", "false");
  combo.querySelectorAll(".combo-option.active").forEach((option) => option.classList.remove("active"));
}

function moveComboActive(combo, passo) {
  const options = [...combo.querySelectorAll(".combo-option")];
  if (!options.length) return;
  const atual = options.findIndex((option) => option.classList.contains("active"));
  const proximo = atual === -1 ? (passo > 0 ? 0 : options.length - 1) : (atual + passo + options.length) % options.length;
  options.forEach((option) => option.classList.remove("active"));
  options[proximo].classList.add("active");
  options[proximo].scrollIntoView({ block: "nearest" });
}

function pickComboValue(combo, value) {
  const input = combo.querySelector("input");
  input.value = value;
  closeCombo(combo);
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

// =============================================================================
// VENCIMENTO DO CONTRATO
// Data do contrato + Duracao => Vencimento, calculado sozinho.
// A duracao aceita texto livre: "60", "60 dias", "3 meses", "1 ano", "6 semanas".
// Convencao CLT: o dia de inicio conta como o primeiro dia do contrato, entao
// 90 dias a partir de 07/04/2026 vence em 05/07/2026 (inicio + 90 - 1 dia).
// Vencimento digitado na mao manda: o calculo para de sobrescrever.
// =============================================================================
function parseContractDuration(raw) {
  const texto = String(raw || "").trim().toLocaleLowerCase("pt-BR");
  if (!texto) return null;
  const match = texto.match(/(\d+)\s*([a-z\u00e0-\u00fc]*)/);
  if (!match) return null;
  const quantidade = Number(match[1]);
  if (!Number.isFinite(quantidade) || quantidade <= 0) return null;
  const unidade = match[2];
  if (!unidade || unidade.startsWith("d")) return { quantidade, unidade: "dias" };
  if (unidade.startsWith("sem")) return { quantidade, unidade: "semanas" };
  if (unidade.startsWith("m")) return { quantidade, unidade: "meses" };
  if (unidade.startsWith("a")) return { quantidade, unidade: "anos" };
  return null;
}

// Soma meses sem estourar o mes: 31/01 + 1 mes cai em 28/02, nao em 03/03.
function addMonthsUtc(data, meses) {
  const dia = data.getUTCDate();
  data.setUTCDate(1);
  data.setUTCMonth(data.getUTCMonth() + meses);
  const ultimoDia = new Date(Date.UTC(data.getUTCFullYear(), data.getUTCMonth() + 1, 0)).getUTCDate();
  data.setUTCDate(Math.min(dia, ultimoDia));
}

function contractExpirationFrom(inicioIso, duracao) {
  if (!inicioIso || !duracao) return "";
  const [ano, mes, dia] = inicioIso.split("-").map(Number);
  if (!ano || !mes || !dia) return "";
  const data = new Date(Date.UTC(ano, mes - 1, dia));
  if (Number.isNaN(data.getTime())) return "";
  if (duracao.unidade === "dias") data.setUTCDate(data.getUTCDate() + duracao.quantidade);
  else if (duracao.unidade === "semanas") data.setUTCDate(data.getUTCDate() + duracao.quantidade * 7);
  else if (duracao.unidade === "meses") addMonthsUtc(data, duracao.quantidade);
  else if (duracao.unidade === "anos") addMonthsUtc(data, duracao.quantidade * 12);
  data.setUTCDate(data.getUTCDate() - 1); // o dia de inicio ja conta
  return data.toISOString().slice(0, 10);
}

// Os dois periodos de experiencia usam exatamente a mesma logica, entao ficam
// descritos aqui e o resto do codigo e generico.
const PROBATION_PERIODS = [
  {
    chave: "1",
    rotulo: "1\u00ba per\u00edodo",
    inicio: "employee-contractDate",
    duracao: "employee-contractDuration",
    vencimento: "employee-contractExpiration",
    dicaDuracao: "contract-duration-hint",
    dicaVencimento: "contract-expiration-hint"
  },
  {
    chave: "2",
    rotulo: "2\u00ba per\u00edodo",
    inicio: "employee-contractDate2",
    duracao: "employee-contractDuration2",
    vencimento: "employee-contractExpiration2",
    dicaDuracao: "contract-duration2-hint",
    dicaVencimento: "contract-expiration2-hint"
  }
];

// Guarda o ultimo valor que o calculo escreveu em cada campo. O evento change
// de um input chega depois de reescrevermos o campo, e sem essa comparacao o
// eco seria confundido com edicao manual do usuario.
const ultimoCalculado = {};

function addDaysIso(iso, dias) {
  if (!iso) return "";
  const [ano, mes, dia] = iso.split("-").map(Number);
  if (!ano || !mes || !dia) return "";
  const data = new Date(Date.UTC(ano, mes - 1, dia));
  if (Number.isNaN(data.getTime())) return "";
  data.setUTCDate(data.getUTCDate() + dias);
  return data.toISOString().slice(0, 10);
}

function updateProbationPeriod(periodo) {
  const inicio = $(`#${periodo.inicio}`);
  const vencimento = $(`#${periodo.vencimento}`);
  const dicaDuracao = $(`#${periodo.dicaDuracao}`);
  const dicaVencimento = $(`#${periodo.dicaVencimento}`);
  const texto = $(`#${periodo.duracao}`).value.trim();
  const duracao = parseContractDuration(texto);

  dicaDuracao.className = "field-hint";
  if (texto && !duracao) {
    dicaDuracao.classList.add("error");
    dicaDuracao.textContent = "N\u00e3o entendi. Use algo como 30 dias, 45 dias ou 2 meses.";
  } else {
    dicaDuracao.textContent = duracao ? `${duracao.quantidade} ${duracao.unidade}` : "";
  }

  dicaVencimento.className = "field-hint";
  const calculado = contractExpirationFrom(inicio.value, duracao);
  if (!calculado) {
    // Sem dados para calcular: o que ja estiver no campo continua valendo.
    dicaVencimento.textContent = duracao && !inicio.value ? `Informe o in\u00edcio do ${periodo.rotulo} para calcular.` : "";
    return;
  }
  vencimento.value = calculado;
  ultimoCalculado[periodo.vencimento] = calculado;
  dicaVencimento.classList.add("calculated");
  dicaVencimento.textContent = `Calculado: ${duracao.quantidade} ${duracao.unidade} a partir do in\u00edcio.`;
}

// O 2o periodo emenda no 1o: comeca no dia seguinte ao vencimento dele.
function updateSecondPeriodStart() {
  const periodo = PROBATION_PERIODS[1];
  const inicio = $(`#${periodo.inicio}`);
  const dica = $("#contract-date2-hint");
  dica.className = "field-hint";
  const proximo = addDaysIso($(`#${PROBATION_PERIODS[0].vencimento}`).value, 1);
  if (!proximo) {
    // Sem vencimento no 1o periodo, o que estiver no campo continua valendo.
    dica.textContent = "";
    return;
  }
  inicio.value = proximo;
  ultimoCalculado[periodo.inicio] = proximo;
  dica.classList.add("calculated");
  dica.textContent = "Dia seguinte ao vencimento do 1\u00ba per\u00edodo.";
}

function updateProbationSchedule() {
  updateProbationPeriod(PROBATION_PERIODS[0]);
  updateSecondPeriodStart();
  updateProbationPeriod(PROBATION_PERIODS[1]);
}

// Troca de colaborador: mostra o que veio salvo, sem dicas de calculo. Nada e
// recalculado ate que alguem mexa num inicio ou numa duracao.
function resetContractExpirationState() {
  PROBATION_PERIODS.forEach((periodo) => {
    ultimoCalculado[periodo.vencimento] = "";
    [periodo.dicaDuracao, periodo.dicaVencimento].forEach((id) => {
      $(`#${id}`).className = "field-hint";
      $(`#${id}`).textContent = "";
    });
  });
  ultimoCalculado[PROBATION_PERIODS[1].inicio] = "";
  $("#contract-date2-hint").className = "field-hint";
  $("#contract-date2-hint").textContent = "";
  // Recalcula ja na abertura do colaborador: quem estava com data antiga ou
  // salva antes de uma correcao de regra volta ao valor certo, e as dicas
  // mostram de onde cada vencimento saiu.
  updateProbationSchedule();
}

function setupContractExpiration() {
  // Qualquer mudanca reprocessa os dois periodos, porque o 2o depende do 1o.
  // O inicio do 2o periodo fica de fora: ele e um campo calculado e tem
  // tratamento proprio em campoCalculado - reprocessar aqui sobrescreveria o
  // valor no mesmo instante em que o usuario o digita.
  const gatilhos = [
    PROBATION_PERIODS[0].inicio,
    PROBATION_PERIODS[0].duracao,
    PROBATION_PERIODS[1].duracao
  ];
  gatilhos.forEach((id) => {
    $(`#${id}`).addEventListener("input", updateProbationSchedule);
    $(`#${id}`).addEventListener("change", updateProbationSchedule);
  });

  // Digitar na mao num campo calculado vale como ajuste pontual: fica ate a
  // proxima mudanca de inicio ou duracao, que volta a mandar no valor.
  const campoCalculado = (id, dicaId) => {
    const campo = $(`#${id}`);
    const editado = () => {
      if (campo.value && campo.value === ultimoCalculado[id]) return; // eco do proprio calculo
      if (!campo.value) { updateProbationSchedule(); return; }
      $(`#${dicaId}`).className = "field-hint";
      $(`#${dicaId}`).textContent = "Preenchido manualmente.";
      // O ajuste manual precisa empurrar o que vem depois dele na corrente.
      if (id === PROBATION_PERIODS[0].vencimento) updateSecondPeriodStart();
      if (id !== PROBATION_PERIODS[1].vencimento) updateProbationPeriod(PROBATION_PERIODS[1]);
    };
    campo.addEventListener("input", editado);
    campo.addEventListener("change", editado);
  };
  PROBATION_PERIODS.forEach((periodo) => campoCalculado(periodo.vencimento, periodo.dicaVencimento));
  campoCalculado(PROBATION_PERIODS[1].inicio, "contract-date2-hint");
}

// =============================================================================
// LISTAS DE CADASTRO CRIADAS PELO USUARIO
// Departamentos, cargos e superiores sao fixos porque alimentam campos do
// dossie. Estas aqui sao livres: o usuario cria a lista (Turnos, Centros de
// custo...) e administra os itens na mesma pagina generica.
// =============================================================================
// Mesma protecao das outras chaves: dado corrompido ou armazenamento bloqueado
// nao pode derrubar o sistema inteiro na abertura.
let customLists = readStorage("customLists", [], (valor) => Array.isArray(valor)
  && valor.every((lista) => lista && typeof lista.nome === "string" && Array.isArray(lista.itens)));

// Se o navegador recusar a gravacao, volta ao estado de antes (backup tirado
// antes da alteracao) e redesenha - sem lista ou item fantasma na tela.
function salvarCustomLists(backup) {
  if (writeStorage("customLists", customLists)) return true;
  customLists = backup;
  renderCustomListCards();
  if (customListAtual()) renderCustomListItems();
  return false;
}

function customListAtual() {
  return customLists.find((lista) => lista.id === Number($("#lista-personalizada").dataset.listId));
}

function renderCustomListCards() {
  const grade = document.querySelector(".settings-cards");
  grade.querySelectorAll(".settings-custom-card").forEach((card) => card.remove());
  customLists.forEach((lista) => {
    const card = document.createElement("article");
    card.className = "settings-card settings-list-card settings-navigation-card settings-custom-card";
    card.setAttribute("role", "button");
    card.tabIndex = 0;
    const total = lista.itens.length;
    card.innerHTML = `<div><strong>${escapeHtml(lista.nome)}</strong><span>${total ? `${total} item(ns) cadastrado(s).` : "Nenhum item cadastrado ainda."}</span></div>`;
    const abrir = () => abrirCustomList(lista.id);
    card.addEventListener("click", abrir);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); abrir(); }
    });
    grade.appendChild(card);
  });
}

function renderCustomListItems() {
  const lista = customListAtual();
  if (!lista) return;
  $("#custom-list-title").textContent = lista.nome;
  $("#custom-list-items").innerHTML = lista.itens.length
    ? lista.itens.map((valor) => `<div class="settings-list-row"><span>${escapeHtml(valor)}</span><div class="settings-list-actions"><button type="button" class="settings-list-edit" data-edit-custom="${escapeHtml(valor)}">Editar</button><button type="button" class="settings-list-remove" data-remove-custom="${escapeHtml(valor)}">Remover</button></div></div>`).join("")
    : `<div class="settings-list-empty">${zuzuMarkup("pensativo")}<span>Nenhum item cadastrado.</span></div>`;
}

function abrirCustomList(id) {
  $("#lista-personalizada").dataset.listId = String(id);
  renderCustomListItems();
  activateTab("lista-personalizada");
  history.replaceState(null, "", "#lista-personalizada");
  $("#custom-list-form input").focus();
}

function criarCustomList(nome) {
  const normalizado = nome.trim();
  const recado = $("#new-list-error");
  recado.textContent = "";
  if (!normalizado) { recado.textContent = "D\u00ea um nome para a lista."; return null; }
  const jaExiste = customLists.some((lista) => lista.nome.toLocaleLowerCase("pt-BR") === normalizado.toLocaleLowerCase("pt-BR"))
    || ["departamentos", "cargos", "superiores diretos"].includes(normalizado.toLocaleLowerCase("pt-BR"));
  if (jaExiste) { recado.textContent = "J\u00e1 existe uma op\u00e7\u00e3o de cadastro com esse nome."; return null; }
  const backup = cloneData(customLists);
  const lista = { id: Date.now(), nome: normalizado, itens: [] };
  customLists.push(lista);
  customLists.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  if (!salvarCustomLists(backup)) return null;
  renderCustomListCards();
  return lista;
}

function addCustomListItem(valor) {
  const lista = customListAtual();
  const normalizado = valor.trim();
  if (!lista || !normalizado) return;
  if (lista.itens.some((item) => item.toLocaleLowerCase("pt-BR") === normalizado.toLocaleLowerCase("pt-BR"))) return;
  const backup = cloneData(customLists);
  lista.itens.push(normalizado);
  lista.itens.sort((a, b) => a.localeCompare(b, "pt-BR"));
  if (!salvarCustomLists(backup)) return;
  renderCustomListItems();
  renderCustomListCards();
}

function setupCustomLists() {
  renderCustomListCards();

  const fecharNovaLista = () => {
    $("#new-list-dialog").close();
    $("#new-list-name").value = "";
    $("#new-list-error").textContent = "";
  };
  $("#open-new-list").addEventListener("click", () => {
    $("#new-list-error").textContent = "";
    $("#new-list-dialog").showModal();
    $("#new-list-name").focus();
  });
  $("#close-new-list").addEventListener("click", fecharNovaLista);
  $("#cancel-new-list").addEventListener("click", fecharNovaLista);
  $("#new-list-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const lista = criarCustomList($("#new-list-name").value);
    if (!lista) return;
    fecharNovaLista();
    abrirCustomList(lista.id);
  });

  $("#custom-list-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const campo = $("#custom-list-form input");
    addCustomListItem(campo.value);
    campo.value = "";
    campo.focus();
  });

  $("#custom-list-focus").addEventListener("click", () => $("#custom-list-form input").focus());

  $("#custom-list-delete").addEventListener("click", () => {
    const lista = customListAtual();
    if (!lista) return;
    // Apagar a lista leva junto todos os itens dela, entao confirmamos antes.
    if (!window.confirm(`Excluir a op\u00e7\u00e3o "${lista.nome}" e os ${lista.itens.length} item(ns) dela?`)) return;
    const backup = cloneData(customLists);
    customLists = customLists.filter((item) => item.id !== lista.id);
    if (!salvarCustomLists(backup)) return;
    renderCustomListCards();
    activateTab("cadastro-configuracoes");
    history.replaceState(null, "", "#cadastro-configuracoes");
  });

  $("#custom-list-items").addEventListener("click", (event) => {
    const lista = customListAtual();
    if (!lista) return;
    const remover = event.target.closest("[data-remove-custom]");
    if (remover) {
      const backup = cloneData(customLists);
      lista.itens = lista.itens.filter((item) => item !== remover.dataset.removeCustom);
      if (!salvarCustomLists(backup)) return;
      renderCustomListItems();
      renderCustomListCards();
      return;
    }
    const editar = event.target.closest("[data-edit-custom]");
    if (editar) {
      const atual = editar.dataset.editCustom;
      const novo = window.prompt("Editar item", atual);
      if (novo === null) return;
      const normalizado = novo.trim();
      if (!normalizado) return;
      const duplicado = lista.itens.some((item) => item !== atual && item.toLocaleLowerCase("pt-BR") === normalizado.toLocaleLowerCase("pt-BR"));
      if (duplicado) return;
      const backup = cloneData(customLists);
      lista.itens = lista.itens.map((item) => (item === atual ? normalizado : item));
      lista.itens.sort((a, b) => a.localeCompare(b, "pt-BR"));
      if (!salvarCustomLists(backup)) return;
      renderCustomListItems();
    }
  });
}

// Liga um combo especifico. O combo do dialogo de movimentacao e criado na
// hora, entao precisa ser ligado depois que o HTML e montado.
function setupCombo(combo) {
  {
    const input = combo.querySelector("input");
    const toggle = combo.querySelector(".combo-toggle");
    const menu = combo.querySelector(".combo-menu");

    // Focar ou clicar mostra TUDO que esta cadastrado, nao so o que casa com o texto.
    input.addEventListener("focus", () => openCombo(combo));
    input.addEventListener("mousedown", () => { if (!combo.classList.contains("open")) openCombo(combo); });
    input.addEventListener("input", () => openCombo(combo, input.value));
    toggle.addEventListener("mousedown", (event) => {
      event.preventDefault();
      if (combo.classList.contains("open")) { closeCombo(combo); return; }
      openCombo(combo);
      input.focus();
    });

    input.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        if (!combo.classList.contains("open")) openCombo(combo);
        moveComboActive(combo, event.key === "ArrowDown" ? 1 : -1);
        return;
      }
      if (event.key === "Enter") {
        const ativo = combo.querySelector(".combo-option.active");
        if (ativo) { event.preventDefault(); pickComboValue(combo, ativo.textContent); }
        return;
      }
      if (event.key === "Escape" && combo.classList.contains("open")) {
        event.stopPropagation();
        closeCombo(combo);
      }
    });

    menu.addEventListener("mousedown", (event) => {
      const option = event.target.closest(".combo-option");
      if (!option) return;
      event.preventDefault();
      pickComboValue(combo, option.textContent);
    });

    input.addEventListener("blur", () => { window.setTimeout(() => closeCombo(combo), 120); });
  }
}

function setupCombos() {
  document.querySelectorAll(".combo").forEach(setupCombo);
  document.addEventListener("click", (event) => {
    document.querySelectorAll(".combo.open").forEach((combo) => {
      if (!combo.contains(event.target)) closeCombo(combo);
    });
  });
}

function refreshSettingsLists() {
  ["departments", "roles", "managers", "movementTypes"].forEach((key) => {
    const list = $(`#${key}-list`);
    list.innerHTML = settingsLists[key].length
      ? settingsLists[key].map((value) => `<div class="settings-list-row"><span>${escapeHtml(value)}</span><div class="settings-list-actions"><button type="button" class="settings-list-edit" data-edit-setting="${key}" data-setting-value="${escapeHtml(value)}">Editar</button><button type="button" class="settings-list-remove" data-remove-setting="${key}" data-setting-value="${escapeHtml(value)}">Remover</button></div></div>`).join("")
      : `<div class="settings-list-empty">${zuzuMarkup("pensativo")}<span>Nenhum item cadastrado.</span></div>`;
  });
  // Quem estiver com o combo aberto ve o item novo na hora.
  document.querySelectorAll(".combo.open").forEach((combo) => renderComboMenu(combo, combo.querySelector("input").value));
}

// Grava as listas de cadastro; se falhar, volta ao estado anterior.
function saveSettingsLists(backup) {
  if (writeStorage("settingsLists", settingsLists)) return true;
  settingsLists = backup;
  refreshSettingsLists();
  return false;
}

function addSettingItem(key, value) {
  const normalized = value.trim();
  if (!normalized) return true;
  if (!settingsLists[key].some((item) => item.toLocaleLowerCase("pt-BR") === normalized.toLocaleLowerCase("pt-BR"))) {
    const backup = cloneData(settingsLists);
    settingsLists[key].push(normalized);
    settingsLists[key].sort((a, b) => a.localeCompare(b, "pt-BR"));
    if (!saveSettingsLists(backup)) return false;
    refreshSettingsLists();
  }
  return true;
}

function removeSettingItem(key, value) {
  const backup = cloneData(settingsLists);
  settingsLists[key] = settingsLists[key].filter((item) => item !== value);
  if (!saveSettingsLists(backup)) return;
  refreshSettingsLists();
}

function editSettingItem(key, previousValue, nextValue) {
  const normalized = nextValue.trim();
  if (!normalized) return;
  const duplicate = settingsLists[key].some((item) => item !== previousValue && item.toLocaleLowerCase("pt-BR") === normalized.toLocaleLowerCase("pt-BR"));
  if (duplicate) return;
  const index = settingsLists[key].indexOf(previousValue);
  if (index === -1) return;
  const backup = cloneData(settingsLists);
  settingsLists[key][index] = normalized;
  settingsLists[key].sort((a, b) => a.localeCompare(b, "pt-BR"));
  if (!saveSettingsLists(backup)) return;
  refreshSettingsLists();
}

function populateCountryOptions() {
  const countrySelect = $("#employee-addressCountry");
  const displayNames = new Intl.DisplayNames(["pt-BR"], { type: "region" });
  const countries = [];
  for (let first = 65; first <= 90; first += 1) {
    for (let second = 65; second <= 90; second += 1) {
      const code = String.fromCharCode(first, second);
      const name = displayNames.of(code);
      if (name && name !== code && !countries.some((country) => country.name === name)) countries.push({ code, name });
    }
  }
  countries.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  countrySelect.innerHTML = `<option value="">Escolha o país</option>${countries.map((country) => `<option value="${escapeHtml(country.name)}">${escapeHtml(country.name)}</option>`).join("")}`;
  const dialCodes = {
    BR: "+55", US: "+1", CA: "+1", MX: "+52", AR: "+54", CL: "+56", CO: "+57", PE: "+51",
    UY: "+598", PY: "+595", BO: "+591", EC: "+593", VE: "+58", GB: "+44", PT: "+351",
    ES: "+34", FR: "+33", DE: "+49", IT: "+39", IE: "+353", NL: "+31", BE: "+32", CH: "+41",
    AT: "+43", AU: "+61", NZ: "+64", JP: "+81", CN: "+86", IN: "+91", KR: "+82", RU: "+7",
    ZA: "+27", AO: "+244", MZ: "+258", CV: "+238", EG: "+20", IL: "+972", AE: "+971", TR: "+90"
  };
  document.querySelectorAll(".phone-country-picker").forEach((picker) => {
    const menu = picker.querySelector(".phone-country-menu");
    const search = menu.querySelector(".phone-country-search");
    const renderCountries = (query = "") => {
      const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
      const filteredCountries = countries.filter((country) => `${country.code} ${country.name} ${dialCodes[country.code] || ""}`.toLocaleLowerCase("pt-BR").includes(normalizedQuery));
      menu.querySelectorAll(".phone-country-option").forEach((option) => option.remove());
      menu.insertAdjacentHTML("beforeend", filteredCountries.map((country) => `<button type="button" class="phone-country-option" role="option" data-country-code="${country.code}" data-dial-code="${dialCodes[country.code] || "+"}"><span class="phone-flag">${flagMarkup(country.code)}</span><span>${escapeHtml(country.code)} ${escapeHtml(country.name)} (${dialCodes[country.code] || "código"})</span></button>`).join(""));
      menu.querySelectorAll(".phone-country-option").forEach((option) => {
        option.addEventListener("click", () => {
          setPhoneCountry(picker.dataset.phoneCountry, option.dataset.countryCode);
          picker.classList.remove("open");
          picker.querySelector(".phone-country-button").setAttribute("aria-expanded", "false");
          search.value = "";
        });
      });
    };
    search.addEventListener("input", () => renderCountries(search.value));
    search.addEventListener("click", (event) => event.stopPropagation());
    search.addEventListener("keydown", (event) => event.stopPropagation());
    renderCountries();
    picker.dataset.selectedCountry = "BR";
    picker.querySelector(".phone-country-code").textContent = dialCodes.BR;
    picker.querySelector(".phone-flag").innerHTML = flagMarkup("BR");
    picker.querySelector(".phone-country-button").setAttribute("aria-label", `País selecionado: BR ${dialCodes.BR}`);
  });
}

function setAddressLookupStatus(message, isError = false) {
  const status = $("#employee-address-status");
  status.textContent = message;
  status.classList.toggle("error", isError);
}

async function lookupAddressByCep() {
  const cepInput = $("#employee-addressCep");
  const cep = cepInput.value.replace(/\D/g, "");
  if (cep.length !== 8) return;
  const requestId = ++addressLookupRequest;
  setAddressLookupStatus("Consultando CEP...");
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    if (!response.ok) throw new Error(`Consulta de CEP retornou status ${response.status}`);
    const address = await response.json();
    if (requestId !== addressLookupRequest) return;
    if (address.erro) {
      setAddressLookupStatus("CEP não encontrado.", true);
      return;
    }
    $("#employee-addressStreet").value = address.logradouro || "";
    $("#employee-addressNeighborhood").value = address.bairro || "";
    $("#employee-addressCity").value = address.localidade || "";
    $("#employee-addressState").value = address.uf || "";
    $("#employee-addressCountry").value = "Brasil";
    setAddressLookupStatus("Endereço preenchido automaticamente.");
  } catch (error) {
    if (requestId !== addressLookupRequest) return;
    setAddressLookupStatus("Não foi possível consultar o CEP.", true);
    console.error("Falha ao consultar CEP:", error);
  }
}

// Aba so e valida se existir um .tab-panel com esse id; qualquer outra coisa
// (hash digitado errado, link antigo) cai no inicio em vez de esconder tudo.
let activeTabName = "";

function resolveTab(tabName) {
  const panel = tabName ? document.getElementById(tabName) : null;
  return panel && panel.classList.contains("tab-panel") ? tabName : "dashboard";
}

function tabFromHash() {
  const raw = location.hash.slice(1);
  try {
    return decodeURIComponent(raw);
  } catch (error) {
    return raw;
  }
}

// Cada troca de aba vira uma entrada no historico, para o voltar/avancar funcionar.
function setTabHash(tabName) {
  if (location.hash === `#${tabName}`) return;
  history.pushState(null, "", `#${tabName}`);
}

function syncTabWithHash() {
  const requested = tabFromHash();
  const tab = resolveTab(requested);
  if (requested && requested !== tab) history.replaceState(null, "", `#${tab}`);
  if (tab !== activeTabName) activateTab(tab);
}

// Grupo recolhido no menu esconderia a aba ativa: abre o grupo dela.
function revealActiveNavItem() {
  document.querySelectorAll(".nav-item.active").forEach((item) => {
    const group = item.closest(".nav-group.collapsed");
    if (!group) return;
    group.classList.remove("collapsed");
    const toggle = group.querySelector(".nav-group-toggle");
    if (!toggle) return;
    toggle.setAttribute("aria-expanded", "true");
    const chevron = toggle.querySelector(".nav-chevron");
    if (chevron) chevron.textContent = "⌃";
  });
}

function activateTab(tabName, subtabName = "") {
  tabName = resolveTab(tabName);
  activeTabName = tabName;
  const showDocuments = tabName === "dossie";
  const showSettingsEntry = ["novo-departamento", "novo-cargo", "novo-superior", "novo-tipo-movimentacao", "lista-personalizada"].includes(tabName);
  document.body.classList.toggle("dossier-view", tabName === "dossie");
  document.body.classList.toggle("employee-list-view", tabName === "colaboradores");
  document.body.classList.toggle("settings-entry-view", showSettingsEntry);
  document.querySelectorAll(".nav-item[data-tab]").forEach((item) => item.classList.toggle("active", item.dataset.tab === tabName && (item.dataset.subtab || "") === subtabName));
  revealActiveNavItem();
  document.querySelectorAll(".tab-panel").forEach((panel) => panel.classList.toggle("hidden", panel.id !== tabName));
  $("#documentos").classList.toggle("hidden", !showDocuments);
  if (tabName === "dossie" || tabName === "colaboradores") window.scrollTo(0, 0);
  // A home so era desenhada no carregamento da pagina. Quem editava um
  // colaborador e voltava pra ca via o lembrete de experiencias desatualizado.
  if (tabName === "dashboard") renderProbationReminders();
  if (tabName === "acompanhamento") renderFollowup();
}

function vacationRecords() {
  return employees.flatMap((employee) => (employee.vacationPeriods || []).map((period) => ({ ...period, employeeId: employee.id, employeeName: employee.name })));
}

// Diferenca em dias de calendario: hoje = 0, amanha = 1, ontem = -1.
// A versao anterior media ate as 23:59:59 do dia alvo e arredondava pra cima,
// entao algo que vencia hoje aparecia como "vence em 1 dia" e todo prazo saia
// um dia maior. Comparar so as datas tira a influencia da hora atual.
function daysUntil(date) {
  const [ano, mes, dia] = String(date || "").split("-").map(Number);
  if (!ano || !mes || !dia) return NaN;
  const agora = new Date();
  const hoje = Date.UTC(agora.getFullYear(), agora.getMonth(), agora.getDate());
  return Math.round((Date.UTC(ano, mes - 1, dia) - hoje) / 86400000);
}

function renderVacations() {
  const query = $("#vacation-search").value.toLowerCase().trim();
  const status = $("#vacation-status-filter").value;
  const month = $("#vacation-month-filter").value;
  const records = vacationRecords().filter((record) => (!query || String(record.employeeName || "").toLowerCase().includes(query)) && (!status || record.status === status));
  const alerts = records.filter((record) => {
    const days = daysUntil(record.concessionDeadline);
    return record.status !== "Concluída" && days <= 60;
  }).sort((a, b) => String(a.concessionDeadline || "").localeCompare(String(b.concessionDeadline || "")));
  const scheduled = records.filter((record) => !month || String(record.vacationStart || "").startsWith(month)).sort((a, b) => String(a.vacationStart || "").localeCompare(String(b.vacationStart || "")));
  $("#vacation-total").textContent = records.length;
  $("#vacation-alert-count").textContent = alerts.length;
  $("#vacation-scheduled-count").textContent = scheduled.length;
  $("#vacation-alerts").innerHTML = alerts.length ? alerts.map((record) => {
    const days = daysUntil(record.concessionDeadline);
    const label = days < 0 ? `Vencido há ${Math.abs(days)} dia(s)` : `Vence em ${days} dia(s)`;
    return `<div class="pending-item vacation-alert"><div><strong>${escapeHtml(record.employeeName)}</strong><span>Concessivo até ${formatDate(record.concessionDeadline)}</span></div><b>${label}</b></div>`;
  }).join("") : emptyState("Nenhum período próximo do vencimento.", null);
  $("#vacation-calendar-title").textContent = month ? `Férias em ${formatMonth(month)}` : "Férias programadas";
  $("#vacation-calendar").innerHTML = scheduled.length ? scheduled.map((record) => `<div class="calendar-event"><span class="calendar-day">${formatDate(record.vacationStart, true)}</span><div><strong>${escapeHtml(record.employeeName)}</strong><span>${formatDate(record.vacationStart)} a ${formatDate(record.vacationEnd)} · ${escapeHtml(record.status)}</span></div></div>`).join("") : emptyState("Nenhuma férias programada para este período.", null);
  $("#vacation-list").innerHTML = records.length ? records.map((record) => `<div class="record-row"><div><strong>${escapeHtml(record.employeeName)} · ${escapeHtml(record.status)}</strong><span>Aquisitivo: ${formatDate(record.acquisitionStart)} a ${formatDate(record.acquisitionEnd)} · Concessivo até ${formatDate(record.concessionDeadline)} · Férias: ${formatDate(record.vacationStart)} a ${formatDate(record.vacationEnd)}</span></div><button type="button" class="remove-record" data-remove-vacation="${escapeHtml(record.employeeId)}:${escapeHtml(record.id)}">Remover</button></div>`).join("") : emptyState("Nenhum período de férias cadastrado.", "dormindo");
}

function formatDate(value, short = false) {
  if (!value) return "Sem data";
  return new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR", short ? { day: "2-digit", month: "short" } : undefined);
}

function formatMonth(value) {
  return new Date(`${value}-01T12:00:00`).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

function refreshVacationEmployees() {
  $("#vacation-employee").innerHTML = employees.map((employee) => `<option value="${escapeHtml(employee.id)}">${escapeHtml(employee.name)}</option>`).join("");
}

document.querySelectorAll(".nav-item[data-tab]").forEach((item) => {
  item.addEventListener("click", (event) => {
    event.preventDefault();
    activateTab(item.dataset.tab, item.dataset.subtab || "");
    setTabHash(item.dataset.subtab ? "dossie" : item.dataset.tab);
    if (item.dataset.subtab) $("#documentos").scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

$("#talent-menu-toggle").addEventListener("click", () => {
  const group = $(".nav-talent-group");
  const expanded = group.classList.toggle("collapsed") === false;
  $("#talent-menu-toggle").setAttribute("aria-expanded", String(expanded));
  $("#talent-menu-toggle .nav-chevron").textContent = expanded ? "⌃" : "⌄";
});

$("#settings-menu-toggle").addEventListener("click", () => {
  const group = $(".nav-settings-group");
  const expanded = group.classList.toggle("collapsed") === false;
  $("#settings-menu-toggle").setAttribute("aria-expanded", String(expanded));
  $("#settings-menu-toggle .nav-chevron").textContent = expanded ? "⌃" : "⌄";
});

function uniqueValues(field) {
  return [...new Set(candidates.map((candidate) => candidate[field]).filter(Boolean))].sort();
}

function statusClass(status) {
  const value = String(status ?? "");
  if (value === "Contratado") return "hired";
  if (value.includes("Aprovado")) return "approved";
  if (value.includes("Reprovado")) return "rejected";
  return "waiting";
}

function setupFilters() {
  // Recriar as opcoes nao pode apagar o filtro que o usuario tinha escolhido.
  const addOptions = (element, values, firstOption) => {
    const selected = element.value;
    element.innerHTML = `<option value="">${firstOption}</option>` + values.map((value) => `<option>${escapeHtml(value)}</option>`).join("");
    if (selected && values.map(String).includes(selected)) element.value = selected;
  };
  addOptions($("#status-filter"), statuses, "Todos os status");
  addOptions($("#job-filter"), uniqueValues("job"), "Todas as vagas");
  addOptions($("#source-filter"), sources, "Todas as origens");
  addOptions($("#dashboard-status-filter"), statuses, "Todos os status");
  addOptions($("#dashboard-job-filter"), uniqueValues("job"), "Todas as vagas");
  addOptions($("#dashboard-source-filter"), sources, "Todas as origens");
  addOptions($("#status"), statuses, "Selecione o status");
  addOptions($("#source"), sources, "Selecione a origem");
  $("#jobs").innerHTML = uniqueValues("job").map((job) => `<option value="${escapeHtml(job)}">`).join("");
}

function renderDashboard() {
  const dashboardCandidates = getFilteredDashboardCandidates();
  const total = dashboardCandidates.length;
  const waiting = dashboardCandidates.filter((candidate) => candidate.status === "Aguardando").length;
  const approved = dashboardCandidates.filter((candidate) => String(candidate.status ?? "").includes("Aprovado")).length;
  const hired = dashboardCandidates.filter((candidate) => candidate.status === "Contratado").length;
  $("#metrics").innerHTML = [
    ["Total de currículos", total, "Base cadastrada"],
    ["Aguardando triagem", waiting, "Ação pendente"],
    ["Em processo", approved, "Candidatos aprovados"],
    ["Contratados", hired, "Resultado final"]
  ].map(([label, value, note]) => `<div class="metric"><div class="metric-label">${label}</div><div class="metric-value">${value}</div><div class="metric-note">${note}</div></div>`).join("");

  const counts = statuses.map((status) => ({ status, count: dashboardCandidates.filter((candidate) => candidate.status === status).length }));
  const max = Math.max(...counts.map((item) => item.count), 1);
  $("#funnel").innerHTML = counts.map(({ status, count }) => `<div class="funnel-row"><span>${status}</span><div class="funnel-bar"><div class="funnel-fill" style="width:${(count / max) * 100}%"></div></div><span class="funnel-count">${count}</span></div>`).join("");
  $("#funnel-total").textContent = `${total} candidatos`;

  const sourceCounts = sources.map((source) => ({ source, count: dashboardCandidates.filter((candidate) => candidate.source === source).length })).filter((item) => item.count > 0).sort((a, b) => b.count - a.count);
  const sourceMax = Math.max(...sourceCounts.map((item) => item.count), 1);
  $("#sources").innerHTML = sourceCounts.length ? sourceCounts.map(({ source, count }) => `<div class="source-row"><span>${source}</span><div class="source-bar"><div class="source-fill" style="width:${(count / sourceMax) * 100}%"></div></div><strong>${count}</strong></div>`).join("") : `<span class="muted">Ainda não há origens cadastradas.</span>`;
  $("#home-date").textContent = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
  const activeEmployees = employees.filter((employee) => employee.status === "Ativo").length;
  const documentsPending = employees.filter((employee) => !(employee.documentLibrary || []).length).length;
  $("#home-pending-list").innerHTML = [
    [`${waiting} currículo(s)`, "aguardando triagem", "candidatos"],
    [`${activeEmployees} colaborador(es)`, "com status ativo", "colaboradores"],
    [`${documentsPending} colaborador(es)`, "sem documentos na biblioteca", "documentos"]
  ].map(([value, label, tab]) => `<button type="button" class="pending-item" data-home-tab="${tab}"><strong>${value}</strong><span>${label}</span></button>`).join("");
  renderProbationReminders();
}

function getFilteredDashboardCandidates() {
  const query = $("#dashboard-search").value.toLowerCase().trim();
  const status = $("#dashboard-status-filter").value;
  const job = $("#dashboard-job-filter").value;
  const source = $("#dashboard-source-filter").value;
  return candidates.filter((candidate) => {
    const values = [candidate.name, candidate.phone, candidate.job, candidate.owner, candidate.source, candidate.status];
    return (!query || values.some((value) => String(value || "").toLowerCase().includes(query)))
      && (!status || candidate.status === status)
      && (!job || candidate.job === job)
      && (!source || candidate.source === source);
  });
}

function getFilteredCandidates() {
  const query = $("#search").value.toLowerCase().trim();
  const status = $("#status-filter").value;
  const job = $("#job-filter").value;
  const source = $("#source-filter").value;
  return candidates.filter((candidate) => {
    const matchesQuery = !query || [candidate.name, candidate.phone, candidate.job, candidate.owner, candidate.source, candidate.status].some((value) => String(value || "").toLowerCase().includes(query));
    return matchesQuery && (!status || candidate.status === status) && (!job || candidate.job === job) && (!source || candidate.source === source);
  });
}

function renderTable() {
  const filtered = getFilteredCandidates();
  $("#candidate-count").textContent = `${filtered.length} de ${candidates.length} candidatos`;
  $("#candidate-table").innerHTML = filtered.map((candidate) => `<tr>
    <td><div class="candidate-name">${escapeHtml(candidate.name)}</div><div class="candidate-phone">${escapeHtml(candidate.phone || "Telefone não informado")}</div></td>
    <td>${escapeHtml(candidate.job)}</td>
    <td>${escapeHtml(candidate.source)}</td>
    <td>${escapeHtml(candidate.owner || "A definir")}</td>
    <td><span class="badge ${statusClass(candidate.status)}">${escapeHtml(candidate.status)}</span></td>
    <td>${escapeHtml(candidate.lastContact || "-")}</td>
    <td><button class="row-action" data-edit="${escapeHtml(candidate.id)}">Editar</button></td>
  </tr>`).join("");
  $("#empty-state").classList.toggle("hidden", filtered.length > 0);
}

// =============================================================================
// LEMBRETE DE VENCIMENTO DAS EXPERIENCIAS (pagina inicial)
// Mostra quem esta com periodo de experiencia vencendo nos proximos 30 dias ou
// vencido nos ultimos 30. Os DOIS periodos entram: o 1o vencendo e justamente
// quando se decide prorrogar ou efetivar, entao escondê-lo porque existe um 2o
// periodo mais distante era perder o aviso mais urgente.
// =============================================================================
const PROBATION_ALERT_AHEAD = 30;
const PROBATION_ALERT_BEHIND = 30;

// Mesma corrente do dossie: Inicio + Duracao manda, o valor gravado so entra
// quando nao da pra calcular. Sem isso, um vencimento salvo desatualizado
// deixaria o lembrete fora de sincronia com o que o formulario mostra.
function probationSchedule(employee) {
  const venc1 = contractExpirationFrom(employee.contractDate, parseContractDuration(employee.contractDuration))
    || employee.contractExpiration || "";
  const inicio2 = venc1 ? addDaysIso(venc1, 1) : (employee.contractDate2 || "");
  const venc2 = contractExpirationFrom(inicio2, parseContractDuration(employee.contractDuration2))
    || employee.contractExpiration2 || "";
  return { venc1, inicio2, venc2 };
}

function probationDeadlines() {
  return employees.filter((employee) => employee.status !== "Desligado").flatMap((employee) => {
    // Quem ja foi efetivado ou teve o contrato encerrado sai do lembrete, e um
    // periodo com decisao registrada (ex.: 1o prorrogado) deixa de ser avisado.
    if (probationFinalDecision(employee)) return [];
    const { venc1, venc2 } = probationSchedule(employee);
    return [
      { periodo: "1", rotulo: "1\u00ba per\u00edodo", data: venc1 },
      { periodo: "2", rotulo: "2\u00ba per\u00edodo", data: venc2 }
    ].map(({ periodo, rotulo, data }) => {
      if (!data || probationDecisionFor(employee, periodo)) return null;
      const dias = daysUntil(data);
      if (dias > PROBATION_ALERT_AHEAD || dias < -PROBATION_ALERT_BEHIND) return null;
      return {
        id: employee.id,
        nome: employee.name || "Sem nome",
        cargo: employee.role || "Cargo n\u00e3o informado",
        rotulo,
        data,
        dias
      };
    });
  }).filter(Boolean).sort((a, b) => a.data.localeCompare(b.data));
}

function renderProbationReminders() {
  const itens = probationDeadlines();
  const vencidos = itens.filter((item) => item.dias < 0).length;
  $("#home-probation-count").textContent = itens.length
    ? `${itens.length} em aten\u00e7\u00e3o${vencidos ? ` \u00b7 ${vencidos} vencido(s)` : ""}`
    : "Pr\u00f3ximos 30 dias";
  $("#home-probation-list").innerHTML = itens.length ? itens.map((item) => {
    const estado = item.dias < 0 ? "vencido" : item.dias <= 7 ? "urgente" : "";
    const prazo = item.dias < 0
      ? `Venceu h\u00e1 ${Math.abs(item.dias)} dia(s)`
      : item.dias === 0 ? "Vence hoje" : `Vence em ${item.dias} dia(s)`;
    return `<button type="button" class="pending-item probation-item ${estado}" data-probation-employee="${item.id}" aria-label="Abrir ${escapeHtml(item.nome)}"><div><strong>${escapeHtml(item.nome)}</strong><span>${escapeHtml(item.cargo)} \u00b7 ${item.rotulo} at\u00e9 ${formatDate(item.data)}</span></div><b>${prazo}</b></button>`;
  }).join("") : emptyState("Nenhuma experi\u00eancia vencendo nos pr\u00f3ximos 30 dias.", null);
}

// =============================================================================
// FEEDBACK E EXPERIENCIA (aba acompanhamento)
// Os feedbacks moram em employee.feedbacks, o MESMO historico que o dossie
// mostra em "Feedbacks, advertencias e avaliacoes" - registrar aqui aparece la
// e vice-versa. As decisoes sobre a experiencia ficam em
// employee.probationDecisions: [{ id, periodo, resultado, data, responsavel,
// observacoes }], uma por periodo.
// =============================================================================
const FEEDBACK_TYPES = ["Feedback positivo", "Feedback construtivo", "Avaliação de desempenho", "Avaliação de experiência", "Advertência", "Comunicado"];
const PROBATION_SOON_DAYS = 15;
const FINAL_PROBATION_RESULTS = ["Efetivado", "Encerrado"];

function todayIsoLocal() {
  const agora = new Date();
  return new Date(Date.UTC(agora.getFullYear(), agora.getMonth(), agora.getDate())).toISOString().slice(0, 10);
}

function probationDecisionFor(employee, periodo) {
  return (employee.probationDecisions || []).find((decisao) => decisao.periodo === periodo) || null;
}

function probationFinalDecision(employee) {
  return (employee.probationDecisions || []).find((decisao) => FINAL_PROBATION_RESULTS.includes(decisao.resultado)) || null;
}

function deadlineLabel(dias) {
  if (dias < 0) return `Venceu há ${Math.abs(dias)} dia(s)`;
  if (dias === 0) return "Vence hoje";
  return `Vence em ${dias} dia(s)`;
}

// Situacao do contrato de experiencia de um colaborador, ou null se ele nao
// tem periodo calculavel. "pendente" e o primeiro periodo ainda sem decisao.
function probationStatus(employee) {
  const { venc1, venc2 } = probationSchedule(employee);
  const periodos = [
    { periodo: "1", rotulo: "1º período", data: venc1 },
    { periodo: "2", rotulo: "2º período", data: venc2 }
  ].filter((item) => item.data);
  if (!periodos.length) return null;

  const final = probationFinalDecision(employee);
  if (final) return { employee, periodos, final, pendente: null, situacao: "concluida" };

  const pendente = periodos.find((item) => !probationDecisionFor(employee, item.periodo));
  if (!pendente) {
    // Tudo decidido mas sem efetivar/encerrar: foi prorrogado e o 2o periodo
    // ainda nao foi preenchido no cadastro.
    return { employee, periodos, final: null, pendente: null, situacao: "incompleta" };
  }
  const dias = daysUntil(pendente.data);
  const situacao = dias < 0 ? "vencida" : dias <= PROBATION_SOON_DAYS ? "vencendo" : "andamento";
  return { employee, periodos, final: null, pendente: { ...pendente, dias }, situacao };
}

const PROBATION_ORDER = { vencida: 0, vencendo: 1, incompleta: 2, andamento: 3, concluida: 4 };

function renderProbationControl(query) {
  const filtro = $("#followup-probation-filter").value;
  const todos = employees.filter((employee) => employee.status !== "Desligado").map(probationStatus).filter(Boolean);
  $("#followup-probation-count").textContent = todos.filter((item) => item.situacao !== "concluida").length;
  $("#followup-overdue-count").textContent = todos.filter((item) => item.situacao === "vencida").length;

  const visiveis = todos
    .filter((item) => !query || String(item.employee.name || "").toLowerCase().includes(query))
    .filter((item) => !filtro || item.situacao === filtro || (filtro === "andamento" && item.situacao === "incompleta"))
    .sort((a, b) => PROBATION_ORDER[a.situacao] - PROBATION_ORDER[b.situacao]
      || String(a.pendente?.data || "").localeCompare(String(b.pendente?.data || "")));
  $("#followup-probation-total").textContent = `${visiveis.length} de ${todos.length} contrato(s)`;

  if (!todos.length) {
    $("#probation-control-list").innerHTML = emptyState("Nenhum colaborador com contrato de experiência. Preencha o início e a duração dos períodos no cadastro do colaborador.", "relogio");
    return;
  }
  if (!visiveis.length) {
    $("#probation-control-list").innerHTML = emptyState("Nenhum contrato de experiência com esses filtros.", null);
    return;
  }

  $("#probation-control-list").innerHTML = visiveis.map(({ employee, periodos, final, pendente, situacao }) => {
    const linhasPeriodo = periodos.map((item) => {
      const decisao = probationDecisionFor(employee, item.periodo);
      const ehPendente = !final && pendente && pendente.periodo === item.periodo;
      const detalhe = decisao
        ? `${escapeHtml(decisao.resultado)} em ${formatDate(decisao.data)}`
        : final ? "Sem decisão" : ehPendente ? "Aguardando decisão" : deadlineLabel(daysUntil(item.data));
      const classe = decisao || final ? "decidido" : pendente && pendente.periodo === item.periodo ? "pendente" : "";
      return `<span class="probation-period ${classe}">${item.rotulo} até ${formatDate(item.data)} · ${detalhe}</span>`;
    }).join("");

    let lado;
    if (situacao === "concluida") {
      const tom = final.resultado === "Efetivado" ? "approved" : "rejected";
      lado = `<span class="badge ${tom}">${escapeHtml(final.resultado)}</span>`;
    } else if (situacao === "incompleta") {
      lado = `<b class="probation-deadline">Preencha o 2º período no cadastro</b><button type="button" class="button secondary small" data-probation-decide="${employee.id}">Registrar decisão</button>`;
    } else {
      lado = `<b class="probation-deadline">${deadlineLabel(pendente.dias)}</b><button type="button" class="button secondary small" data-probation-decide="${employee.id}">Registrar decisão</button>`;
    }

    return `<div class="record-row probation-row ${situacao}">
      <div class="probation-row-main"><button type="button" class="link-button" data-open-followup-employee="${employee.id}"><strong>${escapeHtml(employee.name || "Sem nome")}</strong></button><span>${escapeHtml(employee.role || "Cargo não informado")}</span></div>
      <div class="probation-periods">${linhasPeriodo}</div>
      <div class="probation-row-side">${lado}</div>
    </div>`;
  }).join("");
}

function feedbackTone(type) {
  const valor = String(type || "").toLowerCase();
  if (valor.includes("positivo")) return "approved";
  if (valor.includes("advert")) return "rejected";
  if (valor.includes("avalia") || valor.includes("construtivo")) return "hired";
  return "waiting";
}

function feedbackRecords() {
  return employees.flatMap((employee) => (employee.feedbacks || []).map((record, index) => ({
    ...record, index, employeeId: employee.id, employeeName: employee.name || "Sem nome"
  })));
}

function refreshFeedbackTypeFilter() {
  const select = $("#followup-feedback-filter");
  const atual = select.value;
  const tipos = [...new Set([...FEEDBACK_TYPES, ...feedbackRecords().map((record) => record.type).filter(Boolean)])];
  select.innerHTML = `<option value="">Todos os tipos</option>${tipos.map((tipo) => `<option>${escapeHtml(tipo)}</option>`).join("")}`;
  select.value = tipos.includes(atual) ? atual : "";
}

function renderFeedbackHistory(query) {
  const tipo = $("#followup-feedback-filter").value;
  const todos = feedbackRecords();
  $("#followup-feedback-count").textContent = todos.filter((record) => {
    const dias = daysUntil(record.date);
    return dias <= 0 && dias >= -30;
  }).length;

  const visiveis = todos
    .filter((record) => !tipo || record.type === tipo)
    .filter((record) => !query || [record.employeeName, record.type, record.description, record.author, record.actions]
      .some((valor) => String(valor || "").toLowerCase().includes(query)))
    .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
  $("#followup-feedback-total").textContent = `${visiveis.length} registro(s)`;

  if (!visiveis.length) {
    $("#feedback-history").innerHTML = emptyState(todos.length
      ? "Nenhum feedback com esses filtros."
      : "Nenhum feedback registrado ainda. Use Registrar feedback para começar o histórico.", null);
    return;
  }
  $("#feedback-history").innerHTML = visiveis.map((record) => `<article class="feedback-entry tone-${feedbackTone(record.type)}">
      <div class="feedback-entry-head">
        <span class="badge ${feedbackTone(record.type)}">${escapeHtml(record.type || "Registro")}</span>
        <button type="button" class="link-button" data-open-followup-employee="${record.employeeId}"><strong>${escapeHtml(record.employeeName)}</strong></button>
        <span class="muted">${formatDate(record.date)}${record.author ? ` · por ${escapeHtml(record.author)}` : ""}</span>
        <button type="button" class="remove-record" data-remove-feedback="${record.employeeId}:${record.index}">Remover</button>
      </div>
      ${record.description ? `<p>${escapeHtml(record.description)}</p>` : ""}
      ${record.actions ? `<p class="feedback-entry-actions"><b>Combinados:</b> ${escapeHtml(record.actions)}</p>` : ""}
    </article>`).join("");
}

function renderFollowup() {
  const query = $("#followup-search").value.toLowerCase().trim();
  refreshFeedbackTypeFilter();
  renderProbationControl(query);
  renderFeedbackHistory(query);
}

// Mantem o dossie aberto em sincronia quando o registro muda por esta aba.
function refreshOpenDossier(employee) {
  if (Number($("#employee-id").value) === employee.id) renderEmployeeRecords(employee);
}

function openFeedbackEntry(employeeId) {
  $("#feedback-entry-form").reset();
  $("#feedback-entry-employee").innerHTML = employees
    .filter((employee) => employee.status !== "Desligado")
    .map((employee) => `<option value="${employee.id}">${escapeHtml(employee.name || "Sem nome")}</option>`).join("");
  if (employeeId) $("#feedback-entry-employee").value = String(employeeId);
  $("#feedback-entry-date").value = todayIsoLocal();
  $("#feedback-entry-dialog").showModal();
}

function openProbationDecision(employee) {
  const status = probationStatus(employee);
  if (!status) return;
  const alvo = status.pendente || status.periodos[status.periodos.length - 1];
  const dialog = $("#probation-decision-dialog");
  dialog.dataset.employeeId = employee.id;
  dialog.dataset.periodo = alvo.periodo;
  $("#probation-decision-form").reset();
  $("#probation-decision-title").textContent = `Decisão do ${alvo.rotulo}`;
  $("#probation-decision-context").textContent = `${employee.name || "Sem nome"} · ${alvo.rotulo} até ${formatDate(alvo.data)} · ${deadlineLabel(daysUntil(alvo.data))}`;
  // Prorrogar so existe a partir do 1o periodo; no 2o a experiencia termina.
  const opcoes = alvo.periodo === "1" ? ["Prorrogado", "Efetivado", "Encerrado"] : ["Efetivado", "Encerrado"];
  $("#probation-decision-result").innerHTML = `<option value="">Selecione</option>${opcoes.map((opcao) => `<option>${opcao}</option>`).join("")}`;
  $("#probation-decision-date").value = todayIsoLocal();
  $("#probation-decision-hint").textContent = "";
  dialog.showModal();
}

$("#add-feedback-entry").addEventListener("click", () => openFeedbackEntry());
["#close-feedback-entry", "#cancel-feedback-entry"].forEach((selector) => $(selector).addEventListener("click", () => $("#feedback-entry-dialog").close()));
["#close-probation-decision", "#cancel-probation-decision"].forEach((selector) => $(selector).addEventListener("click", () => $("#probation-decision-dialog").close()));
["#followup-search", "#followup-probation-filter", "#followup-feedback-filter"].forEach((selector) => $(selector).addEventListener("input", renderFollowup));

$("#feedback-entry-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const employee = employees.find((item) => item.id === Number($("#feedback-entry-employee").value));
  if (!employee) return;
  const backup = cloneData(employees);
  if (!Array.isArray(employee.feedbacks)) employee.feedbacks = [];
  employee.feedbacks.push({
    id: generateId(employee.feedbacks),
    type: $("#feedback-entry-type").value,
    date: $("#feedback-entry-date").value,
    author: $("#feedback-entry-author").value.trim(),
    description: $("#feedback-entry-description").value.trim(),
    actions: $("#feedback-entry-actions").value.trim()
  });
  if (!saveEmployees(backup)) return;
  refreshOpenDossier(employee);
  renderFollowup();
  $("#feedback-entry-dialog").close();
});

$("#probation-decision-result").addEventListener("change", () => {
  const employee = employees.find((item) => item.id === Number($("#probation-decision-dialog").dataset.employeeId));
  const semSegundo = employee && !probationSchedule(employee).venc2;
  $("#probation-decision-hint").textContent = $("#probation-decision-result").value === "Prorrogado" && semSegundo
    ? "Depois de salvar, preencha a duração do 2º período no cadastro do colaborador para acompanhar o novo vencimento."
    : "";
});

$("#probation-decision-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const dialog = $("#probation-decision-dialog");
  const employee = employees.find((item) => item.id === Number(dialog.dataset.employeeId));
  if (!employee) return;
  const periodo = dialog.dataset.periodo;
  const backup = cloneData(employees);
  // Uma decisao por periodo: registrar de novo substitui a anterior.
  employee.probationDecisions = (employee.probationDecisions || []).filter((decisao) => decisao.periodo !== periodo);
  employee.probationDecisions.push({
    id: generateId(employee.probationDecisions),
    periodo,
    resultado: $("#probation-decision-result").value,
    data: $("#probation-decision-date").value,
    responsavel: $("#probation-decision-author").value.trim(),
    observacoes: $("#probation-decision-notes").value.trim()
  });
  if (!saveEmployees(backup)) return;
  renderFollowup();
  renderProbationReminders();
  dialog.close();
});

$("#acompanhamento").addEventListener("click", (event) => {
  const abrir = event.target.closest("[data-open-followup-employee]");
  if (abrir) {
    const employee = employees.find((item) => item.id === Number(abrir.dataset.openFollowupEmployee));
    if (!employee) return;
    fillEmployeeForm(employee);
    activateTab("dossie");
    setTabHash("dossie");
    return;
  }
  const decidir = event.target.closest("[data-probation-decide]");
  if (decidir) {
    const employee = employees.find((item) => item.id === Number(decidir.dataset.probationDecide));
    if (employee) openProbationDecision(employee);
    return;
  }
  const remover = event.target.closest("[data-remove-feedback]");
  if (remover) {
    const [employeeId, index] = remover.dataset.removeFeedback.split(":").map(Number);
    const employee = employees.find((item) => item.id === employeeId);
    if (!employee || !employee.feedbacks?.[index]) return;
    if (!confirm("Remover este feedback do histórico? Ele também sai do cadastro do colaborador.")) return;
    const backup = cloneData(employees);
    employee.feedbacks.splice(index, 1);
    if (!saveEmployees(backup)) return;
    refreshOpenDossier(employee);
    renderFollowup();
  }
});

function render() {
  renderDashboard();
  renderTable();
}

// Grava os colaboradores; se falhar, devolve o estado de antes e redesenha,
// para nao ficar na tela um registro que some ao recarregar.
function saveEmployees(backup) {
  if (writeStorage("employees", employees)) return true;
  employees = backup;
  refreshEmployeeViews();
  return false;
}

// Redesenha tudo que depende de employees sem mexer no que esta digitado no dossie.
function refreshEmployeeViews() {
  refreshEmployeePicker();
  refreshDocumentsEmployeePicker();
  setupEmployeeFilters();
  setupEmployeeListFilters();
  renderEmployeeList();
  refreshVacationEmployees();
  renderVacations();
  renderFollowup();
  render();
  const openEmployee = currentEmployee();
  renderEmployeeRecords(openEmployee || { documents: [], movements: [], trainings: [], feedbacks: [], medical: [] });
}

function openCandidate(candidate) {
  $("#candidate-form").reset();
  $("#candidate-id").value = candidate ? candidate.id : "";
  $("#dialog-title").textContent = candidate ? "Editar candidato" : "Novo candidato";
  if (candidate) {
    Object.entries({ name: candidate.name, phone: candidate.phone, job: candidate.job, source: candidate.source, owner: candidate.owner, status: candidate.status, experience: candidate.experience, salary: candidate.salary, notes: candidate.notes }).forEach(([key, value]) => { $(`#${key}`).value = value || ""; });
  } else {
    $("#status").value = "Aguardando";
    $("#source").value = "Não Informado";
  }
  $("#candidate-dialog").showModal();
}

if ($("#new-candidate")) $("#new-candidate").addEventListener("click", () => openCandidate());
if ($("#open-form")) $("#open-form").addEventListener("click", () => openCandidate());
$("#close-form").addEventListener("click", () => $("#candidate-dialog").close());
$("#cancel-form").addEventListener("click", () => $("#candidate-dialog").close());
$("#candidate-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const id = Number($("#candidate-id").value);
  const candidate = { id: id || generateId(candidates), name: $("#name").value.trim(), phone: $("#phone").value.trim(), job: $("#job").value.trim(), source: $("#source").value, owner: $("#owner").value.trim() || "A definir", status: $("#status").value, experience: $("#experience").value, salary: $("#salary").value.trim() || "-", lastContact: new Date().toLocaleDateString("pt-BR"), notes: $("#notes").value.trim() };
  const previousCandidates = candidates;
  candidates = id ? candidates.map((item) => item.id === id ? candidate : item) : [candidate, ...candidates];
  if (!writeStorage("candidates", candidates)) {
    // Dialogo continua aberto para o usuario nao perder o que digitou.
    candidates = previousCandidates;
    render();
    return;
  }
  setupFilters();
  render();
  $("#candidate-dialog").close();
});
["#search", "#status-filter", "#job-filter", "#source-filter"].forEach((selector) => $(selector).addEventListener("input", renderTable));
["#dashboard-search", "#dashboard-status-filter", "#dashboard-job-filter", "#dashboard-source-filter"].forEach((selector) => $(selector).addEventListener("input", renderDashboard));
$("#candidate-table").addEventListener("click", (event) => {
  const id = Number(event.target.dataset.edit);
  if (id) openCandidate(candidates.find((candidate) => candidate.id === id));
});
$("#show-curriculum-dashboard").addEventListener("click", () => {
  activateTab("dashboard");
  setTabHash("dashboard");
});
// Delegado: os botoes de "Pendencias da operacao" sao recriados a cada
// renderDashboard, entao um listener ligado uma unica vez nunca os alcancava.
document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-home-tab]");
  if (!button) return;
  const tab = button.dataset.homeTab;
  // "Novo colaborador" abria o formulario de quem estivesse carregado e salvar sobrescrevia essa pessoa.
  if (tab === "dossie" && button.classList.contains("quick-action")) resetEmployeeForm();
  activateTab(tab === "documentos" ? "dossie" : tab);
  setTabHash(tab === "documentos" ? "dossie" : tab);
  if (tab === "documentos") $("#documentos").scrollIntoView({ behavior: "smooth", block: "start" });
});
["#new-job", "#new-interview"].forEach((selector) => {
  const button = $(selector);
  if (!button) return;
  const feature = selector === "#new-job" ? "O cadastro de vagas" : "O agendamento de entrevistas";
  button.addEventListener("click", () => alert(`${feature} ainda não está disponível nesta versão do sistema.`));
});

// Planilhas executam celulas que comecam com = + - @ como formula.
function csvCell(value) {
  let text = String(value ?? "");
  if (/^[=+\-@\t\r]/.test(text) && text !== "-") text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

$("#export-report").addEventListener("click", () => {
  const filtered = getFilteredCandidates();
  if (!filtered.length) {
    alert("Nenhum candidato encontrado com os filtros atuais de Gestão de currículos. Ajuste os filtros e tente novamente.");
    return;
  }
  const headers = ["Nome", "Telefone", "Vaga", "Origem", "Responsável", "Status", "Último contato"];
  const rows = filtered.map((candidate) => [candidate.name, candidate.phone, candidate.job, candidate.source, candidate.owner, candidate.status, candidate.lastContact]);
  const csv = [headers, ...rows].map((row) => row.map(csvCell).join(";")).join("\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" }));
  link.download = "relatorio-candidatos.csv";
  link.click();
  // Revogar na mesma hora cancela o download em alguns navegadores.
  window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
});
$("#clear-data").addEventListener("click", () => {
  const confirmed = confirm("Restaurar os dados de demonstração?\n\nIsso APAGA todos os candidatos e colaboradores salvos neste navegador, incluindo documentos, férias, feedbacks, decisões de experiência, movimentações, treinamentos e atestados, e coloca os dados de exemplo no lugar.\n\nAs listas de departamentos, cargos e superiores são mantidas. Esta ação não pode ser desfeita.");
  if (!confirmed) return;
  const previousCandidates = candidates;
  const previousEmployees = employees;
  candidates = cloneData(initialCandidates);
  employees = cloneData(initialEmployees);
  if (!writeStorage("candidates", candidates) || !writeStorage("employees", employees)) {
    candidates = previousCandidates;
    employees = previousEmployees;
    // Se so a primeira gravacao passou, devolve o que estava salvo.
    writeStorage("candidates", candidates, { silent: true });
    writeStorage("employees", employees, { silent: true });
    setupFilters();
    refreshEmployeeViews();
    return;
  }
  setupFilters();
  fillEmployeeForm(employees[0]);
  refreshEmployeeViews();
  activateTab("dashboard");
  setTabHash("dashboard");
});

function currentEmployee() {
  // Sem fallback para employees[0]: formulario de colaborador novo (sem id)
  // nao pode gravar registros no cadastro de outra pessoa.
  return employees.find((employee) => employee.id === Number($("#employee-id").value)) || null;
}

function escapeHtml(value) {
  // So null/undefined viram texto vazio; 0 e false precisam aparecer.
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[character]));
}

function formatFileSize(bytes) {
  if (!bytes) return "Tamanho não informado";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function documentDate(date) {
  return new Date(date).toLocaleDateString("pt-BR");
}

// Colaborador escolhido na biblioteca de documentos. Sem fallback para o
// primeiro da lista: com a busca sem resultado, o upload ia parar no cadastro errado.
function documentsEmployee() {
  return employees.find((item) => item.id === Number($("#documents-employee-picker").value)) || null;
}

function renderDocuments() {
  const employee = documentsEmployee();
  if (!employee) {
    ["#document-count", "#document-category-count", "#document-version-count"].forEach((selector) => { $(selector).textContent = 0; });
    $("#document-list").innerHTML = emptyState("Nenhum colaborador selecionado.", "lupa");
    return;
  }
  const documents = employee.documentLibrary || [];
  const query = $("#document-search").value.toLowerCase().trim();
  const category = $("#document-category-filter").value;
  const filtered = documents.filter((document) => {
    const matchesQuery = !query || [document.title, document.category, document.notes].some((value) => String(value || "").toLowerCase().includes(query));
    return matchesQuery && (!category || document.category === category);
  });
  const versions = documents.reduce((total, document) => total + (document.versions || []).length, 0);
  $("#document-count").textContent = documents.length;
  $("#document-category-count").textContent = new Set(documents.map((document) => document.category)).size;
  $("#document-version-count").textContent = versions;
  $("#document-list").innerHTML = filtered.length ? filtered.map((document) => {
    const latest = document.versions[document.versions.length - 1];
    return `<div class="document-card">
      <div class="document-card-main">
        <div class="document-card-title">${escapeHtml(document.title)}</div>
        <div class="document-card-meta">${escapeHtml(document.category)} · ${escapeHtml(document.versions.length)} versão(ões) · Atualizado em ${documentDate(latest.createdAt)} · ${formatFileSize(latest.size)}</div>
        ${document.notes ? `<div class="document-card-notes">${escapeHtml(document.notes)}</div>` : ""}
      </div>
      <div class="document-card-actions">
        <button type="button" class="document-action" data-document-action="download" data-document-id="${escapeHtml(document.id)}">Baixar</button>
        <button type="button" class="document-action" data-document-action="version" data-document-id="${escapeHtml(document.id)}">Nova versão</button>
        <button type="button" class="document-action" data-document-action="history" data-document-id="${escapeHtml(document.id)}">Histórico</button>
        <button type="button" class="document-action danger" data-document-action="remove" data-document-id="${escapeHtml(document.id)}">Remover</button>
      </div>
    </div>`;
  }).join("") : emptyState("Nenhum documento encontrado para este colaborador.", "lupa");
}

function refreshDocumentFilters() {
  const employee = documentsEmployee();
  const categories = [...new Set((employee?.documentLibrary || []).map((document) => document.category))].sort();
  const selected = $("#document-category-filter").value;
  $("#document-category-filter").innerHTML = `<option value="">Todas as categorias</option>${categories.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join("")}`;
  $("#document-category-filter").value = categories.includes(selected) ? selected : "";
  renderDocuments();
}

function openDocumentDialog(document) {
  $("#document-form").reset();
  $("#document-dialog").dataset.documentId = document ? document.id : "";
  $("#document-dialog-title").textContent = document ? "Adicionar nova versão" : "Fazer upload";
  if (document) {
    $("#document-title").value = document.title;
    $("#document-category").value = document.category;
    $("#document-notes").value = document.notes || "";
  }
  $("#document-dialog").showModal();
}

function saveDocumentFile(file, document) {
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    const employee = documentsEmployee();
    if (!employee) return;
    const backup = cloneData(employees);
    if (!employee.documentLibrary) employee.documentLibrary = [];
    const version = { id: generateId(document ? document.versions : []), name: file.name, size: file.size, type: file.type || "application/octet-stream", data: reader.result, createdAt: new Date().toISOString() };
    if (document) {
      document.versions.push(version);
      document.notes = $("#document-notes").value.trim();
    } else {
      employee.documentLibrary.unshift({ id: generateId(employee.documentLibrary), title: $("#document-title").value.trim(), category: $("#document-category").value, notes: $("#document-notes").value.trim(), versions: [version] });
    }
    // Dialogo fica aberto se falhar, para escolher outro arquivo.
    if (!saveEmployees(backup)) return;
    refreshDocumentFilters();
    $("#document-dialog").close();
  });
  reader.addEventListener("error", () => {
    console.error("Falha ao ler o arquivo:", reader.error);
    alert("Não foi possível ler o arquivo selecionado. Tente novamente ou escolha outro arquivo.");
  });
  reader.readAsDataURL(file);
}

function fillEmployeeForm(employee) {
  if (!employee) return;
  $("#dossie").classList.add("dossier-editing");
  $("#employee-id").value = employee.id;
  const fields = ["name", "cpf", "birth", "gender", "salutation", "ethnicity", "marital", "education", "course", "nationality", "birthplace", "role", "department", "manager", "admission", "contract", "salary", "benefits", "probation", "hierarchy", "contractDate", "contractDuration", "contractExpiration", "contractDate2", "contractDuration2", "contractExpiration2", "addressCountry", "addressCep", "addressStreet", "addressNumber", "addressNeighborhood", "addressCity", "addressState", "addressComplement"];
  fields.forEach((field) => { $(`#employee-${field}`).value = employee[field] || ""; });
  resetContractExpirationState();
  $("#employee-cellphone").value = employee.cellphone || "";
  $("#employee-telephone").value = employee.telephone || employee.phone || "";
  $("#employee-emergencyPhone").value = employee.emergencyPhone || "";
  setPhoneCountry("employee-cellphoneCountry", employee.cellphoneCountry || "BR");
  setPhoneCountry("employee-telephoneCountry", employee.telephoneCountry || "BR");
  setPhoneCountry("employee-emergencyPhoneCountry", employee.emergencyPhoneCountry || "BR");
  $("#employee-personalEmail").value = employee.personalEmail || employee.email || "";
  $("#employee-businessEmail").value = employee.businessEmail || "";
  $("#employee-disability-type").value = employee.disabilityType || "";
  $("#employee-father-name").value = employee.fatherName || "";
  $("#employee-mother-name").value = employee.motherName || "";
  $("#employee-disability").checked = Boolean(employee.disability);
  renderEmployeeRecords(employee);
}

function resetEmployeeForm() {
  $("#dossie").classList.add("dossier-editing");
  $("#employee-form").reset();
  $("#employee-id").value = "";
  ["employee-cellphoneCountry", "employee-telephoneCountry", "employee-emergencyPhoneCountry"].forEach((id) => setPhoneCountry(id, "BR"));
  $("#employee-contract").value = "CLT";
  resetContractExpirationState();
  renderEmployeeRecords({ documents: [], movements: [], trainings: [], feedbacks: [], medical: [] });
}

// Estado vazio dos documentos: o convite para anexar fica no lugar do Zuzu.
function documentDropzone() {
  return `<div class="document-dropzone">
    ${zuzuMarkup("lendo")}
    <p>Nenhum documento anexado.</p>
    <button type="button" class="button secondary small" data-anexar-documento>Anexar documento</button>
    <span class="document-dropzone-hint">JPEG, JPG, PNG ou PDF \u00b7 at\u00e9 2 MB por arquivo</span>
  </div>`;
}

function renderEmployeeRecords(employee) {
  // empty aceita texto (estado vazio padrao) ou HTML pronto.
  const list = (field, empty, renderer) => {
    const records = employee[field] || [];
    const vazio = typeof empty === "function" ? empty() : emptyState(empty);
    $(`#${field === "medical" ? "medical" : field}-list`).innerHTML = records.length ? records.map((record, index) => renderer(record, index)).join("") : vazio;
  };
  const documentos = employee.documents || [];
  $("#documents-list").innerHTML = documentos.length
    ? documentos.map((record, index) => {
      const arquivo = record.file;
      const detalhes = [record.type, record.date ? formatDate(record.date) : null, arquivo ? formatFileSize(arquivo.size) : null].filter(Boolean).join(" \u00b7 ");
      const abrir = arquivo
        ? `<a class="record-file-link" href="${escapeHtml(arquivo.data)}" download="${escapeHtml(arquivo.name)}" target="_blank" rel="noopener">Abrir</a>`
        : "";
      return `<div class="record-row"><div><strong>${escapeHtml(record.name || "Documento")}</strong><span>${escapeHtml(detalhes)}</span></div><div class="record-row-actions">${abrir}<button type="button" class="remove-record" data-record="documents" data-index="${index}">Remover</button></div></div>`;
    }).join("") + `<div class="document-attach-more"><button type="button" class="button secondary small" data-anexar-documento>+ Anexar documento</button></div>`
    : documentDropzone();
  list("movements", "Nenhuma movimenta\u00e7\u00e3o cadastrada.", (record, index) => {
    const salario = record.oldSalary || record.newSalary
      ? `${escapeHtml(record.oldSalary || "?")} \u2192 ${escapeHtml(record.newSalary || "?")}`
      : "";
    const funcao = record.roleChange === "Sim"
      ? (record.newRole ? `Nova fun\u00e7\u00e3o: ${record.newRole}` : "Fun\u00e7\u00e3o alterada")
      : "";
    const detalhes = [record.description, salario, funcao, record.role].filter(Boolean).map(escapeHtml).join(" \u00b7 ");
    return `<div class="record-row"><div><strong>${escapeHtml(record.date || "Sem data")} \u00b7 ${escapeHtml(record.type)}</strong><span>${detalhes}</span></div><button type="button" class="remove-record" data-record="movements" data-index="${index}">Remover</button></div>`;
  });
  list("trainings", "Nenhum treinamento cadastrado.", (record, index) => `<div class="record-row"><div><strong>${escapeHtml(record.name)}</strong><span>${escapeHtml(record.date || "Sem data")} · ${escapeHtml(record.hours || "Carga não informada")}</span></div><button type="button" class="remove-record" data-record="trainings" data-index="${index}">Remover</button></div>`);
  list("feedbacks", "Nenhum registro cadastrado.", (record, index) => `<div class="record-row"><div><strong>${escapeHtml(record.type)} · ${formatDate(record.date)}${record.author ? ` · por ${escapeHtml(record.author)}` : ""}</strong><span>${escapeHtml(record.description || "")}${record.actions ? ` · Combinados: ${escapeHtml(record.actions)}` : ""}</span></div><button type="button" class="remove-record" data-record="feedbacks" data-index="${index}">Remover</button></div>`);
  list("medical", "Nenhum atestado cadastrado.", (record, index) => `<div class="record-row"><div><strong>${escapeHtml(record.date || "Sem data")} · ${escapeHtml(record.days || 0)} dia(s)${record.partial ? " · Parcial" : ""}</strong><span>CID: ${escapeHtml(record.cid || "Não informado")} · Médico: ${escapeHtml(record.doctor || "Não informado")}</span></div><button type="button" class="remove-record" data-record="medical" data-index="${index}">Remover</button></div>`);
}

function refreshEmployeePicker() {
  const query = $("#employee-search").value.toLowerCase().trim();
  const status = $("#employee-status-filter").value;
  const department = $("#employee-department-filter").value;
  const filtered = employees.filter((employee) => {
    const values = [employee.name, employee.cpf, employee.email, employee.role, employee.department, employee.level, employee.unit, employee.hierarchy];
    return (!query || values.some((value) => String(value || "").toLowerCase().includes(query)))
      && (!status || employee.status === status)
      && (!department || employee.department === department);
  });
  $("#employee-picker").innerHTML = filtered.map((employee) => `<option value="${escapeHtml(employee.id)}">${escapeHtml(employee.name)}</option>`).join("");
  if (!filtered.length) {
    $("#employee-picker").innerHTML = `<option value="">Nenhum colaborador encontrado</option>`;
  }
  $("#employee-picker").value = $("#employee-id").value || "";
}

// Recria as opcoes de um filtro mantendo o que o usuario tinha escolhido.
function fillFilterOptions(select, firstOption, values) {
  const selected = select.value;
  select.innerHTML = `<option value="">${firstOption}</option>${values.map((value) => `<option>${escapeHtml(value)}</option>`).join("")}`;
  if (selected && values.map(String).includes(selected)) select.value = selected;
}

function setupEmployeeFilters() {
  const departments = [...new Set(employees.map((employee) => employee.department).filter(Boolean))].sort();
  fillFilterOptions($("#employee-status-filter"), "Todos os status", ["Ativo", "Férias", "Afastado", "Desligado"]);
  fillFilterOptions($("#employee-department-filter"), "Todos os departamentos", departments);
}

// options.keepForm: grava sem limpar o formulario (usado ao incluir/remover
// registros do dossie). options.backup: estado anterior a uma alteracao ja feita
// em memoria por quem chamou, para desfazer se a gravacao falhar.
function saveEmployee(onSaved, options = {}) {
  const backup = options.backup || cloneData(employees);
  let id = Number($("#employee-id").value);
  if (!Number.isFinite(id) || id <= 0) {
    // Colaborador novo: campo vazio virava id 0 e o segundo novo sobrescrevia o primeiro.
    id = generateId(employees);
    $("#employee-id").value = id;
  }
  const employee = employees.find((item) => item.id === id) || { id, documents: [], documentLibrary: [], vacationPeriods: [], movements: [], trainings: [], feedbacks: [], medical: [] };
  ["name", "cpf", "birth", "gender", "salutation", "ethnicity", "marital", "education", "course", "nationality", "birthplace", "role", "department", "manager", "admission", "contract", "salary", "benefits", "probation", "hierarchy", "contractDate", "contractDuration", "contractExpiration", "contractDate2", "contractDuration2", "contractExpiration2", "addressCountry", "addressCep", "addressStreet", "addressNumber", "addressNeighborhood", "addressCity", "addressState", "addressComplement"].forEach((field) => { employee[field] = $(`#employee-${field}`).value.trim(); });
  employee.cellphone = $("#employee-cellphone").value.trim();
  employee.telephone = $("#employee-telephone").value.trim();
  employee.emergencyPhone = $("#employee-emergencyPhone").value.trim();
  employee.cellphoneCountry = selectedPhoneCountry("employee-cellphoneCountry");
  employee.telephoneCountry = selectedPhoneCountry("employee-telephoneCountry");
  employee.emergencyPhoneCountry = selectedPhoneCountry("employee-emergencyPhoneCountry");
  employee.personalEmail = $("#employee-personalEmail").value.trim();
  employee.businessEmail = $("#employee-businessEmail").value.trim();
  employee.phone = employee.telephone;
  employee.email = employee.personalEmail;
  employee.disabilityType = $("#employee-disability-type").value.trim();
  employee.fatherName = $("#employee-father-name").value.trim();
  employee.motherName = $("#employee-mother-name").value.trim();
  employee.disability = $("#employee-disability").checked;
  employee.status = employee.status || "Ativo";
  return persistEmployee(employee, id, onSaved, { ...options, backup });
}

function persistEmployee(employee, id, onSaved, options = {}) {
  delete employee.unit;
  delete employee.photo;
  employees = employees.some((item) => item.id === id) ? employees.map((item) => item.id === id ? employee : item) : [...employees, employee];
  if (!saveEmployees(options.backup)) return false;
  refreshEmployeePicker();
  refreshDocumentsEmployeePicker();
  setupEmployeeFilters();
  setupEmployeeListFilters();
  renderEmployeeList();
  render(); // o lembrete de experiencias vive na home e precisa acompanhar
  renderVacations();
  renderFollowup();
  // Incluir/remover registro nao pode limpar o formulario: sem o id, a proxima
  // acao do dossie ia parar em outro colaborador (ou criava um cadastro vazio).
  if (options.keepForm) {
    renderEmployeeRecords(employee);
  } else {
    resetEmployeeForm();
    $("#employee-picker").value = "";
  }
  if (onSaved) onSaved();
  return true;
}

$("#new-employee").addEventListener("click", () => {
  resetEmployeeForm();
  activateTab("dossie");
  setTabHash("dossie");
  $("#employee-name").focus();
});

function renderEmployeeList() {
  const query = $("#employee-list-search").value.toLowerCase().trim();
  const status = $("#employee-list-status-filter").value;
  const department = $("#employee-list-department-filter").value;
  const filtered = employees.filter((employee) => {
    const values = [employee.name, employee.cpf, employee.role, employee.department, employee.level, employee.unit, employee.hierarchy, employee.email];
    return (!query || values.some((value) => String(value || "").toLowerCase().includes(query)))
      && (!status || employee.status === status)
      && (!department || employee.department === department);
  });
  $("#employee-list-count").textContent = `${filtered.length} de ${employees.length} colaboradores`;
  $("#employee-list").innerHTML = filtered.length ? filtered.map((employee) => {
    const name = employee.name || "Sem nome";
    return `<div class="employee-list-row" role="button" tabindex="0" data-open-employee="${employee.id}" aria-label="Abrir edição de ${escapeHtml(name)}">
      <div class="employee-list-person"><div><strong>${escapeHtml(name)}</strong><span>${escapeHtml(employee.email || "E-mail não informado")}</span></div></div>
      <div class="employee-list-cell" data-label="Cargo"><strong>${escapeHtml(employee.role || "Não informado")}</strong></div>
      <div class="employee-list-cell" data-label="Departamento"><strong>${escapeHtml(employee.department || "Não informado")}</strong></div>
      <div class="employee-list-cell" data-label="Data de admissão"><strong>${formatDate(employee.admission)}</strong></div>
      <div class="employee-list-cell" data-label="Nível"><strong>${escapeHtml(employee.level || employee.unit || employee.hierarchy || "Não informado")}</strong></div>
      <div class="employee-list-cell" data-label="Status"><span class="employee-list-status">${escapeHtml(employee.status || "Ativo")}</span></div>
    </div>`;
  }).join("") : emptyState("Nenhum colaborador encontrado.", "lupa");
}

function setupEmployeeListFilters() {
  const departments = [...new Set(employees.map((employee) => employee.department).filter(Boolean))].sort();
  fillFilterOptions($("#employee-list-status-filter"), "Todos os status", ["Ativo", "Férias", "Afastado", "Desligado"]);
  fillFilterOptions($("#employee-list-department-filter"), "Todos os departamentos", departments);
}

$("#new-employee-from-list").addEventListener("click", () => {
  resetEmployeeForm();
  activateTab("dossie");
  setTabHash("dossie");
  $("#employee-name").focus();
});
["#employee-list-search", "#employee-list-status-filter", "#employee-list-department-filter"].forEach((selector) => $(selector).addEventListener("input", renderEmployeeList));
$("#employee-list").addEventListener("click", (event) => {
  const row = event.target.closest("[data-open-employee]");
  const employeeId = Number(row?.dataset.openEmployee);
  if (!employeeId) return;
  const employee = employees.find((item) => item.id === employeeId);
  if (!employee) return;
  fillEmployeeForm(employee);
  activateTab("dossie");
  setTabHash("dossie");
});
$("#home-probation-list").addEventListener("click", (event) => {
  const item = event.target.closest("[data-probation-employee]");
  const employee = employees.find((candidato) => candidato.id === Number(item?.dataset.probationEmployee));
  if (!employee) return;
  fillEmployeeForm(employee);
  activateTab("dossie");
  setTabHash("dossie");
});
$("#employee-list").addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const row = event.target.closest("[data-open-employee]");
  if (!row) return;
  event.preventDefault();
  row.click();
});

// =============================================================================
// UPLOAD DE DOCUMENTOS PESSOAIS
// O arquivo e guardado como data URL dentro do proprio cadastro, no
// localStorage. Como o localStorage da origem tem cerca de 5 MB no total e a
// data URL fica ~35% maior que o arquivo, limitamos cada envio a 2 MB e
// tratamos o estouro de cota com mensagem em vez de quebrar a tela.
// =============================================================================
const DOCUMENT_ACCEPT = ".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf";
const DOCUMENT_MIMES = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
const DOCUMENT_EXTENSIONS = ["jpg", "jpeg", "png", "pdf"];
const DOCUMENT_MAX_BYTES = 2 * 1024 * 1024;

function documentFileError(file) {
  if (!file) return "Escolha um arquivo JPEG, JPG, PNG ou PDF.";
  const extensao = (file.name.split(".").pop() || "").toLocaleLowerCase("pt-BR");
  // Alguns navegadores nao informam o MIME; a extensao serve de segunda checagem.
  const tipoOk = DOCUMENT_MIMES.includes(file.type) || (!file.type && DOCUMENT_EXTENSIONS.includes(extensao));
  if (!tipoOk || !DOCUMENT_EXTENSIONS.includes(extensao)) return "Formato n\u00e3o aceito. Envie JPEG, JPG, PNG ou PDF.";
  if (file.size > DOCUMENT_MAX_BYTES) return `Arquivo de ${formatFileSize(file.size)}. O limite por documento \u00e9 ${formatFileSize(DOCUMENT_MAX_BYTES)}.`;
  return "";
}

function lerArquivoComoDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", () => reject(reader.error));
    reader.readAsDataURL(file);
  });
}

// Anexa um ou mais arquivos ao colaborador aberto. Nome e data saem do proprio
// arquivo - nao ha nada a preencher alem de escolher o que enviar.
async function anexarDocumentos(arquivos) {
  const employee = currentEmployee();
  if (!employee) return;
  if (!employee.documents) employee.documents = [];
  const recado = $("#documents-error");
  const recusados = [];
  const aceitos = [];

  for (const file of [...arquivos]) {
    const erro = documentFileError(file);
    if (erro) { recusados.push(`${file.name}: ${erro}`); continue; }
    try {
      aceitos.push({
        name: file.name,
        date: new Date().toISOString().slice(0, 10),
        file: { name: file.name, size: file.size, mime: file.type || "application/octet-stream", data: await lerArquivoComoDataUrl(file) }
      });
    } catch {
      recusados.push(`${file.name}: n\u00e3o consegui ler o arquivo.`);
    }
  }

  if (aceitos.length) {
    // A copia sai ANTES de incluir: se nao couber no navegador, saveEmployees
    // volta exatamente a este estado e redesenha, sem documento fantasma.
    // saveEmployee nao lanca erro na falta de espaco - avisa e retorna false.
    const backup = cloneData(employees);
    employee.documents.push(...aceitos);
    if (!saveEmployee(null, { keepForm: true, backup })) {
      recusados.push("N\u00e3o h\u00e1 espa\u00e7o para guardar. Remova documentos antigos e tente de novo.");
    }
  }
  recado.textContent = recusados.join(" \u00b7 ");
}

// =============================================================================
// CAMPOS EXTRAS DA ALTERACAO SALARIAL
// Salario antigo, salario novo e se houve troca de funcao so fazem sentido
// quando o tipo da movimentacao e alteracao salarial, entao aparecem apenas
// nesse caso - inclusive se o tipo for digitado em vez de escolhido na lista.
// =============================================================================
const SALARY_CHANGE_TYPE = "Altera\u00e7\u00e3o Salarial";

// Campo de combo do dialogo de registro. Usado pelo construtor de campos e
// pelo bloco da alteracao salarial, que monta o seu depois.
function comboFieldMarkup(id, label, listKey) {
  return `<label>${label}<span class="combo" data-combo="${listKey}"><input id="${id}" placeholder="Pesquisar ou digitar" autocomplete="off" role="combobox" aria-expanded="false" aria-autocomplete="list"><button type="button" class="combo-toggle" tabindex="-1" aria-label="Ver op\u00e7\u00f5es">\u25be</button><span class="combo-menu" role="listbox"></span></span></label>`;
}

function isSalaryChange(valor) {
  return String(valor || "").trim().toLocaleLowerCase("pt-BR") === SALARY_CHANGE_TYPE.toLocaleLowerCase("pt-BR");
}

function renderMovementExtras() {
  const extras = $("#record-extra-fields");
  const mostrar = $("#record-dialog").dataset.field === "movements" && isSalaryChange($("#record-type")?.value);
  // Sem essa comparacao, cada tecla digitada recriaria os campos e apagaria
  // o que o usuario ja tivesse preenchido neles.
  if (mostrar === (extras.dataset.visivel === "1")) return;
  extras.dataset.visivel = mostrar ? "1" : "";
  extras.innerHTML = mostrar ? [
    `<label>Sal\u00e1rio antigo<input id="record-old-salary" type="text" inputmode="decimal"></label>`,
    `<label>Sal\u00e1rio novo<input id="record-new-salary" type="text" inputmode="decimal"></label>`,
    `<fieldset class="radio-field full-width"><legend>Houve altera\u00e7\u00e3o de fun\u00e7\u00e3o?</legend><div class="radio-field-options">`,
    `<label class="check-field"><input type="radio" name="record-role-change" value="Sim">Sim</label>`,
    `<label class="check-field"><input type="radio" name="record-role-change" value="N\u00e3o" checked>N\u00e3o</label>`,
    `</div></fieldset>`,
    `<div id="record-role-extra" class="full-width"></div>`
  ].join("") : "";
  if (!mostrar) return;
  extras.querySelectorAll(`input[name="record-role-change"]`).forEach((radio) => radio.addEventListener("change", renderRoleChangeExtra));
  renderRoleChangeExtra();
}

// So faz sentido perguntar qual funcao quando houve troca. As opcoes vem dos
// cargos ja cadastrados, mas o campo aceita digitar um que ainda nao exista.
function renderRoleChangeExtra() {
  const alvo = $("#record-role-extra");
  if (!alvo) return;
  const sim = document.querySelector(`input[name="record-role-change"]:checked`)?.value === "Sim";
  if (sim === (alvo.dataset.visivel === "1")) return;
  alvo.dataset.visivel = sim ? "1" : "";
  alvo.innerHTML = sim ? comboFieldMarkup("record-new-role", "Nova fun\u00e7\u00e3o", "roles") : "";
  alvo.querySelectorAll(".combo").forEach(setupCombo);
}

function addEmployeeRecord(field) {
  const configs = {
    movements: { title: "Nova movimentação", fields: [["record-type", "Tipo", "combo", "movementTypes"], ["record-date", "Data", "date"], ["record-description", "Descrição", "textarea"]] },
    trainings: { title: "Novo treinamento", fields: [["record-name", "Nome do treinamento"], ["record-hours", "Carga horária"], ["record-date", "Data", "date"]] },
    feedbacks: { title: "Novo registro", fields: [["record-type", "Tipo (feedback, advertência, comunicado, avaliação)"], ["record-date", "Data", "date"], ["record-description", "Descrição", "textarea"]] },
    medical: { title: "Novo atestado", fields: [["record-date", "Data do atestado", "date"], ["record-cid", "CID"], ["record-days", "Quantidade de dias", "number"], ["record-doctor", "Nome do médico"], ["record-partial", "Atestado parcial", "checkbox"]] }
  };
  const config = configs[field];
  if (!currentEmployee()) {
    alert("Salve o cadastro do colaborador antes de adicionar registros.");
    return;
  }
  $("#record-title").textContent = config.title;
  $("#record-fields").innerHTML = config.fields.map(([id, label, type = "text", extra = ""]) => {
    if (type === "checkbox") return `<label class="check-field"><input id="${id}" type="checkbox">${label}</label>`;
    // Descricao costuma ser um paragrafo, nao cabe numa linha so.
    if (type === "textarea") return `<label class="full-width">${label}<textarea id="${id}" rows="4"></textarea></label>`;
    if (type === "combo") return comboFieldMarkup(id, label, extra);
    return `<label class="${type === "file" ? "full-width" : ""}">${label}<input id="${id}" type="${type}" ${extra}></label>`;
  }).join("");
  // Combos montados agora precisam ser ligados na mao.
  $("#record-fields").querySelectorAll(".combo").forEach(setupCombo);
  $("#record-dialog").dataset.field = field;
  $("#record-extra-fields").dataset.visivel = "";
  $("#record-extra-fields").innerHTML = "";
  ["input", "change"].forEach((evento) => $("#record-type")?.addEventListener(evento, renderMovementExtras));
  renderMovementExtras();
  $("#record-dialog").showModal();
}

$("#record-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const field = $("#record-dialog").dataset.field;
  const employee = currentEmployee();
  if (!employee) {
    $("#record-dialog").close();
    return;
  }
  const backup = cloneData(employees);
  if (!Array.isArray(employee[field])) employee[field] = [];
  const value = (id) => $(`#${id}`)?.value || "";
  const alteracaoSalarial = field === "movements" && isSalaryChange(value("record-type"));
  const record = field === "movements" ? {
      type: value("record-type"), description: value("record-description"), date: value("record-date"), role: "",
      ...(alteracaoSalarial ? {
        oldSalary: value("record-old-salary"),
        newSalary: value("record-new-salary"),
        roleChange: document.querySelector(`input[name="record-role-change"]:checked`)?.value || "N\u00e3o",
        newRole: value("record-new-role")
      } : {})
    } :
    field === "trainings" ? { name: value("record-name"), hours: value("record-hours"), date: value("record-date") } :
    field === "feedbacks" ? { type: value("record-type"), description: value("record-description"), date: value("record-date") } :
    { date: value("record-date"), cid: value("record-cid"), days: value("record-days"), doctor: value("record-doctor"), partial: $("#record-partial").checked };
  employee[field].push(record);
  if (!saveEmployee(null, { keepForm: true, backup })) return;
  $("#record-dialog").close();
});
$("#close-record").addEventListener("click", () => $("#record-dialog").close());
$("#cancel-record").addEventListener("click", () => $("#record-dialog").close());

$("#employee-picker").addEventListener("change", () => fillEmployeeForm(employees.find((employee) => employee.id === Number($("#employee-picker").value))));
$("#employee-addressCep").addEventListener("input", (event) => {
  const digits = event.target.value.replace(/\D/g, "").slice(0, 8);
  event.target.value = digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
  if (digits.length < 8) setAddressLookupStatus("");
  if (digits.length === 8) lookupAddressByCep();
});
$("#employee-addressCep").addEventListener("blur", lookupAddressByCep);
["#employee-cellphone", "#employee-telephone", "#employee-emergencyPhone"].forEach((selector) => {
  $(selector).addEventListener("input", (event) => {
    const digits = event.target.value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 10) {
      event.target.value = digits.length > 2 ? `${digits.slice(0, 2)} ${digits.slice(2, 6)}-${digits.slice(6)}` : digits;
    } else {
      event.target.value = `${digits.slice(0, 2)} ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }
  });
});
["#employee-search", "#employee-status-filter", "#employee-department-filter"].forEach((selector) => $(selector).addEventListener("input", refreshEmployeePicker));
$("#save-employee").addEventListener("click", (event) => {
  event.preventDefault();
  if (!$("#employee-form").reportValidity()) return;
  saveEmployee(() => {
    $("#employee-success-dialog").showModal();
  });
});
$("#employee-success-continue").addEventListener("click", () => {
  $("#employee-success-dialog").close();
  activateTab("colaboradores");
  setTabHash("colaboradores");
});
// Documentos nao passam mais pelo dialogo: o botao abre direto o seletor de
// arquivos, tanto no cabecalho do card quanto no convite da area vazia.
const abrirSeletorDeDocumento = () => $("#document-upload-input").click();
$("#documents-list").addEventListener("click", (event) => {
  if (event.target.closest("[data-anexar-documento]")) abrirSeletorDeDocumento();
});
$("#document-upload-input").addEventListener("change", async (event) => {
  const arquivos = event.target.files;
  if (arquivos.length) await anexarDocumentos(arquivos);
  event.target.value = ""; // permite reenviar o mesmo arquivo depois
});
["movements", "trainings", "feedbacks", "medical"].forEach((field) => $(`#add-${field === "medical" ? "medical" : field.slice(0, -1)}`).addEventListener("click", () => addEmployeeRecord(field)));
$("#dossie").addEventListener("click", (event) => {
  if (!event.target.classList.contains("remove-record")) return;
  const employee = currentEmployee();
  const records = employee?.[event.target.dataset.record];
  const index = Number(event.target.dataset.index);
  if (!Array.isArray(records) || !records[index]) return;
  const backup = cloneData(employees);
  records.splice(index, 1);
  saveEmployee(null, { keepForm: true, backup });
});

function refreshDocumentsEmployeePicker() {
  const query = $("#documents-employee-search").value.toLowerCase().trim();
  const filtered = employees.filter((employee) => [employee.name, employee.role, employee.department, employee.level, employee.unit, employee.hierarchy].some((value) => String(value || "").toLowerCase().includes(query)));
  const picker = $("#documents-employee-picker");
  const previous = picker.value;
  picker.innerHTML = filtered.length
    ? filtered.map((employee) => `<option value="${escapeHtml(employee.id)}">${escapeHtml(employee.name)}</option>`).join("")
    : `<option value="">Nenhum colaborador encontrado</option>`;
  // Valor fora da lista deixava o seletor vazio e a biblioteca mostrava (e
  // recebia upload) do primeiro colaborador cadastrado.
  const ids = filtered.map((employee) => String(employee.id));
  const formId = $("#employee-id").value;
  picker.value = ids.includes(formId) ? formId : ids.includes(previous) ? previous : (ids[0] || "");
  refreshDocumentFilters();
}

$("#documents-employee-picker").addEventListener("change", refreshDocumentFilters);
$("#documents-employee-search").addEventListener("input", refreshDocumentsEmployeePicker);
["#document-search", "#document-category-filter"].forEach((selector) => $(selector).addEventListener("input", renderDocuments));
$("#upload-document").addEventListener("click", () => openDocumentDialog());
$("#close-document").addEventListener("click", () => $("#document-dialog").close());
$("#cancel-document").addEventListener("click", () => $("#document-dialog").close());
$("#document-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const file = $("#document-file").files[0];
  if (!file) return;
  // Documentos ficam dentro do localStorage (~5 MB no total, e o base64 ainda cresce 1/3).
  if (file.size > MAX_DOCUMENT_SIZE) {
    alert(`O arquivo "${file.name}" tem ${formatFileSize(file.size)}. O limite é de 2 MB por arquivo, porque os documentos ficam guardados no próprio navegador.\n\nReduza o arquivo (por exemplo, comprimindo o PDF) e tente novamente.`);
    return;
  }
  const documentId = Number($("#document-dialog").dataset.documentId);
  const employee = documentsEmployee();
  if (!employee) {
    alert("Selecione um colaborador antes de enviar documentos.");
    return;
  }
  const document = (employee.documentLibrary || []).find((item) => item.id === documentId);
  saveDocumentFile(file, document);
});
$("#document-list").addEventListener("click", (event) => {
  const action = event.target.dataset.documentAction;
  if (!action) return;
  const employee = documentsEmployee();
  const selectedDocument = (employee?.documentLibrary || []).find((item) => item.id === Number(event.target.dataset.documentId));
  if (!selectedDocument) return;
  if (action === "version") openDocumentDialog(selectedDocument);
  if (action === "remove") {
    const backup = cloneData(employees);
    employee.documentLibrary = employee.documentLibrary.filter((item) => item.id !== selectedDocument.id);
    if (!saveEmployees(backup)) return;
    refreshDocumentFilters();
  }
  if (action === "download") {
    const latest = selectedDocument.versions[selectedDocument.versions.length - 1];
    const link = document.createElement("a");
    link.href = latest.data;
    link.download = latest.name;
    link.click();
  }
  if (action === "history") {
    $("#version-dialog-title").textContent = `Versões de ${selectedDocument.title}`;
    $("#version-list").innerHTML = selectedDocument.versions.slice().reverse().map((version, index) => `<div class="version-row"><div><strong>Versão ${selectedDocument.versions.length - index} · ${escapeHtml(version.name)}</strong><span>${documentDate(version.createdAt)} · ${formatFileSize(version.size)}</span></div><button type="button" class="document-action" data-version-data="${escapeHtml(version.data)}" data-version-name="${escapeHtml(version.name)}">Baixar</button></div>`).join("");
    $("#version-dialog").showModal();
  }
});
$("#version-list").addEventListener("click", (event) => {
  const data = event.target.dataset.versionData;
  if (!data) return;
  const link = document.createElement("a");
  link.href = data;
  link.download = event.target.dataset.versionName;
  link.click();
});
$("#close-version").addEventListener("click", () => $("#version-dialog").close());
$("#cancel-version").addEventListener("click", () => $("#version-dialog").close());

["#vacation-search", "#vacation-status-filter", "#vacation-month-filter"].forEach((selector) => $(selector).addEventListener("input", renderVacations));
$("#add-vacation").addEventListener("click", () => {
  $("#vacation-form").reset();
  refreshVacationEmployees();
  $("#vacation-dialog").showModal();
});
$("#close-vacation").addEventListener("click", () => $("#vacation-dialog").close());
$("#cancel-vacation").addEventListener("click", () => $("#vacation-dialog").close());
$("#vacation-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const employee = employees.find((item) => item.id === Number($("#vacation-employee").value));
  if (!employee) return;
  const backup = cloneData(employees);
  if (!employee.vacationPeriods) employee.vacationPeriods = [];
  employee.vacationPeriods.push({
    id: generateId(employee.vacationPeriods),
    status: $("#vacation-status").value,
    acquisitionStart: $("#acquisition-start").value,
    acquisitionEnd: $("#acquisition-end").value,
    concessionDeadline: $("#concession-deadline").value,
    vacationStart: $("#vacation-start").value,
    vacationEnd: $("#vacation-end").value,
    notes: $("#vacation-notes").value.trim()
  });
  if (!saveEmployees(backup)) return;
  renderVacations();
  $("#vacation-dialog").close();
});
$("#vacation-list").addEventListener("click", (event) => {
  const key = event.target.dataset.removeVacation;
  if (!key) return;
  const [employeeId, periodId] = key.split(":").map(Number);
  const employee = employees.find((item) => item.id === employeeId);
  if (!employee) return;
  const backup = cloneData(employees);
  employee.vacationPeriods = (employee.vacationPeriods || []).filter((period) => period.id !== periodId);
  if (!saveEmployees(backup)) return;
  renderVacations();
});

setupFilters();
render();
if (!corruptedStorageKeys.has("candidates")) writeStorage("candidates", candidates, { silent: true });
document.addEventListener("error", (event) => {
  const image = event.target;
  if (!image.classList || !image.classList.contains("phone-flag-image")) return;
  const holder = image.parentElement;
  holder.classList.add("phone-flag-fallback");
  holder.textContent = image.dataset.flagCode;
}, true);
populateCountryOptions();
document.querySelectorAll(".phone-country-button").forEach((button) => {
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    const picker = button.closest(".phone-country-picker");
    const isOpen = picker.classList.toggle("open");
    button.setAttribute("aria-expanded", String(isOpen));
    if (isOpen) picker.querySelector(".phone-country-search").focus();
    document.querySelectorAll(".phone-country-picker.open").forEach((otherPicker) => {
      if (otherPicker !== picker) {
        otherPicker.classList.remove("open");
        otherPicker.querySelector(".phone-country-button").setAttribute("aria-expanded", "false");
      }
    });
  });
});
document.addEventListener("click", () => {
  document.querySelectorAll(".phone-country-picker.open").forEach((picker) => {
    picker.classList.remove("open");
    picker.querySelector(".phone-country-button").setAttribute("aria-expanded", "false");
  });
});
document.querySelectorAll("[data-list-form]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = form.querySelector("input");
    if (!addSettingItem(form.dataset.listForm, input.value)) return;
    input.value = "";
    input.focus();
  });
});
document.querySelectorAll("[data-settings-page]").forEach((item) => {
  const openSettingsPage = () => {
    const page = item.dataset.settingsPage;
    activateTab(page);
    setTabHash(page);
    $(`#${page} input`)?.focus();
  };
  item.addEventListener("click", openSettingsPage);
  item.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openSettingsPage();
    }
  });
});
const returnToSettings = () => {
  activateTab("cadastro-configuracoes");
  setTabHash("cadastro-configuracoes");
};
document.querySelectorAll("[data-settings-back]").forEach((button) => {
  button.addEventListener("click", () => {
    $("#settings-success-dialog").showModal();
  });
});
$("#settings-success-continue").addEventListener("click", () => {
  $("#settings-success-dialog").close();
});
$("#settings-success-dialog").addEventListener("close", returnToSettings);
document.querySelectorAll("[data-settings-focus]").forEach((button) => {
  button.addEventListener("click", () => {
    const form = document.querySelector(`[data-settings-form="${button.dataset.settingsFocus}"]`);
    if (!form) return;
    const input = form.querySelector("input");
    form.scrollIntoView({ behavior: "smooth", block: "nearest" });
    input.focus();
  });
});
document.querySelectorAll("[data-settings-form]").forEach((form) => {
  form.querySelector("input").addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    form.requestSubmit();
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const key = form.dataset.settingsForm;
    const input = form.querySelector("input");
    // Se a gravacao falhar, o texto digitado continua no campo.
    if (!addSettingItem(key, input.value)) return;
    input.value = "";
    input.focus();
  });
});
document.querySelectorAll(".settings-list").forEach((list) => {
  list.addEventListener("click", (event) => {
    const removeButton = event.target.closest("[data-remove-setting]");
    if (removeButton) {
      removeSettingItem(removeButton.dataset.removeSetting, removeButton.dataset.settingValue);
      return;
    }
    const editButton = event.target.closest("[data-edit-setting]");
    if (!editButton) return;
    const row = editButton.closest(".settings-list-row");
    const value = editButton.dataset.settingValue;
    row.innerHTML = `<input class="settings-list-edit-input" value="${escapeHtml(value)}" aria-label="Editar item"><div class="settings-list-actions"><button type="button" class="settings-list-save" data-save-setting="${escapeHtml(editButton.dataset.editSetting)}" data-setting-value="${escapeHtml(value)}">Salvar</button><button type="button" class="settings-list-cancel">Cancelar</button></div>`;
    row.querySelector("input").focus();
    row.querySelector("input").select();
  });
});
document.querySelectorAll(".settings-list").forEach((list) => {
  list.addEventListener("click", (event) => {
    const saveButton = event.target.closest("[data-save-setting]");
    if (saveButton) {
      editSettingItem(saveButton.dataset.saveSetting, saveButton.dataset.settingValue, saveButton.closest(".settings-list-row").querySelector("input").value);
      return;
    }
    if (event.target.closest(".settings-list-cancel")) refreshSettingsLists();
  });
});
setupCombos();
setupCustomLists();
setupContractExpiration();
refreshSettingsLists();
setupEmployeeFilters();
setupEmployeeListFilters();
refreshEmployeePicker();
fillEmployeeForm(employees[0]);
renderEmployeeList();
refreshDocumentsEmployeePicker();
refreshVacationEmployees();
renderVacations();
renderFollowup();
const initialTab = tabFromHash();
const resolvedInitialTab = resolveTab(initialTab);
const visibleInitialTab = resolvedInitialTab === "dossie" ? "colaboradores" : resolvedInitialTab;
if (initialTab && visibleInitialTab !== initialTab) history.replaceState(null, "", `#${visibleInitialTab}`);
activateTab(visibleInitialTab);
// Voltar/avancar do navegador e links com #aba trocam de tela sem recarregar.
window.addEventListener("hashchange", syncTabWithHash);
window.addEventListener("popstate", syncTabWithHash);
appInitializing = false;
