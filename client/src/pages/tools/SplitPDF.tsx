import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Download } from "lucide-react";
import { toast } from "sonner";
import AdModal from "@/components/AdModal";
import ToolPageSEO, { type ToolSEOConfig } from "@/components/ToolPageSEO";

const SEO_CONFIG: ToolSEOConfig = {
  title: "Split PDF Online Free — Extract Pages from PDF | OmniPDF",
  description: "Split PDF files online free. Extract specific page ranges from any PDF. No sign up, no ads, no watermarks. Files deleted after splitting. Trusted by millions.",
  canonical: "https://omnipdf.xyz/split-pdf",
  ogTitle: "Free PDF Splitter — Extract PDF Pages Online, No Sign Up",
  ogDescription: "Split PDF files and extract pages online free. No account needed. Instant download, no watermarks. Used by millions.",
  h1: "Split PDF — Extract Pages Free",
  h1Sub: "Separate pages from any PDF online — 100% free, instant, no sign up required. The fastest PDF splitter online.",
  schemaName: "PDF Splitter",
  schemaDescription: "Free online tool to split PDF files and extract specific page ranges. No sign up required. Used by millions.",
  keywords: ["split pdf","split pdf online","pdf splitter","separate pdf pages","extract pdf pages","divide pdf","cut pdf pages","split large pdf","extract pages from pdf","free online pdf tools","no signup pdf","instant file conversion"],
  howToSteps: [
    "Upload your PDF by clicking \'Select PDF\' or dragging it into the drop zone.",
    "Enter the start and end page numbers for the range you want to extract.",
    "Click \'Split PDF\'. The extracted pages are compiled into a new PDF in seconds.",
    "Download your split PDF — free, no sign up, no watermarks.",
  ],
  seoBody: [
    { heading: "Extract PDF Pages Online — Always Free", text: "OmniPDF\'s PDF splitter lets you extract any page range from a PDF document and download it as a new PDF — completely free, no sign up needed. Whether you need one page from a 200-page report, or a chapter from a long document, just enter the page numbers and hit Split. Used by millions every month." },
    { heading: "No Ads, No Account, Trusted by Millions", text: "OmniPDF is the fastest free PDF splitter online. No ads interrupt your work, no account is required, and your file is deleted from our servers the moment you download the result. We never store or share your documents." },
  ],
  features: [
    { title: "Page Range Extraction", description: "Enter any start and end page to extract exactly the pages you need." },
    { title: "Preserves Formatting", description: "Extracted pages keep all fonts, images, and layout from the original PDF." },
    { title: "100% Free", description: "Splitting PDFs is always free on OmniPDF — no hidden costs." },
    { title: "No Sign Up", description: "No email, no account, no password. Open the tool and start splitting." },
    { title: "No Ads", description: "No pop-ups or banners interrupting your workflow." },
    { title: "Instant Result", description: "Splits complete in seconds regardless of your PDF\'s page count." },
  ],
  faqs: [
    { q: "Is splitting PDFs free?", a: "Yes — 100% free. No account, no trial limit, no watermarks. Every split on OmniPDF is completely free." },
    { q: "Can I extract a single page from a PDF?", a: "Yes. Set both the start and end page to the same number to extract just one page as a standalone PDF." },
    { q: "Does splitting damage the original PDF?", a: "No. The original file is never modified. The split creates a brand-new PDF containing only the pages you specified." },
    { q: "Is there a page limit?", a: "No. You can split PDFs of any length. Very large files may take a few extra seconds to process." },
    { q: "Are my files kept private?", a: "Yes. Files are transferred securely and deleted from our servers immediately after your download. We never store or share your documents." },
  ],
  relatedTools: [
    { href: "/merge-pdf", label: "Merge PDF" },
    { href: "/compress-pdf", label: "Compress PDF" },
    { href: "/pdf-editor", label: "PDF Editor" },
    { href: "/images-to-pdf", label: "Images to PDF" },
    { href: "/pdf-to-images", label: "PDF to JPG" },
  ],
};

export default function SplitPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [startPage, setStartPage] = useState("1");
  const [endPage, setEndPage] = useState("1");
  const [showAd, setShowAd] = useState(false);
  const [pendingDownload, setPendingDownload] = useState<(() => void) | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files?.[0]?.type === "application/pdf") { setFile(e.dataTransfer.files[0]); toast.success("PDF selected"); }
    else toast.error("Please drop a PDF file");
  };

  const splitPDF = async () => {
    if (!file) { toast.error("Please select a PDF"); return; }
    const start = parseInt(startPage); const end = parseInt(endPage);
    if (isNaN(start) || isNaN(end) || start < 1 || end < start) { toast.error("Invalid page range"); return; }
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("pdf", file); formData.append("startPage", start.toString()); formData.append("endPage", end.toString());
      const response = await fetch("/api/split-pdf", { method: "POST", body: formData });
      if (!response.ok) throw new Error("Split failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "split.pdf"; document.body.appendChild(a);
      setPendingDownload(() => () => { a.click(); setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000); });
      setShowAd(true);
      toast.success("PDF split successfully!");
    } catch { toast.error("Failed to split PDF"); }
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
              <input ref={fileInputRef} type="file" accept=".pdf" onChange={(e) => { if (e.target.files?.[0]) { setFile(e.target.files[0]); toast.success("PDF selected"); } }} className="hidden" />
            </div>
          </CardContent>
        </Card>

        {file && (
          <Card className="mb-8 dark:bg-slate-800 dark:border-slate-700">
            <CardHeader><CardTitle>Page Range to Extract</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Start Page</label>
                  <input type="number" min="1" value={startPage} onChange={(e) => setStartPage(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">End Page</label>
                  <input type="number" min="1" value={endPage} onChange={(e) => setEndPage(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
                </div>
              </div>
              <Button onClick={splitPDF} disabled={isProcessing} className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg">
                <Download className="w-5 h-5 mr-2" />
                {isProcessing ? "Splitting…" : "Split PDF"}
              </Button>
            </CardContent>
          </Card>
        )}
      </ToolPageSEO>
      <AdModal show={showAd} onComplete={() => { setShowAd(false); if (pendingDownload) { pendingDownload(); setPendingDownload(null); } }} />
    </>
  );
}
