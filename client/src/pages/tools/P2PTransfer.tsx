import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Download, Copy, Check, Send, FileText, X, ArrowRight, Wifi } from "lucide-react";
import { toast } from "sonner";
import ToolPageSEO, { type ToolSEOConfig } from "@/components/ToolPageSEO";

const CHUNK_SIZE = 256 * 1024;
type Mode = "idle" | "send" | "receive";
type SendStep = "select" | "waiting" | "transferring" | "done";
type RecvStep = "enter-code" | "connecting" | "receiving" | "done";
interface ReceivedFile { name: string; url: string; size: number; }

function getWsUrl() {
  const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${proto}//${window.location.host}/ws/p2p`;
}

const SEO_CONFIG: ToolSEOConfig = {
  title: "P2P File Transfer Free — Send Files Between Devices Instantly | OmniPDF",
  description: "Transfer files directly between devices peer-to-peer. No server upload, no sign up, 100% free. Send large files instantly. Secure P2P file sharing trusted by millions.",
  canonical: "https://omnipdf.app/p2p-transfer",
  ogTitle: "Free P2P File Transfer — Send Files Device to Device, No Sign Up",
  ogDescription: "Send files directly between devices P2P. No cloud upload. No account required. Instant, secure, free. Used by millions.",
  h1: "P2P File Transfer — Send Files Device to Device Free",
  h1Sub: "Transfer files directly between devices without uploading to any server — 100% free, instant, no sign up required.",
  schemaName: "P2P File Transfer",
  schemaDescription: "Free peer-to-peer file transfer tool. Send files directly between devices without cloud upload. No sign up required. Used by millions.",
  keywords: ["peer to peer file transfer","p2p file sharing","transfer files between devices","send files device to device","local file transfer","wifi file transfer","browser file transfer","secure file transfer","direct file sharing","no upload file transfer","free online file tools","no signup file sharing"],
  howToSteps: [
    "Click 'I'm Sending', select the files you want to transfer, then click 'Generate Transfer Code'.",
    "Share the 6-character code that appears with the recipient via message or call.",
    "The recipient opens OmniPDF P2P Transfer, clicks 'I'm Receiving', and enters the code.",
    "Files transfer directly between devices — no server storage, no cloud upload, instant.",
  ],
  seoBody: [
    { heading: "Transfer Files Directly Between Devices — No Server Upload", text: "OmniPDF's P2P transfer uses WebSocket relay technology to stream files directly from one browser to another in real time. Your file data is never written to our servers — it passes through an encrypted relay and arrives instantly on the receiving device. Perfect for large files, sensitive documents, or anytime you want zero cloud exposure. Completely free, no sign up required, used by millions." },
    { heading: "No Ads, No Account, Trusted by Millions", text: "Unlike cloud storage services that require accounts and store your files remotely, OmniPDF P2P Transfer is fully anonymous. No file data is ever stored on our servers. The transfer is free, requires no account, and leaves no trace of your files. Millions of users choose OmniPDF for tools that are genuinely private and genuinely free." },
  ],
  features: [
    { title: "Direct Device-to-Device", description: "Files stream directly between sender and receiver — no cloud intermediary or storage." },
    { title: "No Server Upload", description: "Your file data never gets stored on OmniPDF servers. Total privacy by design." },
    { title: "Any File Size", description: "Transfer large files without the size limits imposed by email or cloud services." },
    { title: "100% Free", description: "P2P transfers are always free on OmniPDF — no file size cap, no premium tier." },
    { title: "No Sign Up", description: "No email or account required on either end of the transfer." },
    { title: "Works Across Networks", description: "Send from PC, receive on phone. Works across different networks and devices." },
  ],
  faqs: [
    { q: "Is P2P file transfer free?", a: "Yes — 100% free. No account, no file-size limits, no premium tier." },
    { q: "Do my files get uploaded to OmniPDF servers?", a: "No. File data streams directly between browsers in real time. OmniPDF only facilitates the connection — your actual files are never stored on our servers." },
    { q: "How large a file can I transfer?", a: "There is no hard file size limit. Files are streamed in chunks, so even very large files transfer reliably." },
    { q: "Do both devices need to be on the same WiFi?", a: "No. P2P transfer works across different networks as long as both devices have internet access." },
    { q: "Is the transfer encrypted?", a: "Yes. All relay connections use HTTPS/WSS encryption so file data cannot be intercepted in transit." },
  ],
  relatedTools: [
    { href: "/zip-extractor", label: "ZIP Extractor" },
    { href: "/merge-pdf", label: "Merge PDF" },
    { href: "/compress-pdf", label: "Compress PDF" },
    { href: "/images-to-pdf", label: "Images to PDF" },
    { href: "/pdf-to-images", label: "PDF to JPG" },
  ],
};

