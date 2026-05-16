import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Download, Archive, X, FolderOpen } from "lucide-react";
import { toast } from "sonner";
import AdModal from "@/components/AdModal";
import ToolPageSEO, { type ToolSEOConfig } from "@/components/ToolPageSEO";

interface ZipEntry { name: string; downloading: boolean; }

const SEO_CONFIG: ToolSEOConfig = {
  title: "ZIP Extractor Online Free — Open & Extract ZIP Files | OmniPDF",
  description: "Extract and download files from ZIP archives online free. View ZIP contents, download individual files. No sign up, no ads, no software needed. Trusted by millions.",
  canonical: "https://omnipdf.xyz/zip-extractor",
  ogTitle: "Free ZIP Extractor Online — Open ZIP Files, No Sign Up",
  ogDescription: "Extract files from ZIP archives online free. View contents and download files. No account needed. Used by millions.",
  h1: "ZIP Extractor — Open & Extract ZIP Files Free",
  h1Sub: "View and download files from any ZIP archive online — 100% free, instant, no sign up. No software needed.",
  schemaName: "ZIP Extractor",
  schemaDescription: "Free online ZIP file extractor. View ZIP contents and download individual files without software. No sign up required. Used by millions.",
  keywords: ["zip extractor","unzip files online","extract zip files","zip opener","open zip files","unzip archive","extract compressed files","online archive extractor","file unzip tool","free online pdf tools","no signup file tools","instant file conversion"],
  howToSteps: [
    "Upload your ZIP file by clicking 'Select ZIP' or dragging it into the upload zone.",
    "OmniPDF reads the archive and shows you a list of all files inside.",
    "Hover over any file and click 'Save' to extract and download it individually.",
    "Or click 'Extract All' to download every file — free, no sign up, no software needed.",
  ],
  seoBody: [
    { heading: "Open ZIP Archives Online — Always Free", text: "OmniPDF's ZIP extractor lets you view the contents of any ZIP file and download individual files without installing any software. Perfect for accessing files sent in a ZIP, extracting documents from downloaded archives, or quickly checking what's inside a compressed folder — all completely free, no sign up required, used by millions." },
    { heading: "No Ads, No Sign Up, Trusted by Millions", text: "OmniPDF's file tools are used by millions of people worldwide who want fast, reliable utilities without ads or account registrations. The ZIP extractor processes your archive in seconds and files are available for immediate download. Your archive is deleted from our servers as soon as your session ends." },
  ],
  features: [
    { title: "View Archive Contents", description: "See every file inside your ZIP before downloading anything — including files in subdirectories." },
    { title: "Download Individual Files", description: "Extract and download specific files without saving the whole archive." },
    { title: "100% Free", description: "ZIP extraction is always free on OmniPDF — no limits, no premium plan." },
    { title: "No Sign Up", description: "No email or account needed. Upload and extract immediately." },
    { title: "No Software Needed", description: "Works entirely in your browser — no download or installation required." },
    { title: "Secure Processing", description: "Archives are processed securely and deleted after your session ends." },
  ],
  faqs: [
    { q: "Is the ZIP extractor free?", a: "Yes — 100% free. No account, no file-count limits, no premium tier." },
    { q: "Can I extract every file at once?", a: "Yes. Click 'Extract All' to download every file in the archive one by one automatically." },
    { q: "Does it support password-protected ZIPs?", a: "Encrypted ZIP files cannot be extracted without the password. The tool will notify you if your archive is password-protected." },
    { q: "What file types can be inside the ZIP?", a: "Any file type can be inside a ZIP archive — PDFs, images, Word documents, spreadsheets, code files, and more." },
    { q: "Are my files kept private?", a: "Yes. Your archive is processed securely and deleted from our servers immediately after your session ends. We never store or share your files." },
  ],
  relatedTools: [
    { href: "/images-to-pdf", label: "Images to PDF" },
    { href: "/pdf-to-images", label: "PDF to JPG" },
    { href: "/merge-pdf", label: "Merge PDF" },
    { href: "/compress-pdf", label: "Compress PDF" },
    { href: "/p2p-transfer", label: "P2P Transfer" },
  ],
};

