import { motion } from "motion/react";
import { Coffee, ArrowUpRight, ShieldCheck, Cpu, Database, Server } from "lucide-react";
import { Project } from "../types";

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  key?: string;
}

export default function ProjectCard({ project, onClick }: ProjectCardProps) {
  // Ambil ikon sesuai kategori untuk mempercantik kartu
  const getCategoryIcon = (category: string) => {
    const c = category.toLowerCase();
    if (c.includes("pos") || c.includes("cashier") || c.includes("kasir") || c.includes("sales")) {
      return <Coffee className="w-4 h-4 text-amber-500" />;
    }
    if (c.includes("informasi") || c.includes("umkm") || c.includes("tenant") || c.includes("sistem")) {
      return <ShieldCheck className="w-4 h-4 text-emerald-500" />;
    }
    if (c.includes("ai") || c.includes("llm") || c.includes("gemini") || c.includes("artificial")) {
      return <Cpu className="w-4 h-4 text-indigo-500" />;
    }
    if (c.includes("database") || c.includes("storage")) {
      return <Database className="w-4 h-4 text-rose-500" />;
    }
    return <Server className="w-4 h-4 text-sky-500" />;
  };

  // Pilih warna tag kategori
  const getCategoryStyles = (category: string) => {
    return "bg-editorial-accent/10 text-editorial-accent border-editorial-accent/20";
  };

  return (
    <motion.div
      layoutId={`card-container-${project.id}`}
      onClick={onClick}
      id={`card-${project.id}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-[#FCFAF7] rounded-none border border-editorial-line p-6 shadow-sm hover:border-editorial-text/40 transition-all cursor-pointer flex flex-col justify-between h-full group"
    >
      <div>
        {/* Category & Action Icon */}
        <div className="flex justify-between items-center mb-3">
          <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-none text-[10px] font-mono-tag font-bold uppercase tracking-wider border ${getCategoryStyles(project.kategori)}`}>
            {getCategoryIcon(project.kategori)}
            {project.kategori}
          </span>
          <div className="w-8 h-8 rounded-none border border-editorial-line bg-white flex items-center justify-center group-hover:bg-editorial-text group-hover:text-editorial-bg transition-all">
            <ArrowUpRight className="w-4 h-4 text-editorial-muted group-hover:text-editorial-bg transition-colors" />
          </div>
        </div>

        {/* Project thin line separator */}
        <div className="h-[1px] bg-editorial-text opacity-10 my-3 group-hover:opacity-40 transition-opacity" />

        {/* Project Name & Tagline */}
        <h3 className="font-serif-display font-bold text-xl text-editorial-text tracking-tight mb-1.5 group-hover:italic group-hover:text-editorial-accent transition-all">
          {project.nama}
        </h3>
        
        <p className="text-xs text-editorial-muted font-medium mb-4 leading-relaxed italic">
          "{project.tagline}"
        </p>

        {/* Problem Statement Snippet */}
        <div className="bg-[#FAF8F5] rounded-none p-4 border border-editorial-line mb-4 select-text">
          <span className="text-[9px] font-bold text-editorial-accent uppercase tracking-widest block mb-1 font-mono-tag">
            PROBLEM SOLVED
          </span>
          <p className="text-xs text-editorial-muted line-clamp-3 leading-relaxed font-sans">
            {project.problem}
          </p>
        </div>
      </div>

      {/* Footer Details */}
      <div className="flex justify-between items-center pt-3 border-t border-editorial-line text-[10px] text-editorial-muted font-mono-tag uppercase tracking-wider">
        <span>Klik untuk meluncurkan</span>
        <span className="font-mono-tag bg-editorial-text text-editorial-bg px-2 py-0.5 rounded-none text-[9px] font-bold">
          Demo Live
        </span>
      </div>
    </motion.div>
  );
}