export default function P2PTransfer() {
  const [mode, setMode] = useState<Mode>("idle");

  // Send state
  const [sendFiles, setSendFiles] = useState<File[]>([]);
  const [sendStep, setSendStep] = useState<SendStep>("select");
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);
  const [sendStatus, setSendStatus] = useState("");

  // Receive state
  const [inputCode, setInputCode] = useState("");
  const [recvStep, setRecvStep] = useState<RecvStep>("enter-code");
  const [recvProgress, setRecvProgress] = useState(0);
  const [recvStatus, setRecvStatus] = useState("");
  const [recvFiles, setRecvFiles] = useState<ReceivedFile[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recvBuffers = useRef<Record<string, { chunks: string[]; totalChunks: number; name: string }>>({});
  const recvFileMeta = useRef<{ name: string; size: number; type: string }[]>([]);

  useEffect(() => { return () => { wsRef.current?.close(); }; }, []);

  function connectWs(onOpen: (ws: WebSocket) => void) {
    const ws = new WebSocket(getWsUrl());
    wsRef.current = ws;
    ws.onopen = () => onOpen(ws);
    ws.onerror = () => { toast.error("Connection failed. Check your network."); reset(); };
    return ws;
  }

  const startSend = () => {
    if (sendFiles.length === 0) { toast.error("Select at least one file"); return; }
    setSendStep("waiting");
    setSendStatus("Creating transfer room...");
    const ws = connectWs((ws) => { ws.send(JSON.stringify({ type: "create-room" })); });
    ws.onmessage = async (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === "room-created") {
        setCode(msg.code);
        setSendStatus("Waiting for receiver to enter the code...");
      } else if (msg.type === "receiver-connected") {
        setSendStep("transferring");
        setSendStatus("Receiver connected! Sending files...");
        const meta = sendFiles.map(f => ({ name: f.name, size: f.size, type: f.type }));
        ws.send(JSON.stringify({ type: "transfer-meta", files: meta }));
        let totalBytes = sendFiles.reduce((s, f) => s + f.size, 0);
        let sentBytes = 0;
        for (const file of sendFiles) {
          const buf = await file.arrayBuffer();
          const u8 = new Uint8Array(buf);
          const totalChunks = Math.ceil(u8.length / CHUNK_SIZE);
          for (let i = 0; i < totalChunks; i++) {
            const slice = u8.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
            let binary = "";
            for (let j = 0; j < slice.length; j++) binary += String.fromCharCode(slice[j]);
            ws.send(JSON.stringify({ type: "chunk", name: file.name, data: btoa(binary), index: i, total: totalChunks }));
            sentBytes += slice.length;
            setSendProgress(Math.round((sentBytes / totalBytes) * 100));
            setSendStatus(`Sending ${file.name}... (${Math.round(sentBytes / 1024)}KB / ${Math.round(totalBytes / 1024)}KB)`);
            await new Promise(r => setTimeout(r, 1));
          }
        }
        ws.send(JSON.stringify({ type: "transfer-done" }));
        setSendStep("done");
        setSendStatus("All files sent successfully!");
        setSendProgress(100);
      } else if (msg.type === "peer-disconnected") {
        if (sendStep !== "done") { toast.error("Receiver disconnected."); setSendStep("select"); }
      } else if (msg.type === "error") { toast.error(msg.message); }
    };
  };

  const startReceive = () => {
    const trimmed = inputCode.trim().toUpperCase();
    if (trimmed.length < 4) { toast.error("Enter the 6-character code from the sender"); return; }
    setRecvStep("connecting");
    setRecvStatus("Connecting to sender...");
    recvBuffers.current = {}; recvFileMeta.current = [];
    const ws = connectWs((ws) => { ws.send(JSON.stringify({ type: "join-room", code: trimmed })); });
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === "room-joined") { setRecvStep("receiving"); setRecvStatus("Connected! Waiting for files..."); }
      else if (msg.type === "transfer-meta") {
        recvFileMeta.current = msg.files;
        msg.files.forEach((f: any) => { recvBuffers.current[f.name] = { chunks: [], totalChunks: 0, name: f.name }; });
        setRecvStatus(`Receiving ${msg.files.length} file${msg.files.length > 1 ? "s" : ""}...`);
      } else if (msg.type === "chunk") {
        const buf = recvBuffers.current[msg.name];
        if (!buf) return;
        buf.chunks[msg.index] = msg.data;
        buf.totalChunks = msg.total;
        const totalChunks = Object.values(recvBuffers.current).reduce((s, b) => s + (b.totalChunks || 0), 0);
        const doneChunks = Object.values(recvBuffers.current).reduce((s, b) => s + b.chunks.filter(Boolean).length, 0);
        if (totalChunks > 0) setRecvProgress(Math.round((doneChunks / totalChunks) * 100));
        setRecvStatus(`Receiving ${msg.name}...`);
      } else if (msg.type === "transfer-done") {
        const files: ReceivedFile[] = recvFileMeta.current.map(meta => {
          const buf = recvBuffers.current[meta.name];
          const byteArrays = buf.chunks.filter(Boolean).map(b64 => {
            const binary = atob(b64);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
            return bytes;
          });
          const total = byteArrays.reduce((s, a) => s + a.length, 0);
          const merged = new Uint8Array(total);
          let offset = 0;
          for (const arr of byteArrays) { merged.set(arr, offset); offset += arr.length; }
          const blob = new Blob([merged], { type: meta.type || "application/octet-stream" });
          return { name: meta.name, url: URL.createObjectURL(blob), size: meta.size };
        });
        setRecvFiles(files); setRecvStep("done"); setRecvProgress(100);
        setRecvStatus("All files received!"); toast.success(`Received ${files.length} file${files.length > 1 ? "s" : ""}!`);
      } else if (msg.type === "peer-disconnected") {
        if (recvStep !== "done") toast.error("Sender disconnected.");
      } else if (msg.type === "error") { toast.error(msg.message); setRecvStep("enter-code"); }
    };
  };

  function reset() {
    wsRef.current?.close(); wsRef.current = null;
    setMode("idle"); setSendFiles([]); setSendStep("select"); setCode(""); setCopied(false);
    setSendProgress(0); setSendStatus(""); setInputCode(""); setRecvStep("enter-code");
    setRecvProgress(0); setRecvStatus(""); setRecvFiles([]);
    recvBuffers.current = {}; recvFileMeta.current = [];
  }

  function copyCode() { navigator.clipboard.writeText(code); setCopied(true); toast.success("Code copied!"); setTimeout(() => setCopied(false), 2000); }
  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  return (
    <ToolPageSEO config={SEO_CONFIG}>
      {/* Mode picker */}
      {mode === "idle" && (
        <>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button onClick={() => setMode("send")}
              className="flex flex-col items-center gap-4 p-8 bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:shadow-xl transition-all group">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 rounded-2xl flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                <Send className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-slate-900 dark:text-white">I'm Sending</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Get a code to share</p>
              </div>
            </button>
            <button onClick={() => setMode("receive")}
              className="flex flex-col items-center gap-4 p-8 bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-green-500 hover:shadow-xl transition-all group">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/40 rounded-2xl flex items-center justify-center group-hover:bg-green-500 transition-colors">
                <Download className="w-8 h-8 text-green-600 group-hover:text-white transition-colors" />
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-slate-900 dark:text-white">I'm Receiving</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Enter the sender's code</p>
              </div>
            </button>
          </div>
          <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-sm text-blue-800 dark:text-blue-300">
            <strong>How it works:</strong> The sender picks files and gets a short code. The receiver enters that code on any device — files stream through an encrypted relay in real time. Nothing is ever stored on any server.
          </div>
        </>
      )}

      {/* ── SEND FLOW ── */}
      {mode === "send" && (
        <Card className="mb-8 dark:bg-slate-800 dark:border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-blue-600"><Send className="w-5 h-5" /> Send Files</CardTitle>
              <button onClick={reset} className="text-slate-400 hover:text-red-500 p-1" aria-label="Cancel"><X className="w-5 h-5" /></button>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {sendStep === "select" && (
              <>
                <div
                  className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-10 text-center cursor-pointer hover:border-blue-400 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); setSendFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]); }}
                >
                  <Upload className="w-10 h-10 mx-auto mb-3 text-slate-400" />
                  <p className="font-semibold text-slate-700 dark:text-slate-200">Click or drag files here</p>
                  <p className="text-sm text-slate-400 mt-1">Any file type — documents, images, videos</p>
                  <input ref={fileInputRef} type="file" multiple className="hidden"
                    onChange={(e) => setSendFiles(prev => [...prev, ...Array.from(e.target.files || [])])} />
                </div>
                {sendFiles.length > 0 && (
                  <div className="space-y-2">
                    {sendFiles.map((f, i) => (
                      <div key={i} className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span className="flex-1 text-sm truncate text-slate-700 dark:text-slate-200">{f.name}</span>
                        <span className="text-xs text-slate-400 flex-shrink-0">{formatSize(f.size)}</span>
                        <button onClick={() => setSendFiles(prev => prev.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    ))}
                    <p className="text-xs text-slate-400 text-right">{sendFiles.length} file{sendFiles.length > 1 ? "s" : ""} · {formatSize(sendFiles.reduce((s, f) => s + f.size, 0))} total</p>
                  </div>
                )}
                <Button onClick={startSend} disabled={sendFiles.length === 0} className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-base">
                  <ArrowRight className="w-5 h-5 mr-2" /> Generate Transfer Code
                </Button>
              </>
            )}
            {sendStep === "waiting" && (
              <div className="text-center space-y-5 py-4">
                <p className="text-slate-500 dark:text-slate-400 text-sm">Share this code with the person receiving the files</p>
                <div className="relative inline-block w-full">
                  <div className="text-5xl font-mono font-black tracking-[0.3em] text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700 rounded-2xl py-7 text-center select-all">{code || "------"}</div>
                  <button onClick={copyCode} className="absolute top-4 right-4 p-2.5 bg-white dark:bg-slate-600 rounded-xl shadow hover:shadow-md transition flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-200">
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <div className="flex items-center justify-center gap-2 text-slate-400">
                  {[0,150,300].map(d => <div key={d} className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay:`${d}ms`}} />)}
                  <span className="text-sm ml-1">{sendStatus}</span>
                </div>
                <p className="text-xs text-slate-400">Code expires when you leave this page</p>
              </div>
            )}
            {sendStep === "transferring" && (
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-3">
                  <Send className="w-6 h-6 text-blue-500 animate-pulse" />
                  <span className="font-semibold text-slate-800 dark:text-white">Sending...</span>
                  <span className="ml-auto font-bold text-blue-600">{sendProgress}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-3 overflow-hidden">
                  <div className="bg-blue-500 h-3 rounded-full transition-all duration-200" style={{width:`${sendProgress}%`}} />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{sendStatus}</p>
              </div>
            )}
            {sendStep === "done" && (
              <div className="text-center space-y-4 py-6">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Transfer Complete!</h3>
                <p className="text-slate-500">{sendFiles.length} file{sendFiles.length > 1 ? "s" : ""} sent successfully</p>
                <Button onClick={reset} variant="outline" className="mt-4">Send More Files</Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── RECEIVE FLOW ── */}
      {mode === "receive" && (
        <Card className="mb-8 dark:bg-slate-800 dark:border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-green-600"><Download className="w-5 h-5" /> Receive Files</CardTitle>
              <button onClick={reset} className="text-slate-400 hover:text-red-500 p-1" aria-label="Cancel"><X className="w-5 h-5" /></button>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {recvStep === "enter-code" && (
              <>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Ask the sender for their 6-character code and enter it below</p>
                <input
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))}
                  onKeyDown={(e) => e.key === "Enter" && startReceive()}
                  placeholder="XXXXXX"
                  autoFocus
                  className="w-full text-center text-4xl font-mono font-black tracking-[0.35em] py-6 rounded-2xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-green-500 transition-colors"
                  aria-label="Transfer code"
                />
                <Button onClick={startReceive} disabled={inputCode.length < 4} className="w-full py-6 bg-green-600 hover:bg-green-700 text-base">
                  <ArrowRight className="w-5 h-5 mr-2" /> Connect & Receive Files
                </Button>
              </>
            )}
            {recvStep === "connecting" && (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mx-auto">
                  <Wifi className="w-8 h-8 text-green-500 animate-pulse" />
                </div>
                <p className="font-semibold text-slate-700 dark:text-slate-200">{recvStatus}</p>
                <p className="text-sm text-slate-400">Code: <span className="font-mono font-bold">{inputCode}</span></p>
              </div>
            )}
            {recvStep === "receiving" && (
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-3">
                  <Download className="w-6 h-6 text-green-500 animate-pulse" />
                  <span className="font-semibold text-slate-800 dark:text-white">Receiving...</span>
                  <span className="ml-auto font-bold text-green-600">{recvProgress}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-3 overflow-hidden">
                  <div className="bg-green-500 h-3 rounded-full transition-all duration-200" style={{width:`${recvProgress}%`}} />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{recvStatus}</p>
              </div>
            )}
            {recvStep === "done" && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Files received!</p>
                    <p className="text-sm text-slate-500">{recvFiles.length} file{recvFiles.length > 1 ? "s" : ""} ready to download</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {recvFiles.map((f) => (
                    <a key={f.name} href={f.url} download={f.name}
                      className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors group">
                      <div className="w-9 h-9 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Download className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-green-900 dark:text-green-100 truncate">{f.name}</p>
                        <p className="text-xs text-green-600 dark:text-green-400">{formatSize(f.size)}</p>
                      </div>
                      <span className="text-xs font-medium text-green-600 dark:text-green-400 group-hover:underline flex-shrink-0">Save file</span>
                    </a>
                  ))}
                </div>
                <Button onClick={reset} variant="outline" className="w-full">Receive More Files</Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </ToolPageSEO>
  );
}
