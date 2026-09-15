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

let candidates = JSON.parse(localStorage.getItem("candidates")) || initialCandidates;
const initialEmployees = [{
  id: 1, name: "Exemplo de colaborador", cpf: "", birth: "", email: "", phone: "", marital: "", birthplace: "", education: "",
  role: "Analista de Departamento Pessoal", department: "Recursos Humanos", manager: "Gestor responsável", level: "Pleno",
  admission: "", contract: "CLT", salary: "R$ 0,00", benefits: "", status: "Ativo",
  documents: [], documentLibrary: [], vacationPeriods: [], movements: [], trainings: [], feedbacks: [], medical: []
}];
let employees = (JSON.parse(localStorage.getItem("employees")) || initialEmployees)
  .filter((employee) => employee.name !== "Novo colaborador");
localStorage.setItem("employees", JSON.stringify(employees));
const initialSettingsLists = {
  departments: ["Recursos Humanos"],
  roles: ["Analista de Departamento Pessoal"],
  managers: ["Gestor responsável"]
};
let settingsLists = JSON.parse(localStorage.getItem("settingsLists")) || initialSettingsLists;
Object.keys(initialSettingsLists).forEach((key) => {
  if (!Array.isArray(settingsLists[key])) settingsLists[key] = initialSettingsLists[key];
});
employees.forEach((employee) => {
  if (!employee.level && employee.unit) employee.level = employee.unit;
  if (!Array.isArray(employee.documentLibrary)) employee.documentLibrary = [];
  if (!Array.isArray(employee.vacationPeriods)) employee.vacationPeriods = [];
});
const $ = (selector) => document.querySelector(selector);
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
    $(`#${datalistId}`).innerHTML = settingsLists[key].map((value) => `<option value="${escapeHtml(value)}"></option>`).join("");
    const list = $(`#${key}-list`);
    list.innerHTML = settingsLists[key].length
      ? settingsLists[key].map((value) => `<div class="settings-list-row"><span>${escapeHtml(value)}</span><div class="settings-list-actions"><button type="button" class="settings-list-edit" data-edit-setting="${key}" data-setting-value="${escapeHtml(value)}">Editar</button><button type="button" class="settings-list-remove" data-remove-setting="${key}" data-setting-value="${escapeHtml(value)}">Remover</button></div></div>`).join("")
      : `<div class="settings-list-empty">Nenhum item cadastrado.</div>`;
  });
}

function addSettingItem(key, value) {
  const normalized = value.trim();
  if (!normalized) return;
  if (!settingsLists[key].some((item) => item.toLocaleLowerCase("pt-BR") === normalized.toLocaleLowerCase("pt-BR"))) {
    settingsLists[key].push(normalized);
    settingsLists[key].sort((a, b) => a.localeCompare(b, "pt-BR"));
    localStorage.setItem("settingsLists", JSON.stringify(settingsLists));
    refreshSettingsLists();
  }
}

function removeSettingItem(key, value) {
  settingsLists[key] = settingsLists[key].filter((item) => item !== value);
  localStorage.setItem("settingsLists", JSON.stringify(settingsLists));
  refreshSettingsLists();
}

