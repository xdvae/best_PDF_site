import { useEffect } from "react";

export default function Privacy() {
  useEffect(() => {
    document.title = "Privacy Policy | OmniPDF";
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <nav className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" className="text-xl font-bold text-blue-600">OmniPDF</a>
          <a href="/" className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white">← All Tools</a>
        </div>
      </nav>
      <main className="max-w-3xl mx-auto px-4 py-12 prose dark:prose-invert">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Privacy Policy</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">Last updated: May 2026</p>

        <div className="space-y-8 text-slate-700 dark:text-slate-300">
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Your Files Stay Private</h2>
            <p>OmniPDF processes your files on our servers only for the duration of your conversion. Files are permanently deleted from our servers immediately after processing — we do not store, read, index, or share your documents.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">P2P File Transfer</h2>
            <p>When using the P2P transfer tool, file data streams directly between browsers via an encrypted WebSocket relay. OmniPDF only coordinates the connection — your file data is never written to our servers at any point.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Analytics</h2>
            <p>We use Google Analytics to understand how people use OmniPDF — which tools are most used, traffic volumes, and general usage patterns. No personally identifiable information is collected. You can opt out via your browser's privacy settings or a Google Analytics opt-out extension.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Advertising</h2>
            <p>OmniPDF displays ads from Google AdSense to fund the service and keep it free. Google may use cookies to serve personalised ads based on your browsing history. You can manage your ad personalisation settings at <a href="https://adssettings.google.com" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">adssettings.google.com</a>.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Cookies</h2>
            <p>We use cookies only for analytics and advertising purposes (Google Analytics and AdSense). We do not use cookies to track you across other websites beyond what these services provide.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Contact</h2>
            <p>Questions? Email us at <a href="mailto:hello@omnipdf.xyz" className="text-blue-600 hover:underline">hello@omnipdf.xyz</a></p>
          </section>
        </div>
      </main>
    </div>
  );
}
