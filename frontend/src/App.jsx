import { useState, useRef, useEffect, useCallback, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Home, MessageSquare, BookOpen, History, Info, Menu, X,
  Car, AlertTriangle, ChevronRight, Clock, Shield, Zap, Search,
  RefreshCw, Wifi, WifiOff, Moon, Sun, Download, Share2,
  ThumbsUp, ThumbsDown, BarChart2, ExternalLink, Copy, Check, Camera, Upload, ImageIcon, Eye,
  CreditCard, Smartphone, Wrench, Navigation, BellElectric, FileText, Lock, HardHat, Users, Lightbulb
} from "lucide-react";

// ════════════════════════════════════════════════
// CONFIG & CONSTANTS
// ════════════════════════════════════════════════
const API_BASE = import.meta.env.VITE_API_BASE || "https://rakhadaivanda-trafficai-backend.hf.space";

const SEV = {
  high: { label: "Berat", bg: "#fef2f2", border: "#fecaca", pillBg: "#fee2e2", pillText: "#b91c1c" },
  medium: { label: "Sedang", bg: "#fffbeb", border: "#fde68a", pillBg: "#fef3c7", pillText: "#92400e" },
  low: { label: "Ringan", bg: "#f0fdf4", border: "#bbf7d0", pillBg: "#dcfce7", pillText: "#166534" },
};

const PASAL_LIST = [
  {
    pasal: "Pasal 280", jenis: "Tidak Memasang TNKB", sanksi: "Kurungan maks. 2 bulan / Denda maks. Rp500.000", icon: CreditCard, denda: 500000,
    detail: "Setiap orang yang mengemudikan kendaraan bermotor di jalan yang tidak dipasangi Tanda Nomor Kendaraan Bermotor (TNKB) sebagaimana dimaksud dalam Pasal 68 ayat (1) dipidana dengan pidana kurungan paling lama 2 bulan atau denda paling banyak Rp500.000."
  },
  {
    pasal: "Pasal 281", jenis: "Tidak Memiliki SIM", sanksi: "Kurungan maks. 4 bulan / Denda maks. Rp1.000.000", icon: CreditCard, denda: 1000000,
    detail: "Setiap orang yang mengemudikan kendaraan bermotor di jalan yang tidak memiliki Surat Izin Mengemudi (SIM) sebagaimana dimaksud dalam Pasal 77 ayat (1) dipidana dengan pidana kurungan paling lama 4 bulan atau denda paling banyak Rp1.000.000."
  },
  {
    pasal: "Pasal 283", jenis: "Menggunakan HP Saat Berkendara", sanksi: "Kurungan maks. 3 bulan / Denda maks. Rp750.000", icon: Smartphone, denda: 750000,
    detail: "Setiap orang yang mengemudikan kendaraan bermotor di jalan secara tidak wajar dan melakukan kegiatan lain atau dipengaruhi oleh suatu keadaan yang mengakibatkan gangguan konsentrasi dalam mengemudi di jalan dipidana dengan pidana kurungan paling lama 3 bulan atau denda paling banyak Rp750.000."
  },
  {
    pasal: "Pasal 285", jenis: "Kendaraan Tidak Memenuhi Syarat", sanksi: "Kurungan maks. 1 bulan / Denda maks. Rp250.000", icon: Wrench, denda: 250000,
    detail: "Setiap orang yang mengemudikan sepeda motor di jalan yang tidak memenuhi persyaratan teknis dan laik jalan yang meliputi kaca spion, klakson, lampu utama, lampu rem, lampu penunjuk arah, alat pemantul cahaya, alat pengukur kecepatan, knalpot, dan kedalaman alat bantu rem dipidana dengan pidana kurungan paling lama 1 bulan atau denda paling banyak Rp250.000."
  },
  {
    pasal: "Pasal 287 (1)", jenis: "Melanggar Rambu / Marka Jalan", sanksi: "Kurungan maks. 2 bulan / Denda maks. Rp500.000", icon: Navigation, denda: 500000,
    detail: "Setiap orang yang mengemudikan kendaraan bermotor di jalan yang melanggar aturan perintah atau larangan yang dinyatakan dengan rambu lalu lintas sebagaimana dimaksud dalam Pasal 106 ayat (4) huruf a atau marka jalan sebagaimana dimaksud dalam Pasal 106 ayat (4) huruf b dipidana dengan pidana kurungan paling lama 2 bulan atau denda paling banyak Rp500.000."
  },
  {
    pasal: "Pasal 287 (2)", jenis: "Menerobos Lampu Merah", sanksi: "Kurungan maks. 2 bulan / Denda maks. Rp500.000", icon: BellElectric, denda: 500000,
    detail: "Setiap orang yang mengemudikan kendaraan bermotor di jalan yang melanggar aturan perintah atau larangan yang dinyatakan dengan alat pemberi isyarat lalu lintas sebagaimana dimaksud dalam Pasal 106 ayat (4) huruf c dipidana dengan pidana kurungan paling lama 2 bulan atau denda paling banyak Rp500.000."
  },
  {
    pasal: "Pasal 287 (5)", jenis: "Melebihi Batas Kecepatan", sanksi: "Kurungan maks. 2 bulan / Denda maks. Rp500.000", icon: Zap, denda: 500000,
    detail: "Setiap orang yang mengemudikan kendaraan bermotor di jalan yang melanggar batas kecepatan paling tinggi atau paling rendah sebagaimana dimaksud dalam Pasal 106 ayat (4) huruf g atau Pasal 115 huruf a dipidana dengan pidana kurungan paling lama 2 bulan atau denda paling banyak Rp500.000."
  },
  {
    pasal: "Pasal 288", jenis: "Tidak Membawa STNK / Dokumen", sanksi: "Kurungan maks. 2 bulan / Denda maks. Rp500.000", icon: FileText, denda: 500000,
    detail: "Setiap orang yang mengemudikan kendaraan bermotor di jalan yang tidak dilengkapi dengan Surat Tanda Nomor Kendaraan Bermotor atau Surat Tanda Coba Kendaraan Bermotor yang ditetapkan oleh Kepolisian Negara Republik Indonesia dipidana dengan pidana kurungan paling lama 2 bulan atau denda paling banyak Rp500.000."
  },
  {
    pasal: "Pasal 289", jenis: "Tidak Menggunakan Sabuk Pengaman", sanksi: "Kurungan maks. 1 bulan / Denda maks. Rp250.000", icon: Lock, denda: 250000,
    detail: "Setiap orang yang mengemudikan kendaraan bermotor atau penumpang yang duduk di samping pengemudi yang tidak mengenakan sabuk keselamatan sebagaimana dimaksud dalam Pasal 106 ayat (6) dipidana dengan pidana kurungan paling lama 1 bulan atau denda paling banyak Rp250.000."
  },
  {
    pasal: "Pasal 291 (1)", jenis: "Tidak Menggunakan Helm SNI", sanksi: "Kurungan maks. 1 bulan / Denda maks. Rp250.000", icon: HardHat, denda: 250000,
    detail: "Setiap orang yang mengemudikan sepeda motor tidak mengenakan helm standar nasional Indonesia sebagaimana dimaksud dalam Pasal 106 ayat (8) dipidana dengan pidana kurungan paling lama 1 bulan atau denda paling banyak Rp250.000."
  },
  {
    pasal: "Pasal 292", jenis: "Melebihi Kapasitas Penumpang", sanksi: "Kurungan maks. 1 bulan / Denda maks. Rp250.000", icon: Users, denda: 250000,
    detail: "Setiap orang yang mengemudikan sepeda motor yang membiarkan penumpangnya tidak mengenakan helm atau membawa penumpang lebih dari 1 orang sebagaimana dimaksud dalam Pasal 106 ayat (9) dipidana dengan pidana kurungan paling lama 1 bulan atau denda paling banyak Rp250.000."
  },
  {
    pasal: "Pasal 293 (1)", jenis: "Tidak Menyalakan Lampu Utama", sanksi: "Kurungan maks. 1 bulan / Denda maks. Rp250.000", icon: Lightbulb, denda: 250000,
    detail: "Setiap orang yang mengemudikan kendaraan bermotor di jalan tanpa menyalakan lampu utama pada malam hari dan kondisi tertentu sebagaimana dimaksud dalam Pasal 107 ayat (1) dipidana dengan pidana kurungan paling lama 1 bulan atau denda paling banyak Rp250.000."
  },
];

