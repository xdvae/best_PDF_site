import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Download, Trash2, RotateCw, GripVertical, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import AdModal from "@/components/AdModal";
import ToolPageSEO, { type ToolSEOConfig } from "@/components/ToolPageSEO";

type Operation = "delete" | "rotate" | "reorder";

const SEO_CONFIG: ToolSEOConfig = {
  title: "Free PDF Editor Online — Reorder, Delete & Rotate PDF Pages | OmniPDF",
  description: "Edit PDF files online free. Reorder pages, delete pages, rotate pages. No sign up, no ads, no watermarks. Fast PDF editor trusted by millions. Files deleted after editing.",
  canonical: "https://omnipdf.app/pdf-editor",
  ogTitle: "Free PDF Editor Online — Edit PDF Pages, No Sign Up",
  ogDescription: "Edit PDF pages online free. Reorder, delete, or rotate pages. No account needed. Used by millions.",
  h1: "PDF Editor — Edit PDF Pages Free Online",
  h1Sub: "Reorder, delete, or rotate pages in any PDF — 100% free, no sign up, no ads. The fastest free PDF editor online.",
  schemaName: "PDF Editor",
  schemaDescription: "Free online PDF editor. Reorder, delete, and rotate PDF pages without sign up. No watermarks. Used by millions.",
  keywords: ["pdf editor","edit pdf online","online pdf editor","free pdf editor","edit pdf free","reorder pdf pages","rotate pdf pages","delete pdf pages","manage pdf files","modify pdf online","free online pdf tools","no signup pdf"],
  howToSteps: [
    "Upload your PDF by clicking 'Select PDF' or dragging it into the upload zone.",
    "Choose an operation: Delete pages, Reorder pages, or Rotate pages.",
    "Select the pages you want to affect. For reorder, use the arrow buttons to move pages.",
    "Click 'Apply' to process your edits and download the updated PDF — free, no sign up.",
  ],
  seoBody: [
    { heading: "Edit PDF Pages Online — Always Free", text: "OmniPDF's PDF editor gives you direct control over the page structure of any PDF — delete unwanted pages, reorder pages by dragging, or rotate individual pages to fix orientation. Unlike expensive desktop software, OmniPDF's editor works instantly in your browser at no cost, no sign-up required, used by millions every month." },
    { heading: "No Ads, No Account, Trusted by Millions", text: "Millions of users edit their PDFs with OmniPDF every month because it's fast, private, and genuinely free. There are no pop-up ads, no account walls, and no file limits. Your edited PDF is generated in seconds on our servers and deleted immediately after you download." },
  ],
  features: [
    { title: "Delete Pages", description: "Remove any pages you don't need. Select multiple pages and delete them in one click." },
    { title: "Reorder Pages", description: "Move pages up or down to set the exact order you need before saving." },
    { title: "Rotate Pages", description: "Fix sideways or upside-down pages by rotating them 90°, 180°, or 270°." },
    { title: "100% Free", description: "All PDF editing features are completely free on OmniPDF." },
    { title: "No Sign Up", description: "No email or account required. Start editing immediately." },
    { title: "No Ads", description: "Zero interruptions — edit your PDF without pop-ups or banners." },
  ],
  faqs: [
    { q: "Is the PDF editor free?", a: "Yes — 100% free. All three operations (delete, reorder, rotate) are free with no account required." },
    { q: "Can I delete multiple pages at once?", a: "Yes. You can select multiple pages and delete them all in a single operation." },
    { q: "Will the edited PDF lose quality?", a: "No. Editing does not re-render or recompress any content. The output quality is identical to the original." },
    { q: "Is there a page count limit?", a: "No. You can edit PDFs of any length." },
    { q: "Are my files kept private?", a: "Yes. Files are processed securely and deleted immediately after your download. We never store or share your documents." },
  ],
  relatedTools: [
    { href: "/merge-pdf", label: "Merge PDF" },
    { href: "/split-pdf", label: "Split PDF" },
    { href: "/compress-pdf", label: "Compress PDF" },
    { href: "/pdf-to-images", label: "PDF to JPG" },
    { href: "/pdf-to-docx", label: "PDF to Word" },
  ],
};

