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

const $ = (selector) => document.querySelector(selector);

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

let lastGeneratedId = 0;
function createId() {
  const now = Date.now();
  lastGeneratedId = now > lastGeneratedId ? now : lastGeneratedId + 1;
  return lastGeneratedId;
}

function notifyUser(message) {
  if (typeof window.alert === "function") window.alert(message);
  else console.warn(message);
}

function isQuotaError(error) {
  if (!error) return false;
  return error.name === "QuotaExceededError"
    || error.name === "NS_ERROR_DOM_QUOTA_REACHED"
    || error.code === 22
    || error.code === 1014;
}

function readStorage(key, fallback) {
  let raw = null;
  try {
    raw = localStorage.getItem(key);
  } catch (error) {
    console.error(`Não foi possível ler "${key}" do navegador:`, error);
    return deepClone(fallback);
  }
  if (raw === null || raw === "") return deepClone(fallback);
  try {
    const parsed = JSON.parse(raw);
    if (parsed === null || typeof parsed !== "object") throw new Error("Formato inesperado");
    if (Array.isArray(fallback) !== Array.isArray(parsed)) throw new Error("Formato inesperado");
    return parsed;
  } catch (error) {
    console.error(`Dados salvos de "${key}" estão corrompidos:`, error);
    notifyUser(`Os dados de "${key}" guardados neste navegador estão corrompidos e não puderam ser lidos.\n\nO sistema voltou aos dados de demonstração para continuar funcionando.`);
    return deepClone(fallback);
  }
}

function saveStorage(key, value, options) {
  const silent = Boolean(options && options.silent);
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Não foi possível gravar "${key}" no navegador:`, error);
    if (!silent) {
      notifyUser(isQuotaError(error)
        ? "Não foi possível salvar: o armazenamento do navegador está cheio (o limite é de cerca de 5 MB).\n\nA última alteração NÃO foi gravada e foi desfeita. Apague documentos ou versões antigas e tente novamente."
        : `Não foi possível salvar os dados no navegador. A última alteração NÃO foi gravada e foi desfeita.\n\nDetalhe técnico: ${error && error.message ? error.message : error}`);
    }
    return false;
  }
}

function on(target, type, handler) {
  const element = typeof target === "string" ? $(target) : target;
  if (!element) {
    console.warn(`Elemento ${target} não encontrado; o comportamento ligado a ele foi ignorado.`);
    return null;
  }
  element.addEventListener(type, handler);
  return element;
}

function fieldValue(selector) {
  const element = $(selector);
  return element ? element.value : "";
}

const MAX_DOCUMENT_BYTES = 2 * 1024 * 1024;

let candidates = readStorage("candidates", initialCandidates);
if (!Array.isArray(candidates)) candidates = deepClone(initialCandidates);
const initialEmployees = [{
  id: 1, name: "Exemplo de colaborador", cpf: "", birth: "", email: "", phone: "", marital: "", birthplace: "", education: "",
  role: "Analista de Departamento Pessoal", department: "Recursos Humanos", manager: "Gestor responsável", level: "Pleno",
  admission: "", contract: "CLT", salary: "R$ 0,00", benefits: "", status: "Ativo",
  documents: [], documentLibrary: [], vacationPeriods: [], movements: [], trainings: [], feedbacks: [], medical: []
}];
let employees = readStorage("employees", initialEmployees);
if (!Array.isArray(employees)) employees = deepClone(initialEmployees);
employees = employees.filter((employee) => employee && typeof employee === "object" && employee.name !== "Novo colaborador");
const initialSettingsLists = {
  departments: ["Recursos Humanos"],
  roles: ["Analista de Departamento Pessoal"],
  managers: ["Gestor responsável"]
};
let settingsLists = readStorage("settingsLists", initialSettingsLists);
if (!settingsLists || typeof settingsLists !== "object" || Array.isArray(settingsLists)) settingsLists = deepClone(initialSettingsLists);
Object.keys(initialSettingsLists).forEach((key) => {
  if (!Array.isArray(settingsLists[key])) settingsLists[key] = deepClone(initialSettingsLists[key]);
});
const usedEmployeeIds = new Set();
employees.forEach((employee) => {
  const numericId = Number(employee.id);
  // ids <= 0 vinham do bug antigo em que todo colaborador novo era salvo com id 0
  employee.id = numericId > 0 && !usedEmployeeIds.has(numericId) ? numericId : createId();
  usedEmployeeIds.add(employee.id);
  if (!employee.level && employee.unit) employee.level = employee.unit;
  ["documents", "documentLibrary", "vacationPeriods", "movements", "trainings", "feedbacks", "medical"].forEach((field) => {
    if (!Array.isArray(employee[field])) employee[field] = [];
  });
});
saveStorage("employees", employees, { silent: true });
let addressLookupRequest = 0;

function setPhoneCountry(inputId, countryCode) {
  const picker = document.querySelector(`[data-phone-country="${inputId}"]`);
  if (!picker) return;
  const option = picker.querySelector(`[data-country-code="${countryCode}"]`) || picker.querySelector('[data-country-code="BR"]');
  picker.dataset.selectedCountry = option.dataset.countryCode;
  picker.querySelector(".phone-flag").textContent = option.querySelector(".phone-flag").textContent;
  picker.querySelector(".phone-country-code").textContent = option.dataset.dialCode;
  picker.querySelector(".phone-country-button").setAttribute("aria-label", `País selecionado: ${option.dataset.countryCode} ${option.dataset.dialCode}`);
  picker.querySelectorAll(".phone-country-option").forEach((item) => item.classList.toggle("selected", item === option));
}

function selectedPhoneCountry(inputId) {
  return document.querySelector(`[data-phone-country="${inputId}"]`)?.dataset.selectedCountry || "BR";
}

function refreshSettingsLists() {
  const listMap = { departments: "department-options", roles: "role-options", managers: "manager-options" };
  Object.entries(listMap).forEach(([key, datalistId]) => {
    const datalist = $(`#${datalistId}`);
    if (datalist) datalist.innerHTML = settingsLists[key].map((value) => `<option value="${escapeHtml(value)}"></option>`).join("");
    const list = $(`#${key}-list`);
    if (!list) return;
    list.innerHTML = settingsLists[key].length
      ? settingsLists[key].map((value) => `<div class="settings-list-row"><span>${escapeHtml(value)}</span><div class="settings-list-actions"><button type="button" class="settings-list-edit" data-edit-setting="${key}" data-setting-value="${escapeHtml(value)}">Editar</button><button type="button" class="settings-list-remove" data-remove-setting="${key}" data-setting-value="${escapeHtml(value)}">Remover</button></div></div>`).join("")
      : `<div class="settings-list-empty">Nenhum item cadastrado.</div>`;
  });
}

function persistSettingsLists(snapshot) {
  if (saveStorage("settingsLists", settingsLists)) return true;
  settingsLists = snapshot;
  refreshSettingsLists();
  return false;
}

function addSettingItem(key, value) {
  if (!Array.isArray(settingsLists[key])) return;
  const normalized = String(value || "").trim();
  if (!normalized) return;
  if (settingsLists[key].some((item) => item.toLocaleLowerCase("pt-BR") === normalized.toLocaleLowerCase("pt-BR"))) {
    notifyUser(`"${normalized}" já está cadastrado nesta lista.`);
    return;
  }
  const snapshot = deepClone(settingsLists);
  settingsLists[key] = [...settingsLists[key], normalized].sort((a, b) => a.localeCompare(b, "pt-BR"));
  if (!persistSettingsLists(snapshot)) return;
  refreshSettingsLists();
}

function removeSettingItem(key, value) {
  if (!Array.isArray(settingsLists[key])) return;
  const snapshot = deepClone(settingsLists);
  settingsLists[key] = settingsLists[key].filter((item) => item !== value);
  if (!persistSettingsLists(snapshot)) return;
  refreshSettingsLists();
}

function editSettingItem(key, previousValue, nextValue) {
  if (!Array.isArray(settingsLists[key])) return;
  const normalized = String(nextValue || "").trim();
  if (!normalized) {
    notifyUser("Informe um nome para o item.");
    return;
  }
  const duplicate = settingsLists[key].some((item) => item !== previousValue && item.toLocaleLowerCase("pt-BR") === normalized.toLocaleLowerCase("pt-BR"));
  if (duplicate) {
    notifyUser(`"${normalized}" já está cadastrado nesta lista.`);
    return;
  }
  const index = settingsLists[key].indexOf(previousValue);
  if (index === -1) return;
  const snapshot = deepClone(settingsLists);
  settingsLists[key] = settingsLists[key].map((item, position) => (position === index ? normalized : item)).sort((a, b) => a.localeCompare(b, "pt-BR"));
  if (!persistSettingsLists(snapshot)) return;
  refreshSettingsLists();
}

