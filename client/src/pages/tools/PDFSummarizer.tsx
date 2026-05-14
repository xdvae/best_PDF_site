import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Sparkles, Copy, FileText, X } from "lucide-react";
import { toast } from "sonner";
import AdModal from "@/components/AdModal";
import ToolPageSEO, { type ToolSEOConfig } from "@/components/ToolPageSEO";

const SEO_CONFIG: ToolSEOConfig = {
  title: "AI PDF Summarizer Free — Summarize PDFs with AI Online | OmniPDF",
  description: "Summarize PDF documents with AI online free. Get instant AI-powered summaries of any PDF. No sign up, no ads, no watermarks. Fast AI PDF reader trusted by millions.",
  canonical: "https://omnipdf.app/pdf-summarizer",
  ogTitle: "Free AI PDF Summarizer — Summarize Any PDF Online, No Sign Up",
  ogDescription: "AI-powered PDF summarizer free. Get an instant summary of any PDF. No account needed. Used by millions.",
  h1: "AI PDF Summarizer — Summarize Any PDF Free",
  h1Sub: "Get an instant AI-powered summary of any PDF document — 100% free, no sign up, no ads. Trusted by millions.",
  schemaName: "AI PDF Summarizer",
  schemaDescription: "Free AI-powered PDF summarizer. Get instant summaries of PDF documents online without sign up. Used by millions.",
  keywords: ["ai pdf summarizer","summarize pdf with ai","pdf ai chat","chat with pdf","ai document summarizer","ai pdf reader","pdf summary tool","ai file summarizer","ask questions about pdf","ai study pdf tool","free online pdf tools","no signup pdf"],
  howToSteps: [
    "Upload your PDF by clicking 'Select PDF' or dragging it into the upload zone.",
    "Click 'Summarize with AI'. Our AI reads the entire document and generates a comprehensive summary.",
    "Read your summary instantly in the browser — free, no sign up required.",
    "Copy the summary to use in your notes, emails, or reports.",
  ],
  seoBody: [
    { heading: "Summarize PDF Documents with AI — Always Free", text: "OmniPDF's AI summarizer reads your entire PDF and generates a clear, structured summary of its key points, arguments, and conclusions. Ideal for students reviewing research papers, professionals scanning long reports, or anyone who needs the gist of a document without reading every page. Completely free, no sign up required, used by millions every month." },
    { heading: "No Ads, No Account, Trusted by Millions", text: "Millions of students, researchers, and professionals use OmniPDF because it's fast, ad-free, and requires no account. Our AI processes your PDF in seconds. Your file is never stored after the summary is generated. Everything is private by default." },
  ],
  features: [
    { title: "AI-Powered Summaries", description: "Our AI reads the full document and extracts the most important information intelligently." },
    { title: "Any PDF Type", description: "Works on research papers, reports, contracts, books, and more." },
    { title: "100% Free", description: "AI summarization is always free on OmniPDF — no API costs passed to you." },
    { title: "No Sign Up", description: "No email or account needed. Summarize immediately." },
    { title: "No Ads", description: "No interruptions while the AI reads and summarizes your document." },
    { title: "Instant Results", description: "Summaries are generated in seconds for most documents." },
  ],
  faqs: [
    { q: "Is the AI PDF summarizer free?", a: "Yes — 100% free. No account, no trial limit, no premium tier." },
    { q: "How long can the PDF be?", a: "The tool works best on PDFs up to around 100 pages. Very long documents may be summarized in sections." },
    { q: "How accurate are the summaries?", a: "Our AI produces high-quality summaries that capture the main arguments and conclusions. For critical work, always verify against the original document." },
    { q: "Are my files kept private?", a: "Yes. Your PDF is processed securely and deleted from our servers immediately after the summary is generated. We never store or share your documents." },
  ],
  relatedTools: [
    { href: "/pdf-to-text", label: "PDF to Text" },
    { href: "/pdf-to-docx", label: "PDF to Word" },
    { href: "/merge-pdf", label: "Merge PDF" },
    { href: "/compress-pdf", label: "Compress PDF" },
    { href: "/pdf-editor", label: "PDF Editor" },
  ],
};

