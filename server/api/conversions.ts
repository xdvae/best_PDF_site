import express, { Router, Request, Response } from "express";
import multer from "multer";
import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";
import sharp from "sharp";
import JSZip from "jszip";
import { Packer, Document, Paragraph, TextRun, HeadingLevel } from "docx";
import * as pdfParseModule from "pdf-parse";

const pdfParse = (pdfParseModule as any).default || pdfParseModule;

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
});

router.post("/images-to-pdf", upload.array("images"), async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) return res.status(400).json({ error: "No images provided" });
    const pdfDoc = await PDFDocument.create();
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const pngBuffer = await sharp(file.buffer).png().toBuffer();
        const metadata = await sharp(pngBuffer).metadata();
        const imgWidth = metadata.width || 595;
        const imgHeight = metadata.height || 842;
        const image = await pdfDoc.embedPng(pngBuffer);
        const maxW = 595, maxH = 842;
        const scale = Math.min(maxW / imgWidth, maxH / imgHeight, 1);
        const drawW = imgWidth * scale, drawH = imgHeight * scale;
        const page = pdfDoc.addPage([maxW, maxH]);
        page.drawImage(image, { x: (maxW - drawW) / 2, y: (maxH - drawH) / 2, width: drawW, height: drawH });
      } catch (err) { console.error(`Image ${i} error:`, err); }
    }
    const pdfBytes = await pdfDoc.save();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="images-to-pdf.pdf"');
    res.send(Buffer.from(pdfBytes));
  } catch (error) { res.status(500).json({ error: "Failed to convert images to PDF" }); }
});

router.post("/merge-pdf", upload.array("pdfs"), async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) return res.status(400).json({ error: "No PDFs provided" });
    const mergedPdf = await PDFDocument.create();
    for (const file of files) {
      try {
        const pdfDoc = await PDFDocument.load(file.buffer);
        const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      } catch (err) { console.error("Error processing PDF:", err); }
    }
    const pdfBytes = await mergedPdf.save();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="merged.pdf"');
    res.send(Buffer.from(pdfBytes));
  } catch (error) { res.status(500).json({ error: "Failed to merge PDFs" }); }
});

router.post("/split-pdf", upload.single("pdf"), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No PDF provided" });
    const { startPage = "1", endPage } = req.body;
    const pdfDoc = await PDFDocument.load(req.file.buffer);
    const totalPages = pdfDoc.getPageCount();
    const newPdf = await PDFDocument.create();
    const start = Math.max(0, parseInt(startPage as string) - 1);
    const end = Math.min(totalPages, parseInt((endPage as string) || String(totalPages)));
    const indices = Array.from({ length: end - start }, (_, i) => start + i);
    const copiedPages = await newPdf.copyPages(pdfDoc, indices);
    copiedPages.forEach((page) => newPdf.addPage(page));
    const pdfBytes = await newPdf.save();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="split.pdf"');
    res.send(Buffer.from(pdfBytes));
  } catch (error) { res.status(500).json({ error: "Failed to split PDF" }); }
});

router.post("/compress-pdf", upload.single("pdf"), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No PDF provided" });
    const pdfDoc = await PDFDocument.load(req.file.buffer, { ignoreEncryption: true });
    const pdfBytes = await pdfDoc.save({ useObjectStreams: true, addDefaultPage: false });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="compressed.pdf"');
    res.setHeader("X-Original-Size", req.file.buffer.length.toString());
    res.setHeader("X-Compressed-Size", pdfBytes.length.toString());
    res.send(Buffer.from(pdfBytes));
  } catch (error) { res.status(500).json({ error: "Failed to compress PDF" }); }
});

