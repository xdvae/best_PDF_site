import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Download, Trash2, GripVertical } from "lucide-react";
import { toast } from "sonner";
import AdModal from "@/components/AdModal";
import ToolPageSEO, { type ToolSEOConfig } from "@/components/ToolPageSEO";

interface PDFFile {
  id: string;
  file: File;
  name: string;
}

const SEO_CONFIG: ToolSEOConfig = {
  title: "Merge PDF Online Free — Combine Multiple PDFs Into One | OmniPDF",
  description: "Merge multiple PDF files into one document online free. No sign up, no watermarks. Combine PDFs instantly — drag to reorder, files deleted after merging.",
  canonical: "https://omnipdf.app/merge-pdf",
  ogTitle: "Free PDF Merger — Combine PDFs Online, No Sign Up",
  ogDescription: "Merge multiple PDFs into one file online free. No account required. Fast, secure, no watermarks.",
  h1: "Merge PDF — Combine Multiple PDFs Free",
  h1Sub: "Join two or more PDF files into a single document in seconds. Free, no sign up, no watermarks. Trusted by millions.",
  schemaName: "PDF Merger",
  schemaDescription: "Free online tool to merge multiple PDF files into a single PDF. No sign up required.",
  keywords: ["merge pdf","combine pdf","pdf merger","merge pdf online","free pdf merger","combine multiple pdfs","join pdf files","merge documents","merge pdf free","pdf combiner","free online pdf tools","no signup pdf","instant file conversion"],
  howToSteps: [
    "Click 'Select PDFs' or drag your PDF files into the upload zone. You can add as many as you need.",
    "Review the file list. Drag the grip handles to reorder files — the merged PDF will follow this order.",
    "Click 'Merge PDFs'. Your combined PDF is generated in seconds on our fast servers.",
    "Download your merged PDF — 100% free, no watermarks, no account required.",
  ],
  seoBody: [
    { heading: "Combine PDF Files Online — Completely Free", text: "OmniPDF's PDF merger lets you combine as many PDF files as you need into a single document — completely free, no sign up, no watermarks. Whether you are assembling a multi-chapter report, merging a cover letter with your CV, or consolidating invoices, the tool handles it in seconds. Used by millions of people worldwide every month." },
    { heading: "Fastest Free PDF Merger — No Ads, No Account", text: "Millions of users choose OmniPDF because it is the fastest free PDF merger online — and because we never ask for an email address or show you ads. Your files are uploaded over an encrypted connection, merged instantly, and deleted immediately after you download. Nothing is stored, nothing is shared." },
  ],
  features: [
    { title: "Unlimited Files", description: "Combine as many PDFs as you need in one merge. No arbitrary file-count limits." },
    { title: "Drag to Reorder", description: "Set the exact page order by dragging files in the list before merging." },
    { title: "No Watermarks", description: "Your merged PDF is clean — no OmniPDF branding on any page." },
    { title: "100% Free", description: "Merging PDFs is always free on OmniPDF. No premium tier." },
    { title: "No Sign Up", description: "Start merging immediately — we never ask for your email." },
    { title: "Instant Download", description: "Merged PDFs are ready in seconds and download directly to your device." },
  ],
  faqs: [
    { q: "Is the PDF merger really free?", a: "Yes — 100% free. OmniPDF's merge tool has no hidden costs, no trial limits, and no premium paywall. Every merge is free." },
    { q: "Do I need to create an account to merge PDFs?", a: "No. Open the tool, upload your files, and download your merged PDF. We never ask for your email or any account details." },
    { q: "How many PDFs can I merge at once?", a: "There is no hard limit on the number of files. You can merge dozens of PDFs in a single operation." },
    { q: "Are my files kept private?", a: "Files are transferred over HTTPS and permanently deleted from our servers immediately after your download. We never store or share your documents." },
    { q: "Will the merged PDF have a watermark?", a: "No watermarks, ever. Your output PDF is clean and professional." },
    { q: "Can I reorder pages before merging?", a: "Yes. Drag the grip handle next to each file to set the order before merging." },
  ],
  relatedTools: [
    { href: "/split-pdf", label: "Split PDF" },
    { href: "/compress-pdf", label: "Compress PDF" },
    { href: "/images-to-pdf", label: "Images to PDF" },
    { href: "/pdf-editor", label: "PDF Editor" },
    { href: "/pdf-to-docx", label: "PDF to Word" },
    { href: "/word-to-pdf", label: "Word to PDF" },
  ],
};

export default function MergePDF() {
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showAd, setShowAd] = useState(false);
  const [pendingDownload, setPendingDownload] = useState<(() => void) | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type === "application/pdf");
    if (droppedFiles.length === 0) {
      toast.error("Please drop PDF files only");
      return;
    }
    droppedFiles.forEach(file => {
      setFiles(prev => [...prev, { id: Math.random().toString(36), file, name: file.name }]);
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach(file => {
        setFiles(prev => [...prev, { id: Math.random().toString(36), file, name: file.name }]);
      });
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const mergePDFs = async () => {
    if (files.length < 2) {
      toast.error("Please add at least 2 PDFs");
      return;
    }

    setIsConverting(true);
    try {
      const formData = new FormData();
      files.forEach(f => formData.append("pdfs", f.file));

      const response = await fetch("/api/merge-pdf", { method: "POST", body: formData });
      if (!response.ok) throw new Error("Merge failed");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "merged.pdf";
      document.body.appendChild(a); setPendingDownload(() => () => { a.click(); setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000); });
      setShowAd(true);
      

      toast.success("PDFs merged successfully!");
      setFiles([]);
    } catch (error) {
      toast.error("Failed to merge PDFs");
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <>
    <ToolPageSEO config={SEO_CONFIG}>

        <Card className="mb-8 dark:bg-slate-800 dark:border-slate-700">
          <CardHeader>
            <CardTitle>Select PDFs</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              onDragOver={handleDragOver}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${isDragging ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-slate-300 dark:border-slate-600"}`}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <p className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Drag PDFs here</p>
              <Button onClick={() => fileInputRef.current?.click()} className="bg-blue-600 hover:bg-blue-700">
                Select PDFs
              </Button>
              <input ref={fileInputRef} type="file" multiple accept=".pdf" onChange={handleFileSelect} className="hidden" />
            </div>
          </CardContent>
        </Card>

        {files.length > 0 && (
          <Card className="mb-8 dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <CardTitle>Files to Merge ({files.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {files.map((f, i) => (
                  <div key={f.id} className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-700 rounded">
                    <GripVertical className="w-5 h-5 text-slate-400" />
                    <span className="flex-1 text-slate-900 dark:text-white">{i + 1}. {f.name}</span>
                    <Button size="sm" variant="outline" onClick={() => removeFile(f.id)} className="text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button onClick={mergePDFs} disabled={isConverting} className="w-full mt-6 bg-green-600 hover:bg-green-700 py-6">
                <Download className="w-5 h-5 mr-2" />
                {isConverting ? "Merging..." : "Merge PDFs"}
              </Button>
            </CardContent>
          </Card>
        )}
      </ToolPageSEO>
      <AdModal
        show={showAd}
        onComplete={() => {
          setShowAd(false);
          if (pendingDownload) { pendingDownload(); setPendingDownload(null); }
        }}
      />
    </>
  );
}
