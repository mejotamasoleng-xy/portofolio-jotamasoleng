import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

const DATA_DIR = path.join(process.cwd(), "data");
const PROJECTS_FILE = path.join(DATA_DIR, "projects.json");
const TESTIMONIALS_FILE = path.join(DATA_DIR, "testimonials.json");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");
const CONTACTS_FILE = path.join(DATA_DIR, "contacts.json");

// Ensure data folder has files
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

app.use(express.json({ limit: "50mb" }));

// Helper function to read/write JSON
function readJson(filePath: string, defaultVal: any) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultVal, null, 2), "utf-8");
      return defaultVal;
    }
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    console.error(`Gagal membaca ${filePath}:`, error);
    return defaultVal;
  }
}

function writeJson(filePath: string, data: any) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error(`Gagal menulis ke ${filePath}:`, error);
    return false;
  }
}

// Lazy initialization for Gemini Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required. Silakan tambahkan kunci API Anda di Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// ==========================================
// PUBLIC API ENDPOINTS
// ==========================================

// 1. GET /api/projects (Published Only)
app.get("/api/projects", (req, res) => {
  const projects = readJson(PROJECTS_FILE, []);
  const published = projects.filter((p: any) => p.status === "published");
  res.json(published);
});

// 2. GET /api/projects/:id
app.get("/api/projects/:id", (req, res) => {
  const projects = readJson(PROJECTS_FILE, []);
  const found = projects.find((p: any) => p.id === req.params.id);
  if (!found) {
    return res.status(404).json({ error: "Proyek tidak ditemukan" });
  }
  res.json(found);
});

// 3. GET /api/testimonials
app.get("/api/testimonials", (req, res) => {
  const list = readJson(TESTIMONIALS_FILE, []);
  res.json(list);
});

// 4. GET /api/settings
app.get("/api/settings", (req, res) => {
  const settings = readJson(SETTINGS_FILE, {
    nama: "Jotama Soleng",
    tagline: "AI Builder & Automator untuk UMKM & Investor",
    bio: "Saya membantu para pelaku UMKM mengotomatisasi pencatatan pembukuan kasir, pelacakan stok, dan integrasi kecerdasan buatan (AI) untuk meningkatkan efisiensi operasional harian hingga 4x lipat.",
    wa_link: "https://wa.me/6282245210000",
    global_impacts: [
      { label: "Efisiensi Waktu", value: "85%", desc: "Waktu kasir dan administrasi terpangkas harian" },
      { label: "UMKM Terbantu", "value": "40+", "desc": "Usaha lokal yang terintegrasi otomasi digital" },
      { label: "Rata-Rata ROI", "value": "3.5x", "desc": "Pengembalian modal investasi teknologi dalam 3 bulan" }
    ],
    system_prompt_ai: "You are a helpful assistant."
  });
  res.json(settings);
});

// 5. POST /api/contact (Saves a lead contact submission)
app.post("/api/contact", (req, res) => {
  const contacts = readJson(CONTACTS_FILE, []);
  const newSubmission = {
    id: `contact_${Date.now()}`,
    nama: req.body.nama || "Tanpa Nama",
    email: req.body.email || "",
    bizType: req.body.bizType || "UMKM",
    message: req.body.message || "",
    tanggal: new Date().toISOString()
  };
  contacts.push(newSubmission);
  writeJson(CONTACTS_FILE, contacts);
  res.status(201).json({ success: true, message: "Terima kasih! Pesan Anda telah terkirim." });
});

// 6. POST /api/chat (Proxy to Gemini API for Assistant)
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    const settings = readJson(SETTINGS_FILE, {});
    const systemInstruction = settings.system_prompt_ai || "Kamu adalah AI Assistant virtual dari Jotama Soleng, seorang AI Builder & Automator berbakat untuk UMKM.";

    const ai = getGeminiClient();
    const contents: any[] = [];
    
    if (history && Array.isArray(history)) {
      history.forEach((h: any) => {
        contents.push({
          role: h.role === "assistant" ? "model" : h.role,
          parts: [{ text: h.text }]
        });
      });
    }
    
    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({ text: response.text || "" });
  } catch (error: any) {
    console.error("Gagal melakukan chat AI:", error);
    res.status(500).json({ error: error.message || "Gagal memproses ChatGPT/Gemini" });
  }
});