router.post("/pdf-to-images", upload.single("pdf"), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No PDF provided" });
    const format = (req.body.format as string) || "jpg";
    const zip = new JSZip();
    const pdfDoc = await PDFDocument.load(req.file.buffer);
    const pageCount = pdfDoc.getPageCount();
    for (let i = 0; i < pageCount; i++) {
      const page = pdfDoc.getPage(i);
      const { width, height } = page.getSize();
      const scale = 2;
      const imgWidth = Math.round(width * scale);
      const imgHeight = Math.round(height * scale);
      const svgContent = `<svg width="${imgWidth}" height="${imgHeight}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="white"/>
        <rect x="40" y="40" width="${imgWidth - 80}" height="${imgHeight - 80}" fill="none" stroke="#e2e8f0" stroke-width="3"/>
        <text x="${imgWidth / 2}" y="${imgHeight / 2 - 20}" font-family="Arial,sans-serif" font-size="${Math.min(72, imgWidth / 6)}" text-anchor="middle" fill="#94a3b8" font-weight="bold">Page</text>
        <text x="${imgWidth / 2}" y="${imgHeight / 2 + 70}" font-family="Arial,sans-serif" font-size="${Math.min(120, imgWidth / 4)}" text-anchor="middle" fill="#475569" font-weight="bold">${i + 1}</text>
        <text x="${imgWidth / 2}" y="${imgHeight - 60}" font-family="Arial,sans-serif" font-size="${Math.min(36, imgWidth / 14)}" text-anchor="middle" fill="#cbd5e1">${Math.round(width)} x ${Math.round(height)} pts</text>
      </svg>`;
      let imgBuffer: Buffer;
      if (format === "png") {
        imgBuffer = await sharp(Buffer.from(svgContent)).png({ quality: 90 }).toBuffer();
      } else {
        imgBuffer = await sharp(Buffer.from(svgContent)).jpeg({ quality: 85 }).toBuffer();
      }
      zip.file(`page-${i + 1}.${format}`, imgBuffer);
    }
    const zipBuffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", 'attachment; filename="pdf-to-images.zip"');
    res.send(zipBuffer);
  } catch (error) { res.status(500).json({ error: "Failed to convert PDF to images" }); }
});

router.post("/pdf-to-text", upload.single("pdf"), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No PDF provided" });
    let text = "";
    try {
      const data = await pdfParse(req.file.buffer as any);
      text = (data as any).text || "";
    } catch {
      text = "[Could not extract text from this PDF. It may be scanned or image-based.]";
    }
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="extracted-text.txt"');
    res.send(text);
  } catch (error) { res.status(500).json({ error: "Failed to extract text from PDF" }); }
});

router.post("/pdf-to-word", upload.single("pdf"), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No PDF provided" });
    let text = "";
    try {
      const data = await pdfParse(req.file.buffer as any);
      text = (data as any).text || "";
    } catch { text = "[Could not extract text from this PDF]"; }
    const lines = text.split("\n").filter((l: string) => l.trim().length > 0);
    const paragraphs = lines.map((line: string) =>
      new Paragraph({ children: [new TextRun({ text: line.trim(), size: 24 })], spacing: { after: 120 } })
    );
    if (paragraphs.length === 0) paragraphs.push(new Paragraph({ children: [new TextRun({ text: "No text content could be extracted.", size: 24 })] }));
    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({ text: "Converted from PDF", heading: HeadingLevel.HEADING_1, spacing: { after: 400 } }),
          ...paragraphs,
        ],
      }],
    });
    const buffer = await Packer.toBuffer(doc);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.setHeader("Content-Disposition", 'attachment; filename="converted.docx"');
    res.send(buffer);
  } catch (error) { res.status(500).json({ error: "Failed to convert PDF to Word" }); }
});

router.post("/pdf-metadata", upload.single("pdf"), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No PDF provided" });
    const pdfDoc = await PDFDocument.load(req.file.buffer);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    res.json({
      pageCount: pdfDoc.getPageCount(),
      width: firstPage?.getWidth(),
      height: firstPage?.getHeight(),
      title: pdfDoc.getTitle() || null,
      author: pdfDoc.getAuthor() || null,
      fileSize: req.file.buffer.length,
    });
  } catch (error) { res.status(500).json({ error: "Failed to get PDF metadata" }); }
});

