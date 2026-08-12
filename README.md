# CDARAS Approver Dashboard

**Customer Data Access Request & Approval System (CDARAS)**  
Implementasi Jira Issue: **WMA-7** — Dashboard Persetujuan atau Penolakan oleh Approver

## 🚀 Demo

Buka `index.html` langsung di browser modern (Chrome, Edge, Firefox) atau jalankan lokal:

```bash
python3 -m http.server 8080
# Akses: http://localhost:8080
```

## 📋 Acceptance Criteria (Gherkin)

- ✅ **Given** Approver masuk ke sistem  
- ✅ **When** Approver membuka halaman Dashboard Persetujuan  
- ✅ **Then** Approver melihat daftar permohonan yang berstatus "Pending Approval"
- ✅ **When** Approver memilih "Approve" → status berubah menjadi "Approved"
- ✅ **When** Approver memilih "Reject" tanpa komentar → sistem menampilkan error: **"Alasan penolakan wajib diisi"**

## 🛠️ Tech Stack

- **HTML5** – Native `<dialog>` element dengan `closedby="any"`
- **CSS3** – Custom Properties, Grid, Flexbox, CSS Animations
- **JavaScript** – Vanilla JS, `localStorage` sebagai mock database

## 🎨 Design System (Vibe Pattern)

| Token | Value |
|---|---|
| Primary | Indigo `#6366F1` |
| Secondary | Violet `#8B5CF6` |
| Success | Emerald `#10B981` |
| Danger | Rose `#F43F5E` |
| Border Radius | `16px` / `24px` |
| Font | Inter + Outfit |

## 📁 Struktur File

```
cdaras-approver-dashboard/
├── index.html    # Layout, modal dialogs, struktur semantik
├── index.css     # Design system, animasi, responsive
└── app.js        # Logic, mock DB (localStorage), event handlers
```

## 🔗 Referensi

- **Jira Project**: Workshop MSD - Access (WMA)
- **Confluence**: Workshop MSD - Access Space
- **Atlassian Cloud**: mii-team-pvqkohd7.atlassian.net