// ==========================================
// ADMIN CRUD API ENDPOINTS (/api/admin/*)
// ==========================================

// Projects CRUD
app.get("/api/admin/projects", (req, res) => {
  const projects = readJson(PROJECTS_FILE, []);
  res.json(projects);
});

app.post("/api/admin/projects", (req, res) => {
  const projects = readJson(PROJECTS_FILE, []);
  const newProject = {
    id: `proj_${Date.now()}`,
    nama: req.body.nama || "Proyek Baru",
    kategori: req.body.kategori || "Point of Sales",
    tagline: req.body.tagline || "",
    problem: req.body.problem || "",
    before_after: req.body.before_after || "",
    fitur: Array.isArray(req.body.fitur) ? req.body.fitur : [],
    impact_numbers: Array.isArray(req.body.impact_numbers) ? req.body.impact_numbers : [],
    github_url: req.body.github_url || "",
    demo_html: req.body.demo_html || "<div>Demo live belum tersedia.</div>",
    status: req.body.status || "draft",
    tanggal_dibuat: new Date().toISOString().split("T")[0],
    tanggal_update: new Date().toISOString().split("T")[0],
  };
  projects.push(newProject);
  writeJson(PROJECTS_FILE, projects);
  res.status(201).json(newProject);
});

app.put("/api/admin/projects/:id", (req, res) => {
  const projects = readJson(PROJECTS_FILE, []);
  const idx = projects.findIndex((p: any) => p.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: "Proyek tidak ditemukan" });
  }

  const existing = projects[idx];
  const updated = {
    ...existing,
    nama: req.body.nama !== undefined ? req.body.nama : existing.nama,
    kategori: req.body.kategori !== undefined ? req.body.kategori : existing.kategori,
    tagline: req.body.tagline !== undefined ? req.body.tagline : existing.tagline,
    problem: req.body.problem !== undefined ? req.body.problem : existing.problem,
    before_after: req.body.before_after !== undefined ? req.body.before_after : existing.before_after,
    fitur: Array.isArray(req.body.fitur) ? req.body.fitur : existing.fitur,
    impact_numbers: Array.isArray(req.body.impact_numbers) ? req.body.impact_numbers : existing.impact_numbers,
    github_url: req.body.github_url !== undefined ? req.body.github_url : existing.github_url,
    demo_html: req.body.demo_html !== undefined ? req.body.demo_html : existing.demo_html,
    status: req.body.status !== undefined ? req.body.status : existing.status,
    tanggal_update: new Date().toISOString().split("T")[0],
  };

  projects[idx] = updated;
  writeJson(PROJECTS_FILE, projects);
  res.json(updated);
});

app.delete("/api/admin/projects/:id", (req, res) => {
  const projects = readJson(PROJECTS_FILE, []);
  const filtered = projects.filter((p: any) => p.id !== req.params.id);
  if (projects.length === filtered.length) {
    return res.status(404).json({ error: "Proyek tidak ditemukan" });
  }
  writeJson(PROJECTS_FILE, filtered);
  res.json({ message: "Proyek berhasil dihapus" });
});

// Testimonials CRUD
app.get("/api/admin/testimonials", (req, res) => {
  const list = readJson(TESTIMONIALS_FILE, []);
  res.json(list);
});

app.post("/api/admin/testimonials", (req, res) => {
  const list = readJson(TESTIMONIALS_FILE, []);
  const newT = {
    id: `testi_${Date.now()}`,
    nama: req.body.nama || "Klien Misterius",
    jabatan: req.body.jabatan || "Pemilik Usaha",
    perusahaan: req.body.perusahaan || "",
    avatar_url: req.body.avatar_url || "",
    rating: Number(req.body.rating) || 5,
    konten: req.body.konten || "",
    tanggal: new Date().toISOString().split("T")[0]
  };
  list.push(newT);
  writeJson(TESTIMONIALS_FILE, list);
  res.status(201).json(newT);
});

