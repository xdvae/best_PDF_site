# OmniPDF Implementation Guide

## Project Overview

OmniPDF is a premium, SEO-optimized PDF tools platform with 9 core features:

1. **Merge PDF** - Combine multiple PDFs with drag-and-drop reordering
2. **Split PDF** - Extract specific pages from PDFs
3. **Compress PDF** - Reduce file size with quality options
4. **PDF to Images** - Convert PDF pages to JPG/PNG
5. **PDF to Text** - Extract text content
6. **PDF to DOCX** - Convert to Word documents
7. **Images to PDF** - Create PDFs from images
8. **AI Summarizer** - Multi-turn AI chat about PDFs
9. **P2P Transfer** - Direct peer-to-peer file transfer using WebRTC

## Technology Stack

- **Frontend**: React 19 + TypeScript + Tailwind CSS 4
- **Backend**: Express 4 + tRPC 11
- **Database**: MySQL/TiDB
- **File Processing**: pdf-lib, pdf-parse, sharp, pdfkit
- **P2P**: WebRTC + Simple Peer
- **AI**: Claude API (Anthropic)
- **Storage**: S3 (Manus built-in)

## Installation & Setup

### Prerequisites

- Node.js 22+
- pnpm 10+
- MySQL/TiDB database
- Anthropic API key (for AI features)

### Development Setup

```bash
# Install dependencies
pnpm install

# Generate database migrations
pnpm drizzle-kit generate

# Apply migrations
pnpm drizzle-kit migrate

# Start development server
pnpm dev
```

The dev server will start at `http://localhost:3000`

## Project Structure

```
omipdf-v2/
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx                 # Landing page
│   │   │   ├── tools/
│   │   │   │   ├── MergePDF.tsx
│   │   │   │   ├── SplitPDF.tsx
│   │   │   │   ├── CompressPDF.tsx
│   │   │   │   ├── PDFToImages.tsx
│   │   │   │   ├── PDFToText.tsx
│   │   │   │   ├── PDFToDocx.tsx
│   │   │   │   ├── ImagesToPDF.tsx
│   │   │   │   ├── PDFSummarizer.tsx
│   │   │   │   └── P2PTransfer.tsx
│   │   ├── components/
│   │   ├── lib/
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── public/
│       ├── sitemap.xml
│       └── robots.txt
├── server/
│   ├── routers/
│   │   ├── pdfTools.ts                 # PDF operations
│   │   └── aiChat.ts                   # AI chat & summarization
│   ├── db.ts                           # Database queries
│   └── _core/                          # Framework core
├── drizzle/
│   ├── schema.ts                       # Database schema
│   └── migrations/
├── shared/
└── ARCHITECTURE.md                     # Architecture details
```

## Feature Implementation Roadmap

### Phase 1: Core Infrastructure ✅
- [x] Database schema (users, pdfConversions, chatHistory)
- [x] tRPC routers structure
- [x] Landing page with SEO optimization
- [x] Sitemap.xml and robots.txt
- [x] All tool page shells

### Phase 2: PDF Tools Backend (In Progress)
- [ ] Merge PDF (pdf-lib)
- [ ] Split PDF (pdf-lib)
- [ ] Compress PDF (ghostscript)
- [ ] PDF to Images (pdf2image)
- [ ] PDF to Text (pdf-parse)
- [ ] PDF to DOCX (conversion library)
- [ ] Images to PDF (pdfkit)

### Phase 3: AI Features (Pending)
- [ ] PDF text extraction
- [ ] LLM integration for summarization
- [ ] Multi-turn chat interface
- [ ] Chat history persistence

### Phase 4: P2P Transfer (Pending)
- [ ] WebRTC signaling server
- [ ] Transfer code generation
- [ ] File transfer implementation
- [ ] Progress tracking UI

### Phase 5: Polish & Deployment (Pending)
- [ ] Responsive design refinements
- [ ] Mobile optimization
- [ ] Performance testing
- [ ] SEO validation
- [ ] Deployment setup

## Key Implementation Details

### PDF Processing

#### Merge PDF
```typescript
// Use pdf-lib for client-side merging
import { PDFDocument } from 'pdf-lib';

const mergedPdf = await PDFDocument.create();
for (const pdfBuffer of pdfBuffers) {
  const pdf = await PDFDocument.load(pdfBuffer);
  const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
  pages.forEach(page => mergedPdf.addPage(page));
}
```

#### Compress PDF
```typescript
// Use ghostscript for server-side compression
// Command: gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook -o output.pdf input.pdf
```