function editSettingItem(key, previousValue, nextValue) {
  const normalized = nextValue.trim();
  if (!normalized) return;
  const duplicate = settingsLists[key].some((item) => item !== previousValue && item.toLocaleLowerCase("pt-BR") === normalized.toLocaleLowerCase("pt-BR"));
  if (duplicate) return;
  const index = settingsLists[key].indexOf(previousValue);
  if (index === -1) return;
  settingsLists[key][index] = normalized;
  settingsLists[key].sort((a, b) => a.localeCompare(b, "pt-BR"));
  localStorage.setItem("settingsLists", JSON.stringify(settingsLists));
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

function activateTab(tabName, subtabName = "") {
  const showDocuments = tabName === "dossie";
  const showSettingsEntry = ["novo-departamento", "novo-cargo", "novo-superior"].includes(tabName);
  document.body.classList.toggle("dossier-view", tabName === "dossie");
  document.body.classList.toggle("employee-list-view", tabName === "colaboradores");
  document.body.classList.toggle("settings-entry-view", showSettingsEntry);
  document.querySelectorAll(".nav-item[data-tab]").forEach((item) => item.classList.toggle("active", item.dataset.tab === tabName && (item.dataset.subtab || "") === subtabName));
  document.querySelectorAll(".tab-panel").forEach((panel) => panel.classList.toggle("hidden", panel.id !== tabName));
  $("#documentos").classList.toggle("hidden", !showDocuments);
  if (tabName === "dossie" || tabName === "colaboradores") window.scrollTo(0, 0);
}

function vacationRecords() {
  return employees.flatMap((employee) => (employee.vacationPeriods || []).map((period) => ({ ...period, employeeId: employee.id, employeeName: employee.name })));
}

function daysUntil(date) {
  return Math.ceil((new Date(`${date}T23:59:59`) - new Date()) / 86400000);
}

function renderVacations() {
  const query = $("#vacation-search").value.toLowerCase().trim();
  const status = $("#vacation-status-filter").value;
  const month = $("#vacation-month-filter").value;
  const records = vacationRecords().filter((record) => (!query || record.employeeName.toLowerCase().includes(query)) && (!status || record.status === status));
  const alerts = records.filter((record) => {
    const days = daysUntil(record.concessionDeadline);
    return record.status !== "Concluída" && days <= 60;
  }).sort((a, b) => a.concessionDeadline.localeCompare(b.concessionDeadline));
  const scheduled = records.filter((record) => !month || record.vacationStart.startsWith(month)).sort((a, b) => a.vacationStart.localeCompare(b.vacationStart));
  $("#vacation-total").textContent = records.length;
  $("#vacation-alert-count").textContent = alerts.length;
  $("#vacation-scheduled-count").textContent = scheduled.length;
  $("#vacation-alerts").innerHTML = alerts.length ? alerts.map((record) => {
    const days = daysUntil(record.concessionDeadline);
    const label = days < 0 ? `Vencido há ${Math.abs(days)} dia(s)` : `Vence em ${days} dia(s)`;
    return `<div class="pending-item vacation-alert"><div><strong>${escapeHtml(record.employeeName)}</strong><span>Concessivo até ${formatDate(record.concessionDeadline)}</span></div><b>${label}</b></div>`;
  }).join("") : `<div class="record-empty">Nenhum período próximo do vencimento.</div>`;
  $("#vacation-calendar-title").textContent = month ? `Férias em ${formatMonth(month)}` : "Férias programadas";
  $("#vacation-calendar").innerHTML = scheduled.length ? scheduled.map((record) => `<div class="calendar-event"><span class="calendar-day">${formatDate(record.vacationStart, true)}</span><div><strong>${escapeHtml(record.employeeName)}</strong><span>${formatDate(record.vacationStart)} a ${formatDate(record.vacationEnd)} · ${escapeHtml(record.status)}</span></div></div>`).join("") : `<div class="record-empty">Nenhuma férias programada para este período.</div>`;
  $("#vacation-list").innerHTML = records.length ? records.map((record) => `<div class="record-row"><div><strong>${escapeHtml(record.employeeName)} · ${escapeHtml(record.status)}</strong><span>Aquisitivo: ${formatDate(record.acquisitionStart)} a ${formatDate(record.acquisitionEnd)} · Concessivo até ${formatDate(record.concessionDeadline)} · Férias: ${formatDate(record.vacationStart)} a ${formatDate(record.vacationEnd)}</span></div><button type="button" class="remove-record" data-remove-vacation="${record.employeeId}:${record.id}">Remover</button></div>`).join("") : `<div class="record-empty">Nenhum período de férias cadastrado.</div>`;
}

function formatDate(value, short = false) {
  if (!value) return "Sem data";
  return new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR", short ? { day: "2-digit", month: "short" } : undefined);
}

function formatMonth(value) {
  return new Date(`${value}-01T12:00:00`).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

function refreshVacationEmployees() {
  $("#vacation-employee").innerHTML = employees.map((employee) => `<option value="${employee.id}">${escapeHtml(employee.name)}</option>`).join("");
}

document.querySelectorAll(".nav-item[data-tab]").forEach((item) => {
  item.addEventListener("click", (event) => {
    event.preventDefault();
    activateTab(item.dataset.tab, item.dataset.subtab || "");
    history.replaceState(null, "", `#${item.dataset.subtab ? "dossie" : item.dataset.tab}`);
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
  if (status === "Aguardando") return "waiting";
  if (status === "Contratado" || status.includes("Aprovado")) return "approved";
  if (status.includes("Reprovado")) return "rejected";
  return "hired";
}

function setupFilters() {
  const addOptions = (element, values, firstOption) => {
    element.innerHTML = `<option value="">${firstOption}</option>` + values.map((value) => `<option>${value}</option>`).join("");
  };
  addOptions($("#status-filter"), statuses, "Todos os status");
  addOptions($("#job-filter"), uniqueValues("job"), "Todas as vagas");
  addOptions($("#source-filter"), sources, "Todas as origens");
  addOptions($("#dashboard-status-filter"), statuses, "Todos os status");
  addOptions($("#dashboard-job-filter"), uniqueValues("job"), "Todas as vagas");
  addOptions($("#dashboard-source-filter"), sources, "Todas as origens");
  addOptions($("#status"), statuses, "Selecione o status");
  addOptions($("#source"), sources, "Selecione a origem");
  $("#jobs").innerHTML = uniqueValues("job").map((job) => `<option value="${job}">`).join("");
}

function renderDashboard() {
  const dashboardCandidates = getFilteredDashboardCandidates();
  const total = dashboardCandidates.length;
  const waiting = dashboardCandidates.filter((candidate) => candidate.status === "Aguardando").length;
  const approved = dashboardCandidates.filter((candidate) => candidate.status.includes("Aprovado")).length;
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
    [`${activeEmployees} colaborador(es)`, "com status ativo", "dossie"],
    [`${documentsPending} colaborador(es)`, "sem documentos na biblioteca", "documentos"]
  ].map(([value, label, tab]) => `<button type="button" class="pending-item" data-home-tab="${tab}"><strong>${value}</strong><span>${label}</span></button>`).join("");
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
    <td><div class="candidate-name">${candidate.name}</div><div class="candidate-phone">${candidate.phone || "Telefone não informado"}</div></td>
    <td>${candidate.job}</td>
    <td>${candidate.source}</td>
    <td>${candidate.owner || "A definir"}</td>
    <td><span class="badge ${statusClass(candidate.status)}">${candidate.status}</span></td>
    <td>${candidate.lastContact || "-"}</td>
    <td><button class="row-action" data-edit="${candidate.id}">Editar</button></td>
  </tr>`).join("");
  $("#empty-state").classList.toggle("hidden", filtered.length > 0);
}

function render() {
  renderDashboard();
  renderTable();
  localStorage.setItem("candidates", JSON.stringify(candidates));
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

if ($("#open-form")) $("#open-form").addEventListener("click", () => openCandidate());
$("#close-form").addEventListener("click", () => $("#candidate-dialog").close());
$("#cancel-form").addEventListener("click", () => $("#candidate-dialog").close());
$("#candidate-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const id = Number($("#candidate-id").value);
  const candidate = { id: id || Date.now(), name: $("#name").value.trim(), phone: $("#phone").value.trim(), job: $("#job").value.trim(), source: $("#source").value, owner: $("#owner").value.trim() || "A definir", status: $("#status").value, experience: $("#experience").value, salary: $("#salary").value.trim() || "-", lastContact: new Date().toLocaleDateString("pt-BR"), notes: $("#notes").value.trim() };
  candidates = id ? candidates.map((item) => item.id === id ? candidate : item) : [candidate, ...candidates];
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
  history.replaceState(null, "", "#dashboard");
});
document.querySelectorAll("[data-home-tab]").forEach((button) => {
  button.addEventListener("click", () => {
    const tab = button.dataset.homeTab;
    activateTab(tab === "documentos" ? "dossie" : tab);
    history.replaceState(null, "", `#${tab === "documentos" ? "dossie" : tab}`);
    if (tab === "documentos") $("#documentos").scrollIntoView({ behavior: "smooth", block: "start" });
  });
});
$("#export-report").addEventListener("click", () => {
  const headers = ["Nome", "Telefone", "Vaga", "Origem", "Responsável", "Status", "Último contato"];
  const rows = candidates.map((candidate) => [candidate.name, candidate.phone, candidate.job, candidate.source, candidate.owner, candidate.status, candidate.lastContact]);
  const csv = [headers, ...rows].map((row) => row.map((value) => `"${String(value || "").replaceAll('"', '""')}"`).join(";")).join("\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" }));
  link.download = "relatorio-candidatos.csv";
  link.click();
  URL.revokeObjectURL(link.href);
});
$("#clear-data").addEventListener("click", () => {
  candidates = [...initialCandidates];
  setupFilters();
  render();
  activateTab("dashboard");
});

