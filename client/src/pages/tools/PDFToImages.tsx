import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Download } from "lucide-react";
import { toast } from "sonner";
import AdModal from "@/components/AdModal";
import ToolPageSEO, { type ToolSEOConfig } from "@/components/ToolPageSEO";

const SEO_CONFIG: ToolSEOConfig = {
  title: "PDF to JPG Converter Free — Convert PDF Pages to Images Online | OmniPDF",
  description: "Convert PDF pages to JPG or PNG images online free. No sign up, no ads, no watermarks. All pages exported as images in a ZIP download. Trusted by millions.",
  canonical: "https://omnipdf.xyz/pdf-to-images",
  ogTitle: "Free PDF to JPG Converter — Convert PDF to Images Online, No Sign Up",
  ogDescription: "Convert PDF to JPG or PNG online free. All pages as images in a ZIP. No account needed. Used by millions.",
  h1: "PDF to JPG — Convert PDF Pages to Images Free",
  h1Sub: "Extract every page from your PDF as a JPG or PNG image — 100% free, instant, no sign up. The fastest PDF to image converter online.",
  schemaName: "PDF to Images Converter",
  schemaDescription: "Free online tool to convert PDF pages to JPG or PNG images. All pages exported in a ZIP file. No sign up required. Used by millions.",
  keywords: ["pdf to jpg","pdf to png","convert pdf to images","pdf image converter","extract images from pdf","convert pdf pages to jpg","pdf to jpeg","save pdf as images","pdf to photo","pdf page to image","free online pdf tools","no signup pdf converter"],
  howToSteps: [
    "Upload your PDF by clicking 'Select PDF' or dropping it in the upload zone.",
    "Choose your preferred image format: JPG (smaller files) or PNG (lossless quality).",
    "Click 'Convert to Images'. Every page is rendered as a separate high-quality image.",
    "Download your ZIP archive containing all page images — free, no sign up, no watermarks.",
  ],
  seoBody: [
    { heading: "Convert PDF to JPG or PNG Online — Always Free", text: "OmniPDF's PDF to image converter exports every page of your PDF as a high-quality JPG or PNG, packaged into a convenient ZIP download. Use it to extract slides from a presentation PDF, pull images from a scanned document, or convert a PDF report into shareable image files — completely free, no sign up required, used by millions every month." },
    { heading: "No Ads, No Account, Trusted by Millions", text: "OmniPDF is used by millions of people worldwide who need fast, reliable PDF tools without ads or account registration. Your PDF is converted on our fast servers in seconds, and the result is deleted immediately after download. No data is ever retained or shared." },
  ],
  features: [
    { title: "JPG and PNG Output", description: "Choose JPG for smaller files or PNG for lossless quality — both fully supported." },
    { title: "All Pages Exported", description: "Every page in your PDF becomes a separate image file, bundled in a ZIP for easy download." },
    { title: "100% Free", description: "Convert as many PDFs as you need — always free, no premium tier." },
    { title: "No Sign Up", description: "No account or email required. Open and use instantly." },
    { title: "No Ads", description: "Zero interruptions — no pop-ups or banners while converting." },
    { title: "High Quality Output", description: "Pages are rendered at high resolution, preserving all text and graphics sharply." },
  ],
  faqs: [
    { q: "Is PDF to JPG conversion free?", a: "Yes — completely free. No account, no watermarks, no limits. Every conversion on OmniPDF is free." },
    { q: "How do I get my converted images?", a: "All pages are packaged into a single ZIP file that downloads automatically. Extract the ZIP to access individual page images." },
    { q: "What image resolution will the output be?", a: "Pages are rendered at 150 DPI by default, giving clear, sharp images suitable for most uses — a good balance between quality and file size." },
    { q: "Can I convert just one page?", a: "Use our Split PDF tool first to extract that page as a single-page PDF, then convert it to an image here." },
    { q: "Are my files kept private?", a: "Yes. Your PDF is processed securely and deleted from our servers immediately after your download." },
  ],
  relatedTools: [
    { href: "/images-to-pdf", label: "Images to PDF" },
    { href: "/merge-pdf", label: "Merge PDF" },
    { href: "/compress-pdf", label: "Compress PDF" },
    { href: "/split-pdf", label: "Split PDF" },
    { href: "/pdf-to-text", label: "PDF to Text" },
  ],
};

export default function PDFToImages() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<"jpg" | "png">("jpg");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAd, setShowAd] = useState(false);
  const [pendingDownload, setPendingDownload] = useState<(() => void) | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type === "application/pdf") setFile(dropped);
    else toast.error("Please drop a PDF file");
  };

  const convertToImages = async () => {
    if (!file) { toast.error("Please select a PDF"); return; }
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("pdf", file); formData.append("format", format);
      const response = await fetch("/api/pdf-to-images", { method: "POST", body: formData });
      if (!response.ok) throw new Error("Conversion failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "pdf-pages.zip"; document.body.appendChild(a);
      setPendingDownload(() => () => { a.click(); setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000); });
      setShowAd(true);
      toast.success("PDF converted to images!");
    } catch { toast.error("Failed to convert PDF to images"); }
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
              <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <p className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Drag your PDF here or click to select</p>
              {file ? <p className="text-blue-600 dark:text-blue-400 font-medium">{file.name}</p> : <Button className="bg-blue-600 hover:bg-blue-700 pointer-events-none">Select PDF</Button>}
              <input ref={fileInputRef} type="file" accept=".pdf" onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f); }} className="hidden" />
            </div>
          </CardContent>
        </Card>

        {file && (
          <Card className="mb-8 dark:bg-slate-800 dark:border-slate-700">
            <CardHeader><CardTitle>Output Format</CardTitle></CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                {(["jpg", "png"] as const).map((fmt) => (
                  <label key={fmt} className={`flex-1 flex items-center gap-3 cursor-pointer p-4 rounded-lg border-2 transition-colors ${format === fmt ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-slate-200 dark:border-slate-600"}`}>
                    <input type="radio" value={fmt} checked={format === fmt} onChange={() => setFormat(fmt)} />
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white uppercase">{fmt}</p>
                      <p className="text-xs text-slate-500">{fmt === "jpg" ? "Smaller files, ideal for photos" : "Lossless quality, larger files"}</p>
                    </div>
                  </label>
                ))}
              </div>
              <Button onClick={convertToImages} disabled={isProcessing} className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg">
                <Download className="w-5 h-5 mr-2" />
                {isProcessing ? "Converting…" : `Convert to ${format.toUpperCase()} Images`}
              </Button>
            </CardContent>
          </Card>
        )}
      </ToolPageSEO>
      <AdModal show={showAd} onComplete={() => { setShowAd(false); if (pendingDownload) { pendingDownload(); setPendingDownload(null); } }} />
    </>
  );
}