const EXAMPLES = [
  "Saya naik motor tanpa helm dan tidak bawa SIM",
  "Tadi saya menerobos lampu merah sambil main HP",
  "Bagaimana tips berkendara motor yang aman?",
  "Apa saja syarat untuk membuat SIM C?",
  "Kenapa harus selalu memakai helm saat berkendara?",
  "Apa yang harus dilakukan saat terjadi kecelakaan?",
];

// ════════════════════════════════════════════════
// THEME CONTEXT
// ════════════════════════════════════════════════
const ThemeCtx = createContext({ dark: false, toggle: () => { } });
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
    .header{border-bottom:3px solid #059669;padding-bottom:16px;margin-bottom:24px}
    .logo{font-size:22px;font-weight:800;color:#059669}
    .logo span{color:#10b981}
    .meta{font-size:12px;color:#64748b;margin-top:4px}
    .desc-box{background:#f1f5f9;border-left:4px solid #059669;padding:12px 16px;border-radius:0 8px 8px 0;margin-bottom:24px}
    .desc-label{font-size:11px;color:#64748b;font-weight:700;margin-bottom:4px}
    .desc-text{font-size:14px;color:#1e293b}
    .section-title{font-size:14px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.05em;margin-bottom:12px}
    .v-card{border:1px solid #e2e8f0;border-radius:10px;padding:16px;margin-bottom:12px;break-inside:avoid}
    .v-header{display:flex;align-items:center;gap:10px;margin-bottom:12px}
    .num{background:#059669;color:#fff;font-size:11px;font-weight:700;padding:2px 8px;border-radius:5px}
    .sev{font-size:11px;padding:2px 8px;border-radius:20px;font-weight:600}
    .sev.high{background:#fee2e2;color:#b91c1c}
    .sev.medium{background:#fef3c7;color:#92400e}
    .sev.low{background:#dcfce7;color:#166534}
    .v-name{font-size:14px;font-weight:700;color:#1e293b}
    .row{display:flex;gap:8px;font-size:12px;margin-bottom:5px}
    .row-label{color:#94a3b8;font-weight:600;min-width:80px}
    .row-val{color:#1e293b}
    .row-val.green{color:#059669;font-weight:600}
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
      <div class="row"><span class="row-label">Pasal</span><span class="row-val green">${v.pasal}</span></div>
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
      try { localStorage.setItem("trafficai_history", JSON.stringify(next.slice(0, 50))); } catch { }
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
// DARK MODE + GLOBAL STYLES
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
            <div className="flex items-center gap-2 mb-2">
              {pasal.icon && <pasal.icon size={20} className="text-emerald-600 shrink-0" />}
              <span className="inline-block bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">
                {pasal.pasal}
              </span>
            </div>
            <h2 className="font-bold text-gray-800 text-base">{pasal.jenis}</h2>
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
    } catch { }
  };
  return (
    <div className="flex items-center gap-2 mt-2 px-1">
      <span className="text-xs text-gray-400">Apakah hasil ini akurat?</span>
      <button
        onClick={() => send("up")}
        disabled={!!given}
        className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg border transition-all ${given === "up"
          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
          : "border-gray-200 text-gray-400 hover:border-emerald-200 hover:text-emerald-600 hover:bg-emerald-50"
          } disabled:cursor-default`}
      >
        <ThumbsUp size={11} /> Ya
      </button>
      <button
        onClick={() => send("down")}
        disabled={!!given}
        className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg border transition-all ${given === "down"
          ? "bg-red-50 border-red-200 text-red-700"
          : "border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-600 hover:bg-red-50"
          } disabled:cursor-default`}
      >
        <ThumbsDown size={11} /> Tidak
      </button>
    </div>
  );
}



// ── ViolationCard (with stagger animation) ───────
function ViolationCard({ v, index, onPasalClick }) {
  const s = SEV[v.severity] ?? SEV.medium;
  const matchedPasal = PASAL_LIST.find(p =>
    v.pasal?.includes(p.pasal.replace(" (1)", "").replace(" (2)", "").replace(" (5)", ""))
  );
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.1, type: "spring", stiffness: 100 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="rounded-2xl p-5 mb-4 last:mb-0 shadow-sm hover:shadow-md transition-all cursor-default relative overflow-hidden"
      style={{
        background: s.bg,
        border: `1px solid ${s.border}`
      }}
    >
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center text-base shrink-0">
          {v.icon ?? "🚫"}
        </div>
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-xs font-bold text-white bg-emerald-600 px-2 py-0.5 rounded-md">#{index + 1}</span>
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
            className={`text-emerald-700 font-semibold text-left ${matchedPasal ? "hover:underline cursor-pointer" : ""} flex items-center gap-1`}
          >
            {v.pasal}
            {matchedPasal && <ExternalLink size={10} className="text-emerald-400" />}
          </button>
        </div>
        {[
          { label: "Sanksi", val: v.sanksi, cls: "text-gray-800" },
          { label: "Keterangan", val: v.penjelasan, cls: "text-gray-500 leading-relaxed" },
        ].map((row, i) => (
          <div key={i} className="flex gap-2 text-xs">
            <span className="text-gray-400 font-medium w-20 shrink-0">{row.label}</span>
            <span className={row.cls}>{row.val}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ── Bubble ───────────────────────────────────────
function Bubble({ msg, onPasalClick, feedback, onFeedback }) {
  const isUser = msg.role === "user";
  if (isUser) {
    return (
      <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="flex justify-end mb-5">
        <div className="max-w-[85%] md:max-w-[75%]">
          <div className="bg-gradient-to-br from-emerald-800 to-emerald-400 text-white rounded-2xl rounded-tr-sm px-4 py-3 text-[15px] leading-relaxed shadow-md">
            {msg.imageBase64 && (
              <img src={msg.imageBase64} alt="Upload" className="max-w-full h-auto rounded-lg mb-2 border border-emerald-500" style={{ maxHeight: 200 }} />
            )}
            <div className="font-normal whitespace-pre-wrap break-words">{msg.content}</div>
          </div>
          <p className="font-normal text-[11px] text-on-surface-variant mt-1.5 px-1 text-right">{msg.time}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="flex justify-start mb-5 gap-2.5">
      <motion.div whileHover={{ rotate: 10 }} className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-800 to-emerald-400 flex items-center justify-center shrink-0 mt-0.5 shadow-md border border-emerald-400/30">
        <Car size={18} className="text-white" />
      </motion.div>
      <div className="max-w-sm sm:max-w-lg lg:max-w-2xl w-full">
        <div className="bg-surface-container-lowest glass-card border border-outline-variant rounded-2xl rounded-tl-sm shadow-md overflow-hidden">
          {/* Error */}
          {msg.isError && (
            <div className="px-4 py-3 bg-error-container">
              <div className="flex items-center gap-1.5 text-on-error-container text-xs font-bold mb-1.5">
                <WifiOff size={12} /> Koneksi gagal
              </div>
              <p className="font-normal text-sm text-on-error-container leading-relaxed">{msg.content}</p>
            </div>
          )}
          {/* Info / educational response */}
          {!msg.isError && msg.content && msg.mode === "info" && (
            <div className="px-4 py-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-tertiary-fixed text-on-tertiary-fixed text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Lightbulb size={12} /> Info Lalu Lintas
                </span>
              </div>
              <p className="font-normal text-sm text-on-surface leading-relaxed whitespace-pre-line">{msg.content}</p>
            </div>
          )}
          {/* Off-topic response */}
          {!msg.isError && msg.content && msg.mode === "off_topic" && (
            <div className="px-4 py-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-error-container text-on-error-container text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Shield size={12} /> Di Luar Topik
                </span>
              </div>
              <p className="font-normal text-sm text-on-surface leading-relaxed">{msg.content}</p>
            </div>
          )}
          {/* Plain message (greeting) */}
          {!msg.isError && msg.content && msg.mode !== "info" && msg.mode !== "off_topic" && (
            <div className="px-4 py-3">
              <p className="font-normal text-sm text-on-surface leading-relaxed">{msg.content}</p>
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
              <div className="flex items-center gap-2 mb-3 py-2 border-t border-gray-100">
                <AlertTriangle size={13} className="text-amber-500" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {msg.violations.length} Pelanggaran Terdeteksi
                </span>
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
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-semibold transition-all border border-emerald-100"
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
    </motion.div>
  );
}

// ── Typing Indicator ─────────────────────────────
function TypingDots() {
  return (
    <div className="flex justify-start mb-5 gap-2.5">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center shrink-0 shadow-sm">
        <Car size={18} className="text-white" />
      </div>
      <div className="bg-white card-surface border border-gray-100 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
        <div className="flex gap-1.5 items-center">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-2 h-2 rounded-full bg-emerald-400"
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
    <div className={`flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-lg ${online === null ? "text-gray-400"
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="overflow-y-auto h-full w-full"
    >
      <div className="max-w-container-max mx-auto px-md py-8 space-y-8">

        {/* ══════════════════════════════════════
            HERO
        ══════════════════════════════════════ */}
        <motion.section
          initial={{ y: 28, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.55, type: "spring", stiffness: 90 }}
          className="relative overflow-hidden rounded-3xl shadow-2xl"
          style={{
            background: "linear-gradient(135deg, #022c22 0%, #064e3b 40%, #059669 70%, #10b981 100%)",
          }}
        >
          {/* ── decorative layer ── */}
          {/* dot-grid overlay */}
          <div className="pointer-events-none absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "28px 28px"
          }} />
          {/* glowing orbs */}
          <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(52,211,153,0.18) 0%, transparent 70%)" }} />
          <div className="pointer-events-none absolute -bottom-20 -left-20 w-72 h-72 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)" }} />
          <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-40 rounded-full"
            style={{ background: "radial-gradient(ellipse, rgba(16,185,129,0.08) 0%, transparent 70%)" }} />

          <div className="relative z-10 px-8 md:px-12 py-12 md:py-14">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-10 items-center">

              {/* ── LEFT: copy ── */}
              <div className="w-full overflow-hidden">
                {/* badge */}
                <motion.div
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-2 mb-6 rounded-full border px-4 py-1.5"
                  style={{ background: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.16)" }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <span className="text-[11px] font-bold text-white/80 uppercase tracking-[0.15em]">
                    AI-Powered · UU No.22 Tahun 2009
                  </span>
                </motion.div>

                {/* headline */}
                <motion.h1
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.5 }}
                  className="font-extrabold leading-[1.1] tracking-tight text-white mb-5"
                  style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
                >
                  Asisten Edukasi<br />
                  <span style={{
                    background: "linear-gradient(90deg, #34d399 0%, #10b981 50%, #059669 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent"
                  }}>
                    Lalu Lintas
                  </span>{" "}
                  <span className="text-white">Indonesia</span>
                </motion.h1>

                {/* sub */}
                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.22 }}
                  className="text-emerald-200/80 leading-relaxed mb-8 text-base md:text-lg"
                >
                  Deteksi pelanggaran, konsultasi aturan, dan analisis foto berkendara — didukung AI dengan referensi hukum akurat secara instan.
                </motion.p>

                {/* CTAs */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-wrap gap-3 mb-10"
                >
                  <button
                    onClick={() => goTo("konsultasi")}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all active:scale-95"
                    style={{ background: "#10b981", color: "#fff", boxShadow: "0 0 0 1px rgba(255,255,255,0.1) inset, 0 8px 24px rgba(16,185,129,0.4)" }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 0 1px rgba(255,255,255,0.15) inset, 0 12px 32px rgba(16,185,129,0.55)"}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = "0 0 0 1px rgba(255,255,255,0.1) inset, 0 8px 24px rgba(16,185,129,0.4)"}
                  >
                    <MessageSquare size={15} /> Mulai Konsultasi
                  </button>
                  <button
                    onClick={() => goTo("informasi")}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95"
                    style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.9)" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.14)"}
                    onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
                  >
                    <BookOpen size={15} /> Lihat Pasal
                  </button>
                </motion.div>

                {/* ── tech stack strip ── */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-wrap items-center gap-3"
                >
                  {[
                    { label: "Llama 3.3-70B", color: "#f59e0b" },
                    { label: "Groq API", color: "#10b981" },
                    { label: "ChromaDB RAG", color: "#8b5cf6" },
                    { label: "BLIP Vision", color: "#10b981" },
                    { label: "React + Tailwind v4", color: "#06b6d4" },
                  ].map(({ label, color }) => (
                    <span key={label}
                      className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.75)" }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
                      {label}
                    </span>
                  ))}
                </motion.div>
              </div>

              {/* ── RIGHT: demo card ── */}
              <motion.div
                initial={{ opacity: 0, x: 24, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ delay: 0.25, duration: 0.55, type: "spring" }}
                className="hidden lg:block shrink-0 w-72"
              >
                {/* Mock violation card */}
                <div className="rounded-2xl overflow-hidden shadow-2xl"
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.14)", backdropFilter: "blur(16px)" }}>
                  {/* header */}
                  <div className="px-4 py-3 flex items-center gap-2"
                    style={{ background: "rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    <div className="w-2 h-2 rounded-full bg-yellow-400" />
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <span className="ml-2 text-[11px] text-white/40 font-mono">TrafficAI · Live Demo</span>
                  </div>
                  {/* user message */}
                  <div className="px-4 pt-4 pb-2">
                    <div className="flex justify-end mb-3">
                      <div className="rounded-xl rounded-tr-sm px-3 py-2 text-xs font-medium text-white max-w-[85%]"
                        style={{ background: "rgba(16,185,129,0.7)" }}>
                        Saya naik motor tanpa helm dan tidak bawa SIM
                      </div>
                    </div>
                    {/* ai response */}
                    <div className="rounded-xl rounded-tl-sm px-3 py-2.5"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                      <p className="text-[11px] font-semibold text-white/70 mb-2">2 Pelanggaran Terdeteksi</p>
                      {/* violation pills */}
                      {[
                        { pasal: "Pasal 291 (1)", jenis: "Tanpa Helm SNI", denda: "Rp250.000", sev: "#f59e0b" },
                        { pasal: "Pasal 281", jenis: "Tidak Miliki SIM", denda: "Rp1.000.000", sev: "#ef4444" },
                      ].map((v, i) => (
                        <div key={i} className="mb-1.5 last:mb-0 rounded-lg px-2.5 py-2"
                          style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${v.sev}30` }}>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                              style={{ background: `${v.sev}25`, color: v.sev }}>{v.pasal}</span>
                            <span className="text-[10px] font-bold" style={{ color: v.sev }}>{v.denda}</span>
                          </div>
                          <p className="text-[10px] text-white/60 mt-1">{v.jenis}</p>
                        </div>
                      ))}
                      {/* total */}
                      <div className="mt-2 rounded-lg px-2.5 py-1.5 flex justify-between items-center"
                        style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)" }}>
                        <span className="text-[10px] text-amber-300/80 font-semibold">Total Estimasi</span>
                        <span className="text-[11px] font-extrabold text-amber-300">Rp1.250.000</span>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 pb-3 pt-1">
                    <div className="flex items-center gap-2 rounded-lg px-3 py-2"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <span className="text-[11px] text-white/30 flex-1">Ketik pertanyaan hukum...</span>
                      <Send size={11} className="text-emerald-400 shrink-0" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* ── bottom stats bar ── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="mt-8 pt-6 flex flex-wrap gap-x-8 gap-y-3"
              style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
            >
              {[
                { val: "12+ Pasal", icon: BookOpen },
                { val: "3-Step Vision AI", icon: Camera },
                { val: "RAG Pipeline", icon: Search },
                { val: "100% Edukatif", icon: Shield },
              ].map(({ val, icon: Icon }, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Icon size={13} className="text-emerald-300/70 shrink-0" />
                  <span className="text-[13px] font-semibold text-white/60">{val}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* ══════════════════════════════════════
            SERVICES + SIDEBAR
        ══════════════════════════════════════ */}
        <div className="grid grid-cols-12 gap-6">
          {/* Services */}
          <section className="col-span-12 md:col-span-8 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 rounded-full bg-emerald-600" />
              <span className="text-xs font-black uppercase tracking-widest text-emerald-600">Layanan Utama</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  id: "konsultasi", icon: MessageSquare,
                  gradient: "linear-gradient(135deg, #059669 0%, #065f46 100%)",
                  glow: "rgba(5,150,105,0.20)",
                  title: "Deteksi Pelanggaran",
                  desc: "Ceritakan kronologi berkendara dan dapatkan breakdown pasal & denda secara instan.",
                  badge: "AI Chat"
                },
                {
                  id: "informasi", icon: BookOpen,
                  gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  glow: "rgba(16,185,129,0.20)",
                  title: "Database Pasal",
                  desc: "12+ pasal UU No.22 Tahun 2009 dengan penjelasan mudah dipahami & pencarian cepat.",
                  badge: "12+ Pasal"
                },
              ].map(({ id, icon: Icon, gradient, glow, title, desc, badge }) => (
                <motion.div
                  key={id}
                  whileHover={{ y: -5 }}
                  onClick={() => goTo(id)}
                  className="glass-card rounded-2xl p-6 cursor-pointer group relative overflow-hidden"
                  style={{ transition: "box-shadow 0.3s" }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = `0 16px 40px -8px ${glow}`}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = ""}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"
                      style={{ background: gradient }}>
                      <Icon size={20} className="text-white" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full"
                      style={{ background: "rgba(5,150,105,0.08)", color: "#059669", border: "1px solid rgba(5,150,105,0.15)" }}>
                      {badge}
                    </span>
                  </div>
                  <h4 className="font-bold text-base text-info-heading mb-2">{title}</h4>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{desc}</p>
                  <div className="flex items-center gap-1 mt-4 text-xs font-bold text-emerald-600 opacity-0 group-hover:opacity-100 translate-x-0 group-hover:translate-x-1 transition-all">
                    Buka sekarang <ChevronRight size={12} />
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              whileHover={{ y: -3 }}
              onClick={() => goTo("riwayat")}
              className="glass-card rounded-2xl p-5 cursor-pointer group flex items-center gap-4 relative overflow-hidden"
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 12px 32px -8px rgba(5,150,105,0.18)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = ""}
              style={{ transition: "box-shadow 0.3s" }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform"
                style={{ background: "linear-gradient(135deg, #059669 0%, #064e3b 100%)" }}>
                <History size={22} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-0.5">Auto-saved</p>
                <h4 className="font-bold text-base text-info-heading">Riwayat Konsultasi</h4>
                <p className="text-sm text-on-surface-variant truncate">Ulas kembali konsultasi sebelumnya yang tersimpan di browser.</p>
              </div>
              <ChevronRight size={18} className="text-outline group-hover:text-emerald-600 shrink-0 transition-colors" />
            </motion.div>
          </section>

          {/* Sidebar */}
          <aside className="col-span-12 md:col-span-4">
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card rounded-2xl p-5 h-full"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1 h-4 rounded-full bg-emerald-600" />
                <p className="text-xs font-black uppercase tracking-widest text-emerald-600">Coba Tanya</p>
              </div>
              <h3 className="font-bold text-lg text-info-heading mb-4">Contoh Pertanyaan</h3>
              <div className="flex flex-col gap-2">
                {EXAMPLES.slice(0, 4).map((ex, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => goTo("konsultasi", ex)}
                    className="text-left border border-outline-variant hover:border-emerald-300 p-3 rounded-xl text-sm text-info-heading transition-all flex items-start gap-2.5 group"
                    style={{ background: "var(--color-surface-container-low)" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(16,185,129,0.04)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "var(--color-surface-container-low)"; }}
                  >
                    <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5 transition-all"
                      style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#10b981"; e.currentTarget.style.color = "#fff"; }}
                    >
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{ex}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </aside>
        </div>

        <Footer />
      </div>
    </motion.div>
  );
}

// ── Konsultasi ───────────────────────────────────
function KonsultasiPage({ initMsg, setHistory }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState(initMsg || "");
  const [loading, setLoading] = useState(false);
  const [online, setOnline] = useState(null);
  const [feedback, setFeedback] = useState({});
  const [modalPasal, setModalPasal] = useState(null);

  const [imageBase64, setImageBase64] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 8000000) {
      alert("Gambar terlalu besar (maks ~8MB).");
      return;
    }
    setImagePreview(URL.createObjectURL(file));
    const reader = new FileReader();
    reader.onload = (event) => setImageBase64(event.target.result);
    reader.readAsDataURL(file);
  };

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
    if ((!text && !imageBase64) || loading) return;
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const imgB64 = imageBase64;
    setImagePreview(null);
    setImageBase64(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    const msgId = `msg_${Date.now()}`;
    const userMsg = { id: `u_${Date.now()}`, role: "user", content: text, time: getTime(), imageBase64: imgB64 };
    const withUser = [...messages, userMsg];
    setMessages(withUser);
    setLoading(true);

    try {
      // Route: gambar -> /api/detect-image, teks saja -> /api/chat
      const isImageOnly = !!imgB64;
      const endpoint = isImageOnly ? `${API_BASE}/api/detect-image` : `${API_BASE}/api/chat`;
      const payload = isImageOnly
        ? { image_base64: imgB64.split(",")[1] ?? imgB64, filename: "chat_image.jpg" }
        : { message: text };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(120000),
      });

      let data;
      try {
        data = await res.json();
      } catch (e) {
        throw new Error(`HTTP ${res.status}: Gagal membaca respons dari server.`);
      }

      setOnline(true);
      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      if (data.error) throw new Error(data.error);

      const hasV = data.is_violation && data.violations?.length > 0;
      const mode = data.mode || (hasV ? "violation" : "greeting");
      const aiMsg = {
        id: msgId,
        role: "assistant",
        mode: mode,
        content: !hasV ? data.message : undefined,
        summary: hasV ? data.message : undefined,
        violations: data.violations ?? [],
        avgConfidence: data.avg_confidence,
        userInput: text,
        time: getTime(),
      };

      const finalChat = [...withUser, aiMsg];
      setMessages(finalChat);

      if (hasV) {
        setHistory(prev => [{
          id: Date.now(),
          preview: text.length > 60 ? text.slice(0, 60) + "…" : text,
          dateStr: getDate() + ", " + getTime(),
          count: data.violations.length,
          messages: finalChat,
        }, ...prev]);
      }
    } catch (err) {
      setOnline(false);
      const isTO = err.name === "TimeoutError";
      let errMsg = isTO ? "Waktu tunggu habis (60 detik). Coba lagi sebentar." : err.message;
      if (errMsg === "Failed to fetch") errMsg = "Tidak dapat terhubung ke backend. Pastikan server menyala.";

      setMessages([...withUser, {
        id: msgId, role: "assistant",
        content: errMsg,
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
      <div className="chat-header bg-surface/90 backdrop-blur-md border-b border-outline-variant px-5 py-3.5 flex items-center justify-between shrink-0 z-10 sticky top-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-800 to-emerald-400 flex items-center justify-center shadow-md">
            <Car size={15} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-800 text-sm leading-tight">Konsultan Lalu Lintas AI</p>
            <StatusBadge online={online} />
          </div>
        </div>
        {messages.length > 0 && (
          <button onClick={() => setMessages([])} className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50 border border-transparent hover:border-red-100">
            <RefreshCw size={11} /> Reset Chat
          </button>
        )}
      </div>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 pt-5 pb-2 page-bg">
        {messages.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center h-full text-center pb-8 w-full">
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="bg-gradient-to-br from-emerald-800 to-emerald-400 rounded-3xl p-6 mb-6 shadow-xl border border-emerald-400/30"><Car size={48} className="text-white" /></motion.div>
            <h3 className="font-extrabold text-info-heading text-2xl mb-3 tracking-tight">Konsultasi Hukum Berlalu Lintas</h3>
            <p className="font-medium text-gray-500 text-[15px] max-w-2xl w-full px-4 mb-8 leading-relaxed">
              Ceritakan kronologi untuk deteksi pelanggaran, atau tanyakan referensi aturan lalu lintas secara langsung.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-3xl px-4">
              {EXAMPLES.map((ex, i) => (
                <button key={i} onClick={() => send(ex)}
                  className="text-left font-normal text-sm bg-surface-container-lowest card-surface border border-outline-variant rounded-xl px-4 py-3 hover:border-primary-fixed hover:bg-surface-container-low transition-all text-info-heading flex items-center gap-2.5 group shadow-sm">
                  <Search size={14} className="text-secondary group-hover:text-emerald-500 shrink-0" />{ex}
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <div className="max-w-4xl mx-auto w-full">
            {messages.map((m, i) => (
              <Bubble key={i} msg={m} onPasalClick={setModalPasal} feedback={feedback} onFeedback={handleFeedback} />
            ))}
            {loading && <TypingDots />}
            <div ref={bottomRef} />
          </div>
        )}
      </div>
      {/* Input */}
      <div className="chat-input-bar bg-surface/80 backdrop-blur-md border-t border-outline-variant p-4 md:p-6 shrink-0 relative z-10">
        <AnimatePresence>
          {imagePreview && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute bottom-full left-0 mb-2 ml-4 z-10">
              <div className="relative inline-block">
                <img src={imagePreview} alt="Preview" className="h-20 w-auto rounded-lg border border-outline-variant shadow-sm object-cover" />
                <button onClick={() => { setImagePreview(null); setImageBase64(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                  className="absolute -top-2 -right-2 bg-error text-white rounded-full p-1 shadow-md hover:bg-red-600 z-10">
                  <X size={12} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex items-end gap-2 bg-surface-container-low input-bg rounded-2xl px-4 py-3 border border-outline-variant focus-within:border-primary-fixed transition-colors shadow-sm max-w-4xl mx-auto">
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
          <button onClick={() => fileInputRef.current?.click()} className="text-on-surface-variant hover:text-primary-fixed transition-colors shrink-0 pb-1">
            <Camera size={20} />
          </button>
          <textarea ref={textareaRef} rows={1} value={input} onChange={handleInputChange}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Ketik pertanyaan hukum atau unggah bukti gambar..."
            className="flex-1 bg-transparent text-sm text-on-surface font-normal resize-none outline-none placeholder-outline py-0.5"
            style={{ minHeight: "24px", maxHeight: "96px" }} />
          <button onClick={() => send()} disabled={(!input.trim() && !imageBase64) || loading}
            className="bg-primary-fixed text-white rounded-xl p-2.5 hover:bg-emerald-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 shadow-sm active:scale-95">
            <Send size={16} />
          </button>
        </div>
        <p className="text-[11px] font-normal text-outline text-center mt-2 max-w-4xl mx-auto">Enter untuk kirim · Shift+Enter untuk baris baru · TrafficAI dapat melakukan kesalahan. Harap verifikasi info penting.</p>
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="overflow-y-auto h-full w-full page-bg">
      {modal && <PasalModal pasal={modal} onClose={() => setModal(null)} />}
      <div className="max-w-container-max mx-auto px-md py-lg min-h-screen flex flex-col">
        <div className="mb-8">
          <h1 className="font-extrabold tracking-tighter text-4xl md:text-5xl text-info-heading mb-2 drop-shadow-sm">Database Aturan Lalu Lintas</h1>
          <p className="font-medium text-on-surface-variant text-base">UU No. 22 Tahun 2009 — klik kartu untuk detail bunyi pasal</p>
        </div>
        <div className="relative mb-8">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Cari pasal atau jenis pelanggaran..."
            className="w-full pl-12 pr-4 py-3.5 border border-outline-variant rounded-xl font-medium text-[15px] outline-none focus:border-primary-fixed focus:ring-2 focus:ring-primary-fixed/20 transition-all bg-surface-container-lowest glass-card text-on-surface shadow-sm" />
        </div>
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 flex-grow">
          <AnimatePresence>
            {filtered.map((p, i) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                key={p.pasal}
                onClick={() => setModal(p)}
                whileHover={{ y: -5, scale: 1.02 }} className="glass-card bg-surface-container-lowest rounded-2xl p-6 hover:shadow-lg hover:border-primary-fixed-dim transition-all cursor-pointer group flex flex-col"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-800 to-emerald-400 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-emerald-400/30">
                    <p.icon size={24} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="inline-block bg-secondary-fixed text-on-secondary-fixed font-semibold text-[11px] px-2.5 py-0.5 rounded-full">{p.pasal}</span>
                      <ExternalLink size={14} className="text-outline group-hover:text-primary-fixed transition-colors" />
                    </div>
                    <h3 className="font-extrabold text-base text-info-heading leading-tight">{p.jenis}</h3>
                  </div>
                </div>
                <div className="mt-auto flex items-start gap-2 bg-error-container rounded-xl p-3 border border-red-100 dark:border-red-900/30">
                  <AlertTriangle size={14} className="text-on-error-container shrink-0 mt-0.5" />
                  <p className="font-normal text-xs text-on-error-container font-medium leading-relaxed">{p.sanksi}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {filtered.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full text-center py-20 text-outline">
              <Search size={40} className="mx-auto mb-4 opacity-30" />
              <p className="font-normal text-base">Tidak ditemukan pelanggaran untuk "{q}"</p>
            </motion.div>
          )}
        </motion.div>
        <Footer />
      </div>
    </motion.div>
  );
}

// ── Riwayat ──────────────────────────────────────
function RiwayatPage({ history, goToChat, onClear }) {
  const [search, setSearch] = useState("");
  const filtered = history.filter(h => h.preview.toLowerCase().includes(search.toLowerCase()));

  if (history.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col items-center justify-center text-center px-6 page-bg w-full">
        <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-[2rem] p-8 mb-6 shadow-md border border-emerald-200/50">
          <History size={56} className="text-emerald-500" />
        </motion.div>
        <h3 className="font-extrabold text-2xl text-gray-800 mb-3 tracking-tight">Belum Ada Riwayat</h3>
        <p className="font-medium text-gray-500 text-[15px] max-w-md w-full leading-relaxed">
          Riwayat tersimpan otomatis ke browser setelah Anda melakukan konsultasi.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="overflow-y-auto h-full w-full page-bg">
      <div className="max-w-3xl mx-auto px-md py-lg min-h-screen flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-extrabold tracking-tighter text-4xl md:text-5xl text-info-heading drop-shadow-sm">Riwayat Konsultasi</h1>
          <button onClick={onClear} className="font-normal text-xs text-on-error-container bg-error-container hover:bg-red-200 transition-colors flex items-center gap-1 px-3 py-1.5 rounded-lg shadow-sm">
            <X size={12} /> Hapus semua
          </button>
        </div>
        <div className="relative mb-6">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari riwayat..."
            className="w-full pl-12 pr-4 py-3.5 border border-outline-variant rounded-xl font-medium text-[15px] outline-none focus:border-primary-fixed focus:ring-2 focus:ring-primary-fixed/20 bg-surface-container-lowest glass-card shadow-sm transition-all" />
        </div>
        <motion.div layout className="space-y-4 mb-8 flex-grow">
          <AnimatePresence>
            {filtered.map(h => (
              <motion.button
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={h.id}
                onClick={() => goToChat(h)}
                whileHover={{ scale: 1.01, x: 5 }} className="w-full bg-surface-container-lowest glass-card border border-outline-variant rounded-2xl p-5 text-left hover:border-primary-fixed hover:bg-surface-container-low transition-all shadow-md group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 pr-4 min-w-0">
                    <p className="font-bold text-sm font-semibold text-on-surface group-hover:text-primary-fixed truncate mb-2">{h.preview}</p>
                    <div className="flex items-center gap-3">
                      <span className="font-normal text-xs text-on-surface-variant flex items-center gap-1"><Clock size={12} /> {h.dateStr}</span>
                      <span className="bg-error-container text-on-error-container text-[11px] px-2 py-0.5 rounded-full font-bold">{h.count} pelanggaran</span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-outline group-hover:text-primary-fixed shrink-0" />
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
          {filtered.length === 0 && search && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-normal text-sm text-center text-outline py-8">Tidak ditemukan untuk "{search}"</motion.p>
          )}
        </motion.div>
        <Footer />
      </div>
    </motion.div>
  );
}

// ── Evaluasi (Admin / Bab IV) ─────────────────────
function EvaluasiPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/stats`);
      const data = await res.json();
      setStats(data);
    } catch {
      setStats(null);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const copyStats = () => {
    if (!stats) return;
    const text = `TrafficAI — Statistik Evaluasi\n\nTotal Query: ${stats.total_queries}\nQuery Pelanggaran: ${stats.violation_queries}\nRata-rata Pelanggaran/Kasus: ${stats.avg_violations_per_case}\nRetrieval Relevance: ${(stats.avg_confidence * 100).toFixed(1)}%\nFeedback Positif: ${stats.positive_feedback}\nFeedback Negatif: ${stats.negative_feedback}\nTingkat Kepuasan: ${stats.satisfaction_rate}%`;
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  if (loading) return (
    <div className="h-full flex items-center justify-center page-bg">
      <div className="text-center text-gray-400">
        <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">Memuat statistik...</p>
      </div>
    </div>
  );

  if (!stats) return (
    <div className="h-full flex flex-col items-center justify-center page-bg text-center px-6">
      <WifiOff size={32} className="text-gray-300 mb-3" />
      <p className="text-sm font-semibold text-gray-500 mb-1">Tidak dapat memuat statistik</p>
      <p className="text-xs text-gray-400 mb-4">Pastikan backend Flask berjalan</p>
      <button onClick={load} className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5">
        <RefreshCw size={13} /> Coba lagi
      </button>
    </div>
  );

  const metrics = [
    { label: "Total Query", val: stats.total_queries, unit: "" },
    { label: "Query Pelanggaran", val: stats.violation_queries, unit: "" },
    { label: "Rata-rata Pelanggaran", val: stats.avg_violations_per_case, unit: "/kasus" },
    { label: "Retrieval Relevance", val: (stats.avg_confidence * 100).toFixed(1), unit: "%" },
    { label: "Feedback Positif 👍", val: stats.positive_feedback, unit: "" },
    { label: "Feedback Negatif 👎", val: stats.negative_feedback, unit: "" },
  ];

  return (
    <div className="overflow-y-auto h-full w-full page-bg">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800 flex items-center gap-3 tracking-tight">
              <BarChart2 size={22} className="text-emerald-600" /> Evaluasi Sistem
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
              className="flex items-center gap-1.5 text-xs px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl font-semibold transition-all">
              <RefreshCw size={12} /> Refresh
            </button>
          </div>
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          {metrics.map((m, i) => (
            <div key={i} className="bg-surface-container-lowest glass-card rounded-2xl border border-outline-variant p-5 shadow-md hover:shadow-lg transition-shadow">
              <p className="text-xs text-gray-500 mb-1">{m.label}</p>
              <p className="text-2xl font-extrabold text-emerald-600">{m.val}<span className="text-base font-semibold text-gray-400">{m.unit}</span></p>
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
                      {q.is_violation ? `${q.violations_count} pelang.` : "Info/Sapaan"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-700 truncate">{q.query}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Relevance: {(q.avg_confidence * 100).toFixed(1)}%</p>
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
function Footer() {
  return (
    <footer className="bg-surface-container-lowest border-t border-outline-variant mt-10">
      <div className="max-w-container-max mx-auto px-md py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-gradient-to-br from-primary-fixed to-emerald-700 rounded-lg p-1.5 shadow-sm">
                <Car size={16} className="text-white" />
              </div>
              <span className="font-bold text-info-heading ">TrafficAI</span>
            </div>
            <p className="font-normal text-sm text-on-surface-variant mb-4">
              Sistem edukasi hukum berbasis AI yang membantu masyarakat memahami pelanggaran lalu lintas dan sanksinya berdasarkan UU No. 22 Tahun 2009.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-lg text-info-heading mb-4">Teknologi</h4>
            <ul className="space-y-2 font-normal text-sm text-on-surface-variant">
              <li className="flex items-center gap-2"><span className="text-info-heading"><Zap size={14} /></span> Groq API + Llama 3.3-70B</li>
              <li className="flex items-center gap-2"><span className="text-info-heading"><Search size={14} /></span> RAG & ChromaDB</li>
              <li className="flex items-center gap-2"><span className="text-info-heading"><BookOpen size={14} /></span> UU No. 22 Tahun 2009</li>
              <li className="flex items-center gap-2"><span className="text-info-heading"><Shield size={14} /></span> React + Tailwind v4</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg text-info-heading mb-4">Disclaimer</h4>
            <div className="bg-error-container text-on-error-container p-3 rounded-lg flex items-start gap-2">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <p className="font-normal text-[12px] leading-relaxed">
                Hasil analisis bersifat edukatif. Informasi ini tidak menggantikan keputusan resmi pihak berwenang (Kepolisian/Pengadilan).
              </p>
            </div>
          </div>
        </div>
        <div className="border-t border-outline-variant mt-8 pt-6 flex flex-col md:flex-row items-center justify-between font-normal text-xs text-outline">
          <p>&copy; {new Date().getFullYear()} TrafficAI. All rights reserved.</p>
          <p>Didesain untuk Profesionalisme & Edukasi</p>
        </div>
      </div>
    </footer>
  );
}



// ════════════════════════════════════════════════
// MAIN APP
// ════════════════════════════════════════════════
export default function App() {
  const [dark, toggleDark] = useDarkMode();
  const [page, setPage] = useState("home");
  const [initPrompt, setInitPrompt] = useState("");
  const [history, setHistory, clearHistory] = usePersistentHistory();
  const [mobileOpen, setMobileOpen] = useState(false);

  const NAV = [
    { id: "home", label: "Home", icon: Home },
    { id: "konsultasi", label: "Consult", icon: MessageSquare },
    { id: "informasi", label: "Laws", icon: BookOpen },
    { id: "riwayat", label: "History", icon: History },
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
        ${DARK_CSS}
      `}</style>

      <div className={`h-screen flex flex-col bg-background text-on-surface page-bg ${dark ? "tm-dark" : ""}`}>
        {/* Navbar */}
        <nav className="bg-surface border-b border-outline-variant shrink-0 z-50 shadow-sm transition-colors">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <button onClick={() => goTo("home")} onDoubleClick={() => goTo("evaluasi")} className="flex items-center gap-2 group">
              <div className="bg-gradient-to-br from-emerald-800 to-emerald-400 rounded-xl p-2 shadow-md group-hover:shadow-emerald-300/40 transition-shadow">
                <Car size={15} className="text-white" />
              </div>
              <span className="font-extrabold text-info-heading text-lg tracking-tight">Traffic<span className="text-emerald-600">AI</span></span>
            </button>

            <div className="hidden sm:flex items-center gap-0.5">
              {NAV.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => goTo(id)}
                  className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${page === id
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/25"
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                    }`}>
                  <Icon size={13} />
                  {label}
                  {id === "riwayat" && history.length > 0 && (
                    <span className={`text-[10px] rounded-full w-4 h-4 flex items-center justify-center leading-none font-bold ${page === id ? "bg-white text-emerald-600" : "bg-emerald-600 text-white"}`}>
                      {history.length > 9 ? "9+" : history.length}
                    </span>
                  )}
                </button>
              ))}
              <div className="w-px h-5 bg-gray-200 mx-1" />
              <button onClick={toggleDark}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
                title={dark ? "Mode terang" : "Mode gelap"}>
                {dark ? <Sun size={15} /> : <Moon size={15} />}
              </button>
            </div>

            <button className="sm:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors" onClick={() => setMobileOpen(o => !o)}>
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {mobileOpen && (
            <div className="sm:hidden bg-surface border-t border-outline-variant px-4 py-3 space-y-1 transition-colors">
              {NAV.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => goTo(id)}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all ${page === id
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                    }`}>
                  <Icon size={16} /> {label}
                  {id === "riwayat" && history.length > 0 && (
                    <span className={`ml-auto text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold ${page === id ? "bg-white text-emerald-600" : "bg-emerald-600 text-white"}`}>
                      {history.length > 9 ? "9+" : history.length}
                    </span>
                  )}
                </button>
              ))}
              <div className="border-t border-gray-100 pt-2">
                <button onClick={toggleDark}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-all">
                  {dark ? <Sun size={16} /> : <Moon size={16} />}
                  {dark ? "Mode Terang" : "Mode Gelap"}
                </button>
              </div>
            </div>
          )}
        </nav>

        {/* Page content */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {page === "home" && <HomePage key="home" goTo={goTo} />}
            {page === "konsultasi" && (
              <KonsultasiPage key={initPrompt || "chat"} initMsg={initPrompt} setHistory={setHistory} />
            )}
            {page === "informasi" && <InformasiPage key="info" />}
            {page === "riwayat" && <RiwayatPage key="riwayat" history={history} goToChat={goToChat} onClear={clearHistory} />}
            {page === "evaluasi" && <EvaluasiPage key="eval" />}
          </AnimatePresence>
        </div>
      </div>
    </ThemeCtx.Provider>
  );
}
