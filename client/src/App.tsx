import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import MergePDF from "./pages/tools/MergePDF";
import SplitPDF from "./pages/tools/SplitPDF";
import CompressPDF from "./pages/tools/CompressPDF";
import PDFToImages from "./pages/tools/PDFToImages";
import PDFToText from "./pages/tools/PDFToText";
import PDFToDocx from "./pages/tools/PDFToDocx";
import ImagesToPDF from "./pages/tools/ImagesToPDF";
import PDFSummarizer from "./pages/tools/PDFSummarizer";
import P2PTransfer from "./pages/tools/P2PTransfer";
import PDFEditor from "./pages/tools/PDFEditor";
import WordToPDF from "./pages/tools/WordToPDF";
import PPTToPDF from "./pages/tools/PPTToPDF";
import ZipExtractor from "./pages/tools/ZipExtractor";
import { useEffect } from "react";

/**
 * ScrollToTop Component
 * Scrolls to top of page whenever route changes
 */
function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    // Scroll to top smoothly
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [location]);

  return null;
}

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/privacy"} component={Privacy} />
      <Route path={"/terms"} component={Terms} />
      <Route path={"/merge-pdf"} component={MergePDF} />
      <Route path={"/split-pdf"} component={SplitPDF} />
      <Route path={"/compress-pdf"} component={CompressPDF} />
      <Route path={"/pdf-to-images"} component={PDFToImages} />
      <Route path={"/pdf-to-text"} component={PDFToText} />
      <Route path={"/pdf-to-docx"} component={PDFToDocx} />
      <Route path={"/images-to-pdf"} component={ImagesToPDF} />
      <Route path={"/pdf-summarizer"} component={PDFSummarizer} />
      <Route path={"/pdf-editor"} component={PDFEditor} />
      <Route path={"/p2p-transfer"} component={P2PTransfer} />
      <Route path={"/word-to-pdf"} component={WordToPDF} />
      <Route path={"/ppt-to-pdf"} component={PPTToPDF} />
      <Route path={"/zip-extractor"} component={ZipExtractor} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <TooltipProvider>
          <Toaster />
          <ScrollToTop />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
