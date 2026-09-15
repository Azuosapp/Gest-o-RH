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
  role: "Analista de Departamento Pessoal", department: "Recursos Humanos", manager: "Gestor responsável", unit: "Matriz",
  admission: "", contract: "CLT", salary: "R$ 0,00", benefits: "", status: "Ativo",
  documents: [], documentLibrary: [], movements: [], trainings: [], feedbacks: [], medical: []
}];
let employees = JSON.parse(localStorage.getItem("employees")) || initialEmployees;
employees.forEach((employee) => {
  if (!Array.isArray(employee.documentLibrary)) employee.documentLibrary = [];
});
const $ = (selector) => document.querySelector(selector);

function activateTab(tabName, subtabName = "") {
  const showDocuments = tabName === "dossie";
  document.querySelectorAll(".nav-item[data-tab]").forEach((item) => item.classList.toggle("active", item.dataset.tab === tabName && (item.dataset.subtab || "") === subtabName));
  document.querySelectorAll(".tab-panel").forEach((panel) => panel.classList.toggle("hidden", panel.id !== tabName));
  $("#documentos").classList.toggle("hidden", !showDocuments);
}

document.querySelectorAll(".nav-item[data-tab]").forEach((item) => {
  item.addEventListener("click", (event) => {
    event.preventDefault();
    activateTab(item.dataset.tab, item.dataset.subtab || "");
    history.replaceState(null, "", `#${item.dataset.subtab ? "dossie" : item.dataset.tab}`);
    if (item.dataset.subtab) $("#documentos").scrollIntoView({ behavior: "smooth", block: "start" });
  });
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
  $("#employee-id").value = employee.id;
  const fields = ["name", "cpf", "birth", "email", "phone", "marital", "birthplace", "education", "role", "department", "manager", "unit", "admission", "contract", "salary", "benefits", "status"];
  fields.forEach((field) => { $(`#employee-${field}`).value = employee[field] || ""; });
  renderEmployeeRecords(employee);
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
    const values = [employee.name, employee.cpf, employee.email, employee.role, employee.department, employee.unit];
    return (!query || values.some((value) => String(value || "").toLowerCase().includes(query)))
      && (!status || employee.status === status)
      && (!department || employee.department === department);
  });
  $("#employee-picker").innerHTML = filtered.map((employee) => `<option value="${employee.id}">${escapeHtml(employee.name)}</option>`).join("");
  if (!filtered.length) {
    $("#employee-picker").innerHTML = `<option value="">Nenhum colaborador encontrado</option>`;
  }
  $("#employee-picker").value = $("#employee-id").value || employees[0].id;
}

function setupEmployeeFilters() {
  const departments = [...new Set(employees.map((employee) => employee.department).filter(Boolean))].sort();
  $("#employee-status-filter").innerHTML = `<option value="">Todos os status</option>${["Ativo", "Férias", "Afastado", "Desligado"].map((status) => `<option>${status}</option>`).join("")}`;
  $("#employee-department-filter").innerHTML = `<option value="">Todos os departamentos</option>${departments.map((department) => `<option>${escapeHtml(department)}</option>`).join("")}`;
}

function saveEmployee() {
  const id = Number($("#employee-id").value);
  const employee = employees.find((item) => item.id === id) || { id, documents: [], documentLibrary: [], movements: [], trainings: [], feedbacks: [], medical: [] };
  ["name", "cpf", "birth", "email", "phone", "marital", "birthplace", "education", "role", "department", "manager", "unit", "admission", "contract", "salary", "benefits", "status"].forEach((field) => { employee[field] = $(`#employee-${field}`).value.trim(); });
  employees = employees.some((item) => item.id === id) ? employees.map((item) => item.id === id ? employee : item) : [...employees, employee];
  localStorage.setItem("employees", JSON.stringify(employees));
  refreshEmployeePicker();
  refreshDocumentsEmployeePicker();
}

$("#new-employee").addEventListener("click", () => {
  const employee = { id: Date.now(), name: "Novo colaborador", documents: [], documentLibrary: [], movements: [], trainings: [], feedbacks: [], medical: [], contract: "CLT", status: "Ativo" };
  employees.push(employee);
  localStorage.setItem("employees", JSON.stringify(employees));
  refreshEmployeePicker();
  refreshDocumentsEmployeePicker();
  fillEmployeeForm(employee);
  $("#employee-name").focus();
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
["#employee-search", "#employee-status-filter", "#employee-department-filter"].forEach((selector) => $(selector).addEventListener("input", refreshEmployeePicker));
$("#save-employee").addEventListener("click", (event) => { event.preventDefault(); saveEmployee(); alert("Cadastro do colaborador salvo."); });
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
  const filtered = employees.filter((employee) => [employee.name, employee.role, employee.department, employee.unit].some((value) => String(value || "").toLowerCase().includes(query)));
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

setupFilters();
render();
setupEmployeeFilters();
refreshEmployeePicker();
fillEmployeeForm(employees[0]);
refreshDocumentsEmployeePicker();
activateTab(location.hash.replace("#", "") || "dashboard");
