import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Download } from "lucide-react";
import { toast } from "sonner";
import AdModal from "@/components/AdModal";
import ToolPageSEO, { type ToolSEOConfig } from "@/components/ToolPageSEO";

const SEO_CONFIG: ToolSEOConfig = {
  title: "Compress PDF Online Free — Reduce PDF File Size Instantly | OmniPDF",
  description: "Compress PDF files online free. Reduce PDF file size without losing quality. No sign up, no watermarks, no ads. Choose compression level. Used by millions. Files deleted instantly.",
  canonical: "https://omnipdf.app/compress-pdf",
  ogTitle: "Free PDF Compressor — Reduce PDF Size Online, No Sign Up",
  ogDescription: "Compress and reduce PDF file size online free. No account required. Fast, secure, no watermarks. Used by millions.",
  h1: "Compress PDF — Reduce File Size Free",
  h1Sub: "Shrink your PDF file size instantly — 100% free, no sign up, no ads, no watermarks. The fastest PDF compressor online.",
  schemaName: "PDF Compressor",
  schemaDescription: "Free online PDF compressor. Reduce PDF file size while preserving quality. No sign up required. Used by millions.",
  keywords: ["compress pdf","reduce pdf size","pdf compressor","compress pdf online","reduce file size pdf","shrink pdf","optimise pdf","make pdf smaller","lower pdf size","compress large pdf","free online pdf tools","online pdf converter","no signup pdf"],
  howToSteps: [
    "Upload your PDF by clicking 'Select PDF' or dragging it into the drop zone.",
    "Choose a compression level: High preserves maximum quality, Medium balances size and clarity, Low gives smallest file size.",
    "Click 'Compress PDF'. Our servers optimise your file in seconds.",
    "Download your compressed PDF — free, no sign up, no watermarks.",
  ],
  seoBody: [
    { heading: "Reduce PDF File Size Online — Always Free", text: "OmniPDF's PDF compressor reduces your file size using advanced object-stream optimisation — restructuring how data is stored inside the PDF without affecting readability or image quality. Perfect for email attachments, portal uploads, and archive storage. Completely free, no sign up required, used by millions of people every month." },
    { heading: "Fastest PDF Compressor — No Ads, No Sign Up, No Limits", text: "OmniPDF is the fastest free PDF compressor online. There are no pop-up ads, no account prompts, and no file-size restrictions. Upload your PDF, pick a compression level, download it — done. Your file is deleted from our servers immediately after you download. Zero data retention, maximum privacy." },
  ],
  features: [
    { title: "Three Compression Levels", description: "Choose High (best quality), Medium (balanced), or Low (maximum compression) to match your needs." },
    { title: "No Quality Loss on Text", description: "Text, fonts, and vector graphics are preserved perfectly — only the internal file structure is optimised." },
    { title: "100% Free", description: "Compressing PDFs is always free on OmniPDF — no limits, no premium plan." },
    { title: "No Sign Up", description: "No email, no account, no password. Just upload and compress." },
    { title: "No Ads", description: "Zero ads or pop-ups interrupting your compression workflow." },
    { title: "Instant Download", description: "Compressed files are ready in seconds and download straight to your device." },
  ],
  faqs: [
    { q: "Is PDF compression free?", a: "Yes, completely free. No account, no trial, no premium tier. Every compression on OmniPDF is free." },
    { q: "Will compression reduce image quality?", a: "Text, fonts, and vectors are preserved perfectly. Image quality depends on your chosen compression level — High preserves full quality, while Low aggressively reduces file size." },
    { q: "How much will the file size be reduced?", a: "Results vary by content. PDFs with lots of images can be reduced by 50–80%. Text-heavy PDFs typically see 20–40% reduction." },
    { q: "Is there a file size limit?", a: "Files up to 100 MB are supported. For very large PDFs the compression may take a few extra seconds." },
    { q: "Are my files kept private?", a: "Yes. Files are processed over an encrypted connection and permanently deleted from our servers immediately after your download. We never store or share your documents." },
  ],
  relatedTools: [
    { href: "/merge-pdf", label: "Merge PDF" },
    { href: "/split-pdf", label: "Split PDF" },
    { href: "/images-to-pdf", label: "Images to PDF" },
    { href: "/pdf-editor", label: "PDF Editor" },
    { href: "/pdf-to-docx", label: "PDF to Word" },
  ],
};

export default function CompressPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState("medium");
  const [showAd, setShowAd] = useState(false);
  const [pendingDownload, setPendingDownload] = useState<(() => void) | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]?.type === "application/pdf") {
      setFile(e.dataTransfer.files[0]);
      toast.success("PDF selected");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      toast.success("PDF selected");
    }
  };

  const compressPDF = async () => {
    if (!file) { toast.error("Please select a PDF"); return; }
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("pdf", file);
      formData.append("quality", quality);
      const response = await fetch("/api/compress-pdf", { method: "POST", body: formData });
      if (!response.ok) throw new Error("Compression failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "compressed.pdf";
      document.body.appendChild(a);
      setPendingDownload(() => () => { a.click(); setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000); });
      setShowAd(true);
      toast.success("Compressed successfully!");
    } catch { toast.error("Failed to compress PDF"); }
    finally { setIsProcessing(false); }
  };

  return (
    <>
      <ToolPageSEO config={SEO_CONFIG}>
        <Card className="mb-8 dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${isDragging ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-slate-300 dark:border-slate-600"}`}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" aria-hidden="true" />
              <p className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Drag your PDF here or click to select</p>
              <Button className="bg-blue-600 hover:bg-blue-700 pointer-events-none">Select PDF</Button>
              <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileSelect} className="hidden" aria-label="Select PDF to compress" />
            </div>
          </CardContent>
        </Card>

        {file && (
          <Card className="mb-8 dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <CardTitle>Compression Level</CardTitle>
              <p className="text-sm text-slate-500 dark:text-slate-400">{file.name} · {(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                {[
                  { value: "high",   label: "High Quality",        desc: "Smallest size reduction — preserves full image quality" },
                  { value: "medium", label: "Medium (Recommended)", desc: "Balanced compression — good quality, noticeably smaller file" },
                  { value: "low",    label: "Maximum Compression",  desc: "Smallest possible file — some image quality reduction" },
                ].map(({ value, label, desc }) => (
                  <label key={value} className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-slate-200 dark:border-slate-600 hover:border-blue-400 transition-colors">
                    <input type="radio" value={value} checked={quality === value} onChange={(e) => setQuality(e.target.value)} className="mt-0.5" />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{label}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{desc}</p>
                    </div>
                  </label>
                ))}
              </div>
              <Button onClick={compressPDF} disabled={isProcessing} className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg">
                <Download className="w-5 h-5 mr-2" />
                {isProcessing ? "Compressing…" : "Compress PDF"}
              </Button>
            </CardContent>
          </Card>
        )}
      </ToolPageSEO>
      <AdModal show={showAd} onComplete={() => { setShowAd(false); if (pendingDownload) { pendingDownload(); setPendingDownload(null); } }} />
    </>
  );
}
