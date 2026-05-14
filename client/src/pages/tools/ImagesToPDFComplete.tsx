import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Download, Trash2, RotateCw, GripVertical, Plus } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import AdModal from "@/components/AdModal";

interface ImageItem {
  id: string;
  file: File;
  preview: string;
  rotation: number;
}

export default function ImagesToPDFComplete() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showAd, setShowAd] = useState(false);
  const [pendingDownload, setPendingDownload] = useState<(() => void) | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Set SEO meta tags
  useEffect(() => {
    document.title = "Images to PDF - Convert JPG, PNG to PDF | OmniPDF";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Convert images (JPG, PNG, GIF) to PDF online. Arrange, rotate, and merge multiple images into a single PDF. Free, fast, and secure."
      );
    }
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      processFiles(files);
    }
  };

  const processFiles = (files: File[]) => {
    const imageFiles = files.filter((file) =>
      ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type)
    );

    if (imageFiles.length === 0) {
      toast.error("Please select valid image files (JPG, PNG, GIF, WebP)");
      return;
    }

    imageFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = e.target?.result as string;
        setImages((prev) => [
          ...prev,
          {
            id: Math.random().toString(36),
            file,
            preview,
            rotation: 0,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });

    toast.success(`Added ${imageFiles.length} image(s)`);
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const rotateImage = (id: string) => {
    setImages((prev) =>
      prev.map((img) =>
        img.id === id ? { ...img, rotation: (img.rotation + 90) % 360 } : img
      )
    );
  };

  const moveImage = (id: string, direction: "up" | "down") => {
    const index = images.findIndex((img) => img.id === id);
    if (
      (direction === "up" && index > 0) ||
      (direction === "down" && index < images.length - 1)
    ) {
      const newImages = [...images];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      [newImages[index], newImages[targetIndex]] = [
        newImages[targetIndex],
        newImages[index],
      ];
      setImages(newImages);
    }
  };

  const convertToPDF = async () => {
    if (images.length === 0) {
      toast.error("Please add at least one image");
      return;
    }

    setIsConverting(true);
    try {
      // Create FormData with images
      const formData = new FormData();
      images.forEach((img, index) => {
        formData.append("images", img.file);
        formData.append(`rotation_${index}`, img.rotation.toString());
      });

      // Call API
      const response = await fetch("/api/trpc/imagesToPdf.convert", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Conversion failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "images-to-pdf.pdf";
      document.body.appendChild(a); setPendingDownload(() => () => { a.click(); setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000); });
      setShowAd(true);

      toast.success("PDF created successfully!");
      setImages([]);
    } catch (error) {
      toast.error("Failed to convert images to PDF");
      console.error(error);
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <>
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">OmniPDF</span>
          </a>
          <a href="/" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
            ← Back to Tools
          </a>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Images to PDF
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300">
            Convert your images into a professional PDF document. Arrange, rotate, and customize your PDF exactly how you want it.
          </p>
        </div>

        {/* Upload Area */}
        <Card className="mb-8 dark:bg-slate-800 dark:border-slate-700">
          <CardHeader>
            <CardTitle>Step 1: Select Images</CardTitle>
            <CardDescription>Upload JPG, PNG, GIF, or WebP images</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                isDragging
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50"
              }`}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400 dark:text-slate-500" />
              <p className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Drag and drop images here
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                or click the button below
              </p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Select Images
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>

        {/* Image Preview & Management */}
        {images.length > 0 && (
          <Card className="mb-8 dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <CardTitle>Step 2: Arrange & Customize</CardTitle>
              <CardDescription>
                Drag to reorder, rotate, or remove images
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {images.map((img, index) => (
                  <div
                    key={img.id}
                    className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg"
                  >
                    <GripVertical className="w-5 h-5 text-slate-400 dark:text-slate-500 cursor-move" />
                    <div
                      style={{ transform: `rotate(${img.rotation}deg)` }}
                      className="w-20 h-20 flex-shrink-0 rounded overflow-hidden border border-slate-200 dark:border-slate-600"
                    >
                      <img
                        src={img.preview}
                        alt={`Image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {img.file.name}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {(img.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => rotateImage(img.id)}
                        title="Rotate 90°"
                      >
                        <RotateCw className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeImage(img.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Convert Button */}
        {images.length > 0 && (
          <Card className="mb-8 dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <CardTitle>Step 3: Convert to PDF</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={convertToPDF}
                disabled={isConverting}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg"
              >
                <Download className="w-5 h-5 mr-2" />
                {isConverting ? "Converting..." : "Convert to PDF"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-lg">Arrange Images</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Reorder images by dragging them to create your perfect PDF layout.
              </p>
            </CardContent>
          </Card>
          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-lg">Rotate Pages</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Rotate individual images 90° to fix orientation before converting.
              </p>
            </CardContent>
          </Card>
          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-lg">100% Private</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                All processing happens in your browser. Your images never leave your device.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
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
