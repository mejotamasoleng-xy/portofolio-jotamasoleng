export interface Project {
  id: string;
  nama: string;
  kategori: string;
  tagline: string;
  problem: string;
  before_after: string; // Story/Before-After
  fitur: string[];
  impact_numbers: { label: string; value: string }[]; // Project-specific impact numbers
  github_url: string;
  demo_html: string;
  status: "published" | "draft";
  tanggal_dibuat: string;
  tanggal_update: string;
}

export interface Testimonial {
  id: string;
  nama: string;
  jabatan: string;
  perusahaan: string;
  avatar_url?: string;
  rating: number;
  konten: string;
  tanggal: string;
}

export interface GlobalSettings {
  nama: string;
  tagline: string;
  bio: string;
  wa_link: string;
  global_impacts: { label: string; value: string; desc: string }[];
  system_prompt_ai: string;
}

export interface ContactSubmission {
  id: string;
  nama: string;
  email: string;
  bizType: string;
  message: string;
  tanggal: string;
}

export type ActiveTab = "portfolio" | "admin";