function populateCountryOptions() {
  const countrySelect = $("#employee-addressCountry");
  if (!countrySelect) return;
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
  const flagFor = (code) => code.replace(/[A-Z]/g, (letter) => String.fromCodePoint(letter.charCodeAt(0) + 127397));
  document.querySelectorAll(".phone-country-picker").forEach((picker) => {
    const menu = picker.querySelector(".phone-country-menu");
    const search = menu.querySelector(".phone-country-search");
    const renderCountries = (query = "") => {
      const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
      const filteredCountries = countries.filter((country) => `${country.code} ${country.name} ${dialCodes[country.code] || ""}`.toLocaleLowerCase("pt-BR").includes(normalizedQuery));
      menu.querySelectorAll(".phone-country-option").forEach((option) => option.remove());
      menu.insertAdjacentHTML("beforeend", filteredCountries.map((country) => `<button type="button" class="phone-country-option" role="option" data-country-code="${country.code}" data-dial-code="${dialCodes[country.code] || "+"}"><span class="phone-flag">${flagFor(country.code)}</span><span>${escapeHtml(country.code)} ${escapeHtml(country.name)} (${dialCodes[country.code] || "código"})</span></button>`).join(""));
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
    picker.querySelector(".phone-flag").textContent = flagFor("BR");
    picker.querySelector(".phone-country-button").setAttribute("aria-label", `País selecionado: BR ${dialCodes.BR}`);
  });
}

function setAddressLookupStatus(message, isError = false) {
  const status = $("#employee-address-status");
  if (!status) return;
  status.textContent = message;
  status.classList.toggle("error", isError);
}

async function lookupAddressByCep() {
  const cepInput = $("#employee-addressCep");
  if (!cepInput) return;
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
    const setField = (selector, value) => { const element = $(selector); if (element) element.value = value; };
    setField("#employee-addressStreet", address.logradouro || "");
    setField("#employee-addressNeighborhood", address.bairro || "");
    setField("#employee-addressCity", address.localidade || "");
    setField("#employee-addressState", address.uf || "");
    setField("#employee-addressCountry", "Brasil");
    setAddressLookupStatus("Endereço preenchido automaticamente.");
  } catch (error) {
    if (requestId !== addressLookupRequest) return;
    setAddressLookupStatus("Não foi possível consultar o CEP.", true);
    console.error("Falha ao consultar CEP:", error);
  }
}

const DEFAULT_TAB = "dashboard";
// telas que existem no app mas não devem ser reabertas por URL (são telas de edição)
const hashTabAliases = { dossie: "colaboradores", documentos: "colaboradores" };

function isTabPanel(name) {
  if (!name || typeof name !== "string") return false;
  const panel = document.getElementById(name);
  return Boolean(panel && panel.classList.contains("tab-panel"));
}

function resolveTab(name) {
  return isTabPanel(name) ? name : DEFAULT_TAB;
}