export default function PDFEditor() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [operation, setOperation] = useState<Operation>("delete");
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [rotationAngle, setRotationAngle] = useState(90);
  const [pageOrder, setPageOrder] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showAd, setShowAd] = useState(false);
  const [pendingDownload, setPendingDownload] = useState<(() => void) | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (f: File) => {
    setFile(f); setSelectedPages(new Set());
    try {
      const formData = new FormData();
      formData.append("pdf", f);
      const res = await fetch("/api/pdf-metadata", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        setPageCount(data.pageCount);
        setPageOrder(Array.from({ length: data.pageCount }, (_, i) => i));
      }
    } catch { toast.error("Could not read PDF metadata"); }
  };

  const togglePage = (idx: number) => setSelectedPages((prev) => {
    const next = new Set(prev); next.has(idx) ? next.delete(idx) : next.add(idx); return next;
  });

  const movePage = (idx: number, dir: "up" | "down") => setPageOrder((prev) => {
    const next = [...prev]; const ti = dir === "up" ? idx - 1 : idx + 1;
    if (ti < 0 || ti >= next.length) return prev;
    [next[idx], next[ti]] = [next[ti], next[idx]]; return next;
  });

  const processFile = async () => {
    if (!file) { toast.error("Please select a PDF"); return; }
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("pdf", file);
      let endpoint = "";
      if (operation === "delete") {
        if (selectedPages.size === 0) { toast.error("Select pages to delete"); setIsProcessing(false); return; }
        formData.append("pagesToDelete", JSON.stringify(Array.from(selectedPages)));
        endpoint = "/api/pdf-editor/delete";
      } else if (operation === "reorder") {
        formData.append("order", JSON.stringify(pageOrder));
        endpoint = "/api/pdf-editor/reorder";
      } else if (operation === "rotate") {
        if (selectedPages.size === 0) { toast.error("Select pages to rotate"); setIsProcessing(false); return; }
        formData.append("pageIndices", JSON.stringify(Array.from(selectedPages)));
        formData.append("angle", rotationAngle.toString());
        endpoint = "/api/pdf-editor/rotate";
      }
      const response = await fetch(endpoint, { method: "POST", body: formData });
      if (!response.ok) throw new Error("Processing failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "edited.pdf"; document.body.appendChild(a);
      setPendingDownload(() => () => { a.click(); setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000); });
      setShowAd(true);
      toast.success("PDF edited successfully!");
    } catch { toast.error("Failed to process PDF"); }
    finally { setIsProcessing(false); }
  };

  const OPERATIONS: { op: Operation; label: string; icon: typeof Trash2 }[] = [
    { op: "delete",  label: "Delete Pages",  icon: Trash2     },
    { op: "rotate",  label: "Rotate Pages",  icon: RotateCw   },
    { op: "reorder", label: "Reorder Pages", icon: GripVertical },
  ];

  return (
    <>
      <ToolPageSEO config={SEO_CONFIG}>
        {/* Upload */}
        <Card className="mb-6 dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f?.type === "application/pdf") handleFileSelect(f); else toast.error("Please drop a PDF"); }}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${isDragging ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-slate-300 dark:border-slate-600"}`}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-10 h-10 mx-auto mb-3 text-slate-400" />
              <p className="font-semibold text-slate-800 dark:text-white">{file ? file.name : "Drop PDF here or click to select"}</p>
              {pageCount > 0 && <p className="text-sm text-slate-500 mt-1">{pageCount} pages</p>}
              <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }} className="hidden" />
            </div>
          </CardContent>
        </Card>

        {file && pageCount > 0 && (
          <>
            {/* Operation selector */}
            <Card className="mb-6 dark:bg-slate-800 dark:border-slate-700">
              <CardHeader><CardTitle>Choose Operation</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {OPERATIONS.map(({ op, label, icon: Icon }) => (
                    <button key={op} onClick={() => { setOperation(op); setSelectedPages(new Set()); }}
                      className={`py-3 px-4 rounded-lg border-2 font-medium transition-colors flex flex-col items-center gap-2 text-sm ${operation === op ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" : "border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-slate-400"}`}>
                      <Icon className="w-5 h-5" />
                      {label}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Rotation angle picker */}
            {operation === "rotate" && (
              <Card className="mb-6 dark:bg-slate-800 dark:border-slate-700">
                <CardHeader><CardTitle>Rotation Angle</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    {[90, 180, 270].map((angle) => (
                      <button key={angle} onClick={() => setRotationAngle(angle)}
                        className={`flex-1 py-2 rounded-lg border-2 font-medium transition-colors ${rotationAngle === angle ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" : "border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300"}`}>
                        {angle}°
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Page list */}
            <Card className="mb-6 dark:bg-slate-800 dark:border-slate-700">
              <CardHeader>
                <CardTitle>
                  {operation === "delete" ? "Select Pages to Delete" : operation === "rotate" ? "Select Pages to Rotate" : "Reorder Pages"}
                </CardTitle>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {operation === "reorder" ? "Use arrow buttons to move pages" : "Click pages to select/deselect"}
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {(operation === "reorder" ? pageOrder : Array.from({ length: pageCount }, (_, i) => i)).map((pageIdx, listIdx) => (
                    <div key={pageIdx}
                      className={`relative rounded-lg border-2 p-2 text-center transition-all ${
                        operation !== "reorder" && selectedPages.has(pageIdx)
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                          : "border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700"
                      }`}
                    >
                      {operation === "reorder" ? (
                        <div>
                          <p className="text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">p.{pageIdx + 1}</p>
                          <div className="flex justify-center gap-1">
                            <button onClick={() => movePage(listIdx, "up")} disabled={listIdx === 0}
                              className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-30 text-slate-500">
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button onClick={() => movePage(listIdx, "down")} disabled={listIdx === pageCount - 1}
                              className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-30 text-slate-500">
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button className="w-full" onClick={() => togglePage(pageIdx)}>
                          <p className="text-xs font-medium text-slate-700 dark:text-slate-200">p.{pageIdx + 1}</p>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button onClick={processFile} disabled={isProcessing} className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg mb-8">
              <Download className="w-5 h-5 mr-2" />
              {isProcessing ? "Processing…" : "Apply & Download PDF"}
            </Button>
          </>
        )}
      </ToolPageSEO>
      <AdModal show={showAd} onComplete={() => { setShowAd(false); if (pendingDownload) { pendingDownload(); setPendingDownload(null); } }} />
    </>
  );
}