function currentEmployee() {
  return employees.find((employee) => employee.id === Number($("#employee-id").value)) || employees[0];
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[character]));
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

function renderDocuments() {
  const employee = employees.find((item) => item.id === Number($("#documents-employee-picker").value)) || employees[0];
  if (!employee) return;
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
        <div class="document-card-meta">${escapeHtml(document.category)} · ${document.versions.length} versão(ões) · Atualizado em ${documentDate(latest.createdAt)} · ${formatFileSize(latest.size)}</div>
        ${document.notes ? `<div class="document-card-notes">${escapeHtml(document.notes)}</div>` : ""}
      </div>
      <div class="document-card-actions">
        <button type="button" class="document-action" data-document-action="download" data-document-id="${document.id}">Baixar</button>
        <button type="button" class="document-action" data-document-action="version" data-document-id="${document.id}">Nova versão</button>
        <button type="button" class="document-action" data-document-action="history" data-document-id="${document.id}">Histórico</button>
        <button type="button" class="document-action danger" data-document-action="remove" data-document-id="${document.id}">Remover</button>
      </div>
    </div>`;
  }).join("") : `<div class="record-empty">Nenhum documento encontrado para este colaborador.</div>`;
}

function refreshDocumentFilters() {
  const employee = employees.find((item) => item.id === Number($("#documents-employee-picker").value)) || employees[0];
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
    const version = { id: Date.now(), name: file.name, size: file.size, type: file.type || "application/octet-stream", data: reader.result, createdAt: new Date().toISOString() };
    const employee = employees.find((item) => item.id === Number($("#documents-employee-picker").value)) || employees[0];
    if (!employee.documentLibrary) employee.documentLibrary = [];
    if (document) {
      document.versions.push(version);
      document.notes = $("#document-notes").value.trim();
    } else {
      employee.documentLibrary.unshift({ id: Date.now(), title: $("#document-title").value.trim(), category: $("#document-category").value, notes: $("#document-notes").value.trim(), versions: [version] });
    }
    localStorage.setItem("employees", JSON.stringify(employees));
    refreshDocumentFilters();
    $("#document-dialog").close();
  });
  reader.readAsDataURL(file);
}

function fillEmployeeForm(employee) {
  if (!employee) return;
  $("#dossie").classList.add("dossier-editing");
  $("#employee-id").value = employee.id;
  const fields = ["name", "cpf", "birth", "gender", "salutation", "ethnicity", "marital", "education", "course", "nationality", "birthplace", "role", "department", "manager", "level", "admission", "contract", "salary", "benefits", "status", "shift", "currency", "probation", "registration", "hierarchy", "contractDate", "contractDuration", "contractExpiration", "addressCountry", "addressCep", "addressStreet", "addressNumber", "addressNeighborhood", "addressCity", "addressState", "addressComplement"];
  fields.forEach((field) => { $(`#employee-${field}`).value = employee[field] || ""; });
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
  $("#employee-currency").value = "BRL";
  $("#employee-status").value = "Ativo";
  renderEmployeeRecords({ documents: [], movements: [], trainings: [], feedbacks: [], medical: [] });
}