app.put("/api/admin/testimonials/:id", (req, res) => {
  const list = readJson(TESTIMONIALS_FILE, []);
  const idx = list.findIndex((t: any) => t.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: "Testimonial tidak ditemukan" });
  }
  const existing = list[idx];
  const updated = {
    ...existing,
    nama: req.body.nama !== undefined ? req.body.nama : existing.nama,
    jabatan: req.body.jabatan !== undefined ? req.body.jabatan : existing.jabatan,
    perusahaan: req.body.perusahaan !== undefined ? req.body.perusahaan : existing.perusahaan,
    avatar_url: req.body.avatar_url !== undefined ? req.body.avatar_url : existing.avatar_url,
    rating: req.body.rating !== undefined ? Number(req.body.rating) : existing.rating,
    konten: req.body.konten !== undefined ? req.body.konten : existing.konten,
  };
  list[idx] = updated;
  writeJson(TESTIMONIALS_FILE, list);
  res.json(updated);
});

app.delete("/api/admin/testimonials/:id", (req, res) => {
  const list = readJson(TESTIMONIALS_FILE, []);
  const filtered = list.filter((t: any) => t.id !== req.params.id);
  if (list.length === filtered.length) {
    return res.status(404).json({ error: "Testimonial tidak ditemukan" });
  }
  writeJson(TESTIMONIALS_FILE, filtered);
  res.json({ message: "Testimonial berhasil dihapus" });
});

// Settings Editor API
app.put("/api/admin/settings", (req, res) => {
  const existing = readJson(SETTINGS_FILE, {});
  const updated = {
    ...existing,
    nama: req.body.nama !== undefined ? req.body.nama : existing.nama,
    tagline: req.body.tagline !== undefined ? req.body.tagline : existing.tagline,
    bio: req.body.bio !== undefined ? req.body.bio : existing.bio,
    wa_link: req.body.wa_link !== undefined ? req.body.wa_link : existing.wa_link,
    global_impacts: Array.isArray(req.body.global_impacts) ? req.body.global_impacts : existing.global_impacts,
    system_prompt_ai: req.body.system_prompt_ai !== undefined ? req.body.system_prompt_ai : existing.system_prompt_ai,
  };
  writeJson(SETTINGS_FILE, updated);
  res.json(updated);
});

// Contacts Reader API
app.get("/api/admin/contacts", (req, res) => {
  const list = readJson(CONTACTS_FILE, []);
  res.json(list);
});

app.delete("/api/admin/contacts/:id", (req, res) => {
  const list = readJson(CONTACTS_FILE, []);
  const filtered = list.filter((c: any) => c.id !== req.params.id);
  writeJson(CONTACTS_FILE, filtered);
  res.json({ message: "Lead berhasil dihapus" });
});

