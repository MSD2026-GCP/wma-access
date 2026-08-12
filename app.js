// Mock Database Schema Initialization in LocalStorage
const DEFAULT_REQUESTS = [
  {
    id: "WMA-11",
    summary: "WMA-STORY-6 - Pencatatan Audit Log Kepatuhan",
    category_data: "Reguler",
    requester: { name: "Muhammad Akbar", email: "muhammad.akbar@metrodata.co.id" },
    business_justification: "Melakukan pencatatan log transaksi sistem secara otomatis ke tabel audit yang immutable demi keamanan dan memenuhi kriteria regulasi PDP.",
    duration_hours: 4,
    status: "Pending"
  },
  {
    id: "WMA-9",
    summary: "WMA-STORY-5 - Token Akses Sementara & Penarikan Akses Otomatis",
    category_data: "Sangat Sensitif",
    requester: { name: "Budi Santoso", email: "budi.santoso@metrodata.co.id" },
    business_justification: "Investigasi kebocoran token sesi pada environment production. Memerlukan penarikan log token akses mentah secara live.",
    duration_hours: 2,
    status: "Pending"
  },
  {
    id: "WMA-7",
    summary: "WMA-STORY-4 - Dashboard Persetujuan atau Penolakan oleh Approver",
    category_data: "Reguler",
    requester: { name: "Dewi Lestari", email: "dewi.lestari@metrodata.co.id" },
    business_justification: "Menampilkan visualisasi antarmuka persetujuan request secara terpusat untuk memproses antrean secara efisien.",
    duration_hours: 6,
    status: "Pending"
  },
  {
    id: "WMA-5",
    summary: "WMA-STORY-3 - Pengajuan Formulir Akses Data",
    category_data: "Reguler",
    requester: { name: "Andi Wijaya", email: "andi.wijaya@metrodata.co.id" },
    business_justification: "Validasi kelengkapan data alamat pengiriman pada pesanan #20912 demi mencegah kegagalan pengiriman logistik regional.",
    duration_hours: 8,
    status: "Approved"
  },
  {
    id: "WMA-3",
    summary: "WMA-STORY-2 - Penerapan Role-Based Access Control (RBAC)",
    category_data: "Sangat Sensitif",
    requester: { name: "Faisal Akbar", email: "faisal.akbar@metrodata.co.id" },
    business_justification: "Pengubahan hak akses role developer senior di database core. Butuh NIK dan otorisasi tertulis.",
    duration_hours: 1,
    status: "Rejected",
    reject_reason: "Justifikasi kurang spesifik, mohon sebutkan ID tiket keluhan pelanggan."
  }
];

const DEFAULT_AUDIT_LOGS = [
  { id: "LOG-001", timestamp: "2026-08-07T09:00:12Z", user_email: "faisal.akbar@metrodata.co.id", action: "LOGIN_SSO", category_data: "-", ip_address: "192.168.10.45", message: "User Faisal Akbar logged in successfully via Office 365 SSO." },
  { id: "LOG-002", timestamp: "2026-08-07T09:35:11Z", user_email: "muhammad.akbar@metrodata.co.id", action: "CREATE_REQUEST", category_data: "Reguler", ip_address: "192.168.10.99", message: "Created access request WMA-11 (Reguler data access)." },
  { id: "LOG-003", timestamp: "2026-08-07T09:38:56Z", user_email: "budi.santoso@metrodata.co.id", action: "CREATE_REQUEST", category_data: "Sangat Sensitif", ip_address: "192.168.12.110", message: "Created access request WMA-9 (Sangat Sensitif data access)." }
];

const CURRENT_USER = { name: "Faisal Akbar", email: "faisal.akbar@metrodata.co.id", role: "Approver" };

function initDB() {
  if (!localStorage.getItem("cdaras_requests")) localStorage.setItem("cdaras_requests", JSON.stringify(DEFAULT_REQUESTS));
  if (!localStorage.getItem("cdaras_audit_logs")) localStorage.setItem("cdaras_audit_logs", JSON.stringify(DEFAULT_AUDIT_LOGS));
}

function getRequests() { return JSON.parse(localStorage.getItem("cdaras_requests")); }
function getAuditLogs() { return JSON.parse(localStorage.getItem("cdaras_audit_logs")); }
function saveRequests(r) { localStorage.setItem("cdaras_requests", JSON.stringify(r)); }
function saveAuditLogs(l) { localStorage.setItem("cdaras_audit_logs", JSON.stringify(l)); }

