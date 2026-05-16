import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Download } from "lucide-react";
import { toast } from "sonner";
import AdModal from "@/components/AdModal";
import ToolPageSEO, { type ToolSEOConfig } from "@/components/ToolPageSEO";

const SEO_CONFIG: ToolSEOConfig = {
  title: "PDF to Text Converter Free — Extract Text from PDF Online | OmniPDF",
  description: "Extract text from PDF files online free. Convert PDF to plain text (.txt) with one click. No sign up, no ads, no watermarks. Files deleted instantly. Used by millions.",
  canonical: "https://omnipdf.xyz/pdf-to-text",
  ogTitle: "Free PDF to Text Extractor — Extract PDF Content Online, No Sign Up",
  ogDescription: "Extract text from any PDF online free. Download as .txt instantly. No account needed. Used by millions.",
  h1: "PDF to Text — Extract Text from PDF Free",
  h1Sub: "Pull all the text out of any PDF and save it as a plain text file — 100% free, instant, no sign up required.",
  schemaName: "PDF to Text Extractor",
  schemaDescription: "Free online PDF to text converter. Extract text content from PDF files and download as plain text. No sign up required.",
  keywords: ["pdf to text","extract text from pdf","pdf text extractor","convert pdf to txt","pdf to plain text","extract pdf content","copy text from pdf","pdf text converter","scanned pdf to text","free online pdf tools","no signup pdf"],
  howToSteps: [
    "Upload your PDF by clicking \'Select PDF\' or dragging it into the upload zone.",
    "Click \'Extract Text\'. Our tool reads all text content from every page of your PDF.",
    "Download the .txt file containing all extracted text — free, no sign up, no watermarks.",
  ],
  seoBody: [
    { heading: "Extract Text from Any PDF — Always Free", text: "OmniPDF\'s PDF to text extractor pulls all readable text from your PDF and delivers it as a clean plain-text .txt file. Perfect for copying content from locked PDFs, feeding text into analysis tools, or archiving document content. Completely free, no sign up, used by millions every month." },
    { heading: "Fastest PDF Text Extractor — No Ads, No Account", text: "Millions of users rely on OmniPDF for fast, ad-free file conversion. Text extraction happens in seconds on our optimised servers. No ads, no account prompts, no file limits. Your privacy is protected by default: files are permanently deleted from our servers immediately after processing." },
  ],
  features: [
    { title: "Full Document Extraction", description: "Text from every page of your PDF is extracted and combined into one text file." },
    { title: "Plain Text Output", description: "Output is a clean .txt file — easy to open in any editor or import into any tool." },
    { title: "100% Free", description: "Extracting text from PDFs is always free on OmniPDF." },
    { title: "No Sign Up", description: "No email or account needed. Start extracting immediately." },
    { title: "No Ads", description: "No pop-ups or banners interrupting your extraction." },
    { title: "Instant Download", description: "Text files are ready in seconds and download directly to your device." },
  ],
  faqs: [
    { q: "Is PDF to text extraction free?", a: "Yes — completely free. No account, no watermarks, no limits." },
    { q: "Can I extract text from a scanned PDF?", a: "Standard text extraction works on PDFs with embedded text. Scanned PDFs (image-only) require OCR. If your extracted text file is empty, your PDF is likely a scan." },
    { q: "What does the output look like?", a: "The output is a plain .txt file containing all readable text from your PDF, in reading order. All text content will be present, though complex layouts like tables may not be perfectly formatted." },
    { q: "Are my files kept private?", a: "Yes. Files are processed securely and deleted immediately after your download. We never store or share your documents." },
  ],
  relatedTools: [
    { href: "/pdf-to-images", label: "PDF to JPG" },
    { href: "/pdf-to-docx", label: "PDF to Word" },
    { href: "/merge-pdf", label: "Merge PDF" },
    { href: "/compress-pdf", label: "Compress PDF" },
    { href: "/pdf-summarizer", label: "AI Summarizer" },
  ],
};

export default function PDFToText() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAd, setShowAd] = useState(false);
  const [pendingDownload, setPendingDownload] = useState<(() => void) | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const convertToText = async () => {
    if (!file) { toast.error("Please select a PDF"); return; }
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("pdf", file);
      const response = await fetch("/api/pdf-to-text", { method: "POST", body: formData });
      if (!response.ok) throw new Error("Conversion failed");
      const blob = await response.blob();
      const text = await blob.text();

      // Detect image-based (scanned) PDFs — pdf-parse returns empty or near-empty string
      if (!text || text.trim().length < 10) {
        toast.error(
          "This PDF appears to be image-based (scanned). Text extraction only works on PDFs with embedded text. Try an OCR tool to extract text from scanned documents.",
          { duration: 8000 }
        );
        setIsProcessing(false);
        return;
      }

      const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
      const a = document.createElement("a");
      a.href = url; a.download = "extracted-text.txt"; document.body.appendChild(a);
      setPendingDownload(() => () => { a.click(); setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000); });
      setShowAd(true);
      toast.success("Text extracted successfully!");
    } catch { toast.error("Failed to extract text. The PDF may be corrupt or password-protected."); }
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
          <Button onClick={convertToText} disabled={isProcessing} className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg mb-8">
            <Download className="w-5 h-5 mr-2" />
            {isProcessing ? "Extracting Text…" : "Extract Text"}
          </Button>
        )}
      </ToolPageSEO>
      <AdModal show={showAd} onComplete={() => { setShowAd(false); if (pendingDownload) { pendingDownload(); setPendingDownload(null); } }} />
    </>
  );
}
