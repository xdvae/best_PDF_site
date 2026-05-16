import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";

// ── Per-route SEO meta — what Google sees in raw HTML ───────────────────────
const ROUTE_META: Record<string, { title: string; description: string }> = {
  "/": {
    title: "OmniPDF — Free Online PDF Tools: Merge, Compress, Convert, Edit",
    description: "Free PDF tools online — merge PDF, compress PDF, convert PDF to Word, PDF to JPG, split PDF, edit PDF and more. No sign up, no ads, no watermarks. Used by millions.",
  },
  "/merge-pdf": {
    title: "Merge PDF Online Free — Combine Multiple PDFs Into One | OmniPDF",
    description: "Merge multiple PDF files into one document online free. No sign up, no watermarks. Drag to reorder, combine PDFs instantly. Used by millions.",
  },
  "/split-pdf": {
    title: "Split PDF Online Free — Extract Pages from PDF | OmniPDF",
    description: "Split PDF files online free. Extract specific page ranges from any PDF. No sign up, no ads, no watermarks. Files deleted after splitting.",
  },
  "/compress-pdf": {
    title: "Compress PDF Online Free — Reduce PDF File Size Instantly | OmniPDF",
    description: "Compress PDF files online free. Reduce PDF file size without losing quality. No sign up, no watermarks, no ads. Choose compression level.",
  },
  "/pdf-to-images": {
    title: "PDF to JPG Converter Free — Convert PDF Pages to Images | OmniPDF",
    description: "Convert PDF pages to JPG or PNG images online free. No sign up, no ads, no watermarks. All pages exported as images in a ZIP download.",
  },
  "/pdf-to-text": {
    title: "PDF to Text Converter Free — Extract Text from PDF Online | OmniPDF",
    description: "Extract text from PDF files online free. Convert PDF to plain text (.txt) with one click. No sign up, no ads, no watermarks. Files deleted instantly.",
  },
  "/pdf-to-docx": {
    title: "PDF to Word Converter Free — Convert PDF to DOCX Online | OmniPDF",
    description: "Convert PDF to Word (DOCX) online free. No sign up, no ads, no watermarks. Editable Word document from any PDF. Files deleted after conversion.",
  },
  "/images-to-pdf": {
    title: "Images to PDF Converter — Convert JPG PNG WebP to PDF Free | OmniPDF",
    description: "Convert JPG, PNG, WebP images to PDF online free. Drag to reorder pages, rotate images, merge multiple photos into one PDF. No signup, no watermarks.",
  },
  "/word-to-pdf": {
    title: "Word to PDF Converter Free — Convert DOCX to PDF Online | OmniPDF",
    description: "Convert Word documents (DOC, DOCX) to PDF online free. No sign up, no ads, no watermarks. Formatting preserved. Instant PDF download.",
  },
  "/ppt-to-pdf": {
    title: "PowerPoint to PDF Converter Free — Convert PPTX to PDF | OmniPDF",
    description: "Convert PowerPoint (PPT, PPTX) to PDF online free. No sign up, no ads, no watermarks. Each slide becomes a PDF page. Instant download.",
  },
  "/pdf-editor": {
    title: "Free PDF Editor Online — Reorder, Delete & Rotate PDF Pages | OmniPDF",
    description: "Edit PDF files online free. Reorder pages, delete pages, rotate pages. No sign up, no ads, no watermarks. Fast PDF editor trusted by millions.",
  },
  "/pdf-summarizer": {
    title: "AI PDF Summarizer Free — Summarize & Chat with PDFs Online | OmniPDF",
    description: "Summarize PDF documents with AI online free. Get instant AI-powered summaries of any PDF. No sign up, no ads, no watermarks.",
  },
  "/p2p-transfer": {
    title: "Send Files Free — P2P File Transfer, No Upload, No Sign Up | OmniPDF",
    description: "Send files between devices free. P2P file transfer — no server upload, no account, no size limits. Share files instantly via a 6-character code.",
  },
  "/zip-extractor": {
    title: "ZIP Extractor Online Free — Open & Extract ZIP Files | OmniPDF",
    description: "Extract and download files from ZIP archives online free. View ZIP contents, download individual files. No sign up, no software needed.",
  },
};

function injectMeta(html: string, pathname: string): string {
  const meta = ROUTE_META[pathname] || ROUTE_META["/"];
  const canonical = `https://omnipdf.xyz${pathname === "/" ? "/" : pathname}`;
  return html
    .replace(/<title>[^<]*<\/title>/, `<title>${meta.title}</title>`)
    .replace(/(<meta\s+name="title"\s+content=")[^"]*(")/,        `$1${meta.title}$2`)
    .replace(/(<meta\s+name="description"\s+content=")[^"]*(")/,  `$1${meta.description}$2`)
    .replace(/(<link\s+rel="canonical"\s+href=")[^"]*(")/,        `$1${canonical}$2`)
    .replace(/(<meta\s+property="og:url"\s+content=")[^"]*(")/,   `$1${canonical}$2`)
    .replace(/(<meta\s+property="og:title"\s+content=")[^"]*(")/,         `$1${meta.title}$2`)
    .replace(/(<meta\s+property="og:description"\s+content=")[^"]*(")/,   `$1${meta.description}$2`)
    .replace(/(<meta\s+name="twitter:url"\s+content=")[^"]*(")/,          `$1${canonical}$2`)
    .replace(/(<meta\s+name="twitter:title"\s+content=")[^"]*(")/,        `$1${meta.title}$2`)
    .replace(/(<meta\s+name="twitter:description"\s+content=")[^"]*(")/,  `$1${meta.description}$2`);
}
// ────────────────────────────────────────────────────────────────────────────

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      let page = await vite.transformIndexHtml(url, template);
      // Inject per-route title + description so crawlers see unique meta in raw HTML
      const pathname = url.split("?")[0].split("#")[0] || "/";
      page = injectMeta(page, pathname);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath =
    process.env.NODE_ENV === "development"
      ? path.resolve(import.meta.dirname, "../..", "dist", "public")
      : path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (req, res) => {
    const pathname = req.path || "/";
    let html = fs.readFileSync(path.resolve(distPath, "index.html"), "utf-8");
    html = injectMeta(html, pathname);
    res.set("Content-Type", "text/html").send(html);
  });
}