function writeAuditLog(action, categoryData, message) {
  const logs = getAuditLogs();
  logs.push({ id: `LOG-00${logs.length + 1}`, timestamp: new Date().toISOString(), user_email: CURRENT_USER.email, action, category_data: categoryData, ip_address: "192.168.10.45", message });
  saveAuditLogs(logs);
  renderAuditLogs();
}

let currentFilter = "Pending";
let selectedRequestId = null;

const requestsListContainer = document.getElementById("requestsList");
const tabPending = document.getElementById("tabPending");
const tabAll = document.getElementById("tabAll");
const auditListContainer = document.getElementById("auditList");
const auditSection = document.getElementById("auditSection");
const auditToggle = document.getElementById("auditToggle");
const countPendingEl = document.getElementById("countPending");
const countApprovedEl = document.getElementById("countApproved");
const countRejectedEl = document.getElementById("countRejected");
const countTotalEl = document.getElementById("countTotal");
const detailsModal = document.getElementById("detailsModal");
const rejectModal = document.getElementById("rejectModal");
const rejectReasonInput = document.getElementById("rejectReasonInput");
const rejectErrorMsg = document.getElementById("rejectErrorMsg");
const rejectForm = document.getElementById("rejectForm");
const detailId = document.getElementById("detailId");
const detailSummary = document.getElementById("detailSummary");
const detailRequester = document.getElementById("detailRequester");
const detailCategory = document.getElementById("detailCategory");
const detailDuration = document.getElementById("detailDuration");
const detailJustification = document.getElementById("detailJustification");
const detailStatus = document.getElementById("detailStatus");
const detailReasonRow = document.getElementById("detailReasonRow");
const detailReasonText = document.getElementById("detailReasonText");
const detailActionButtons = document.getElementById("detailActionButtons");

tabPending.addEventListener("click", () => { currentFilter = "Pending"; tabPending.classList.add("active"); tabAll.classList.remove("active"); renderRequests(); });
tabAll.addEventListener("click", () => { currentFilter = "All"; tabAll.classList.add("active"); tabPending.classList.remove("active"); renderRequests(); });
auditToggle.addEventListener("click", () => { auditSection.classList.toggle("collapsed"); });

function updateMetrics() {
  const requests = getRequests();
  countPendingEl.textContent = requests.filter(r => r.status === "Pending").length;
  countApprovedEl.textContent = requests.filter(r => r.status === "Approved").length;
  countRejectedEl.textContent = requests.filter(r => r.status === "Rejected").length;
  countTotalEl.textContent = requests.length;
}

function renderRequests() {
  const requests = getRequests();
  requestsListContainer.innerHTML = "";

  const sorted = [...requests].sort((a, b) => {
    if (a.status === "Pending" && b.status !== "Pending") return -1;
    if (a.status !== "Pending" && b.status === "Pending") return 1;
    return b.id.localeCompare(a.id);
  });

  const filtered = sorted.filter(r => currentFilter === "Pending" ? r.status === "Pending" : true);

  if (filtered.length === 0) {
    requestsListContainer.innerHTML = `<div class="empty-state"><div class="empty-icon">🗂️</div><h3>Tidak ada pengajuan</h3><p>Semua antrean pengajuan akses data telah selesai diproses.</p></div>`;
    return;
  }

  filtered.forEach(req => {
    const card = document.createElement("div");
    card.className = "request-row-card";
    const isPending = req.status === "Pending";
    const catClass = req.category_data === "Sangat Sensitif" ? "sensitif" : "reguler";
    card.innerHTML = `
      <div class="col-requester"><span class="requester-name">${req.requester.name}</span><span class="requester-email">${req.requester.email}</span></div>
      <div class="col-justification" title="${req.business_justification}"><strong>${req.id}:</strong> ${req.business_justification}</div>
      <div><span class="badge-category ${catClass}">${req.category_data}</span></div>
      <div class="col-duration">${req.duration_hours} Jam</div>
      <div><span class="badge-status ${req.status.toLowerCase()}">${req.status}</span></div>
      <div class="action-buttons">
        <button class="btn btn-secondary" onclick="openDetailsModal('${req.id}')">Detail</button>
        ${isPending ? `<button class="btn btn-success" onclick="processApprove('${req.id}')">Setujui</button><button class="btn btn-danger-outline" onclick="openRejectModal('${req.id}')">Tolak</button>` : ''}
      </div>`;
    requestsListContainer.appendChild(card);
  });
}

