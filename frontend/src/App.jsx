import { useState, useRef, useEffect, useCallback, createContext, useContext } from "react";
import {
  Send, Home, MessageSquare, BookOpen, History, Info, Menu, X,
  Car, AlertTriangle, ChevronRight, Clock, Shield, Zap, Search,
  RefreshCw, Wifi, WifiOff, Moon, Sun, Download, Share2,
  ThumbsUp, ThumbsDown, BarChart2, ExternalLink, Copy, Check,Camera, Upload, ImageIcon, Eye
} from "lucide-react";

// ════════════════════════════════════════════════
// CONFIG & CONSTANTS
// ════════════════════════════════════════════════
const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:5000";

const SEV = {
  high:   { label: "Berat",  bg: "#fef2f2", border: "#fecaca", pillBg: "#fee2e2", pillText: "#b91c1c" },
  medium: { label: "Sedang", bg: "#fffbeb", border: "#fde68a", pillBg: "#fef3c7", pillText: "#92400e" },
  low:    { label: "Ringan", bg: "#f0fdf4", border: "#bbf7d0", pillBg: "#dcfce7", pillText: "#166534" },
};

const PASAL_LIST = [
  { pasal: "Pasal 280",     jenis: "Tidak Memasang TNKB",             sanksi: "Kurungan maks. 2 bulan / Denda maks. Rp500.000",   icon: "🔢", denda: 500000,
    detail: "Setiap orang yang mengemudikan kendaraan bermotor di jalan yang tidak dipasangi Tanda Nomor Kendaraan Bermotor (TNKB) sebagaimana dimaksud dalam Pasal 68 ayat (1) dipidana dengan pidana kurungan paling lama 2 bulan atau denda paling banyak Rp500.000." },
  { pasal: "Pasal 281",     jenis: "Tidak Memiliki SIM",              sanksi: "Kurungan maks. 4 bulan / Denda maks. Rp1.000.000", icon: "🪪", denda: 1000000,
    detail: "Setiap orang yang mengemudikan kendaraan bermotor di jalan yang tidak memiliki Surat Izin Mengemudi (SIM) sebagaimana dimaksud dalam Pasal 77 ayat (1) dipidana dengan pidana kurungan paling lama 4 bulan atau denda paling banyak Rp1.000.000." },
  { pasal: "Pasal 283",     jenis: "Menggunakan HP Saat Berkendara",  sanksi: "Kurungan maks. 3 bulan / Denda maks. Rp750.000",   icon: "📱", denda: 750000,
    detail: "Setiap orang yang mengemudikan kendaraan bermotor di jalan secara tidak wajar dan melakukan kegiatan lain atau dipengaruhi oleh suatu keadaan yang mengakibatkan gangguan konsentrasi dalam mengemudi di jalan dipidana dengan pidana kurungan paling lama 3 bulan atau denda paling banyak Rp750.000." },
  { pasal: "Pasal 285",     jenis: "Kendaraan Tidak Memenuhi Syarat", sanksi: "Kurungan maks. 1 bulan / Denda maks. Rp250.000",   icon: "🔧", denda: 250000,
    detail: "Setiap orang yang mengemudikan sepeda motor di jalan yang tidak memenuhi persyaratan teknis dan laik jalan yang meliputi kaca spion, klakson, lampu utama, lampu rem, lampu penunjuk arah, alat pemantul cahaya, alat pengukur kecepatan, knalpot, dan kedalaman alat bantu rem dipidana dengan pidana kurungan paling lama 1 bulan atau denda paling banyak Rp250.000." },
  { pasal: "Pasal 287 (1)", jenis: "Melanggar Rambu / Marka Jalan",  sanksi: "Kurungan maks. 2 bulan / Denda maks. Rp500.000",   icon: "🚧", denda: 500000,
    detail: "Setiap orang yang mengemudikan kendaraan bermotor di jalan yang melanggar aturan perintah atau larangan yang dinyatakan dengan rambu lalu lintas sebagaimana dimaksud dalam Pasal 106 ayat (4) huruf a atau marka jalan sebagaimana dimaksud dalam Pasal 106 ayat (4) huruf b dipidana dengan pidana kurungan paling lama 2 bulan atau denda paling banyak Rp500.000." },
  { pasal: "Pasal 287 (2)", jenis: "Menerobos Lampu Merah",          sanksi: "Kurungan maks. 2 bulan / Denda maks. Rp500.000",   icon: "🚦", denda: 500000,
    detail: "Setiap orang yang mengemudikan kendaraan bermotor di jalan yang melanggar aturan perintah atau larangan yang dinyatakan dengan alat pemberi isyarat lalu lintas sebagaimana dimaksud dalam Pasal 106 ayat (4) huruf c dipidana dengan pidana kurungan paling lama 2 bulan atau denda paling banyak Rp500.000." },
  { pasal: "Pasal 287 (5)", jenis: "Melebihi Batas Kecepatan",       sanksi: "Kurungan maks. 2 bulan / Denda maks. Rp500.000",   icon: "⚡", denda: 500000,
    detail: "Setiap orang yang mengemudikan kendaraan bermotor di jalan yang melanggar batas kecepatan paling tinggi atau paling rendah sebagaimana dimaksud dalam Pasal 106 ayat (4) huruf g atau Pasal 115 huruf a dipidana dengan pidana kurungan paling lama 2 bulan atau denda paling banyak Rp500.000." },
  { pasal: "Pasal 288",     jenis: "Tidak Membawa STNK / Dokumen",   sanksi: "Kurungan maks. 2 bulan / Denda maks. Rp500.000",   icon: "📄", denda: 500000,
    detail: "Setiap orang yang mengemudikan kendaraan bermotor di jalan yang tidak dilengkapi dengan Surat Tanda Nomor Kendaraan Bermotor atau Surat Tanda Coba Kendaraan Bermotor yang ditetapkan oleh Kepolisian Negara Republik Indonesia dipidana dengan pidana kurungan paling lama 2 bulan atau denda paling banyak Rp500.000." },
  { pasal: "Pasal 289",     jenis: "Tidak Menggunakan Sabuk Pengaman",sanksi: "Kurungan maks. 1 bulan / Denda maks. Rp250.000",   icon: "🔒", denda: 250000,
    detail: "Setiap orang yang mengemudikan kendaraan bermotor atau penumpang yang duduk di samping pengemudi yang tidak mengenakan sabuk keselamatan sebagaimana dimaksud dalam Pasal 106 ayat (6) dipidana dengan pidana kurungan paling lama 1 bulan atau denda paling banyak Rp250.000." },
  { pasal: "Pasal 291 (1)", jenis: "Tidak Menggunakan Helm SNI",     sanksi: "Kurungan maks. 1 bulan / Denda maks. Rp250.000",   icon: "🪖", denda: 250000,
    detail: "Setiap orang yang mengemudikan sepeda motor tidak mengenakan helm standar nasional Indonesia sebagaimana dimaksud dalam Pasal 106 ayat (8) dipidana dengan pidana kurungan paling lama 1 bulan atau denda paling banyak Rp250.000." },
  { pasal: "Pasal 292",     jenis: "Melebihi Kapasitas Penumpang",   sanksi: "Kurungan maks. 1 bulan / Denda maks. Rp250.000",   icon: "👥", denda: 250000,
    detail: "Setiap orang yang mengemudikan sepeda motor yang membiarkan penumpangnya tidak mengenakan helm atau membawa penumpang lebih dari 1 orang sebagaimana dimaksud dalam Pasal 106 ayat (9) dipidana dengan pidana kurungan paling lama 1 bulan atau denda paling banyak Rp250.000." },
  { pasal: "Pasal 293 (1)", jenis: "Tidak Menyalakan Lampu Utama",   sanksi: "Kurungan maks. 1 bulan / Denda maks. Rp250.000",   icon: "💡", denda: 250000,
    detail: "Setiap orang yang mengemudikan kendaraan bermotor di jalan tanpa menyalakan lampu utama pada malam hari dan kondisi tertentu sebagaimana dimaksud dalam Pasal 107 ayat (1) dipidana dengan pidana kurungan paling lama 1 bulan atau denda paling banyak Rp250.000." },
];

