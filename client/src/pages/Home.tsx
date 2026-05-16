import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  FileText,
  Zap,
  Shield,
  Download,
  Merge,
  Scissors,
  Minimize2,
  Image,
  Type,
  FileCode,
  Sparkles,
  Wifi,
  ChevronRight,
  Edit3,
  Moon,
  Sun,
  FileType,
  Presentation,
  Archive,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const tools = [
  {
    icon: Image,
    title: "Images to PDF",
    description: "Arrange and rotate images before converting to a single PDF",
    href: "/images-to-pdf",
    color: "from-cyan-500 to-cyan-600",
  },
  {
    icon: Merge,
    title: "Merge PDF",
    description: "Combine multiple PDFs and Word documents into one seamless file",
    href: "/merge-pdf",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: Minimize2,
    title: "Compress PDF",
    description: "Reduce file size while maintaining quality with smart compression",
    href: "/compress-pdf",
    color: "from-emerald-500 to-emerald-600",
  },
  {
    icon: Image,
    title: "PDF to Images",
    description: "Convert PDF pages to JPG or PNG images in a ZIP file",
    href: "/pdf-to-images",
    color: "from-orange-500 to-orange-600",
  },
  {
    icon: Scissors,
    title: "Split PDF",
    description: "Extract specific pages or divide large PDFs into smaller sections",
    href: "/split-pdf",
    color: "from-purple-500 to-purple-600",
  },
  {
    icon: FileCode,
    title: "PDF to Word",
    description: "Convert PDFs to editable DOCX documents with formatting preserved",
    href: "/pdf-to-docx",
    color: "from-indigo-500 to-indigo-600",
  },
  {
    icon: Type,
    title: "PDF to Text",
    description: "Extract text content from PDFs as plain text files",
    href: "/pdf-to-text",
    color: "from-pink-500 to-pink-600",
  },
  {
    icon: Edit3,
    title: "PDF Editor",
    description: "Reorder, delete, rotate pages and manage your PDF documents easily",
    href: "/pdf-editor",
    color: "from-teal-500 to-teal-600",
  },
  {
    icon: Sparkles,
    title: "AI Summarizer",
    description: "Get AI-powered summaries and chat with your PDF documents",
    href: "/pdf-summarizer",
    color: "from-amber-500 to-amber-600",
  },
  {
    icon: Wifi,
    title: "P2P Transfer",
    description: "Transfer files directly between devices using peer-to-peer technology",
    href: "/p2p-transfer",
    color: "from-rose-500 to-rose-600",
  },
  {
    icon: FileType,
    title: "Word to PDF",
    description: "Convert DOC and DOCX Word documents to PDF instantly",
    href: "/word-to-pdf",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: Presentation,
    title: "PPT to PDF",
    description: "Convert PowerPoint presentations to PDF, slide by slide",
    href: "/ppt-to-pdf",
    color: "from-orange-500 to-orange-600",
  },
  {
    icon: Archive,
    title: "ZIP Extractor",
    description: "Open ZIP files and download individual files or extract all",
    href: "/zip-extractor",
    color: "from-purple-500 to-purple-600",
  },
];

const faqs = [
  {
    question: "Is my data secure? Do you store my files?",
    answer:
      "Your privacy is our priority. All file processing happens directly in your browser—files never leave your device or are uploaded to our servers. We don't store, track, or analyze your documents. Once you close the tab, everything is gone.",
  },
  {
    question: "Do I need to create an account?",
    answer:
      "No account required! OmniPDF is completely free and works without registration. Simply visit the tool you need and start processing your files immediately.",
  },
  {
    question: "What file formats do you support?",
    answer:
      "We support PDF, Word documents (DOCX), images (JPG, PNG, GIF), and more. Each tool is optimized for specific formats—check the tool page for detailed format support.",
  },
  {
    question: "Are there file size limits?",
    answer:
      "Most tools handle files up to 100MB. For very large files, we recommend splitting them first. Check individual tool pages for specific limits.",
  },
  {
    question: "Can I use OmniPDF offline?",
    answer:
      "Yes! Once the page loads, most tools work offline since processing happens in your browser. However, the AI Summarizer requires an internet connection.",
  },
  {
    question: "Is OmniPDF free?",
    answer:
      "Absolutely! All tools are 100% free with no hidden fees, watermarks, or premium tiers. We believe PDF tools should be accessible to everyone.",
  },
];

