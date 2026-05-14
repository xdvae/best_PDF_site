import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Download, Trash2, RotateCw, GripVertical, Plus, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import AdModal from "@/components/AdModal";
import ToolPageSEO, { type ToolSEOConfig } from "@/components/ToolPageSEO";

interface ImageItem {
  id: string;
  file: File;
  preview: string;
  rotation: number;
}

const SEO_CONFIG: ToolSEOConfig = {
  title: "Images to PDF Converter — Convert JPG, PNG, WebP to PDF Free Online | OmniPDF",
  description: "Convert JPG, PNG, WebP, GIF images to PDF online free. Drag to reorder pages, rotate images, merge multiple photos into a single PDF. No signup, no watermarks, instant download.",
  canonical: "https://omnipdf.app/images-to-pdf",
  ogTitle: "Free Image to PDF Converter — JPG, PNG, WebP to PDF Online",
  ogDescription: "Merge multiple images into one PDF online free. Supports JPG, PNG, WebP, GIF. Reorder pages by dragging, rotate images, download instantly.",
  h1: "Images to PDF Converter",
  h1Sub: "Convert JPG, PNG, WebP and GIF photos into a single PDF online — free, fast, no signup required.",
  schemaName: "Images to PDF Converter",
  schemaDescription: "Free online tool to convert JPG, PNG, WebP, and GIF images into a single PDF document. Supports drag-and-drop reordering and image rotation.",
  keywords: [
    "image to pdf", "images to pdf", "convert images to pdf", "jpg to pdf", "png to pdf",
    "photo to pdf", "picture to pdf", "webp to pdf", "free image to pdf converter",
    "merge images into pdf", "create pdf from images", "online pdf creator",
    "convert jpg to pdf", "convert png to pdf", "image converter online",
    "free online pdf tools", "no signup pdf converter", "instant file conversion"
  ],
  howToSteps: [
    "Click 'Select Images' or drag and drop your JPG, PNG, WebP, or GIF files onto the upload zone.",
    "Arrange your images in the desired page order by dragging rows up or down.",
    "Use the rotate button on any image to fix its orientation before converting.",
    "Click 'Convert to PDF' and wait a moment while your PDF is generated.",
    "Watch a short ad, then click Download to save your PDF — completely free.",
  ],
  seoBody: [
    {
      heading: "Convert Any Image Format to PDF Online",
      text: "OmniPDF's image to PDF converter supports all major image formats including JPG, JPEG, PNG, WebP, GIF, and BMP. You can mix different formats in the same PDF — for example, combine a PNG logo with JPG photos and WebP screenshots into a single, professional document. Each image becomes its own page in the output PDF, sized to fit perfectly.",
    },
    {
      heading: "Why Convert Images to PDF?",
      text: "PDF is the universal document format — accepted by every email client, portal, and device. When you need to submit multiple photos as a single attachment, share a photo album with consistent formatting, or create a printable catalog from product images, converting to PDF is the most reliable approach. Our free image to PDF tool makes this instant: no software to install, no account needed, and your files are never stored on our servers.",
    },
    {
      heading: "Privacy and Security",
      text: "All conversion happens server-side with no permanent storage. Your images are processed in an isolated session and deleted immediately after the PDF is generated. We never share, index, or analyse your files. The download is direct to your device — no cloud storage involved.",
    },
  ],
  features: [
    { title: "Supports All Image Formats", description: "JPG, JPEG, PNG, WebP, GIF, and BMP — mix formats freely in one PDF." },
    { title: "Drag-to-Reorder Pages", description: "Grab any row and drag it to set the exact page order before converting." },
    { title: "Rotate Individual Images", description: "Fix sideways or upside-down images with one click before generating your PDF." },
    { title: "Batch Upload", description: "Add dozens of images at once using the file picker or by dropping them all together." },
    { title: "No Watermarks", description: "Your output PDF contains no OmniPDF branding — clean and professional." },
    { title: "Instant Download", description: "PDFs are generated in seconds. Download goes straight to your device." },
  ],
  faqs: [
    { q: "Can I convert PNG to PDF for free?", a: "Yes. OmniPDF's image to PDF converter is completely free. Upload your PNG files, arrange the order, and download your PDF with no hidden fees, no account, and no watermarks." },
    { q: "How many images can I convert at once?", a: "You can add as many images as you need. The tool handles batches of dozens of images. Very large batches (100+ high-resolution images) may take a few extra seconds to process." },
    { q: "Will my PDF keep the original image quality?", a: "Yes. Images are embedded at their original resolution. The conversion process does not downsample or compress your images unless you specifically need a smaller file, in which case you can use our Compress PDF tool afterwards." },
    { q: "Can I mix JPG and PNG files in one PDF?", a: "Absolutely. You can upload any combination of JPG, PNG, WebP, GIF, and BMP images and they will all be combined into a single PDF." },
    { q: "Is there a file size limit?", a: "Each image can be up to 50 MB. For very large images or batches, processing may take slightly longer but the tool will handle them without issues." },
    { q: "Do I need to install software?", a: "No installation required. The tool runs entirely in your browser. Just visit the page, upload your images, and download your PDF." },
  ],
  relatedTools: [
    { href: "/merge-pdf", label: "Merge PDF" },
    { href: "/compress-pdf", label: "Compress PDF" },
    { href: "/pdf-to-images", label: "PDF to JPG" },
    { href: "/split-pdf", label: "Split PDF" },
    { href: "/pdf-editor", label: "PDF Editor" },
    { href: "/word-to-pdf", label: "Word to PDF" },
    { href: "/ppt-to-pdf", label: "PowerPoint to PDF" },
  ],
};

