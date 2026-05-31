import { useState, useEffect, useRef } from "react";
import { Project, Testimonial, GlobalSettings, ActiveTab } from "./types";
import ProjectCard from "./components/ProjectCard";
import ProjectModal from "./components/ProjectModal";
import AdminPanel from "./components/AdminPanel";
import ContactForm from "./components/ContactForm";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, Coffee, Briefcase, Award, ArrowDown, ExternalLink, 
  Settings, Server, Cpu, Database, ChevronRight, Key, LayoutGrid,
  Loader2, AlertCircle, MessageSquare, Send, X, Star, Moon, Sun, 
  Languages, Calculator, ArrowRight, UserCheck, Heart, Trash2, HelpCircle
} from "lucide-react";

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [settings, setSettings] = useState<GlobalSettings | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");

  // Multi-language State (ID / EN)
  const [lang, setLang] = useState<"ID" | "EN">("ID");

  // Theme State (Light / Dark mode)
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // ROI Calculator inputs
  const [dailyTx, setDailyTx] = useState<number>(85);
  const [timePerTx, setTimePerTx] = useState<number>(3); // minutes

  // AI Floating Assistant state
  const [showChat, setShowChat] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<{ role: "user" | "assistant"; text: string }[]>([]);
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Navigation / Routing State
  const [activeTab, setActiveTab] = useState<ActiveTab>("portfolio");

  // Detect Admin URL Route Slug: `/manage-a7x9k` or query selector
  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes("manage-a7x9k")) {
      setActiveTab("admin");
    }
  }, []);

  // Sync theme
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Load all initial public resources
  useEffect(() => {
    fetchPublicResources();
  }, []);

  const fetchPublicResources = async () => {
    setLoading(true);
    try {
      // 1. Fetch Projects
      const projRes = await fetch("/api/projects");
      if (projRes.ok) {
        const projData = await projRes.json();
        setProjects(projData);
      }

      // 2. Fetch Testimonials
      const testiRes = await fetch("/api/testimonials");
      if (testiRes.ok) {
        const testiData = await testiRes.json();
        setTestimonials(testiData);
      }

      // 3. Fetch Settings
      const settingsRes = await fetch("/api/settings");
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSettings(settingsData);
      }
    } catch (err) {
      console.error("Gagal mengambil data katalog publik:", err);
    } finally {
      setLoading(false);
    }
  };

  // Scroll chat to bottom on conversation update
  useEffect(() => {
    if (showChat) {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, showChat, chatLoading]);

  // Fallback default settings if null
  const defaultSettings: GlobalSettings = {
    nama: settings?.nama || "Jotama Soleng",
    tagline: settings?.tagline || "AI Builder & Automator untuk UMKM & Investor",
    bio: settings?.bio || "Saya membantu pemilik usaha memangkas waktu kerja manual dan meningkatkan profitabilitas usaha hingga 4x lipat menggunakan asisten AI cerdas & sistem kasir terotomatisasi.",
    wa_link: settings?.wa_link || "https://wa.me/6282245210000",
    global_impacts: settings?.global_impacts || [
      { label: "Efisiensi Waktu", value: "85%", desc: "Waktu kasir & administrasi harian terpangkas" },
      { label: "UMKM Terbantu", value: "40+", desc: "Usaha lokal yang terintegrasi otomasi digital" },
      { label: "Rata-Rata ROI", value: "3.5x", desc: "Siklus pengembalian modal teknologi dalam 3 bulan" }
    ],
    system_prompt_ai: settings?.system_prompt_ai || ""
  };

  // List kategori unik dari proyek yang dimuat
  const categories = ["Semua", ...new Set(projects.map((p) => p.kategori))];

  // Filter proyek
  const filteredProjects = selectedCategory === "Semua" 
    ? projects 
    : projects.filter((p) => p.kategori === selectedCategory);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  // ROI Calculations
  // Saving 2.5 minutes per transaction with POS / automations
  const minsSavedPerDay = dailyTx * 2.5; 
  const hoursSavedPerMonth = parseFloat(((minsSavedPerDay * 30) / 60).toFixed(1));
  const hourlyLaborCost = 25000; // default IDR 25K/hour
  const costSavedPerMonth = Math.round(hoursSavedPerMonth * hourlyLaborCost);
  // Manual billing error rate minimized from 10% to 0%. (Average error causes IDR 12.000 leak / error, 3% rate)
  const leakSavingsPerMonth = Math.round(dailyTx * 0.03 * 12000 * 30);
  const totalSavingsPerMonth = costSavedPerMonth + leakSavingsPerMonth;

  // AI Assistant trigger API
  const handleSendChat = async (msgText?: string) => {
    const textToSend = msgText || chatInput;
    if (!textToSend.trim()) return;

    const userMsg = { role: "user" as const, text: textToSend };
    setChatHistory((prev) => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: chatHistory
        })
      });
      if (res.ok) {
        const resData = await res.json();
        setChatHistory((prev) => [...prev, { role: "assistant", text: resData.text || "" }]);
      } else {
        setChatHistory((prev) => [...prev, { role: "assistant", text: lang === "ID" ? "Maaf, sistem AI sedang offline. Silakan coba sesaat lagi!" : "Sorry, the AI model is momentarily busy. Please try again!" }]);
      }
    } catch (err) {
      setChatHistory((prev) => [...prev, { role: "assistant", text: lang === "ID" ? "Kesalahan koneksi ke server AI." : "AI API connection error." }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Language Translation Maps
  const dict = {
    ID: {
      projectsTitle: "Katalog Portofolio Interaktif",
      projectsSubtitle: "Klik salah satu kartu di bawah ini untuk menguji secara langsung simulator program POS atau UMKM tersebut.",
      capTitle: "Mengapa Bermitra dengan Saya?",
      capSubtitle: "Penciptaan aplikasi yang tidak sekadar berfokus ke kode program, melainkan berfokus kepada otomatisasi pemecahan masalah nyata.",
      calculatorTitle: "Kalkulator ROI & Penghematan Bisnis",
      calculatorSubtitle: "Lihat seberapa banyak waktu dan uang kas yang bisa dihemat toko Anda dengan beralih ke sistem pembukuan terotomatisasi.",
      calcInputs: "PARAMETER OPERASIONAL TOKO",
      calcResults: "ESTIMASI MANFAAT BULANAN (ROI)",
      txLabel: "Jumlah Transaksi Harian",
      timeLabel: "Waktu Proses per Transaksi (Menit)",
      hoursSaved: "Waktu Kerja Dihemat",
      laborSavings: "Penghematan Gaji Staff",
      leakSavings: "Kebocoran Kas Tercegah",
      totalSavings: "Total Dana Dihemat",
      totalSavingsSub: "per bulan",
      consCTA: "Konsultasikan Toko Anda Sekarang",
      testiTitle: "Ulasan Kemitraan Klien",
      testiSubtitle: "Dengarkan opini dari pemilik UMKM lokal dan mitra investor yang telah mencoba sistem digital terintegrasi.",
      contactCTA: "Mulai Kolaborasi Sekarang",
      directPhone: "WhatsApp (Kontak Langsung)",
      heroCTA1: "Jelajahi Proyek",
      heroCTA2: "Konsultasikan Kebutuhan Sistem Anda",
      aboutTitle: "Tentang AI Builder",
      highlight1: "Kecepatan Implementasi",
      highlight1Sub: "Dalam 7 hari kerja",
      highlight2: "Proyek Selesai",
      highlight2Sub: "Kasir & Otomasi UMKM",
      highlight3: "Akurasi Desain",
      highlight3Sub: "Tinggi & Rapi",
      aboutTag: "PROFESSIONAL PROFILE",
    },
    EN: {
      projectsTitle: "Interactive Portfolio Catalog",
      projectsSubtitle: "Click on any project card below to instantly launch and test its sandboxed MSME simulator interface.",
      capTitle: "Why Work With Me?",
      capSubtitle: "Delivering real practical utilities focused strictly on strategic problem solving rather than tech buzzwords.",
      calculatorTitle: "Operational ROI & Savings Calculator",
      calculatorSubtitle: "Estimate how much payroll hours and revenue leaks your offline business saves by switching to automation.",
      calcInputs: "STORE OPERATIONAL PARAMETERS",
      calcResults: "ESTIMATED MONTHLY SAVINGS (ROI)",
      txLabel: "Average Transactions / Day",
      timeLabel: "Manual Process Time / Transaction (Min)",
      hoursSaved: "Staff Time Saved",
      laborSavings: "Staff Payroll Hours Saved",
      leakSavings: "Leak Prevention Savings",
      totalSavings: "Total Monthly Savings",
      totalSavingsSub: "per month",
      consCTA: "Book Free Consultation",
      testiTitle: "Partner & Client Reflections",
      testiSubtitle: "Read reviews from real-world local business owners and investor entities who implemented these models.",
      contactCTA: "Begin Collaboration",
      directPhone: "WhatsApp (Direct Channel)",
      heroCTA1: "Explore Solutions",
      heroCTA2: "Consult Your System Design",
      aboutTitle: "About the AI Builder",
      highlight1: "Rapid Prototypes",
      highlight1Sub: "Within 7-day sprint",
      highlight2: "Finished Products",
      highlight2Sub: "Operational utilities",
      highlight3: "Premium Polish",
      highlight3Sub: "Pixel-perfect visual rhythm",
      aboutTag: "PROFESSIONAL PROFILE",
    }
  };

  const t = dict[lang];

  return (
    <div className="bg-editorial-bg text-editorial-text selection:bg-editorial-text selection:text-editorial-bg min-h-screen font-sans antialiased pb-12 transition-colors duration-200 select-text dark:bg-stone-950 dark:text-neutral-100">
      
      {/* HEADER SECTION */}
      <header className="sticky top-0 z-40 bg-[#F7F3EF]/95 dark:bg-stone-950/95 backdrop-blur-md border-b border-editorial-line dark:border-neutral-800 px-4 md:px-8 py-4 flex justify-between items-center transition-all select-none">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border border-editorial-text dark:border-neutral-700 bg-editorial-text dark:bg-neutral-800 text-editorial-bg dark:text-neutral-200 flex items-center justify-center font-serif-display font-black text-sm tracking-tight shadow-sm">
            JS
          </div>
          <div>
            <h1 className="text-sm font-serif-display font-extrabold text-editorial-text dark:text-neutral-100 tracking-tight leading-none">
              {defaultSettings.nama}
            </h1>
            <span className="text-[9px] text-editorial-accent dark:text-rose-400 font-mono-tag font-bold tracking-widest uppercase">
              AI BUILDER & AUTOMATOR
            </span>
          </div>
        </div>

        <nav className="flex items-center gap-2 md:gap-4 font-mono-tag">
          {activeTab === "portfolio" ? (
            <>
              <button 
                onClick={() => scrollToSection("portfolio-grid")}
                className="px-2 md:px-3.5 py-1.5 hover:bg-black/5 dark:hover:bg-white/5 text-[10px] md:text-[11px] font-bold text-editorial-muted dark:text-neutral-300 hover:text-editorial-text dark:hover:text-white transition-all uppercase tracking-wider"
              >
                {lang === "ID" ? "Proyek" : "Projects"}
              </button>
              <button 
                onClick={() => scrollToSection("calculator")}
                className="px-2 md:px-3.5 py-1.5 hover:bg-black/5 dark:hover:bg-white/5 text-[10px] md:text-[11px] font-bold text-editorial-muted dark:text-neutral-300 hover:text-editorial-text dark:hover:text-white transition-all id-scroll-to-calc uppercase tracking-wider hidden sm:block"
              >
                Calculator
              </button>
              <button 
                onClick={() => scrollToSection("contact")}
                className="px-3 md:px-4 py-2 bg-editorial-text dark:bg-neutral-100 border border-editorial-text dark:border-neutral-100 text-editorial-bg dark:text-stone-950 text-[10px] font-bold hover:bg-neutral-850 dark:hover:bg-white transition-all shadow-sm rounded-none uppercase tracking-widest"
              >
                {lang === "ID" ? "Hubungi Saya" : "Contact Me"}
              </button>
            </>
          ) : (
            <button 
              onClick={() => setActiveTab("portfolio")}
              className="px-4 py-2 bg-editorial-text dark:bg-neutral-100 border border-editorial-text dark:border-neutral-100 text-editorial-bg dark:text-stone-900 text-[10px] font-bold rounded-none hover:opacity-90 transition-all uppercase tracking-widest"
            >
              Back Portfolio
            </button>
          )}

          {/* DUAL CONFIG CONTROLS: LANG & LIGHT/DARK */}
          <div className="w-[1px] h-6 bg-editorial-line dark:bg-neutral-800 mx-1"></div>
          
          <button 
            onClick={() => setLang(prev => prev === "ID" ? "EN" : "ID")}
            className="p-1 px-1.5 text-[10px] font-bold text-editorial-muted dark:text-neutral-300 border border-editorial-line dark:border-neutral-850 bg-[#FAF8F5] dark:bg-[#1a1714] flex items-center gap-1 uppercase tracking-wider cursor-pointer"
            title="Switch Language"
          >
            <Languages className="w-3 h-3 text-editorial-accent dark:text-rose-400" />
            <span>{lang}</span>
          </button>

          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-1.5 text-editorial-muted dark:text-neutral-350 border border-editorial-line dark:border-neutral-850 bg-[#FAF8F5] dark:bg-[#1a1714] cursor-pointer"
            title="Toggle Light/Dark Theme"
          >
            {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-700" />}
          </button>
        </nav>
      </header>

      {/* VIEW SWITCHER */}
      {activeTab === "admin" ? (
        <main className="max-w-7xl mx-auto px-4 md:px-8 mt-6">
          <AdminPanel 
            onClose={() => {
              setActiveTab("portfolio");
              window.history.pushState({}, "", "/");
            }} 
            onRefreshPortfolio={fetchPublicResources}
          />
        </main>
      ) : (
        <main className="max-w-7xl mx-auto px-4 md:px-8 pt-6 select-text">
          
          {/* HERO SECTION */}
          <section className="bg-[#FAF8F5] dark:bg-[#1C1917] rounded-none border border-editorial-line dark:border-neutral-800 p-6 md:p-12 mb-10 relative overflow-hidden select-text transition-colors duration-200">
            {/* Ambient gold glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/[0.03] dark:bg-rose-500/[0.04] rounded-full blur-3xl -z-10 translate-x-12 -translate-y-12"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center lg:items-stretch">
              
              {/* Left Column Content */}
              <div className="lg:col-span-7 flex flex-col justify-center select-text">
                <div className="inline-flex items-center gap-1.5 bg-editorial-accent/10 border border-editorial-accent/20 text-editorial-accent dark:text-rose-400 dark:bg-rose-950/40 px-3.5 py-1 rounded-none text-[10px] font-mono-tag font-bold uppercase tracking-widest mb-6 w-max">
                  <Sparkles className="w-3.5 h-3.5 text-editorial-accent dark:text-rose-450 animate-pulse" />
                  AI BUILDER & INTEGRATED KASIR AUTOMATOR
                </div>

                <h1 className="text-3xl md:text-5.55xl font-serif-display font-medium text-editorial-text dark:text-neutral-100 tracking-tight leading-[110%] mb-4">
                  Sistem Kasir Pintar & Otomasi AI <span className="italic font-serif-display text-editorial-accent dark:text-rose-400 block mt-1.5">Khusus Pemilik UMKM.</span>
                </h1>

                <p className="text-sm text-editorial-muted dark:text-neutral-450 leading-relaxed mb-6 max-w-xl font-sans mt-2.5">
                  Saya membantu pengelola kedai dan pengusaha lokal memotong durasi pemrosesan nota kerja, meniadakan bocor kas, dan mempermudah rekap secara real-time.
                </p>

                <div className="flex flex-wrap gap-3 items-center">
                  <button
                    onClick={() => scrollToSection("portfolio-grid")}
                    className="px-6 py-3.5 bg-editorial-text dark:bg-neutral-100 text-editorial-bg dark:text-neutral-900 font-bold rounded-none text-[11px] hover:bg-neutral-850 dark:hover:bg-white transition-all flex items-center gap-1.5 pointer-events-auto cursor-pointer uppercase tracking-widest font-mono-tag"
                  >
                    {t.heroCTA1}
                    <ArrowDown className="w-3.5 h-3.5 animate-bounce shrink-0" />
                  </button>

                  <button
                    onClick={() => scrollToSection("contact")}
                    className="px-6 py-3.5 bg-transparent border border-editorial-text dark:border-neutral-350 text-editorial-text dark:text-neutral-255 hover:bg-editorial-text/5 font-bold rounded-none text-[11px] transition-all flex items-center gap-1.5 pointer-events-auto cursor-pointer uppercase tracking-widest font-mono-tag"
                  >
                    {t.heroCTA2}
                  </button>
                </div>
              </div>

              {/* Right Column: Visual Portrait (Foto Personal Builder yang Premium & Artistik) */}
              <div className="lg:col-span-5 flex items-center justify-center">
                <div className="w-full max-w-sm aspect-[4/5] bg-[#F7F3EF] dark:bg-stone-900/60 border border-editorial-line dark:border-neutral-800 p-4 shrink-0 flex flex-col justify-between relative shadow-sm text-editorial-text select-none">
                  
                  {/* Decorative Frame Elements */}
                  <div className="flex justify-between items-center text-[9px] text-editorial-muted dark:text-neutral-450 font-mono-tag font-bold border-b pb-2">
                    <span>BUILDER_ID: JSOLENG</span>
                    <span className="flex items-center gap-1 text-editorial-accent dark:text-rose-400 uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-editorial-accent dark:bg-rose-500 animate-pulse"></span>
                      STABLE CONSOLE
                    </span>
                  </div>

                  {/* Profile Graphic Canvas */}
                  <div className="my-3 flex-1 flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-amber-500/10 via-editorial-accent/[0.04] to-blue-500/10">
                    
                    {/* Centered Typography Portrait (No Slop device wrapper) */}
                    <div className="text-center relative z-10 space-y-2">
                      <div className="w-16 h-16 rounded-full border border-editorial-text bg-editorial-text text-editorial-bg text-xl font-serif-display font-medium mx-auto flex items-center justify-center shadow-md dark:border-neutral-700 dark:bg-stone-800 dark:text-neutral-100">
                        JS
                      </div>
                      <p className="text-sm font-serif-display font-bold text-editorial-text dark:text-neutral-200 mt-2">Jotama Soleng, B.Eng</p>
                      <p className="text-[10px] font-mono-tag text-editorial-accent dark:text-rose-400 font-extrabold uppercase tracking-widest bg-editorial-accent/10 dark:bg-rose-950 px-2 py-0.5 border border-editorial-accent/20">Fullstack Creator</p>
                    </div>

                    {/* Circuit lines decorative background */}
                    <svg className="absolute inset-0 w-full h-full text-editorial-text/[0.04] dark:text-white/[0.03] scale-110 pointer-events-none" fill="none" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <path d="M10,10 L30,10 L30,50 L70,50 L70,90" stroke="currentColor" strokeWidth="0.5" />
                      <path d="M90,20 L50,20 L50,80 L20,80" stroke="currentColor" strokeWidth="0.5" />
                    </svg>
                  </div>

                  <div className="bg-white/50 dark:bg-stone-900 border border-editorial-line dark:border-neutral-800 p-3 flex flex-col gap-1 text-[10px] text-editorial-muted dark:text-neutral-400 font-mono-tag">
                    <p className="text-[#1A1A1A] dark:text-neutral-300 font-bold flex items-center gap-1">
                      <Server className="w-3.5 h-3.5 text-editorial-accent dark:text-rose-400" />
                      Membangun dengan Maksud
                    </p>
                    <p className="pl-4">✔ Tanpa ketergantungan plugin pihak-ketiga yang rapuh.</p>
                    <p className="pl-4">✔ Simulator interaktif dibangun server-side 100%.</p>
                  </div>

                </div>
              </div>

            </div>
          </section>

          {/* BIO & 3 HIGHLIGHT NUMBERS (About section) */}
          <section className="mb-14 select-text">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border border-editorial-line dark:border-neutral-800 bg-[#FAF8F5] dark:bg-[#1C1917] p-6 md:p-8 rounded-none transition-colors duration-200">
              
              {/* Profile details */}
              <div className="lg:col-span-7 space-y-4">
                <span className="text-[10px] font-mono-tag font-bold tracking-widest text-editorial-accent dark:text-rose-400">{t.aboutTag}</span>
                <h2 className="text-2.5xl font-serif-display font-medium text-editorial-text dark:text-neutral-100 tracking-tight">
                  {t.aboutTitle}: <span className="italic text-editorial-accent dark:text-rose-400">{defaultSettings.nama}</span>
                </h2>
                <p className="text-xs text-editorial-muted dark:text-neutral-350 leading-relaxed font-sans scroll-mt-20">
                  {defaultSettings.bio}
                </p>
              </div>

              {/* 3 HIGHLIGHTS CARDS */}
              <div className="lg:col-span-5 grid grid-cols-3 gap-3">
                {[
                  { value: "7 Hari", label: t.highlight1, desc: t.highlight1Sub },
                  { value: "40+ Toko", label: t.highlight2, desc: t.highlight2Sub },
                  { value: "100%", label: t.highlight3, desc: t.highlight3Sub }
                ].map((hl, idx) => (
                  <div key={idx} className="bg-[#FAF8F5] dark:bg-stone-900 border border-editorial-line dark:border-neutral-800 p-4 text-center justify-between flex flex-col h-28">
                    <p className="text-lg md:text-xl font-serif-display font-bold text-editorial-accent dark:text-rose-400 leading-none">
                      {hl.value}
                    </p>
                    <div className="mt-2 text-[9px] font-mono-tag leading-tight text-editorial-text dark:text-neutral-200 uppercase font-black">
                      {hl.label}
                    </div>
                    <p className="text-[9px] text-editorial-muted dark:text-neutral-400 leading-normal font-sans pt-1">
                      {hl.desc}
                    </p>
                  </div>
                ))}
              </div>

            </div>
          </section>

          {/* DYNAMIC GLOBAL IMPACT NUMBERS BAR (Settings loaded) */}
          <section className="mb-14 select-none">
            <div className="bg-[#1A1A1A] dark:bg-stone-900 text-[#F7F3EF] p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-neutral-800 border border-neutral-800 rounded-none shadow-sm transition-colors duration-200">
              {defaultSettings.global_impacts.map((impact, idx) => (
                <div key={idx} className="p-4 flex flex-col justify-center items-center text-center">
                  <span className="text-3xl font-serif-display font-extrabold text-[#F7F3EF] tracking-tight text-amber-500 dark:text-rose-400 mb-1">
                    {impact.value}
                  </span>
                  <span className="text-[10px] font-mono-tag font-bold tracking-widest uppercase text-white">
                    {impact.label}
                  </span>
                  <p className="text-[10px] text-neutral-300 leading-normal max-w-xs mt-1">
                    {impact.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* CAPABILITIES POINT LISTS */}
          <section className="mb-14 select-text">
            <div className="text-center max-w-lg mx-auto mb-10">
              <span className="text-[10px] font-mono-tag font-bold text-editorial-accent dark:text-rose-400 tracking-widest bg-editorial-accent/10 dark:bg-rose-950 px-3.5 py-1 uppercase">
                INTEGRATED AUTOMATION CAPABILITIES
              </span>
              <h2 className="text-2.5xl font-serif-display font-medium text-editorial-text dark:text-neutral-105 tracking-tight mt-4">
                {t.capTitle}
              </h2>
              <p className="text-xs text-editorial-muted dark:text-neutral-400 leading-relaxed mt-2 font-sans">
                {t.capSubtitle}
              </p>
            </div>

            {/* Grid 3 item cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: <Coffee className="w-4.5 h-4.5 text-editorial-accent dark:text-rose-400 shrink-0" />,
                  title: "Point of Sales (POS)",
                  desc: "Mendesain aplikasi kasir yang ringkas, mendukung varian, log inventaris kopi/susu, ramah jaringan lokal, dan mandiri tanpa sewa bulanan."
                },
                {
                  icon: <Server className="w-4.5 h-4.5 text-editorial-accent dark:text-rose-400 shrink-0" />,
                  title: "Sistem Informasi Tenant",
                  desc: "Membangun sistem setoran tenant mall harian, rekonsiliasi kas terpusat, pembagian bagi hasil, serta grafik Mini Omset manual tanpa andalkan plugin berat."
                },
                {
                  icon: <Cpu className="w-4.5 h-4.5 text-editorial-accent dark:text-rose-400 shrink-0" />,
                  title: "Otomasi Formulir & AI",
                  desc: "Mengkombinasikan model LLM Gemini dan naskah backend Node.js untuk menganalisis repo kode, memetakan benefit, dan meluncurkan simulasi sandbox."
                }
              ].map((cap, idx) => (
                <div key={idx} className="p-6 bg-[#FAF8F5] dark:bg-stone-900 border border-editorial-line dark:border-neutral-800 rounded-none flex items-start gap-4">
                  <div className="w-9 h-9 border border-editorial-line dark:border-neutral-700 bg-white dark:bg-stone-950 flex items-center justify-center shadow-sm shrink-0">
                    {cap.icon}
                  </div>
                  <div>
                    <h4 className="font-serif-display font-bold text-[#1A1A1A] dark:text-neutral-200 text-sm tracking-tight mb-1">{cap.title}</h4>
                    <p className="text-[11px] text-editorial-muted dark:text-neutral-400 font-sans leading-relaxed">{cap.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* MAIN PORTFOLIO GRID CATALOG */}
          <section id="portfolio-grid" className="mb-14 scroll-mt-14 select-text">
            
            {/* Filter banner */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-editorial-line dark:border-neutral-800 pb-5 mb-8 gap-4 select-text">
              <div>
                <h3 className="text-xl font-serif-display font-bold text-editorial-text dark:text-neutral-100 tracking-tight flex items-center gap-2">
                  <LayoutGrid className="w-5 h-5 text-editorial-accent dark:text-rose-400" />
                  {t.projectsTitle}
                </h3>
                <p className="text-xs text-editorial-muted dark:text-neutral-400 mt-1">
                  {t.projectsSubtitle}
                </p>
              </div>

              {/* Category pills */}
              <div className="flex flex-wrap gap-1 bg-white dark:bg-[#1f1b17] p-1 border border-editorial-line dark:border-neutral-800">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-none text-[10px] font-mono-tag font-bold transition-all uppercase tracking-wider ${
                      selectedCategory === cat
                        ? "bg-editorial-text dark:bg-neutral-100 text-editorial-bg dark:text-neutral-900"
                        : "text-editorial-muted dark:text-neutral-300 hover:text-editorial-text hover:bg-black/5 dark:hover:bg-white/5"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid wrapper */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-editorial-muted gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-editorial-accent" />
                <span className="text-[10px] font-mono-tag font-semibold">Menghubungi katalog sistem...</span>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="bg-[#FAF8F5] dark:bg-[#1c1917] p-12 text-center text-editorial-muted sm:max-w-md mx-auto border border-editorial-line dark:border-neutral-800">
                <AlertCircle className="w-8 h-8 text-editorial-accent/60 mx-auto mb-2" />
                <p className="text-xs font-mono-tag font-bold">Belum ada proyek dalam kategori ini.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                {filteredProjects.map((project) => (
                  <ProjectCard 
                    key={project.id} 
                    project={project} 
                    onClick={() => setSelectedProject(project)} 
                  />
                ))}
              </div>
            )}
          </section>

          {/* DYNAMIC METRIC ROI CALCULATOR SECTION */}
          <section id="calculator" className="mb-14 scroll-mt-20 select-text">
            <div className="text-center max-w-lg mx-auto mb-10">
              <span className="text-[10px] font-mono-tag font-bold text-editorial-accent dark:text-rose-400 tracking-widest bg-editorial-accent/10 dark:bg-rose-950 px-3.5 py-1 uppercase">
                AUTOMATED PERFORMANCE PROJECTIONS
              </span>
              <h2 className="text-2.5xl font-serif-display font-medium text-editorial-text dark:text-neutral-100 mt-4 tracking-tight">
                {t.calculatorTitle}
              </h2>
              <p className="text-xs text-editorial-muted dark:text-neutral-450 leading-relaxed mt-2">
                {t.calculatorSubtitle}
              </p>
            </div>

            <div className="bg-[#FAF8F5] dark:bg-[#1C1917] border border-editorial-line dark:border-neutral-800 p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch select-text rounded-none transition-all">
              
              {/* Left col: user inputs */}
              <div className="lg:col-span-5 bg-white dark:bg-stone-900 border border-editorial-line dark:border-neutral-850 p-6 flex flex-col justify-between">
                <div>
                  <h4 className="text-[10px] font-mono-tag font-bold text-editorial-accent dark:text-rose-400 uppercase tracking-widest border-b pb-2.5 mb-5 select-none">
                    {t.calcInputs}
                  </h4>

                  {/* Input 1 (Daily transactions) */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center text-xs font-bold font-mono-tag text-editorial-text dark:text-neutral-200 mb-2">
                        <span>{t.txLabel}</span>
                        <span className="bg-editorial-accent/15 dark:bg-rose-950 text-editorial-accent dark:text-rose-455 px-2 py-0.5 text-[11px] font-bold">{dailyTx} Transaksi</span>
                      </div>
                      <input 
                        type="range" 
                        min={10} 
                        max={300} 
                        step={5}
                        value={dailyTx}
                        onChange={(e) => setDailyTx(Number(e.target.value))}
                        className="w-full accent-editorial-accent h-1 bg-stone-200 rounded-lg cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] text-editorial-muted font-bold font-mono-tag mt-1">
                        <span>10</span>
                        <span>300 Tx/Day</span>
                      </div>
                    </div>

                    {/* Input 2 (Manual process time/tx) */}
                    <div>
                      <div className="flex justify-between items-center text-xs font-bold font-mono-tag text-editorial-text dark:text-neutral-200 mb-2">
                        <span>{t.timeLabel}</span>
                        <span className="bg-editorial-accent/15 dark:bg-rose-950 text-editorial-accent dark:text-rose-455 px-2 py-0.5 text-[11px] font-bold">{timePerTx} Menit</span>
                      </div>
                      <input 
                        type="range" 
                        min={1} 
                        max={8} 
                        step={1}
                        value={timePerTx}
                        onChange={(e) => setTimePerTx(Number(e.target.value))}
                        className="w-full accent-editorial-accent h-1 bg-stone-200 rounded-lg cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] text-editorial-muted font-bold font-mono-tag mt-1">
                        <span>1 Min</span>
                        <span>8 Mins</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-stone-50 dark:bg-stone-950 p-4 border border-editorial-line dark:border-neutral-805 mt-6 text-[10px] text-editorial-muted dark:text-neutral-400 font-mono-tag">
                  <p className="font-extrabold text-[#1A1A1A] dark:text-rose-400 uppercase tracking-wide">💡 RUMUSAN NILAI BISNIS:</p>
                  <p className="mt-1.5 leading-relaxed">• Sistem Jotama memotong waktu kasir manual dari {timePerTx} menit menjadi kurang dari <b>30 detik</b>.</p>
                  <p className="leading-relaxed">• Menghilangkan 100% human error rekap, mencegah kebocoran rata-rata IDR 12.000 per kejadian.</p>
                </div>
              </div>

              {/* Right col: generated ROI value results */}
              <div className="lg:col-span-7 flex flex-col justify-between">
                <div>
                  <h4 className="text-[10px] font-mono-tag font-bold text-editorial-text dark:text-neutral-300 uppercase tracking-widest border-b pb-2.5 mb-6">
                    {t.calcResults}
                  </h4>

                  <div className="grid grid-cols-2 gap-4 pb-6 border-b border-editorial-line dark:border-neutral-800">
                    {/* Time Saved Monthly */}
                    <div className="p-4 border border-editorial-line dark:border-neutral-800 bg-white dark:bg-stone-900/60 flex flex-col justify-between h-24">
                      <p className="text-2.5xl font-serif-display font-bold text-editorial-text dark:text-neutral-250 leading-none">
                        {hoursSavedPerMonth} Jam
                      </p>
                      <p className="text-[9px] font-mono-tag tracking-wider text-editorial-muted dark:text-neutral-450 uppercase font-black">
                        {t.hoursSaved}
                      </p>
                    </div>

                    {/* Salary Savings Monthly */}
                    <div className="p-4 border border-editorial-line dark:border-neutral-800 bg-white dark:bg-stone-900/60 flex flex-col justify-between h-24">
                      <p className="text-xl font-serif-display font-medium text-[#1A1A1A] dark:text-neutral-250 leading-none">
                        Rp {costSavedPerMonth.toLocaleString("id-ID")}
                      </p>
                      <p className="text-[9px] font-mono-tag tracking-wider text-editorial-muted dark:text-neutral-450 uppercase font-black">
                        {t.laborSavings}
                      </p>
                    </div>

                    {/* Prevent leaks */}
                    <div className="p-4 border border-editorial-line dark:border-neutral-800 bg-white dark:bg-stone-900/60 flex flex-col justify-between h-24">
                      <p className="text-xl font-serif-display font-medium text-editorial-accent dark:text-rose-400 leading-none">
                        Rp {leakSavingsPerMonth.toLocaleString("id-ID")}
                      </p>
                      <p className="text-[9px] font-mono-tag tracking-wider text-editorial-muted dark:text-neutral-450 uppercase font-black">
                        {t.leakSavings}
                      </p>
                    </div>

                    {/* Total saved (Combined) */}
                    <div className="p-4 border border-editorial-line dark:border-neutral-800 bg-editorial-accent/5 dark:bg-rose-950/20 flex flex-col justify-between h-24">
                      <p className="text-xl font-serif-display font-bold text-editorial-accent dark:text-rose-400 leading-none">
                        Rp {totalSavingsPerMonth.toLocaleString("id-ID")}
                      </p>
                      <p className="text-[9px] font-mono-tag tracking-wider text-editorial-accent dark:text-rose-455 uppercase font-extrabold">
                        {lang === "ID" ? "Total Likuiditas Terjaga" : "Monthly Cash Preserved"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Animated massive total savings bubble & CTA */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                  <div>
                    <span className="text-[9px] text-editorial-muted dark:text-[#a0a0a0] font-mono-tag tracking-widest uppercase block">POTENSI TOTAL PENGHEMATAN TAHUNAN</span>
                    <h5 className="text-2xl font-serif-display font-bold text-editorial-accent dark:text-rose-400 leading-none mt-1">
                      Rp {(totalSavingsPerMonth * 12).toLocaleString("id-ID")} / Tahun
                    </h5>
                  </div>

                  <button
                    onClick={() => {
                      scrollToSection("contact");
                    }}
                    className="px-5 py-3 bg-[#1A1A1A] dark:bg-neutral-100 hover:bg-opacity-95 text-[#F7F3EF] dark:text-[#1c1917] font-mono-tag text-[10px] font-extrabold tracking-widest uppercase cursor-pointer"
                  >
                    {t.consCTA}
                  </button>
                </div>

              </div>

            </div>
          </section>

          {/* TESTIMONIALS SLIDER / GRID */}
          <section id="testimonials" className="mb-14 select-text">
            <div className="text-center max-w-lg mx-auto mb-10">
              <span className="text-[10px] font-mono-tag font-bold text-editorial-accent dark:text-rose-400 tracking-widest bg-editorial-accent/10 dark:bg-rose-950 px-3.5 py-1 uppercase">
                TESTIMONIAL GRID REFLECTION
              </span>
              <h2 className="text-2.5xl font-serif-display font-medium text-editorial-text dark:text-neutral-100 mt-4 tracking-tight">
                {t.testiTitle}
              </h2>
              <p className="text-xs text-editorial-muted dark:text-neutral-450 leading-relaxed mt-2 font-sans">
                {t.testiSubtitle}
              </p>
            </div>

            {/* Testimonials List fetched */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {testimonials.length === 0 ? (
                // Safe starter fallbacks
                [
                  {
                    nama: "Pak Hendra Setiawan",
                    jabatan: "Pemilik Kedai & Roastery",
                    perusahaan: "Kahawa Kopi",
                    rating: 5,
                    konten: "Aplikasi kasir buatan Mas Jotama sangat membantu kelancaran usaha kami. Sebelumnya kasir kami sering salah hitung pesanan kopi variasi es/sugar level. Sekarang, transaksi selesai kurang dari 30 detik!"
                  },
                  {
                    nama: "Santi Rahayu",
                    jabatan: "Partner Bisnis & Investasi",
                    perusahaan: "Artha Ventures",
                    rating: 5,
                    konten: "Kami mencari AI builder yang bisa merancang solusi nyata dengan fungsionalitas murni di lapangan, bukan sekadar teori. Jotama Soleng menunjukkan bukti produk kasir terintegrasi yang andal."
                  }
                ].map((testi, idx) => (
                  <div key={idx} className="bg-white dark:bg-stone-900 border border-editorial-line dark:border-neutral-800 p-6 flex flex-col justify-between group rounded-none hover:border-editorial-text transition-all">
                    <p className="text-xs text-editorial-muted dark:text-neutral-350 leading-relaxed italic font-sans mb-6">
                      "{testi.konten}"
                    </p>
                    <div className="flex justify-between items-center pt-4 border-t border-editorial-line dark:border-neutral-805">
                      <div>
                        <h4 className="font-serif-display font-bold text-sm text-editorial-text dark:text-neutral-100">{testi.nama}</h4>
                        <span className="text-[10px] font-mono-tag text-editorial-muted dark:text-neutral-450 uppercase">{testi.jabatan} @ {testi.perusahaan}</span>
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {Array.from({ length: testi.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                testimonials.map((testi) => (
                  <div key={testi.id} className="bg-white dark:bg-stone-900 border border-editorial-line dark:border-neutral-800 p-6 flex flex-col justify-between rounded-none hover:border-editorial-text transition-all transition-colors duration-200">
                    <p className="text-xs text-editorial-muted dark:text-neutral-350 leading-relaxed italic font-sans mb-6">
                      "{testi.konten}"
                    </p>
                    <div className="flex justify-between items-center pt-4 border-t border-editorial-line dark:border-neutral-800">
                      <div>
                        <h4 className="font-serif-display font-bold text-sm text-editorial-text dark:text-neutral-100">{testi.nama}</h4>
                        <span className="text-[10px] font-mono-tag text-editorial-muted dark:text-neutral-450 uppercase">{testi.jabatan} @ {testi.perusahaan}</span>
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {Array.from({ length: testi.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* CONTACT INQUIRY CONSULTATION FORM */}
          <section id="contact" className="mb-8 scroll-mt-20 select-text animate-fade-in">
            <div className="text-center max-w-lg mx-auto mb-8">
              <span className="text-[10px] font-mono-tag font-bold text-editorial-accent dark:text-rose-455 tracking-widest bg-editorial-accent/10 dark:bg-rose-950 px-3.5 py-1.5 uppercase leading-none">
                {t.contactCTA}
              </span>
              <h2 className="text-2.5xl font-serif-display font-medium text-editorial-text dark:text-neutral-100 mt-4 leading-tight">
                Ajak Jotama Memodernisasi Sistem <span className="italic text-editorial-accent dark:text-rose-400">Kasir Toko Anda</span>
              </h2>
              <div className="w-12 h-[1px] bg-editorial-accent mx-auto my-3"></div>
              <p className="text-xs text-editorial-muted dark:text-neutral-400 font-sans">
                Isi formulir ringkas di bawah untuk penjadwalan presentasi demo live POS custom di kedai Kopi Anda.
              </p>
            </div>

            <ContactForm waLink={defaultSettings.wa_link} lang={lang} />
          </section>

          {/* PERSISTENT FOOTER ROW & SECRET ADMIN LOGIN */}
          <footer className="border-t border-editorial-line dark:border-neutral-800 pt-8 mt-12 flex flex-col sm:flex-row justify-between items-center text-xs text-editorial-muted gap-4 select-none">
            <p className="font-mono-tag text-[10.5px]">© {new Date().getFullYear()} Jotama Soleng. AI Builder & Automator UMKM. All Rights Reserved.</p>
            <div className="flex gap-4 items-center font-mono-tag">
              
              {/* WhatsApp direct footer link */}
              <a href={defaultSettings.wa_link} target="_blank" rel="noreferrer" className="text-[11px] font-bold text-editorial-muted dark:text-neutral-400 hover:text-editorial-accent flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-editorial-accent" />
                WhatsApp (Direct Link)
              </a>

              {/* Secret Admin Button */}
              <button
                onClick={() => {
                  const slug = prompt("Sebutkan rute kualifikasi kredensial rahasia (URL Slug Admin):");
                  if (slug === "manage-a7x9k") {
                    setActiveTab("admin");
                    window.history.pushState({}, "", "/manage-a7x9k");
                    scrollToSection("header");
                  } else {
                    alert("Akses Masuk Ditolak! Cek URL slug admin Anda pada list panduan.");
                  }
                }}
                className="text-[11px] font-bold text-editorial-muted dark:text-neutral-400 hover:text-editorial-accent cursor-pointer flex items-center gap-1 opacity-70 hover:opacity-100 transition-all border border-editorial-line dark:border-neutral-850 px-2.5 py-1 bg-[#FAF8F5] dark:bg-stone-900"
              >
                <Key className="w-3.5 h-3.5 text-editorial-accent" />
                Console Admin (Tersembunyi)
              </button>
            </div>
          </footer>

        </main>
      )}

      {/* PORTFOLIO MODAL POPUP SHEET */}
      {selectedProject && (
        <ProjectModal 
          project={selectedProject} 
          onClose={() => setSelectedProject(null)} 
          lang={lang}
        />
      )}

      {/* DYNAMIC Conversational AI floating Chat widget (Gemini 3.5 Driven) */}
      <div className="fixed bottom-6 right-6 z-45 flex flex-col items-end select-text font-mono-tag">
        
        <AnimatePresence>
          {showChat && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.93 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.93 }}
              className="w-80 md:w-96 h-112 bg-[#FCFAF7] dark:bg-[#1a1714] border border-editorial-line dark:border-neutral-800 shadow-2xl flex flex-col justify-between overflow-hidden mb-3.5 rounded-none"
            >
              
              {/* Chat head */}
              <div className="bg-[#1A1A1A] p-4 text-[#F7F3EF] flex justify-between items-center select-none">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
                  <div>
                    <h4 className="text-xs font-serif-display font-medium">Asisten Virtual Jotama</h4>
                    <span className="text-[8.5px] font-mono-tag text-emerald-200 font-extrabold uppercase tracking-widest leading-none">Status: Online • Gemini 3.5</span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowChat(false)} 
                  className="p-1 hover:bg-white/10 rounded transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Chat conversations area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#FAF8F5] dark:bg-stone-950 font-sans text-xs scrollbar-thin">
                
                {/* Greeting */}
                <div className="bg-stone-100 dark:bg-stone-900 border border-editorial-line dark:border-neutral-850 p-3 max-w-[85%] text-editorial-text dark:text-neutral-200">
                  <p className="leading-relaxed text-[11.5px]">
                    {lang === "ID" 
                      ? "Halo! Saya adalah asisten virtual Jotama Soleng. Tanyakan apa saja tentang skill mekatronika, portofolio POS kedai, cara integrasi database offline harian, atau tanyakan potensi ROI untuk toko Anda!" 
                      : "Hi! I am Jotama's automated assistant. Ask me anything regarding his point-of-sales setups, rapid Excel automations, or how much budget your cafe saves with technology!"}
                  </p>
                </div>

                {chatHistory.map((item, idx) => (
                  <div 
                    key={idx} 
                    className={`p-3 max-w-[85%] border leading-relaxed text-[11.5px] transition-all font-sans ${
                      item.role === "user"
                        ? "bg-editorial-accent/10 border-editorial-accent/30 text-editorial-accent ml-auto"
                        : "bg-white dark:bg-stone-900 border-editorial-line dark:border-neutral-850 text-editorial-text dark:text-neutral-200"
                    }`}
                  >
                    <p>{item.text}</p>
                  </div>
                ))}

                {chatLoading && (
                  <div className="p-3 max-w-[80%] bg-stone-100 dark:bg-stone-900 border border-editorial-line dark:border-neutral-800 text-editorial-muted animate-pulse">
                    <span className="text-[10px] uppercase font-mono-tag font-bold tracking-wider">{lang === "ID" ? "AI sedang mengetik..." : "AI typing..."}</span>
                  </div>
                )}

                <div ref={chatBottomRef} />
              </div>

              {/* Starter Quickprompts chips */}
              {chatHistory.length === 0 && (
                <div className="px-4 py-2 border-t border-editorial-line dark:border-neutral-850 bg-stone-50 dark:bg-[#1a1714] flex flex-wrap gap-1 md:gap-1.5 shrink-0 select-none">
                  {[
                    { id: "p1", txt: lang === "ID" ? "Bagaimana Jotama mendesain POS?" : "How does Jotama audit POS?" },
                    { id: "p2", txt: lang === "ID" ? "Berapa lama pengerjaan sistem?" : "What is his build timeline?" },
                    { id: "p3", txt: lang === "ID" ? "Hitung potensi ROI toko saya" : "Calculate my store's ROI" }
                  ].map((chip) => (
                    <button
                      key={chip.id}
                      onClick={() => handleSendChat(chip.txt)}
                      className="px-2 py-1 text-[9.5px] text-editorial-muted dark:text-neutral-300 font-sans border border-editorial-line dark:border-neutral-805 bg-white dark:bg-stone-950 hover:bg-stone-55 hover:text-editorial-text transition-all cursor-pointer truncate max-w-full"
                    >
                      {chip.txt}
                    </button>
                  ))}
                </div>
              )}

              {/* Conversation input bar */}
              <div className="p-3 border-t border-editorial-line dark:border-neutral-800 bg-[#FCFAF7] dark:bg-stone-950 shrink-0 flex gap-2">
                <input
                  type="text"
                  placeholder={lang === "ID" ? "Ketik pertanyaan Anda..." : "Ask your question..."}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSendChat(); }}
                  className="flex-1 bg-white dark:bg-stone-900 border border-editorial-line dark:border-neutral-800 rounded-none px-3 py-1.5 text-xs text-editorial-text dark:text-neutral-200 outline-none"
                />
                <button
                  onClick={() => handleSendChat()}
                  className="bg-editorial-text dark:bg-neutral-100 text-editorial-bg dark:text-stone-950 p-2 hover:opacity-90 shrink-0 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Bubble Toggle Button */}
        <button
          onClick={() => setShowChat(!showChat)}
          className="w-13 h-13 bg-editorial-text dark:bg-neutral-100 text-[#FCFAF7] dark:text-stone-950 flex items-center justify-center shadow-2xl relative transition-all hover:scale-105 select-none shrink-0 cursor-pointer pointer-events-auto border border-editorial-text dark:border-neutral-150 animate-bounce"
          title="Virtual Assistant Chatbot"
        >
          {showChat ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6 animate-pulse" />}
        </button>

      </div>

    </div>
  );
}