// API Endpoint: GitHub Importer & AI Analyzer berbasis Gemini
app.post("/api/analyze-github", async (req, res) => {
  const { repoUrl } = req.body;
  if (!repoUrl) {
    return res.status(400).json({ error: "repoUrl diperlukan" });
  }

  console.log(`Menerima analisis untuk GitHub: ${repoUrl}`);

  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
  let owner = "mejotamasoleng-xy";
  let repo = "";
  if (match) {
    owner = match[1];
    repo = match[2].replace(/\.git$/, "");
  } else {
    repo = repoUrl.split("/").pop() || "Sistem Kasir";
  }

  let readmeText = "";
  let repoInfo: any = {};

  try {
    const infoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: { "User-Agent": "aistudio-build-app" },
    });
    if (infoRes.ok) {
      repoInfo = await infoRes.json();
    }

    const readmeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
      headers: { "User-Agent": "aistudio-build-app" },
    });
    if (readmeRes.ok) {
      const readmeData: any = await readmeRes.json();
      if (readmeData.content) {
        readmeText = Buffer.from(readmeData.content, "base64").toString("utf-8");
      }
    }
  } catch (err) {
    console.warn("Gagal memperoleh data dari GitHub:", err);
  }

  const contextualInput = `
Nama Repositori: ${repo}
Pemilik: ${owner}
Deskripsi Dasar GitHub: ${repoInfo.description || "Aplikasi POS kasir untuk kopi/toko UMKM"}
README Isi:
${readmeText || "Aplikasi point-of-sales kasir cafe / kedai makan yang berjalan di browser, mendukung transaksi, input menu, pembayaran, cetak nota, dan pengelolaan stok sederhana."}
  `;

  try {
    const ai = getGeminiClient();

    const systemInstruction = `
Kamu adalah AI Expert Builder dan Chief Technical Designer untuk UMKM dan Startup.
Tugasmu adalah menganalisis repositori proyek GitHub yang dikirimkan, lalu merumuskannya kembali menjadi entri portofolio profesional kelas dunia yang menarik bagi UMKM (Usaha Mikro Kecil Menengah) dan calon investor.

Kamu harus mengembalikan data berformat JSON murni sesuai schema yang kami butuhkan.
Nilai 'demo_html' HARUS berupa satu berkas HTML5 lengkap (standalone) yang menyertakan Tailwind CSS via CDN (https://cdn.tailwindcss.com) dan ikon Bootstrap Icons (https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css) jika diperlukan.
Halaman demo_html ini berupa simulator antarmuka interaktif mini dari produk aslinya (misal POS kopi, kasir kedai makan), yang memperbolehkan user untuk melihat katalog item, memasukkan item ke keranjang belanja, memperbarui jumlah, menghitung total bayar, menghitung kembalian, atau interaksi inti lainnya menggunakan JavaScript dalam satu halaman saja. Buat visual simulator ini sangat estetik, modern, rapi, menggunakan warna-warna netral bisnis atau tema spesifik yang memikat mata (seperti emerald untuk kedai, amber untuk cafe, slate untuk teknologi bisnis).

Skema JSON yang harus kamu kembalikan:
{
  "nama": "Nama Proyek Profesional",
  "kategori": "Kategori produk (misalnya: 'Point of Sales', 'Sistem Informasi UMKM', 'Otomasi Bisnis')",
  "tagline": "Satu kalimat tagline bisnis yang menarik dan persuasif",
  "problem": "Penjelasan detail paragraf berisi problem nyata (2-3 kalimat) yang diselesaikan oleh aplikasi ini untuk UMKM atau bisnis lokal.",
  "before_after": "Paragraf berisi perbandingan before/after penerapan solusi.",
  "fitur": ["Fitur utama 1", "Fitur utama 2", "Fitur utama 3", "Fitur utama 4", "Fitur utama 5"],
  "impact_numbers": [
    { "label": "Label dampak", "value": "Nilai dampak, misal 100% atau -80%" },
    { "label": "Label dampak 2", "value": "Nilai dampak 2" },
    { "label": "Label dampak 3", "value": "Nilai dampak 3" }
  ],
  "demo_html": "KODE HTML STANDALONE INTERAKTIF UNTUK SIMULATOR YANG SANGAT INDAH"
}
    `;

    const prompt = `Analisis repositori berikut dan hasilkan JSON portofolio:
${contextualInput}

Ingat, demo_html harus benar-benar interaktif menggunakan javascript murni, tombol-tombolnya berfungsi mengubah total harga/keranjang, dan dibalut desain visual Tailwind CSS yang sangat bagus dan responsif demi memukau calon investor atau mitra UMKM. Kembalikan data dalam format JSON murni.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["nama", "kategori", "tagline", "problem", "before_after", "fitur", "impact_numbers", "demo_html"],
          properties: {
            nama: { type: Type.STRING },
            kategori: { type: Type.STRING },
            tagline: { type: Type.STRING },
            problem: { type: Type.STRING },
            before_after: { type: Type.STRING },
            fitur: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            impact_numbers: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["label", "value"],
                properties: {
                  label: { type: Type.STRING },
                  value: { type: Type.STRING }
                }
              }
            },
            demo_html: { type: Type.STRING }
          }
        }
      }
    });

    const outputText = response.text?.trim() || "{}";
    const resultObj = JSON.parse(outputText);
    resultObj.github_url = repoUrl;
    
    res.json(resultObj);
  } catch (error: any) {
    console.error("Gagal melakukan analisis Gemini:", error);
    res.status(500).json({ error: `Analisis AI Gagal: ${error.message || error}` });
  }
});

// Setup Vite & static server bundle integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server portofolio aktif di http://localhost:${PORT}`);
  });
}

startServer();
