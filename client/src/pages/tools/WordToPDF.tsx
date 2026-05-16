import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Download } from "lucide-react";
import { toast } from "sonner";
import AdModal from "@/components/AdModal";
import ToolPageSEO, { type ToolSEOConfig } from "@/components/ToolPageSEO";

const SEO_CONFIG: ToolSEOConfig = {
  title: "Word to PDF Converter Free — Convert DOCX to PDF Online | OmniPDF",
  description: "Convert Word documents (DOC, DOCX) to PDF online free. No sign up, no ads, no watermarks. Formatting preserved. Instant PDF download. Trusted by millions.",
  canonical: "https://omnipdf.xyz/word-to-pdf",
  ogTitle: "Free Word to PDF Converter — DOCX to PDF Online, No Sign Up",
  ogDescription: "Convert Word documents to PDF online free. Formatting preserved. No account required. Instant download. Used by millions.",
  h1: "Word to PDF — Convert DOCX to PDF Free",
  h1Sub: "Convert Word documents to PDF instantly — 100% free, no sign up, no ads. Formatting preserved. The fastest Word to PDF tool online.",
  schemaName: "Word to PDF Converter",
  schemaDescription: "Free online Word to PDF converter. Convert DOC and DOCX files to PDF with formatting preserved. No sign up required. Used by millions.",
  keywords: ["word to pdf","convert word to pdf","docx to pdf","doc to pdf","free word to pdf converter","microsoft word to pdf","convert document to pdf","office to pdf","export word as pdf","online docx converter","free online pdf tools","no signup pdf converter"],
  howToSteps: [
    "Click 'Select Word File' or drag your .doc or .docx file into the upload zone.",
    "Click 'Convert to PDF'. OmniPDF converts your document with formatting preserved.",
    "Download your PDF — free, no sign up, no watermarks. Ready to share or print.",
  ],
  seoBody: [
    { heading: "Convert Word to PDF Online — Always Free", text: "OmniPDF's Word to PDF converter handles both .doc and .docx files, preserving your fonts, layout, images, and formatting in the output PDF. Perfect for sharing documents you don't want edited, submitting applications, or archiving reports. Completely free, no software to install, no account required, used by millions every month." },
    { heading: "Fastest Word to PDF Tool — No Ads, No Sign Up", text: "Millions of people use OmniPDF because it is the fastest free Word to PDF converter online. No ads interrupt the process, no sign-up page blocks access. Your document is converted in seconds and permanently deleted from our servers after download." },
  ],
  features: [
    { title: "DOC and DOCX Support", description: "Both legacy .doc and modern .docx formats are fully supported." },
    { title: "Formatting Preserved", description: "Fonts, images, tables, and layout from your Word document are carried into the PDF." },
    { title: "100% Free", description: "Word to PDF conversion is always free — no limits, no premium plan." },
    { title: "No Sign Up", description: "No email or account needed. Convert immediately." },
    { title: "No Ads", description: "No pop-ups or banners interrupting your conversion." },
    { title: "Instant Download", description: "PDFs are ready in seconds and download straight to your device." },
  ],
  faqs: [
    { q: "Is Word to PDF conversion free?", a: "Yes — 100% free. No account, no watermarks, no limits on OmniPDF." },
    { q: "Will my formatting be preserved?", a: "Yes. Fonts, images, tables, headers, footers, and page layout are preserved in the output PDF." },
    { q: "Can I convert a .doc file (not just .docx)?", a: "Yes. Both legacy .doc and modern .docx formats are supported." },
    { q: "Is there a file size limit?", a: "Files up to 50 MB are supported. Most Word documents are well within this limit." },
    { q: "Are my files kept private?", a: "Yes. Files are transferred securely and permanently deleted from our servers immediately after your download." },
  ],
  relatedTools: [
    { href: "/pdf-to-docx", label: "PDF to Word" },
    { href: "/ppt-to-pdf", label: "PPT to PDF" },
    { href: "/merge-pdf", label: "Merge PDF" },
    { href: "/compress-pdf", label: "Compress PDF" },
    { href: "/images-to-pdf", label: "Images to PDF" },
  ],
};

export default function WordToPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAd, setShowAd] = useState(false);
  const [pendingDownload, setPendingDownload] = useState<(() => void) | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ACCEPT = ".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && (f.name.endsWith(".doc") || f.name.endsWith(".docx"))) { setFile(f); toast.success("File selected"); }
    else toast.error("Please drop a Word document (.doc or .docx)");
  };

  const convert = async () => {
    if (!file) { toast.error("Please select a Word file"); return; }
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/word-to-pdf", { method: "POST", body: formData });
      if (!response.ok) throw new Error("Conversion failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = file.name.replace(/\.docx?$/i, ".pdf"); document.body.appendChild(a);
      setPendingDownload(() => () => { a.click(); setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000); });
      setShowAd(true);
      toast.success("Converted to PDF!");
    } catch { toast.error("Failed to convert Word to PDF"); }
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
              <p className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Drag your Word document here or click to select</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Supports .doc and .docx files</p>
              {file ? (
                <p className="text-blue-600 dark:text-blue-400 font-medium">{file.name} · {(file.size / 1024).toFixed(0)} KB</p>
              ) : (
                <Button className="bg-blue-600 hover:bg-blue-700 pointer-events-none">Select Word File</Button>
              )}
              <input ref={fileInputRef} type="file" accept={ACCEPT} onChange={(e) => { if (e.target.files?.[0]) { setFile(e.target.files[0]); toast.success("File selected"); } }} className="hidden" aria-label="Select Word document to convert to PDF" />
            </div>
          </CardContent>
        </Card>

        {file && (
          <Button onClick={convert} disabled={isProcessing} className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg mb-8">
            <Download className="w-5 h-5 mr-2" />
            {isProcessing ? "Converting…" : "Convert to PDF"}
          </Button>
        )}
      </ToolPageSEO>
      <AdModal show={showAd} onComplete={() => { setShowAd(false); if (pendingDownload) { pendingDownload(); setPendingDownload(null); } }} />
    </>
  );
}