function renderEmployeeRecords(employee) {
  const list = (field, empty, renderer) => {
    const records = employee[field] || [];
    $(`#${field === "medical" ? "medical" : field}-list`).innerHTML = records.length ? records.map((record, index) => renderer(record, index)).join("") : `<div class="record-empty">${empty}</div>`;
  };
  list("documents", "Nenhum documento cadastrado.", (record, index) => `<div class="record-row"><div><strong>${record.name}</strong><span>${record.type || "Documento"} · ${record.date || "Sem data"}</span></div><button type="button" class="remove-record" data-record="documents" data-index="${index}">Remover</button></div>`);
  list("movements", "Nenhuma movimentação cadastrada.", (record, index) => `<div class="record-row"><div><strong>${record.date || "Sem data"} · ${record.type}</strong><span>${record.description || ""} ${record.role ? `· ${record.role}` : ""}</span></div><button type="button" class="remove-record" data-record="movements" data-index="${index}">Remover</button></div>`);
  list("trainings", "Nenhum treinamento cadastrado.", (record, index) => `<div class="record-row"><div><strong>${record.name}</strong><span>${record.date || "Sem data"} · ${record.hours || "Carga não informada"}</span></div><button type="button" class="remove-record" data-record="trainings" data-index="${index}">Remover</button></div>`);
  list("feedbacks", "Nenhum registro cadastrado.", (record, index) => `<div class="record-row"><div><strong>${record.type} · ${record.date || "Sem data"}</strong><span>${record.description || ""}</span></div><button type="button" class="remove-record" data-record="feedbacks" data-index="${index}">Remover</button></div>`);
  list("medical", "Nenhum atestado cadastrado.", (record, index) => `<div class="record-row"><div><strong>${record.date || "Sem data"} · ${record.days || 0} dia(s)${record.partial ? " · Parcial" : ""}</strong><span>CID: ${record.cid || "Não informado"} · Médico: ${record.doctor || "Não informado"}</span></div><button type="button" class="remove-record" data-record="medical" data-index="${index}">Remover</button></div>`);
}