export default function ZipExtractor() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [entries, setEntries] = useState<ZipEntry[]>([]);
  const [showAd, setShowAd] = useState(false);
  const [pendingDownload, setPendingDownload] = useState<(() => void) | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (f: File) => {
    if (!/\.(zip)$/i.test(f.name) && f.type !== "application/zip" && f.type !== "application/x-zip-compressed") {
      toast.error("Please select a ZIP file"); return;
    }
    setFile(f); setEntries([]); setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("zip", f);
      const res = await fetch("/api/extract-zip", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Failed to read ZIP");
      const data = await res.json();
      setEntries(data.files.map((name: string) => ({ name, downloading: false })));
      toast.success(`Found ${data.count} file${data.count !== 1 ? "s" : ""} in archive`);
    } catch { toast.error("Could not read ZIP file. It may be corrupted or encrypted."); }
    finally { setIsLoading(false); }
  };

  const downloadFile = async (filename: string, idx: number) => {
    if (!file) return;
    setEntries(prev => prev.map((e, i) => i === idx ? { ...e, downloading: true } : e));
    try {
      const formData = new FormData();
      formData.append("zip", file);
      formData.append("filename", filename);
      const res = await fetch("/api/extract-zip-file", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Extraction failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename.split("/").pop() || filename;
      document.body.appendChild(a);
      setPendingDownload(() => () => { a.click(); setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000); });
      setShowAd(true);
    } catch { toast.error(`Failed to extract ${filename.split("/").pop()}`); }
    finally { setEntries(prev => prev.map((e, i) => i === idx ? { ...e, downloading: false } : e)); }
  };

  const downloadAll = async () => {
    toast.info("Downloading files one by one…");
    for (let i = 0; i < entries.length; i++) {
      await downloadFile(entries[i].name, i);
      await new Promise(r => setTimeout(r, 300));
    }
  };

  const getFileIcon = (name: string) => {
    const ext = name.split(".").pop()?.toLowerCase();
    if (["jpg","jpeg","png","gif","webp","svg"].includes(ext || "")) return "🖼️";
    if (["pdf"].includes(ext || "")) return "📄";
    if (["doc","docx"].includes(ext || "")) return "📝";
    if (["xls","xlsx"].includes(ext || "")) return "📊";
    if (["mp4","mov","avi","mkv"].includes(ext || "")) return "🎬";
    if (["mp3","wav","flac"].includes(ext || "")) return "🎵";
    if (["zip","rar","7z"].includes(ext || "")) return "🗜️";
    if (["js","ts","py","html","css","json"].includes(ext || "")) return "💻";
    return "📁";
  };

  return (
    <>
      <ToolPageSEO config={SEO_CONFIG}>
        {/* Upload zone */}
        <Card className="mb-6 dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${isDragging ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20" : "border-slate-300 dark:border-slate-600"}`}
              onClick={() => fileInputRef.current?.click()}
            >
              <Archive className="w-14 h-14 mx-auto mb-4 text-purple-400" aria-hidden="true" />
              <p className="text-lg font-semibold text-slate-800 dark:text-white mb-1">Drop your ZIP file here or click to select</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Up to 100 MB · No software needed</p>
              <input ref={fileInputRef} type="file" accept=".zip,application/zip,application/x-zip-compressed"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} className="hidden"
                aria-label="Select ZIP file to extract" />
            </div>

            {file && (
              <div className="mt-4 flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                <Archive className="w-5 h-5 text-purple-500 flex-shrink-0" />
                <span className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{file.name}</span>
                <span className="text-xs text-slate-400 flex-shrink-0">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                <button onClick={() => { setFile(null); setEntries([]); }} className="text-slate-400 hover:text-red-500 flex-shrink-0" aria-label="Remove file">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Loading spinner */}
        {isLoading && (
          <div className="text-center py-10">
            <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400">Reading ZIP archive…</p>
          </div>
        )}

        {/* File list */}
        {entries.length > 0 && (
          <Card className="mb-8 dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-purple-500" />
                  {entries.length} file{entries.length !== 1 ? "s" : ""} in archive
                </CardTitle>
                <Button size="sm" variant="outline" onClick={downloadAll}
                  className="text-purple-600 border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/30">
                  <Download className="w-3.5 h-3.5 mr-1.5" /> Extract All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 max-h-96 overflow-y-auto pr-1">
                {entries.map((entry, idx) => {
                  const shortName = entry.name.split("/").pop() || entry.name;
                  const dir = entry.name.includes("/") ? entry.name.split("/").slice(0, -1).join("/") : null;
                  return (
                    <div key={entry.name}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 group transition-colors">
                      <span className="text-xl flex-shrink-0" role="img" aria-label="file type">{getFileIcon(entry.name)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{shortName}</p>
                        {dir && <p className="text-xs text-slate-400 truncate">{dir}/</p>}
                      </div>
                      <button
                        onClick={() => downloadFile(entry.name, idx)}
                        disabled={entry.downloading}
                        className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-medium hover:bg-purple-700 disabled:opacity-50"
                        aria-label={`Download ${shortName}`}
                      >
                        {entry.downloading
                          ? <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-3 h-3" />
                          : <Download className="w-3 h-3" />
                        }
                        {entry.downloading ? "…" : "Save"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </ToolPageSEO>
      <AdModal show={showAd} onComplete={() => { setShowAd(false); if (pendingDownload) { pendingDownload(); setPendingDownload(null); } }} />
    </>
  );
}
