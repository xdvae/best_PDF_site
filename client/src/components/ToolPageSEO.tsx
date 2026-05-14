import { useEffect } from "react";
import { Zap, ShieldCheck, Users, Star, Ban } from "lucide-react";

export interface ToolSEOConfig {
  title: string;
  description: string;
  canonical: string;
  ogTitle: string;
  ogDescription: string;
  h1: string;
  h1Sub: string;
  schemaName: string;
  schemaDescription: string;
  features: { title: string; description: string }[];
  howToSteps: string[];
  faqs: { q: string; a: string }[];
  relatedTools: { href: string; label: string }[];
  seoBody: { heading: string; text: string }[];
  keywords: string[];
}

interface Props {
  config: ToolSEOConfig;
  children: React.ReactNode;
}

const TRUST_PILLS = [
  { icon: Star,        label: "100% Free",        color: "text-yellow-500" },
  { icon: Ban,         label: "No Ads",            color: "text-red-500"    },
  { icon: ShieldCheck, label: "No Sign Up",        color: "text-green-500"  },
  { icon: Users,       label: "Used by Millions",  color: "text-purple-500" },
  { icon: Zap,         label: "Fastest Online",    color: "text-blue-500"   },
];

export default function ToolPageSEO({ config, children }: Props) {
  useEffect(() => {
    document.title = config.title;
    setMeta("description", config.description);
    setMeta("keywords", config.keywords.join(", "));
    setLink("canonical", config.canonical);

    setOg("og:type", "website");
    setOg("og:title", config.ogTitle);
    setOg("og:description", config.ogDescription);
    setOg("og:url", config.canonical);
    setOg("og:image", "https://omnipdf.app/og-image.png");
    setOg("og:image:width", "1200");
    setOg("og:image:height", "630");
    setOg("og:site_name", "OmniPDF");

    setOg("twitter:card", "summary_large_image");
    setOg("twitter:title", config.ogTitle);
    setOg("twitter:description", config.ogDescription);
    setOg("twitter:image", "https://omnipdf.app/og-image.png");

    const existing = document.querySelector("#tool-jsonld");
    if (existing) existing.remove();
    const script = document.createElement("script");
    script.id = "tool-jsonld";
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(buildSchema(config));
    document.head.appendChild(script);

    return () => { document.querySelector("#tool-jsonld")?.remove(); };
  }, [config]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-700" aria-label="Site navigation">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <a href="/" className="text-xl font-bold text-blue-600 dark:text-blue-400 flex-shrink-0">OmniPDF</a>

          {/* Trust pills in nav bar on large screens */}
          <div className="hidden xl:flex items-center gap-2">
            {TRUST_PILLS.map(({ icon: Icon, label, color }) => (
              <span key={label} className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                <Icon className={`w-3 h-3 ${color}`} />
                {label}
              </span>
            ))}
          </div>

          <a href="/" className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex-shrink-0">← All Tools</a>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-10">

        {/* ── Hero H1 + trust strip ── */}
        <header className="mb-7">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-3 leading-tight">{config.h1}</h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-5">{config.h1Sub}</p>

          {/* Trust badge strip — always visible, right below the H1 */}
          <div className="flex flex-wrap gap-2" role="list" aria-label="OmniPDF guarantees">
            {TRUST_PILLS.map(({ icon: Icon, label, color }) => (
              <div key={label} role="listitem" className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-full shadow-sm">
                <Icon className={`w-3.5 h-3.5 ${color}`} />
                {label}
              </div>
            ))}
          </div>
        </header>

        {/* ── Tool UI slot ── */}
        {children}

        {/* ── SEO content ── */}
        <section className="mt-16 space-y-10 text-slate-700 dark:text-slate-300" aria-label="About this tool">

          {config.seoBody.map(({ heading, text }) => (
            <div key={heading}>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">{heading}</h2>
              <p className="leading-relaxed">{text}</p>
            </div>
          ))}

          {/* ── "Why millions use OmniPDF" highlight block ── */}
          <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-800 p-6">
            <h2 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-1">Why millions of people use OmniPDF</h2>
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-5">The fastest free PDF tools online — no ads, no sign up, no limits.</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: Star,        color: "text-yellow-500", title: "Always 100% free",          desc: "Every tool is free forever — no premium plan, no credit card, no hidden fees." },
                { icon: Ban,         color: "text-red-500",    title: "No ads while you work",     desc: "No pop-ups, no interstitials, no banners interrupting your conversion." },
                { icon: ShieldCheck, color: "text-green-500",  title: "No account or sign up",     desc: "Open any tool and start immediately. We never ask for your email." },
                { icon: Zap,         color: "text-blue-500",   title: "The fastest PDF tools",     desc: "Our optimised servers process files in seconds — not minutes like other tools." },
                { icon: Users,       color: "text-purple-500", title: "Trusted by millions",       desc: "Millions of people worldwide use OmniPDF every month to handle their PDFs." },
                { icon: ShieldCheck, color: "text-teal-500",   title: "Files deleted instantly",   desc: "Your files are processed and permanently deleted from our servers immediately after conversion." },
              ].map(({ icon: Icon, color, title, desc }) => (
                <div key={title} className="flex gap-3">
                  <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${color}`} />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-blue-100 text-sm">{title}</p>
                    <p className="text-xs text-slate-600 dark:text-blue-300/80 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── How To Steps ── */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">How to Use — Step by Step</h2>
            <ol className="space-y-3">
              {config.howToSteps.map((step, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center">{i + 1}</span>
                  <span className="text-slate-700 dark:text-slate-300 pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* ── Features grid ── */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Key Features</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {config.features.map(({ title, description }) => (
                <article key={title} className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
                </article>
              ))}
            </div>
          </div>

          {/* ── FAQ ── */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {config.faqs.map(({ q, a }) => (
                <div key={q} className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{q}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Related tools ── */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">More Free PDF Tools — No Sign Up</h2>
            <div className="flex flex-wrap gap-3">
              {config.relatedTools.map(({ href, label }) => (
                <a key={href} href={href} className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {label}
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="mt-16 border-t border-slate-200 dark:border-slate-700 py-10 bg-white/50 dark:bg-slate-900/50">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
          {/* Trust strip */}
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
            {TRUST_PILLS.map(({ icon: Icon, label, color }) => (
              <span key={label} className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                <Icon className={`w-3.5 h-3.5 ${color}`} />
                {label}
              </span>
            ))}
          </div>
          {/* All-tools link row */}
          <nav className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-slate-400 dark:text-slate-500" aria-label="All tools">
            {[
              ["/merge-pdf","Merge PDF"],["/compress-pdf","Compress PDF"],["/split-pdf","Split PDF"],
              ["/images-to-pdf","Images to PDF"],["/pdf-to-images","PDF to JPG"],["/pdf-to-docx","PDF to Word"],
              ["/word-to-pdf","Word to PDF"],["/ppt-to-pdf","PPT to PDF"],["/pdf-to-text","PDF to Text"],
              ["/pdf-editor","PDF Editor"],["/pdf-summarizer","AI Summarizer"],["/p2p-transfer","P2P Transfer"],
              ["/zip-extractor","ZIP Extractor"],
            ].map(([href, label]) => (
              <a key={href} href={href} className="hover:text-blue-500 transition-colors">{label}</a>
            ))}
          </nav>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            © {new Date().getFullYear()} OmniPDF · Free online PDF tools trusted by millions · 100% free · No ads · No sign up · Files deleted immediately
          </p>
        </div>
      </footer>
    </div>
  );
}

// ── DOM helpers ─────────────────────────────────────────────────────────────

function setMeta(name: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) { el = document.createElement("meta"); el.name = name; document.head.appendChild(el); }
  el.content = content;
}

function setOg(property: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!el) { el = document.createElement("meta"); el.setAttribute("property", property); document.head.appendChild(el); }
  el.content = content;
}

function setLink(rel: string, href: string) {
  let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) { el = document.createElement("link"); el.rel = rel; document.head.appendChild(el); }
  el.href = href;
}

function buildSchema(c: ToolSEOConfig) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": c.canonical,
        "name": c.schemaName,
        "url": c.canonical,
        "description": c.schemaDescription,
        "applicationCategory": "Utility",
        "operatingSystem": "Any",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
        "provider": { "@type": "Organization", "name": "OmniPDF", "url": "https://omnipdf.app" },
        "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "reviewCount": "84200", "bestRating": "5" },
      },
      {
        "@type": "FAQPage",
        "mainEntity": c.faqs.map(({ q, a }) => ({
          "@type": "Question",
          "name": q,
          "acceptedAnswer": { "@type": "Answer", "text": a },
        })),
      },
      {
        "@type": "HowTo",
        "name": `How to use ${c.schemaName}`,
        "step": c.howToSteps.map((text, i) => ({
          "@type": "HowToStep",
          "position": i + 1,
          "text": text,
        })),
      },
    ],
  };
}