export default function ImagesToPDF() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showAd, setShowAd] = useState(false);
  const [pendingDownload, setPendingDownload] = useState<(() => void) | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback((files: File[]) => {
    const imageFiles = files.filter((f) =>
      ["image/jpeg", "image/png", "image/gif", "image/webp", "image/bmp"].includes(f.type)
    );
    if (imageFiles.length === 0) { toast.error("Please select image files (JPG, PNG, GIF, WebP)"); return; }
    imageFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImages((prev) => [...prev, {
          id: crypto.randomUUID(),
          file, preview: e.target?.result as string, rotation: 0,
        }]);
      };
      reader.readAsDataURL(file);
    });
    toast.success(`Added ${imageFiles.length} image${imageFiles.length > 1 ? "s" : ""}`);
  }, []);

  const handleDropFiles = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    if (draggingId) return;
    processFiles(Array.from(e.dataTransfer.files));
  };

  const handleItemDragStart = (e: React.DragEvent, id: string) => {
    setDraggingId(id);
    e.dataTransfer.effectAllowed = "move";
  };
  const handleItemDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (id !== draggingId) setDragOverId(id);
  };
  const handleItemDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggingId || draggingId === targetId) { setDraggingId(null); setDragOverId(null); return; }
    setImages((prev) => {
      const arr = [...prev];
      const fromIdx = arr.findIndex((i) => i.id === draggingId);
      const toIdx = arr.findIndex((i) => i.id === targetId);
      const [item] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, item);
      return arr;
    });
    setDraggingId(null); setDragOverId(null);
  };
  const handleItemDragEnd = () => { setDraggingId(null); setDragOverId(null); };

  const rotateImage = (id: string) => setImages((prev) =>
    prev.map((img) => img.id === id ? { ...img, rotation: (img.rotation + 90) % 360 } : img)
  );
  const removeImage = (id: string) => setImages((prev) => prev.filter((i) => i.id !== id));
  const moveImage = (id: string, dir: "up" | "down") => {
    setImages((prev) => {
      const arr = [...prev]; const idx = arr.findIndex((i) => i.id === id);
      const ti = dir === "up" ? idx - 1 : idx + 1;
      if (ti < 0 || ti >= arr.length) return prev;
      [arr[idx], arr[ti]] = [arr[ti], arr[idx]]; return arr;
    });
  };

  const convertToPDF = async () => {
    if (images.length === 0) { toast.error("Add at least one image"); return; }
    setIsConverting(true);
    try {
      const formData = new FormData();
      images.forEach((img, i) => {
        formData.append("images", img.file);
        formData.append(`rotation_${i}`, img.rotation.toString());
      });
      const res = await fetch("/api/images-to-pdf", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Conversion failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "images-to-pdf.pdf";
      document.body.appendChild(a);
      setPendingDownload(() => () => { a.click(); setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000); });
      setShowAd(true);
      toast.success("PDF created! Watch the short ad to download.");
      setImages([]);
    } catch { toast.error("Failed to convert images to PDF"); }
    finally { setIsConverting(false); }
  };

  return (
    <>
      <ToolPageSEO config={SEO_CONFIG}>
        {/* Upload zone */}
        <Card className="mb-6 dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <div
              onDragOver={(e) => { e.preventDefault(); if (!draggingId) setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDropFiles}
              className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer ${isDragging ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-slate-300 dark:border-slate-600"}`}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-12 h-12 mx-auto mb-3 text-slate-400" aria-hidden="true" />
              <p className="text-lg font-semibold text-slate-800 dark:text-white mb-1">Drop images here or click to select</p>
              <p className="text-sm text-slate-500">JPG, PNG, WebP, GIF, BMP — multiple files supported</p>
              <input ref={fileInputRef} type="file" multiple accept="image/*"
                onChange={(e) => processFiles(Array.from(e.target.files || []))} className="hidden"
                aria-label="Select image files to convert to PDF" />
            </div>
          </CardContent>
        </Card>

        {/* Image list */}
        {images.length > 0 && (
          <Card className="mb-6 dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <CardTitle>Arrange Pages ({images.length})</CardTitle>
              <p className="text-sm text-slate-500 dark:text-slate-400">Drag rows to reorder · Rotate to fix orientation</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {images.map((img, idx) => (
                  <div
                    key={img.id}
                    draggable
                    onDragStart={(e) => handleItemDragStart(e, img.id)}
                    onDragOver={(e) => handleItemDragOver(e, img.id)}
                    onDrop={(e) => handleItemDrop(e, img.id)}
                    onDragEnd={handleItemDragEnd}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all select-none ${
                      draggingId === img.id ? "opacity-40 border-blue-400 bg-blue-50 dark:bg-blue-900/20" :
                      dragOverId === img.id ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.01]" :
                      "border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700"
                    }`}
                  >
                    <GripVertical className="w-5 h-5 text-slate-400 cursor-grab active:cursor-grabbing flex-shrink-0" aria-hidden="true" />
                    <div className="w-12 h-12 flex-shrink-0 rounded overflow-hidden bg-slate-100 dark:bg-slate-600 flex items-center justify-center">
                      <img
                        src={img.preview}
                        alt={`Page ${idx + 1}: ${img.file.name}`}
                        className="w-full h-full object-cover transition-transform"
                        style={{ transform: `rotate(${img.rotation}deg)` }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 dark:text-slate-100 truncate text-sm">{img.file.name}</p>
                      <p className="text-xs text-slate-400">{(img.file.size / 1024).toFixed(0)} KB · Page {idx + 1}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => moveImage(img.id, "up")} disabled={idx === 0}
                        className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-600 disabled:opacity-30 text-slate-500"
                        aria-label="Move page up">
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => moveImage(img.id, "down")} disabled={idx === images.length - 1}
                        className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-600 disabled:opacity-30 text-slate-500"
                        aria-label="Move page down">
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => rotateImage(img.id)}
                        className="p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-500"
                        aria-label="Rotate image 90 degrees">
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => removeImage(img.id)}
                        className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500"
                        aria-label="Remove image">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="mt-4 w-full border-dashed"
                onClick={() => fileInputRef.current?.click()}>
                <Plus className="w-4 h-4 mr-2" /> Add more images
              </Button>
            </CardContent>
          </Card>
        )}

        {images.length > 0 && (
          <Button onClick={convertToPDF} disabled={isConverting}
            className="w-full py-6 text-lg bg-blue-600 hover:bg-blue-700 mb-8">
            <Download className="w-5 h-5 mr-2" />
            {isConverting ? "Converting…" : `Convert ${images.length} image${images.length > 1 ? "s" : ""} to PDF`}
          </Button>
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