#### PDF to Images
```typescript
// Use pdf2image or sharp for conversion
import { convert } from 'pdf2pic';
const images = await convert({ filePath: 'input.pdf', format: 'jpg' });
```

### AI Chat Implementation

```typescript
// Use Anthropic Claude API for summarization
const response = await invokeLLM({
  messages: [
    { role: "system", content: "You are a PDF assistant..." },
    { role: "user", content: "Summarize this PDF: " + pdfContent }
  ]
});
```

### P2P File Transfer

```typescript
// Use Simple Peer for WebRTC
import SimplePeer from 'simple-peer';

const peer = new SimplePeer({ initiator: true });
peer.on('signal', data => {
  // Send signal data to other peer via signaling server
});

peer.on('data', data => {
  // Receive file data
});
```

## SEO Optimization

### On-Page SEO
- ✅ Unique meta titles and descriptions per page
- ✅ H1 tags with primary keywords
- ✅ JSON-LD structured data
- ✅ Sitemap.xml with all pages
- ✅ robots.txt for crawler guidance

### Technical SEO
- ✅ Fast page load times (Vite optimization)
- ✅ Mobile responsive design
- ✅ Canonical tags (auto-handled by framework)
- ✅ Internal linking between tools
- ✅ Image optimization

### Content SEO
- ✅ Unique how-to guides per tool page
- ✅ FAQ section on landing page
- ✅ Trust signals and privacy messaging
- ✅ Long-form content on tool pages

## Responsive Design

The entire site is built with mobile-first responsive design:

- **Mobile** (< 640px): Single column, touch-optimized
- **Tablet** (640px - 1024px): Two column layout
- **Desktop** (> 1024px): Full multi-column layout

Key responsive components:
- Navigation: Hamburger menu on mobile, full nav on desktop
- Tool cards: 1 column mobile, 2 columns tablet, 4 columns desktop
- Forms: Full width on mobile, constrained on desktop
- Images: Responsive sizing with max-width constraints

## Environment Variables

Required environment variables:

```
DATABASE_URL=mysql://user:password@host/database
JWT_SECRET=your-secret-key
VITE_APP_ID=your-manus-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
BUILT_IN_FORGE_API_URL=https://forge.manus.im
BUILT_IN_FORGE_API_KEY=your-api-key
ANTHROPIC_API_KEY=your-claude-api-key
```

## Testing

### Unit Tests
```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run specific test file
pnpm test server/routers/pdfTools.test.ts
```

### Manual Testing Checklist
- [ ] All tool pages load correctly
- [ ] File uploads work on all tools
- [ ] Responsive design on mobile/tablet/desktop
- [ ] SEO meta tags present
- [ ] Navigation works across all pages
- [ ] P2P transfer code generation works
- [ ] AI chat responds to user input

## Deployment

### Pre-Deployment Checklist
1. Run all tests: `pnpm test`
2. Build the project: `pnpm build`
3. Check for TypeScript errors: `pnpm check`
4. Verify environment variables are set
5. Test on staging environment
6. Validate SEO meta tags
7. Check mobile responsiveness

### Deployment Commands
```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

### Performance Optimization
- Enable gzip compression
- Set up CDN for static assets
- Configure caching headers
- Use database connection pooling
- Implement rate limiting on API endpoints

## Monitoring & Analytics

### Key Metrics to Track
- Page load times
- Tool usage statistics
- Error rates
- User engagement
- Conversion rates

### Logging
- Server logs: `/var/log/omipdf/`
- Client errors: Browser console + error tracking service
- Database queries: Enable query logging in MySQL

## Support & Maintenance

### Common Issues

**Q: PDF merge not working**
A: Ensure pdf-lib is installed and file format is valid

**Q: P2P transfer fails**
A: Check WebRTC connectivity, firewall rules, and signaling server status

**Q: AI chat not responding**
A: Verify Anthropic API key and rate limits

### Regular Maintenance
- Update dependencies monthly
- Monitor database performance
- Review error logs weekly
- Backup database daily
- Test disaster recovery monthly

## Future Enhancements

- [ ] Desktop app (Electron)
- [ ] Mobile app (React Native)
- [ ] Batch processing
- [ ] Advanced OCR
- [ ] Document signing
- [ ] Collaboration features
- [ ] API access for developers
- [ ] White-label solution

## Resources

- [pdf-lib Documentation](https://pdf-lib.js.org/)
- [tRPC Documentation](https://trpc.io/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [WebRTC Documentation](https://webrtc.org/)
- [Anthropic Claude API](https://docs.anthropic.com/)

## Support

For issues or questions, please refer to:
- Project README
- Architecture documentation
- Code comments
- GitHub issues