const EXAMPLES = [
  "Saya naik motor tanpa helm dan tidak bawa SIM",
  "Tadi saya menerobos lampu merah sambil main HP",
  "Motor saya tidak ada spion dan bonceng 3 orang",
  "Saya ngebut dan tidak bawa STNK serta SIM",
];

// ════════════════════════════════════════════════
// THEME CONTEXT
// ════════════════════════════════════════════════
const ThemeCtx = createContext({ dark: false, toggle: () => {} });
const useTheme = () => useContext(ThemeCtx);

// ════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════
const getTime = () => new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
const getDate = () => new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

function parseMaxDenda(sanksi = "") {
  const m = sanksi.match(/Rp[\d.]+/);
  if (!m) return 0;
  return parseInt(m[0].replace("Rp", "").replace(/\./g, ""), 10) || 0;
}

function formatRupiah(n) {
  return "Rp" + n.toLocaleString("id-ID");
}

function exportPDF(violations, userInput) {
  const totalDenda = violations.reduce((s, v) => s + parseMaxDenda(v.sanksi), 0);
  const html = `<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8">
  <title>Laporan Pelanggaran Lalu Lintas — TrafficAI</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:Arial,sans-serif;color:#1e293b;background:#fff;padding:32px;max-width:800px;margin:0 auto}
    .header{border-bottom:3px solid #2563eb;padding-bottom:16px;margin-bottom:24px}
    .logo{font-size:22px;font-weight:800;color:#2563eb}
    .logo span{color:#1e293b}
    .meta{font-size:12px;color:#64748b;margin-top:4px}
    .desc-box{background:#f1f5f9;border-left:4px solid #2563eb;padding:12px 16px;border-radius:0 8px 8px 0;margin-bottom:24px}
    .desc-label{font-size:11px;color:#64748b;font-weight:700;margin-bottom:4px}
    .desc-text{font-size:14px;color:#1e293b}
    .section-title{font-size:14px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.05em;margin-bottom:12px}
    .v-card{border:1px solid #e2e8f0;border-radius:10px;padding:16px;margin-bottom:12px;break-inside:avoid}
    .v-header{display:flex;align-items:center;gap:10px;margin-bottom:12px}
    .num{background:#2563eb;color:#fff;font-size:11px;font-weight:700;padding:2px 8px;border-radius:5px}
    .sev{font-size:11px;padding:2px 8px;border-radius:20px;font-weight:600}
    .sev.high{background:#fee2e2;color:#b91c1c}
    .sev.medium{background:#fef3c7;color:#92400e}
    .sev.low{background:#dcfce7;color:#166534}
    .v-name{font-size:14px;font-weight:700;color:#1e293b}
    .row{display:flex;gap:8px;font-size:12px;margin-bottom:5px}
    .row-label{color:#94a3b8;font-weight:600;min-width:80px}
    .row-val{color:#1e293b}
    .row-val.blue{color:#1d4ed8;font-weight:600}
    .total-box{background:#fef9c3;border:1px solid #fde047;border-radius:10px;padding:16px;margin:20px 0;display:flex;justify-content:space-between;align-items:center}
    .total-label{font-size:13px;color:#92400e;font-weight:600}
    .total-val{font-size:20px;font-weight:800;color:#78350f}
    .disclaimer{background:#fef9c3;border:1px solid #fde047;border-radius:8px;padding:12px 16px;font-size:11px;color:#92400e;line-height:1.6;margin-top:20px}
    @media print{body{padding:16px}button{display:none}}
  </style>
  </head><body>
  <div class="header">
    <div class="logo">Traffic<span>AI</span></div>
    <div class="meta">Laporan Pelanggaran Lalu Lintas · ${getDate()}</div>
  </div>
  <div class="desc-box">
    <div class="desc-label">DESKRIPSI KEJADIAN</div>
    <div class="desc-text">${userInput}</div>
  </div>
  <div class="section-title">${violations.length} Pelanggaran Terdeteksi</div>
  ${violations.map((v, i) => {
    const sev = v.severity || "medium";
    return `<div class="v-card">
      <div class="v-header">
        <span class="num">#${i + 1}</span>
        <span class="sev ${sev}">${SEV[sev]?.label || sev}</span>
        <span class="v-name">${v.jenis}</span>
      </div>
      <div class="row"><span class="row-label">Pasal</span><span class="row-val blue">${v.pasal}</span></div>
      <div class="row"><span class="row-label">Sanksi</span><span class="row-val">${v.sanksi}</span></div>
      <div class="row"><span class="row-label">Keterangan</span><span class="row-val" style="color:#64748b">${v.penjelasan}</span></div>
    </div>`;
  }).join("")}
  <div class="total-box">
    <span class="total-label">⚠️ Total Estimasi Denda Maksimal</span>
    <span class="total-val">${formatRupiah(totalDenda)}</span>
  </div>
  <div class="disclaimer">⚠️ <strong>Disclaimer:</strong> Hasil analisis ini bersifat <strong>edukatif</strong> berdasarkan UU No. 22 Tahun 2009 tentang Lalu Lintas dan Angkutan Jalan. Informasi yang diberikan <strong>tidak menggantikan keputusan resmi pihak berwenang</strong> seperti kepolisian atau lembaga peradilan. Denda yang tertera adalah batas maksimum sesuai undang-undang.</div>
  </body></html>`;

  const win = window.open("", "_blank");
  if (!win) return alert("Izinkan popup untuk mengekspor PDF.");
  win.document.write(html);
  win.document.close();
  setTimeout(() => { win.focus(); win.print(); }, 500);
}

function shareWhatsApp(violations, userInput) {
  const lines = violations.map((v, i) =>
    `${i + 1}. *${v.jenis}*\n   📋 ${v.pasal}\n   ⚠️ ${v.sanksi}`
  );
  const totalDenda = violations.reduce((s, v) => s + parseMaxDenda(v.sanksi), 0);
  const text = `*Hasil Deteksi TrafficAI* 🚗\n\n_"${userInput}"_\n\n${lines.join("\n\n")}\n\n💰 *Total Denda Maks: ${formatRupiah(totalDenda)}*\n\n_Hasil bersifat edukatif berdasarkan UU No. 22 Tahun 2009_`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
}

// ════════════════════════════════════════════════
// HOOKS
// ════════════════════════════════════════════════
function usePersistentHistory() {
  const [history, setHistoryRaw] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("trafficai_history") || "[]");
    } catch { return []; }
  });

  const setHistory = useCallback((updater) => {
    setHistoryRaw(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      try { localStorage.setItem("trafficai_history", JSON.stringify(next.slice(0, 50))); } catch {}
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    localStorage.removeItem("trafficai_history");
    setHistoryRaw([]);
  }, []);

  return [history, setHistory, clearHistory];
}

function useDarkMode() {
  const [dark, setDark] = useState(() => localStorage.getItem("trafficai_dark") === "true");
  const toggle = useCallback(() => setDark(d => {
    const next = !d;
    localStorage.setItem("trafficai_dark", next);
    return next;
  }), []);
  return [dark, toggle];
}

// ════════════════════════════════════════════════
// DARK MODE STYLES
// ════════════════════════════════════════════════
const DARK_CSS = `
  .tm-dark { background-color:#0f172a !important; color:#e2e8f0 !important; }
  .tm-dark nav, .tm-dark .chat-input-bar, .tm-dark .chat-header { background-color:#1e293b !important; border-color:#334155 !important; }
  .tm-dark .bg-white, .tm-dark .card-surface { background-color:#1e293b !important; }
  .tm-dark .bg-gray-50, .tm-dark .page-bg { background-color:#0f172a !important; }
  .tm-dark .bg-gray-100, .tm-dark .input-bg { background-color:#334155 !important; }
  .tm-dark .text-gray-800, .tm-dark .text-gray-700 { color:#e2e8f0 !important; }
  .tm-dark .text-gray-500, .tm-dark .text-gray-600 { color:#94a3b8 !important; }
  .tm-dark .text-gray-400 { color:#64748b !important; }
  .tm-dark .border-gray-100, .tm-dark .border-gray-200 { border-color:#334155 !important; }
  .tm-dark .bg-gray-50.rounded-xl, .tm-dark .tech-item { background-color:#0f172a !important; }
  .tm-dark .shadow-sm { box-shadow: 0 1px 3px rgba(0,0,0,.4) !important; }
`;

