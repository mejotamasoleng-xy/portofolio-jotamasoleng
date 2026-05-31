import { motion, AnimatePresence } from "motion/react";
import { X, CheckCircle, AlertCircle, Github, Smartphone, Laptop, RefreshCw, BarChart3, HelpCircle, Sparkles } from "lucide-react";
import { useState, useRef } from "react";
import { Project } from "../types";

interface ProjectModalProps {
  project: Project;
  onClose: () => void;
  lang?: "ID" | "EN";
}

type TabType = "story" | "fitur" | "demo" | "impact";

export default function ProjectModal({ project, onClose, lang = "ID" }: ProjectModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("story");
  const [deviceMode, setDeviceMode] = useState<"mobile" | "desktop">("mobile");
  const [iframeKey, setIframeKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const reloadIframe = () => {
    setIframeKey((prev) => prev + 1);
  };

  const getTabLabel = (tab: TabType) => {
    const labels = {
      ID: {
        story: "Story / Before-After",
        fitur: "Daftar Fitur",
        demo: "Demo Live Simulator",
        impact: "Dampak / ROI",
      },
      EN: {
        story: "Story / Before-After",
        fitur: "Features List",
        demo: "Demo Live Simulator",
        impact: "Metrics & Impact",
      },
    };
    return labels[lang][tab];
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-6 bg-[#1A1A1A]/60 backdrop-blur-md">
        {/* Backdrop Trigger */}
        <div className="absolute inset-0" onClick={onClose} />

        {/* Modal Sheet */}
        <motion.div
          layoutId={`card-container-${project.id}`}
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          transition={{ type: "spring", damping: 26, stiffness: 210 }}
          className="relative bg-[#FCFAF7] dark:bg-[#1C1917] w-full max-w-5xl h-[95vh] md:h-[85vh] rounded-none shadow-2xl overflow-hidden border border-editorial-line dark:border-neutral-800 flex flex-col z-10 select-text transition-colors"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-10 h-10 rounded-none border border-editorial-line dark:border-neutral-800 bg-editorial-bg dark:bg-stone-900 text-editorial-text dark:text-neutral-200 hover:bg-editorial-text hover:text-editorial-bg hover:dark:bg-white hover:dark:text-stone-900 transition-all flex items-center justify-center cursor-pointer"
            id="close-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="p-6 md:p-8 border-b border-editorial-line dark:border-neutral-800 shrink-0 select-text pr-14">
            <span className="bg-editorial-accent/10 dark:bg-rose-950 text-editorial-accent dark:text-rose-400 text-[10px] uppercase font-mono-tag tracking-wider font-bold px-3 py-1 rounded-none border border-editorial-accent/25">
              {project.kategori}
            </span>
            <h2 className="text-2xl md:text-3xl font-serif-display font-bold text-editorial-text dark:text-neutral-100 tracking-tight mt-3 mb-1.5">
              {project.nama}
            </h2>
            <p className="text-sm text-editorial-muted dark:text-neutral-400 font-medium italic">
              "{project.tagline}"
            </p>
          </div>

          {/* Tab Selection Bar */}
          <div className="px-6 md:px-8 border-b border-editorial-line dark:border-neutral-800 shrink-0 bg-editorial-bg/30 dark:bg-stone-900/60 overflow-x-auto scrollbar-none flex gap-1">
            {(["story", "fitur", "demo", "impact"] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3.5 px-4 text-xs font-mono-tag font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab
                    ? "border-editorial-accent text-editorial-accent dark:text-rose-400 font-extrabold"
                    : "border-transparent text-editorial-muted dark:text-neutral-400 hover:text-editorial-text hover:border-editorial-line"
                }`}
              >
                {getTabLabel(tab)}
              </button>
            ))}
          </div>

          {/* Modal Body (Scrollable container for passive tabs or fixed structure) */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#FAF8F5] dark:bg-stone-950 flex flex-col justify-between">
            
            {/* TAB CONTENT: STORY */}
            {activeTab === "story" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 md:space-y-8"
              >
                {/* BEFORE / AFTER BULLET COMPARISON */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Before card */}
                  <div className="p-5 border border-red-200 dark:border-red-950 bg-red-50/50 dark:bg-red-950/20 text-red-900 dark:text-red-300 rounded-none">
                    <h5 className="text-[10px] font-bold font-mono-tag tracking-wider uppercase flex items-center gap-1.5 mb-2 text-red-700 dark:text-red-400">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {lang === "ID" ? "SEBELUMNYA (MASALAH OPERASIONAL)" : "BEFORE (OPERATIONAL WASTE)"}
                    </h5>
                    <p className="text-xs leading-relaxed font-sans">
                      {project.problem}
                    </p>
                  </div>

                  {/* After card */}
                  <div className="p-5 border border-emerald-200 dark:border-emerald-950 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300 rounded-none">
                    <h5 className="text-[10px] font-bold font-mono-tag tracking-wider uppercase flex items-center gap-1.5 mb-2 text-emerald-700 dark:text-emerald-400">
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      {lang === "ID" ? "SETELAHNYA (SOLUSI SISTEM KASIR AI)" : "AFTER (INTEGRATED SOLVER SYSTEM)"}
                    </h5>
                    <p className="text-xs leading-relaxed font-sans">
                      {project.before_after || (lang === "ID" ? "Sistem terotomatisasi penuh memangkas kesalahan rekap serta menghemat waktu transaksi dengan pencukupan inventaris langsung." : "The automated system cuts down processing latency, optimizes stock levels, and eliminates computation errors entirely.")}
                    </p>
                  </div>
                </div>

                <div className="border-t border-editorial-line dark:border-neutral-800 pt-6">
                  <h4 className="text-xs font-bold text-editorial-text dark:text-neutral-300 uppercase tracking-widest mb-3 font-mono-tag">
                    {lang === "ID" ? "Latar Belakang Studi Kasus" : "Case Study Context"}
                  </h4>
                  <p className="text-sm text-editorial-muted dark:text-neutral-400 leading-relaxed font-sans">
                    {lang === "ID" 
                      ? "Proyek ini dirancang khusus untuk mengatasi hambatan rantai pasok dan pencatatan kasir di UMKM. Dengan menyederhanakan data kompleks menjadi simulator terdesentralisasi, pelaku usaha dapat memotong kerugian akibat salah pencatatan menu maupun hilangnya informasi stok barang harian." 
                      : "This product targets supply chain bottlenecks and recording inaccuracies for small enterprises. By translating intricate state tracking into a lightweight local application, tenants avoid data loss and manual tally errors."}
                  </p>
                </div>
              </motion.div>
            )}

            {/* TAB CONTENT: FITUR */}
            {activeTab === "fitur" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-white dark:bg-stone-900 border border-editorial-line dark:border-neutral-800 p-6 rounded-none">
                  <h4 className="text-xs font-semibold text-editorial-accent uppercase tracking-widest mb-4 font-mono-tag flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    {lang === "ID" ? "SOLUSI & DAFTAR FITUR REVOLUSIONER" : "CORE SYSTEM CAPABILITIES"}
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {project.fitur.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-[#FAF8F5] dark:bg-stone-950 border border-editorial-line dark:border-neutral-800">
                        <CheckCircle className="w-4 h-4 text-editorial-accent dark:text-rose-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-editorial-text dark:text-neutral-200">
                            {feature.split(" - ")[0]}
                          </p>
                          <p className="text-[11px] text-editorial-muted dark:text-neutral-400 mt-1 leading-normal">
                            {feature.split(" - ")[1] || (lang === "ID" ? "Membantu mengefisienkan proses kerja serta menghindarkan operasional dari kerugian manual." : "Helps streamline high-frequency operations and prevent data loss.")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB CONTENT: DEMO LIVE */}
            {activeTab === "demo" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col h-full overflow-hidden"
              >
                {/* Simulator Controls */}
                <div className="flex justify-between items-center mb-4 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-editorial-accent shrink-0"></div>
                    <span className="text-[10px] uppercase tracking-wider font-mono-tag text-editorial-muted dark:text-neutral-400 font-bold">
                      {lang === "ID" ? "SANDBOX SIMULATOR INTERAKTIF" : "SANDBOX INTERACTIVE SIMULATOR"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-white dark:bg-stone-900 p-1 rounded-none shadow-sm border border-editorial-line dark:border-neutral-800">
                    <button
                      onClick={() => setDeviceMode("mobile")}
                      className={`p-1.5 rounded-none transition-all ${
                        deviceMode === "mobile" ? "bg-editorial-text text-editorial-bg" : "text-editorial-muted hover:text-editorial-text"
                      } cursor-pointer`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeviceMode("desktop")}
                      className={`p-1.5 rounded-none transition-all ${
                        deviceMode === "desktop" ? "bg-editorial-text text-editorial-bg" : "text-editorial-muted hover:text-editorial-text"
                      } cursor-pointer`}
                    >
                      <Laptop className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-[1px] h-4 bg-editorial-line dark:bg-neutral-800 mx-1"></div>
                    <button
                      onClick={reloadIframe}
                      className="p-1.5 rounded-none text-editorial-muted hover:text-editorial-text transition-all cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Simulated Frame Container */}
                <div className="flex-1 flex items-center justify-center bg-stone-100 dark:bg-stone-900 p-2 border border-editorial-line dark:border-neutral-800 overflow-hidden min-h-[340px]">
                  <motion.div
                    animate={{
                      width: deviceMode === "mobile" ? "390px" : "100%",
                      height: "100%",
                    }}
                    transition={{ type: "spring", damping: 25, stiffness: 180 }}
                    className="rounded-none border border-neutral-300 dark:border-stone-700 bg-white shadow-xl overflow-hidden flex flex-col"
                  >
                    <iframe
                      key={iframeKey}
                      ref={iframeRef}
                      title={`${project.nama} Simulator`}
                      srcDoc={project.demo_html}
                      sandbox="allow-scripts allow-modals"
                      referrerPolicy="no-referrer"
                      className="w-full h-full border-none bg-white"
                    />
                  </motion.div>
                </div>
                <p className="text-[10px] text-editorial-muted dark:text-neutral-400 mt-2 text-center">
                  💡 {lang === "ID" ? "Klik menu atau masukkan nilai pesanan di dalam simulator di atas untuk simulasi real-time." : "Click products or input transaction values in the interactive viewport above."}
                </p>
              </motion.div>
            )}

            {/* TAB CONTENT: DAMPAK */}
            {activeTab === "impact" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="text-center max-w-md mx-auto mb-6">
                  <BarChart3 className="w-8 h-8 text-editorial-accent dark:text-rose-400 mx-auto mb-2" />
                  <h3 className="font-serif-display font-medium text-lg text-editorial-text dark:text-neutral-100">
                    {lang === "ID" ? "Estimasi Dampak Bisnis (ROI)" : "Project Financial & Operational Metrics"}
                  </h3>
                  <p className="text-[11px] text-editorial-muted dark:text-neutral-400 mt-1 leading-normal">
                    {lang === "ID" 
                      ? "Metrik nyata yang dihasilkan sistem kasir ini berdasarkan rekap implementasi lapangan pada sampel kedai UMKM." 
                      : "Proven operational results collected from small business field trial installations."}
                  </p>
                </div>

                {/* Project impact numbers list */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {project.impact_numbers && project.impact_numbers.length > 0 ? (
                    project.impact_numbers.map((impact, idx) => (
                      <div key={idx} className="p-5 border border-editorial-line dark:border-neutral-800 bg-white dark:bg-stone-900 text-center flex flex-col justify-center">
                        <p className="text-3xl font-serif-display font-bold text-editorial-accent dark:text-rose-400 mb-1">
                          {impact.value}
                        </p>
                        <p className="text-[10px] font-mono-tag uppercase tracking-widest font-bold text-editorial-muted dark:text-neutral-300">
                          {impact.label}
                        </p>
                      </div>
                    ))
                  ) : (
                    // Defaults if empty
                    [
                      { label: "WAKTU TRANSAKSI", value: "-80%" },
                      { label: "AKURASI LAPORAN", value: "100%" },
                      { label: "BIAYA OPERASIONAL", value: "-15%" }
                    ].map((impact, idx) => (
                      <div key={idx} className="p-5 border border-editorial-line bg-white text-center">
                        <p className="text-3xl font-serif-display font-bold text-editorial-accent mb-1">
                          {impact.value}
                        </p>
                        <p className="text-[10px] font-mono-tag uppercase tracking-widest font-bold text-editorial-muted">
                          {impact.label}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {/* MSME/Investor CTA */}
                <div className="bg-[#1A1A1A] text-[#F7F3EF] dark:bg-stone-900 border border-neutral-800 p-5 rounded-none flex flex-col md:flex-row items-center justify-between gap-4 mt-6">
                  <div>
                    <h5 className="font-serif-display text-sm font-semibold tracking-tight">
                      {lang === "ID" ? "Kepincut dengan performa sistem ini?" : "Intrigued by these efficiency gains?"}
                    </h5>
                    <p className="text-[11px] text-neutral-300 leading-normal mt-0.5">
                      {lang === "ID" 
                        ? "Hubungi saya untuk merancang sistem POS custom yang terintegrasi dengan bisnis spesifik Anda." 
                        : "Connect with me to architect a customized, localized cash system for your retail cafe."}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="bg-white hover:bg-neutral-100 text-[#1A1A1A] text-[10px] font-mono-tag font-bold tracking-widest uppercase px-4 py-2 hover:opacity-95 transition-all cursor-pointer whitespace-nowrap"
                  >
                    {lang === "ID" ? "Konsultasi POS Custom" : "Order POS Consultation"}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Bottom Actions Row */}
            <div className="pt-6 border-t border-editorial-line dark:border-neutral-800 flex items-center justify-between shrink-0 mt-8">
              {project.github_url ? (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2 border border-editorial-text dark:border-neutral-300 hover:bg-editorial-text dark:hover:bg-white hover:text-editorial-bg dark:hover:text-stone-950 text-xs text-editorial-text dark:text-neutral-200 font-bold font-mono-tag tracking-wider uppercase transition-all shadow-sm"
                >
                  <Github className="w-4 h-4" />
                  {lang === "ID" ? "Lihat Repo GitHub" : "View Code on GitHub"}
                </a>
              ) : (
                <div />
              )}

              <span className="text-[9px] text-editorial-muted dark:text-neutral-400 font-mono-tag uppercase tracking-wider">
                {lang === "ID" ? `Terbit: ${project.tanggal_dibuat}` : `Published: ${project.tanggal_dibuat}`}
              </span>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