function refreshEmployeePicker() {
  const query = $("#employee-search").value.toLowerCase().trim();
  const status = $("#employee-status-filter").value;
  const department = $("#employee-department-filter").value;
  const filtered = employees.filter((employee) => {
    const values = [employee.name, employee.cpf, employee.email, employee.role, employee.department, employee.level, employee.unit];
    return (!query || values.some((value) => String(value || "").toLowerCase().includes(query)))
      && (!status || employee.status === status)
      && (!department || employee.department === department);
  });
  $("#employee-picker").innerHTML = filtered.map((employee) => `<option value="${employee.id}">${escapeHtml(employee.name)}</option>`).join("");
  if (!filtered.length) {
    $("#employee-picker").innerHTML = `<option value="">Nenhum colaborador encontrado</option>`;
  }
  $("#employee-picker").value = $("#employee-id").value || "";
}

function setupEmployeeFilters() {
  const departments = [...new Set(employees.map((employee) => employee.department).filter(Boolean))].sort();
  $("#employee-status-filter").innerHTML = `<option value="">Todos os status</option>${["Ativo", "Férias", "Afastado", "Desligado"].map((status) => `<option>${status}</option>`).join("")}`;
  $("#employee-department-filter").innerHTML = `<option value="">Todos os departamentos</option>${departments.map((department) => `<option>${escapeHtml(department)}</option>`).join("")}`;
}

function saveEmployee(onSaved) {
  const id = Number($("#employee-id").value);
  const employee = employees.find((item) => item.id === id) || { id, documents: [], documentLibrary: [], vacationPeriods: [], movements: [], trainings: [], feedbacks: [], medical: [] };
  ["name", "cpf", "birth", "gender", "salutation", "ethnicity", "marital", "education", "course", "nationality", "birthplace", "role", "department", "manager", "level", "admission", "contract", "salary", "benefits", "status", "shift", "currency", "probation", "registration", "hierarchy", "contractDate", "contractDuration", "contractExpiration", "addressCountry", "addressCep", "addressStreet", "addressNumber", "addressNeighborhood", "addressCity", "addressState", "addressComplement"].forEach((field) => { employee[field] = $(`#employee-${field}`).value.trim(); });
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
  persistEmployee(employee, id, onSaved);
}

function persistEmployee(employee, id, onSaved) {
  delete employee.unit;
  delete employee.photo;
  employees = employees.some((item) => item.id === id) ? employees.map((item) => item.id === id ? employee : item) : [...employees, employee];
  localStorage.setItem("employees", JSON.stringify(employees));
  refreshEmployeePicker();
  refreshDocumentsEmployeePicker();
  setupEmployeeFilters();
  setupEmployeeListFilters();
  renderEmployeeList();
  resetEmployeeForm();
  $("#employee-picker").value = "";
  if (onSaved) onSaved();
}