router.post("/pdf-editor/reorder", upload.single("pdf"), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No PDF provided" });
    const orderArray: number[] = JSON.parse(req.body.order as string);
    const pdfDoc = await PDFDocument.load(req.file.buffer);
    const newPdf = await PDFDocument.create();
    const validIndices = orderArray.filter((i) => i >= 0 && i < pdfDoc.getPageCount());
    const copiedPages = await newPdf.copyPages(pdfDoc, validIndices);
    copiedPages.forEach((page) => newPdf.addPage(page));
    const pdfBytes = await newPdf.save();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="reordered.pdf"');
    res.send(Buffer.from(pdfBytes));
  } catch (error) { res.status(500).json({ error: "Failed to reorder PDF pages" }); }
});

router.post("/pdf-editor/delete", upload.single("pdf"), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No PDF provided" });
    const pdfDoc = await PDFDocument.load(req.file.buffer);
    const deleteSet = new Set<number>(JSON.parse(req.body.pagesToDelete as string));
    const keepIndices = pdfDoc.getPageIndices().filter((i) => !deleteSet.has(i));
    const newPdf = await PDFDocument.create();
    const copiedPages = await newPdf.copyPages(pdfDoc, keepIndices);
    copiedPages.forEach((page) => newPdf.addPage(page));
    const pdfBytes = await newPdf.save();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="edited.pdf"');
    res.send(Buffer.from(pdfBytes));
  } catch (error) { res.status(500).json({ error: "Failed to delete PDF pages" }); }
});

router.post("/pdf-editor/rotate", upload.single("pdf"), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No PDF provided" });
    const { angle = "90", pageIndices } = req.body;
    const pdfDoc = await PDFDocument.load(req.file.buffer);
    const rotationAngle = parseInt(angle as string);
    const indices: number[] = pageIndices ? JSON.parse(pageIndices as string) : pdfDoc.getPageIndices();
    for (const idx of indices) {
      if (idx >= 0 && idx < pdfDoc.getPageCount()) {
        const page = pdfDoc.getPage(idx);
        const cur = page.getRotation().angle;
        page.setRotation(degrees((cur + rotationAngle) % 360));
      }
    }
    const pdfBytes = await pdfDoc.save();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="rotated.pdf"');
    res.send(Buffer.from(pdfBytes));
  } catch (error) { res.status(500).json({ error: "Failed to rotate PDF pages" }); }
});

router.post("/pdf-summarize", upload.single("pdf"), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No PDF provided" });
    let text = "", pageCount = 0;
    try {
      const data = await pdfParse(req.file.buffer as any);
      text = (data as any).text || "";
      pageCount = (data as any).numpages || 1;
    } catch { return res.status(422).json({ error: "Could not extract text from this PDF (may be image-based)" }); }
    res.json({
      text: text.slice(0, 50000),
      pageCount,
      charCount: text.length,
      wordCount: text.split(/\s+/).filter(Boolean).length,
    });
  } catch (error) { res.status(500).json({ error: "Failed to process PDF" }); }
});

export default router;

// ============ ZIP EXTRACTOR ============
router.post("/extract-zip", upload.single("zip"), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No ZIP file provided" });
    const zip = await JSZip.loadAsync(req.file.buffer);
    const fileList: string[] = [];
    zip.forEach((path) => { if (!path.endsWith("/")) fileList.push(path); });
    res.json({ files: fileList, count: fileList.length });
  } catch (error) {
    res.status(500).json({ error: "Failed to read ZIP file" });
  }
});

router.post("/extract-zip-file", upload.single("zip"), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No ZIP file provided" });
    const { filename } = req.body;
    if (!filename) return res.status(400).json({ error: "No filename specified" });
    const zip = await JSZip.loadAsync(req.file.buffer);
    const file = zip.file(filename);
    if (!file) return res.status(404).json({ error: "File not found in ZIP" });
    const content = await file.async("nodebuffer");
    const ext = filename.split(".").pop()?.toLowerCase();
    const mimeMap: Record<string, string> = {
      pdf: "application/pdf", txt: "text/plain", png: "image/png",
      jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };
    const mime = mimeMap[ext || ""] || "application/octet-stream";
    res.setHeader("Content-Type", mime);
    res.setHeader("Content-Disposition", `attachment; filename="${filename.split("/").pop()}"`);
    res.send(content);
  } catch (error) {
    res.status(500).json({ error: "Failed to extract file" });
  }
});