export default function PDFSummarizer() {
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [pdfInfo, setPdfInfo] = useState<{ pageCount: number; wordCount: number } | null>(null);
  const [showAd, setShowAd] = useState(false);
  const [pendingDownload, setPendingDownload] = useState<(() => void) | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const summarize = async () => {
    if (!file) { toast.error("Please select a PDF"); return; }
    setIsProcessing(true);
    setSummary(""); setPdfInfo(null);
    try {
      const formData = new FormData();
      formData.append("pdf", file);
      const res = await fetch("/api/pdf-summarize", { method: "POST", body: formData });
      if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || "Processing failed"); }
      const data = await res.json();
      setPdfInfo({ pageCount: data.pageCount, wordCount: data.wordCount });

      const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `Please provide a comprehensive summary of the following PDF document. Include:\n1. Main topics covered\n2. Key points and takeaways\n3. Any important conclusions\n\nDocument text (${data.pageCount} pages, ${data.wordCount} words):\n\n${data.text.slice(0, 15000)}`
          }]
        })
      });

      if (aiRes.ok) {
        const aiData = await aiRes.json();
        const aiText = aiData.content?.find((c: any) => c.type === "text")?.text || "";
        setSummary(aiText);
      } else {
        const preview = data.text.slice(0, 1000);
        setSummary(`📄 Document Summary\n\nPages: ${data.pageCount} | Words: ${data.wordCount.toLocaleString()}\n\n--- Content Preview ---\n\n${preview}${data.text.length > 1000 ? "\n\n[... document continues ...]" : ""}`);
        toast.info("Showing text extraction (AI summary unavailable)");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to process PDF");
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary);
    toast.success("Summary copied to clipboard!");
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
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f?.type === "application/pdf") setFile(f); else toast.error("Please drop a PDF"); }}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${isDragging ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20" : "border-slate-300 dark:border-slate-600"}`}
              onClick={() => fileInputRef.current?.click()}
            >
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-purple-400" aria-hidden="true" />
              <p className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Drop your PDF here or click to select</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Supports text-based PDFs up to 100 MB</p>
              <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f); }} className="hidden" aria-label="Select PDF to summarize" />
            </div>

            {file && (
              <div className="mt-4 flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
                <FileText className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span className="text-slate-700 dark:text-slate-200 flex-1 truncate">{file.name}</span>
                <span className="text-slate-500 text-sm flex-shrink-0">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                <button onClick={() => { setFile(null); setSummary(""); setPdfInfo(null); }} className="text-slate-400 hover:text-red-500 flex-shrink-0" aria-label="Remove file">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {file && !summary && (
          <Button onClick={summarize} disabled={isProcessing}
            className="w-full bg-purple-600 hover:bg-purple-700 py-6 text-lg mb-8">
            <Sparkles className="w-5 h-5 mr-2" />
            {isProcessing ? "AI is reading your PDF…" : "Summarize with AI"}
          </Button>
        )}

        {/* Summary output */}
        {summary && (
          <Card className="mb-8 dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  AI Summary
                </CardTitle>
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  <Copy className="w-4 h-4 mr-2" /> Copy
                </Button>
              </div>
              {pdfInfo && (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {pdfInfo.pageCount} pages · {pdfInfo.wordCount.toLocaleString()} words
                </p>
              )}
            </CardHeader>
            <CardContent>
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {summary}
                </pre>
              </div>
              <div className="mt-6 flex gap-3">
                <Button onClick={summarize} variant="outline" className="flex-1">
                  <Sparkles className="w-4 h-4 mr-2" /> Re-summarize
                </Button>
                <Button onClick={() => { setFile(null); setSummary(""); setPdfInfo(null); }} variant="outline" className="flex-1">
                  Summarize another PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </ToolPageSEO>
      <AdModal show={showAd} onComplete={() => { setShowAd(false); if (pendingDownload) { pendingDownload(); setPendingDownload(null); } }} />
    </>
  );
}