$("#new-employee").addEventListener("click", () => {
  resetEmployeeForm();
  activateTab("dossie");
  history.replaceState(null, "", "#dossie");
  $("#employee-name").focus();
});

function renderEmployeeList() {
  const query = $("#employee-list-search").value.toLowerCase().trim();
  const status = $("#employee-list-status-filter").value;
  const department = $("#employee-list-department-filter").value;
  const filtered = employees.filter((employee) => {
    const values = [employee.name, employee.cpf, employee.role, employee.department, employee.level, employee.unit, employee.email];
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
      <div class="employee-list-cell" data-label="Nível"><strong>${escapeHtml(employee.level || employee.unit || "Não informado")}</strong></div>
      <div class="employee-list-cell" data-label="Status"><span class="employee-list-status">${escapeHtml(employee.status || "Ativo")}</span></div>
    </div>`;
  }).join("") : `<div class="record-empty">Nenhum colaborador encontrado.</div>`;
}

function setupEmployeeListFilters() {
  const departments = [...new Set(employees.map((employee) => employee.department).filter(Boolean))].sort();
  $("#employee-list-status-filter").innerHTML = `<option value="">Todos os status</option>${["Ativo", "Férias", "Afastado", "Desligado"].map((status) => `<option>${status}</option>`).join("")}`;
  $("#employee-list-department-filter").innerHTML = `<option value="">Todos os departamentos</option>${departments.map((department) => `<option>${escapeHtml(department)}</option>`).join("")}`;
}

$("#new-employee-from-list").addEventListener("click", () => {
  resetEmployeeForm();
  activateTab("dossie");
  history.replaceState(null, "", "#dossie");
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
  history.replaceState(null, "", "#dossie");
});
$("#employee-list").addEventListener("keydown", (event) => {
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
  $("#record-title").textContent = config.title;
  $("#record-fields").innerHTML = config.fields.map(([id, label, type = "text"]) => type === "checkbox" ? `<label class="check-field"><input id="${id}" type="checkbox">${label}</label>` : `<label>${label}<input id="${id}" type="${type}"></label>`).join("");
  $("#record-dialog").dataset.field = field;
  $("#record-dialog").showModal();
}

$("#record-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const field = $("#record-dialog").dataset.field;
  const employee = currentEmployee();
  if (!employee[field]) employee[field] = [];
  const value = (id) => $(`#${id}`)?.value || "";
  const record = field === "documents" ? { name: value("record-name"), type: value("record-type"), date: value("record-date") } :
    field === "movements" ? { type: value("record-type"), description: value("record-description"), date: value("record-date"), role: "" } :
    field === "trainings" ? { name: value("record-name"), hours: value("record-hours"), date: value("record-date") } :
    field === "feedbacks" ? { type: value("record-type"), description: value("record-description"), date: value("record-date") } :
    { date: value("record-date"), cid: value("record-cid"), days: value("record-days"), doctor: value("record-doctor"), partial: $("#record-partial").checked };
  employee[field].push(record);
  saveEmployee();
  renderEmployeeRecords(employee);
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
  history.replaceState(null, "", "#colaboradores");
});
["documents", "movements", "trainings", "feedbacks", "medical"].forEach((field) => $(`#add-${field === "medical" ? "medical" : field.slice(0, -1)}`).addEventListener("click", () => addEmployeeRecord(field)));
$("#dossie").addEventListener("click", (event) => {
  if (!event.target.classList.contains("remove-record")) return;
  const employee = currentEmployee();
  employee[event.target.dataset.record].splice(Number(event.target.dataset.index), 1);
  saveEmployee();
  renderEmployeeRecords(employee);
});

function refreshDocumentsEmployeePicker() {
  const query = $("#documents-employee-search").value.toLowerCase().trim();
  const filtered = employees.filter((employee) => [employee.name, employee.role, employee.department, employee.level, employee.unit].some((value) => String(value || "").toLowerCase().includes(query)));
  $("#documents-employee-picker").innerHTML = filtered.length
    ? filtered.map((employee) => `<option value="${employee.id}">${escapeHtml(employee.name)}</option>`).join("")
    : `<option value="">Nenhum colaborador encontrado</option>`;
  $("#documents-employee-picker").value = $("#employee-id").value || employees[0]?.id || "";
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
  const documentId = Number($("#document-dialog").dataset.documentId);
  const employee = employees.find((item) => item.id === Number($("#documents-employee-picker").value)) || employees[0];
  const document = (employee.documentLibrary || []).find((item) => item.id === documentId);
  saveDocumentFile(file, document);
});
$("#document-list").addEventListener("click", (event) => {
  const action = event.target.dataset.documentAction;
  if (!action) return;
  const employee = employees.find((item) => item.id === Number($("#documents-employee-picker").value)) || employees[0];
  const selectedDocument = (employee.documentLibrary || []).find((item) => item.id === Number(event.target.dataset.documentId));
  if (!selectedDocument) return;
  if (action === "version") openDocumentDialog(selectedDocument);
  if (action === "remove") {
    employee.documentLibrary = employee.documentLibrary.filter((item) => item.id !== selectedDocument.id);
    localStorage.setItem("employees", JSON.stringify(employees));
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
    $("#version-list").innerHTML = selectedDocument.versions.slice().reverse().map((version, index) => `<div class="version-row"><div><strong>Versão ${selectedDocument.versions.length - index} · ${escapeHtml(version.name)}</strong><span>${documentDate(version.createdAt)} · ${formatFileSize(version.size)}</span></div><button type="button" class="document-action" data-version-data="${version.data}" data-version-name="${escapeHtml(version.name)}">Baixar</button></div>`).join("");
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
  if (!employee.vacationPeriods) employee.vacationPeriods = [];
  employee.vacationPeriods.push({
    id: Date.now(),
    status: $("#vacation-status").value,
    acquisitionStart: $("#acquisition-start").value,
    acquisitionEnd: $("#acquisition-end").value,
    concessionDeadline: $("#concession-deadline").value,
    vacationStart: $("#vacation-start").value,
    vacationEnd: $("#vacation-end").value,
    notes: $("#vacation-notes").value.trim()
  });
  localStorage.setItem("employees", JSON.stringify(employees));
  renderVacations();
  $("#vacation-dialog").close();
});
$("#vacation-list").addEventListener("click", (event) => {
  const key = event.target.dataset.removeVacation;
  if (!key) return;
  const [employeeId, periodId] = key.split(":").map(Number);
  const employee = employees.find((item) => item.id === employeeId);
  if (!employee) return;
  employee.vacationPeriods = employee.vacationPeriods.filter((period) => period.id !== periodId);
  localStorage.setItem("employees", JSON.stringify(employees));
  renderVacations();
});

setupFilters();
render();
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
    addSettingItem(form.dataset.listForm, input.value);
    input.value = "";
    input.focus();
  });
});
document.querySelectorAll("[data-settings-page]").forEach((item) => {
  const openSettingsPage = () => {
    const page = item.dataset.settingsPage;
    activateTab(page);
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
    const value = editButton.dataset.settingValue;
    row.innerHTML = `<input class="settings-list-edit-input" value="${escapeHtml(value)}" aria-label="Editar item"><div class="settings-list-actions"><button type="button" class="settings-list-save" data-save-setting="${editButton.dataset.editSetting}" data-setting-value="${escapeHtml(value)}">Salvar</button><button type="button" class="settings-list-cancel">Cancelar</button></div>`;
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
refreshSettingsLists();
setupEmployeeFilters();
setupEmployeeListFilters();
refreshEmployeePicker();
fillEmployeeForm(employees[0]);
renderEmployeeList();
refreshDocumentsEmployeePicker();
refreshVacationEmployees();
renderVacations();
const initialTab = location.hash.replace("#", "") || "dashboard";
const visibleInitialTab = initialTab === "dossie" ? "colaboradores" : initialTab;
if (visibleInitialTab !== initialTab) history.replaceState(null, "", `#${visibleInitialTab}`);
activateTab(visibleInitialTab);