function resolveHashTab(hash) {
  const requested = String(hash || "").replace(/^#/, "").trim();
  if (!requested) return DEFAULT_TAB;
  const aliased = Object.prototype.hasOwnProperty.call(hashTabAliases, requested) ? hashTabAliases[requested] : requested;
  return resolveTab(aliased);
}

function expandActiveNavGroup() {
  document.querySelectorAll(".nav-group").forEach((group) => {
    if (!group.querySelector(".nav-item.active")) return;
    group.classList.remove("collapsed");
    const toggle = group.querySelector(".nav-group-toggle");
    if (!toggle) return;
    toggle.setAttribute("aria-expanded", "true");
    const chevron = toggle.querySelector(".nav-chevron");
    if (chevron) chevron.textContent = "⌃";
  });
}

function activateTab(requestedTab, subtabName = "") {
  const tabName = resolveTab(requestedTab);
  const showDocuments = tabName === "dossie";
  const showSettingsEntry = ["novo-departamento", "novo-cargo", "novo-superior"].includes(tabName);
  document.body.classList.toggle("dossier-view", tabName === "dossie");
  document.body.classList.toggle("employee-list-view", tabName === "colaboradores");
  document.body.classList.toggle("settings-entry-view", showSettingsEntry);
  document.querySelectorAll(".nav-item[data-tab]").forEach((item) => item.classList.toggle("active", item.dataset.tab === tabName && (item.dataset.subtab || "") === subtabName));
  document.querySelectorAll(".tab-panel").forEach((panel) => panel.classList.toggle("hidden", panel.id !== tabName));
  const documentsPanel = $("#documentos");
  if (documentsPanel) documentsPanel.classList.toggle("hidden", !showDocuments);
  expandActiveNavGroup();
  if (tabName === "dossie" || tabName === "colaboradores") window.scrollTo(0, 0);
  return tabName;
}

function vacationRecords() {
  return employees.flatMap((employee) => (employee.vacationPeriods || []).map((period) => ({ ...period, employeeId: employee.id, employeeName: employee.name })));
}

function daysUntil(date) {
  if (!date) return null;
  const target = new Date(`${date}T23:59:59`);
  if (Number.isNaN(target.getTime())) return null;
  return Math.ceil((target - new Date()) / 86400000);
}

// Férias contam o dia inicial e o final (período corrido), por isso o "+ 1".
function vacationDayCount(record) {
  if (!record || !record.vacationStart || !record.vacationEnd) return null;
  const start = new Date(`${record.vacationStart}T12:00:00`);
  const end = new Date(`${record.vacationEnd}T12:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  const days = Math.round((end - start) / 86400000) + 1;
  return days > 0 ? days : null;
}

// Regra CLT: período aquisitivo = 12 meses a partir da admissão (termina no dia anterior);
// período concessivo = os 12 meses seguintes ao fim do aquisitivo.
function shiftDate(value, years, dayOffset = 0) {
  if (!value) return "";
  const base = new Date(`${value}T12:00:00`);
  if (Number.isNaN(base.getTime())) return "";
  base.setFullYear(base.getFullYear() + years);
  base.setDate(base.getDate() + dayOffset);
  const month = String(base.getMonth() + 1).padStart(2, "0");
  const day = String(base.getDate()).padStart(2, "0");
  return `${base.getFullYear()}-${month}-${day}`;
}

function setText(selector, value) {
  const element = $(selector);
  if (element) element.textContent = value;
}

function setHtml(selector, value) {
  const element = $(selector);
  if (element) element.innerHTML = value;
}

function renderVacations() {
  const query = fieldValue("#vacation-search").toLowerCase().trim();
  const status = fieldValue("#vacation-status-filter");
  const month = fieldValue("#vacation-month-filter");
  const records = vacationRecords().filter((record) => (!query || String(record.employeeName || "").toLowerCase().includes(query)) && (!status || record.status === status));
  const alerts = records.filter((record) => {
    const days = daysUntil(record.concessionDeadline);
    return record.status !== "Concluída" && days !== null && days <= 60;
  }).sort((a, b) => String(a.concessionDeadline || "").localeCompare(String(b.concessionDeadline || "")));
  const scheduled = records.filter((record) => !month || String(record.vacationStart || "").startsWith(month)).sort((a, b) => String(a.vacationStart || "").localeCompare(String(b.vacationStart || "")));
  setText("#vacation-total", records.length);
  setText("#vacation-alert-count", alerts.length);
  setText("#vacation-scheduled-count", scheduled.length);
  setHtml("#vacation-alerts", alerts.length ? alerts.map((record) => {
    const days = daysUntil(record.concessionDeadline);
    const label = days === null ? "Sem data limite" : days < 0 ? `Vencido há ${Math.abs(days)} dia(s)` : `Vence em ${days} dia(s)`;
    return `<div class="pending-item vacation-alert"><div><strong>${escapeHtml(record.employeeName)}</strong><span>Concessivo até ${escapeHtml(formatDate(record.concessionDeadline))}</span></div><b>${escapeHtml(label)}</b></div>`;
  }).join("") : `<div class="record-empty">Nenhum período próximo do vencimento.</div>`);
  setText("#vacation-calendar-title", month ? `Férias em ${formatMonth(month)}` : "Férias programadas");
  setHtml("#vacation-calendar", scheduled.length ? scheduled.map((record) => `<div class="calendar-event"><span class="calendar-day">${escapeHtml(formatDate(record.vacationStart, true))}</span><div><strong>${escapeHtml(record.employeeName)}</strong><span>${escapeHtml(formatDate(record.vacationStart))} a ${escapeHtml(formatDate(record.vacationEnd))} · ${escapeHtml(record.status)}</span></div></div>`).join("") : `<div class="record-empty">Nenhuma férias programada para este período.</div>`);
  setHtml("#vacation-list", records.length ? records.map((record) => {
    const days = vacationDayCount(record);
    const daysLabel = days === null ? "Período inválido" : `${days} dia(s)`;
    return `<div class="record-row"><div><strong>${escapeHtml(record.employeeName)} · ${escapeHtml(record.status)}</strong><span>Aquisitivo: ${escapeHtml(formatDate(record.acquisitionStart))} a ${escapeHtml(formatDate(record.acquisitionEnd))} · Concessivo até ${escapeHtml(formatDate(record.concessionDeadline))} · Férias: ${escapeHtml(formatDate(record.vacationStart))} a ${escapeHtml(formatDate(record.vacationEnd))} · ${escapeHtml(daysLabel)}</span></div><button type="button" class="remove-record" data-remove-vacation="${escapeHtml(record.employeeId)}:${escapeHtml(record.id)}">Remover</button></div>`;
  }).join("") : `<div class="record-empty">Nenhum período de férias cadastrado.</div>`);
}

function formatDate(value, short = false) {
  if (!value) return "Sem data";
  const parsed = new Date(`${value}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return "Data inválida";
  return parsed.toLocaleDateString("pt-BR", short ? { day: "2-digit", month: "short" } : undefined);
}

function formatMonth(value) {
  const parsed = new Date(`${value}-01T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return "período selecionado";
  return parsed.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

function refreshVacationEmployees() {
  const picker = $("#vacation-employee");
  if (!picker) return;
  picker.innerHTML = employees.length
    ? employees.map((employee) => `<option value="${escapeHtml(employee.id)}">${escapeHtml(employee.name || "Sem nome")}</option>`).join("")
    : `<option value="">Nenhum colaborador cadastrado</option>`;
}

document.querySelectorAll(".nav-item[data-tab]").forEach((item) => {
  item.addEventListener("click", (event) => {
    event.preventDefault();
    const active = activateTab(item.dataset.tab, item.dataset.subtab || "");
    history.replaceState(null, "", `#${item.dataset.subtab ? "dossie" : active}`);
    if (item.dataset.subtab) $("#documentos")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

window.addEventListener("hashchange", () => {
  activateTab(resolveHashTab(location.hash));
});

function setupNavGroupToggle(toggleSelector, groupSelector) {
  on(toggleSelector, "click", () => {
    const group = $(groupSelector);
    if (!group) return;
    const expanded = group.classList.toggle("collapsed") === false;
    $(toggleSelector)?.setAttribute("aria-expanded", String(expanded));
    const chevron = $(`${toggleSelector} .nav-chevron`);
    if (chevron) chevron.textContent = expanded ? "⌃" : "⌄";
  });
}

setupNavGroupToggle("#talent-menu-toggle", ".nav-talent-group");
setupNavGroupToggle("#settings-menu-toggle", ".nav-settings-group");

function uniqueValues(field) {
  return [...new Set(candidates.map((candidate) => candidate[field]).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), "pt-BR"));
}

function statusClass(status) {
  const value = String(status || "");
  if (value === "Contratado") return "hired";
  if (value.includes("Aprovado")) return "approved";
  if (value.includes("Reprovado")) return "rejected";
  return "waiting";
}

function fillOptions(selector, values, firstOption) {
  const element = $(selector);
  if (!element) return;
  const previous = element.value;
  element.innerHTML = `<option value="">${escapeHtml(firstOption)}</option>` + values.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join("");
  // sem isto, recarregar a lista apagava o filtro que o usuário tinha aplicado
  element.value = values.includes(previous) ? previous : "";
}

function setupFilters() {
  const jobs = uniqueValues("job");
  fillOptions("#status-filter", statuses, "Todos os status");
  fillOptions("#job-filter", jobs, "Todas as vagas");
  fillOptions("#source-filter", sources, "Todas as origens");
  fillOptions("#dashboard-status-filter", statuses, "Todos os status");
  fillOptions("#dashboard-job-filter", jobs, "Todas as vagas");
  fillOptions("#dashboard-source-filter", sources, "Todas as origens");
  fillOptions("#status", statuses, "Selecione o status");
  fillOptions("#source", sources, "Selecione a origem");
  setHtml("#jobs", jobs.map((job) => `<option value="${escapeHtml(job)}"></option>`).join(""));
}

function renderDashboard() {
  const dashboardCandidates = getFilteredDashboardCandidates();
  const total = dashboardCandidates.length;
  const waiting = dashboardCandidates.filter((candidate) => candidate.status === "Aguardando").length;
  const approved = dashboardCandidates.filter((candidate) => String(candidate.status || "").includes("Aprovado")).length;
  const hired = dashboardCandidates.filter((candidate) => candidate.status === "Contratado").length;
  setHtml("#metrics", [
    ["Total de currículos", total, "Base cadastrada"],
    ["Aguardando triagem", waiting, "Ação pendente"],
    ["Em processo", approved, "Candidatos aprovados"],
    ["Contratados", hired, "Resultado final"]
  ].map(([label, value, note]) => `<div class="metric"><div class="metric-label">${escapeHtml(label)}</div><div class="metric-value">${escapeHtml(value)}</div><div class="metric-note">${escapeHtml(note)}</div></div>`).join(""));

  const counts = statuses.map((status) => ({ status, count: dashboardCandidates.filter((candidate) => candidate.status === status).length }));
  const max = Math.max(...counts.map((item) => item.count), 1);
  setHtml("#funnel", counts.map(({ status, count }) => `<div class="funnel-row"><span>${escapeHtml(status)}</span><div class="funnel-bar"><div class="funnel-fill" style="width:${(count / max) * 100}%"></div></div><span class="funnel-count">${escapeHtml(count)}</span></div>`).join(""));
  setText("#funnel-total", `${total} candidatos`);

  const sourceCounts = sources.map((source) => ({ source, count: dashboardCandidates.filter((candidate) => candidate.source === source).length })).filter((item) => item.count > 0).sort((a, b) => b.count - a.count);
  const sourceMax = Math.max(...sourceCounts.map((item) => item.count), 1);
  setHtml("#sources", sourceCounts.length ? sourceCounts.map(({ source, count }) => `<div class="source-row"><span>${escapeHtml(source)}</span><div class="source-bar"><div class="source-fill" style="width:${(count / sourceMax) * 100}%"></div></div><strong>${escapeHtml(count)}</strong></div>`).join("") : `<span class="muted">Ainda não há origens cadastradas.</span>`);
  setText("#home-date", new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" }));
  const activeEmployees = employees.filter((employee) => employee.status === "Ativo").length;
  const documentsPending = employees.filter((employee) => !(employee.documentLibrary || []).length).length;
  setHtml("#home-pending-list", [
    [`${waiting} currículo(s)`, "aguardando triagem", "candidatos"],
    [`${activeEmployees} colaborador(es)`, "com status ativo", "dossie"],
    [`${documentsPending} colaborador(es)`, "sem documentos na biblioteca", "documentos"]
  ].map(([value, label, tab]) => `<button type="button" class="pending-item" data-home-tab="${escapeHtml(tab)}"><strong>${escapeHtml(value)}</strong><span>${escapeHtml(label)}</span></button>`).join(""));
  bindHomeTabButtons();
}

function bindHomeTabButtons() {
  document.querySelectorAll("[data-home-tab]").forEach((button) => {
    if (button.dataset.homeTabBound === "true") return;
    button.dataset.homeTabBound = "true";
    button.addEventListener("click", () => {
      const tab = button.dataset.homeTab === "documentos" ? "dossie" : button.dataset.homeTab;
      const active = activateTab(tab);
      history.replaceState(null, "", `#${active}`);
      if (button.dataset.homeTab === "documentos") $("#documentos")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function getFilteredDashboardCandidates() {
  const query = fieldValue("#dashboard-search").toLowerCase().trim();
  const status = fieldValue("#dashboard-status-filter");
  const job = fieldValue("#dashboard-job-filter");
  const source = fieldValue("#dashboard-source-filter");
  return candidates.filter((candidate) => {
    const values = [candidate.name, candidate.phone, candidate.job, candidate.owner, candidate.source, candidate.status];
    return (!query || values.some((value) => String(value || "").toLowerCase().includes(query)))
      && (!status || candidate.status === status)
      && (!job || candidate.job === job)
      && (!source || candidate.source === source);
  });
}

function getFilteredCandidates() {
  const query = fieldValue("#search").toLowerCase().trim();
  const status = fieldValue("#status-filter");
  const job = fieldValue("#job-filter");
  const source = fieldValue("#source-filter");
  return candidates.filter((candidate) => {
    const matchesQuery = !query || [candidate.name, candidate.phone, candidate.job, candidate.owner, candidate.source, candidate.status].some((value) => String(value || "").toLowerCase().includes(query));
    return matchesQuery && (!status || candidate.status === status) && (!job || candidate.job === job) && (!source || candidate.source === source);
  });
}

/* Trilha de fases. O status de um candidato não é um rótulo solto: é uma
   posição numa sequência real (Triagem → 1ª fase → 2ª fase → Contratação).
   A trilha mostra até onde a pessoa chegou antes de sair — quem foi reprovado
   na triagem e quem foi reprovado na 2ª fase têm badges parecidos, mas
   históricos muito diferentes. O último segmento é o amarelo da marca: o
   ponto da logo Azuos marcando a contratação. */
const PHASE_NAMES = ["Triagem", "1ª fase", "2ª fase", "Contratação"];

function phaseTrack(status) {
  const value = String(status || "");
  let reached = 0;           // etapa a que o status se refere (1 a 4)
  let outcome = "waiting";   // waiting | done | out | hired

  if (value === "Contratado") { reached = 4; outcome = "hired"; }
  else if (value.includes("Triagem")) reached = 1;
  else if (value.includes("1°") || value.includes("1º")) reached = 2;
  else if (value.includes("2°") || value.includes("2º")) reached = 3;

  if (outcome !== "hired" && reached) outcome = value.includes("Reprovado") ? "out" : "done";

  const steps = PHASE_NAMES.map((_, index) => {
    const step = index + 1;
    if (outcome === "hired") return step === 4 ? "hired" : "done";
    if (!reached) return "";
    if (step < reached) return "done";
    if (step === reached) return outcome;
    return "";
  });

  const label = outcome === "waiting" ? "Ainda não entrou na triagem"
    : outcome === "hired" ? "Contratado: completou as 4 etapas"
    : `${outcome === "out" ? "Saiu" : "Aprovado"} em ${PHASE_NAMES[reached - 1]}: ${reached} de 4 etapas`;

  return `<div class="phase" role="img" aria-label="${escapeHtml(label)}">`
    + steps.map((state) => `<span class="phase-step${state ? ` ${state}` : ""}"></span>`).join("")
    + `</div>`;
}

function renderTable() {
  const filtered = getFilteredCandidates();
  setText("#candidate-count", `${filtered.length} de ${candidates.length} candidatos`);
  setHtml("#candidate-table", filtered.map((candidate) => `<tr>
    <td><div class="candidate-name">${escapeHtml(candidate.name)}</div><div class="candidate-phone">${escapeHtml(candidate.phone || "Telefone não informado")}</div></td>
    <td>${escapeHtml(candidate.job)}</td>
    <td>${escapeHtml(candidate.source)}</td>
    <td>${escapeHtml(candidate.owner || "A definir")}</td>
    <td><span class="badge ${statusClass(candidate.status)}">${escapeHtml(candidate.status)}</span>${phaseTrack(candidate.status)}</td>
    <td>${escapeHtml(candidate.lastContact || "-")}</td>
    <td><button class="row-action" data-edit="${escapeHtml(candidate.id)}">Editar</button></td>
  </tr>`).join(""));
  $("#empty-state")?.classList.toggle("hidden", filtered.length > 0);
}

function render() {
  renderDashboard();
  renderTable();
}

function openCandidate(candidate) {
  const form = $("#candidate-form");
  if (!form) return;
  form.reset();
  const idField = $("#candidate-id");
  if (idField) idField.value = candidate ? candidate.id : "";
  setText("#dialog-title", candidate ? "Editar candidato" : "Novo candidato");
  if (candidate) {
    Object.entries({ name: candidate.name, phone: candidate.phone, job: candidate.job, source: candidate.source, owner: candidate.owner, status: candidate.status, experience: candidate.experience, salary: candidate.salary, notes: candidate.notes }).forEach(([key, value]) => {
      const field = $(`#${key}`);
      if (field) field.value = value || "";
    });
  } else {
    const statusField = $("#status");
    const sourceField = $("#source");
    if (statusField) statusField.value = "Aguardando";
    if (sourceField) sourceField.value = "Não Informado";
  }
  $("#candidate-dialog")?.showModal();
}

// "#new-candidate" é o botão atual; "#open-form" é mantido por compatibilidade com o HTML antigo.
on("#new-candidate", "click", () => openCandidate());
if ($("#open-form")) on("#open-form", "click", () => openCandidate());
on("#close-form", "click", () => $("#candidate-dialog")?.close());
on("#cancel-form", "click", () => $("#candidate-dialog")?.close());
on("#candidate-form", "submit", (event) => {
  event.preventDefault();
  const id = Number(fieldValue("#candidate-id"));
  const candidate = { id: id || createId(), name: fieldValue("#name").trim(), phone: fieldValue("#phone").trim(), job: fieldValue("#job").trim(), source: fieldValue("#source"), owner: fieldValue("#owner").trim() || "A definir", status: fieldValue("#status"), experience: fieldValue("#experience"), salary: fieldValue("#salary").trim() || "-", lastContact: new Date().toLocaleDateString("pt-BR"), notes: fieldValue("#notes").trim() };
  const snapshot = candidates;
  candidates = id ? candidates.map((item) => (item.id === id ? candidate : item)) : [candidate, ...candidates];
  if (!saveStorage("candidates", candidates)) {
    candidates = snapshot; // sem rollback ficaria um candidato fantasma até recarregar a página
    setupFilters();
    render();
    return;
  }
  setupFilters();
  render();
  $("#candidate-dialog")?.close();
});
["#search", "#status-filter", "#job-filter", "#source-filter"].forEach((selector) => on(selector, "input", renderTable));
["#dashboard-search", "#dashboard-status-filter", "#dashboard-job-filter", "#dashboard-source-filter"].forEach((selector) => on(selector, "input", renderDashboard));
on("#candidate-table", "click", (event) => {
  const id = Number(event.target.dataset.edit);
  if (!id) return;
  const candidate = candidates.find((item) => item.id === id);
  if (!candidate) return;
  openCandidate(candidate);
});
on("#show-curriculum-dashboard", "click", () => {
  activateTab("dashboard");
  history.replaceState(null, "", "#dashboard");
});
on("#export-report", "click", () => {
  const headers = ["Nome", "Telefone", "Vaga", "Origem", "Responsável", "Status", "Último contato"];
  // exporta exatamente o que está filtrado na tela de currículos
  const exported = getFilteredCandidates();
  if (!exported.length) {
    notifyUser("Não há candidatos no filtro atual para exportar.");
    return;
  }
  const rows = exported.map((candidate) => [candidate.name, candidate.phone, candidate.job, candidate.source, candidate.owner, candidate.status, candidate.lastContact]);
  const csv = [headers, ...rows].map((row) => row.map((value) => `"${String(value === null || value === undefined ? "" : value).replaceAll('"', '""')}"`).join(";")).join("\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" }));
  link.download = "relatorio-candidatos.csv";
  link.click();
  URL.revokeObjectURL(link.href);
});
on("#clear-data", "click", () => {
  // Ação destrutiva e irreversível: pergunta antes. E restaura os DOIS
  // conjuntos — antes só os candidatos voltavam, e colaboradores, documentos
  // e férias cadastrados continuavam lá, misturados com os de demonstração.
  if (!confirm("Isto apaga todos os candidatos, colaboradores, documentos e férias cadastrados neste navegador e recoloca os dados de exemplo.\n\nNão tem como desfazer. Deseja continuar?")) return;

  const snapshotCandidates = candidates;
  const snapshotEmployees = employees;
  candidates = deepClone(initialCandidates); // clone: sem ele o app passaria a alterar a constante de demonstração
  employees = deepClone(initialEmployees);

  if (!saveStorage("candidates", candidates) || !saveStorage("employees", employees)) {
    candidates = snapshotCandidates;
    employees = snapshotEmployees;
    setupFilters();
    render();
    return;
  }

  setupFilters();
  setupEmployeeFilters();
  refreshEmployeePicker();
  fillEmployeeForm(employees[0] || null);
  refreshDocumentsEmployeePicker();
  render();
  activateTab("dashboard");
  history.replaceState(null, "", "#dashboard");
});
// Telas ainda não implementadas: avisa em vez de deixar o botão mudo.
[["#new-job", "O cadastro de vagas ainda não está disponível nesta versão."], ["#new-interview", "O agendamento de entrevistas ainda não está disponível nesta versão."]]
  .forEach(([selector, message]) => on(selector, "click", () => notifyUser(message)));

function currentEmployee() {
  const id = Number(fieldValue("#employee-id"));
  return employees.find((employee) => employee.id === id) || employees[0] || null;
}

function selectedDocumentsEmployee() {
  const id = Number(fieldValue("#documents-employee-picker"));
  return employees.find((employee) => employee.id === id) || employees[0] || null;
}

function escapeHtml(value) {
  if (value === null || value === undefined) return "";
  return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[character]));
}

function formatFileSize(bytes) {
  if (!bytes) return "Tamanho não informado";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function documentDate(date) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Sem data";
  return parsed.toLocaleDateString("pt-BR");
}

function renderDocuments() {
  const employee = selectedDocumentsEmployee();
  if (!employee) {
    setText("#document-count", 0);
    setText("#document-category-count", 0);
    setText("#document-version-count", 0);
    setHtml("#document-list", `<div class="record-empty">Cadastre um colaborador para organizar documentos.</div>`);
    return;
  }
  const documents = employee.documentLibrary || [];
  const query = fieldValue("#document-search").toLowerCase().trim();
  const category = fieldValue("#document-category-filter");
  const filtered = documents.filter((document) => {
    const matchesQuery = !query || [document.title, document.category, document.notes].some((value) => String(value || "").toLowerCase().includes(query));
    return matchesQuery && (!category || document.category === category);
  });
  const versions = documents.reduce((total, document) => total + (document.versions || []).length, 0);
  setText("#document-count", documents.length);
  setText("#document-category-count", new Set(documents.map((document) => document.category)).size);
  setText("#document-version-count", versions);
  setHtml("#document-list", filtered.length ? filtered.map((document) => {
    const history = Array.isArray(document.versions) ? document.versions : [];
    const latest = history.length ? history[history.length - 1] : null;
    const meta = latest
      ? `${escapeHtml(document.category)} · ${history.length} versão(ões) · Atualizado em ${escapeHtml(documentDate(latest.createdAt))} · ${escapeHtml(formatFileSize(latest.size))}`
      : `${escapeHtml(document.category)} · Nenhum arquivo anexado`;
    return `<div class="document-card">
      <div class="document-card-main">
        <div class="document-card-title">${escapeHtml(document.title)}</div>
        <div class="document-card-meta">${meta}</div>
        ${document.notes ? `<div class="document-card-notes">${escapeHtml(document.notes)}</div>` : ""}
      </div>
      <div class="document-card-actions">
        <button type="button" class="document-action" data-document-action="download" data-document-id="${escapeHtml(document.id)}">Baixar</button>
        <button type="button" class="document-action" data-document-action="version" data-document-id="${escapeHtml(document.id)}">Nova versão</button>
        <button type="button" class="document-action" data-document-action="history" data-document-id="${escapeHtml(document.id)}">Histórico</button>
        <button type="button" class="document-action danger" data-document-action="remove" data-document-id="${escapeHtml(document.id)}">Remover</button>
      </div>
    </div>`;
  }).join("") : `<div class="record-empty">Nenhum documento encontrado para este colaborador.</div>`);
}

function refreshDocumentFilters() {
  const employee = selectedDocumentsEmployee();
  const categories = [...new Set((employee?.documentLibrary || []).map((document) => document.category).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), "pt-BR"));
  const filter = $("#document-category-filter");
  if (filter) {
    const selected = filter.value;
    filter.innerHTML = `<option value="">Todas as categorias</option>${categories.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join("")}`;
    filter.value = categories.includes(selected) ? selected : "";
  }
  renderDocuments();
}

function openDocumentDialog(documentEntry) {
  const form = $("#document-form");
  const dialog = $("#document-dialog");
  if (!form || !dialog) return;
  form.reset();
  dialog.dataset.documentId = documentEntry ? documentEntry.id : "";
  setText("#document-dialog-title", documentEntry ? "Adicionar nova versão" : "Fazer upload");
  if (documentEntry) {
    const titleField = $("#document-title");
    const categoryField = $("#document-category");
    const notesField = $("#document-notes");
    if (titleField) titleField.value = documentEntry.title || "";
    if (categoryField) categoryField.value = documentEntry.category || "";
    if (notesField) notesField.value = documentEntry.notes || "";
  }
  dialog.showModal();
}

function saveDocumentFile(file, documentId) {
  const reader = new FileReader();
  reader.addEventListener("error", () => {
    notifyUser(`Não foi possível ler o arquivo "${file.name}". Tente novamente.`);
  });
  reader.addEventListener("load", () => {
    const employee = selectedDocumentsEmployee();
    if (!employee) {
      notifyUser("Selecione um colaborador antes de enviar documentos.");
      return;
    }
    // snapshot antes de mexer na memória: se o localStorage recusar, desfazemos tudo
    const snapshot = deepClone(employees);
    if (!Array.isArray(employee.documentLibrary)) employee.documentLibrary = [];
    const version = { id: createId(), name: file.name, size: file.size, type: file.type || "application/octet-stream", data: reader.result, createdAt: new Date().toISOString() };
    const target = documentId ? employee.documentLibrary.find((item) => item.id === documentId) : null;
    if (documentId && !target) {
      notifyUser("O documento selecionado não existe mais. Atualize a tela e tente novamente.");
      refreshDocumentFilters();
      return;
    }
    if (target) {
      if (!Array.isArray(target.versions)) target.versions = [];
      target.versions.push(version);
      target.notes = fieldValue("#document-notes").trim();
    } else {
      employee.documentLibrary.unshift({ id: createId(), title: fieldValue("#document-title").trim(), category: fieldValue("#document-category"), notes: fieldValue("#document-notes").trim(), versions: [version] });
    }
    if (!saveStorage("employees", employees)) {
      employees = snapshot;
      refreshDocumentsEmployeePicker();
      refreshDocumentFilters();
      return;
    }
    refreshDocumentFilters();
    $("#document-dialog")?.close();
  });
  reader.readAsDataURL(file);
}

function setFieldValue(selector, value) {
  const element = $(selector);
  if (element) element.value = value;
}

function fillEmployeeForm(employee) {
  if (!employee) return;
  $("#dossie")?.classList.add("dossier-editing");
  setFieldValue("#employee-id", employee.id);
  const fields = ["name", "cpf", "birth", "gender", "salutation", "ethnicity", "marital", "education", "course", "nationality", "birthplace", "role", "department", "manager", "level", "admission", "contract", "salary", "benefits", "status", "shift", "currency", "probation", "registration", "hierarchy", "contractDate", "contractDuration", "contractExpiration", "addressCountry", "addressCep", "addressStreet", "addressNumber", "addressNeighborhood", "addressCity", "addressState", "addressComplement"];
  fields.forEach((field) => { setFieldValue(`#employee-${field}`, employee[field] || ""); });
  setFieldValue("#employee-cellphone", employee.cellphone || "");
  setFieldValue("#employee-telephone", employee.telephone || employee.phone || "");
  setFieldValue("#employee-emergencyPhone", employee.emergencyPhone || "");
  setPhoneCountry("employee-cellphoneCountry", employee.cellphoneCountry || "BR");
  setPhoneCountry("employee-telephoneCountry", employee.telephoneCountry || "BR");
  setPhoneCountry("employee-emergencyPhoneCountry", employee.emergencyPhoneCountry || "BR");
  setFieldValue("#employee-personalEmail", employee.personalEmail || employee.email || "");
  setFieldValue("#employee-businessEmail", employee.businessEmail || "");
  setFieldValue("#employee-disability-type", employee.disabilityType || "");
  setFieldValue("#employee-father-name", employee.fatherName || "");
  setFieldValue("#employee-mother-name", employee.motherName || "");
  const disabilityField = $("#employee-disability");
  if (disabilityField) disabilityField.checked = Boolean(employee.disability);
  renderEmployeeRecords(employee);
}

function resetEmployeeForm() {
  $("#dossie")?.classList.add("dossier-editing");
  $("#employee-form")?.reset();
  setFieldValue("#employee-id", "");
  ["employee-cellphoneCountry", "employee-telephoneCountry", "employee-emergencyPhoneCountry"].forEach((id) => setPhoneCountry(id, "BR"));
  setFieldValue("#employee-contract", "CLT");
  setFieldValue("#employee-currency", "BRL");
  setFieldValue("#employee-status", "Ativo");
  renderEmployeeRecords({ documents: [], movements: [], trainings: [], feedbacks: [], medical: [] });
}

function renderEmployeeRecords(employee) {
  const source = employee || {};
  const list = (field, empty, renderer) => {
    const records = Array.isArray(source[field]) ? source[field] : [];
    setHtml(`#${field}-list`, records.length ? records.map((record, index) => renderer(record || {}, index)).join("") : `<div class="record-empty">${empty}</div>`);
  };
  list("documents", "Nenhum documento cadastrado.", (record, index) => `<div class="record-row"><div><strong>${escapeHtml(record.name)}</strong><span>${escapeHtml(record.type || "Documento")} · ${escapeHtml(record.date || "Sem data")}</span></div><button type="button" class="remove-record" data-record="documents" data-index="${index}">Remover</button></div>`);
  list("movements", "Nenhuma movimentação cadastrada.", (record, index) => `<div class="record-row"><div><strong>${escapeHtml(record.date || "Sem data")} · ${escapeHtml(record.type)}</strong><span>${escapeHtml(record.description || "")} ${record.role ? `· ${escapeHtml(record.role)}` : ""}</span></div><button type="button" class="remove-record" data-record="movements" data-index="${index}">Remover</button></div>`);
  list("trainings", "Nenhum treinamento cadastrado.", (record, index) => `<div class="record-row"><div><strong>${escapeHtml(record.name)}</strong><span>${escapeHtml(record.date || "Sem data")} · ${escapeHtml(record.hours || "Carga não informada")}</span></div><button type="button" class="remove-record" data-record="trainings" data-index="${index}">Remover</button></div>`);
  list("feedbacks", "Nenhum registro cadastrado.", (record, index) => `<div class="record-row"><div><strong>${escapeHtml(record.type)} · ${escapeHtml(record.date || "Sem data")}</strong><span>${escapeHtml(record.description || "")}</span></div><button type="button" class="remove-record" data-record="feedbacks" data-index="${index}">Remover</button></div>`);
  list("medical", "Nenhum atestado cadastrado.", (record, index) => `<div class="record-row"><div><strong>${escapeHtml(record.date || "Sem data")} · ${escapeHtml(record.days || 0)} dia(s)${record.partial ? " · Parcial" : ""}</strong><span>CID: ${escapeHtml(record.cid || "Não informado")} · Médico: ${escapeHtml(record.doctor || "Não informado")}</span></div><button type="button" class="remove-record" data-record="medical" data-index="${index}">Remover</button></div>`);
}

function employeeOption(employee) {
  return `<option value="${escapeHtml(employee.id)}">${escapeHtml(employee.name || "Sem nome")}</option>`;
}

function refreshEmployeePicker() {
  const picker = $("#employee-picker");
  if (!picker) return;
  const query = fieldValue("#employee-search").toLowerCase().trim();
  const status = fieldValue("#employee-status-filter");
  const department = fieldValue("#employee-department-filter");
  const filtered = employees.filter((employee) => {
    const values = [employee.name, employee.cpf, employee.email, employee.role, employee.department, employee.level, employee.unit];
    return (!query || values.some((value) => String(value || "").toLowerCase().includes(query)))
      && (!status || employee.status === status)
      && (!department || employee.department === department);
  });
  const currentId = fieldValue("#employee-id");
  const current = currentId ? employees.find((employee) => String(employee.id) === String(currentId)) : null;
  // Se o colaborador aberto não passa no filtro, ele continua na lista: sem isso o
  // select apontava para outra pessoa enquanto o formulário mostrava a atual.
  const visible = current && !filtered.some((employee) => employee.id === current.id) ? [current, ...filtered] : filtered;
  let options = visible.map(employeeOption).join("");
  if (!current) options = `<option value="">${visible.length ? "Selecione um colaborador" : "Nenhum colaborador encontrado"}</option>${options}`;
  picker.innerHTML = options;
  picker.value = current ? String(current.id) : "";
}

function employeeDepartments() {
  return [...new Set(employees.map((employee) => employee.department).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), "pt-BR"));
}

function setupEmployeeFilters() {
  fillOptions("#employee-status-filter", ["Ativo", "Férias", "Afastado", "Desligado"], "Todos os status");
  fillOptions("#employee-department-filter", employeeDepartments(), "Todos os departamentos");
}

function nextEmployeeId() {
  return Math.max(createId(), employees.reduce((highest, item) => Math.max(highest, Number(item.id) || 0), 0) + 1);
}

function saveEmployee(onSaved, keepForm = false) {
  const id = Number(fieldValue("#employee-id"));
  // sem o id novo aqui, todo colaborador criado era salvo com id 0 e sobrescrevia o anterior
  const employee = employees.find((item) => item.id === id) || { id: id > 0 ? id : nextEmployeeId(), documents: [], documentLibrary: [], vacationPeriods: [], movements: [], trainings: [], feedbacks: [], medical: [] };
  ["name", "cpf", "birth", "gender", "salutation", "ethnicity", "marital", "education", "course", "nationality", "birthplace", "role", "department", "manager", "level", "admission", "contract", "salary", "benefits", "status", "shift", "currency", "probation", "registration", "hierarchy", "contractDate", "contractDuration", "contractExpiration", "addressCountry", "addressCep", "addressStreet", "addressNumber", "addressNeighborhood", "addressCity", "addressState", "addressComplement"].forEach((field) => { employee[field] = fieldValue(`#employee-${field}`).trim(); });
  employee.cellphone = fieldValue("#employee-cellphone").trim();
  employee.telephone = fieldValue("#employee-telephone").trim();
  employee.emergencyPhone = fieldValue("#employee-emergencyPhone").trim();
  employee.cellphoneCountry = selectedPhoneCountry("employee-cellphoneCountry");
  employee.telephoneCountry = selectedPhoneCountry("employee-telephoneCountry");
  employee.emergencyPhoneCountry = selectedPhoneCountry("employee-emergencyPhoneCountry");
  employee.personalEmail = fieldValue("#employee-personalEmail").trim();
  employee.businessEmail = fieldValue("#employee-businessEmail").trim();
  employee.phone = employee.telephone;
  employee.email = employee.personalEmail;
  employee.disabilityType = fieldValue("#employee-disability-type").trim();
  employee.fatherName = fieldValue("#employee-father-name").trim();
  employee.motherName = fieldValue("#employee-mother-name").trim();
  const disabilityField = $("#employee-disability");
  employee.disability = disabilityField ? disabilityField.checked : false;
  return persistEmployee(employee, id, onSaved, keepForm);
}

function refreshEmployeeViews() {
  setupEmployeeFilters();
  setupEmployeeListFilters();
  refreshEmployeePicker();
  refreshDocumentsEmployeePicker();
  renderEmployeeList();
  refreshVacationEmployees();
  renderVacations();
}

function persistEmployee(employee, id, onSaved, keepForm = false) {
  delete employee.unit;
  delete employee.photo;
  const snapshot = deepClone(employees);
  employees = employees.some((item) => item.id === id) ? employees.map((item) => (item.id === id ? employee : item)) : [...employees, employee];
  if (!saveStorage("employees", employees)) {
    employees = snapshot; // sem rollback ficava um card fantasma que sumia no reload
    refreshEmployeeViews();
    return false;
  }
  // o id vai para o formulário ANTES de recarregar o seletor, senão os dois apontam para pessoas diferentes
  if (keepForm) setFieldValue("#employee-id", employee.id);
  else resetEmployeeForm();
  refreshEmployeeViews();
  if (onSaved) onSaved();
  return true;
}

function openNewEmployeeForm() {
  resetEmployeeForm();
  refreshEmployeePicker();
  activateTab("dossie");
  history.replaceState(null, "", "#dossie");
  $("#employee-name")?.focus();
}

on("#new-employee", "click", openNewEmployeeForm);

function renderEmployeeList() {
  const query = fieldValue("#employee-list-search").toLowerCase().trim();
  const status = fieldValue("#employee-list-status-filter");
  const department = fieldValue("#employee-list-department-filter");
  const filtered = employees.filter((employee) => {
    const values = [employee.name, employee.cpf, employee.role, employee.department, employee.level, employee.unit, employee.email];
    return (!query || values.some((value) => String(value || "").toLowerCase().includes(query)))
      && (!status || employee.status === status)
      && (!department || employee.department === department);
  });
  setText("#employee-list-count", `${filtered.length} de ${employees.length} colaboradores`);
  setHtml("#employee-list", filtered.length ? filtered.map((employee) => {
    const name = employee.name || "Sem nome";
    return `<div class="employee-list-row" role="button" tabindex="0" data-open-employee="${escapeHtml(employee.id)}" aria-label="Abrir edição de ${escapeHtml(name)}">
      <div class="employee-list-person"><div><strong>${escapeHtml(name)}</strong><span>${escapeHtml(employee.email || "E-mail não informado")}</span></div></div>
      <div class="employee-list-cell" data-label="Cargo"><strong>${escapeHtml(employee.role || "Não informado")}</strong></div>
      <div class="employee-list-cell" data-label="Departamento"><strong>${escapeHtml(employee.department || "Não informado")}</strong></div>
      <div class="employee-list-cell" data-label="Data de admissão"><strong>${escapeHtml(formatDate(employee.admission))}</strong></div>
      <div class="employee-list-cell" data-label="Nível"><strong>${escapeHtml(employee.level || employee.unit || "Não informado")}</strong></div>
      <div class="employee-list-cell" data-label="Status"><span class="employee-list-status">${escapeHtml(employee.status || "Ativo")}</span></div>
    </div>`;
  }).join("") : `<div class="record-empty">Nenhum colaborador encontrado.</div>`);
}

function setupEmployeeListFilters() {
  fillOptions("#employee-list-status-filter", ["Ativo", "Férias", "Afastado", "Desligado"], "Todos os status");
  fillOptions("#employee-list-department-filter", employeeDepartments(), "Todos os departamentos");
}

on("#new-employee-from-list", "click", openNewEmployeeForm);
["#employee-list-search", "#employee-list-status-filter", "#employee-list-department-filter"].forEach((selector) => on(selector, "input", renderEmployeeList));
on("#employee-list", "click", (event) => {
  const row = event.target.closest("[data-open-employee]");
  const employeeId = Number(row?.dataset.openEmployee);
  if (!employeeId) return;
  const employee = employees.find((item) => item.id === employeeId);
  if (!employee) return;
  fillEmployeeForm(employee);
  refreshEmployeePicker();
  activateTab("dossie");
  history.replaceState(null, "", "#dossie");
});
on("#employee-list", "keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const row = event.target.closest("[data-open-employee]");
  if (!row) return;
  event.preventDefault();
  row.click();
});

function addEmployeeRecord(field) {
  const configs = {
    documents: { title: "Novo documento", fields: [["record-name", "Nome do documento"], ["record-type", "Tipo (RG, contrato, comprovante)"], ["record-date", "Data", "date"]] },
    movements: { title: "Nova movimentação", fields: [["record-type", "Tipo (admissão, promoção, alteração)"], ["record-description", "Descrição"], ["record-date", "Data", "date"]] },
    trainings: { title: "Novo treinamento", fields: [["record-name", "Nome do treinamento"], ["record-hours", "Carga horária"], ["record-date", "Data", "date"]] },
    feedbacks: { title: "Novo registro", fields: [["record-type", "Tipo (feedback, advertência, comunicado, avaliação)"], ["record-description", "Descrição"], ["record-date", "Data", "date"]] },
    medical: { title: "Novo atestado", fields: [["record-date", "Data do atestado", "date"], ["record-cid", "CID"], ["record-days", "Quantidade de dias", "number"], ["record-doctor", "Nome do médico"], ["record-partial", "Atestado parcial", "checkbox"]] }
  };
  const config = configs[field];
  if (!config) return;
  if (!currentEmployee()) {
    notifyUser("Salve o cadastro do colaborador antes de adicionar registros ao dossiê.");
    return;
  }
  const dialog = $("#record-dialog");
  if (!dialog) return;
  setText("#record-title", config.title);
  setHtml("#record-fields", config.fields.map(([id, label, type = "text"]) => type === "checkbox" ? `<label class="check-field"><input id="${id}" type="checkbox">${escapeHtml(label)}</label>` : `<label>${escapeHtml(label)}<input id="${id}" type="${type}"></label>`).join(""));
  dialog.dataset.field = field;
  dialog.showModal();
}

on("#record-form", "submit", (event) => {
  event.preventDefault();
  const field = $("#record-dialog")?.dataset.field;
  const employee = currentEmployee();
  if (!field || !employee) {
    notifyUser("Selecione um colaborador antes de adicionar registros.");
    return;
  }
  if (!Array.isArray(employee[field])) employee[field] = [];
  const value = (id) => $(`#${id}`)?.value || "";
  const record = field === "documents" ? { name: value("record-name"), type: value("record-type"), date: value("record-date") } :
    field === "movements" ? { type: value("record-type"), description: value("record-description"), date: value("record-date"), role: "" } :
    field === "trainings" ? { name: value("record-name"), hours: value("record-hours"), date: value("record-date") } :
    field === "feedbacks" ? { type: value("record-type"), description: value("record-description"), date: value("record-date") } :
    { date: value("record-date"), cid: value("record-cid"), days: value("record-days"), doctor: value("record-doctor"), partial: Boolean($("#record-partial")?.checked) };
  employee[field].push(record);
  // keepForm: sem isto, adicionar um registro limpava todo o formulário do dossiê
  if (!saveEmployee(null, true)) {
    const restored = currentEmployee();
    renderEmployeeRecords(restored);
    return;
  }
  renderEmployeeRecords(currentEmployee());
  $("#record-dialog")?.close();
});
on("#close-record", "click", () => $("#record-dialog")?.close());
on("#cancel-record", "click", () => $("#record-dialog")?.close());

on("#employee-picker", "change", () => {
  const selected = employees.find((employee) => String(employee.id) === fieldValue("#employee-picker"));
  if (!selected) return;
  fillEmployeeForm(selected);
  refreshEmployeePicker();
});
on("#employee-addressCep", "input", (event) => {
  const digits = event.target.value.replace(/\D/g, "").slice(0, 8);
  event.target.value = digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
  if (digits.length < 8) setAddressLookupStatus("");
  if (digits.length === 8) lookupAddressByCep();
});
on("#employee-addressCep", "blur", lookupAddressByCep);
["#employee-cellphone", "#employee-telephone", "#employee-emergencyPhone"].forEach((selector) => {
  on(selector, "input", (event) => {
    const digits = event.target.value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 10) {
      event.target.value = digits.length > 2 ? `${digits.slice(0, 2)} ${digits.slice(2, 6)}-${digits.slice(6)}` : digits;
    } else {
      event.target.value = `${digits.slice(0, 2)} ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }
  });
});
["#employee-search", "#employee-status-filter", "#employee-department-filter"].forEach((selector) => on(selector, "input", refreshEmployeePicker));
on("#save-employee", "click", (event) => {
  event.preventDefault();
  const form = $("#employee-form");
  if (form && !form.reportValidity()) return;
  saveEmployee(() => {
    $("#employee-success-dialog")?.showModal();
  });
});
on("#employee-success-continue", "click", () => {
  $("#employee-success-dialog")?.close();
  activateTab("colaboradores");
  history.replaceState(null, "", "#colaboradores");
});
["documents", "movements", "trainings", "feedbacks", "medical"].forEach((field) => on(`#add-${field === "medical" ? "medical" : field.slice(0, -1)}`, "click", () => addEmployeeRecord(field)));
on("#dossie", "click", (event) => {
  if (!event.target.classList.contains("remove-record")) return;
  const field = event.target.dataset.record;
  const index = Number(event.target.dataset.index);
  const employee = currentEmployee();
  if (!employee || !Array.isArray(employee[field]) || !Number.isInteger(index) || index < 0 || index >= employee[field].length) return;
  employee[field].splice(index, 1);
  saveEmployee(null, true);
  renderEmployeeRecords(currentEmployee());
});

function refreshDocumentsEmployeePicker() {
  const picker = $("#documents-employee-picker");
  if (!picker) return;
  const query = fieldValue("#documents-employee-search").toLowerCase().trim();
  const filtered = employees.filter((employee) => [employee.name, employee.role, employee.department, employee.level, employee.unit].some((value) => String(value || "").toLowerCase().includes(query)));
  picker.innerHTML = filtered.length
    ? filtered.map(employeeOption).join("")
    : `<option value="">Nenhum colaborador encontrado</option>`;
  // o valor precisa existir entre as opções, senão o select e a lista de documentos divergem
  const desired = fieldValue("#employee-id") || String(filtered[0]?.id ?? "");
  picker.value = filtered.some((employee) => String(employee.id) === desired) ? desired : String(filtered[0]?.id ?? "");
  refreshDocumentFilters();
}

on("#documents-employee-picker", "change", refreshDocumentFilters);
on("#documents-employee-search", "input", refreshDocumentsEmployeePicker);
["#document-search", "#document-category-filter"].forEach((selector) => on(selector, "input", renderDocuments));
on("#upload-document", "click", () => {
  if (!selectedDocumentsEmployee()) {
    notifyUser("Cadastre um colaborador antes de enviar documentos.");
    return;
  }
  openDocumentDialog();
});
on("#close-document", "click", () => $("#document-dialog")?.close());
on("#cancel-document", "click", () => $("#document-dialog")?.close());
on("#document-form", "submit", (event) => {
  event.preventDefault();
  const fileField = $("#document-file");
  const file = fileField && fileField.files ? fileField.files[0] : null;
  if (!file) {
    notifyUser("Escolha um arquivo para enviar.");
    return;
  }
  // o arquivo vira base64 dentro do localStorage (limite ~5 MB); acima disso a gravação estoura
  if (file.size > MAX_DOCUMENT_BYTES) {
    notifyUser(`O arquivo "${file.name}" tem ${formatFileSize(file.size)} e passa do limite de ${formatFileSize(MAX_DOCUMENT_BYTES)} por documento.\n\nOs arquivos ficam guardados dentro do navegador, que só comporta cerca de 5 MB no total. Reduza o arquivo (comprima o PDF ou divida em partes) e tente novamente.`);
    return;
  }
  const documentId = Number($("#document-dialog")?.dataset.documentId);
  saveDocumentFile(file, documentId || null);
});
on("#document-list", "click", (event) => {
  const action = event.target.dataset.documentAction;
  if (!action) return;
  const employee = selectedDocumentsEmployee();
  if (!employee) return;
  const selectedDocument = (employee.documentLibrary || []).find((item) => item.id === Number(event.target.dataset.documentId));
  if (!selectedDocument) return;
  const versions = Array.isArray(selectedDocument.versions) ? selectedDocument.versions : [];
  if (action === "version") openDocumentDialog(selectedDocument);
  if (action === "remove") {
    const snapshot = deepClone(employees);
    employee.documentLibrary = (employee.documentLibrary || []).filter((item) => item.id !== selectedDocument.id);
    if (!saveStorage("employees", employees)) employees = snapshot;
    refreshDocumentsEmployeePicker();
  }
  if (action === "download") {
    const latest = versions.length ? versions[versions.length - 1] : null;
    if (!latest || !latest.data) {
      notifyUser("Este documento não tem nenhum arquivo anexado para baixar.");
      return;
    }
    const link = document.createElement("a");
    link.href = latest.data;
    link.download = latest.name || "documento";
    link.click();
  }
  if (action === "history") {
    setText("#version-dialog-title", `Versões de ${selectedDocument.title}`);
    setHtml("#version-list", versions.length
      ? versions.slice().reverse().map((version, index) => `<div class="version-row"><div><strong>Versão ${versions.length - index} · ${escapeHtml(version.name)}</strong><span>${escapeHtml(documentDate(version.createdAt))} · ${escapeHtml(formatFileSize(version.size))}</span></div><button type="button" class="document-action" data-version-data="${escapeHtml(version.data)}" data-version-name="${escapeHtml(version.name)}">Baixar</button></div>`).join("")
      : `<div class="record-empty">Nenhuma versão armazenada.</div>`);
    $("#version-dialog")?.showModal();
  }
});
on("#version-list", "click", (event) => {
  const data = event.target.dataset.versionData;
  if (!data) return;
  const link = document.createElement("a");
  link.href = data;
  link.download = event.target.dataset.versionName || "documento";
  link.click();
});
on("#close-version", "click", () => $("#version-dialog")?.close());
on("#cancel-version", "click", () => $("#version-dialog")?.close());

["#vacation-search", "#vacation-status-filter", "#vacation-month-filter"].forEach((selector) => on(selector, "input", renderVacations));
on("#add-vacation", "click", () => {
  if (!employees.length) {
    notifyUser("Cadastre ao menos um colaborador antes de programar férias.");
    return;
  }
  const form = $("#vacation-form");
  if (form) form.reset();
  refreshVacationEmployees();
  $("#vacation-dialog")?.showModal();
});
on("#acquisition-start", "input", (event) => {
  const acquisitionEnd = shiftDate(event.target.value, 1, -1);
  const acquisitionEndField = $("#acquisition-end");
  const concessionField = $("#concession-deadline");
  if (acquisitionEndField) acquisitionEndField.value = acquisitionEnd;
  if (concessionField) concessionField.value = shiftDate(acquisitionEnd, 1);
});
on("#close-vacation", "click", () => $("#vacation-dialog")?.close());
on("#cancel-vacation", "click", () => $("#vacation-dialog")?.close());
on("#vacation-form", "submit", (event) => {
  event.preventDefault();
  const employee = employees.find((item) => item.id === Number(fieldValue("#vacation-employee")));
  if (!employee) {
    notifyUser("Selecione um colaborador para programar as férias.");
    return;
  }
  const period = {
    id: createId(),
    status: fieldValue("#vacation-status"),
    acquisitionStart: fieldValue("#acquisition-start"),
    acquisitionEnd: fieldValue("#acquisition-end"),
    concessionDeadline: fieldValue("#concession-deadline"),
    vacationStart: fieldValue("#vacation-start"),
    vacationEnd: fieldValue("#vacation-end"),
    notes: fieldValue("#vacation-notes").trim()
  };
  if (period.acquisitionEnd < period.acquisitionStart) {
    notifyUser("O fim do período aquisitivo não pode ser anterior ao início.");
    return;
  }
  if (period.concessionDeadline < period.acquisitionEnd) {
    notifyUser("O limite do período concessivo não pode ser anterior ao fim do período aquisitivo.");
    return;
  }
  if (period.vacationEnd < period.vacationStart) {
    notifyUser("O fim das férias não pode ser anterior ao início.");
    return;
  }
  const snapshot = deepClone(employees);
  if (!Array.isArray(employee.vacationPeriods)) employee.vacationPeriods = [];
  employee.vacationPeriods.push(period);
  if (!saveStorage("employees", employees)) {
    employees = snapshot;
    renderVacations();
    return;
  }
  renderVacations();
  $("#vacation-dialog")?.close();
});
on("#vacation-list", "click", (event) => {
  const key = event.target.dataset.removeVacation;
  if (!key) return;
  const [employeeId, periodId] = key.split(":").map(Number);
  const employee = employees.find((item) => item.id === employeeId);
  if (!employee || !Array.isArray(employee.vacationPeriods)) return;
  const snapshot = deepClone(employees);
  employee.vacationPeriods = employee.vacationPeriods.filter((period) => period.id !== periodId);
  if (!saveStorage("employees", employees)) employees = snapshot;
  renderVacations();
});

setupFilters();
render();
populateCountryOptions();
document.querySelectorAll(".phone-country-button").forEach((button) => {
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    const picker = button.closest(".phone-country-picker");
    if (!picker) return;
    const isOpen = picker.classList.toggle("open");
    button.setAttribute("aria-expanded", String(isOpen));
    if (isOpen) picker.querySelector(".phone-country-search")?.focus();
    document.querySelectorAll(".phone-country-picker.open").forEach((otherPicker) => {
      if (otherPicker !== picker) {
        otherPicker.classList.remove("open");
        otherPicker.querySelector(".phone-country-button")?.setAttribute("aria-expanded", "false");
      }
    });
  });
});
document.addEventListener("click", () => {
  document.querySelectorAll(".phone-country-picker.open").forEach((picker) => {
    picker.classList.remove("open");
    picker.querySelector(".phone-country-button")?.setAttribute("aria-expanded", "false");
  });
});
document.querySelectorAll("[data-list-form]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = form.querySelector("input");
    if (!input) return;
    addSettingItem(form.dataset.listForm, input.value);
    input.value = "";
    input.focus();
  });
});
document.querySelectorAll("[data-settings-page]").forEach((item) => {
  const openSettingsPage = () => {
    const page = activateTab(item.dataset.settingsPage);
    history.replaceState(null, "", `#${page}`);
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
document.querySelectorAll("[data-settings-back]").forEach((button) => {
  button.addEventListener("click", () => {
    activateTab("cadastro-configuracoes");
    history.replaceState(null, "", "#cadastro-configuracoes");
  });
});
document.querySelectorAll("[data-settings-form]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const key = form.dataset.settingsForm;
    const input = form.querySelector("input");
    if (!input) return;
    addSettingItem(key, input.value);
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
    if (!row) return;
    const value = editButton.dataset.settingValue;
    row.innerHTML = `<input class="settings-list-edit-input" value="${escapeHtml(value)}" aria-label="Editar item"><div class="settings-list-actions"><button type="button" class="settings-list-save" data-save-setting="${escapeHtml(editButton.dataset.editSetting)}" data-setting-value="${escapeHtml(value)}">Salvar</button><button type="button" class="settings-list-cancel">Cancelar</button></div>`;
    row.querySelector("input")?.focus();
    row.querySelector("input")?.select();
  });
});
document.querySelectorAll(".settings-list").forEach((list) => {
  list.addEventListener("click", (event) => {
    const saveButton = event.target.closest("[data-save-setting]");
    if (saveButton) {
      const input = saveButton.closest(".settings-list-row")?.querySelector("input");
      if (input) editSettingItem(saveButton.dataset.saveSetting, saveButton.dataset.settingValue, input.value);
      return;
    }
    if (event.target.closest(".settings-list-cancel")) refreshSettingsLists();
  });
});
refreshSettingsLists();
setupEmployeeFilters();
setupEmployeeListFilters();
// preencher o formulário antes de montar o seletor mantém os dois apontando para a mesma pessoa
fillEmployeeForm(employees[0]);
refreshEmployeePicker();
renderEmployeeList();
refreshDocumentsEmployeePicker();
refreshVacationEmployees();
renderVacations();
const requestedInitialTab = location.hash.replace("#", "");
// hash desconhecido não pode mais esconder todos os painéis e deixar a tela em branco
const initialTab = resolveHashTab(location.hash);
if (initialTab !== requestedInitialTab) history.replaceState(null, "", `#${initialTab}`);
activateTab(initialTab);