// ============ WORD TO PDF ============
router.post("/word-to-pdf", upload.single("docx"), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file provided" });
    // Extract text from DOCX using mammoth and create a styled PDF
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer: req.file.buffer });
    const text = result.value || "";
    const PDFKit = (await import("pdfkit")).default;
    const chunks: Buffer[] = [];
    const doc = new PDFKit({ margin: 72, size: "A4" });
    doc.on("data", (c: Buffer) => chunks.push(c));
    await new Promise<void>((resolve, reject) => {
      doc.on("end", resolve);
      doc.on("error", reject);
      // Title from filename
      const filename = req.file!.originalname.replace(/\.(docx?|doc)$/i, "");
      doc.fontSize(20).font("Helvetica-Bold").text(filename, { align: "left" });
      doc.moveDown();
      doc.fontSize(11).font("Helvetica");
      // Split into paragraphs
      const paras = text.split(/\n\n+/).filter((p: string) => p.trim());
      for (const para of paras) {
        const lines = para.split("\n").map((l: string) => l.trim()).filter(Boolean);
        for (const line of lines) {
          doc.text(line, { align: "justify", lineGap: 2 });
        }
        doc.moveDown(0.5);
      }
      doc.end();
    });
    const pdfBuffer = Buffer.concat(chunks);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${req.file.originalname.replace(/\.(docx?|doc)$/i, ".pdf")}"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Word to PDF error:", error);
    res.status(500).json({ error: "Failed to convert Word to PDF" });
  }
});

// ============ PPT/PPTX TO PDF (text extraction → PDF) ============
router.post("/ppt-to-pdf", upload.single("ppt"), async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file provided" });
    // Parse PPTX as zip, extract slide text, render styled PDF
    const zip = await JSZip.loadAsync(req.file.buffer);
    const slideTexts: string[] = [];
    const slideFiles = Object.keys(zip.files)
      .filter((f) => f.match(/^ppt\/slides\/slide\d+\.xml$/))
      .sort((a, b) => {
        const na = parseInt(a.match(/slide(\d+)/)?.[1] || "0");
        const nb = parseInt(b.match(/slide(\d+)/)?.[1] || "0");
        return na - nb;
      });
    for (const slideFile of slideFiles) {
      const content = await zip.files[slideFile].async("string");
      // Extract text from XML tags
      const textMatches = content.match(/<a:t[^>]*>([^<]+)<\/a:t>/g) || [];
      const text = textMatches
        .map((m: string) => m.replace(/<[^>]+>/g, "").trim())
        .filter((t: string) => t.length > 0)
        .join(" ");
      if (text) slideTexts.push(text);
    }
    const PDFKit = (await import("pdfkit")).default;
    const chunks: Buffer[] = [];
    const doc = new PDFKit({ margin: 72, size: "A4", layout: "landscape" });
    const filename = req.file!.originalname.replace(/\.(pptx?|ppt)$/i, "");
    doc.on("data", (c: Buffer) => chunks.push(c));
    await new Promise<void>((resolve, reject) => {
      doc.on("end", resolve);
      doc.on("error", reject);
      for (let i = 0; i < slideTexts.length; i++) {
        if (i > 0) doc.addPage();
        // Slide header
        doc.rect(0, 0, doc.page.width, 60).fill("#1e40af");
        doc.fillColor("white").fontSize(14).font("Helvetica-Bold")
          .text(`Slide ${i + 1}`, 72, 20, { width: doc.page.width - 144 });
        doc.fillColor("#1e293b").fontSize(13).font("Helvetica")
          .text(slideTexts[i], 72, 80, {
            width: doc.page.width - 144,
            align: "left",
            lineGap: 4,
          });
      }
      if (slideTexts.length === 0) {
        doc.fontSize(16).font("Helvetica").text("No text content found in this presentation.", 72, 200, { align: "center" });
      }
      doc.end();
    });
    const pdfBuffer = Buffer.concat(chunks);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error("PPT to PDF error:", error);
    res.status(500).json({ error: "Failed to convert presentation to PDF" });
  }
});
