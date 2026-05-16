import { useEffect } from "react";

export default function Terms() {
  useEffect(() => {
    document.title = "Terms of Service | OmniPDF";
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <nav className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" className="text-xl font-bold text-blue-600">OmniPDF</a>
          <a href="/" className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white">← All Tools</a>
        </div>
      </nav>
      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Terms of Service</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">Last updated: May 2026</p>

        <div className="space-y-8 text-slate-700 dark:text-slate-300">
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Use of the Service</h2>
            <p>OmniPDF provides free online PDF tools. By using OmniPDF, you agree not to use the service for illegal purposes, to upload malicious files, or to attempt to disrupt or overload our infrastructure.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Your Content</h2>
            <p>You retain full ownership of any files you upload to OmniPDF. We do not claim any rights over your content. Files are deleted immediately after processing and are never used for any other purpose.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">No Warranty</h2>
            <p>OmniPDF is provided "as is" without warranty of any kind. We make no guarantees about uptime, conversion accuracy, or fitness for a particular purpose. Always keep backups of important documents.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Limitation of Liability</h2>
            <p>OmniPDF is not liable for any damages arising from use of the service, including but not limited to data loss, file corruption, or business interruption.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Changes</h2>
            <p>We may update these terms at any time. Continued use of OmniPDF after changes constitutes acceptance of the updated terms.</p>
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
