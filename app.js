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
  documents: [], movements: [], trainings: [], feedbacks: [], medical: []
}];
let employees = JSON.parse(localStorage.getItem("employees")) || initialEmployees;
const $ = (selector) => document.querySelector(selector);

function activateTab(tabName) {
  document.querySelectorAll(".nav-item[data-tab]").forEach((item) => item.classList.toggle("active", item.dataset.tab === tabName));
  document.querySelectorAll(".tab-panel").forEach((panel) => panel.classList.toggle("hidden", panel.id !== tabName));
}

document.querySelectorAll(".nav-item[data-tab]").forEach((item) => {
  item.addEventListener("click", (event) => {
    event.preventDefault();
    activateTab(item.dataset.tab);
    history.replaceState(null, "", `#${item.dataset.tab}`);
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
  addOptions($("#status"), statuses, "Selecione o status");
  addOptions($("#source"), sources, "Selecione a origem");
  $("#jobs").innerHTML = uniqueValues("job").map((job) => `<option value="${job}">`).join("");
}

function renderDashboard() {
  const total = candidates.length;
  const waiting = candidates.filter((candidate) => candidate.status === "Aguardando").length;
  const approved = candidates.filter((candidate) => candidate.status.includes("Aprovado")).length;
  const hired = candidates.filter((candidate) => candidate.status === "Contratado").length;
  $("#metrics").innerHTML = [
    ["Total de currículos", total, "Base cadastrada"],
    ["Aguardando triagem", waiting, "Ação pendente"],
    ["Em processo", approved, "Candidatos aprovados"],
    ["Contratados", hired, "Resultado final"]
  ].map(([label, value, note]) => `<div class="metric"><div class="metric-label">${label}</div><div class="metric-value">${value}</div><div class="metric-note">${note}</div></div>`).join("");

  const counts = statuses.map((status) => ({ status, count: candidates.filter((candidate) => candidate.status === status).length }));
  const max = Math.max(...counts.map((item) => item.count), 1);
  $("#funnel").innerHTML = counts.map(({ status, count }) => `<div class="funnel-row"><span>${status}</span><div class="funnel-bar"><div class="funnel-fill" style="width:${(count / max) * 100}%"></div></div><span class="funnel-count">${count}</span></div>`).join("");
  $("#funnel-total").textContent = `${total} candidatos`;

  const sourceCounts = sources.map((source) => ({ source, count: candidates.filter((candidate) => candidate.source === source).length })).filter((item) => item.count > 0).sort((a, b) => b.count - a.count);
  const sourceMax = Math.max(...sourceCounts.map((item) => item.count), 1);
  $("#sources").innerHTML = sourceCounts.length ? sourceCounts.map(({ source, count }) => `<div class="source-row"><span>${source}</span><div class="source-bar"><div class="source-fill" style="width:${(count / sourceMax) * 100}%"></div></div><strong>${count}</strong></div>`).join("") : `<span class="muted">Ainda não há origens cadastradas.</span>`;
}

function getFilteredCandidates() {
  const query = $("#search").value.toLowerCase().trim();
  const status = $("#status-filter").value;
  const job = $("#job-filter").value;
  const source = $("#source-filter").value;
  return candidates.filter((candidate) => {
    const matchesQuery = !query || [candidate.name, candidate.phone, candidate.job].some((value) => value.toLowerCase().includes(query));
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

$("#open-form").addEventListener("click", () => openCandidate());
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
$("#candidate-table").addEventListener("click", (event) => {
  const id = Number(event.target.dataset.edit);
  if (id) openCandidate(candidates.find((candidate) => candidate.id === id));
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
  $("#employee-picker").innerHTML = employees.map((employee) => `<option value="${employee.id}">${employee.name}</option>`).join("");
  $("#employee-picker").value = $("#employee-id").value || employees[0].id;
}

function saveEmployee() {
  const id = Number($("#employee-id").value);
  const employee = employees.find((item) => item.id === id) || { id, documents: [], movements: [], trainings: [], feedbacks: [], medical: [] };
  ["name", "cpf", "birth", "email", "phone", "marital", "birthplace", "education", "role", "department", "manager", "unit", "admission", "contract", "salary", "benefits", "status"].forEach((field) => { employee[field] = $(`#employee-${field}`).value.trim(); });
  employees = employees.some((item) => item.id === id) ? employees.map((item) => item.id === id ? employee : item) : [...employees, employee];
  localStorage.setItem("employees", JSON.stringify(employees));
  refreshEmployeePicker();
}

$("#new-employee").addEventListener("click", () => {
  const employee = { id: Date.now(), name: "Novo colaborador", documents: [], movements: [], trainings: [], feedbacks: [], medical: [], contract: "CLT", status: "Ativo" };
  employees.push(employee);
  localStorage.setItem("employees", JSON.stringify(employees));
  refreshEmployeePicker();
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
$("#save-employee").addEventListener("click", (event) => { event.preventDefault(); saveEmployee(); alert("Cadastro do colaborador salvo."); });
["documents", "movements", "trainings", "feedbacks", "medical"].forEach((field) => $(`#add-${field === "medical" ? "medical" : field.slice(0, -1)}`).addEventListener("click", () => addEmployeeRecord(field)));
$("#dossie").addEventListener("click", (event) => {
  if (!event.target.classList.contains("remove-record")) return;
  const employee = currentEmployee();
  employee[event.target.dataset.record].splice(Number(event.target.dataset.index), 1);
  saveEmployee();
  renderEmployeeRecords(employee);
});

setupFilters();
render();
refreshEmployeePicker();
fillEmployeeForm(employees[0]);
activateTab(location.hash.replace("#", "") || "dashboard");