// ════════════════════════════════════════════════
// COMPONENTS
// ════════════════════════════════════════════════

// ── Pasal Detail Modal ───────────────────────────
function PasalModal({ pasal, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!pasal) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)" }}
      onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 card-surface"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="text-2xl mr-2">{pasal.icon}</span>
            <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
              {pasal.pasal}
            </span>
            <h2 className="font-bold text-gray-800 text-base mt-2">{pasal.jenis}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Bunyi Pasal</p>
          <p className="text-sm text-gray-700 leading-relaxed">{pasal.detail}</p>
        </div>
        <div className="flex items-center justify-between bg-amber-50 rounded-xl p-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-amber-500" />
            <span className="text-xs font-semibold text-amber-800">Ancaman Sanksi</span>
          </div>
          <span className="text-xs text-amber-800 font-bold">{pasal.sanksi}</span>
        </div>
      </div>
    </div>
  );
}

// ── Denda Summary Box ───────────────────────────
function DendaBox({ violations }) {
  const total = violations.reduce((s, v) => s + parseMaxDenda(v.sanksi), 0);
  if (total === 0) return null;
  return (
    <div className="mt-3 rounded-xl bg-amber-50 border border-amber-200 p-3 flex items-center justify-between">
      <div>
        <p className="text-xs font-bold text-amber-800">💰 Total Estimasi Denda Maks.</p>
        <p className="text-xs text-amber-600 mt-0.5">Akumulasi dari {violations.length} pelanggaran</p>
      </div>
      <span className="text-lg font-extrabold text-amber-700">{formatRupiah(total)}</span>
    </div>
  );
}

// ── Feedback Buttons ─────────────────────────────
function FeedbackButtons({ msgId, query, feedback, onFeedback }) {
  const given = feedback[msgId];
  const send = async (type) => {
    onFeedback(msgId, type);
    try {
      await fetch(`${API_BASE}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: msgId, feedback: type, query }),
      });
    } catch {}
  };
  return (
    <div className="flex items-center gap-2 mt-2 px-1">
      <span className="text-xs text-gray-400">Apakah hasil ini akurat?</span>
      <button
        onClick={() => send("up")}
        disabled={!!given}
        className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg border transition-all ${
          given === "up"
            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
            : "border-gray-200 text-gray-400 hover:border-emerald-200 hover:text-emerald-600 hover:bg-emerald-50"
        } disabled:cursor-default`}
      >
        <ThumbsUp size={11} /> Ya
      </button>
      <button
        onClick={() => send("down")}
        disabled={!!given}
        className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg border transition-all ${
          given === "down"
            ? "bg-red-50 border-red-200 text-red-700"
            : "border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-600 hover:bg-red-50"
        } disabled:cursor-default`}
      >
        <ThumbsDown size={11} /> Tidak
      </button>
    </div>
  );
}

// ── Confidence Badge ─────────────────────────────
function ConfBadge({ score }) {
  if (score === null || score === undefined || score === 0) return null;
 // clamp ke 0–100 — ChromaDB bisa return nilai negatif (fix RAG -413%)
  const pct   = Math.max(0, Math.min(100, Math.round(score * 100)));
  const color = pct >= 70 ? "text-emerald-600 bg-emerald-50"
              : pct >= 40 ? "text-amber-600 bg-amber-50"
              :              "text-red-500 bg-red-50";
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${color}`}>
      RAG {pct}%
    </span>
  );
}

