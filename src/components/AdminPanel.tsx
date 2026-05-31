import { useState, useEffect, FormEvent } from "react";
import { Project, Testimonial, GlobalSettings, ContactSubmission } from "../types";
import { 
  Plus, Edit2, Trash2, Github, Sparkles, Loader2, Save, 
  X, Check, AlertCircle, Eye, EyeOff, Layout, FileCode, CheckSquare,
  Users, Settings, MessageSquare, Shield, HelpCircle, Star, Phone, Activity
} from "lucide-react";
import { motion } from "motion/react";

interface AdminPanelProps {
  onClose: () => void;
  onRefreshPortfolio: () => void;
}

type AdminTab = "projects" | "testimonials" | "settings" | "contacts";

export default function AdminPanel({ onClose, onRefreshPortfolio }: AdminPanelProps) {
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>("projects");
  const [projects, setProjects] = useState<Project[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [settings, setSettings] = useState<GlobalSettings | null>(null);
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // PROJECT FORM STATE
  const [editingId, setEditingId] = useState<string | null>(null);
  const [projectForm, setProjectForm] = useState({
    nama: "",
    kategori: "Point of Sales",
    tagline: "",
    problem: "",
    before_after: "",
    fitur: [""] as string[],
    impact_numbers: [{ label: "", value: "" }] as { label: string; value: string }[],
    github_url: "",
    demo_html: "",
    status: "published" as "published" | "draft"
  });

  // TESTIMONIAL FORM STATE
  const [editingTestiId, setEditingTestiId] = useState<string | null>(null);
  const [testiForm, setTestiForm] = useState({
    nama: "",
    jabatan: "",
    perusahaan: "",
    rating: 5,
    konten: ""
  });

  // SETTINGS FORM STATE
  const [settingsForm, setSettingsForm] = useState({
    nama: "",
    tagline: "",
    bio: "",
    wa_link: "",
    gap_label_1: "", gap_val_1: "", gap_desc_1: "",
    gap_label_2: "", gap_val_2: "", gap_desc_2: "",
    gap_label_3: "", gap_val_3: "", gap_desc_3: "",
    system_prompt_ai: ""
  });

  // GitHub Importer URL
  const [githubUrlInput, setGithubUrlInput] = useState("");
  const [githubAnalyzing, setGithubAnalyzing] = useState(false);
  const [githubAnalysisStep, setGithubAnalysisStep] = useState(1);

  // Active form section tab (Form Fields vs Demo Live Sandbox Preview)
  const [activeFormTab, setActiveFormTab] = useState<"fields" | "preview">("fields");

  // Load resources based on tab
  useEffect(() => {
    fetchData();
  }, [activeAdminTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeAdminTab === "projects") {
        const res = await fetch("/api/admin/projects");
        if (res.ok) {
          const data = await res.json();
          setProjects(data);
        }
      } else if (activeAdminTab === "testimonials") {
        const res = await fetch("/api/admin/testimonials");
        if (res.ok) {
          const data = await res.json();
          setTestimonials(data);
        }
      } else if (activeAdminTab === "settings") {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
          setSettingsForm({
            nama: data.nama || "",
            tagline: data.tagline || "",
            bio: data.bio || "",
            wa_link: data.wa_link || "",
            gap_label_1: data.global_impacts?.[0]?.label || "",
            gap_val_1: data.global_impacts?.[0]?.value || "",
            gap_desc_1: data.global_impacts?.[0]?.desc || "",
            gap_label_2: data.global_impacts?.[1]?.label || "",
            gap_val_2: data.global_impacts?.[1]?.value || "",
            gap_desc_2: data.global_impacts?.[1]?.desc || "",
            gap_label_3: data.global_impacts?.[2]?.label || "",
            gap_val_3: data.global_impacts?.[2]?.value || "",
            gap_desc_3: data.global_impacts?.[2]?.desc || "",
            system_prompt_ai: data.system_prompt_ai || ""
          });
        }
      } else if (activeAdminTab === "contacts") {
        const res = await fetch("/api/admin/contacts");
        if (res.ok) {
          const data = await res.json();
          setContacts(data);
        }
      }
    } catch (err) {
      console.error(err);
      showAlert("error", "Koneksi terputus. Gagal memuat database.");
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type: "success" | "error", text: string) => {
    setAlertMsg({ type, text });
    setTimeout(() => {
      setAlertMsg(null);
    }, 4500);
  };

  // ==========================================
  // PROJECTS HANDLERS
  // ==========================================
  const resetProjectForm = () => {
    setEditingId(null);
    setProjectForm({
      nama: "",
      kategori: "Point of Sales",
      tagline: "",
      problem: "",
      before_after: "",
      fitur: ["", ""],
      impact_numbers: [{ label: "", value: "" }],
      github_url: "",
      demo_html: "<!-- Kode simulator interaktif Anda -->",
      status: "published"
    });
    setGithubUrlInput("");
    setActiveFormTab("fields");
  };

  const startEditProject = (p: Project) => {
    setEditingId(p.id);
    setProjectForm({
      nama: p.nama,
      kategori: p.kategori,
      tagline: p.tagline,
      problem: p.problem,
      before_after: p.before_after || "",
      fitur: p.fitur.length > 0 ? [...p.fitur] : [""],
      impact_numbers: p.impact_numbers && p.impact_numbers.length > 0 ? [...p.impact_numbers] : [{ label: "", value: "" }],
      github_url: p.github_url || "",
      demo_html: p.demo_html,
      status: p.status
    });
    setGithubUrlInput(p.github_url || "");
    setActiveFormTab("fields");
  };

  const handleProjectSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!projectForm.nama.trim() || !projectForm.problem.trim()) {
      showAlert("error", "Nama proyek dan Problem statement wajib diisi.");
      return;
    }

    const cleanFeatures = projectForm.fitur.filter(f => f.trim() !== "");
    const cleanImpact = projectForm.impact_numbers.filter(im => im.label.trim() !== "" && im.value.trim() !== "");

    setActionLoading(true);
    const bodyLoad = {
      ...projectForm,
      fitur: cleanFeatures.length > 0 ? cleanFeatures : ["Otomatisasi handal."],
      impact_numbers: cleanImpact.length > 0 ? cleanImpact : [{ label: "Efficiency", value: "+30%" }]
    };

    try {
      const url = editingId ? `/api/admin/projects/${editingId}` : "/api/admin/projects";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyLoad)
      });
      if (res.ok) {
        showAlert("success", editingId ? "Berhasil menyimpan perubahan proyek!" : "Proyek baru sukses diterbitkan!");
        resetProjectForm();
        fetchData();
        onRefreshPortfolio();
      } else {
        const error = await res.json();
        showAlert("error", error.error || "Gagal menyimpan proyek.");
      }
    } catch (err) {
      showAlert("error", "Masalah koneksi ke API Admin.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProject = async (id: string, nama: string) => {
    if (!confirm(`Hapus proyek "${nama}" secara permanen dari portofolio?`)) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
      if (res.ok) {
        showAlert("success", "Proyek terhapus.");
        fetchData();
        onRefreshPortfolio();
        if (editingId === id) resetProjectForm();
      } else {
        showAlert("error", "Gagal menghapus.");
      }
    } catch (err) {
      showAlert("error", "Sambungan gagal.");
    } finally {
      setActionLoading(false);
    }
  };

  // Dynamic Array Helpers: Features & Impact Lists
  const handleFeatureChange = (index: number, val: string) => {
    const updated = [...projectForm.fitur];
    updated[index] = val;
    setProjectForm({ ...projectForm, fitur: updated });
  };

  const addFeatureRow = () => {
    setProjectForm({ ...projectForm, fitur: [...projectForm.fitur, ""] });
  };

  const removeFeatureRow = (index: number) => {
    if (projectForm.fitur.length <= 1) return;
    const updated = projectForm.fitur.filter((_, idx) => idx !== index);
    setProjectForm({ ...projectForm, fitur: updated });
  };

  const handleImpactChange = (index: number, key: "label" | "value", val: string) => {
    const updated = [...projectForm.impact_numbers];
    updated[index][key] = val;
    setProjectForm({ ...projectForm, impact_numbers: updated });
  };

  const addImpactRow = () => {
    setProjectForm({ ...projectForm, impact_numbers: [...projectForm.impact_numbers, { label: "", value: "" }] });
  };

  const removeImpactRow = (index: number) => {
    if (projectForm.impact_numbers.length <= 1) return;
    const updated = projectForm.impact_numbers.filter((_, idx) => idx !== index);
    setProjectForm({ ...projectForm, impact_numbers: updated });
  };

  // AI GitHub Parser Trigger
  const handleAnalyzeGithub = async () => {
    if (!githubUrlInput.trim()) {
      showAlert("error", "Beri alamat URL portofolio github Anda!");
      return;
    }
    setGithubAnalyzing(true);
    setGithubAnalysisStep(1);

    const intv = setInterval(() => {
      setGithubAnalysisStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 4000);

    try {
      const res = await fetch("/api/analyze-github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl: githubUrlInput.trim() })
      });
      clearInterval(intv);
      if (res.ok) {
        const parsed = await res.json();
        setProjectForm({
          nama: parsed.nama || "",
          kategori: parsed.kategori || "Point of Sales",
          tagline: parsed.tagline || "",
          problem: parsed.problem || "",
          before_after: parsed.before_after || "",
          fitur: parsed.fitur && parsed.fitur.length > 0 ? [...parsed.fitur] : ["", ""],
          impact_numbers: parsed.impact_numbers && parsed.impact_numbers.length > 0 ? [...parsed.impact_numbers] : [{ label: "", value: "" }],
          github_url: parsed.github_url || githubUrlInput,
          demo_html: parsed.demo_html || "",
          status: "published"
        });
        showAlert("success", "AI Gemini berhasil menganalisis & merancang simulator produk!");
      } else {
        showAlert("error", "Gagal menganalisis repositori via AI.");
      }
    } catch (err) {
      clearInterval(intv);
      showAlert("error", "Gagal berinteraksi dengan server AI.");
    } finally {
      setGithubAnalyzing(false);
      setGithubAnalysisStep(1);
    }
  };

  // ==========================================
  // TESTIMONIALS HANDLERS
  // ==========================================
  const resetTestiForm = () => {
    setEditingTestiId(null);
    setTestiForm({
      nama: "",
      jabatan: "",
      perusahaan: "",
      rating: 5,
      konten: ""
    });
  };

  const handleTestiSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!testiForm.nama.trim() || !testiForm.konten.trim()) {
      showAlert("error", "Nama Pemberi Testimoni dan Isi Konten wajib diisi.");
      return;
    }

    setActionLoading(true);
    try {
      const url = editingTestiId ? `/api/admin/testimonials/${editingTestiId}` : "/api/admin/testimonials";
      const method = editingTestiId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testiForm)
      });
      if (res.ok) {
        showAlert("success", "Testimonial berhasil disimpan!");
        resetTestiForm();
        fetchData();
      } else {
        showAlert("error", "Gagal menyimpan testimonial.");
      }
    } catch (err) {
      showAlert("error", "Gagal koneksi.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTesti = async (id: string) => {
    if (!confirm("Hapus testimoni klien ini secara permanen?")) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
      if (res.ok) {
        showAlert("success", "Testimonial dihapus.");
        fetchData();
        if (editingTestiId === id) resetTestiForm();
      }
    } catch (err) {
      showAlert("error", "Kesalahan.");
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // SETTINGS HANDLER
  // ==========================================
  const handleSettingsSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    const updatedSettings = {
      nama: settingsForm.nama,
      tagline: settingsForm.tagline,
      bio: settingsForm.bio,
      wa_link: settingsForm.wa_link,
      global_impacts: [
        { label: settingsForm.gap_label_1, value: settingsForm.gap_val_1, desc: settingsForm.gap_desc_1 },
        { label: settingsForm.gap_label_2, value: settingsForm.gap_val_2, desc: settingsForm.gap_desc_2 },
        { label: settingsForm.gap_label_3, value: settingsForm.gap_val_3, desc: settingsForm.gap_desc_3 }
      ],
      system_prompt_ai: settingsForm.system_prompt_ai
    };

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSettings)
      });
      if (res.ok) {
        showAlert("success", "Pengaturan global berhasil disimpan!");
        fetchData();
        onRefreshPortfolio();
      } else {
        showAlert("error", "Gagal menyimpan pengaturan.");
      }
    } catch (err) {
      showAlert("error", "Koneksi terputus.");
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // LEADS CONTACTS HANDLER
  // ==========================================
  const handleDeleteContact = async (id: string) => {
    if (!confirm("Hapus rekaman lead penawaran ini?")) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/contacts/${id}`, { method: "DELETE" });
      if (res.ok) {
        showAlert("success", "Lead dibersihkan.");
        fetchData();
      }
    } catch (err) {
      showAlert("error", "Kesalahan.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="w-full bg-stone-100 dark:bg-stone-900 border border-editorial-line dark:border-neutral-800 p-4 md:p-8 rounded-none relative select-text transition-colors">
      
      {/* Alert Overlay Banner */}
      {alertMsg && (
        <div 
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3.5 rounded-none shadow-2xl border text-xs font-mono-tag font-bold tracking-wider uppercase ${
            alertMsg.type === "success" 
              ? "bg-[#FCFAF7] border-emerald-500 text-emerald-800" 
              : "bg-[#FCFAF7] border-editorial-accent text-editorial-accent"
          }`}
        >
          {alertMsg.type === "success" ? <Check className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-editorial-accent shrink-0" />}
          <span>{alertMsg.text}</span>
        </div>
      )}

      {/* DASHBOARD NAV HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-editorial-line dark:border-neutral-800 pb-6 mb-8 gap-4 select-text">
        <div>
          <span className="text-[10px] font-bold text-editorial-accent uppercase tracking-widest bg-editorial-accent/10 border border-editorial-accent/20 px-3 py-1 font-mono-tag">
            PORTFOLIO AMIN CONSOLE 🛡️ STATUS: ACTIVE
          </span>
          <h2 className="text-2xl font-serif-display font-bold text-editorial-text dark:text-neutral-100 tracking-tight mt-3">
            Sistem Konstruksi Portofolio
          </h2>
        </div>
        <button
          onClick={onClose}
          className="px-5 py-2.5 bg-editorial-text border border-editorial-text text-editorial-bg text-[10px] font-mono-tag font-bold rounded-none hover:bg-neutral-800 transition-all cursor-pointer uppercase tracking-widest flex items-center gap-1.5"
        >
          Lihat Portofolio Anda
        </button>
      </div>

      {/* SECTION TABS */}
      <div className="flex flex-wrap gap-1 bg-white dark:bg-[#1f1b17] p-1.5 rounded-none border border-editorial-line dark:border-neutral-800 mb-8 max-w-2xl">
        {[
          { id: "projects", label: "Katalog Proyek", icon: <Layout className="w-3.5 h-3.5" /> },
          { id: "testimonials", label: "Testimoni", icon: <MessageSquare className="w-3.5 h-3.5" /> },
          { id: "settings", label: "Pengaturan Global", icon: <Settings className="w-3.5 h-3.5" /> },
          { id: "contacts", label: "Lead Konsultasi", icon: <Users className="w-3.5 h-3.5" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveAdminTab(tab.id as AdminTab);
              resetProjectForm();
              resetTestiForm();
            }}
            className={`flex-1 py-2.5 px-3 text-[10px] font-mono-tag font-bold tracking-wider uppercase rounded-none border flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
              activeAdminTab === tab.id
                ? "bg-editorial-text border-editorial-text text-editorial-bg shadow-sm"
                : "bg-transparent border-transparent text-editorial-muted dark:text-neutral-300 hover:bg-black/5 hover:text-editorial-text"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* MAIN LAYOUT CHANGER BY ACTIVE ADMINTAB */}
      
      {/* 1. PROJECTS TAB VIEW */}
      {activeAdminTab === "projects" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* GitHub Importer (Header row) */}
          <div className="lg:col-span-12 bg-white dark:bg-[#1a1714] border border-editorial-line dark:border-neutral-850 p-6 rounded-none shadow-sm transition-colors">
            <div className="flex items-center gap-2.5 mb-4">
              <Sparkles className="w-5 h-5 text-editorial-accent animate-pulse" />
              <div>
                <h3 className="font-serif-display font-bold text-sm text-editorial-text dark:text-neutral-200">
                  Import Model AI dari Repositori GitHub
                </h3>
                <p className="text-xs text-editorial-muted dark:text-neutral-400 mt-0.5">
                  Masukkan link github, API server-side Gemini 3.5 akan mengekstrak kode, merumuskan Before/After story, menyusun metrik ROI, serta mendesain simulator visual interaktif secara otomatis.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="https://github.com/username/repository-kopi-pos"
                value={githubUrlInput}
                onChange={(e) => setGithubUrlInput(e.target.value)}
                disabled={githubAnalyzing}
                className="flex-1 bg-stone-50 dark:bg-stone-900 border border-editorial-line dark:border-neutral-800 rounded-none px-4 py-2.5 text-xs text-editorial-text dark:text-neutral-200 outline-none focus:border-editorial-accent font-mono transition-all"
              />
              <button
                onClick={handleAnalyzeGithub}
                disabled={githubAnalyzing}
                className="px-6 py-2.5 bg-editorial-accent text-white hover:bg-red-800 text-[10px] font-mono-tag font-bold tracking-widest uppercase rounded-none transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
              >
                {githubAnalyzing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Memproses Analisis...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Analisis & Bangun Simulator
                  </>
                )}
              </button>
            </div>

            {githubAnalyzing && (
              <div className="mt-4 bg-[#FAF8F5] dark:bg-stone-900 p-4 border border-dotted border-editorial-line dark:border-neutral-800 text-xs">
                <div className="flex justify-between items-center text-[10px] text-editorial-muted dark:text-neutral-300 font-bold mb-1.5 font-mono-tag">
                  <span>PROSPEK PROSES AI GEMINI:</span>
                  <span>{githubAnalysisStep * 25}%</span>
                </div>
                <div className="w-full h-1 bg-stone-200 dark:bg-stone-800 overflow-hidden">
                  <motion.div 
                    className="h-full bg-editorial-accent" 
                    animate={{ width: `${githubAnalysisStep * 25}%` }}
                    transition={{ duration: 0.6 }}
                  />
                </div>
                <p className="text-[10px] text-editorial-muted mt-2 font-mono-tag italic">
                  ⏳ {
                    githubAnalysisStep === 1 
                      ? "Menghubungkan ke API GitHub & mengekstrak berkas master..."
                      : githubAnalysisStep === 2
                      ? "Membaca README.md, merumuskan formula pemicu problem nyata..."
                      : githubAnalysisStep === 3
                      ? "Menyusun skenario story Before/After serta representasi benefit..."
                      : "Mensintesis simulator POS HTML dengan polesan visual Tailwind CSS penuh..."
                  }
                </p>
              </div>
            )}
          </div>

          {/* Left: Project List Column */}
          <div className="lg:col-span-5 bg-white dark:bg-[#1a1714] border border-editorial-line dark:border-neutral-850 p-6 rounded-none shadow-sm flex flex-col h-[700px]">
            <h3 className="font-serif-display font-extrabold text-sm text-editorial-text dark:text-neutral-200 mb-4 tracking-tight flex items-center justify-between border-b border-editorial-line pb-3">
              <span>Proyek Tersedia ({projects.length})</span>
              <button onClick={resetProjectForm} className="text-[10px] font-mono-tag font-bold text-editorial-accent uppercase tracking-wider cursor-pointer">
                + Baru
              </button>
            </h3>

            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 scrollbar-thin">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-editorial-muted gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-editorial-accent" />
                  <span className="text-[10px] font-mono-tag font-semibold">Memuat Proyek...</span>
                </div>
              ) : projects.length === 0 ? (
                <p className="text-center py-20 text-xs text-editorial-muted">Belum ada proyek portofolio.</p>
              ) : (
                projects.map((p) => (
                  <div 
                    key={p.id}
                    className={`p-4 border transition-all flex justify-between items-start rounded-none ${
                      editingId === p.id 
                        ? "bg-stone-50 dark:bg-stone-900 border-editorial-text" 
                        : "bg-white dark:bg-stone-950/40 border-editorial-line dark:border-neutral-850 hover:border-editorial-text"
                    }`}
                  >
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={`text-[9px] font-mono-tag font-bold uppercase px-1.5 py-0.5 ${
                          p.status === "published" ? "bg-emerald-50 text-emerald-800" : "bg-stone-100 text-stone-500"
                        }`}>
                          {p.status}
                        </span>
                        <span className="text-[9px] text-editorial-muted font-mono-tag uppercase">{p.kategori}</span>
                      </div>
                      <h4 className="text-xs font-serif-display font-bold text-editorial-text dark:text-neutral-100 leading-normal line-clamp-1">{p.nama}</h4>
                    </div>

                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => startEditProject(p)} className="p-1 text-editorial-muted hover:text-editorial-text transition-colors">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDeleteProject(p.id, p.nama)} className="p-1 text-editorial-accent hover:text-red-700 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right: Project form / preview */}
          <div className="lg:col-span-7 bg-white dark:bg-[#1a1714] border border-editorial-line dark:border-neutral-800 p-6 rounded-none shadow-sm h-[700px] flex flex-col justify-between">
            <div className="flex justify-between items-center border-b border-editorial-line dark:border-neutral-800 pb-3 mb-4">
              <h4 className="font-serif-display font-extrabold text-sm text-editorial-text dark:text-neutral-200">
                {editingId ? "✏️ Edit Parameter Proyek" : "✨ Konstruksi Proyek Baru"}
              </h4>

              <div className="flex bg-stone-100 dark:bg-stone-900 p-1 border border-editorial-line dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setActiveFormTab("fields")}
                  className={`px-3 py-1 text-[9px] font-mono-tag font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                    activeFormTab === "fields" ? "bg-editorial-text text-editorial-bg" : "text-editorial-muted hover:text-editorial-text"
                  }`}
                >
                  Indikator Form
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFormTab("preview")}
                  className={`px-3 py-1 text-[9px] font-mono-tag font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                    activeFormTab === "preview" ? "bg-editorial-text text-editorial-bg" : "text-editorial-muted hover:text-editorial-text"
                  }`}
                >
                  Live Sandbox Code
                </button>
              </div>
            </div>

            <form onSubmit={handleProjectSubmit} className="flex-1 flex flex-col justify-between overflow-hidden">
              
              {activeFormTab === "fields" && (
                <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-mono-tag font-bold text-editorial-muted uppercase tracking-wider block mb-1">Nama Proyek</label>
                      <input
                        type="text"
                        required
                        placeholder="Kahawa Kopi POS"
                        value={projectForm.nama}
                        onChange={(e) => setProjectForm({ ...projectForm, nama: e.target.value })}
                        className="w-full bg-stone-50 dark:bg-stone-900 border border-editorial-line/80 dark:border-neutral-800 px-3 py-2 text-xs text-editorial-text dark:text-neutral-200 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono-tag font-bold text-editorial-muted uppercase tracking-wider block mb-1">Kategori</label>
                      <select
                        value={projectForm.kategori}
                        onChange={(e) => setProjectForm({ ...projectForm, kategori: e.target.value })}
                        className="w-full bg-stone-50 dark:bg-stone-900 border border-editorial-line/80 dark:border-neutral-800 px-3 py-2 text-xs text-editorial-text dark:text-neutral-200 outline-none"
                      >
                        <option value="Point of Sales">Point of Sales</option>
                        <option value="Sistem Informasi UMKM">Sistem Informasi UMKM</option>
                        <option value="Otomasi & AI Integrasi">Otomasi & AI Integrasi</option>
                        <option value="Database & Spreadsheet">Database Logistik</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono-tag font-bold text-editorial-muted uppercase tracking-wider block mb-1">Tagline Bisnis</label>
                    <input
                      type="text"
                      placeholder="Sistem POS kasir untuk menekan 99% kerugian rekap menu kopi"
                      value={projectForm.tagline}
                      onChange={(e) => setProjectForm({ ...projectForm, tagline: e.target.value })}
                      className="w-full bg-stone-50 dark:bg-stone-900 border border-editorial-line/80 px-3 py-2 text-xs text-editorial-text dark:text-neutral-200 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-mono-tag font-bold text-editorial-muted uppercase tracking-wider block mb-1">Problem Statement (Before)</label>
                      <textarea
                        rows={3}
                        placeholder="Kesulitan pencatatan pesanan manual..."
                        value={projectForm.problem}
                        onChange={(e) => setProjectForm({ ...projectForm, problem: e.target.value })}
                        className="w-full bg-stone-50 dark:bg-stone-900 border border-editorial-line/80 p-3 text-xs text-editorial-text dark:text-neutral-200 outline-none resize-none leading-relaxed"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono-tag font-bold text-editorial-muted uppercase tracking-wider block mb-1">Story Solusi (After)</label>
                      <textarea
                        rows={3}
                        placeholder="Setelah otomasi, cetak menu dapur instan..."
                        value={projectForm.before_after}
                        onChange={(e) => setProjectForm({ ...projectForm, before_after: e.target.value })}
                        className="w-full bg-stone-50 dark:bg-stone-900 border border-editorial-line/80 p-3 text-xs text-editorial-text dark:text-neutral-200 outline-none resize-none leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* Dinamis Features */}
                  <div>
                    <label className="text-[10px] font-mono-tag font-bold text-editorial-muted uppercase tracking-wider block mb-1.5 flex justify-between items-center">
                      <span>Daftar Fitur Unggulan</span>
                      <button type="button" onClick={addFeatureRow} className="text-[10px] text-editorial-accent font-bold">+ Baris</button>
                    </label>
                    <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                      {projectForm.fitur.map((feat, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input
                            type="text"
                            placeholder={`Fitur ${idx + 1}`}
                            value={feat}
                            onChange={(e) => handleFeatureChange(idx, e.target.value)}
                            className="flex-1 bg-stone-50 dark:bg-stone-900 border border-editorial-line/80 rounded-none px-3 py-1.5 text-xs text-editorial-text dark:text-neutral-200 outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => removeFeatureRow(idx)}
                            disabled={projectForm.fitur.length <= 1}
                            className="text-editorial-accent disabled:opacity-40 p-1"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dinamis Impact Numbers */}
                  <div>
                    <label className="text-[10px] font-mono-tag font-bold text-editorial-muted uppercase tracking-wider block mb-1.5 flex justify-between items-center">
                      <span>Metrik ROI & Dampak Proyek</span>
                      <button type="button" onClick={addImpactRow} className="text-[10px] text-editorial-accent font-bold">+ ROI</button>
                    </label>
                    <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                      {projectForm.impact_numbers.map((imp, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Value (e.g., -80%)"
                            value={imp.value}
                            onChange={(e) => handleImpactChange(idx, "value", e.target.value)}
                            className="w-1/3 bg-stone-50 dark:bg-stone-900 border border-editorial-line rounded-none px-3 py-1 text-xs text-editorial-text dark:text-neutral-200 outline-none"
                          />
                          <input
                            type="text"
                            placeholder="Metrics Label (e.g., Transact Time)"
                            value={imp.label}
                            onChange={(e) => handleImpactChange(idx, "label", e.target.value)}
                            className="flex-1 bg-stone-50 dark:bg-stone-900 border border-editorial-line rounded-none px-3 py-1 text-xs text-editorial-text dark:text-neutral-200 outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => removeImpactRow(idx)}
                            disabled={projectForm.impact_numbers.length <= 1}
                            className="text-editorial-accent disabled:opacity-40 p-1 font-bold"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Github URL / Status */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-mono-tag font-bold text-editorial-muted uppercase tracking-wider block mb-1">Github URL</label>
                      <input
                        type="text"
                        placeholder="https://github.com/..."
                        value={projectForm.github_url}
                        onChange={(e) => setProjectForm({ ...projectForm, github_url: e.target.value })}
                        className="w-full bg-stone-50 dark:bg-stone-900 border border-editorial-line/80 px-3 py-2 text-xs text-editorial-text dark:text-neutral-200 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono-tag font-bold text-editorial-muted uppercase tracking-wider block mb-1">Status</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setProjectForm({ ...projectForm, status: "published" })}
                          className={`flex-1 py-1.5 text-xs font-mono-tag font-bold uppercase border cursor-pointer transition-all ${
                            projectForm.status === "published"
                              ? "bg-editorial-text text-editorial-bg border-editorial-text"
                              : "bg-white text-editorial-muted border-editorial-line"
                          }`}
                        >
                          Published
                        </button>
                        <button
                          type="button"
                          onClick={() => setProjectForm({ ...projectForm, status: "draft" })}
                          className={`flex-1 py-1.5 text-xs font-mono-tag font-bold uppercase border cursor-pointer transition-all ${
                            projectForm.status === "draft"
                              ? "bg-editorial-text text-editorial-bg border-editorial-text"
                              : "bg-white text-editorial-muted border-editorial-line"
                          }`}
                        >
                          Draft
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeFormTab === "preview" && (
                <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden">
                  <div className="w-full md:w-1/2 flex flex-col h-full overflow-hidden">
                    <label className="text-[10px] font-mono-tag font-bold text-editorial-muted uppercase block mb-1">Isi Kode Demo Simulator HTML</label>
                    <textarea
                      value={projectForm.demo_html}
                      onChange={(e) => setProjectForm({ ...projectForm, demo_html: e.target.value })}
                      className="flex-1 w-full bg-stone-950 text-neutral-200 border border-editorial-line p-3 font-mono text-[10px] outline-none leading-relaxed overflow-auto resize-none"
                    />
                  </div>
                  <div className="w-full md:w-1/2 flex flex-col h-full bg-stone-50 dark:bg-stone-900 border border-editorial-line p-3 overflow-hidden">
                    <label className="text-[10px] font-mono-tag font-bold text-editorial-muted uppercase block mb-1.5 flex justify-between">Pratinjau Simulator</label>
                    <div className="flex-1 bg-white rounded-none border border-neutral-300 overflow-hidden shadow-inner">
                      <iframe
                        srcDoc={projectForm.demo_html}
                        title="Live Preview Sandbox"
                        sandbox="allow-scripts allow-modals"
                        className="w-full h-full border-none bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-editorial-line dark:border-neutral-800 flex justify-between items-center bg-white dark:bg-[#1a1714] shrink-0">
                <button type="button" onClick={resetProjectForm} className="text-xs font-mono-tag font-bold text-editorial-muted hover:text-editorial-text uppercase tracking-wider">
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2 bg-editorial-text border border-editorial-text text-editorial-bg font-mono-tag text-[10px] font-bold tracking-widest uppercase hover:bg-neutral-800 transition-all cursor-pointer flex items-center gap-1"
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Simpan Proyek
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 2. TESTIMONIALS TAB VIEW */}
      {activeAdminTab === "testimonials" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left panel: test list */}
          <div className="lg:col-span-5 bg-white dark:bg-[#1a1714] border border-editorial-line p-6 shadow-sm flex flex-col h-[550px]">
            <h3 className="font-serif-display font-extrabold text-sm text-editorial-text dark:text-neutral-200 mb-4 tracking-tight border-b border-editorial-line pb-3">
              Testimoni Klien Aktif ({testimonials.length})
            </h3>
            
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
              {testimonials.map((t) => (
                <div key={t.id} className="p-4 border border-editorial-line dark:border-neutral-800 bg-[#FAF8F5] dark:bg-stone-900/40 relative flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="text-xs font-bold text-editorial-text dark:text-neutral-200 font-serif-display leading-tight">{t.nama}</h5>
                      <span className="text-[10px] font-mono-tag text-editorial-muted dark:text-neutral-400 uppercase">{t.jabatan} @ {t.perusahaan}</span>
                    </div>
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="w-3 h-3 fill-amber-500" />)}
                    </div>
                  </div>
                  <p className="text-[11px] text-editorial-muted dark:text-neutral-400 font-sans leading-relaxed italic mt-2">
                    "{t.konten}"
                  </p>
                  <div className="flex justify-end gap-2 mt-3 pt-2 border-t border-editorial-line dark:border-neutral-800 text-[10px] items-center">
                    <button onClick={() => {
                      setEditingTestiId(t.id);
                      setTestiForm({
                        nama: t.nama,
                        jabatan: t.jabatan,
                        perusahaan: t.perusahaan,
                        rating: t.rating,
                        konten: t.konten
                      });
                    }} className="text-editorial-text hover:underline">Edit</button>
                    <button onClick={() => handleDeleteTesti(t.id)} className="text-editorial-accent hover:underline">Hapus</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right panel: test form */}
          <form onSubmit={handleTestiSubmit} className="lg:col-span-7 bg-white dark:bg-[#1a1714] border border-editorial-line p-6 shadow-sm flex flex-col justify-between h-[550px]">
            <div>
              <h3 className="font-serif-display font-extrabold text-sm text-editorial-text dark:text-neutral-200 mb-6 border-b border-editorial-line pb-3">
                {editingTestiId ? "✏️ Edit Feedbacks Klien" : "✨ Terbitkan Testimoni Baru"}
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-mono-tag font-bold text-editorial-muted uppercase block mb-1">Nama Pemberi</label>
                    <input
                      type="text"
                      required
                      placeholder="Pak Hendra"
                      value={testiForm.nama}
                      onChange={(e) => setTestiForm({ ...testiForm, nama: e.target.value })}
                      className="w-full bg-stone-50 dark:bg-stone-900 border border-editorial-line/80 px-3 py-2 text-xs text-editorial-text dark:text-neutral-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono-tag font-bold text-editorial-muted uppercase block mb-1">Rating</label>
                    <select
                      value={testiForm.rating}
                      onChange={(e) => setTestiForm({ ...testiForm, rating: Number(e.target.value) })}
                      className="w-full bg-stone-50 dark:bg-stone-900 border border-editorial-line/80 px-3 py-2 text-xs text-editorial-text dark:text-neutral-200 outline-none"
                    >
                      <option value={5}>⭐⭐⭐⭐⭐ (5 Bintang)</option>
                      <option value={4}>⭐⭐⭐⭐ (4 Bintang)</option>
                      <option value={3}>⭐⭐⭐ (3 Bintang)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-mono-tag font-bold text-editorial-muted uppercase block mb-1">Pekerjaan/Jabatan</label>
                    <input
                      type="text"
                      placeholder="Pemilik Cafe"
                      value={testiForm.jabatan}
                      onChange={(e) => setTestiForm({ ...testiForm, jabatan: e.target.value })}
                      className="w-full bg-stone-50 dark:bg-stone-900 border border-editorial-line/80 px-3 py-2 text-xs text-editorial-text dark:text-neutral-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono-tag font-bold text-editorial-muted uppercase block mb-1">Perusahaan/Bisnis</label>
                    <input
                      type="text"
                      placeholder="Kopi Nusantara"
                      value={testiForm.perusahaan}
                      onChange={(e) => setTestiForm({ ...testiForm, perusahaan: e.target.value })}
                      className="w-full bg-stone-50 dark:bg-stone-900 border border-editorial-line/80 px-3 py-2 text-xs text-editorial-text dark:text-neutral-200 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono-tag font-bold text-editorial-muted uppercase block mb-1">Konten Ulasan</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tulis ulasan klien di sini secara terperinci..."
                    value={testiForm.konten}
                    onChange={(e) => setTestiForm({ ...testiForm, konten: e.target.value })}
                    className="w-full bg-stone-50 dark:bg-stone-900 border border-editorial-line/80 p-3 text-xs text-editorial-text dark:text-neutral-200 outline-none resize-none leading-relaxed"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-editorial-line flex justify-between items-center shrink-0">
              <button type="button" onClick={resetTestiForm} className="text-xs font-mono-tag font-bold text-editorial-muted hover:text-editorial-text uppercase">Batal</button>
              <button type="submit" disabled={actionLoading} className="px-5 py-2 bg-editorial-text text-editorial-bg hover:bg-neutral-800 font-mono-tag uppercase text-[10px] font-bold tracking-widest cursor-pointer flex items-center gap-1.5">
                {actionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                Simpan Testimonial
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. SETTINGS EDITOR TAB VIEW */}
      {activeAdminTab === "settings" && (
        <form onSubmit={handleSettingsSubmit} className="bg-white dark:bg-[#1a1714] border border-editorial-line p-6 md:p-8 shadow-sm space-y-6 max-w-4xl mx-auto">
          <h3 className="font-serif-display font-bold text-sm text-editorial-text dark:text-neutral-200 border-b border-editorial-line pb-3 tracking-tight">
            Konfigurasi Profil & Parameter Global (settings.json)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-mono-tag font-bold text-editorial-muted uppercase block mb-1.5">Nama Lengkap Builder</label>
                <input
                  type="text"
                  required
                  value={settingsForm.nama}
                  onChange={(e) => setSettingsForm({ ...settingsForm, nama: e.target.value })}
                  className="w-full bg-stone-50 dark:bg-stone-900 border border-editorial-line rounded-none px-4 py-2 text-xs text-editorial-text dark:text-neutral-200 outline-none focus:border-editorial-accent"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono-tag font-bold text-editorial-muted uppercase block mb-1.5">Tagline Personal Utama</label>
                <input
                  type="text"
                  required
                  value={settingsForm.tagline}
                  onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                  className="w-full bg-stone-50 dark:bg-stone-900 border border-editorial-line rounded-none px-4 py-2 text-xs text-editorial-text dark:text-neutral-200 outline-none focus:border-editorial-accent"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono-tag font-bold text-editorial-muted uppercase block mb-1.5">WhatsApp Chat Direct Link</label>
                <input
                  type="text"
                  required
                  value={settingsForm.wa_link}
                  onChange={(e) => setSettingsForm({ ...settingsForm, wa_link: e.target.value })}
                  className="w-full bg-stone-50 dark:bg-stone-900 border border-editorial-line rounded-none px-4 py-2 text-xs text-editorial-text dark:text-neutral-200 outline-none focus:border-editorial-accent font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono-tag font-bold text-editorial-muted uppercase block mb-1.5">Biografi Profesional Singkat</label>
                <textarea
                  rows={4}
                  value={settingsForm.bio}
                  onChange={(e) => setSettingsForm({ ...settingsForm, bio: e.target.value })}
                  className="w-full bg-stone-50 dark:bg-stone-900 border border-editorial-line rounded-none p-3.5 text-xs text-editorial-text dark:text-neutral-200 outline-none resize-none leading-relaxed"
                />
              </div>
            </div>

            <div className="space-y-4">
              {/* Global Impact Numbers (Three sets of metrics) */}
              <div className="border border-editorial-line p-4 bg-[#FAF8F5] dark:bg-stone-950/60 rounded-none space-y-4">
                <span className="text-[10px] font-mono-tag font-bold text-editorial-accent uppercase tracking-widest block border-b pb-1.5">
                  METRIK INOVASI GLOBAL (DASHBOARD BANNER)
                </span>
                
                {/* Metric 1 */}
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="M1 Value (85%)"
                    value={settingsForm.gap_val_1}
                    onChange={(e) => setSettingsForm({ ...settingsForm, gap_val_1: e.target.value })}
                    className="bg-white dark:bg-stone-900 border border-editorial-line rounded-none px-2 py-1 text-xs text-editorial-text dark:text-neutral-200 outline-none text-center font-bold"
                  />
                  <input
                    type="text"
                    placeholder="M1 Label"
                    value={settingsForm.gap_label_1}
                    onChange={(e) => setSettingsForm({ ...settingsForm, gap_label_1: e.target.value })}
                    className="col-span-2 bg-white dark:bg-stone-900 border border-editorial-line rounded-none px-2 py-1 text-xs text-editorial-text dark:text-neutral-200 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="M1 Description"
                    value={settingsForm.gap_desc_1}
                    onChange={(e) => setSettingsForm({ ...settingsForm, gap_desc_1: e.target.value })}
                    className="col-span-3 bg-white dark:bg-stone-900 border border-editorial-line rounded-none px-2 py-1 text-[10px] text-editorial-muted dark:text-neutral-400 outline-none"
                  />
                </div>

                {/* Metric 2 */}
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="M2 Value (40+)"
                    value={settingsForm.gap_val_2}
                    onChange={(e) => setSettingsForm({ ...settingsForm, gap_val_2: e.target.value })}
                    className="bg-white dark:bg-stone-900 border border-editorial-line rounded-none px-2 py-1 text-xs text-editorial-text dark:text-neutral-200 outline-none text-center font-bold"
                  />
                  <input
                    type="text"
                    placeholder="M2 Label"
                    value={settingsForm.gap_label_2}
                    onChange={(e) => setSettingsForm({ ...settingsForm, gap_label_2: e.target.value })}
                    className="col-span-2 bg-white dark:bg-stone-900 border border-editorial-line rounded-none px-2 py-1 text-xs text-editorial-text dark:text-neutral-200 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="M2 Description"
                    value={settingsForm.gap_desc_2}
                    onChange={(e) => setSettingsForm({ ...settingsForm, gap_desc_2: e.target.value })}
                    className="col-span-3 bg-white dark:bg-stone-900 border border-editorial-line rounded-none px-2 py-1 text-[10px] text-editorial-muted dark:text-neutral-400 outline-none"
                  />
                </div>

                {/* Metric 3 */}
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="M3 Value (3.5x)"
                    value={settingsForm.gap_val_3}
                    onChange={(e) => setSettingsForm({ ...settingsForm, gap_val_3: e.target.value })}
                    className="bg-white dark:bg-stone-900 border border-editorial-line rounded-none px-2 py-1 text-xs text-editorial-text dark:text-neutral-200 outline-none text-center font-bold"
                  />
                  <input
                    type="text"
                    placeholder="M3 Label"
                    value={settingsForm.gap_label_3}
                    onChange={(e) => setSettingsForm({ ...settingsForm, gap_label_3: e.target.value })}
                    className="col-span-2 bg-white dark:bg-stone-900 border border-editorial-line rounded-none px-2 py-1 text-xs text-editorial-text dark:text-neutral-200 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="M3 Description"
                    value={settingsForm.gap_desc_3}
                    onChange={(e) => setSettingsForm({ ...settingsForm, gap_desc_3: e.target.value })}
                    className="col-span-3 bg-white dark:bg-stone-900 border border-editorial-line rounded-none px-2 py-1 text-[10px] text-editorial-muted dark:text-neutral-400 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-mono-tag font-bold text-editorial-muted uppercase block mb-1.5 flex justify-between items-center">
              <span>System Prompt AI Assistant (Floating Chatbot Instruksi)</span>
              <HelpCircle className="w-3.5 h-3.5 text-editorial-muted" />
            </label>
            <textarea
              rows={4}
              value={settingsForm.system_prompt_ai}
              onChange={(e) => setSettingsForm({ ...settingsForm, system_prompt_ai: e.target.value })}
              className="w-full bg-stone-50 dark:bg-stone-900 border border-editorial-line rounded-none p-3.5 font-mono text-xs text-editorial-text dark:text-neutral-200 outline-none resize-none leading-relaxed"
            />
          </div>

          <div className="pt-4 border-t border-editorial-line flex justify-end">
            <button
              type="submit"
              disabled={actionLoading}
              className="px-6 py-3 bg-editorial-text border border-editorial-text text-editorial-bg text-[10px] font-mono-tag font-bold tracking-widest uppercase hover:bg-neutral-800 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
            >
              {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5 animate-pulse" />}
              Perbarui Pengaturan Portofolio
            </button>
          </div>
        </form>
      )}

      {/* 4. LEADS INQUIRIES VIEW */}
      {activeAdminTab === "contacts" && (
        <div className="bg-white dark:bg-[#1a1714] border border-editorial-line p-6 shadow-sm rounded-none">
          <h3 className="font-serif-display font-extrabold text-sm text-editorial-text dark:text-neutral-200 mb-6 border-b border-editorial-line pb-3">
            Inbox Peminat Kolaborasi & Solusi Bisnis ({contacts.length})
          </h3>

          <div className="space-y-4">
            {loading ? (
              <p className="text-center py-10 text-xs text-editorial-muted">Menghubungi kotak masuk...</p>
            ) : contacts.length === 0 ? (
              <p className="text-center py-10 text-xs text-editorial-muted">Kotak masuk masih kosong. Belum ada UMKM mengirim penawaran.</p>
            ) : (
              contacts.map((c) => (
                <div key={c.id} className="p-5 border border-editorial-line dark:border-neutral-850 bg-[#FAF8F5] dark:bg-stone-950/40 rounded-none flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1 md:max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-editorial-text dark:text-neutral-100">{c.nama}</span>
                      <span className={`text-[9px] font-mono-tag uppercase tracking-wider font-bold px-1.5 py-0.5 border ${
                        c.bizType === "umkm" ? "bg-amber-100 text-amber-900 border-amber-200" : "bg-neutral-900 text-white border-neutral-800"
                      }`}>
                        {c.bizType}
                      </span>
                    </div>
                    {c.email && (
                      <p className="text-[10px] font-mono text-editorial-muted dark:text-neutral-400 font-medium">Email: {c.email}</p>
                    )}
                    <p className="text-xs text-editorial-muted dark:text-neutral-300 font-sans leading-relaxed pt-1.5">{c.message}</p>
                    <p className="text-[9px] text-zinc-400 pt-1">Dikirim: {new Date(c.tanggal).toLocaleString("id-ID")}</p>
                  </div>

                  <button
                    onClick={() => handleDeleteContact(c.id)}
                    className="p-1 px-3 text-[10px] border border-editorial-accent text-editorial-accent hover:bg-editorial-accent hover:text-white transition-all uppercase font-mono-tag font-bold tracking-wider cursor-pointer"
                  >
                    Dihapus
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
}