function renderAuditLogs() {
  const logs = getAuditLogs();
  auditListContainer.innerHTML = "";
  [...logs].reverse().forEach(log => {
    const line = document.createElement("div");
    let cls = "log-default";
    if (log.action === "APPROVE") cls = "log-approve";
    if (log.action === "REJECT") cls = "log-reject";
    if (log.action === "LOGIN_SSO") cls = "log-login";
    line.className = `audit-log-line ${cls}`;
    line.innerHTML = `<span class="log-time">[${new Date(log.timestamp).toLocaleTimeString()}]</span><span class="log-ip">${log.ip_address}</span><span class="log-message"><strong>${log.action}</strong>: ${log.message} (User: ${log.user_email})</span>`;
    auditListContainer.appendChild(line);
  });
}

window.openDetailsModal = function(id) {
  const req = getRequests().find(r => r.id === id);
  if (!req) return;
  selectedRequestId = id;
  detailId.textContent = req.id;
  detailSummary.textContent = req.summary;
  detailRequester.textContent = `${req.requester.name} (${req.requester.email})`;
  detailCategory.className = `badge-category ${req.category_data === 'Sangat Sensitif' ? 'sensitif' : 'reguler'}`;
  detailCategory.textContent = req.category_data;
  detailDuration.textContent = `${req.duration_hours} Jam`;
  detailJustification.textContent = req.business_justification;
  detailStatus.className = `badge-status ${req.status.toLowerCase()}`;
  detailStatus.textContent = req.status;
  detailReasonRow.style.display = (req.status === "Rejected" && req.reject_reason) ? "flex" : "none";
  if (req.reject_reason) detailReasonText.textContent = req.reject_reason;
  detailActionButtons.style.display = req.status === "Pending" ? "flex" : "none";
  if (req.status === "Pending") detailActionButtons.innerHTML = `<button class="btn btn-success" onclick="processApprove('${req.id}'); detailsModal.close();">Setujui</button><button class="btn btn-danger-outline" onclick="openRejectModal('${req.id}'); detailsModal.close();">Tolak</button>`;
  detailsModal.showModal();
};

window.closeDetailsModal = () => detailsModal.close();

window.openRejectModal = function(id) {
  selectedRequestId = id;
  rejectReasonInput.value = "";
  rejectReasonInput.classList.remove("error");
  rejectErrorMsg.classList.remove("visible");
  rejectModal.showModal();
};

window.closeRejectModal = () => rejectModal.close();

window.processApprove = function(id) {
  const requests = getRequests();
  const idx = requests.findIndex(r => r.id === id);
  if (idx === -1) return;
  requests[idx].status = "Approved";
  saveRequests(requests);
  writeAuditLog("APPROVE", requests[idx].category_data, `Approved access request ${id} submitted by ${requests[idx].requester.email}`);
  updateMetrics();
  renderRequests();
};

rejectForm.addEventListener("submit", function(e) {
  e.preventDefault();
  const reason = rejectReasonInput.value.trim();
  if (!reason) { rejectReasonInput.classList.add("error"); rejectErrorMsg.classList.add("visible"); return; }
  const requests = getRequests();
  const idx = requests.findIndex(r => r.id === selectedRequestId);
  if (idx === -1) return;
  requests[idx].status = "Rejected";
  requests[idx].reject_reason = reason;
  saveRequests(requests);
  writeAuditLog("REJECT", requests[idx].category_data, `Rejected access request ${selectedRequestId} submitted by ${requests[idx].requester.email}. Reason: "${reason}"`);
  rejectModal.close();
  updateMetrics();
  renderRequests();
});

rejectReasonInput.addEventListener("input", function() {
  if (rejectReasonInput.value.trim()) { rejectReasonInput.classList.remove("error"); rejectErrorMsg.classList.remove("visible"); }
});

function setupModalLightDismiss(dialog) {
  if (!('closedBy' in HTMLDialogElement.prototype)) {
    dialog.addEventListener("click", e => {
      if (e.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      const inside = rect.top <= e.clientY && e.clientY <= rect.top + rect.height && rect.left <= e.clientX && e.clientX <= rect.left + rect.width;
      if (!inside) dialog.close();
    });
  }
}

setupModalLightDismiss(detailsModal);
setupModalLightDismiss(rejectModal);

window.addEventListener("DOMContentLoaded", () => { initDB(); updateMetrics(); renderRequests(); renderAuditLogs(); });