export default function Home() {
  const [, setLocation] = useLocation();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    // Set SEO meta tags
    document.title = "OmniPDF - Free AI-Powered PDF Tools | Merge, Split, Convert & Summarize";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Free online PDF tools: merge, split, compress, convert to images/text/Word, and AI-powered summarization. 100% browser-based, no uploads, completely private."
      );
    }

    // Add JSON-LD structured data
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.innerHTML = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "OmniPDF",
      description: "Free AI-powered PDF tools for merging, splitting, converting, and summarizing PDFs",
      url: "https://omnipdf.xyz",
      logo: "https://omnipdf.xyz/logo.png",
      sameAs: [
        "https://twitter.com/omnipdf",
        "https://facebook.com/omnipdf",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "Customer Support",
        email: "support@omnipdf.xyz",
      },
    });
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-slate-900">OmniPDF</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#tools" className="text-slate-600 hover:text-slate-900 transition">
              Tools
            </a>
            <a href="#faq" className="text-slate-600 hover:text-slate-900 transition">
              FAQ
            </a>
            <a href="/p2p-transfer" className="text-slate-600 hover:text-slate-900 transition">
              Send Files
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="space-y-6">
          <div className="inline-block px-4 py-2 bg-blue-100 rounded-full">
            <span className="text-sm font-semibold text-blue-700">✨ Powered by AI & Privacy-First</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight">
            The Ultimate PDF Toolkit
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Merge, split, compress, convert, and summarize PDFs with AI. All processing happens in your browser—your files never leave your device.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              size="lg"
              onClick={() => document.getElementById("tools")?.scrollIntoView({ behavior: "smooth" })}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Start Using Tools <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => document.getElementById("tools")?.scrollIntoView({ behavior: "smooth" })}
            >
              Explore All Tools
            </Button>
          </div>
        </div>

        {/* Trust Signals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 pt-12 border-t border-slate-200">
          <div className="flex flex-col items-center gap-3">
            <Shield className="w-8 h-8 text-emerald-600" />
            <div>
              <p className="font-semibold text-slate-900">100% Private</p>
              <p className="text-sm text-slate-600">No uploads, no tracking, no data collection</p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-3">
            <Zap className="w-8 h-8 text-amber-600" />
            <div>
              <p className="font-semibold text-slate-900">Lightning Fast</p>
              <p className="text-sm text-slate-600">Browser-based processing, instant results</p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-3">
            <Download className="w-8 h-8 text-blue-600" />
            <div>
              <p className="font-semibold text-slate-900">Always Free</p>
              <p className="text-sm text-slate-600">No watermarks, no premium tier, no ads</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section id="tools" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Powerful PDF Tools</h2>
          <p className="text-lg text-slate-600">
            Everything you need to work with PDFs, all in one place
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Card
                key={tool.href}
                className="hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => setLocation(tool.href)}
              >
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{tool.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">{tool.description}</CardDescription>
                  <div className="mt-4 inline-flex items-center text-blue-600 group-hover:gap-2 transition-all">
                    <span className="text-sm font-medium">Get Started</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-lg text-slate-600">
            Everything you need to know about OmniPDF
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border border-slate-200 rounded-lg px-6">
              <AccordionTrigger className="text-left font-semibold text-slate-900 hover:text-blue-600">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 pt-2">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to get started?</h2>
          <p className="text-lg text-blue-100 mb-8">
            No account needed. Start processing your PDFs right now.
          </p>
          <Button
            size="lg"
            onClick={() => setLocation("/merge-pdf")}
            className="bg-white text-blue-600 hover:bg-slate-100"
          >
            Try OmniPDF Now <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-6 h-6 text-blue-400" />
                <span className="text-lg font-bold text-white">OmniPDF</span>
              </div>
              <p className="text-sm">The ultimate PDF toolkit for everyone.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Tools</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/merge-pdf" className="hover:text-white transition">Merge PDF</a></li>
                <li><a href="/split-pdf" className="hover:text-white transition">Split PDF</a></li>
                <li><a href="/compress-pdf" className="hover:text-white transition">Compress PDF</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">More Tools</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/pdf-editor" className="hover:text-white transition">PDF Editor</a></li>
                <li><a href="/pdf-summarizer" className="hover:text-white transition">AI Summarizer</a></li>
                <li><a href="/p2p-transfer" className="hover:text-white transition">Send Files Free</a></li>
                <li><a href="/zip-extractor" className="hover:text-white transition">ZIP Extractor</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/privacy" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-white transition">Terms of Service</a></li>
                <li><a href="mailto:hello@omnipdf.xyz" className="hover:text-white transition">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm">
            <p>&copy; 2026 OmniPDF. All rights reserved. Built with privacy first.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
