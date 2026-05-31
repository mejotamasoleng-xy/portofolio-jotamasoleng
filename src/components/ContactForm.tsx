import { useState, FormEvent } from "react";
import { Send, PhoneCall, Mail, CheckCircle2, MessageSquare, Coffee } from "lucide-react";
import { motion } from "motion/react";

interface ContactFormProps {
  waLink?: string;
  lang?: "ID" | "EN";
}

export default function ContactForm({ waLink = "https://wa.me/6282245210000", lang = "ID" }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bizType: "umkm", // umkm | investor | custom
    message: ""
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const contentText = {
    ID: {
      tag: "MEMULAI KOLABORASI",
      title: "Siap Membangun Solusi AI untuk Bisnis Anda?",
      desc: "Apakah Anda pemilik UMKM yang ingin mengotomatisasikan kasir, pelacakan stok kopi, atau investor yang mencari kapabilitas builder AI handal? Saya siap mendiskusikan kebutuhan sistem Anda.",
      labelName: "Nama Lengkap",
      labelEmail: "Email Profesional",
      labelWho: "Siapakah Anda?",
      whoUMKM: "Pemilik UMKM",
      whoInvestor: "Investor / VC",
      whoClient: "Mitra Lain",
      labelHelp: "Bagaimana saya bisa membantu bisnis Anda?",
      btnSubmit: "Kirim Pesan",
      btnSubmitting: "Mengirim formulir...",
      success: "Pesan Sukses Terkirim! Terima kasih telah menghubungi.",
      placeholderName: "Rian Hidayat",
      placeholderEmail: "rian@kopi-nusantara.com",
      placeholderMsg: "Jelaskan kebutuhan fungsional aplikasi Anda, tantangan bisnis, atau bentuk kerja sama investasi..."
    },
    EN: {
      tag: "LET'S COLLABORATE",
      title: "Ready to Build Your Custom AI Systems?",
      desc: "An MSME owner wishing to automate point-of-sales / inventory tracking or an investor scanning for elite AI builders? Let's connect and shape customized solutions.",
      labelName: "Full Name",
      labelEmail: "Professional Email",
      labelWho: "Select Your Profile",
      whoUMKM: "MSME Owner",
      whoInvestor: "Investor / VC",
      whoClient: "Other Partner",
      labelHelp: "How can I help your business grow?",
      btnSubmit: "Submit message",
      btnSubmitting: "Submitting...",
      success: "Message Sent Successfully! Looking forward to chatting.",
      placeholderName: "Rian Hidayat",
      placeholderEmail: "rian@kopi-nusantara.com",
      placeholderMsg: "Describe your app requirements, business challenges, or investment goals..."
    }
  };

  const t = contentText[lang];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.message) return;

    setSending(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: formData.name,
          email: formData.email,
          bizType: formData.bizType,
          message: formData.message
        })
      });
      if (res.ok) {
        setSent(true);
        setFormData({ name: "", email: "", bizType: "umkm", message: "" });
        setTimeout(() => setSent(false), 6000);
      } else {
        setErrorMsg("Gagal mengirim pesan, silakan coba lagi.");
      }
    } catch (err) {
      setErrorMsg("Koneksi gagal. Silakan periksa jaringan internet Anda.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-[#FAF8F5] dark:bg-[#1f1b17] rounded-none border border-editorial-line p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch select-text transition-colors">
      {/* Visual info left col */}
      <div className="md:col-span-5 bg-[#1A1A1A] border border-[#1A1A1A] text-[#F7F3EF] dark:bg-[#151210] dark:border-neutral-800 rounded-none p-6 md:p-8 flex flex-col justify-between select-text">
        <div>
          <span className="text-[10px] font-bold text-editorial-accent uppercase tracking-widest block mb-2 font-mono-tag">
            {t.tag}
          </span>
          <h3 className="text-2xl font-serif-display font-medium text-[#F7F3EF] tracking-tight leading-tight mb-4">
            {t.title}
          </h3>
          <p className="text-xs text-[#F7F3EF]/80 leading-relaxed font-sans mb-6">
            {t.desc}
          </p>
        </div>

        <div className="space-y-4">
          <a
            href={waLink}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 p-3 rounded-none bg-white/[0.06] hover:bg-white/[0.12] text-xs text-[#F7F3EF] transition-all font-mono-tag uppercase tracking-wider font-semibold pointer-events-auto border border-white/[0.05]"
          >
            <PhoneCall className="w-4 h-4 text-editorial-accent" />
            <span>WhatsApp (Direct Contact)</span>
          </a>

          <a
            href="mailto:me.jotamasoleng@gmail.com"
            className="flex items-center gap-3 p-3 rounded-none bg-white/[0.06] hover:bg-white/[0.12] text-xs text-[#F7F3EF] transition-all font-mono-tag lowercase pointer-events-auto border border-white/[0.05]"
          >
            <Mail className="w-4 h-4 text-editorial-accent" />
            <span className="break-all">me.jotamasoleng@gmail.com</span>
          </a>
        </div>
      </div>

      {/* Form right col */}
      <form onSubmit={handleSubmit} className="md:col-span-7 flex flex-col justify-between space-y-4 select-text">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nama */}
            <div>
              <label className="text-[10px] font-bold text-editorial-muted dark:text-neutral-400 uppercase tracking-widest block mb-1.5 font-mono-tag animate-fade-in">
                {t.labelName}
              </label>
              <input
                type="text"
                required
                placeholder={t.placeholderName}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-white dark:bg-[#2a2520] border border-editorial-line rounded-none px-4 py-2.5 text-xs text-editorial-text dark:text-neutral-200 outline-none focus:border-editorial-text focus:bg-white transition-all font-sans"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-[10px] font-bold text-editorial-muted dark:text-neutral-400 uppercase tracking-widest block mb-1.5 font-mono-tag">
                {t.labelEmail}
              </label>
              <input
                type="email"
                placeholder={t.placeholderEmail}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-white dark:bg-[#2a2520] border border-editorial-line rounded-none px-4 py-2.5 text-xs text-editorial-text dark:text-neutral-200 outline-none focus:border-editorial-text focus:bg-white transition-all font-sans"
              />
            </div>
          </div>

          {/* Keperluan / Profil */}
          <div>
            <label className="text-[10px] font-bold text-editorial-muted dark:text-neutral-400 uppercase tracking-widest block mb-1.5 font-mono-tag animate-fade-in">
              {t.labelWho}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "umkm", label: t.whoUMKM, icon: <Coffee className="w-3.5 h-3.5 animate-bounce" /> },
                { id: "investor", label: t.whoInvestor, icon: <MessageSquare className="w-3.5 h-3.5" /> },
                { id: "klien", label: t.whoClient, icon: <Send className="w-3.5 h-3.5" /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, bizType: tab.id })}
                  className={`py-2 px-1 text-[10px] font-mono-tag tracking-wider uppercase font-bold rounded-none border flex items-center justify-center gap-1.5 pointer-events-auto cursor-pointer transition-all ${
                    formData.bizType === tab.id
                      ? "bg-editorial-text border-editorial-text text-editorial-bg shadow-sm"
                      : "bg-white dark:bg-[#2a2520] border-editorial-line text-editorial-muted dark:text-neutral-300 hover:text-editorial-text hover:bg-black/5"
                  }`}
                >
                  {tab.icon}
                  <span className="truncate">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Pesan */}
          <div>
            <label className="text-[10px] font-bold text-editorial-muted dark:text-neutral-400 uppercase tracking-widest block mb-1.5 font-mono-tag">
              {t.labelHelp}
            </label>
            <textarea
              required
              rows={4}
              placeholder={t.placeholderMsg}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full bg-white dark:bg-[#2a2520] border border-editorial-line rounded-none px-4 py-3 text-xs text-editorial-text dark:text-neutral-200 outline-none focus:border-editorial-text focus:bg-white transition-all leading-relaxed resize-none font-sans"
            />
          </div>
        </div>

        {/* Action Button */}
        <div>
          {errorMsg && (
            <p className="text-red-500 text-xs font-mono mb-2 font-bold">{errorMsg}</p>
          )}

          {sent ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full py-3.5 bg-editorial-accent/15 text-editorial-accent border border-editorial-accent/30 font-bold rounded-none text-xs flex justify-center items-center gap-2 font-mono-tag uppercase tracking-wider"
            >
              <CheckCircle2 className="w-4 h-4 text-editorial-accent shrink-0" />
              {t.success}
            </motion.div>
          ) : (
            <button
              type="submit"
              disabled={sending}
              className="w-full py-3 bg-[#1A1A1A] dark:bg-neutral-200 border border-[#1A1A1A] dark:border-neutral-200 hover:bg-opacity-90 dark:text-neutral-900 text-[#F7F3EF] font-bold rounded-none text-xs transition-all tracking-widest font-mono-tag uppercase flex justify-center items-center gap-1.5 shadow-sm pointer-events-auto cursor-pointer"
            >
              {sending ? (
                <span>{t.btnSubmitting}</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  {t.btnSubmit}
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
