import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Download } from "lucide-react";
import { toast } from "sonner";
import AdModal from "@/components/AdModal";
import ToolPageSEO, { type ToolSEOConfig } from "@/components/ToolPageSEO";

const SEO_CONFIG: ToolSEOConfig = {
  title: "PDF to Word Converter Free — Convert PDF to DOCX Online | OmniPDF",
  description: "Convert PDF to Word (DOCX) online free. No sign up, no ads, no watermarks. Editable Word document from any PDF. Files deleted after conversion. Trusted by millions.",
  canonical: "https://omnipdf.app/pdf-to-docx",
  ogTitle: "Free PDF to Word Converter — PDF to DOCX Online, No Sign Up",
  ogDescription: "Convert PDF to editable Word document online free. No account required. Instant DOCX download. Used by millions.",
  h1: "PDF to Word — Convert PDF to DOCX Free",
  h1Sub: "Turn any PDF into an editable Word document in seconds — 100% free, no sign up, no ads. Trusted by millions.",
  schemaName: "PDF to Word Converter",
  schemaDescription: "Free online PDF to Word converter. Convert PDF files to editable DOCX documents. No sign up required. Used by millions.",
  keywords: ["pdf to word","convert pdf to word","pdf to docx","pdf to editable word","free pdf to word converter","editable doc from pdf","pdf to microsoft word","pdf text to word","free online pdf tools","no signup pdf converter"],
  howToSteps: [
    "Upload your PDF by clicking \'Select PDF\' or dragging it into the drop zone.",
    "Click \'Convert to Word\'. The tool extracts text and structure from your PDF.",
    "Download your .docx file — open it in Microsoft Word or Google Docs. Free, no sign up.",
  ],
  seoBody: [
    { heading: "Convert PDF to Editable Word Document — Free", text: "OmniPDF\'s PDF to Word converter extracts text and formatting from your PDF and produces a .docx file you can edit in Microsoft Word, Google Docs, or LibreOffice. Ideal for editing contracts, updating reports, or repurposing content from locked PDFs. Completely free, no account needed, used by millions." },
    { heading: "No Ads, No Sign Up, Fastest PDF to Word Tool", text: "OmniPDF is used by millions for fast, reliable PDF conversion without interruptions. No ads slow you down, no sign-up page blocks your access. Your PDF is converted on our fast servers and the result is deleted immediately after your download — your documents stay private." },
  ],
  features: [
    { title: "Editable DOCX Output", description: "Download a Word document you can edit immediately in Microsoft Word or Google Docs." },
    { title: "Text & Structure Preserved", description: "Paragraphs, headings, and text formatting are carried over from the PDF." },
    { title: "100% Free", description: "PDF to Word conversion is always free on OmniPDF." },
    { title: "No Sign Up", description: "No email, no account, no password. Convert instantly." },
    { title: "No Ads", description: "Zero pop-ups or banners while your file converts." },
    { title: "Secure & Private", description: "Files are deleted from our servers immediately after download." },
  ],
  faqs: [
    { q: "Is PDF to Word conversion free?", a: "Yes — 100% free. No account, no watermarks, no trial limits." },
    { q: "Will the Word document be editable?", a: "Yes. The output is a standard .docx file that opens in Microsoft Word, Google Docs, and LibreOffice Writer and is fully editable." },
    { q: "Does it work with scanned PDFs?", a: "Scanned PDFs (image-only) have limited text extraction. Digitally created PDFs will produce fully editable DOCX output." },
    { q: "Will formatting be preserved?", a: "Basic formatting like paragraphs, headings, and text style is preserved. Complex multi-column layouts or tables may require minor cleanup after conversion." },
    { q: "Are my files kept private?", a: "Yes. Files are processed securely and permanently deleted from our servers immediately after your download." },
  ],
  relatedTools: [
    { href: "/pdf-to-text", label: "PDF to Text" },
    { href: "/word-to-pdf", label: "Word to PDF" },
    { href: "/merge-pdf", label: "Merge PDF" },
    { href: "/compress-pdf", label: "Compress PDF" },
    { href: "/pdf-summarizer", label: "AI Summarizer" },
  ],
};

export default function PDFToDocx() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAd, setShowAd] = useState(false);
  const [pendingDownload, setPendingDownload] = useState<(() => void) | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const convertToDocx = async () => {
    if (!file) { toast.error("Please select a PDF"); return; }
    setIsProcessing(true); setProgress("Extracting text from PDF…");
    try {
      const formData = new FormData();
      formData.append("pdf", file);
      setProgress("Converting to Word format…");
      const response = await fetch("/api/pdf-to-word", { method: "POST", body: formData });
      if (!response.ok) throw new Error("Conversion failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = file.name.replace(/\.pdf$/i, ".docx"); document.body.appendChild(a);
      setPendingDownload(() => () => { a.click(); setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000); });
      setShowAd(true);
      toast.success("Converted to Word!");
    } catch { toast.error("Failed to convert PDF to Word"); }
    finally { setIsProcessing(false); setProgress(""); }
  };

  return (
    <>
      <ToolPageSEO config={SEO_CONFIG}>
        <Card className="mb-8 dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f?.type === "application/pdf") { setFile(f); toast.success("PDF selected"); } else toast.error("Please drop a PDF file"); }}
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${isDragging ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-slate-300 dark:border-slate-600"}`}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <p className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Drag your PDF here or click to select</p>
              {file ? <p className="text-blue-600 dark:text-blue-400 font-medium">{file.name}</p> : <Button className="bg-blue-600 hover:bg-blue-700 pointer-events-none">Select PDF</Button>}
              <input ref={fileInputRef} type="file" accept=".pdf" onChange={(e) => { if (e.target.files?.[0]) { setFile(e.target.files[0]); toast.success("PDF selected"); } }} className="hidden" />
            </div>
          </CardContent>
        </Card>
        {file && (
          <Button onClick={convertToDocx} disabled={isProcessing} className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg mb-8">
            <Download className="w-5 h-5 mr-2" />
            {isProcessing ? progress || "Converting…" : "Convert to Word (DOCX)"}
          </Button>
        )}
      </ToolPageSEO>
      <AdModal show={showAd} onComplete={() => { setShowAd(false); if (pendingDownload) { pendingDownload(); setPendingDownload(null); } }} />
    </>
  );
}