// ── ViolationCard (with stagger animation) ───────
function ViolationCard({ v, index, onPasalClick }) {
  const s = SEV[v.severity] ?? SEV.medium;
  const matchedPasal = PASAL_LIST.find(p =>
    v.pasal?.includes(p.pasal.replace(" (1)", "").replace(" (2)", "").replace(" (5)", ""))
  );
  return (
    <div
      className="rounded-2xl p-4 mb-3 last:mb-0"
      style={{
        background: s.bg,
        border: `1px solid ${s.border}`,
        animation: `slideUp 0.35s ease-out ${index * 0.08}s both`,
      }}
    >
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center text-base shrink-0">
          {v.icon ?? "🚫"}
        </div>
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-xs font-bold text-white bg-blue-600 px-2 py-0.5 rounded-md">#{index + 1}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md" style={{ background: s.pillBg, color: s.pillText }}>
              {s.label}
            </span>
          </div>
          <p className="font-bold text-gray-800 text-sm leading-tight">{v.jenis}</p>
        </div>
      </div>
      <div className="space-y-2 pl-1">
        <div className="flex gap-2 text-xs items-start">
          <span className="text-gray-400 font-medium w-20 shrink-0">Pasal</span>
          <button
            onClick={() => matchedPasal && onPasalClick(matchedPasal)}
            className={`text-blue-700 font-semibold text-left ${matchedPasal ? "hover:underline cursor-pointer" : ""} flex items-center gap-1`}
          >
            {v.pasal}
            {matchedPasal && <ExternalLink size={10} className="text-blue-400" />}
          </button>
        </div>
        {[
          { label: "Sanksi",     val: v.sanksi,     cls: "text-gray-800" },
          { label: "Keterangan", val: v.penjelasan, cls: "text-gray-500 leading-relaxed" },
        ].map((row, i) => (
          <div key={i} className="flex gap-2 text-xs">
            <span className="text-gray-400 font-medium w-20 shrink-0">{row.label}</span>
            <span className={row.cls}>{row.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Bubble ───────────────────────────────────────
function Bubble({ msg, onPasalClick, feedback, onFeedback }) {
  const isUser = msg.role === "user";
  if (isUser) {
    return (
      <div className="flex justify-end mb-5 gap-2.5">
        <div className="max-w-sm sm:max-w-lg">
          <div className="bg-blue-600 text-white rounded-2xl rounded-tr-md px-4 py-3 text-sm leading-relaxed shadow-sm">
            {msg.content}
          </div>
          <p className="text-xs text-gray-400 mt-1.5 px-1 text-right">{msg.time}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-5 gap-2.5">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
        <Car size={14} className="text-white" />
      </div>
      <div className="max-w-sm sm:max-w-lg lg:max-w-2xl w-full">
        <div className="bg-white card-surface border border-gray-100 rounded-2xl rounded-tl-md shadow-sm overflow-hidden">
          {/* Error */}
          {msg.isError && (
            <div className="px-4 py-3 bg-red-50">
              <div className="flex items-center gap-1.5 text-red-500 text-xs font-semibold mb-1.5">
                <WifiOff size={12} /> Koneksi gagal
              </div>
              <p className="text-sm text-red-700 leading-relaxed">{msg.content}</p>
              <p className="text-xs text-red-400 mt-1.5">
                Pastikan backend berjalan: <code className="bg-red-100 px-1 rounded">python app.py</code>
              </p>
            </div>
          )}
          {/* Plain message (greeting/info) */}
          {!msg.isError && msg.content && (
            <div className="px-4 py-3">
              <p className="text-sm text-gray-700 leading-relaxed">{msg.content}</p>
            </div>
          )}
          {/* Summary + violations */}
          {msg.summary && (
            <div className="px-4 pt-3 pb-1">
              <p className="text-sm text-gray-700 leading-relaxed">{msg.summary}</p>
            </div>
          )}
          {msg.violations?.length > 0 && (
            <div className="px-4 pb-3">
              <div className="flex items-center justify-between mb-3 py-2 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={13} className="text-amber-500" />
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {msg.violations.length} Pelanggaran Terdeteksi
                  </span>
                </div>
                <ConfBadge score={msg.avgConfidence} />
              </div>
              {msg.violations.map((v, i) => (
                <ViolationCard key={i} v={v} index={i} onPasalClick={onPasalClick} />
              ))}
              {/* Denda total */}
              <DendaBox violations={msg.violations} />
              {/* Action buttons */}
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => exportPDF(msg.violations, msg.userInput || "")}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-semibold transition-all border border-blue-100"
                >
                  <Download size={12} /> Export PDF
                </button>
                <button
                  onClick={() => shareWhatsApp(msg.violations, msg.userInput || "")}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-semibold transition-all border border-emerald-100"
                >
                  <Share2 size={12} /> Share WA
                </button>
              </div>
              {/* Disclaimer */}
              <div className="mt-3 rounded-xl bg-gray-50 border border-gray-100 p-3">
                <p className="text-xs text-gray-400 leading-relaxed">
                  ⚠️ Hasil ini bersifat <strong>edukatif</strong> berdasarkan UU No. 22 Tahun 2009
                  dan tidak menggantikan keputusan resmi pihak berwenang.
                </p>
              </div>
            </div>
          )}
        </div>
        {/* Feedback row */}
        {!msg.isError && msg.violations?.length > 0 && (
          <FeedbackButtons
            msgId={msg.id}
            query={msg.userInput || ""}
            feedback={feedback}
            onFeedback={onFeedback}
          />
        )}
        <p className="text-xs text-gray-400 mt-1 px-1">{msg.time}</p>
      </div>
    </div>
  );
}

// ── Typing Indicator ─────────────────────────────
function TypingDots() {
  return (
    <div className="flex justify-start mb-5 gap-2.5">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shrink-0 shadow-sm">
        <Car size={14} className="text-white" />
      </div>
      <div className="bg-white card-surface border border-gray-100 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
        <div className="flex gap-1.5 items-center">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-2 h-2 rounded-full bg-blue-400"
              style={{ animation: "typingBounce 1.2s ease-in-out infinite", animationDelay: `${i * 0.2}s` }} />
          ))}
          <span className="text-xs text-gray-400 ml-1">Menganalisis...</span>
        </div>
      </div>
    </div>
  );
}

// ── Status Badge ─────────────────────────────────
function StatusBadge({ online }) {
  return (
    <div className={`flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-lg ${
      online === null ? "text-gray-400"
        : online ? "text-emerald-600 bg-emerald-50"
        : "text-red-500 bg-red-50"
    }`}>
      {online === null ? <span className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-pulse" />
        : online ? <Wifi size={11} /> : <WifiOff size={11} />}
      {online === null ? "Memeriksa..." : online ? "Online" : "Offline"}
    </div>
  );
}

// ════════════════════════════════════════════════
// PAGES
// ════════════════════════════════════════════════

// ── Home ─────────────────────────────────────────
function HomePage({ goTo }) {
  return (
    <div className="overflow-y-auto h-full page-bg">
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-white" />
          <div className="absolute bottom-0 right-20 w-64 h-64 rounded-full bg-indigo-300" />
        </div>
        <div className="relative max-w-4xl mx-auto px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-white bg-opacity-15 rounded-full px-4 py-2 text-sm font-medium mb-6">
            <Zap size={14} className="text-yellow-300" /> Powered by RAG + Groq API
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight">
            Konsultasi Pelanggaran<br />Lalu Lintas Berbasis AI
          </h1>
          <p className="text-blue-100 text-base mb-10 max-w-xl mx-auto leading-relaxed">
            Deteksi <strong>beberapa pelanggaran sekaligus</strong> dari satu kalimat.
            Dapatkan pasal, sanksi, dan estimasi denda secara instan.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => goTo("konsultasi")}
              className="bg-white text-blue-700 font-bold px-7 py-3 rounded-xl hover:bg-blue-50 transition-all flex items-center justify-center gap-2 shadow-lg">
              <MessageSquare size={18} /> Mulai Konsultasi
            </button>
            <button onClick={() => goTo("informasi")}
              className="border-2 border-white border-opacity-40 text-white font-semibold px-7 py-3 rounded-xl hover:bg-white hover:bg-opacity-10 transition-all flex items-center justify-center gap-2">
              <BookOpen size={18} /> Informasi Pasal
            </button>
          </div>
        </div>
      </div>
      <div className="bg-white card-surface border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-5 flex justify-around">
          {[["20+","Jenis Pelanggaran"],["UU 22/2009","Dasar Hukum"],["RAG + LLM","Teknologi AI"],["Real-time","Deteksi Instan"]].map(([n,l]) => (
            <div key={l} className="text-center">
              <div className="text-lg font-bold text-blue-600">{n}</div>
              <div className="text-xs text-gray-500">{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-xl font-bold text-gray-800 text-center mb-8">Cara Kerja</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12">
          {[
            { icon: <MessageSquare size={22} className="text-blue-600" />, title: "1. Deskripsikan", desc: "Ketik situasi berkendara Anda secara natural" },
            { icon: <Zap size={22} className="text-blue-600" />, title: "2. AI Mendeteksi", desc: "RAG identifikasi semua pelanggaran sekaligus" },
            { icon: <Shield size={22} className="text-blue-600" />, title: "3. Hasil Lengkap", desc: "Pasal, sanksi, denda & opsi export PDF" },
          ].map((s, i) => (
            <div key={i} className="bg-white card-surface rounded-2xl border border-gray-100 p-6 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-blue-50 rounded-xl w-12 h-12 flex items-center justify-center mx-auto mb-4">{s.icon}</div>
              <h3 className="font-bold text-gray-800 mb-2 text-sm">{s.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
        <h2 className="text-xl font-bold text-gray-800 text-center mb-6">Coba Langsung</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {EXAMPLES.map((ex, i) => (
            <button key={i} onClick={() => goTo("konsultasi", ex)}
              className="flex items-center gap-3 bg-white card-surface border border-gray-200 rounded-xl p-4 text-left hover:border-blue-400 hover:bg-blue-50 transition-all group shadow-sm">
              <ChevronRight size={15} className="text-blue-400 group-hover:text-blue-600 shrink-0" />
              <span className="text-sm text-gray-600 group-hover:text-blue-700">{ex}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Konsultasi ───────────────────────────────────
function KonsultasiPage({ initMsg, setHistory }) {
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState(initMsg || "");
  const [loading, setLoading]     = useState(false);
  const [online, setOnline]       = useState(null);
  const [feedback, setFeedback]   = useState({});
  const [modalPasal, setModalPasal] = useState(null);
  const bottomRef   = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/health`)
      .then(r => r.ok ? setOnline(true) : setOnline(false))
      .catch(() => setOnline(false));
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);
  useEffect(() => { if (initMsg) setInput(initMsg); }, [initMsg]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 96) + "px";
  };

  const handleFeedback = (msgId, type) => {
    setFeedback(f => ({ ...f, [msgId]: type }));
  };

  const send = useCallback(async (overrideText) => {
    const text = (overrideText || input).trim();
    if (!text || loading) return;
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const msgId     = `msg_${Date.now()}`;
    const userMsg   = { id: `u_${Date.now()}`, role: "user", content: text, time: getTime() };
    const withUser  = [...messages, userMsg];
    setMessages(withUser);
    setLoading(true);

    try {
      const res  = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
        signal: AbortSignal.timeout(30000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      setOnline(true);
      if (data.error) throw new Error(data.error);

      const hasV   = data.is_violation && data.violations?.length > 0;
      const aiMsg  = {
        id:            msgId,
        role:          "assistant",
        content:       !hasV ? data.message : undefined,
        summary:       hasV  ? data.message : undefined,
        violations:    data.violations ?? [],
        avgConfidence: data.avg_confidence,
        userInput:     text,
        time:          getTime(),
      };

      const finalChat = [...withUser, aiMsg];
      setMessages(finalChat);

      if (hasV) {
        setHistory(prev => [{
          id:       Date.now(),
          preview:  text.length > 60 ? text.slice(0, 60) + "…" : text,
          dateStr:  getDate() + ", " + getTime(),
          count:    data.violations.length,
          messages: finalChat,
        }, ...prev]);
      }
    } catch (err) {
      setOnline(false);
      const isTO = err.name === "TimeoutError";
      setMessages([...withUser, {
        id: msgId, role: "assistant",
        content: isTO ? "Waktu tunggu habis (30 detik). Coba lagi sebentar." : "Tidak dapat terhubung ke backend.",
        isError: true, time: getTime(),
      }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, setHistory]);

  return (
    <div className="flex flex-col h-full">
      {modalPasal && <PasalModal pasal={modalPasal} onClose={() => setModalPasal(null)} />}
      {/* Header */}
      <div className="chat-header bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-sm">
            <Car size={16} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-800 text-sm">Konsultan Lalu Lintas AI</p>
            <StatusBadge online={online} />
          </div>
        </div>
        {messages.length > 0 && (
          <button onClick={() => setMessages([])} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50">
            <RefreshCw size={12} /> Reset
          </button>
        )}
      </div>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 pt-5 pb-2 page-bg">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center pb-8">
            <div className="bg-blue-50 rounded-3xl p-6 mb-5"><Car size={40} className="text-blue-500" /></div>
            <h3 className="font-bold text-gray-700 text-base mb-2">Deskripsikan Situasi Berkendara</h3>
            <p className="text-sm text-gray-400 max-w-xs mb-7 leading-relaxed">
              Ceritakan kejadian. AI akan mendeteksi semua pelanggaran beserta pasal, sanksi, dan estimasi denda.
            </p>
            <div className="grid grid-cols-1 gap-2.5 w-full max-w-sm">
              {EXAMPLES.map((ex, i) => (
                <button key={i} onClick={() => send(ex)}
                  className="text-left text-sm bg-white card-surface border border-gray-200 rounded-xl px-4 py-2.5 hover:border-blue-300 hover:bg-blue-50 transition-all text-gray-600 hover:text-blue-700 flex items-center gap-2.5 group">
                  <ChevronRight size={13} className="text-gray-300 group-hover:text-blue-400 shrink-0" />{ex}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((m, i) => (
              <Bubble key={i} msg={m} onPasalClick={setModalPasal} feedback={feedback} onFeedback={handleFeedback} />
            ))}
            {loading && <TypingDots />}
            <div ref={bottomRef} />
          </>
        )}
      </div>
      {/* Input */}
      <div className="chat-input-bar bg-white border-t border-gray-100 p-3 shrink-0">
        <div className="flex items-end gap-2 bg-gray-100 input-bg rounded-2xl px-4 py-2.5">
          <textarea ref={textareaRef} rows={1} value={input} onChange={handleInputChange}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Contoh: Saya naik motor tanpa helm, tidak bawa SIM, dan bonceng 3 orang..."
            className="flex-1 bg-transparent text-sm text-gray-800 resize-none outline-none placeholder-gray-400 py-0.5"
            style={{ minHeight: "24px", maxHeight: "96px" }} />
          <button onClick={() => send()} disabled={!input.trim() || loading}
            className="bg-blue-600 text-white rounded-xl p-2 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 shadow-sm active:scale-95">
            <Send size={16} />
          </button>
        </div>
        <p className="text-xs text-gray-400 text-center mt-2">Enter untuk kirim · Shift+Enter untuk baris baru</p>
      </div>
    </div>
  );
}

// ── Informasi ────────────────────────────────────
function InformasiPage() {
  const [q, setQ] = useState("");
  const [modal, setModal] = useState(null);
  const filtered = PASAL_LIST.filter(p =>
    p.pasal.toLowerCase().includes(q.toLowerCase()) ||
    p.jenis.toLowerCase().includes(q.toLowerCase())
  );
  return (
    <div className="overflow-y-auto h-full page-bg">
      {modal && <PasalModal pasal={modal} onClose={() => setModal(null)} />}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Informasi Pasal Hukum</h1>
          <p className="text-gray-500 text-sm">UU No. 22 Tahun 2009 — klik kartu untuk detail bunyi pasal</p>
        </div>
        <div className="relative mb-6">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Cari pasal atau jenis pelanggaran..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-white card-surface" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((p, i) => (
            <div key={i} onClick={() => setModal(p)}
              className="bg-white card-surface border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group">
              <div className="flex items-start gap-3 mb-3">
                <div className="text-2xl">{p.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full mb-1.5">{p.pasal}</span>
                    <ExternalLink size={13} className="text-gray-300 group-hover:text-blue-400 transition-colors" />
                  </div>
                  <h3 className="font-bold text-gray-800 text-sm leading-tight">{p.jenis}</h3>
                </div>
              </div>
              <div className="flex items-start gap-2 bg-amber-50 rounded-xl p-3">
                <AlertTriangle size={12} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 font-medium">{p.sanksi}</p>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-2 text-center py-16 text-gray-400">
              <Search size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Tidak ditemukan untuk "{q}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Riwayat ──────────────────────────────────────
function RiwayatPage({ history, goToChat, onClear }) {
  const [search, setSearch] = useState("");
  const filtered = history.filter(h => h.preview.toLowerCase().includes(search.toLowerCase()));

  if (history.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center px-6 page-bg">
        <div className="bg-gray-100 rounded-3xl p-6 mb-4"><History size={36} className="text-gray-300" /></div>
        <h3 className="font-bold text-gray-500 mb-2">Belum Ada Riwayat</h3>
        <p className="text-sm text-gray-400 max-w-xs">Riwayat tersimpan otomatis ke browser setelah Anda melakukan konsultasi.</p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full page-bg">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Riwayat Konsultasi</h1>
          <button onClick={onClear} className="text-xs text-red-400 hover:text-red-600 transition-colors flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-red-50">
            <X size={12} /> Hapus semua
          </button>
        </div>
        <div className="relative mb-5">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari riwayat..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-300 bg-white card-surface" />
        </div>
        <div className="space-y-3">
          {filtered.map(h => (
            <button key={h.id} onClick={() => goToChat(h)}
              className="w-full bg-white card-surface border border-gray-200 rounded-2xl p-4 text-left hover:border-blue-300 hover:bg-blue-50 transition-all shadow-sm group">
              <div className="flex items-center justify-between">
                <div className="flex-1 pr-4 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-700 truncate mb-1.5">{h.preview}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={11} /> {h.dateStr}</span>
                    <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full font-semibold">{h.count} pelanggaran</span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-400 shrink-0" />
              </div>
            </button>
          ))}
          {filtered.length === 0 && search && (
            <p className="text-sm text-center text-gray-400 py-8">Tidak ditemukan untuk "{search}"</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Evaluasi (Admin / Bab IV) ─────────────────────
function EvaluasiPage() {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/api/stats`);
      const data = await res.json();
      setStats(data);
    } catch {
      setStats(null);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const copyStats = () => {
    if (!stats) return;
    const text = `TrafficAI — Statistik Evaluasi\n\nTotal Query: ${stats.total_queries}\nQuery Pelanggaran: ${stats.violation_queries}\nRata-rata Pelanggaran/Kasus: ${stats.avg_violations_per_case}\nAvg Confidence RAG: ${(stats.avg_confidence * 100).toFixed(1)}%\nFeedback Positif: ${stats.positive_feedback}\nFeedback Negatif: ${stats.negative_feedback}\nTingkat Kepuasan: ${stats.satisfaction_rate}%`;
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  if (loading) return (
    <div className="h-full flex items-center justify-center page-bg">
      <div className="text-center text-gray-400">
        <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">Memuat statistik...</p>
      </div>
    </div>
  );

  if (!stats) return (
    <div className="h-full flex flex-col items-center justify-center page-bg text-center px-6">
      <WifiOff size={32} className="text-gray-300 mb-3" />
      <p className="text-sm font-semibold text-gray-500 mb-1">Tidak dapat memuat statistik</p>
      <p className="text-xs text-gray-400 mb-4">Pastikan backend Flask berjalan</p>
      <button onClick={load} className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1.5">
        <RefreshCw size={13} /> Coba lagi
      </button>
    </div>
  );

  const metrics = [
    { label: "Total Query",           val: stats.total_queries,           unit: "" },
    { label: "Query Pelanggaran",     val: stats.violation_queries,       unit: "" },
    { label: "Rata-rata Pelanggaran", val: stats.avg_violations_per_case, unit: "/kasus" },
    { label: "Avg Confidence RAG",    val: (stats.avg_confidence * 100).toFixed(1), unit: "%" },
    { label: "Feedback Positif 👍",   val: stats.positive_feedback,       unit: "" },
    { label: "Feedback Negatif 👎",   val: stats.negative_feedback,       unit: "" },
  ];

  return (
    <div className="overflow-y-auto h-full page-bg">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <BarChart2 size={22} className="text-blue-600" /> Evaluasi Sistem
            </h1>
            <p className="text-sm text-gray-400 mt-1">Data kuantitatif untuk Bab IV skripsi</p>
          </div>
          <div className="flex gap-2">
            <button onClick={copyStats}
              className="flex items-center gap-1.5 text-xs px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all">
              {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
              {copied ? "Tersalin!" : "Salin Data"}
            </button>
            <button onClick={load}
              className="flex items-center gap-1.5 text-xs px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-semibold transition-all">
              <RefreshCw size={12} /> Refresh
            </button>
          </div>
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          {metrics.map((m, i) => (
            <div key={i} className="bg-white card-surface rounded-2xl border border-gray-100 p-4 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">{m.label}</p>
              <p className="text-2xl font-extrabold text-blue-600">{m.val}<span className="text-base font-semibold text-gray-400">{m.unit}</span></p>
            </div>
          ))}
        </div>

        {/* Satisfaction rate */}
        <div className="bg-white card-surface rounded-2xl border border-gray-100 p-5 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-gray-800">Tingkat Kepuasan Pengguna</p>
            <span className="text-2xl font-extrabold text-emerald-600">{stats.satisfaction_rate}%</span>
          </div>
          <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all"
              style={{ width: `${stats.satisfaction_rate}%` }} />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>👍 {stats.positive_feedback} positif</span>
            <span>{stats.negative_feedback} negatif 👎</span>
          </div>
        </div>

        {/* Recent queries */}
        {stats.recent_queries?.length > 0 && (
          <div className="bg-white card-surface rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h2 className="text-sm font-bold text-gray-800 mb-4">10 Query Terbaru</h2>
            <div className="space-y-2">
              {stats.recent_queries.map((q, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="shrink-0 mt-0.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${q.is_violation ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500"}`}>
                      {q.is_violation ? `${q.violations_count} pelang.` : "Sapaan"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-700 truncate">{q.query}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Conf: {(q.avg_confidence * 100).toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Tentang ──────────────────────────────────────
function TentangPage() {
  return (
    <div className="overflow-y-auto h-full page-bg">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-7 text-white mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-white bg-opacity-20 rounded-xl p-2.5"><Car size={20} className="text-white" /></div>
            <div>
              <h1 className="text-lg font-bold">TrafficAI</h1>
              <p className="text-blue-200 text-xs">Sistem Konsultasi & Edukasi Pelanggaran Lalu Lintas</p>
            </div>
          </div>
          <p className="text-blue-100 text-sm leading-relaxed">
            Sistem edukasi hukum berbasis AI yang membantu masyarakat memahami pelanggaran lalu lintas dan sanksinya berdasarkan UU No. 22 Tahun 2009.
          </p>
        </div>
        <div className="bg-white card-surface border border-gray-100 rounded-2xl p-6 shadow-sm mb-5">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Info size={17} className="text-blue-500" /> Teknologi</h2>
          <div className="space-y-3">
            {[
              ["🤖","Groq API + Llama 3.3-70B","LLM inference berkecepatan tinggi"],
              ["🔍","RAG (Retrieval-Augmented Generation)","Vector database ChromaDB + cosine similarity"],
              ["📚","UU No. 22 Tahun 2009","Sumber data hukum terverifikasi"],
              ["🐍","Python + Flask + React","Backend REST API + frontend modern"],
            ].map(([icon,name,desc]) => (
              <div key={name} className="flex gap-3 items-start p-3 bg-gray-50 tech-item rounded-xl">
                <span className="text-xl">{icon}</span>
                <div><p className="text-sm font-semibold text-gray-800">{name}</p><p className="text-xs text-gray-500">{desc}</p></div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <div className="flex gap-3">
            <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-800 text-sm mb-1.5">Disclaimer</p>
              <p className="text-xs text-amber-700 leading-relaxed">
                Hasil analisis sistem ini bersifat <strong>edukatif</strong> berdasarkan UU No. 22 Tahun 2009.
                Informasi yang diberikan <strong>tidak menggantikan keputusan resmi pihak berwenang</strong> seperti kepolisian atau lembaga peradilan.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


function DeteksiGambarPage() {
  const [imageFile, setImageFile]       = useState(null);     // File object
  const [imagePreview, setImagePreview] = useState(null);     // URL preview
  const [imageBase64, setImageBase64]   = useState(null);     // Base64 string
  const [loading, setLoading]           = useState(false);
  const [result, setResult]             = useState(null);     // Hasil deteksi
  const [error, setError]               = useState(null);
  const [dragOver, setDragOver]         = useState(false);
  const [modalPasal, setModalPasal]     = useState(null);
 
  const fileInputRef  = useRef(null);
  const MAX_SIZE_MB   = 4;
  const MAX_SIZE_BYTE = MAX_SIZE_MB * 1024 * 1024;
 
  // ── Konversi File ke Base64 ──
  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload  = () => {
        // Hapus prefix "data:image/xxx;base64," — kirim string base64 saja
        const base64 = reader.result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
 
  // ── Handle pilih file ──
  const handleFile = async (file) => {
    if (!file) return;
 
    // Validasi tipe
    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar (JPG, PNG, WEBP).");
      return;
    }
    // Validasi ukuran
    if (file.size > MAX_SIZE_BYTE) {
      setError(`Ukuran file terlalu besar. Maks ${MAX_SIZE_MB}MB. Silakan kompres gambar Anda.`);
      return;
    }
 
    setError(null);
    setResult(null);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
 
    const b64 = await fileToBase64(file);
    setImageBase64(b64);
  };
 
  // ── Input file change ──
  const onFileChange = (e) => handleFile(e.target.files[0]);
 
  // ── Drag & drop ──
  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };
 
  // ── Kirim ke API ──
  const detectImage = async () => {
    if (!imageBase64 || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
 
    try {
      const res = await fetch(`${API_BASE}/api/detect-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_base64: imageBase64,
          filename:     imageFile?.name || "image.jpg",
        }),
        signal: AbortSignal.timeout(120000), // 120 detik — pipeline BLIP+CLIP lokal butuh waktu
      });
 
      if (res.status === 429) {
        setError("Rate limit Groq (step analisis hukum) tercapai. Tunggu 1 menit lalu coba lagi.");
        return;
      }
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }
 
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
 
    } catch (err) {
      if (err.name === "TimeoutError") {
        setError("Waktu analisis habis (120 detik). Coba lagi atau gunakan gambar yang lebih kecil.");
      } else {
        setError(err.message || "Gagal menganalisis gambar.");
      }
    } finally {
      setLoading(false);
    }
  };
 
  // ── Reset ──
  const reset = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageBase64(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
 
  // ── Helper konversi denda maks dari string sanksi ──
  const parseMaxDenda = (sanksi = "") => {
    const m = sanksi.match(/Rp[\d.]+/);
    if (!m) return 0;
    return parseInt(m[0].replace("Rp", "").replace(/\./g, ""), 10) || 0;
  };
  const formatRupiah = (n) => "Rp" + n.toLocaleString("id-ID");
 
  // ── Confidence badge per pelanggaran ──
  const ConfidenceBadge = ({ level }) => {
    const cfg = {
      high:   { label: "Terdeteksi jelas",  cls: "bg-emerald-100 text-emerald-700" },
      medium: { label: "Kemungkinan besar", cls: "bg-amber-100 text-amber-700"    },
      low:    { label: "Kurang jelas",       cls: "bg-gray-100 text-gray-500"      },
    };
    const c = cfg[level] ?? cfg.medium;
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${c.cls}`}>
        {c.label}
      </span>
    );
  };
 
  return (
    <div className="overflow-y-auto h-full page-bg">
      {/* Pasal Modal (reuse dari App.jsx) */}
      {modalPasal && <PasalModal pasal={modalPasal} onClose={() => setModalPasal(null)} />}
 
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
 
        {/* ── Header ── */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-100 rounded-xl p-2">
              {/* Icon camera — pakai emoji sebagai fallback jika belum import */}
              <span style={{ fontSize: 20 }}>📷</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Deteksi Gambar</h1>
              <p className="text-sm text-gray-500">AI Vision analisis pelanggaran dari foto</p>
            </div>
          </div>
 
          {/* Info chip */}
          <div className="flex flex-wrap gap-2 mt-4">
            {[
              { icon: "✅", text: "Gratis — 100% Lokal" },
              { icon: "🤖", text: "BLIP + CLIP Vision" },
              { icon: "⚡", text: "Groq Legal Reasoning" },
              { icon: "📦", text: "Maks 4MB per gambar" },
            ].map((c, i) => (
              <span key={i} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-white card-surface border border-gray-200 rounded-full text-gray-600">
                <span style={{ fontSize: 12 }}>{c.icon}</span> {c.text}
              </span>
            ))}
          </div>
        </div>
 
        {/* ── Upload Area ── */}
        {!imagePreview ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative flex flex-col items-center justify-center
              border-2 border-dashed rounded-2xl p-12 cursor-pointer
              transition-all text-center
              ${dragOver
                ? "border-blue-400 bg-blue-50"
                : "border-gray-300 bg-white card-surface hover:border-blue-300 hover:bg-blue-50"}
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={onFileChange}
              className="hidden"
            />
            <div className="bg-blue-50 rounded-2xl p-5 mb-4">
              <span style={{ fontSize: 40 }}>📷</span>
            </div>
            <h3 className="font-bold text-gray-700 text-base mb-2">
              Upload foto atau drag & drop
            </h3>
            <p className="text-sm text-gray-400 mb-4 max-w-xs leading-relaxed">
              Foto berkendara, situasi jalan, atau kondisi kendaraan untuk dianalisis AI
            </p>
            <div className="bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors inline-flex items-center gap-2">
              <span style={{ fontSize: 14 }}>📁</span> Pilih Gambar
            </div>
            <p className="text-xs text-gray-400 mt-3">JPG · PNG · WEBP — Maks 4MB</p>
          </div>
        ) : (
          /* ── Preview Gambar ── */
          <div className="bg-white card-surface border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            {/* Gambar preview */}
            <div className="relative bg-gray-900">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full max-h-80 object-contain"
              />
              <button
                onClick={reset}
                className="absolute top-3 right-3 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-1.5 transition-all"
              >
                <X size={16} />
              </button>
            </div>
 
            {/* Info file + tombol analisis */}
            <div className="p-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-800 truncate max-w-xs">
                  {imageFile?.name}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {imageFile ? (imageFile.size / 1024 / 1024).toFixed(2) + " MB" : ""}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={reset}
                  className="text-xs text-gray-400 hover:text-red-500 px-3 py-2 rounded-xl hover:bg-red-50 transition-colors border border-gray-200">
                  Ganti
                </button>
                <button
                  onClick={detectImage}
                  disabled={loading}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm active:scale-95"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Menganalisis...
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: 14 }}>🔍</span> Analisis Sekarang
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
 
        {/* ── Loading State ── */}
        {loading && (
          <div className="mt-6 bg-white card-surface border border-gray-100 rounded-2xl p-6 text-center shadow-sm">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-semibold text-gray-700">AI Vision sedang memeriksa gambar...</span>
            </div>
            <p className="text-xs text-gray-400 mb-4">Proses 10–30 detik</p>
            <div className="flex flex-col gap-2 text-left max-w-sm mx-auto">
              {[
                { step: "1", label: "BLIP",         desc: "Buat deskripsi awal gambar (lokal)" },
                { step: "2", label: "Groq Vision",  desc: "Llama-4-Scout benar-benar melihat & menganalisis gambar" },
                { step: "3", label: "Groq Legal",   desc: "Petakan temuan ke pasal UU No. 22 Tahun 2009" },
              ].map((s) => (
                <div key={s.step} className="flex items-center gap-2.5 text-xs">
                  <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center font-bold shrink-0">{s.step}</span>
                  <span className="font-semibold text-gray-700 w-24 shrink-0">{s.label}</span>
                  <span className="text-gray-400">{s.desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}
 
        {/* ── Error State ── */}
        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-800 mb-1">Gagal menganalisis gambar</p>
              <p className="text-xs text-red-600 leading-relaxed">{error}</p>
            </div>
          </div>
        )}
 
        {/* ── HASIL DETEKSI ── */}
        {result && !loading && (
          <div className="mt-6 space-y-4">

            {/* Jenis kendaraan & deskripsi scene dari Vision AI */}
            {result.pipeline?.vehicle_type && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-3">
                  <span style={{ fontSize: 24 }}>
                    {result.pipeline.vehicle_type === "motorcycle" ? "🏍️" :
                     result.pipeline.vehicle_type === "car"        ? "🚗" :
                     result.pipeline.vehicle_type === "truck"      ? "🚛" :
                     result.pipeline.vehicle_type === "bus"        ? "🚌" : "🚘"}
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Jenis Kendaraan</p>
                    <p className="text-sm font-bold text-slate-800 capitalize">{result.pipeline.vehicle_type}
                      {result.pipeline.total_people > 0 && (
                        <span className="ml-2 text-xs font-normal text-slate-500">· {result.pipeline.total_people} orang terdeteksi</span>
                      )}
                    </p>
                  </div>
                </div>
                {result.pipeline.scene_description && (
                  <p className="text-xs text-slate-500 italic leading-relaxed border-t border-slate-200 pt-2">
                    🔍 <strong>Situasi:</strong> {result.pipeline.scene_description}
                  </p>
                )}
                {result.pipeline.not_visible?.length > 0 && (
                  <div className="border-t border-slate-200 pt-2">
                    <p className="text-xs text-slate-400 font-semibold mb-1">❓ Tidak dapat dinilai (tidak terlihat jelas):</p>
                    <div className="flex flex-wrap gap-1">
                      {result.pipeline.not_visible.map((item, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 bg-slate-200 text-slate-500 rounded-full">{item}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Deskripsi gambar dari AI (fallback jika tidak ada pipeline) */}
            {result.image_description && !result.pipeline?.vehicle_type && (
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
                <span style={{ fontSize: 20 }}>🖼️</span>
                <div>
                  <p className="text-xs font-semibold text-blue-700 mb-1 uppercase tracking-wide">
                    AI mendeteksi gambar berisi:
                  </p>
                  <p className="text-sm text-blue-800 leading-relaxed">{result.image_description}</p>
                </div>
              </div>
            )}
 
            {/* Ringkasan deteksi */}
            <div className={`rounded-2xl p-4 flex items-center gap-3 border ${
              result.is_violation
                ? "bg-amber-50 border-amber-200"
                : "bg-emerald-50 border-emerald-200"
            }`}>
              <span style={{ fontSize: 28 }}>
                {result.is_violation ? "⚠️" : "✅"}
              </span>
              <div>
                <p className="text-sm font-bold text-gray-800">
                  {result.is_violation
                    ? `${result.violations?.length ?? 0} Pelanggaran Terdeteksi`
                    : "Tidak Ada Pelanggaran Terdeteksi"
                  }
                </p>
                <p className="text-xs text-gray-600 mt-0.5">{result.message}</p>
              </div>
            </div>
 
            {/* Kartu pelanggaran */}
            {result.violations?.map((v, i) => {
              const s = SEV[v.severity] ?? SEV.medium;
              const matchedPasal = PASAL_LIST.find(p =>
                v.pasal?.includes(p.pasal.replace(" (1)", "").replace(" (2)", "").replace(" (5)", ""))
              );
              return (
                <div
                  key={i}
                  className="rounded-2xl p-4 border"
                  style={{ background: s.bg, borderColor: s.border, animation: `slideUp 0.35s ease-out ${i * 0.1}s both` }}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center text-lg shrink-0">
                      🚫
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                        <span className="text-xs font-bold text-white bg-blue-600 px-2 py-0.5 rounded-md">
                          #{i + 1}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md"
                          style={{ background: s.pillBg, color: s.pillText }}>
                          {s.label}
                        </span>
                        {v.confidence && <ConfidenceBadge level={v.confidence} />}
                      </div>
                      <p className="font-bold text-gray-800 text-sm">{v.jenis}</p>
                    </div>
                  </div>
 
                  <div className="space-y-2 pl-1">
                    <div className="flex gap-2 text-xs items-start">
                      <span className="text-gray-400 font-medium w-20 shrink-0">Pasal</span>
                      <button
                        onClick={() => matchedPasal && setModalPasal(matchedPasal)}
                        className={`text-blue-700 font-semibold text-left ${matchedPasal ? "hover:underline cursor-pointer" : ""} flex items-center gap-1`}
                      >
                        {v.pasal}
                        {matchedPasal && <ExternalLink size={10} className="text-blue-400" />}
                      </button>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <span className="text-gray-400 font-medium w-20 shrink-0">Sanksi</span>
                      <span className="text-gray-800">{v.sanksi}</span>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <span className="text-gray-400 font-medium w-20 shrink-0">Terlihat</span>
                      <span className="text-gray-500 leading-relaxed">{v.penjelasan}</span>
                    </div>
                  </div>
                </div>
              );
            })}
 
            {/* Total Denda */}
            {result.violations?.length > 0 && (() => {
              const total = result.violations.reduce((s, v) => s + parseMaxDenda(v.sanksi), 0);
              return total > 0 ? (
                <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-2xl p-4">
                  <div>
                    <p className="text-xs font-bold text-amber-800">💰 Total Estimasi Denda Maks.</p>
                    <p className="text-xs text-amber-600 mt-0.5">
                      Akumulasi {result.violations.length} pelanggaran
                    </p>
                  </div>
                  <span className="text-xl font-extrabold text-amber-700">{formatRupiah(total)}</span>
                </div>
              ) : null;
            })()}
 
            {/* Action buttons */}
            {result.violations?.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => {
                    const lines = result.violations.map((v, i) =>
                      `${i + 1}. *${v.jenis}*\n   📋 ${v.pasal}\n   ⚠️ ${v.sanksi}`
                    );
                    const total = result.violations.reduce((s, v) => s + parseMaxDenda(v.sanksi), 0);
                    const text  = `*Hasil Deteksi Gambar TrafficAI* 📷\n\n_${result.image_description}_\n\n${lines.join("\n\n")}\n\n💰 *Total Denda Maks: ${formatRupiah(total)}*\n\n_Hasil bersifat edukatif berdasarkan UU No. 22 Tahun 2009_`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
                  }}
                  className="flex items-center gap-1.5 text-xs px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl font-semibold transition-all border border-emerald-100"
                >
                  <Share2 size={12} /> Share WA
                </button>
                <button
                  onClick={reset}
                  className="flex items-center gap-1.5 text-xs px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl font-semibold transition-all border border-gray-200"
                >
                  <RefreshCw size={12} /> Analisis Gambar Lain
                </button>
              </div>
            )}
 
            {/* Disclaimer */}
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
              <p className="text-xs text-gray-400 leading-relaxed">
                ⚠️ Hasil deteksi gambar bersifat <strong>edukatif</strong> dan bergantung pada
                kualitas serta sudut pengambilan foto. Sistem hanya mendeteksi pelanggaran yang
                <strong> terlihat jelas</strong> di gambar. Tidak menggantikan keputusan pihak berwenang.
              </p>
            </div>
          </div>
        )}
 
        {/* ── Contoh kasus yang bisa dideteksi ── */}
        {!result && !loading && (
          <div className="mt-8">
            <h2 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">
              Pelanggaran yang dapat dideteksi dari gambar
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { icon: "🪖", name: "Tanpa Helm",      acc: "~88%" },
                { icon: "👥", name: "Bonceng 3",        acc: "~85%" },
                { icon: "🔒", name: "Tanpa Sabuk",      acc: "~80%" },
                { icon: "📱", name: "Main HP",          acc: "~72%" },
                { icon: "🔢", name: "Tanpa Plat",       acc: "~78%" },
                { icon: "🔭", name: "Tanpa Spion",      acc: "~60%" },
              ].map((d, i) => (
                <div key={i} className="bg-white card-surface border border-gray-200 rounded-xl p-3 text-center">
                  <div style={{ fontSize: 24 }} className="mb-2">{d.icon}</div>
                  <p className="text-xs font-semibold text-gray-700">{d.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Est. akurasi {d.acc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════
// MAIN APP
// ════════════════════════════════════════════════
export default function App() {
  const [dark, toggleDark]             = useDarkMode();
  const [page, setPage]                = useState("home");
  const [initPrompt, setInitPrompt]    = useState("");
  const [history, setHistory, clearHistory] = usePersistentHistory();
  const [mobileOpen, setMobileOpen]    = useState(false);

  const NAV = [
    { id: "home",       label: "Home",      icon: Home },
    { id: "konsultasi", label: "Konsultasi",icon: MessageSquare },
    { id: "informasi",  label: "Informasi", icon: BookOpen },
    { id: "riwayat",    label: "Riwayat",   icon: History },
    { id: "evaluasi",   label: "Evaluasi",  icon: BarChart2 },
    { id: "tentang",    label: "Tentang",   icon: Info },
    { id: "gambar", label: "Deteksi Foto", icon: Camera },
  ];

  const goTo = useCallback((p, prompt = "") => {
    setPage(p);
    if (prompt) setInitPrompt(prompt);
    setMobileOpen(false);
  }, []);

  const goToChat = useCallback((h) => {
    setPage("konsultasi");
    setMobileOpen(false);
  }, []);

  return (
    <ThemeCtx.Provider value={{ dark, toggle: toggleDark }}>
      <style>{`
        @keyframes typingBounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        ${dark ? DARK_CSS : ""}
      `}</style>

      <div className={`h-screen flex flex-col bg-gray-50 page-bg ${dark ? "tm-dark" : ""}`}>
        {/* Navbar */}
        <nav className="bg-white border-b border-gray-200 shrink-0 z-50 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <button onClick={() => goTo("home")} className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-1.5 shadow-sm">
                <Car size={15} className="text-white" />
              </div>
              <span className="font-bold text-gray-800 text-sm">TrafficAI</span>
              <span className="hidden sm:inline text-xs text-gray-400">· Konsultasi Lalu Lintas</span>
            </button>

            <div className="hidden sm:flex items-center gap-1">
              {NAV.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => goTo(id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    page === id ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  }`}>
                  <Icon size={14} />
                  {label}
                  {id === "riwayat" && history.length > 0 && (
                    <span className="bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center leading-none">
                      {history.length > 9 ? "9+" : history.length}
                    </span>
                  )}
                </button>
              ))}
              {/* Dark mode toggle */}
              <button onClick={toggleDark}
                className="ml-1 p-2 rounded-xl text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-all"
                title={dark ? "Mode terang" : "Mode gelap"}>
                {dark ? <Sun size={15} /> : <Moon size={15} />}
              </button>
            </div>

            <button className="sm:hidden p-2 text-gray-600" onClick={() => setMobileOpen(o => !o)}>
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {mobileOpen && (
            <div className="sm:hidden bg-white border-t border-gray-100 px-4 py-3">
              {NAV.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => goTo(id)}
                  className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-medium mb-1 transition-all ${
                    page === id ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-100"
                  }`}>
                  <Icon size={16} /> {label}
                </button>
              ))}
              <button onClick={toggleDark}
                className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100">
                {dark ? <Sun size={16} /> : <Moon size={16} />}
                {dark ? "Mode Terang" : "Mode Gelap"}
              </button>
            </div>
          )}
        </nav>

        {/* Page content */}
        <div className="flex-1 overflow-hidden">
          {page === "home"       && <HomePage goTo={goTo} />}
          {page === "konsultasi" && (
            <KonsultasiPage key={initPrompt} initMsg={initPrompt} setHistory={setHistory} />
          )}
          {page === "informasi"  && <InformasiPage />}
          {page === "riwayat"    && <RiwayatPage history={history} goToChat={goToChat} onClear={clearHistory} />}
          {page === "evaluasi"   && <EvaluasiPage />}
          {page === "tentang"    && <TentangPage />}
          {page === "gambar" && <DeteksiGambarPage />}
        </div>
      </div>
    </ThemeCtx.Provider>
  );
}