import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Download } from "lucide-react";
import { toast } from "sonner";
import AdModal from "@/components/AdModal";
import ToolPageSEO, { type ToolSEOConfig } from "@/components/ToolPageSEO";

const SEO_CONFIG: ToolSEOConfig = {
  title: "PowerPoint to PDF Converter Free — Convert PPTX to PDF Online | OmniPDF",
  description: "Convert PowerPoint presentations (PPT, PPTX) to PDF online free. No sign up, no ads, no watermarks. Each slide becomes a PDF page. Instant download. Trusted by millions.",
  canonical: "https://omnipdf.xyz/ppt-to-pdf",
  ogTitle: "Free PowerPoint to PDF — PPTX to PDF Online, No Sign Up",
  ogDescription: "Convert PowerPoint to PDF online free. Every slide becomes a page. No account needed. Used by millions.",
  h1: "PowerPoint to PDF — Convert PPTX to PDF Free",
  h1Sub: "Turn your presentation into a PDF in seconds — 100% free, no sign up, no ads, no watermarks. Trusted by millions.",
  schemaName: "PowerPoint to PDF Converter",
  schemaDescription: "Free online PowerPoint to PDF converter. Convert PPT and PPTX presentations to PDF. No sign up required. Used by millions.",
  keywords: ["ppt to pdf","powerpoint to pdf","convert powerpoint to pdf","pptx to pdf","slides to pdf","presentation to pdf","export powerpoint as pdf","powerpoint converter","online ppt converter","office presentation to pdf","free online pdf tools","no signup pdf converter"],
  howToSteps: [
    "Click 'Select PowerPoint File' or drag your .ppt or .pptx file into the upload zone.",
    "Click 'Convert to PDF'. Each slide is rendered as a full-page PDF page.",
    "Download your PDF — free, no sign up, no watermarks. Ready to share or present.",
  ],
  seoBody: [
    { heading: "Convert PowerPoint to PDF Online — Always Free", text: "OmniPDF's PowerPoint to PDF converter works with both .ppt and .pptx files, rendering each slide as a high-quality PDF page. Perfect for sharing presentations without requiring PowerPoint, submitting slides for printing, or archiving decks. Completely free, no software installation, no account required, used by millions." },
    { heading: "No Ads, No Sign Up, Trusted by Millions", text: "OmniPDF is used by millions of students, professionals, and businesses worldwide who need fast, reliable file conversion without ads or account walls. Your presentation is converted in seconds and deleted from our servers immediately after your download." },
  ],
  features: [
    { title: "PPT and PPTX Support", description: "Both legacy .ppt and modern .pptx formats are fully supported." },
    { title: "Slides to PDF Pages", description: "Every slide becomes a full-page in the output PDF, maintaining your layout." },
    { title: "100% Free", description: "PowerPoint to PDF conversion is always free on OmniPDF." },
    { title: "No Sign Up", description: "No email or account needed. Start converting immediately." },
    { title: "No Ads", description: "No interruptions — convert cleanly without pop-ups." },
    { title: "Instant Download", description: "PDFs are ready in seconds and download directly to your device." },
  ],
  faqs: [
    { q: "Is PowerPoint to PDF conversion free?", a: "Yes — 100% free. No account, no watermarks, no limits." },
    { q: "Will slide formatting and images be preserved?", a: "Yes. Slide layouts, images, shapes, and text are preserved. Animations and transitions are not included since PDF is a static format." },
    { q: "Can I convert a .ppt file (not just .pptx)?", a: "Yes. Both legacy .ppt and modern .pptx formats are accepted." },
    { q: "Is there a slide limit?", a: "No slide limit. You can convert presentations of any length." },
    { q: "Are my files kept private?", a: "Yes. Files are processed securely and deleted from our servers immediately after your download." },
  ],
  relatedTools: [
    { href: "/word-to-pdf", label: "Word to PDF" },
    { href: "/images-to-pdf", label: "Images to PDF" },
    { href: "/merge-pdf", label: "Merge PDF" },
    { href: "/compress-pdf", label: "Compress PDF" },
    { href: "/pdf-to-images", label: "PDF to JPG" },
  ],
};

export default function PPTToPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAd, setShowAd] = useState(false);
  const [pendingDownload, setPendingDownload] = useState<(() => void) | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ACCEPT = ".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation";

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && (f.name.endsWith(".ppt") || f.name.endsWith(".pptx"))) { setFile(f); toast.success("File selected"); }
    else toast.error("Please drop a PowerPoint file (.ppt or .pptx)");
  };

  const convert = async () => {
    if (!file) { toast.error("Please select a PowerPoint file"); return; }
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/ppt-to-pdf", { method: "POST", body: formData });
      if (!response.ok) throw new Error("Conversion failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = file.name.replace(/\.pptx?$/i, ".pdf"); document.body.appendChild(a);
      setPendingDownload(() => () => { a.click(); setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000); });
      setShowAd(true);
      toast.success("Converted to PDF!");
    } catch { toast.error("Failed to convert PowerPoint to PDF"); }
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
              <p className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Drag your PowerPoint file here or click to select</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Supports .ppt and .pptx files</p>
              {file ? (
                <p className="text-blue-600 dark:text-blue-400 font-medium">{file.name} · {(file.size / 1024).toFixed(0)} KB</p>
              ) : (
                <Button className="bg-blue-600 hover:bg-blue-700 pointer-events-none">Select PowerPoint File</Button>
              )}
              <input ref={fileInputRef} type="file" accept={ACCEPT} onChange={(e) => { if (e.target.files?.[0]) { setFile(e.target.files[0]); toast.success("File selected"); } }} className="hidden" aria-label="Select PowerPoint file to convert to PDF" />
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
